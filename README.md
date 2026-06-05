# MicroIntern

A micro-internship marketplace where students and professionals can post small tasks, apply with their skills, and build real experience through collaboration.

Built to solve a real problem — most internships require experience, but you need internships to get experience. Micro-internships break that cycle.

**Live demo:** [micro-intern-gamma.vercel.app](https://micro-intern-gamma.vercel.app/)

---

## What it does

- Post tasks with required skills, duration, and compensation
- Browse and search tasks by category or keyword with pagination
- AI-powered skill gap analyzer — see your match percentage before applying
- AI generates a personalized cover note based on your skills and the task
- Dashboard to manage posted tasks and track applications
- Task owners can accept or reject applicants with feedback

---

## Tech stack

- **Frontend** — Next.js 14, React, Tailwind CSS
- **Backend** — Node.js, Express.js
- **Database** — MongoDB Atlas
- **Auth** — JWT with bcrypt password hashing
- **AI** — Anthropic Claude API (claude-3-haiku)
- **Security** — Rate limiting via express-rate-limit, input validation via express-validator

---

## Architecture

Next.js (Vercel) → Express REST API → MongoDB Atlas → Anthropic Claude API

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/signup | No | Register user |
| POST | /api/auth/login | No | Login user |
| GET | /api/tasks | No | Get paginated tasks |
| POST | /api/tasks | Yes | Create task |
| GET | /api/tasks/:id | No | Get task detail |
| POST | /api/applications | Yes | Apply to task |
| POST | /api/ai/generate-cover-note | Yes | Generate cover note |
| POST | /api/ai/analyze-skill-gap | Yes | Analyze skill match |

---

## What I'd add with more time

- Email notifications when someone applies (Nodemailer or Resend)
- Rating system after task completion
- Redis-based rate limiting for multi-server deployments
- WebSocket notifications for real-time application updates