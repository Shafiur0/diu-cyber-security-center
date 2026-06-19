import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

export const configRouter = Router();

// GET /api/config (public)
configRouter.get('/', async (req, res) => {
  try {
    const configs = await prisma.siteConfig.findMany();
    const configMap = configs.reduce((acc: any, c) => {
      try {
        acc[c.key] = JSON.parse(c.value);
      } catch {
        acc[c.key] = c.value;
      }
      return acc;
    }, {});

    return res.status(200).json(configMap);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/config (superadmin)
configRouter.patch('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Only SUPER_ADMIN allowed
    if (req.user!.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Super Admin only' });
    }

    const { key, value } = req.body;
    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    const config = await prisma.siteConfig.upsert({
      where: { key },
      update: { value: stringValue, updatedById: req.user!.id },
      create: { key, value: stringValue, updatedById: req.user!.id },
    });

    return res.status(200).json(config);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});
