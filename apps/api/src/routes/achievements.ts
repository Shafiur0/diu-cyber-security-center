import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { BadgeTier } from '@csc-diu/shared-types';

export const achievementsRouter = Router();

// Helper to determine BadgeTier from points
function calculateBadgeTier(points: number): BadgeTier {
  if (points >= 700) return 'PLATINUM';
  if (points >= 300) return 'GOLD';
  if (points >= 100) return 'SILVER';
  return 'BRONZE';
}

// Helper to update Profile totalScore
async function recalculateUserTotalScore(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) return;

  const approvedAchievements = await prisma.achievement.findMany({
    where: { userId, status: 'APPROVED' },
  });

  const achievementsPoints = approvedAchievements.reduce((acc, ach) => acc + (ach.points || 0), 0);
  const htbPoints = profile.htbPoints || 0;
  const thmPoints = profile.thmPoints || 0;
  const ctfScore = profile.ctfScore || 0;

  // Plus 10 if profile has core fields completed
  let profileCompletionPoints = 0;
  if (profile.fullName && profile.studentId && profile.batch && profile.skills.length > 0) {
    profileCompletionPoints = 10;
  }

  const newTotal = htbPoints + thmPoints + ctfScore + achievementsPoints + profileCompletionPoints;

  await prisma.profile.update({
    where: { userId },
    data: { totalScore: newTotal },
  });
}

// GET /api/achievements (public, APPROVED only)
achievementsRouter.get('/', async (req, res) => {
  try {
    const { type, isFeatured } = req.query;

    const where: any = { status: 'APPROVED' };
    if (type) {
      where.type = type as string;
    }
    if (isFeatured) {
      where.isFeatured = isFeatured === 'true';
    }

    const achievements = await prisma.achievement.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { verifiedAt: 'desc' },
    });

    return res.status(200).json(achievements);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/achievements/mine (authenticated)
achievementsRouter.get('/mine', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const achievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(achievements);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/achievements (student)
achievementsRouter.post('/', authMiddleware, requirePermission('submit_achievement'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      title,
      type,
      platform,
      description,
      proofUrl,
      issuer,
      issueDate,
      expiryDate,
      credentialId,
      credentialUrl,
      points,
    } = req.body;

    if (!title || !type || !description) {
      return res.status(400).json({ error: 'Title, type, and description are required' });
    }

    // Default points by type if not specified
    let assignedPoints = parseInt(points || '0', 10);
    if (!assignedPoints) {
      if (type === 'certification') assignedPoints = 50;
      else if (type === 'ctf') assignedPoints = 30;
      else if (type === 'bug_bounty') assignedPoints = 50;
      else if (type === 'research') assignedPoints = 80;
      else assignedPoints = 20;
    }

    const tier = calculateBadgeTier(assignedPoints);

    const achievement = await prisma.achievement.create({
      data: {
        userId,
        title,
        type,
        platform,
        description,
        proofUrl,
        issuer,
        issueDate: issueDate ? new Date(issueDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        credentialId,
        credentialUrl,
        points: assignedPoints,
        badgeTier: tier,
        status: 'PENDING',
      },
    });

    // Notify Admins & Teachers via Notification table
    const reviewers = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN', 'TEACHER'] },
      },
    });

    const studentProfile = await prisma.profile.findUnique({ where: { userId } });
    const studentName = studentProfile?.fullName || req.user!.email;

    await Promise.all(
      reviewers.map((r) =>
        prisma.notification.create({
          data: {
            userId: r.id,
            title: 'New Achievement Submitted',
            body: `${studentName} submitted "${title}" for verification.`,
            type: 'achievement',
            actionUrl: `/admin/dashboard`, // Or where review takes place
          },
        })
      )
    );

    return res.status(201).json(achievement);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/achievements/:id
achievementsRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const achievement = await prisma.achievement.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }
    return res.status(200).json(achievement);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/achievements/:id/verify (admin/teacher)
achievementsRouter.patch('/:id/verify', authMiddleware, requirePermission('verify_achievements'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, isFeatured } = req.body;
    const verifiedById = req.user!.id;

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be APPROVED or REJECTED' });
    }

    const achievement = await prisma.achievement.findUnique({ where: { id } });
    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    const updatedAchievement = await prisma.achievement.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        verifiedById,
        verifiedAt: new Date(),
        isFeatured: isFeatured !== undefined ? isFeatured : achievement.isFeatured,
      },
    });

    // If approved, recalculate points & user's totalScore
    if (status === 'APPROVED') {
      await recalculateUserTotalScore(achievement.userId);
    }

    // Notify user
    await prisma.notification.create({
      data: {
        userId: achievement.userId,
        title: status === 'APPROVED' ? 'Achievement Verified! 🎉' : 'Achievement Update',
        body:
          status === 'APPROVED'
            ? `Your achievement "${achievement.title}" has been verified by CSC DIU.`
            : `Your achievement "${achievement.title}" was not approved. Reason: ${rejectionReason || 'None provided'}`,
        type: 'achievement',
        actionUrl: `/student/dashboard`,
      },
    });

    return res.status(200).json(updatedAchievement);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/achievements/:id
achievementsRouter.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userRole = req.user!.role;
    const userId = req.user!.id;

    const achievement = await prisma.achievement.findUnique({ where: { id } });
    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    // Only allow if student owns the pending achievement OR if user is admin/superadmin
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(userRole);
    const isOwner = achievement.userId === userId;

    if (!isAdmin && (!isOwner || achievement.status !== 'PENDING')) {
      return res.status(403).json({ error: 'Forbidden: Cannot delete this achievement' });
    }

    await prisma.achievement.delete({ where: { id } });

    if (achievement.status === 'APPROVED') {
      await recalculateUserTotalScore(achievement.userId);
    }

    return res.status(200).json({ message: 'Achievement deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});
