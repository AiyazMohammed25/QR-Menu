# 🍽️ Digital QR Menu & Restaurant SaaS

A modern, serverless Full-Stack web application designed to replace paper menus with a dynamic, self-ordering QR system. Built exclusively for cloud deployment to scale automatically with restaurant traffic.

## 🌐 Live Application (Vercel)
* **Customer QR Menu:** `https://[TERA-VERCEL-LINK].vercel.app`
* **Admin Dashboard:** `https://[TERA-VERCEL-LINK].vercel.app/admin`

*(Note: Replace the links above once deployed on Vercel)*

## 🚀 Key Features

### For Customers (Frontend)
*   **Mobile-First Design:** Sleek, dark-themed UI optimized for smartphone scanning and fast browsing.
*   **Visual Menu:** High-quality dish thumbnails powered by ImageKit CDN for instant loading.
*   **Smart Cart System:** Add/remove items, adjust quantities, and calculate totals dynamically.
*   **Table-based Ordering:** Direct order placement with table number assignment without app installation.

### For Owners (Secure Admin Dashboard)
*   **Role-Based Security:** Password-protected dashboard using API middleware authentication.
*   **Live Order Tracking:** Real-time Kanban-style order management (Pending ➔ Preparing ➔ Completed).
*   **Full CRUD Menu Management:** Add new dishes, upload images, update prices, and toggle "Out of Stock" status instantly.
*   **Daily Analytics:** Automated tracking of daily order volume and total revenue calculation.

## 💻 Tech Stack & Architecture

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Database:** MongoDB Atlas (Cloud)
*   **Image Storage:** ImageKit (Base64 to CDN)
*   **Hosting:** Vercel (Serverless Edge Functions)

## ☁️ Deployment Strategy

This application is engineered for **Zero-Maintenance Serverless Deployment** via Vercel:
1. **Frontend & APIs:** Hosted on Vercel's Edge Network for global low-latency access.
2. **Security:** Passwords and API keys are strictly managed via Vercel Environment Variables (`.env`).
3. **Database Connection:** Cached MongoDB connections optimized for serverless environments to prevent connection limits.
4. **Scalability:** Automatically scales from 0 to thousands of concurrent requests without manual server configuration.