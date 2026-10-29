import {
  Profile,
  LocationSchedule,
  FinancialSource,
  Expense,
  ClearanceChecklist,
  CdsLog,
  DocumentVaultItem,
  SaedNote,
  MarketplaceItem,
  JobListing,
  PpaWorkLog,
  EmergencyContact,
  CampChecklistItem,
  CorperDirectoryMember,
  CorperLodge,
  TransitFareRoute,
  RelocationStep,
  UserFeedback,
  WebhookConfig,
  WebhookLogItem
} from '../types/nysc';

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

export const STATE_COORDINATES: Record<string, [number, number]> = {
  'Abia': [5.5249, 7.4943],
  'Adamawa': [9.2003, 12.4953],
  'Akwa Ibom': [5.0377, 7.9128],
  'Anambra': [6.2209, 7.0723],
  'Bauchi': [10.3158, 9.8442],
  'Bayelsa': [4.9267, 6.2676],
  'Benue': [7.7322, 8.5391],
  'Borno': [11.8333, 13.1500],
  'Cross River': [4.9757, 8.3417],
  'Delta': [5.5325, 5.8987],
  'Ebonyi': [6.3249, 8.1137],
  'Edo': [6.3350, 5.6037],
  'Ekiti': [7.6210, 5.2215],
  'Enugu': [6.4584, 7.5464],
  'FCT Abuja': [9.0765, 7.3986],
  'Gombe': [10.2897, 11.1673],
  'Imo': [5.4836, 7.0332],
  'Jigawa': [11.7884, 9.3392],
  'Kaduna': [10.5105, 7.4165],
  'Kano': [12.0022, 8.5920],
  'Katsina': [12.9855, 7.6171],
  'Kebbi': [12.4539, 4.1975],
  'Kogi': [7.8023, 6.7333],
  'Kwara': [8.4799, 4.5418],
  'Lagos': [6.5925, 3.3444],
  'Nasarawa': [8.4904, 8.5153],
  'Niger': [9.6139, 6.5569],
  'Ogun': [7.1475, 3.3619],
  'Ondo': [7.2571, 5.2058],
  'Osun': [7.7827, 4.5418],
  'Oyo': [7.3775, 3.9470],
  'Plateau': [9.8965, 8.8583],
  'Rivers': [4.8156, 7.0498],
  'Sokoto': [13.0609, 5.2340],
  'Taraba': [8.8937, 11.3600],
  'Yobe': [11.7470, 11.9660],
  'Zamfara': [12.1628, 6.6614]
};

export const CDS_GROUPS = [
  'Education & Literacy CDS',
  'Editorial & Publicity CDS',
  'Road Safety (FRSC) CDS',
  'Medical & Health Services CDS',
  'EFCC & Anti-Corruption CDS',
  'NDLEA CDS',
  'Disaster Management (NEMA) CDS',
  'Culture & Tourism CDS',
  'Gender & Social Welfare CDS',
  'ICT & Digital Skills CDS',
  'Agro-Allied CDS',
  'Sports & Entertainment CDS'
];

export const INITIAL_PROFILE: Profile = {
  id: 'usr-cor-2026-001',
  full_name: 'Chinedu Emmanuel Adeleke',
  phone: '+234 814 592 0184',
  state_code: 'LA/26A/4819',
  call_up_no: 'NYSC/UAM/2026/049102',
  state_of_deployment: 'Lagos',
  lga: 'Ikeja',
  batch_stream: '2026 Batch A Stream 1',
  current_phase: 'ACTIVE',
  ppa_name: 'Government Senior Model College, Ikeja',
  ppa_address: 'Oba Akinjobi Way, GRA Ikeja, Lagos State',
  cds_group: 'Education & Literacy CDS',
  swearing_in_date: '2026-03-25',
  pop_date: '2027-02-28',
  is_admin: true,
  is_directory_visible: true,
  show_phone_in_directory: true,
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  created_at: '2026-03-20T10:00:00Z',
  updated_at: '2026-10-27T08:30:00Z'
};

export const INITIAL_LOCATION_SCHEDULE: LocationSchedule = {
  id: 'loc-001',
  user_id: 'usr-cor-2026-001',
  ppa_latitude: 6.5925,
  ppa_longitude: 3.3444,
  ppa_address_notes: 'Behind High Court GRA Ikeja, take Keke from Ikeja Underbridge ₦200',
  cds_latitude: 6.5982,
  cds_longitude: 3.3401,
  cds_address_notes: 'Ikeja Local Government Secretariat, Community Hall B',
  cds_meeting_day: 'Thursday',
  cds_meeting_time: '09:00',
  cds_frequency: 'Weekly',
  transit_fare_notes: 'BRT from Maryland: ₦350. Keke to Secretariat: ₦200.',
  updated_at: '2026-10-20T12:00:00Z'
};

export const INITIAL_FINANCIAL_SOURCE: FinancialSource = {
  id: 'fin-001',
  user_id: 'usr-cor-2026-001',
  federal_alawee: 77000.00,
  state_allowance: 15000.00,
  ppa_stipend: 35000.00,
  side_hustle: 25000.00,
  updated_at: '2026-10-26T15:00:00Z'
};

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-001',
    user_id: 'usr-cor-2026-001',
    title: 'October Room Contribution (Corpers Lodge)',
    category: 'Rent',
    amount: 18000,
    expense_date: '2026-10-02',
    created_at: '2026-10-02T11:00:00Z'
  },
  {
    id: 'exp-002',
    user_id: 'usr-cor-2026-001',
    title: 'Foodstuff & Rice Bag at Oyingbo Market',
    category: 'Food',
    amount: 22500,
    expense_date: '2026-10-06',
    created_at: '2026-10-06T14:30:00Z'
  },
  {
    id: 'exp-003',
    user_id: 'usr-cor-2026-001',
    title: 'MTN 50GB Monthly Data Bundle',
    category: 'Data',
    amount: 8000,
    expense_date: '2026-10-10',
    created_at: '2026-10-10T09:15:00Z'
  },
  {
    id: 'exp-004',
    user_id: 'usr-cor-2026-001',
    title: 'BRT & Keke Transport to PPA (Weeks 1-2)',
    category: 'Transport',
    amount: 9400,
    expense_date: '2026-10-14',
    created_at: '2026-10-14T18:00:00Z'
  },
  {
    id: 'exp-005',
    user_id: 'usr-cor-2026-001',
    title: 'October CDS Monthly Dues & Project Fund',
    category: 'CDS Dues',
    amount: 1500,
    expense_date: '2026-10-16',
    created_at: '2026-10-16T10:45:00Z'
  },
  {
    id: 'exp-006',
    user_id: 'usr-cor-2026-001',
    title: 'Teaching Materials, Whiteboard Markers & Lesson Notes',
    category: 'Personal',
    amount: 3200,
    expense_date: '2026-10-21',
    created_at: '2026-10-21T16:20:00Z'
  }
];

