# ALT-S Presales Command Center

## Executive Summary

The ALT-S Presales Command Center is an enterprise-grade, comprehensive web application designed to streamline the end-to-end presales lifecycle. Engineered for performance, security, and scalability, the Command Center aggregates critical presales operations into a single pane of glass, accelerating deal velocity, enhancing pipeline visibility, and standardizing bid management processes across the organization.

## Architecture & Technology Stack

The application leverages a modern, highly decoupled microservices architecture designed to scale seamlessly under enterprise workloads.

### Presentation Layer (Frontend)
- **Framework**: React 18 / Vite
- **Styling**: Tailwind CSS, PostCSS, Custom Design Tokens
- **Routing**: React Router DOM (Client-side dynamic routing)
- **Data Visualization**: Chart.js for responsive analytics dashboards
- **State Management**: React Hooks (Context API & Component-level state)

### Data Layer (Backend)
- **Database**: PostgreSQL (Relational schema designed for multi-tenant scalability)
- **ORM / Client**: Prisma / Supabase DB Client
- **Authentication**: Secure JWT-based session architecture with strict UI route guards

### Core Modules
1. **Pipeline Dashboard**: Aggregated view of total ARR, weighted pipeline, and actionable KPIs.
2. **Opportunity Management**: High-fidelity data tables with horizontal scaling, advanced filtering, and CSV export capabilities.
3. **Account & Contact Management**: Centralized repository for CRM-style entity mapping.
4. **Bid Management**: Real-time RFP/RFQ tracking, deadlines, and RAG status monitoring.
5. **Task Management**: Kanban-style operational tracking.

---

## Technical Implementation Details

### Responsive Design
The Command Center is fully responsive. It employs intelligent grid adjustments and horizontal scroll wrappers to ensure data-heavy tables do not compromise the viewport integrity on mobile devices. The navigation framework features a responsive side-drawer architecture for mobile accessibility.

### Authentication Flow
Access to the application is restricted via a secure, animated authentication gateway. 
- **Corporate Login**: `admin@alt-s.com`
- **Password**: `admin`

*Note: Unauthorized access attempts are actively rejected by the presentation layer's Route Guard.*

### Setup and Deployment

**Prerequisites**
- Node.js (v18.x or greater recommended)
- NPM or Yarn package manager
- PostgreSQL instance (for backend connectivity)

**Local Initialization**
1. Clone the repository to your local environment.
2. Navigate to the root directory and execute dependency installation:
   ```bash
   npm install
   ```
3. Initialize the development server:
   ```bash
   npm run dev
   ```
4. Access the application at `http://localhost:5173`.

---

## Code Quality & Standards

This repository adheres to stringent enterprise coding standards:
- Strict TypeScript compilation to guarantee type safety across the frontend and data packages.
- Modular component design to ensure maintainability and high reusability.
- No direct DOM manipulation; strictly React-driven declarative state management.

## Licensing and Compliance

Copyright © ALT-S Corporation. All rights reserved. 
This software and associated documentation files are proprietary and confidential. Unauthorized copying, distribution, or reproduction via any medium is strictly prohibited.
