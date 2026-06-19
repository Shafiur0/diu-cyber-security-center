import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

export const noticesRouter = Router();

// GET /api/notices (public)
noticesRouter.get('/', async (req, res) => {
  try {
    const { category, isPinned } = req.query;

    const where: any = { isPublished: true };

    if (category) {
      where.category = category as any;
    }
    if (isPinned) {
      where.isPinned = isPinned === 'true';
    }

    const notices = await prisma.notice.findMany({
      where,
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return res.status(200).json(notices);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/notices/:slug (public)
noticesRouter.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const notice = await prisma.notice.findUnique({
      where: { slug },
    });

    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    // Increment view count
    const updatedNotice = await prisma.notice.update({
      where: { slug },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return res.status(200).json(updatedNotice);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/notices (admin)
noticesRouter.post('/', authMiddleware, requirePermission('publish_notices'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authorId = req.user!.id;
    const {
      title,
      slug,
      content,
      category,
      isPublished,
      isPinned,
      isUrgent,
      expiresAt,
      attachmentUrl,
    } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({ error: 'Title, slug, and content are required' });
    }

    // Check slug collision
    const existing = await prisma.notice.findUnique({ where: { slug } });
    if (existing) {
      return res.status(400).json({ error: 'Notice slug already exists' });
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        slug,
        content,
        category: category || 'GENERAL',
        isPublished: isPublished || false,
        isPinned: isPinned || false,
        isUrgent: isUrgent || false,
        publishedAt: isPublished ? new Date() : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        attachmentUrl,
        authorId,
      },
    });

    // Notify all users about new notice if published
    if (notice.isPublished) {
      const users = await prisma.user.findMany({ where: { isActive: true } });
      await Promise.all(
        users.map((u) =>
          prisma.notification.create({
            data: {
              userId: u.id,
              title: isUrgent ? 'URGENT NOTICE 🚨' : 'New Notice Posted',
              body: title,
              type: 'notice',
              actionUrl: `/notices/${slug}`,
            },
          })
        )
      );
    }

    return res.status(201).json(notice);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/notices/:id (admin)
noticesRouter.patch('/:id', authMiddleware, requirePermission('publish_notices'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const notice = await prisma.notice.findUnique({ where: { id } });
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    const cleanUpdate = { ...updateData };
    if (updateData.isPublished && !notice.isPublished) {
      cleanUpdate.publishedAt = new Date();
    }
    if (updateData.expiresAt) {
      cleanUpdate.expiresAt = new Date(updateData.expiresAt);
    }

    const updatedNotice = await prisma.notice.update({
      where: { id },
      data: cleanUpdate,
    });

    return res.status(200).json(updatedNotice);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/notices/:id (admin)
noticesRouter.delete('/:id', authMiddleware, requirePermission('publish_notices'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const notice = await prisma.notice.findUnique({ where: { id } });
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    await prisma.notice.delete({ where: { id } });
    return res.status(200).json({ message: 'Notice deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});
