import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

export const adminRouter = Router();

// GET /api/admin/analytics
adminRouter.get('/analytics', authMiddleware, requirePermission('view_analytics'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalMembers = await prisma.user.count({ where: { role: 'STUDENT' } });
    const pendingAchievements = await prisma.achievement.count({ where: { status: 'PENDING' } });
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const eventsThisMonth = await prisma.event.count({
      where: {
        startDate: { gte: oneMonthAgo },
      },
    });

    const activeToday = await prisma.user.count({
      where: {
        lastLoginAt: { gte: new Date(new Date().setHours(0,0,0,0)) },
      },
    });

    // Mock chart data for frontend charts rendering
    const membershipGrowth = [
      { month: 'Jan', members: 400 },
      { month: 'Feb', members: 420 },
      { month: 'Mar', members: 450 },
      { month: 'Apr', members: 480 },
      { month: 'May', members: 510 },
      { month: 'Jun', members: totalMembers > 510 ? totalMembers : 547 },
    ];

    const achievementTypes = [
      { name: 'Certifications', value: 40 },
      { name: 'CTFs', value: 30 },
      { name: 'Bug Bounty', value: 15 },
      { name: 'Research', value: 10 },
      { name: 'Competition', value: 5 },
    ];

    const eventRegistrations = [
      { name: 'Workshop', registrations: 120 },
      { name: 'CTF Speed', registrations: 85 },
      { name: 'Seminar', registrations: 200 },
      { name: 'Industry Visit', registrations: 45 },
    ];

    const userActivity = [
      { day: 'Mon', count: 45 },
      { day: 'Tue', count: 52 },
      { day: 'Wed', count: 49 },
      { day: 'Thu', count: 63 },
      { day: 'Fri', count: 70 },
      { day: 'Sat', count: 32 },
      { day: 'Sun', count: 28 },
    ];

    return res.status(200).json({
      counters: {
        totalMembers,
        pendingAchievements,
        eventsThisMonth,
        activeToday,
      },
      charts: {
        membershipGrowth,
        achievementTypes,
        eventRegistrations,
        userActivity,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/audit-logs
adminRouter.get('/audit-logs', authMiddleware, requirePermission('view_analytics'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        actor: {
          select: {
            email: true,
            profile: {
              select: { fullName: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return res.status(200).json(logs);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/reports/export (returns CSV format)
adminRouter.get('/reports/export', authMiddleware, requirePermission('view_analytics'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
    });

    let csvContent = 'ID,Email,Full Name,Student ID,Batch,Department,CTF Score,Total Score,Role,Active,Banned,Created At\n';
    for (const u of users) {
      const p = u.profile;
      csvContent += `"${u.id}","${u.email}","${p?.fullName || ''}","${p?.studentId || ''}","${p?.batch || ''}","${p?.department || ''}",${p?.ctfScore || 0},${p?.totalScore || 0},"${u.role}",${u.isActive},${u.isBanned},"${u.createdAt.toISOString()}"\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=csc_members_report.csv');
    return res.status(200).send(csvContent);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});