export const INITIAL_CLEARANCE_CHECKLISTS: ClearanceChecklist[] = [
  {
    id: 'clr-2026-08',
    user_id: 'usr-cor-2026-001',
    month_year: '2026-08',
    ppa_letter_signed: true,
    lgi_approval: true,
    biometrics_completed: true,
    payment_received: true,
    notes: 'Cleared smoothly at Ikeja Secretariat. Alawee ₦77,000 paid on 28th August.',
    updated_at: '2026-08-30T10:00:00Z'
  },
  {
    id: 'clr-2026-09',
    user_id: 'usr-cor-2026-001',
    month_year: '2026-09',
    ppa_letter_signed: true,
    lgi_approval: true,
    biometrics_completed: true,
    payment_received: true,
    notes: 'Signed by Principal Mr. Fagbemi on 18th Sept. Biometrics verified.',
    updated_at: '2026-09-29T11:00:00Z'
  },
  {
    id: 'clr-2026-10',
    user_id: 'usr-cor-2026-001',
    month_year: '2026-10',
    ppa_letter_signed: true,
    lgi_approval: true,
    biometrics_completed: true,
    payment_received: false,
    notes: 'Biometrics thumbprint captured on Oct 22nd. Awaiting federal alert payment run.',
    updated_at: '2026-10-25T14:00:00Z'
  }
];

export const INITIAL_CDS_LOGS: CdsLog[] = [
  {
    id: 'cds-001',
    user_id: 'usr-cor-2026-001',
    meeting_date: '2026-10-09',
    topic: 'Sensitization of Public School Students on Reading Culture & STEM',
    dues_paid: 1000,
    notes: 'Assigned as lead facilitator for Ikeja Grammar School outreach. Discussed procurement of 200 notebooks.',
    attendance_status: 'Present',
    created_at: '2026-10-09T13:00:00Z'
  },
  {
    id: 'cds-002',
    user_id: 'usr-cor-2026-001',
    meeting_date: '2026-10-16',
    topic: 'Review of Community Sanitation and Drug Abuse Awareness Rally',
    dues_paid: 500,
    notes: 'Joint meeting with NDLEA CDS group. Planned route from Ikeja bus-stop to Underbridge.',
    attendance_status: 'Present',
    created_at: '2026-10-16T12:30:00Z'
  },
  {
    id: 'cds-003',
    user_id: 'usr-cor-2026-001',
    meeting_date: '2026-10-23',
    topic: 'Mid-Service Project Planning & Financial Audit',
    dues_paid: 0,
    notes: 'Audited CDS treasury. Discussed installing solar street lights near Primary Health Care Center.',
    attendance_status: 'Present',
    created_at: '2026-10-23T11:45:00Z'
  }
];

export const INITIAL_VAULT_DOCUMENTS: DocumentVaultItem[] = [
  {
    id: 'doc-001',
    user_id: 'usr-cor-2026-001',
    document_type: 'Call Up Letter',
    file_name: 'NYSC_Call_Up_Letter_2026_Batch_A.pdf',
    file_url: 'https://example.com/vault/nysc_call_up.pdf',
    file_size: '1.4 MB',
    uploaded_at: '2026-03-12T08:00:00Z',
    encryption_status: 'AES-256 Encrypted'
  },
  {
    id: 'doc-002',
    user_id: 'usr-cor-2026-001',
    document_type: 'Green Card',
    file_name: 'NYSC_Official_Green_Card_Slip.pdf',
    file_url: 'https://example.com/vault/nysc_green_card.pdf',
    file_size: '890 KB',
    uploaded_at: '2026-03-14T10:15:00Z',
    encryption_status: 'AES-256 Encrypted'
  },
  {
    id: 'doc-003',
    user_id: 'usr-cor-2026-001',
    document_type: 'PPA Letter',
    file_name: 'PPA_Acceptance_Letter_Govt_Model_College.pdf',
    file_url: 'https://example.com/vault/ppa_acceptance.pdf',
    file_size: '2.1 MB',
    uploaded_at: '2026-04-18T14:30:00Z',
    encryption_status: 'AES-256 Encrypted'
  },
  {
    id: 'doc-004',
    user_id: 'usr-cor-2026-001',
    document_type: 'NYSC ID',
    file_name: 'Corps_Member_Identity_Card_Digital.png',
    file_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    file_size: '640 KB',
    uploaded_at: '2026-04-02T09:20:00Z',
    encryption_status: 'AES-256 Encrypted'
  },
  {
    id: 'doc-005',
    user_id: 'usr-cor-2026-001',
    document_type: 'Camp Discharge Slip',
    file_name: 'Iyana_Ipaja_Camp_Discharge_Certificate.pdf',
    file_url: 'https://example.com/vault/discharge_slip.pdf',
    file_size: '1.1 MB',
    uploaded_at: '2026-04-14T16:00:00Z',
    encryption_status: 'AES-256 Encrypted'
  }
];

export const INITIAL_SAED_NOTES: SaedNote[] = [
  {
    id: 'saed-001',
    user_id: 'usr-cor-2026-001',
    skill_category: 'Solar Installation',
    title: 'Basic Solar PV Sizing & Inverter Wiring in Camp',
    content: 'Learned during in-camp SAED 1-week practical session with Trainer Engr. Kola. Formula for Load Estimation: Total Watts = Sum of all appliance wattages. Battery Sizing: (Daily Wh load / System Voltage) x 1.25 safety factor. We wired a 1KVA hybrid inverter to two 200W mono-crystalline panels and a 12V 150Ah gel battery.',
    key_takeaways: [
      'Always connect Battery FIRST before solar panels to avoid inverter charge controller burnout',
      'Use 10mm DC solar cables to reduce voltage drop across distances > 5 meters',
      'High profit margin in assembling 100W mini solar home lighting kits for local community shops'
    ],
    images: [
      {
        id: 'img-saed-01',
        note_id: 'saed-001',
        image_url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
        caption: 'Trainer demonstrating inverter terminal connection'
      }
    ],
    created_at: '2026-04-08T15:00:00Z'
  },
  {
    id: 'saed-002',
    user_id: 'usr-cor-2026-001',
    skill_category: 'ICT & Tech',
    title: 'Fullstack Web Development & Freelancing for Corpers',
    content: 'Post-camp training with National Directorate of Employment (NDE) partner. Setting up digital agency targeting small businesses in Lagos. Offering ₦50,000 one-page landing page packages for school owners, boutique stores, and supermarkets. Using React, Tailwind, and Supabase.',
    key_takeaways: [
      'Target retail business owners in Ikeja Computer Village and Allen Avenue',
      'Create 3 demo templates (School portal, E-commerce catalog, Corporate portfolio)',
      'Side hustle earned ₦45,000 in August creating a website for a bakery in Oregun'
    ],
    images: [
      {
        id: 'img-saed-02',
        note_id: 'saed-002',
        image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
        caption: 'Laptop coding workspace in corpers lodge'
      }
    ],
    created_at: '2026-07-15T18:20:00Z'
  },
  {
    id: 'saed-003',
    user_id: 'usr-cor-2026-001',
    skill_category: 'Fashion & Tailoring',
    title: 'Customizing NYSC Khaki Jackets & Tapering Trousers',
    content: 'Mastered standard khaki fitting techniques. Adding inner lining, elastic cuffs, custom pocket zippers, and tapering baggy trousers to sharp modern slim-fit cuts. Many corpers pay ₦2,500 - ₦4,000 for proper khaki restructuring before Passing Out Parade (POP).',
    key_takeaways: [
      'Double stitch all inseams to prevent tearing during vigorous drills or parade steps',
      'Do not cut off original NYSC fabric label inside collar to avoid camp inspection queries'
    ],
    images: [],
    created_at: '2026-09-02T10:10:00Z'
  }
];

