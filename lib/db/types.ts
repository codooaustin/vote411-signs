export type Campaign = {
  id: string;
  name: string;
  invite_code: string | null;
  created_at: string;
};

export type CampaignMember = {
  user_id: string;
  campaign_id: string;
  created_at: string;
};

export type Sign = {
  id: string;
  campaign_id: string;
  placed_by_user_id: string;
  latitude: number;
  longitude: number;
  placed_at: string;
  taken_down_at: string | null;
  notes: string | null;
  photo_url: string | null;
  nearest_intersection: string | null;
  zipcode: string | null;
  county: string | null;
  created_at: string;
};

export type SignWithPlacer = Sign & {
  placed_by_email?: string | null;
};

export type SignReport = {
  id: string;
  sign_id: string;
  comment: string;
  created_at: string;
  reported_by_user_id: string | null;
};

export type AdoptASignSubmission = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  latitude: number;
  longitude: number;
  notes: string | null;
  nearest_intersection: string | null;
  zipcode: string | null;
  county: string | null;
  created_at: string;
};

export type SignSuggestion = {
  id: string;
  latitude: number;
  longitude: number;
  notes: string | null;
  nearest_intersection: string | null;
  zipcode: string | null;
  county: string | null;
  created_at: string;
};
