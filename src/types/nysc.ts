export type NyscPhase = 'PCM' | 'CAMP' | 'ACTIVE' | 'POP';

export type FeedbackCategory = 'bug' | 'feature_request' | 'general';
export type FeedbackStatus = 'pending' | 'resolved';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  state_code?: string; // e.g. 'LA/26A/4819'
  call_up_no?: string; // e.g. 'NYSC/UAM/2026/049102'
  state_of_deployment: string;
  lga: string;
  batch_stream: string; // e.g. '2026 Batch A Stream 1'
  current_phase: NyscPhase;
  ppa_name: string;
  ppa_address: string;
  cds_group: string;
  swearing_in_date: string; // '2026-03-15'
  pop_date: string; // '2027-02-28'
  is_admin: boolean;
  is_directory_visible: boolean;
  show_phone_in_directory: boolean;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LocationSchedule {
  id: string;
  user_id: string;
  ppa_latitude: number;
  ppa_longitude: number;
  ppa_address_notes: string;
  cds_latitude: number;
  cds_longitude: number;
  cds_address_notes: string;
  cds_meeting_day: string; // e.g. 'Thursday'
  cds_meeting_time: string; // e.g. '09:00'
  cds_frequency: string; // e.g. 'weekly'
  transit_fare_notes: string;
  updated_at?: string;
}

export interface FinancialSource {
  id: string;
  user_id: string;
  federal_alawee: number; // default 77000.00
  state_allowance: number; // default 0.00
  ppa_stipend: number; // default 0.00
  side_hustle: number; // default 0.00
  updated_at?: string;
}

export interface Expense {
  id: string;
  user_id: string;
  title: string;
  category: 'Food' | 'Transport' | 'Rent' | 'Data' | 'CDS Dues' | 'Personal' | 'Other';
  amount: number;
  expense_date: string; // 'YYYY-MM-DD'
  created_at?: string;
}

export interface ClearanceChecklist {
  id: string;
  user_id: string;
  month_year: string; // e.g. '2026-10'
  ppa_letter_signed: boolean;
  lgi_approval: boolean;
  biometrics_completed: boolean;
  payment_received: boolean;
  notes?: string;
  updated_at?: string;
}

export interface CdsLog {
  id: string;
  user_id: string;
  meeting_date: string;
  topic: string;
  dues_paid: number;
  notes: string;
  attendance_status: 'Present' | 'Excused' | 'Absent';
  created_at?: string;
}

export interface DocumentVaultItem {
  id: string;
  user_id: string;
  document_type: 'Call Up Letter' | 'Green Card' | 'PPA Letter' | 'NYSC ID' | 'Camp Discharge Slip' | 'Medical Fitness' | 'Other';
  file_url: string;
  file_name: string;
  file_size?: string;
  uploaded_at: string;
  encryption_status: 'AES-256 Encrypted' | 'Secured';
}

export interface SaedNoteImage {
  id: string;
  note_id: string;
  image_url: string;
  caption: string;
  uploaded_at?: string;
}

export interface SaedNote {
  id: string;
  user_id: string;
  skill_category: 'ICT & Tech' | 'Fashion & Tailoring' | 'Solar Installation' | 'Cosmetology & Hair' | 'Agro-Allied' | 'Food Processing' | 'Leatherworks' | 'Construction' | 'Other';
  title: string;
  content: string;
  images: SaedNoteImage[];
  key_takeaways?: string[];
  created_at: string;
  updated_at?: string;
}

export interface MarketplaceItem {
  id: string;
  seller_id: string;
  seller_name: string;
  title: string;
  description: string;
  price: number;
  item_condition: 'Brand New' | 'Fairly Used';
  category: 'Camp Whites & Uniforms' | 'Mattresses & Bedding' | 'Electronics & Appliances' | 'Kitchen & Cooking' | 'Books & Stationery' | 'Other';
  state: string;
  lga: string;
  seller_phone: string;
  images: string[];
  is_sold: boolean;
  created_at: string;
}

export interface JobListing {
  id: string;
  poster_id: string;
  poster_name: string;
  job_title: string;
  company_name: string;
  location: string;
  job_type: 'PPA' | 'Full-time' | 'Remote' | 'Internship';
  salary_range: string;
  description: string;
  apply_type: 'external_link' | 'phone_call' | 'whatsapp';
  external_apply_url?: string;
  external_source?: 'linkedin' | 'jobberman' | 'company' | 'other';
  contact_phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface PpaWorkLog {
  id: string;
  user_id: string;
  achievement_text: string;
  skill_tags: string[];
  log_date: string;
  created_at?: string;
}

export interface UserFeedback {
  id: string;
  user_id: string;
  user_name: string;
  user_phone: string;
  category: FeedbackCategory;
  message: string;
  status: FeedbackStatus;
  created_at: string;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  contact_name: string;
  role_title: string; // e.g. 'LGI Ikeja', 'Hostel Rep', 'Camp Director', 'Police DPO'
  phone_number: string;
  is_default: boolean;
  state?: string;
  lga?: string;
}

export interface CampChecklistItem {
  id: string;
  category: 'Mandatory Documents' | 'White Gears & Wear' | 'Health & Personal Care' | 'Hostel & Bedding' | 'Provisions & Cash';
  title: string;
  quantity?: string;
  notes?: string;
  is_packed: boolean;
  is_critical: boolean;
}

export interface CorperDirectoryMember {
  id: string;
  full_name: string;
  state_code: string;
  state: string;
  lga: string;
  batch: string;
  ppa: string;
  cds: string;
  phone: string;
  avatar: string;
  phase: NyscPhase;
  skills: string[];
  bio?: string;
  institution?: string;
}

export interface CorperLodge {
  id: string;
  name: string;
  lodge_type: 'NCCF Family House' | 'MCAN Corpers Lodge' | 'NACC Catholic Lodge' | 'LGA Quarters' | 'Community Lodge';
  state: string;
  lga: string;
  address: string;
  cost_description: string; // e.g. 'Free / Voluntary Token' or '₦30,000 / year'
  amenities: string[];
  caretaker_name: string;
  caretaker_phone: string;
  available_spaces: number;
  notes: string;
}

export interface TransitFareRoute {
  id: string;
  state: string;
  lga: string;
  route_name: string;
  from_location: string;
  to_location: string;
  vehicle_type: 'BRT Bus' | 'Danfo Yellow Bus' | 'Keke Marwa' | 'Okada / Bike' | 'Shared Taxi';
  estimated_fare_range: string;
  commute_tips: string;
  last_verified: string;
}

export interface RelocationStep {
  id: string;
  step_number: number;
  title: string;
  category: 'Preparation' | 'Portal Application' | 'Official Endorsement' | 'Final Clearance';
  description: string;
  required_documents: string[];
  pro_tip: string;
}

export interface WebhookConfig {
  enabled: boolean;
  service: 'discord' | 'slack' | 'custom';
  url: string;
  notify_on_bug: boolean;
  notify_on_feature: boolean;
  notify_on_general: boolean;
  last_triggered?: string;
}

export interface WebhookLogItem {
  id: string;
  event: string;
  service: string;
  status: 'delivered' | 'failed';
  status_code: number;
  payload_summary: string;
  timestamp: string;
  latency_ms: number;
}