export const INITIAL_MARKETPLACE: MarketplaceItem[] = [
  {
    id: 'mkt-001',
    seller_id: 'usr-mkt-002',
    seller_name: 'Blessing Okafor',
    title: 'Original QASA Rechargeable Solar Fan with LED Lantern',
    description: 'Used for only 4 months in Corpers Lodge. Very strong battery lasts 14 hours on low speed, comes with solar charging panel and remote control. Perfect for Lagos / Ibadan heat and erratic power.',
    price: 24000,
    item_condition: 'Fairly Used',
    category: 'Electronics & Appliances',
    state: 'Lagos',
    lga: 'Ikeja',
    seller_phone: '+234 803 445 1982',
    images: [
      'https://images.unsplash.com/photo-1618941716939-553df3c6c278?auto=format&fit=crop&w=600&q=80'
    ],
    is_sold: false,
    created_at: '2026-10-24T12:00:00Z'
  },
  {
    id: 'mkt-002',
    seller_id: 'usr-mkt-003',
    seller_name: 'Tunde Bakare',
    title: 'Brand New NYSC Official Jungle Boots (Size 43)',
    description: 'Camp issued an extra pair that was never worn. Authentic military rubber sole, pristine condition with original laces. Great for POP parade preparation or replacement.',
    price: 9500,
    item_condition: 'Brand New',
    category: 'Camp Whites & Uniforms',
    state: 'Lagos',
    lga: 'Oshodi-Isolo',
    seller_phone: '+234 812 770 3391',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'
    ],
    is_sold: false,
    created_at: '2026-10-25T09:30:00Z'
  },
  {
    id: 'mkt-003',
    seller_id: 'usr-mkt-004',
    seller_name: 'Halima Mohammed',
    title: 'Mouka Foam 2.5ft x 6ft Single Student Mattress + Treated Mosquito Net',
    description: 'Outgoing Batch B corper passing out next month. Clean orthopaedic foam with waterproof floral zip cover and pre-hung white rectangular mosquito net. Buyer to pick up at Ikeja GRA lodge.',
    price: 18000,
    item_condition: 'Fairly Used',
    category: 'Mattresses & Bedding',
    state: 'Lagos',
    lga: 'Ikeja',
    seller_phone: '+234 905 112 8843',
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=80'
    ],
    is_sold: false,
    created_at: '2026-10-26T14:15:00Z'
  },
  {
    id: 'mkt-004',
    seller_id: 'usr-mkt-005',
    seller_name: 'Femi Alabi',
    title: 'Heavy Duty 3-Liter Electric Kettle & Hot Plate Combo',
    description: 'Stainless steel quick-boil cordless electric kettle + Century double burner hot plate. Works great with prepaid meters or generator.',
    price: 15500,
    item_condition: 'Fairly Used',
    category: 'Kitchen & Cooking',
    state: 'Abuja FCT',
    lga: 'Municipal Area Council',
    seller_phone: '+234 802 654 3901',
    images: [
      'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=600&q=80'
    ],
    is_sold: false,
    created_at: '2026-10-26T16:45:00Z'
  },
  {
    id: 'mkt-005',
    seller_id: 'usr-cor-2026-001',
    seller_name: 'Chinedu Adeleke',
    title: 'NYSC Green Waist Pouch with Secret Cash Compartment + 3 Padlocks',
    description: 'Essential camp item! Sturdy waterproof green waist pouch with multiple zippers, plus 3 brass padlocks for camp luggage & hostel bucket safety.',
    price: 3500,
    item_condition: 'Brand New',
    category: 'Camp Whites & Uniforms',
    state: 'Lagos',
    lga: 'Ikeja',
    seller_phone: '+234 814 592 0184',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'
    ],
    is_sold: false,
    created_at: '2026-10-27T08:10:00Z'
  },
  {
    id: 'mkt-006',
    seller_id: 'usr-mkt-006',
    seller_name: 'Babatunde Fashola',
    title: 'Lontor 16-Inch Rechargeable Standing Fan (Dual LED & USB Solar Port)',
    description: 'Very clean rechargeable fan, runs 8+ hours on low speed. Essential for Ikeja Corper Lodge power outages. Has USB phone charging port and remote control.',
    price: 24000,
    item_condition: 'Fairly Used',
    category: 'Electronics & Appliances',
    state: 'Lagos',
    lga: 'Ikeja',
    seller_phone: '+234 803 719 4402',
    images: [
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80'
    ],
    is_sold: false,
    created_at: '2026-10-27T11:00:00Z'
  },
  {
    id: 'mkt-007',
    seller_id: 'usr-mkt-007',
    seller_name: 'Ibrahim Danjuma',
    title: 'Senkei 1.5kVA Manual Start "I-Pass-My-Neighbor" Generator',
    description: '100% copper coil, serviced last month with new spark plug and oil. Powers small fridge, TV, fan, and multiple laptop chargers in corpers quarters. Reason for sale: Relocating to Abuja.',
    price: 48000,
    item_condition: 'Fairly Used',
    category: 'Electronics & Appliances',
    state: 'Lagos',
    lga: 'Surulere',
    seller_phone: '+234 805 229 1184',
    images: [
      'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80'
    ],
    is_sold: false,
    created_at: '2026-10-27T15:20:00Z'
  },
  {
    id: 'mkt-008',
    seller_id: 'usr-mkt-008',
    seller_name: 'Blessing Udoh',
    title: 'Vitafoam 3ft x 6ft Semi-Orthopedic Spring Mattress',
    description: 'Comfortable 3x6 single mattress used for only 5 months in corpers lodge at Oshodi. Zero sag, immaculate condition with protective fabric cover.',
    price: 22000,
    item_condition: 'Fairly Used',
    category: 'Mattresses & Bedding',
    state: 'Lagos',
    lga: 'Oshodi-Isolo',
    seller_phone: '+234 818 901 2233',
    images: [
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=600&q=80'
    ],
    is_sold: false,
    created_at: '2026-10-28T03:40:00Z'
  }
];

