# Haus of Von / Von Beauty - Bespoke Beauty Experience

A high-end, luxury portfolio and booking application for professional makeup artists and beauty studios. 

Built with a **Serverless Firebase Architecture (Firestore + Auth + Storage)** paired with **React & Vite**. 
---

## ✨ Features

- **Luxury Editorial UI/UX**: Designed with Tailwind CSS and smooth Framer Motion transitions.
- **Demographic & Gender Categorization**: Portfolio supports **Female / Women**, **Male / Men**, and **Gender-Inclusive / LGBTQ+ / Queer** filters.
- **Dynamic Makeup Categories**: The Admin can create new custom categories (e.g. *Airbrush Makeup*, *Debut Look*, *Editorial Runway*) directly from the dashboard, which dynamically sync with the portfolio and booking dropdown.
- **Dashboard-Exclusive Media Management**: All uploads, categorization, visibility toggles, and deletions are protected inside the private Admin Dashboard.
- **Studio SOP & Global Guidelines**: An international-grade Standard Operating Procedure (SOP) modal detailing booking retainer terms, skin prep protocols, sanitation, and destination travel policies.
- **Real-Time Client Bookings**: Direct booking requests stored in Cloud Firestore with instant status management.
- **Client Testimonial Moderation**: Public reviews submitted to Firestore and moderated via Admin Dashboard.
- **Admin Dashboard**: Analytics, booking management, review approvals, category manager, and gallery controls.
- **Discreet Admin Access**: Public navigation is clean and client-focused. The admin logs in securely by visiting `/admin` via Google Authentication (`jacotradesdevs@gmail.com`).

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Recharts
- **Database & Backend**: Firebase Firestore (Real-Time Cloud NoSQL)
- **Authentication**: Firebase Auth (Google Sign-In)
- **Media Storage**: Firebase Cloud Storage
- **Hosting Compatibility**: Vercel, Netlify, Cloudflare Pages, or Firebase Hosting (100% Free Tiers)

---

## 💻 Local Development

1. I-install ang dependencies:
   ```bash
   npm install
   ```

2. Simulan ang dev server:
   ```bash
   npm run dev
   ```

3. Buksan ang browser sa `http://localhost:3000`.
