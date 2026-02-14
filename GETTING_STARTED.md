# Getting Started Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (or Supabase account)
- Grok API key from https://x.ai

### 1. Backend Setup

```bash
cd server

# Install dependencies (already done)
npm install

# Configure environment
# Edit .env and add your DATABASE_URL and GROK_API_KEY

# Initialize database
npx prisma migrate dev --name init

# Seed sample data
npm run seed

# Start server
npm run dev
```

Server will run on **http://localhost:5000**

### 2. Frontend Setup

```bash
cd client

# Install dependencies (already done)
npm install

# Start development server
npm run dev
```

Frontend will run on **http://localhost:5173**

## 🔑 Demo Credentials

After seeding the database, use these credentials:

**Patient:**
- Email: `patient1@healthcare.com`
- Password: `Password@123`

**Doctor:**
- Email: `dr.sarah@healthcare.com`
- Password: `Password@123`

**Admin:**
- Email: `admin@healthcare.com`
- Password: `Password@123`

## 📝 Next Steps

1. **Configure Database**: Update `server/.env` with your PostgreSQL connection string
2. **Add Grok API Key**: Get your key from https://x.ai and add to `server/.env`
3. **Run Migrations**: `cd server && npx prisma migrate dev`
4. **Seed Data**: `cd server && npm run seed`
5. **Start Backend**: `cd server && npm run dev`
6. **Start Frontend**: `cd client && npm run dev`
7. **Login**: Visit http://localhost:5173 and use demo credentials

## 🎨 Key Features

### Patient Portal
- 📅 Book appointments with doctors
- 💊 View prescriptions with expiry tracking
- 🤖 AI Symptom Checker
- 💬 AI Health Chatbot

### Doctor Portal
- 📋 Manage appointments
- ✍️ Write prescriptions
- 👥 View patient details

### Admin Portal
- 👨‍⚕️ Verify doctors
- 👥 Manage users
- 📊 System overview

## ⚠️ Important Notes

- The AI features require a valid Grok API key
- Demo data includes 3 doctors, 2 patients, sample appointments, and prescriptions
- All passwords are hashed with bcryptjs
- JWT tokens expire in 7 days (configurable)
- Medical disclaimers are displayed for all AI features

## 🔧 Troubleshooting

**Database connection failed:**
- Check your DATABASE_URL in `server/.env`
- Ensure PostgreSQL is running

**Grok API errors:**
- Verify your GROK_API_KEY is valid
- Check API quota/limits

**CORS errors:**
- Ensure CLIENT_URL in `server/.env` matches your frontend URL
- Default is `http://localhost:5173`

## 📚 Technologies

**Backend:**
- Express.js, Prisma, PostgreSQL
- JWT authentication, bcryptjs
- Axios (Grok API), express-validator
- Helmet, CORS, rate limiting

**Frontend:**
- React 18, Vite
- TailwindCSS, Lucide icons
- Zustand (state), React Query
- React Router v7, React Hook Form
- Zod (validation), date-fns

Enjoy building with Smart Healthcare! 🏥✨
