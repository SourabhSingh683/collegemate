
// Add to existing types.ts or create if needed
export interface InterviewExperience {
  id: string;
  user_id: string;
  company_name: string;
  companyName: string;
  description: string;
  is_on_campus: boolean;
  isOnCampus: boolean;
  is_product_based: boolean;
  isProductBased: boolean;
  is_anonymous: boolean;
  isAnonymous: boolean;
  created_at: string;
  createdAt: string;
  upvotes: number;
  profile?: {
    username: string;
    full_name: string | null;
    year?: string | null;
    branch?: string | null;
    avatar_url?: string | null;
  };
}

export interface OfferDetail {
  id: string;
  user_id: string;
  company_name: string;
  companyName: string;
  description: string;
  details: string;
  is_on_campus: boolean;
  isOnCampus: boolean;
  is_product_based: boolean;
  isProductBased: boolean;
  is_anonymous: boolean;
  isAnonymous: boolean;
  image_url?: string | null;
  imageUrl?: string | null;
  created_at: string;
  createdAt: string;
  upvotes: number;
  profile?: {
    username: string;
    full_name: string | null;
    year?: string | null;
    branch?: string | null;
    avatar_url?: string | null;
  };
}

// Add missing Calendar related types
export type EventCategory = 'hackathon' | 'holiday' | 'workshop' | 'personal' | 'club' | 'contest' | 'notice';

export type EventType = 'Hackathon' | 'Workshop' | 'Club Meetup' | 'Holiday' | 'Contest' | 'Notice' | 'Personal Reminder';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start: string;
  end: string;
  category: EventCategory;
  type: EventType;
  approved: boolean;
  createdBy: string;
  isPrivate: boolean;
}

// Add Profile type
export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url?: string | null;
  year?: string | null;
  branch?: string | null;
  bio?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Add Channel type
export interface Channel {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  icon: string | null;
  is_public: boolean;
  created_at: string;
  created_by: string | null;
  member_count?: number;
}
