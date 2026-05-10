# Project Mayeso

Project Mayeso is a production-grade Primary School Management & Results Grading Automation System built specifically for primary schools in Malawi.

## Features
- Complete School Management (Zones, Schools, Levels, Classes, Subjects)
- Role-based Access Control (Admin, Head Teacher, Teacher)
- Automated Results & Grading Automation (30/70 split)
- PDF Report Generation

## Stack
- **Frontend**: Next.js 14, Tailwind CSS, shadcn/ui, Zustand
- **Backend**: Node.js, Express, Prisma, PostgreSQL
- **DevOps**: Docker, GitHub Actions

## Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Supabase account (optional, can use local DB)

## Setup Instructions

1. **Clone the repository**

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Ensure database is running
   npx prisma migrate dev
   npx prisma db seed
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.local.example .env.local
   npm run dev
   ```

4. **Running Local Database (Optional)**
   ```bash
   docker-compose up -d
   ```

## Default Credentials
- Admin: admin@mayeso.mw / Admin1234
- Head Teacher: head@mayeso.mw / Head1234
- Teacher: teacher@mayeso.mw / Teacher1234
