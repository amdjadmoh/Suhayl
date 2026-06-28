# Suhayl

A personal tool for tracking and comparing universities when applying to study abroad. Keeps everything in one place — deadlines, requirements, costs, application status — instead of a messy spreadsheet.

## What it does

- Add universities with details: program, tuition, ranking, language requirements, deadlines, visa info, required documents
- Track applications through stages: Wishlist → Preparing → Applied → Accepted/Rejected → Enrolled
- Compare up to 3 universities side by side
- Dashboard with stats, upcoming deadlines, and status breakdown

## Stack

Frontend: React 19, TypeScript, Tailwind CSS 4, shadcn/ui

Backend: Express 5, TypeScript, MongoDB (Mongoose), falls back to in-memory MongoDB if no local instance is running

## Running locally

```bash
# Install everything
npm run install:all

# Start both client and server
npm run dev
```

Client runs on `http://localhost:5173`, server on `http://localhost:5000`.

By default the server tries to connect to `mongodb://localhost:27017/wannaout`. If it can't reach MongoDB, it starts an in-memory instance automatically — no setup needed to try it out.

Set `MONGODB_URI` and `PORT` in a `.env` file if you want to use your own instance.
