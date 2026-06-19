import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { Role } from '@csc-diu/shared-types';

export const PERMISSIONS: Record<Role, string[]> = {
  SUPER_ADMIN: ['*'],
  ADMIN: [
    'review_submissions',
    'verify_achievements',
    'publish_notices',
    'manage_members',
    'approve_social_links',
    'moderate_content',
    'manage_events',
    'view_analytics',
  ],
  TEACHER: [
    'create_activities',
    'publish_workshops',
    'manage_training',
    'view_student_profiles',
    'verify_achievements',
    'publish_resources',
  ],
  STUDENT: [
    'edit_own_profile',
    'submit_achievement',
    'register_event',
    'download_certificate',
    'view_public_content',
  ],
};

export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User context missing' });
    }

    const userRole = req.user.role;
    const userPermissions = PERMISSIONS[userRole] || [];

    const hasAccess = userPermissions.includes('*') || userPermissions.includes(permission);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
}
