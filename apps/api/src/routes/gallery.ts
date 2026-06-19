import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

export const galleryRouter = Router();

// GET /api/gallery
galleryRouter.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const where: any = {};
    if (category) {
      where.category = category as string;
    }

    const items = await prisma.galleryItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(items);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/gallery (admin)
galleryRouter.post('/', authMiddleware, requirePermission('moderate_content'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uploadedById = req.user!.id;
    const { title, description, imageUrl, publicId, category, eventId } = req.body;

    if (!title || !imageUrl || !category) {
      return res.status(400).json({ error: 'Title, imageUrl, and category are required' });
    }

    const item = await prisma.galleryItem.create({
      data: {
        title,
        description,
        imageUrl,
        publicId: publicId || 'direct_url',
        category,
        eventId,
        uploadedById,
      },
    });

    return res.status(201).json(item);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/gallery/:id (admin)
galleryRouter.delete('/:id', authMiddleware, requirePermission('moderate_content'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const item = await prisma.galleryItem.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    await prisma.galleryItem.delete({ where: { id } });
    return res.status(200).json({ message: 'Gallery item deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});
