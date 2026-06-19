export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT';

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type BadgeTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export type EventType = 'WORKSHOP' | 'CTF' | 'SEMINAR' | 'TRAINING' | 'WEBINAR' | 'INDUSTRY_VISIT';

export type NoticeCategory = 'GENERAL' | 'ACADEMIC' | 'EVENT' | 'ACHIEVEMENT' | 'URGENT';

export interface UserDTO {
  id: string;
  email: string;
  phone?: string | null;
  role: Role;
  isActive: boolean;
  isBanned: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  profile?: ProfileDTO | null;
}

export interface ProfileDTO {
  id: string;
  userId: string;
  fullName: string;
  studentId?: string | null;
  batch?: string | null;
  department?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  skills: string[];
  github?: string | null;
  linkedin?: string | null;
  tryHackMe?: string | null;
  hackTheBox?: string | null;
  ctfScore: number;
  totalScore: number;
  isAlumni: boolean;
  designation?: string | null;
  expertise: string[];
}

export interface AchievementDTO {
  id: string;
  userId: string;
  title: string;
  type: string;
  platform?: string | null;
  description: string;
  proofUrl?: string | null;
  status: VerificationStatus;
  points: number;
  badgeTier?: BadgeTier | null;
  isFeatured: boolean;
  createdAt: Date | string;
  user?: {
    email: string;
    profile?: {
      fullName: string;
      avatarUrl?: string | null;
    } | null;
  };
}

export interface EventDTO {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: EventType;
  bannerUrl?: string | null;
  startDate: Date | string;
  endDate: Date | string;
  venue?: string | null;
  isOnline: boolean;
  meetingLink?: string | null;
  maxParticipants?: number | null;
  registrationDeadline?: Date | string | null;
  isPublished: boolean;
  isFeatured: boolean;
  creatorId: string;
  tags: string[];
  createdAt: Date | string;
  _count?: {
    registrations: number;
  };
}

export interface NoticeDTO {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: NoticeCategory;
  isPublished: boolean;
  isPinned: boolean;
  isUrgent: boolean;
  publishedAt?: Date | string | null;
  viewCount: number;
  createdAt: Date | string;
}

export interface LeaderboardUserDTO {
  rank: number;
  fullName: string;
  avatarUrl?: string | null;
  studentId?: string | null;
  batch?: string | null;
  department?: string | null;
  htbPoints: number;
  thmPoints: number;
  ctfScore: number;
  totalScore: number;
  badgeTier: BadgeTier;
}

export interface AIRoadmapResponse {
  weeks: Array<{
    week: number;
    topics: string[];
    resources: string[];
    practiceLinks: string[];
  }>;
  estimatedDuration: string;
  milestones: string[];
}

export interface AIResumeAnalysisResponse {
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  matchPercentage: number;
}
