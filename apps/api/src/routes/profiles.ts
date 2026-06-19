import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

export const profilesRouter = Router();

// Helper to format string skills/expertise fields into array DTO representation
export function formatProfile(profile: any) {
  if (!profile) return null;
  return {
    ...profile,
    skills: typeof profile.skills === 'string' ? (profile.skills ? profile.skills.split(',').map((s: string) => s.trim()) : []) : (profile.skills || []),
    expertise: typeof profile.expertise === 'string' ? (profile.expertise ? profile.expertise.split(',').map((s: string) => s.trim()) : []) : (profile.expertise || []),
  };
}

// GET /api/profiles (public, filterable, paginated)
profilesRouter.get('/', async (req, res) => {
  try {
    const { batch, department, skills, q, page = '1', limit = '12' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filters
    const where: any = {
      user: {
        isBanned: false,
        isActive: true,
      },
    };

    if (batch) {
      where.batch = batch as string;
    }

    if (department) {
      where.department = department as string;
    }

    if (skills) {
      const skillsArray = (skills as string).split(',');
      where.OR = skillsArray.map((skill: string) => ({
        skills: {
          contains: skill.trim(),
        },
      }));
    }

    if (q) {
      where.fullName = {
        contains: q as string,
      };
    }

    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { totalScore: 'desc' },
      }),
      prisma.profile.count({ where }),
    ]);

    const formattedProfiles = profiles.map(formatProfile);

    return res.status(200).json({
      profiles: formattedProfiles,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/profiles/:id (public)
profilesRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await prisma.profile.findFirst({
      where: {
        OR: [{ id }, { userId: id }],
      },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            role: true,
            createdAt: true,
            achievements: {
              where: { status: 'APPROVED' },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    return res.status(200).json(formatProfile(profile));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/profiles/me (authenticated)
profilesRouter.patch('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const updateData = req.body;

    // Filter out restricted fields
    const allowedFields = [
      'fullName',
      'studentId',
      'batch',
      'department',
      'bio',
      'avatarUrl',
      'resumeUrl',
      'portfolioUrl',
      'bannerUrl',
      'skills',
      'facebook',
      'linkedin',
      'github',
      'twitter',
      'website',
      'hackTheBox',
      'tryHackMe',
      'hackerOne',
      'bugcrowd',
      'ctfTime',
      'htbRank',
      'htbPoints',
      'thmRank',
      'thmPoints',
      'ctfScore',
      'isAlumni',
      'graduationBatch',
      'currentCompany',
      'currentPosition',
      'successStory',
      'designation',
      'expertise',
    ];

    const cleanUpdate: any = {};
    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        cleanUpdate[key] = updateData[key];
      }
    }

    // Convert arrays back to comma-separated strings for SQLite db storage
    if (cleanUpdate.skills !== undefined) {
      cleanUpdate.skills = Array.isArray(cleanUpdate.skills) ? cleanUpdate.skills.join(',') : cleanUpdate.skills;
    }
    if (cleanUpdate.expertise !== undefined) {
      cleanUpdate.expertise = Array.isArray(cleanUpdate.expertise) ? cleanUpdate.expertise.join(',') : cleanUpdate.expertise;
    }

    // Dynamic points calculation for profile completeness (+10 if profile has core fields)
    let scoreBoost = 0;
    const existingProfile = await prisma.profile.findUnique({ where: { userId } });
    if (existingProfile && existingProfile.totalScore === 0) {
      const isComplete =
        cleanUpdate.fullName &&
        cleanUpdate.studentId &&
        cleanUpdate.batch &&
        cleanUpdate.skills &&
        cleanUpdate.skills.length > 0;
      if (isComplete) {
        scoreBoost = 10;
      }
    }

    // Calculate total score based on platforms points + achievements
    const htbPoints = cleanUpdate.htbPoints ?? existingProfile?.htbPoints ?? 0;
    const thmPoints = cleanUpdate.thmPoints ?? existingProfile?.thmPoints ?? 0;
    const ctfScore = cleanUpdate.ctfScore ?? existingProfile?.ctfScore ?? 0;

    // Let's sum achievements
    const achievements = await prisma.achievement.findMany({
      where: { userId, status: 'APPROVED' },
    });
    const achievementsPoints = achievements.reduce((acc, ach) => acc + (ach.points || 0), 0);

    const baseScore = htbPoints + thmPoints + ctfScore + achievementsPoints + scoreBoost;
    cleanUpdate.totalScore = baseScore;

    const profile = await prisma.profile.update({
      where: { userId },
      data: cleanUpdate,
    });

    return res.status(200).json(formatProfile(profile));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/profiles/me/avatar (authenticated)
profilesRouter.post('/me/avatar', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { avatarUrl } = req.body;
    if (!avatarUrl) {
      return res.status(400).json({ error: 'Avatar URL is required' });
    }

    const profile = await prisma.profile.update({
      where: { userId },
      data: { avatarUrl },
    });

    return res.status(200).json(formatProfile(profile));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/profiles/me/resume (authenticated)
profilesRouter.post('/me/resume', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { resumeUrl } = req.body;
    if (!resumeUrl) {
      return res.status(400).json({ error: 'Resume URL is required' });
    }

    const profile = await prisma.profile.update({
      where: { userId },
      data: { resumeUrl },
    });

    return res.status(200).json(formatProfile(profile));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});
