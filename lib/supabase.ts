import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export type Profile = {
  id: string;
  email: string;
  role: "admin" | "staff";
  created_at: string;
};

export type Test = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  category: string | null;
  is_active: boolean;
  created_at: string;
};

export type CartItemRecord = {
  id: string;
  name: string;
  price: number | null;
  category?: string | null;
};

export type Booking = {
  id: string;
  patient_name: string;
  phone: string;
  email: string | null;
  test_id: string | null;
  test_name: string;
  collection_type: "home" | "walkin";
  preferred_date: string | null;
  status: "pending" | "report_sent" | "completed";
  notes: string | null;
  created_at: string;
  // V2 fields (optional for backward compat)
  address?: string | null;
  time_slot?: string | null;
  payment_method?: string | null;
  booking_ref?: string | null;
  cart_items?: CartItemRecord[] | null;
};

export type Report = {
  id: string;
  booking_id: string;
  file_path: string;
  file_url: string;
  expires_at: string;
  created_at: string;
};

export type GalleryPhoto = {
  id: string;
  image_url: string;
  file_path: string;
  caption: string | null;
  created_at: string;
};

export type Bio = {
  id: number;
  name: string;
  title: string;
  qualification: string;
  experience: string;
  specialization: string;
  about: string;
  photo_url: string | null;
  photo_path: string | null;
  show_title: boolean;
  show_qualification: boolean;
  show_experience: boolean;
  show_specialization: boolean;
  show_about: boolean;
};

export type Review = {
  id: string;
  name: string;
  location: string;
  text: string;
  rating: number;
  test_name: string | null;
  created_at: string;
};
