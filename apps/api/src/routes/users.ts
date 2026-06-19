import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

export const usersRouter = Router();

// GET /api/users (admin)
usersRouter.get('/', authMiddleware, requirePermission('manage_members'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(users);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:id
usersRouter.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/users/:id
usersRouter.patch('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { email, phone, isActive } = req.body;

    // Check ownership or admin
    if (req.user!.id !== id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { email, phone, isActive },
    });

    return res.status(200).json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/users/:id (superadmin)
usersRouter.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user!.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Super Admin only' });
    }

    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/users/:id/role (superadmin)
usersRouter.patch('/:id/role', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user!.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Super Admin only' });
    }

    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
    });

    // Record in Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: req.user!.id,
        action: 'CHANGE_ROLE',
        targetType: 'User',
        targetId: id,
        before: JSON.stringify({ role: 'previous' }),
        after: JSON.stringify({ role }),
        ip: req.ip || 'unknown',
      },
    });

    return res.status(200).json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/users/:id/ban (admin)
usersRouter.post('/:id/ban', authMiddleware, requirePermission('manage_members'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { ban } = req.body; // true or false

    const userToBan = await prisma.user.findUnique({ where: { id } });
    if (!userToBan) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Super Admin cannot be banned
    if (userToBan.role === 'SUPER_ADMIN') {
      return res.status(400).json({ error: 'Cannot ban a Super Admin' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isBanned: ban },
    });

    return res.status(200).json({
      message: ban ? 'User banned successfully' : 'User unbanned successfully',
      user: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});
