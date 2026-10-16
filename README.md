# Eyelight Publishing Hub

Eyelight Publishing Hub is a modern, full-stack application built for a publishing agency to manage book catalogues, storefront sales, lead generation, CRM activities, and a flagship "Editor School" program.

## System Architecture

### Frontend (React / Vite)
- **Framework**: React with Vite
- **Styling**: Tailwind CSS, Shadcn UI
- **Animations**: Framer Motion
- **Key Pages**:
  - `Storefront.tsx`: Amazon-style e-commerce store pulling actual catalog books. Supports adding to cart and checking out.
  - `BookCatalogue.tsx`: Detailed catalog view of published works with outbound purchase links.
  - `EditorSchool.tsx`: Premium landing page for "The Book Editor Business School", featuring physics-based interactive carousels and complex lead capture forms.
  - `AdminCRM.tsx`: Internal CRM system for managing leads, deals, pipelines, and contacts.
  - `AdminLogin.tsx`: Secure entry point for admins to access the CRM.

### Backend (Node.js / Express)
- **Framework**: Express.js
- **Database**: MongoDB / Mongoose
- **API Features**:
  - Authentication (JWT based).
  - CRM Endpoints for contacts, leads, and newsletter subscriptions.
  - Book endpoints for fetching inventory.

## Current Integrations
- **Payment Processing (Paystack Live)**: Fully integrated with Paystack for end-to-end payments across Consultation Bookings (`/book`), Book Storefront Cart (`/cart`), Editor Business School tuition (`/editor-school`), and Author Portal invoices (`/portal`).
  - **Live Webhook URL**: `https://eyelight-publishing-hub.onrender.com/webhooks/paystack` (and `/payments/webhook`) with HMAC-SHA512 signature validation.
  - **Live Callback URL**: `https://eyelight-publishing-hub.vercel.app/payment/callback` with automatic server-side verification and context-aware success flows.
- **State Management**: Zustand and local React state.
- **Routing**: React Router DOM.