export const INITIAL_JOB_LISTINGS: JobListing[] = [
  {
    id: 'job-001',
    poster_id: 'usr-rec-001',
    poster_name: 'EduTech West Africa',
    job_title: 'NYSC Corp Member - Assistant STEM Instructor / Web Tutor',
    company_name: 'EduTech Academy Lagos',
    location: 'Ikeja, Lagos (On-site)',
    job_type: 'PPA',
    salary_range: '₦50,000/mo + PPA Accommodation',
    description: 'Seeking serving Batch A/B corps members with Computer Science, Engineering, or EdTech backgrounds to assist in teaching Python and Scratch to junior school students. Free private quarters in Ikeja included.',
    apply_type: 'whatsapp',
    contact_phone: '+234 802 334 1199',
    is_active: true,
    created_at: '2026-10-22T09:00:00Z'
  },
  {
    id: 'job-002',
    poster_id: 'usr-rec-002',
    poster_name: 'Nexus Microfinance Bank',
    job_title: 'Graduate Trainee / Credit Risk Analyst (Post-NYSC Fast Track)',
    company_name: 'Nexus Financial Services',
    location: 'Victoria Island, Lagos (Hybrid)',
    job_type: 'Full-time',
    salary_range: '₦220,000 - ₦280,000/mo',
    description: 'Open to corps members nearing Passing Out Parade (within 3 months of POP) or recent ex-corpers. Full-time employment with health insurance and career progression.',
    apply_type: 'external_link',
    external_source: 'linkedin',
    external_apply_url: 'https://www.linkedin.com/jobs/search/?keywords=Graduate+Trainee+Nigeria',
    is_active: true,
    created_at: '2026-10-24T11:30:00Z'
  },
  {
    id: 'job-005',
    poster_id: 'usr-rec-005',
    poster_name: 'Moniepoint MFB',
    job_title: 'Customer Operations Associate (NYSC & Fresh Graduates)',
    company_name: 'Moniepoint Financial Services',
    location: 'Lekki Phase 1, Lagos',
    job_type: 'Full-time',
    salary_range: '₦180,000 - ₦240,000/mo',
    description: 'Provide tier-1 financial support to business merchants across Nigeria. Excellent training program, shift allowance, and lunch voucher included.',
    apply_type: 'external_link',
    external_source: 'jobberman',
    external_apply_url: 'https://www.jobberman.com/jobs/graduate-trainee',
    is_active: true,
    created_at: '2026-10-25T10:00:00Z'
  },
  {
    id: 'job-006',
    poster_id: 'usr-rec-006',
    poster_name: 'TotalEnergies Exploration Nigeria',
    job_title: 'Upstream Engineering & Commercial Graduate Intern',
    company_name: 'TotalEnergies Nigeria',
    location: 'Port Harcourt / Lagos',
    job_type: 'Internship',
    salary_range: '₦150,000/mo Internship Allowance',
    description: '12-month accelerated internship for high-performing engineering and commercial graduates awaiting or completing NYSC service.',
    apply_type: 'external_link',
    external_source: 'linkedin',
    external_apply_url: 'https://www.linkedin.com/jobs/search/?keywords=TotalEnergies+Nigeria',
    is_active: true,
    created_at: '2026-10-25T13:40:00Z'
  },
  {
    id: 'job-003',
    poster_id: 'usr-rec-003',
    poster_name: 'AfriHealth Diagnostics',
    job_title: 'NYSC Medical Lab Scientist / Pharmacist PPA',
    company_name: 'AfriHealth Clinics',
    location: 'Maitama, Abuja FCT',
    job_type: 'PPA',
    salary_range: '₦70,000/mo PPA stipend',
    description: 'Immediate PPA vacancy for licensed MLS or Pharmacy corps members in Abuja. Duties include routine laboratory investigations, specimen handling, and patient triage.',
    apply_type: 'phone_call',
    contact_phone: '+234 809 110 4422',
    is_active: true,
    created_at: '2026-10-25T15:10:00Z'
  },
  {
    id: 'job-004',
    poster_id: 'usr-rec-004',
    poster_name: 'Kora Studios',
    job_title: 'Remote Social Media & Content Creator Intern',
    company_name: 'Kora Digital Media',
    location: 'Nigeria (Fully Remote)',
    job_type: 'Remote',
    salary_range: '₦60,000/mo data & stipend',
    description: 'Flexible 15 hours/week for corps members with great video editing skills (CapCut/Premiere) and TikTok/Instagram reel production experience. Can be paired with your primary PPA easily.',
    apply_type: 'whatsapp',
    contact_phone: '+234 818 900 7711',
    is_active: true,
    created_at: '2026-10-26T17:00:00Z'
  }
];

export const INITIAL_PPA_WORK_LOGS: PpaWorkLog[] = [
  {
    id: 'log-001',
    user_id: 'usr-cor-2026-001',
    achievement_text: 'Designed and deployed an automated student term grade calculation sheet using Google Sheets for 320 SS2 students, cutting report card compilation time by 60%.',
    skill_tags: ['Data Analysis', 'Process Automation', 'Google Sheets', 'Education Management'],
    log_date: '2026-07-20'
  },
  {
    id: 'log-002',
    user_id: 'usr-cor-2026-001',
    achievement_text: 'Organized a free 3-week After-School Coding Club teaching HTML, CSS, and basic JavaScript to 45 high school students; 12 students built personal portfolio websites.',
    skill_tags: ['Web Development', 'Mentorship', 'Curriculum Design', 'Public Speaking'],
    log_date: '2026-09-15'
  },
  {
    id: 'log-003',
    user_id: 'usr-cor-2026-001',
    achievement_text: 'Facilitated procurement of 15 refurbished desktop monitors for the school computer laboratory through private alumni donations.',
    skill_tags: ['Fundraising', 'Community Engagement', 'Stakeholder Management', 'IT Infrastructure'],
    log_date: '2026-10-18'
  }
];

export const INITIAL_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'emg-001',
    user_id: 'usr-cor-2026-001',
    contact_name: 'NYSC National Distress Call Centre',
    role_title: 'NYSC Headquarters Toll-Free Line',
    phone_number: '08033107873',
    is_default: true
  },
  {
    id: 'emg-002',
    user_id: 'usr-cor-2026-001',
    contact_name: 'Lagos State NYSC Coordinator Office',
    role_title: 'State Coordinator Secretariat (Babs Animashaun, Surulere)',
    phone_number: '08023190821',
    is_default: true,
    state: 'Lagos'
  },
  {
    id: 'emg-003',
    user_id: 'usr-cor-2026-001',
    contact_name: 'Mr. Babatunde (Ikeja LGI)',
    role_title: 'Local Government Inspector - Ikeja LGA',
    phone_number: '08034091288',
    is_default: true,
    state: 'Lagos',
    lga: 'Ikeja'
  },
  {
    id: 'emg-004',
    user_id: 'usr-cor-2026-001',
    contact_name: 'Area F Police Command (GRA Ikeja)',
    role_title: 'Nigeria Police Force Emergency Desk',
    phone_number: '08033011052',
    is_default: true,
    state: 'Lagos',
    lga: 'Ikeja'
  },
  {
    id: 'emg-005',
    user_id: 'usr-cor-2026-001',
    contact_name: 'Ikeja General Hospital Emergency Unit',
    role_title: '24/7 Trauma & Emergency Center',
    phone_number: '08028419330',
    is_default: false,
    state: 'Lagos',
    lga: 'Ikeja'
  }
];

