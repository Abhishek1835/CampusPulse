# 🎓 CampusPulse: BMS College of Engineering (BMSCE) Event Platform

A production-grade, full-stack **MERN** (MongoDB, Express, React, Node.js) platform crafted for BMS College of Engineering, Bengaluru. Designed with modern **Glassmorphism**, smooth Framer Motion micro-interactions, responsive mobile navigation, and role-based access control.

---

## 🌟 Key Features

### 👤 Student Side
* **USN Identity & Auth:** Unique University Seat Number (VTU Standard format e.g. `1BM22CS045`), secure session via `httpOnly` cookie.
* **Explore & Filter Events:** Real-time debounced search, category filters, date picker, mode (offline/online/hybrid), pricing (free/paid), and availability status synced with URL query parameters.
* **One-Click Event Registration:** Pre-filled student credentials, dynamic team registration (team name + teammates' valid USNs), instant validation, and capacity locks.
* **My Registrations & Digital Pass:** Segmented into **Upcoming**, **Past**, and **Cancelled** events. Shows ticket stub, pass ID, and allows cancellation before deadline.
* **Club Directory:** Discover college clubs, explore their mission, faculty coordinators, upcoming events, and official social channels.
* **Profile Management:** Edit contact information, branch, and year of study while keeping USN read-only.

### 🛡️ Organizer Side (Club Planners)
* **Organizer Access Code:** Prevents unauthorized self-promotion with `ORGANIZER_ACCESS_CODE`.
* **Club Scoped Management:** Organizers manage only their assigned club's events and details.
* **Interactive Dashboard:** Recharts AreaChart (registrations over time), Category distribution donut chart, live metrics (total events, registrations, fill rate), and recent applicant lists.
* **Event Lifecycle Management:** Multi-section creator (Basics, Date & Venue, Registration Settings, Rules & Prizes, Contacts, Poster Upload). Duplicate, Publish/Unpublish, and Delete.
* **Participant Roster & Attendance:** Live count (`42 / 100 registered`), search & filter by branch or year, real-time attendance checkbox, participant removal, and **one-click CSV export**.
* **Club Branding:** Customise logo, banner, tagline, description, faculty coordinator details, and social channels.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS, Framer Motion, Axios, React Hot Toast, Lucide React, Recharts |
| **Backend** | Node.js, Express, Mongoose, JWT (`httpOnly` cookies), bcryptjs (12 salt rounds), Helmet, CORS, express-rate-limit, Multer |
| **Database** | MongoDB (Local / Atlas) with automatic in-memory fallback via `mongodb-memory-server` |
| **Architecture** | Monorepo structure with `/client`, `/server`, and root concurrent runner |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ or v20+ installed
- **MongoDB** (Optional: the server automatically falls back to an in-memory database if a local Mongo daemon is not running!)

### 2. Installation
Open your terminal in `college-event-platform/` (or the workspace root):

```bash
# Install root, server, and client dependencies
npm run install:all
```

### 3. Seed the Database
Populate 5 comprehensive clubs, 2 organizers, 5 students, 13 diverse events, and sample registrations:

```bash
npm run seed
```

### 4. Start Development Servers
Runs both the Express API (`http://localhost:5000`) and the Vite React Frontend (`http://localhost:5173`) concurrently:

```bash
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

## 🔑 Demo Credentials

| Role | Name | USN (Login ID) | Password | Associated Club / Info |
|---|---|---|---|---|
| **Organizer** | Aditya Sharma | `1BM22CS001` | `Password@123` | CodeForge (Technical) |
| **Organizer** | Meera Nair | `1BM22EC010` | `Password@123` | NrityaKala (Cultural) |
| **Student** | Rohan Gupta | `1BM22CS045` | `Password@123` | CSE, 3rd Year |
| **Student** | Ananya Iyer | `1BM22IS012` | `Password@123` | ISE, 2nd Year |
| **Student** | Karthik Rao | `1BM22EC033` | `Password@123` | ECE, 3rd Year |
| **Student** | Pooja Verma | `1BM23AI007` | `Password@123` | AIML, 1st Year |
| **Student** | Vikram Singh | `1BM21ME090` | `Password@123` | MECH, 4th Year |

> **Organizer Access Code for new signups:** `COLLEGE_ORG_2025`

---

## ⚙️ Environment Variables

A `.env.example` file is provided in the root and `server/`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/college_event_platform
JWT_SECRET=super_secret_jwt_college_events_key_2025_987654321
CLIENT_URL=http://localhost:5173
ORGANIZER_ACCESS_CODE=COLLEGE_ORG_2025
USE_MEMORY_DB=auto
```

---

## 📡 API Reference Overview

All API endpoints are prefixed with `/api`. Consistent response format: `{ success: true, message: "...", data: ... }`.

### Authentication & Users
- `POST /api/auth/register` - Student or Organizer registration (verifies USN regex, access code, creates/binds club)
- `POST /api/auth/login` - Login with USN + Password
- `POST /api/auth/logout` - Clear session cookie
- `GET /api/auth/me` - Restore session on refresh
- `GET /api/users/profile` - Current user profile
- `PUT /api/users/profile` - Update profile (USN is protected)

### Clubs
- `GET /api/clubs` - List all clubs with event counts and search/filter
- `GET /api/clubs/:slug` - Public club profile with upcoming and past events
- `POST /api/clubs` - Create new club (Organizer only)
- `PUT /api/clubs/:id` - Update club profile (Club organizer only)

### Events
- `GET /api/events` - Public event catalog with pagination, search, category, club, mode, fee, and availability filters
- `GET /api/events/:id` - Detailed event information, club card, seats status, user registration check
- `POST /api/events` - Create event (Organizer for own club)
- `PUT /api/events/:id` - Update event (Organizer for own club)
- `DELETE /api/events/:id` - Delete event & its registrations (Organizer for own club)
- `GET /api/events/organizer/mine` - Organizer's club events with attendance & registration metrics

### Registrations & Participants
- `POST /api/events/:id/register` - Student registration with capacity guard, deadline check, duplicate check, and team validation
- `DELETE /api/events/:id/register` - Cancel student registration before deadline
- `GET /api/registrations/mine` - Student's registrations (Upcoming, Past, Cancelled)
- `GET /api/events/:id/registrations` - Organizer view of participants with branch/year filters
- `PATCH /api/registrations/:id/attendance` - Toggle student attendance (Present / Registered)
- `DELETE /api/registrations/:id` - Remove participant from event
- `GET /api/events/:id/registrations/export` - Export event attendee list as downloadable CSV

### Analytics & Media
- `GET /api/organizer/stats` - Organizer metrics (events, registrations, fill rate, Recharts time-series, categories)
- `POST /api/upload` - Multer image uploader for posters and club crests

---

## 🎨 Glassmorphism & UX Highlights
- **Frosted Glass Cards:** Semi-translucent panels with `backdrop-filter: blur(16px)`, soft borders, and layered drop shadows.
- **Dynamic Gradient Mesh:** Background animated floating glowing orbs (indigo, violet, cyan, pink) that gently drift.
- **Theme Switcher:** Default Dark Mode with high-contrast Light Mode toggle (persisted in `localStorage`).
- **Mobile-First Responsive:** Bottom navigation bar on mobile for students, collapsible sidebar for organizers.
- **Accessibility:** WCAG AA compliant text contrast across both light and dark glass surfaces.
