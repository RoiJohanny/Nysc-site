# 🇳🇬 My NYSC Companion

> **The ultimate Progressive Web App (PWA) companion for Nigerian National Youth Service Corps (NYSC) members nationwide.**  
> Track monthly biometric clearances, manage your ₦77,000 federal allowance, secure call-up documents in an encrypted vault, log weekly CDS activities, study SAED vocational notes, explore corper lodging, and access 24/7 emergency inspectorate hotlines.

[![Live Web App](https://img.shields.io/badge/Live%20App-My%20NYSC%20Companion-008751?style=for-the-badge&logo=google-chrome&logoColor=white)](https://ais-pre-7usdlfqinfabki23iacm7i-226472253292.europe-west2.run.app)
[![React](https://img.shields.io/badge/React-19.0.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-purple?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

## 🌟 Key Features

### 🎓 1. Dynamic 4-Phase Service Progression
Seamlessly transition through the 4 stages of the National Service Year with specialized command centers:
- **PCM Phase (Prospective Corps Member):** Call-up letter printing, institutional clearance, green card validation, and pre-camp mobilization steps.
- **Camp Phase (21-Day Orientation):** Interactive 35-item packing checklist, camp rules, and authentic orientation vernacular glossary (e.g., *Mami Market*, *Otondo*, *White on White*).
- **Active Phase (Primary Assignment & CDS):** Biometric clearance reminders, PPA accomplishment logger with CV action verbs, and weekly CDS attendance tracking.
- **POP Phase (Passing Out Parade):** 4-step final clearance sign-offs, discharge certificate preparation, and automated CV export.

### 💰 2. ₦77,000 Alawee Financial Hub
- Automatic countdown to monthly payment alerts (around the 28th of every month).
- Inflow tracker for **₦77,000 Federal Alawee**, State Allowances, PPA stipends, and side hustles.
- Categorized expense budgeting (Food, Transport, Rent, CDS Dues, Data, Personal) with real-time net savings analytics.

### 🔒 3. Zero-Knowledge Encrypted Document Vault
- Store scans of **Call-Up Letters**, **Green Cards**, **PPA Acceptance Letters**, **NYSC IDs**, and **Medical Fitness Slips**.
- AES-256 encrypted storage simulation with one-click **Official NYSC PDF Export** incorporating official biometric barcodes and verification seals.
- Sensitive document deletions protected by explicit double-confirmation security dialogs.

### 📍 4. Interactive Geolocation Map & Transit Guide
- High-fidelity **Leaflet/OpenStreetMap** integration displaying exact coordinates for your Primary Place of Assignment (PPA) and CDS meeting locations.
- Commuter transit advice, fare estimates, vehicle types (Keke, Danfo, Okada, BRT), and turn-by-turn navigation across all 36 Nigerian States + FCT Abuja.

### 🛍️ 5. Corper Housing, Marketplace & SAED Journal
- **Housing Hub:** Discover NCCF Family Houses, MCAN Lodges, Catholic Lodges, private flats, and flatmate/roommate vacancies by State and LGA.
- **Marketplace:** Buy, sell, or pass down camp whites, mattresses, gas cylinders, and appliances with verified seller contact badges.
- **SAED Vocational Journal:** Rich notes and photo documentation across 8 SAED categories (ICT & Tech, Solar Installation, Fashion & Tailoring, Agro-Allied, etc.).

### 🚨 6. Emergency SOS & State Inspectorate Directory
- Instant 1-tap SOS trigger with offline caching for emergency situations.
- Directory of State Coordinators, Local Government Inspectors (LGI), Zonal Inspectors (ZI), and NYSC Emergency Helplines across all 36 states + FCT.
- Client-side rate-limiting cooldown prevents alert spamming.

---

## 🛡️ Cybersecurity & AppSec Fortification

This application has been fortified against the **OWASP Top 10** vulnerabilities:
1. **Non-Recursive Row-Level Security (RLS):** Supabase policies with `SECURITY DEFINER` function `public.is_admin()` using `SET search_path = public` to prevent infinite recursion loops.
2. **IDOR Prevention:** All user-generated mutations strictly validate `auth.uid() = user_id`.
3. **Frontend Input Sanitization:** DOMPurify sanitization strips inline scripts, event handlers, and dangerous HTML across all marketplace listings and notes.
4. **Login Anti-Automation & Lockout:** 
   - 3 consecutive failed password attempts trigger a **3-minute (180s) cooldown block** with live countdown timer.
   - 5 total failed attempts permanently lock the form, requiring an email reset via **Supabase Auth (`resetPasswordForEmail`)**.
5. **Secure External Webviews:** NYSC Portal integration strictly validates origin against `*.nysc.org.ng` with hardened sandbox isolation.

---

## 💻 Tech Stack

- **Frontend:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite 8](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Maps & Geolocation:** [Leaflet](https://leafletjs.com/) + `@types/leaflet`
- **PDF Generation:** [jsPDF](https://github.com/parallax/jsPDF)
- **Validation:** [Zod v4](https://zod.dev/) + [DOMPurify](https://github.com/cure53/DOMPurify)
- **Database & Auth:** [Supabase](https://supabase.com/) & [Firebase](https://firebase.google.com/)
- **PWA Capabilities:** [Vite Plugin PWA](https://vite-pwa-org.netlify.app/) (Service Worker offline support & manifest)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or bun

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/my-nysc-companion.git
   cd my-nysc-companion
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file from the provided example:
   ```bash
   cp .env.example .env
   ```
   Add your optional Supabase/Firebase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
   *(Note: The app includes full local offline fallback functionality if credentials are not configured)*.

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 📱 Progressive Web App (PWA) Installation

Install **My NYSC Companion** directly onto your home screen for native-app performance and offline access:
- **Android (Chrome):** Tap the three dots menu `⋮` -> Select **"Install app"** or **"Add to Home screen"**.
- **iOS (Safari):** Tap the Share icon `⎙` -> Scroll down and select **"Add to Home Screen"**.
- **Windows / Mac (Chrome / Edge):** Click the **Install icon** on the right side of the address bar.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  <strong>Dedicated to the welfare, safety, and empowerment of Nigerian Corps Members nationwide 🇳🇬</strong><br>
  <em>Under the sun or in the rain, with dedication and selfless service.</em>
</p>