export const INITIAL_CAMP_CHECKLIST: CampChecklistItem[] = [
  // Mandatory Documents
  {
    id: 'chk-doc-01',
    category: 'Mandatory Documents',
    title: 'Original NYSC Call-Up Letter (Green Slip / Coloured Printout)',
    quantity: '1 Original + 6 Photocopies',
    notes: 'Do not laminate original copy! Soldiers will reject it.',
    is_packed: true,
    is_critical: true
  },
  {
    id: 'chk-doc-02',
    category: 'Mandatory Documents',
    title: 'Official NYSC Green Card Slip',
    quantity: '1 Original + 6 Photocopies',
    notes: 'Make sure barcode and registration number are sharp and scannable.',
    is_packed: true,
    is_critical: true
  },
  {
    id: 'chk-doc-03',
    category: 'Mandatory Documents',
    title: 'Statement of Result or Original Degree Certificate',
    quantity: '1 Original + 6 Photocopies',
    notes: 'Signed and dated by your University / Polytechnic registrar.',
    is_packed: true,
    is_critical: true
  },
  {
    id: 'chk-doc-04',
    category: 'Mandatory Documents',
    title: 'Medical Certificate of Fitness from Government Hospital',
    quantity: '1 Original + 4 Photocopies',
    notes: 'Must be from a recognized Federal/State General Hospital or FMC.',
    is_packed: true,
    is_critical: true
  },
  {
    id: 'chk-doc-05',
    category: 'Mandatory Documents',
    title: 'School Identity Card (Final Year / Alumni)',
    quantity: '1 Original + 3 Photocopies',
    notes: 'Used to verify student identity before biometric clearance.',
    is_packed: true,
    is_critical: true
  },
  {
    id: 'chk-doc-06',
    category: 'Mandatory Documents',
    title: 'Passport Photographs (White Background)',
    quantity: '24 Copies minimum',
    notes: 'Required for bank account opening, platoon file, clinic, OBS, etc.',
    is_packed: true,
    is_critical: true
  },

  // White Gears & Wear
  {
    id: 'chk-wear-01',
    category: 'White Gears & Wear',
    title: 'Plain White Round Neck T-Shirts',
    quantity: '6 - 8 Pairs',
    notes: 'Buy heavy cotton to withstand red mud and vigorous soldier drills.',
    is_packed: true,
    is_critical: false
  },
  {
    id: 'chk-wear-02',
    category: 'White Gears & Wear',
    title: 'Plain White Camp Shorts',
    quantity: '4 - 6 Pairs',
    notes: 'Length should reach above knees; must have secure pockets.',
    is_packed: true,
    is_critical: false
  },
  {
    id: 'chk-wear-03',
    category: 'White Gears & Wear',
    title: 'White Rubber / Canvas Sneakers',
    quantity: '2 Pairs',
    notes: 'Rubber sneakers (like popular White Power sneakers) dry easily during rain.',
    is_packed: true,
    is_critical: false
  },
  {
    id: 'chk-wear-04',
    category: 'White Gears & Wear',
    title: 'Plain White Socks (No coloured stripes)',
    quantity: '6 - 8 Pairs',
    notes: 'Camp soldiers strictly mandate pure white socks on the parade ground.',
    is_packed: true,
    is_critical: false
  },
  {
    id: 'chk-wear-05',
    category: 'White Gears & Wear',
    title: 'Camp Waist Pouch (Fanny Pack)',
    quantity: '1 or 2',
    notes: 'Keep on your body 24/7 for phone, cash, ID, locker keys, and whistle.',
    is_packed: true,
    is_critical: false
  },

  // Health & Personal Care
  {
    id: 'chk-care-01',
    category: 'Health & Personal Care',
    title: 'Treated Mosquito Net & 4 Clamps / Rope',
    quantity: '1 Set',
    notes: 'Lifesaver against camp mosquitoes and malaria during 21 days.',
    is_packed: false,
    is_critical: false
  },
  {
    id: 'chk-care-02',
    category: 'Health & Personal Care',
    title: 'Personal First Aid Kit (Paracetamol, Antimalarial, Glucose, Plaster, Deep Heat spray)',
    quantity: '1 Kit',
    notes: 'For sore muscles after 5am early morning parade runs.',
    is_packed: false,
    is_critical: false
  },
  {
    id: 'chk-care-03',
    category: 'Health & Personal Care',
    title: 'Toiletries (Detergent, Bath soap, Antiseptic Dettol, Toothpaste, Towel)',
    quantity: '1 Pack',
    notes: 'Pack travel-sized or buy top-ups at Mammy Market.',
    is_packed: true,
    is_critical: false
  },

  // Hostel & Bedding
  {
    id: 'chk-hostel-01',
    category: 'Hostel & Bedding',
    title: 'White Bed Sheet & 2 Pillowcases',
    quantity: '2 Sets',
    notes: 'Many camps mandate white bed sheets during morning hostel inspection.',
    is_packed: false,
    is_critical: false
  },
  {
    id: 'chk-hostel-02',
    category: 'Hostel & Bedding',
    title: 'Padlocks & Duplicate Keys',
    quantity: '3 - 4 Padlocks',
    notes: '1 for main luggage, 1 for small bag, 1 for bathroom bucket or locker.',
    is_packed: true,
    is_critical: false
  },
  {
    id: 'chk-hostel-03',
    category: 'Hostel & Bedding',
    title: 'Metal or Hard Plastic Food Flask & Spoon',
    quantity: '1 Set',
    notes: 'For collecting food at the camp kitchen (Soldiers prohibit glass/breakables).',
    is_packed: true,
    is_critical: false
  },

  // Provisions & Cash
  {
    id: 'chk-prov-01',
    category: 'Provisions & Cash',
    title: 'Physical Cash (₦25,000 - ₦50,000 in smaller notes)',
    quantity: '₦30,000+',
    notes: 'Camp POS operators often charge ₦200-₦400 withdrawal fees; network can be erratic.',
    is_packed: true,
    is_critical: true
  },
  {
    id: 'chk-prov-02',
    category: 'Provisions & Cash',
    title: 'High Capacity Power Bank (20,000mAh+)',
    quantity: '1 or 2',
    notes: 'Hostel sockets are banned or crowded; charging at Mammy Market costs ₦200.',
    is_packed: true,
    is_critical: false
  },
  {
    id: 'chk-prov-03',
    category: 'Provisions & Cash',
    title: 'Provisions (Milk, Milo, Cornflakes, Biscuits, Water bottle)',
    quantity: 'Assorted',
    notes: 'Quick hunger busters between early parade and afternoon lectures.',
    is_packed: false,
    is_critical: false
  }
];

