# AmiFresh – Sakhi Sales Program (AI Context & Documentation)

> **To any AI Assistant reading this:** This document contains the core context, architectural decisions, and design guidelines for the AmiFresh Sakhi Sales Program project. **Always refer to these guidelines before suggesting code changes.**

---

## 1. Project Overview
**AmiFresh – Sakhi Sales Program** is a women-only, work-from-home direct sales and network marketing (MLM) platform. It serves as both an onboarding portal (Registration) and a comprehensive CRM Dashboard to track network growth, sales, orders, and commissions.

---

## 2. Tech Stack
- **Framework:** Next.js (App Router, v16.4.0) with React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v4) using global CSS variables (`app/globals.css`)
- **Database / ORM:** MongoDB with Mongoose
- **Authentication:** NextAuth.js (v4)
- **Forms & Validation:** React Hook Form + Zod
- **Icons:** Lucide React
- **Charts:** Recharts

---

## 3. Design & Theme Guidelines (CRITICAL)
The UI strictly follows a **Warm, Friendly, Fresh, and Trustworthy** aesthetic derived from the Sakhi campaign banner.

### 🚫 IMPORTANT RULE: NO DARK MODE
The user has **explicitly rejected Dark Mode**. The application must remain strictly locked to the Light Theme. Do not implement `dark:` variants in Tailwind classes unless explicitly requested by the user.

### Color Palette (Mapped in `app/globals.css`)
- **Page Background (`bg-bg`):** Warm Cream (`#FFF5E4`)
- **Primary Brand (`bg-primary`, `text-primary`):** Sakhi Green (`#0F8A3C`)
- **Primary Hover/Dark (`bg-primary-dark`):** Dark Green (`#0B6B2E`)
- **Primary Light/Active (`bg-primary-light`):** Soft Mint (`#E7F6EC`)
- **Accent/Highlight (`bg-accent`):** Sakhi Yellow/Orange (`#FDB94E`)
- **Surface/Cards (`bg-surface`):** Pure White (`#FFFFFF`)
- **Main Text (`text-text-main`):** Dark (`#111111`)
- **Muted Text (`text-text-muted`):** Gray (`#6B6B6B`)
- **Borders (`border-border`):** Light Gray (`#E5E5E5`)

### Typography
- **Headings & Bold Text:** `Poppins`
- **Body Text:** `Nunito`

### UI/UX Rules
- **Admin Panel Style:** Clean, modular CRM look. White sidebar, cream content background, well-spaced white cards.
- **Inputs:** White backgrounds with subtle borders. Mobile number inputs have `+91` overlaps fixed via padding adjustments (`!pl-[5.5rem]`).
- **Logos:** Use the light-theme logos (`/Amifresh logo Light theam.webp` and `/Sakhi Light.webp`).

---

## 4. Architecture & Directory Structure

### Frontend (`/app`)
- `/app/(auth)`: Public routes. Contains `/login` and `/register`. 
  - **Note on Registration:** It acts like a multi-step form and includes a custom **Camera integration** (`navigator.mediaDevices`) to capture Aadhaar/PAN photos directly from mobile/desktop.
- `/app/(dashboard)`: Protected CRM routes.
  - `/admin/*`: For `ROOT_ADMIN` (Network tree, User management, Orders, Commissions, Audit logs).
  - `/manager/*`: For `MANAGER` role (Team management, Sales).
  - `/member/*`: For `MEMBER` role (Personal network, Orders, Referrals).
- `/components/layout`: Core UI wrappers (`Sidebar.tsx`, `Header.tsx`, `GlobalSearch.tsx`, `DashboardLayout.tsx`).

### Backend (`/app/api` & `/models`)
- **API Routes:** Built using Next.js Route Handlers (`app/api/*`). Handles fetching trees, validating referrals, auth, and managing products/orders.
- **Database Models (`/models`):**
  - `User.ts`: Tracks roles, hierarchy (sponsor ID), and auth details.
  - `RegistrationRequest.ts`: Pending KYC/onboarding applications.
  - `Product.ts` & `Order.ts`: E-commerce catalog and transaction tracking.
  - `Commission.ts`: Payout ledgers for MLM hierarchy.
  - `ReferralHistory.ts`: Tracks the genealogy tree.
  - `AuditLog.ts`: Security and action tracking.
  - `Setting.ts`: Global platform configs.

---

## 5. Core Business Logic
1. **Role-Based Access Control (RBAC):** NextAuth session injects the user role. The UI (Sidebar) and API routes gatekeep access based on `ROOT_ADMIN`, `MANAGER`, or `MEMBER`.
2. **Network/Genealogy:** Users must register using a valid Referral/Sponsor ID. The system tracks this hierarchy to calculate commissions based on downline sales.
3. **Registration Flow:** Users submit a `RegistrationRequest` (including KYC photos). Admins/Managers review these requests before they are converted into active `User` accounts.

---

## 6. Prompting AI For Future Tasks
When continuing development on this project, ensure you:
1. Retain the exact color palette.
2. Build responsive, mobile-first designs (but optimize for landscape/desktop CRM usage).
3. Do not override global CSS variables unless expanding the theme.
4. Keep the UI "soft" (rounded corners `rounded-xl`, subtle shadows) to maintain the "Friendly/Trustworthy" Sakhi brand identity.
