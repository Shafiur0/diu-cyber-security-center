import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { BadgeTier } from '@csc-diu/shared-types';

export const leaderboardRouter = Router();

leaderboardRouter.get('/', async (req, res) => {
  try {
    const { period = 'all' } = req.query;

    const profiles = await prisma.profile.findMany({
      where: {
        user: {
          role: 'STUDENT',
          isBanned: false,
          isActive: true,
        },
      },
      include: {
        user: {
          select: {
            achievements: {
              where: {
                status: 'APPROVED',
              },
            },
          },
        },
      },
    });

    const mappedUsers = profiles.map((p) => {
      let achievementsScore = 0;
      const achievements = p.user?.achievements || [];

      if (period === 'month') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        achievementsScore = achievements
          .filter((a) => a.verifiedAt && new Date(a.verifiedAt) >= oneMonthAgo)
          .reduce((sum, a) => sum + (a.points || 0), 0);
      } else if (period === 'semester') {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        achievementsScore = achievements
          .filter((a) => a.verifiedAt && new Date(a.verifiedAt) >= sixMonthsAgo)
          .reduce((sum, a) => sum + (a.points || 0), 0);
      } else {
        achievementsScore = achievements.reduce((sum, a) => sum + (a.points || 0), 0);
      }

      // Base platform scores
      const htbPoints = p.htbPoints || 0;
      const thmPoints = p.thmPoints || 0;
      const ctfScore = p.ctfScore || 0;

      // Add profile completion points (+10) if core fields set
      let profileCompletionPoints = 0;
      if (p.fullName && p.studentId && p.batch && p.skills.length > 0) {
        profileCompletionPoints = 10;
      }

      const totalScore = htbPoints + thmPoints + ctfScore + achievementsScore + profileCompletionPoints;

      let badgeTier: BadgeTier = 'BRONZE';
      if (totalScore >= 700) badgeTier = 'PLATINUM';
      else if (totalScore >= 300) badgeTier = 'GOLD';
      else if (totalScore >= 100) badgeTier = 'SILVER';

      return {
        fullName: p.fullName,
        avatarUrl: p.avatarUrl,
        studentId: p.studentId,
        batch: p.batch,
        department: p.department,
        htbPoints,
        thmPoints,
        ctfScore,
        totalScore,
        badgeTier,
      };
    });

    mappedUsers.sort((a, b) => b.totalScore - a.totalScore);

    const rankedUsers = mappedUsers.map((user, idx) => ({
      rank: idx + 1,
      ...user,
    }));

    return res.status(200).json(rankedUsers);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});