export const CORPS_MEMBERS_DIRECTORY: CorperDirectoryMember[] = [
  {
    id: 'dir-001',
    full_name: 'Chinedu Emmanuel Adeleke',
    state_code: 'LA/26A/4819',
    state: 'Lagos',
    lga: 'Ikeja',
    batch: '2026 Batch A Stream 1',
    ppa: 'Government Senior Model College, Ikeja',
    cds: 'Education & Literacy CDS',
    phone: '+234 814 592 0184',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    phase: 'ACTIVE',
    skills: ['React', 'TypeScript', 'Node.js', 'UI/UX Design'],
    bio: 'Software engineer passionate about educational tech and digital literacy in secondary schools.',
    institution: 'University of Agriculture, Makurdi'
  },
  {
    id: 'dir-007',
    full_name: 'Ayomide Olawale',
    state_code: 'LA/26A/4830',
    state: 'Lagos',
    lga: 'Ikeja',
    batch: '2026 Batch A Stream 1',
    ppa: 'Government Senior Model College, Ikeja',
    cds: 'Education & Literacy CDS',
    phone: '+234 802 334 1189',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
    phase: 'ACTIVE',
    skills: ['Mathematics Teacher', 'Data Analysis', 'SPSS', 'Excel Modeling'],
    bio: 'Math tutor at Model College Ikeja. Serving in Education CDS and organizing student quizzes.',
    institution: 'University of Lagos (UNILAG)'
  },
  {
    id: 'dir-008',
    full_name: 'Nkechi Sandra Obi',
    state_code: 'LA/26A/4845',
    state: 'Lagos',
    lga: 'Ikeja',
    batch: '2026 Batch A Stream 1',
    ppa: 'Government Senior Model College, Ikeja',
    cds: 'Road Safety (FRSC) CDS',
    phone: '+234 818 440 9231',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80',
    phase: 'ACTIVE',
    skills: ['Biology Teacher', 'Lab Technician', 'First Aid & CPR', 'Event Planning'],
    bio: 'Biochemistry graduate serving as school biology tutor and laboratory coordinator.',
    institution: 'University of Nigeria, Nsukka (UNN)'
  },
  {
    id: 'dir-006',
    full_name: 'Grace Chioma Nwachukwu',
    state_code: 'LA/26A/4901',
    state: 'Lagos',
    lga: 'Ikeja',
    batch: '2026 Batch A Stream 1',
    ppa: 'Zenith Bank PLC, Opebi',
    cds: 'Education & Literacy CDS',
    phone: '+234 813 902 5541',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    phase: 'ACTIVE',
    skills: ['Financial Analysis', 'Customer Relations', 'Copywriting', 'Public Speaking'],
    bio: 'Finance analyst in commercial banking and volunteer reading tutor on CDS Thursdays.',
    institution: 'Covenant University'
  },
  {
    id: 'dir-003',
    full_name: 'David Oluwaseun Davies',
    state_code: 'LA/26A/5012',
    state: 'Lagos',
    lga: 'Ikeja',
    batch: '2026 Batch A Stream 1',
    ppa: 'Fidelity Bank PLC, Allen Avenue',
    cds: 'EFCC & Anti-Corruption CDS',
    phone: '+234 803 881 7210',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    phase: 'ACTIVE',
    skills: ['Cybersecurity', 'Python', 'Digital Forensics', 'Network Security'],
    bio: 'Information security enthusiast auditing banking applications and organizing EFCC school rallies.',
    institution: 'Federal University of Technology, Akure (FUTA)'
  },
  {
    id: 'dir-009',
    full_name: 'Bolanle Yusuf',
    state_code: 'LA/26A/5120',
    state: 'Lagos',
    lga: 'Oshodi-Isolo',
    batch: '2026 Batch A Stream 1',
    ppa: 'Lagos State Ministry of Works',
    cds: 'Agro-Allied CDS',
    phone: '+234 809 112 3456',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    phase: 'ACTIVE',
    skills: ['Civil Engineering', 'AutoCAD', 'Structural Design', 'Hydroponics'],
    bio: 'Civil engineer and urban farmer. Happy to connect on structural drawings or hydroponics farming.',
    institution: 'Obafemi Awolowo University (OAU)'
  },
  {
    id: 'dir-002',
    full_name: 'Fatima Zahra Umar',
    state_code: 'AB/26A/1204',
    state: 'FCT Abuja',
    lga: 'Municipal Area Council',
    batch: '2026 Batch A Stream 1',
    ppa: 'Federal Ministry of Finance',
    cds: 'Editorial & Publicity CDS',
    phone: '+234 809 332 9901',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    phase: 'ACTIVE',
    skills: ['Public Policy', 'Macroeconomics', 'French Translation', 'Content Strategy'],
    bio: 'Economics graduate tracking federal budget allocation and editorial head for Abuja corpers magazine.',
    institution: 'Ahmadu Bello University (ABU Zaria)'
  },
  {
    id: 'dir-004',
    full_name: 'Amina Bello Garba',
    state_code: 'KN/26B/0911',
    state: 'Kano',
    lga: 'Nassarawa',
    batch: '2026 Batch B Stream 2',
    ppa: 'Aminu Kano Teaching Hospital',
    cds: 'Medical & Health Services CDS',
    phone: '+234 816 550 4419',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=80',
    phase: 'ACTIVE',
    skills: ['General Medicine', 'Maternal Health', 'Vaccination Campaigns', 'Hausa/English'],
    bio: 'Medical doctor serving in pediatrics and organizing free blood pressure screenings on CDS days.',
    institution: 'Bayero University Kano (BUK)'
  },
  {
    id: 'dir-005',
    full_name: 'Efe Kenneth Okoro',
    state_code: 'RV/26A/3340',
    state: 'Rivers',
    lga: 'Port Harcourt',
    batch: '2026 Batch A Stream 1',
    ppa: 'TotalEnergies Exploration Port Harcourt',
    cds: 'Road Safety (FRSC) CDS',
    phone: '+234 902 441 8765',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    phase: 'ACTIVE',
    skills: ['Petroleum Engineering', 'HSE Safety Audits', 'Project Management', 'Data Analytics'],
    bio: 'Upstream operations engineering intern and road safety traffic marshal volunteer in PH.',
    institution: 'University of Benin (UNIBEN)'
  }
];

export const INITIAL_CORPER_LODGES: CorperLodge[] = [
  {
    id: 'ldg-001',
    name: 'NCCF Ikeja Family House & Corpers Lodge',
    lodge_type: 'NCCF Family House',
    state: 'Lagos',
    lga: 'Ikeja',
    address: '14 Oba Akinjobi Way, GRA Ikeja, Lagos (5 mins from Secretariat)',
    cost_description: 'Free Accommodation (Voluntary ₦3,000/mo electricity/food dues)',
    amenities: ['Solar Inverter System (24/7 Power)', 'Industrial Borehole Water', 'Spacious Library & Study Room', 'Perimeter Security & Night Guard', 'Equipped Shared Kitchen'],
    caretaker_name: 'Bro. Emmanuel (Family House President)',
    caretaker_phone: '+234 803 112 9901',
    available_spaces: 4,
    notes: 'Christian corps members fellowship lodge. Strict curfew at 10:00 PM. Highly peaceful and conducive for study and remote work.'
  },
  {
    id: 'ldg-002',
    name: 'MCAN Ikeja Corpers Lodge',
    lodge_type: 'MCAN Corpers Lodge',
    state: 'Lagos',
    lga: 'Ikeja',
    address: 'Plot 8, Lateef Jakande Road, Agidingbi, Ikeja, Lagos',
    cost_description: 'Free Accommodation (Token ₦2,500/mo waste & power contribution)',
    amenities: ['Central Mosque Walking Distance', 'Generator Power (Evening Hours)', 'Constant Running Water', 'Fenced Compound with Gate Guard', 'Corper Reading Desk'],
    caretaker_name: 'Ustadh Luqman (MCAN Welfare Officer)',
    caretaker_phone: '+234 812 449 0182',
    available_spaces: 3,
    notes: 'Muslim Corpers Association of Nigeria lodge. Clean and disciplined environment for male and female wings.'
  },
  {
    id: 'ldg-003',
    name: 'Ikeja Local Government Corpers Quarters',
    lodge_type: 'LGA Quarters',
    state: 'Lagos',
    lga: 'Ikeja',
    address: 'Beside Ikeja LGA Secretariat, Community Road, Ikeja',
    cost_description: '₦30,000 / year (Subsidized Local Government Maintenance Fee)',
    amenities: ['Dedicated Power Transformer', 'Running Borehole & Overhead Tanks', 'Direct Walk to CDS Venue', 'Local Security Patrol', 'Personal Room Cupboards'],
    caretaker_name: 'Mr. Fagbemi (LGA Youth Officer)',
    caretaker_phone: '+234 802 771 5530',
    available_spaces: 2,
    notes: 'Official quarters provided by the LGA chairman. Priority given to public school teachers and secretariat staff.'
  },
  {
    id: 'ldg-004',
    name: 'NACC Surulere Catholic Corpers Lodge',
    lodge_type: 'NACC Catholic Lodge',
    state: 'Lagos',
    lga: 'Surulere',
    address: 'Near St. Anthony Catholic Church, Gbaja, Surulere, Lagos',
    cost_description: '₦25,000 / year (Parish Maintenance Contribution)',
    amenities: ['24/7 Treated Water', 'Inverter Power for Gadgets', 'Quiet Serene Environment', 'Gated Compound with Day/Night Watch'],
    caretaker_name: 'Sister Genevieve (NACC Coordinator)',
    caretaker_phone: '+234 806 889 2201',
    available_spaces: 5,
    notes: 'Warm Catholic corpers community. Features morning and evening devotional chapel, good Wi-Fi coverage.'
  },
  {
    id: 'ldg-005',
    name: 'Oshodi Community Corpers Quarters',
    lodge_type: 'Community Lodge',
    state: 'Lagos',
    lga: 'Oshodi-Isolo',
    address: '22 Church Street, off Oshodi Express, Oshodi-Isolo, Lagos',
    cost_description: '₦35,000 / year (Electricity & Security inclusive)',
    amenities: ['Private Self-Contained Rooms', 'Borehole Water', 'Close to Transit Terminal', 'Iron Security Doors'],
    caretaker_name: 'Chief Balogun (Community Secretary)',
    caretaker_phone: '+234 808 331 4488',
    available_spaces: 6,
    notes: 'Convenient transit hub access for corpers serving in Oshodi, Airport Road, and Ilupeju commercial zones.'
  }
];

