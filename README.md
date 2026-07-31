<div align="center">

  <img src="./apps/web/public/logo.png" alt="ALT-S Logo" width="120" />

  # ALT-S Presales Command Center

  **Enterprise-Grade Lifecycle Management for Presales & Bid Operations**

  [![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  
  <br />

  *[Read the Documentation](./docs/USER_GUIDE.md) · [Report Bug](#) · [Request Feature](#)*
  
</div>

---

## Executive Summary

The **ALT-S Presales Command Center** is a state-of-the-art, high-performance web application engineered to consolidate and automate the entire presales pipeline. Built for enterprise scale, it aggregates critical operations—from pipeline visualization and deal tracking to RFx bid management—into a single, highly secure pane of glass.

<br />

<div align="center">
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Vite-Dark.svg" width="40" hspace="10"/>
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/React-Dark.svg" width="40" hspace="10"/>
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TailwindCSS-Dark.svg" width="40" hspace="10"/>
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/PostgreSQL-Dark.svg" width="40" hspace="10"/>
</div>

<br />

## System Architecture

Our highly decoupled microservices architecture ensures seamless scalability under heavy enterprise workloads. Below is the data-flow and infrastructure blueprint:

```mermaid
graph TD
    %% Styling
    classDef client fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#fff
    classDef auth fill:#312e81,stroke:#818cf8,stroke-width:2px,color:#fff
    classDef api fill:#1e1b4b,stroke:#a78bfa,stroke-width:2px,color:#fff
    classDef db fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#fff
    
    subgraph ClientTier [Client Tier]
        UI[React 18 SPA]:::client
        State[React Context / State]:::client
        Visuals[Chart.js & Tailwind]:::client
        UI --> State
        State --> Visuals
    end

    subgraph SecurityLayer [Security Layer]
        Guard[Auth Guard Gateway]:::auth
        JWT[Session Tokens]:::auth
        Guard --> JWT
    end

    subgraph DataAccess [Data Access Layer]
        REST[Mock API Controllers]:::api
        BLL[Business Logic Layer]:::api
        Export[CSV Export Engine]:::api
        REST --> BLL
        BLL --> Export
    end

    subgraph PersistenceLayer [Persistence Layer]
        DB[(PostgreSQL Database)]:::db
        Schema[Relational Schema]:::db
        DB --- Schema
    end

    %% Connections
    UI -- "HTTPS Requests" --> Guard
    Guard -- "Authenticated" --> REST
    BLL -- "SQL Queries" --> DB
```

---

## Core Capabilities

> **Intelligent Dashboarding**  
> Aggregated view of Total ARR, Weighted Pipeline calculations, and actionable KPIs driven by real-time analytics.

> **Advanced Opportunity Management**  
> High-fidelity, horizontally scaling data grids with complex stage tracking (RFP/RFI Management to Closed Won/Lost), integrated search, and raw CSV exports.

> **Entity Centralization**  
> Unified repository for Account hierarchy mapping and Contact intelligence, preventing CRM data silos.

> **Zero-Trust Security Gateway**  
> Fully animated, premium authentication flow that forcefully intercepts unauthorized routing attempts.

---

## Technical Implementation Details

### Responsive & Fluid UI
Engineered with a **mobile-first methodology**. Complex data tables utilize intelligent scroll-wrappers and flex-box shrink constraints to maintain viewport integrity on smaller devices, while side navigation transforms into a buttery-smooth slide drawer.

### Premium Micro-Interactions
The UI is heavily populated with micro-animations—from the glassmorphism login fade to glowing active inputs and pulse-indicators—ensuring a SaaS-grade tactile feel that boosts user engagement.

---

## Quick Start

### Prerequisites
- **Node.js** (v18.x LTS or higher)
- **NPM** or **Yarn**

### Initialization

1. **Clone the Repository**
   ```bash
   git clone https://github.com/VaishalMalu/ALT-S-Presales-Command-Center.git
   cd ALT-S-Presales-Command-Center
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Ignite the Development Server**
   ```bash
   npm run dev
   ```

4. **Authenticate**
   Access `http://localhost:5173` and authenticate using the corporate credentials:
   - **ID**: `admin@alt-s.com`
   - **Password**: `admin`

---

## Enterprise Compliance

**Copyright © 2026 ALT-S Corporation. All rights reserved.**

This software repository and its associated documentation files are proprietary, confidential, and classified as trade secrets. Unauthorized duplication, reverse engineering, distribution, or reproduction via any medium is strictly prohibited and subject to legal prosecution.
