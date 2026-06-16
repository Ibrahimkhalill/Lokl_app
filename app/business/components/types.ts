export interface CoachScheduleSlot {
  id: number;
  day_of_week: string;
  time: string;
  description: string;
  venue_name?: string | null;
}

export interface CoachOffering {
  id: number;
  name: string;
  description: string;
  price?: number | null;
}

export interface CoachContactInfo {
  social_platform?: string;
  social_handle?: string;
  show_social?: boolean;
  email?: string;
  phone?: string;
  show_email?: boolean;
  show_phone?: boolean;
}

export interface TrainingLocation {
  id: number;
  venue?: number;
  venue_name: string;
  venue_address?: string;
  note?: string;
}

export interface FeaturedReview {
  id: number;
  reviewer_name: string;
  review_comment?: string;
  review_rating?: number;
  review_date?: string;
}

export interface ClassClip {
  id: number;
  image_url?: string | null;
  video_url?: string | null;
  caption?: string;
  created_at?: string;
}

export interface BusinessProfile {
  id?: number;
  user_id?: number;
  business_name: string;
  business_type: string;
  owner_name: string;
  address: string;
  website: string;
  bio?: string;
  profile_photo_url?: string | null;
  cover_photo_url?: string | null;
  social_media: { platform: string; link: string }[];
  phone_number?: string;
  rating?: number;
  average_rating?: number;
  review_count?: number;
  clients_count?: number | null;
  schedule_slots?: CoachScheduleSlot[];
  offerings?: CoachOffering[];
  contact_info?: CoachContactInfo | null;
  training_locations?: TrainingLocation[];
  featured_reviews?: FeaturedReview[];
}

export interface EventItem {
  id: number;
  title: string;
  event_type: string;
  date: string;
  time: string;
  venue: string;
  capacity: number;
  registered: number;
  status: string;
  price: string | number;
  description?: string;
  cover_image_url?: string | null;
  average_rating?: number;
  review_count?: number;
}