export const INITIAL_TRANSIT_ROUTES: TransitFareRoute[] = [
  {
    id: 'route-001',
    state: 'Lagos',
    lga: 'Ikeja',
    route_name: 'Ikeja Underbridge ⇄ Lagos State Secretariat',
    from_location: 'Ikeja Underbridge Flyover',
    to_location: 'LGA Secretariat Main Gate, Ikeja',
    vehicle_type: 'Keke Marwa',
    estimated_fare_range: '₦200 - ₦300',
    commute_tips: 'Board from underbridge flyover. Tricycles fill up fast between 7:30 AM and 8:30 AM on CDS Thursdays. Keep exact change ready.',
    last_verified: 'October 2026'
  },
  {
    id: 'route-002',
    state: 'Lagos',
    lga: 'Ikeja',
    route_name: 'Maryland Bus Shelter ⇄ Ikeja Secretariat / Allen',
    from_location: 'Maryland BRT Shelter',
    to_location: 'Allen Avenue / Secretariat',
    vehicle_type: 'BRT Bus',
    estimated_fare_range: '₦350 - ₦450',
    commute_tips: 'Cowry Card tap required. Air-conditioned blue buses run every 10 minutes along the dedicated transit corridor.',
    last_verified: 'October 2026'
  },
  {
    id: 'route-003',
    state: 'Lagos',
    lga: 'Ikeja',
    route_name: 'Ikeja Along Railway ⇄ Oshodi Bus Terminal',
    from_location: 'Ikeja Along Rail Tracks',
    to_location: 'Oshodi Interchange Terminals 1, 2 & 3',
    vehicle_type: 'Danfo Yellow Bus',
    estimated_fare_range: '₦300 - ₦500',
    commute_tips: 'Danfo conductors shout "Oshodi Oke / Oshodi Wole". Morning fares are cheaper (₦300), evening peak rain surges up to ₦500.',
    last_verified: 'October 2026'
  },
  {
    id: 'route-004',
    state: 'Lagos',
    lga: 'Alimosho',
    route_name: 'NYSC Orientation Camp (Iyana Ipaja) ⇄ Ikeja City Mall',
    from_location: 'Iyana Ipaja Camp Main Gate',
    to_location: 'Ikeja City Mall (ICM) / Secretariat',
    vehicle_type: 'Shared Taxi',
    estimated_fare_range: '₦500 - ₦750',
    commute_tips: 'Very popular on Sunday camp leave passes and POP rehearsal days. Direct cars queue right outside the orientation gate.',
    last_verified: 'October 2026'
  },
  {
    id: 'route-005',
    state: 'Lagos',
    lga: 'Eti-Osa',
    route_name: 'CMS Marina ⇄ Victoria Island / Lekki Toll Gate',
    from_location: 'CMS Marina Jetty Terminal',
    to_location: 'Adetokunbo Ademola / Lekki Phase 1',
    vehicle_type: 'BRT Bus',
    estimated_fare_range: '₦400 - ₦600',
    commute_tips: 'Avoid rush hour bottlenecks by boarding before 4:30 PM. Cowry card balance must be at least ₦1,000 for Island routes.',
    last_verified: 'October 2026'
  }
];

export const RELOCATION_STEPS_GUIDE: RelocationStep[] = [
  {
    id: 'reloc-01',
    step_number: 1,
    title: 'Obtain Official Ground Supporting Documents',
    category: 'Preparation',
    description: 'Relocations are granted only on 3 legal grounds: Marital, Life-Threatening Medical Condition, or Security. Gather certified evidence before applying.',
    required_documents: [
      'Marital: Original Marriage Certificate, Husband’s valid ID card, Letter from husband’s employer, Utility bill showing residence in destination state.',
      'Medical: Comprehensive medical report from a Military Hospital, Federal Medical Centre (FMC), or State Teaching Hospital on official hospital letterhead.',
      'Security: Official security report or state emergency advisory validated by the Zonal Inspector.'
    ],
    pro_tip: 'Never use unverified private clinic letters; NYSC medical boards in camp verify credentials directly with national hospital registries.'
  },
  {
    id: 'reloc-02',
    step_number: 2,
    title: 'Submit Application on NYSC Official Portal',
    category: 'Portal Application',
    description: 'Log in to your dashboard at https://portal.nysc.org.ng/NYSC1/Default.aspx and click "Relocation Request". Select target State and LGA, upload crisp scanned PDF proofs (under 2MB each), and submit before deadline.',
    required_documents: [
      'Portal Login Credentials',
      'High-resolution PDF scans of ground documents',
      'Official NYSC Call-Up Letter & Green Card'
    ],
    pro_tip: 'Ensure the name on your marriage certificate matches your portal registration name, or include a registered newspaper change of name publication.'
  },
  {
    id: 'reloc-03',
    step_number: 3,
    title: 'Camp Relocation Committee / State Endorsement',
    category: 'Official Endorsement',
    description: 'If applying in Orientation Camp, present your physical file to the Camp Relocation Committee during the 2nd week of camp. If post-camp, route file through your LGI and Zonal Inspector (ZI) to the State Coordinator.',
    required_documents: [
      'Original physical documents in duplicate green file jacket',
      'LGI recommendation letter (if post-camp)',
      'Passport photographs in white camp uniform'
    ],
    pro_tip: 'Be courteous and punctual when invited for physical verification with the camp doctor or military security liaison.'
  },
  {
    id: 'reloc-04',
    step_number: 4,
    title: 'Directorate Headquarters (Abuja) Approval',
    category: 'Official Endorsement',
    description: 'The National Directorate Headquarters reviews and ratifies the request. Once approved, the status on your portal changes to "APPROVED". You can immediately download and print your official Relocation Letter.',
    required_documents: [
      'Printed Colored Relocation Approval Letter with QR verification barcode',
      'Electronic payment receipt (if nominal fee applies on portal)'
    ],
    pro_tip: 'Check your portal dashboard twice daily around the end of orientation camp as approvals drop in batches.'
  },
  {
    id: 'reloc-05',
    step_number: 5,
    title: 'De-Registration & Reporting to New Secretariat',
    category: 'Final Clearance',
    description: 'Collect your discharge transit slip from your current State Secretariat. Travel safely and report to the NYSC Secretariat of your newly approved State within 21 days for biometric re-registration and new PPA posting.',
    required_documents: [
      'Original Relocation Letter (2 copies)',
      'Corps Member Identity Card',
      'Camp discharge transit slip'
    ],
    pro_tip: 'Do not miss the 21-day reporting deadline, as an expired relocation letter may be revoked, requiring re-submission to Abuja.'
  }
];

