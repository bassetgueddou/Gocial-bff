// Shared types matching the backend API responses

export interface User {
  id: number;
  email: string;
  user_type: 'person' | 'pro' | 'asso';
  first_name: string | null;
  last_name: string | null;
  pseudo: string | null;
  phone: string | null;
  birth_date: string | null;
  gender: string | null;
  company_name: string | null;
  siret: string | null;
  description: string | null;
  website: string | null;
  city: string | null;
  address: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  snapchat: string | null;
  is_verified: boolean;
  is_active: boolean;
  is_premium: boolean;
  premium_type: string | null;
  is_ghost_mode: boolean;
  girls_only_mode: boolean;
  dark_mode: boolean;
  language: string;
  age: number | null;
  created_at: string;
  last_seen: string | null;
}

export interface UserPublic {
  id: number;
  pseudo: string | null;
  first_name: string | null;
  avatar_url: string | null;
  city: string | null;
  is_verified: boolean;
  user_type: 'person' | 'pro' | 'asso';
}

export interface ActivityHost {
  id: number;
  pseudo: string | null;
  first_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  user_type: string;
}

export interface Activity {
  id: number;
  title: string;
  description: string | null;
  activity_type: 'real' | 'visio';
  category: string | null;
  subcategory: string | null;
  date: string;
  end_date: string | null;
  city: string | null;
  address: string | null;
  meeting_point: string | null;
  latitude: number | null;
  longitude: number | null;
  min_participants: number;
  max_participants: number;
  current_participants: number;
  spots_left: number;
  min_age: number;
  max_age: number;
  gender_restriction: string;
  validation_type: string;
  visibility: string;
  image_url: string | null;
  likes_count: number;
  status: string;
  is_full: boolean;
  is_past: boolean;
  created_at: string;
  host?: ActivityHost;
  visio_url?: string;
  visio_platform?: string;
  distance_km?: number;
  viewer_info?: {
    is_host: boolean;
  };
  my_participation?: {
    status: string;
    requested_at: string;
  };
  participants?: Array<{
    user: User;
    joined_at: string | null;
  }>;
}

export interface Participation {
  id: number;
  user_id: number;
  activity_id: number;
  status: 'pending' | 'validated' | 'rejected' | 'cancelled';
  request_message: string | null;
  created_at: string;
  user?: UserPublic;
  activity?: Activity;
}

export interface Friendship {
  id: number;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  created_at: string;
  friend?: UserPublic;
}

export interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  content: string;
  message_type: string;
  is_request: boolean;
  is_read: boolean;
  created_at: string;
  is_mine: boolean | null;
  sender?: UserPublic;
}

export interface Conversation {
  partner: User;
  last_message: {
    id: number;
    content: string;
    sent_by_me: boolean;
    sent_at: string;
    is_read: boolean;
    is_request: boolean;
  };
  unread_count: number;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
  actor?: {
    id: number;
    pseudo: string;
    avatar_url: string | null;
  };
}

// API response wrappers
export interface PaginatedResponse<T> {
  total: number;
  pages: number;
  current_page: number;
  has_next?: boolean;
  has_prev?: boolean;
}

export interface AuthResponse {
  message: string;
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface RegisterData {
  email: string;
  password: string;
  user_type: 'person' | 'pro' | 'asso';
  first_name?: string;
  last_name?: string;
  pseudo?: string;
  phone?: string;
  gender?: string;
  city?: string;
  company_name?: string;
  siret?: string;
  birth_date?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface CreateActivityData {
  title: string;
  activity_type: 'real' | 'visio';
  date: string;
  description?: string;
  category?: string;
  max_participants?: number;
  price?: number;
  visibility?: 'public' | 'friends' | 'private';
  is_girls_only?: boolean;
  require_approval?: boolean;
  address?: string;
  city?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  visio_link?: string;
}
