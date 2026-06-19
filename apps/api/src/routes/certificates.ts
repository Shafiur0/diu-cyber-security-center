import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

export const certificatesRouter = Router();

// GET /api/certificates/mine
certificatesRouter.get('/mine', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const certificates = await prisma.certificate.findMany({
      where: { userId },
      include: {
        event: {
          select: { title: true, type: true },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });
    return res.status(200).json(certificates);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/certificates/verify/:code (public verification)
certificatesRouter.get('/verify/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const cert = await prisma.certificate.findUnique({
      where: { verificationCode: code },
      include: {
        user: {
          select: {
            email: true,
            profile: {
              select: { fullName: true, studentId: true },
            },
          },
        },
        event: {
          select: { title: true, type: true, startDate: true },
        },
      },
    });

    if (!cert) {
      return res.status(404).json({ error: 'Certificate verification code not found' });
    }

    return res.status(200).json({
      valid: true,
      certificate: cert,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/certificates/generate/:eventId (admin/teacher)
certificatesRouter.post('/generate/:eventId', authMiddleware, requirePermission('review_submissions'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    const { type = 'participation', title } = req.body;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrations: {
          where: { attended: true },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const attendees = event.registrations;
    if (attendees.length === 0) {
      return res.status(400).json({ error: 'No attended registrations found for this event' });
    }

    const certTitle = title || `Certificate of ${type.charAt(0).toUpperCase() + type.slice(1)} for ${event.title}`;

    const createdCertificates = await Promise.all(
      attendees.map(async (reg) => {
        // Check if certificate already exists
        const existing = await prisma.certificate.findFirst({
          where: { userId: reg.userId, eventId },
        });

        if (existing) return existing;

        const verificationCode = 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase();

        const cert = await prisma.certificate.create({
          data: {
            userId: reg.userId,
            eventId,
            type,
            title: certTitle,
            verificationCode,
            certificateUrl: `${process.env.API_URL || 'http://localhost:5000'}/verify/${verificationCode}`,
          },
        });

        // Notify user
        await prisma.notification.create({
          data: {
            userId: reg.userId,
            title: 'Certificate Issued! 📜',
            body: `You have received a certificate for attending "${event.title}".`,
            type: 'system',
            actionUrl: `/student/dashboard`,
          },
        });

        return cert;
      })
    );

    return res.status(201).json({
      message: `Successfully generated ${createdCertificates.length} certificates.`,
      certificates: createdCertificates,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});
