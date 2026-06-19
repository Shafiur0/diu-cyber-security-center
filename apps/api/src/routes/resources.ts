import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

export const resourcesRouter = Router();

// Helper to format string tags field into array DTO representation
export function formatResource(resource: any) {
  if (!resource) return null;
  return {
    ...resource,
    tags: typeof resource.tags === 'string' ? (resource.tags ? resource.tags.split(',').map((t: string) => t.trim()) : []) : (resource.tags || []),
  };
}

// GET /api/resources (public)
resourcesRouter.get('/', async (req, res) => {
  try {
    const { type, isFeatured } = req.query;

    const where: any = { isPublished: true };
    if (type) {
      where.type = type as string;
    }
    if (isFeatured) {
      where.isFeatured = isFeatured === 'true';
    }

    const resources = await prisma.resource.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const formattedResources = resources.map(formatResource);
    return res.status(200).json(formattedResources);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/resources (admin/teacher)
resourcesRouter.post('/', authMiddleware, requirePermission('publish_resources'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authorId = req.user!.id;
    const { title, description, type, url, thumbnailUrl, tags, isPublished, isFeatured } = req.body;

    if (!title || !description || !type || !url) {
      return res.status(400).json({ error: 'Title, description, type, and url are required' });
    }

    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        type,
        url,
        thumbnailUrl,
        tags: Array.isArray(tags) ? tags.join(',') : (tags || ''),
        isPublished: isPublished || false,
        isFeatured: isFeatured || false,
        authorId,
      },
    });

    return res.status(201).json(formatResource(resource));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/resources/:id (admin/teacher)
resourcesRouter.patch('/:id', authMiddleware, requirePermission('publish_resources'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Convert tags to string if present
    if (updateData.tags !== undefined) {
      updateData.tags = Array.isArray(updateData.tags) ? updateData.tags.join(',') : updateData.tags;
    }

    const updatedResource = await prisma.resource.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json(formatResource(updatedResource));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/resources/:id (admin/teacher)
resourcesRouter.delete('/:id', authMiddleware, requirePermission('publish_resources'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    await prisma.resource.delete({ where: { id } });
    return res.status(200).json({ message: 'Resource deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});