export const NYSC_ANTHEM = [
  {
    stanza: 'Stanza 1',
    lines: [
      'Youths obey the clarion call,',
      'Let us lift our high banner;',
      'In love and peace and one accord,',
      'Nigeria we must serve!',
      'Honour and glory to our fatherland,',
      'Hail Nigeria, our great fatherland!'
    ]
  },
  {
    stanza: 'Stanza 2',
    lines: [
      'Far and near we come to serve,',
      'And to build our fatherland;',
      'With oneness and with selfless heart,',
      'Nigeria we must serve!',
      'Honour and glory to our fatherland,',
      'Hail Nigeria, our great fatherland!'
    ]
  },
  {
    stanza: 'Stanza 3',
    lines: [
      'Youths obey the clarion call,',
      'Sun or rain we conquer all;',
      'Nigeria\'s future is in our hands,',
      'And we will build our land!',
      'Honour and glory to our fatherland,',
      'Hail Nigeria, our great fatherland!'
    ]
  }
];

export const NYSC_GLOSSARY = [
  { term: 'Otondo', definition: 'Affectionate camp slang for a greenhorn prospective or freshly mobilized corps member in camp.' },
  { term: 'Alawee', definition: 'The official monthly allowance paid by the Federal Government (now officially ₦77,000) into corps members’ accounts.' },
  { term: 'Mammy Market', definition: 'The bustling commercial heart inside every NYSC orientation camp filled with food vendors, tailors, photographers, cobblers, and chill spots.' },
  { term: 'PPA', definition: 'Place of Primary Assignment — the school, firm, hospital, or government ministry where you serve for 11 months.' },
  { term: 'LGI & ZI', definition: 'Local Government Inspector and Zonal Inspector — the key civil servants supervising your monthly clearance and welfare.' },
  { term: 'CDS', definition: 'Community Development Service — weekly or bi-weekly community project group attendance required for clearance.' },
  { term: 'POP', definition: 'Passing Out Parade — the grand final ceremonial graduation parade where corps members receive their NYSC Discharge Certificate.' },
  { term: 'Two-Two', definition: 'The drill command for marching in double files during parade training with the military drill instructors.' },
  { term: 'Book of Life', definition: 'The sacred official camp ledger where every corps member verifies their spelling and state code before swearing-in.' }
];

export const INITIAL_USER_FEEDBACK: UserFeedback[] = [
  {
    id: 'fb-001',
    user_id: 'usr-cor-2026-002',
    user_name: 'Fatima Aliyu',
    user_phone: '+234 802 334 1982',
    category: 'feature_request',
    message: 'Could we have an automated reminder push alert 24 hours before our weekly Thursday CDS attendance? That would prevent late arrivals!',
    status: 'pending',
    created_at: '2026-10-26T09:14:00Z'
  },
  {
    id: 'fb-002',
    user_id: 'usr-cor-2026-003',
    user_name: 'Kelechi Okafor',
    user_phone: '+234 813 445 6789',
    category: 'bug',
    message: 'On the Hub tab, when I updated my PPA pin on the map, it took about 3 seconds to re-center. A faster zoom snap would be super helpful.',
    status: 'resolved',
    created_at: '2026-10-24T14:32:00Z'
  },
  {
    id: 'fb-003',
    user_id: 'usr-cor-2026-004',
    user_name: 'Amina Bello',
    user_phone: '+234 809 112 3456',
    category: 'general',
    message: 'The SAED Learning Journal with PDF download is a lifesaver for our camp business plan assignment. Thank you to the developer team!',
    status: 'resolved',
    created_at: '2026-10-22T11:05:00Z'
  },
  {
    id: 'fb-004',
    user_id: 'usr-cor-2026-005',
    user_name: 'Babajide Ogundipe',
    user_phone: '+234 805 776 5432',
    category: 'feature_request',
    message: 'Please add a checklist for Corpers who want to process interstate relocation due to marriage or medical grounds.',
    status: 'pending',
    created_at: '2026-10-27T16:48:00Z'
  },
  {
    id: 'fb-005',
    user_id: 'usr-cor-2026-006',
    user_name: 'Ngozi Okonjo-Eze',
    user_phone: '+234 818 901 2345',
    category: 'bug',
    message: 'The safe daily spend calculator shows ₦0 when remaining balance is exactly 0. It should show a small warning tag "Budget Exhausted".',
    status: 'pending',
    created_at: '2026-10-28T04:20:00Z'
  }
];

export const INITIAL_WEBHOOK_CONFIG: WebhookConfig = {
  enabled: true,
  service: 'discord',
  url: 'https://discord.com/api/webhooks/1298402910283/nysc-companion-alerts',
  notify_on_bug: true,
  notify_on_feature: true,
  notify_on_general: false,
  last_triggered: '2026-10-28T04:20:05Z'
};

export const INITIAL_WEBHOOK_LOGS: WebhookLogItem[] = [
  {
    id: 'wh-log-1',
    event: 'user_feedback.inserted',
    service: 'Discord Webhook (#nysc-ops-alerts)',
    status: 'delivered',
    status_code: 200,
    payload_summary: 'Bug: "The safe daily spend calculator shows ₦0..." from Ngozi Okonjo-Eze',
    timestamp: '2026-10-28T04:20:05Z',
    latency_ms: 138
  },
  {
    id: 'wh-log-2',
    event: 'user_feedback.inserted',
    service: 'Discord Webhook (#nysc-ops-alerts)',
    status: 'delivered',
    status_code: 200,
    payload_summary: 'Feature: "Please add a checklist for Corpers who want to process..." from Babajide Ogundipe',
    timestamp: '2026-10-27T16:48:04Z',
    latency_ms: 164
  },
  {
    id: 'wh-log-3',
    event: 'test.ping',
    service: 'Discord Webhook (#nysc-ops-alerts)',
    status: 'delivered',
    status_code: 200,
    payload_summary: 'Manual Test Ping from Admin Control Panel',
    timestamp: '2026-10-27T12:00:00Z',
    latency_ms: 112
  }
];

