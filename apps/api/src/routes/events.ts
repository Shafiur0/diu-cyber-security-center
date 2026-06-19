import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

export const eventsRouter = Router();

// Helper to format string tags field into array DTO representation
export function formatEvent(event: any) {
  if (!event) return null;
  return {
    ...event,
    tags: typeof event.tags === 'string' ? (event.tags ? event.tags.split(',').map((t: string) => t.trim()) : []) : (event.tags || []),
  };
}

// GET /api/events (public)
eventsRouter.get('/', async (req, res) => {
  try {
    const { isFeatured, isPublished } = req.query;

    const where: any = {};
    if (isFeatured) {
      where.isFeatured = isFeatured === 'true';
    }
    if (isPublished) {
      where.isPublished = isPublished === 'true';
    } else {
      // By default show only published events to the public
      where.isPublished = true;
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    const formattedEvents = events.map(formatEvent);
    return res.status(200).json(formattedEvents);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/events/:slug (public)
eventsRouter.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const event = await prisma.event.findUnique({
      where: { slug },
      include: {
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                profile: {
                  select: {
                    fullName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.status(200).json(formatEvent(event));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/events (admin/teacher)
eventsRouter.post('/', authMiddleware, requirePermission('manage_events'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const creatorId = req.user!.id;
    const {
      title,
      slug,
      description,
      type,
      bannerUrl,
      startDate,
      endDate,
      venue,
      isOnline,
      meetingLink,
      maxParticipants,
      registrationDeadline,
      isPublished,
      isFeatured,
      tags,
    } = req.body;

    if (!title || !slug || !description || !type || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required event fields' });
    }

    // Check slug collision
    const existing = await prisma.event.findUnique({ where: { slug } });
    if (existing) {
      return res.status(400).json({ error: 'Event slug already exists' });
    }

    const event = await prisma.event.create({
      data: {
        title,
        slug,
        description,
        type,
        bannerUrl,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        venue,
        isOnline: isOnline || false,
        meetingLink,
        maxParticipants: maxParticipants ? parseInt(maxParticipants, 10) : null,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        isPublished: isPublished || false,
        isFeatured: isFeatured || false,
        creatorId,
        tags: Array.isArray(tags) ? tags.join(',') : (tags || ''),
      },
    });

    // Notify all users about new event if published
    if (event.isPublished) {
      const users = await prisma.user.findMany({ where: { isActive: true } });
      await Promise.all(
        users.map((u) =>
          prisma.notification.create({
            data: {
              userId: u.id,
              title: 'New Event Announced! 🚀',
              body: `We are hosting a new ${type.toLowerCase()}: "${title}". Don't forget to register!`,
              type: 'event',
              actionUrl: `/events/${slug}`,
            },
          })
        )
      );
    }

    return res.status(201).json(formatEvent(event));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/events/:id (admin/teacher)
eventsRouter.patch('/:id', authMiddleware, requirePermission('manage_events'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const dateFields = ['startDate', 'endDate', 'registrationDeadline'];
    const cleanUpdate: any = {};
    for (const key of Object.keys(updateData)) {
      if (dateFields.includes(key) && updateData[key]) {
        cleanUpdate[key] = new Date(updateData[key]);
      } else {
        cleanUpdate[key] = updateData[key];
      }
    }

    // Convert tags array to string for SQLite db
    if (cleanUpdate.tags !== undefined) {
      cleanUpdate.tags = Array.isArray(cleanUpdate.tags) ? cleanUpdate.tags.join(',') : cleanUpdate.tags;
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: cleanUpdate,
    });

    return res.status(200).json(formatEvent(updatedEvent));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/events/:id/register (student)
eventsRouter.post('/:id/register', authMiddleware, requirePermission('register_event'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const eventId = req.params.id;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrations: true,
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (!event.isPublished) {
      return res.status(400).json({ error: 'Cannot register for an unpublished event' });
    }

    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ error: 'Registration deadline has passed' });
    }

    if (event.maxParticipants && event.registrations.length >= event.maxParticipants) {
      return res.status(400).json({ error: 'Event is fully booked' });
    }

    // Check duplicate
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
    });

    if (existingRegistration) {
      return res.status(400).json({ error: 'You are already registered for this event' });
    }

    // Create registration
    const registration = await prisma.eventRegistration.create({
      data: {
        userId,
        eventId,
      },
    });

    // Add attendance points (+5 point for registration or attendance)
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (profile) {
      await prisma.profile.update({
        where: { userId },
        data: { totalScore: (profile.totalScore || 0) + 5 },
      });
    }

    // Notify user
    await prisma.notification.create({
      data: {
        userId,
        title: 'Event Registration Successful! 🎟️',
        body: `You have successfully registered for "${event.title}".`,
        type: 'event',
        actionUrl: `/events/${event.slug}`,
      },
    });

    return res.status(201).json(registration);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/events/:id/registrations (admin/teacher)
eventsRouter.get('/:id/registrations', authMiddleware, requirePermission('review_submissions'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId: id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                studentId: true,
                batch: true,
              },
            },
          },
        },
      },
    });
    return res.status(200).json(registrations);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});
