# Smart Healthcare System

A complete, production-ready web-based healthcare platform with AI-powered features.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + Vite + TailwindCSS |
| **Backend** | Express.js + Node.js |
| **Database** | PostgreSQL (Supabase) + Prisma ORM |
| **AI/ML** | Groq API |
| **Authentication** | JWT + bcryptjs |
| **State Management** | Zustand + React Query |

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (for PostgreSQL database)
- Groq API key from xAI
- Git

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd smart-healthcare
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `.env` file in `/server`:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_EXPIRES_IN=7d

# Groq AI
GROQ_API_KEY=your_grok_api_key_here
GROQ_API_URL=https://api.x.ai/v1

# Server
PORT=5000
CLIENT_URL=http://localhost:5173

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run Prisma migrations:

```bash
npx prisma generate

```

Start the backend:

```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd client
npm install
```

Create `.env` file in `/client`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🔑 Default Credentials (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@healthcare.com | Admin@123 |
| **Doctor** | dr.sarah@healthcare.com | Doctor@123 |
| **Doctor** | dr.john@healthcare.com | Doctor@123 |
| **Doctor** | dr.smith@healthcare.com | Doctor@123 |
| **Patient** | patient1@healthcare.com | Patient@123 |
| **Patient** | patient2@healthcare.com | Patient@123 |

> ⚠️ **IMPORTANT**: Change these passwords before deploying to production!

## 📚 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| GET | `/me` | Get current user | Yes |

### Users (`/api/users`)
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/profile` | Get own profile | Yes | All |
| PUT | `/profile` | Update own profile | Yes | All |
| GET | `/all` | Get all users | Yes | Admin |
| DELETE | `/:id` | Delete user | Yes | Admin |

### Doctors (`/api/doctors`)
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/` | List all doctors | No | All |
| GET | `/:id` | Get doctor details | No | All |
| PUT | `/availability` | Update availability | Yes | Doctor |
| PUT | `/:id/verify` | Verify doctor | Yes | Admin |

### Appointments (`/api/appointments`)
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/` | Book appointment | Yes | Patient |
| GET | `/my` | Get my appointments | Yes | Patient/Doctor |
| PUT | `/:id/status` | Update status | Yes | Patient/Doctor |
| GET | `/` | Get all appointments | Yes | Admin |

### Prescriptions (`/api/prescriptions`)
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/` | Create prescription | Yes | Doctor |
| GET | `/my` | Get my prescriptions | Yes | Patient |
| PUT | `/:id` | Update prescription | Yes | Doctor |
| DELETE | `/:id` | Delete prescription | Yes | Doctor |

### AI Features (`/api/ai`)
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/predict-disease` | Predict disease from symptoms | Yes | Patient |
| POST | `/chat` | Chat with AI bot | Yes | Patient |
| POST | `/analyze` | Analyze symptoms (free text) | Yes | Patient |
| GET | `/history` | Get symptom log history | Yes | Patient |
| GET | `/chat/:sessionId` | Get chat session | Yes | Patient |

## 🗂️ Project Structure

```
smart-healthcare/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route pages
│   │   ├── services/      # API services
│   │   ├── store/         # Zustand stores
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── .env
│
├── server/                # Backend (Express.js)
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Custom middleware
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Utilities
│   │   └── index.js      # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma # Database schema
│   │   └── seed.js       # Seed data
│   ├── package.json
│   └── .env
│
└── README.md
```

## 🔒 Security Features

- ✅ Password hashing with bcryptjs (12 salt rounds)
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Helmet.js security headers
- ✅ CORS protection
- ✅ Rate limiting (100 req/15min general, 10 req/15min auth)
- ✅ Input validation (express-validator + Zod)

## 🤖 AI Features & Safety

### Disease Prediction
- Predicts potential diseases from symptoms
- Returns confidence score (capped at realistic ranges)
- Recommends appropriate medical specialty
- **Always includes medical disclaimer**

### Medical Chatbot
- Conversational AI for health queries
- Maintains session history
- Provides wellness advice
- **Never provides definitive diagnoses**
- **Never prescribes medication**

### Symptom Analysis
- Free-text symptom analysis
- Extracts key symptoms
- Identifies body systems
- Suggests specialists

> 🚨 **MEDICAL DISCLAIMER**: All AI features include prominent disclaimers. The AI NEVER provides definitive diagnoses, treatment plans, or medication advice. Users are ALWAYS directed to consult licensed medical professionals.

## 🎨 Design System

| Element | Style |
|---------|-------|
| **Primary Color** | Indigo 600 |
| **Secondary Color** | Teal 500 |
| **Background** | Slate 50 |
| **Danger** | Red 500 |
| **Success** | Green 500 |
| **Warning** | Amber 500 |

## 📱 Responsive Design

- ✅ Mobile-first approach
- ✅ Breakpoints: sm (640px), md (768px), lg (1024px+)
- ✅ Tested on mobile, tablet, and desktop


## 📝 Environment Variables

### Backend (`/server/.env`)
```env
DATABASE_URL=           # PostgreSQL connection string
JWT_SECRET=            # JWT signing secret (min 32 chars)
JWT_EXPIRES_IN=        # Token expiry (e.g., "7d")
GROK_API_KEY=          # xAI Grok API key
GROK_API_URL=          # Grok API endpoint
PORT=                  # Server port (default: 5000)
CLIENT_URL=            # Frontend URL for CORS
SUPABASE_URL=          # Supabase project URL (optional)
SUPABASE_ANON_KEY=     # Supabase anon key (optional)
```

### Frontend (`/client/.env`)
```env
VITE_API_URL=          # Backend API URL (e.g., http://localhost:5000/api)
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL format
- Check Supabase project is active
- Ensure IP is whitelisted in Supabase

### Prisma Migration Errors
```bash
npx prisma generate
npx prisma migrate reset --force
npx prisma migrate dev
```

### CORS Errors
- Verify CLIENT_URL in backend .env matches frontend URL
- Check VITE_API_URL in frontend .env is correct

### AI Features Not Working
- Verify GROK_API_KEY is valid
- Check API quota/billing status
- Review backend logs for API errors

## 📄 License

MIT

## 👥 Contributors

Your Team

---

**Built with ❤️ for better healthcare access**
