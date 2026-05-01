# Smart Traffic Violation Management System

A full-stack MERN application for managing traffic violations, complete with automated fine calculation, repeat offender detection, role-based access control, mock payment integration, and a data-driven analytics dashboard.

## Tech Stack
**Frontend:** React, Vite, Tailwind CSS, React Router, Recharts, Framer Motion, Lucide React
**Backend:** Node.js, Express.js, MongoDB (Atlas), JWT, Bcrypt

## Features
- **JWT-based Authentication**: Secure login and signup with role-based access (Admin, Police, User).
- **Violation Management**: Add, update, view, and delete violations.
- **Auto Fine Calculation**: Dynamic fine amounts based on the violation type.
- **Repeat Offender Detection**: Automatically flag users with >3 violations.
- **Analytics Dashboard**: Interactive charts showing total revenue, trends, and violation breakdown.
- **Mock Payment UI**: Secure mock payment gateway to clear fines.
- **Responsive UI**: Fully responsive with dark mode and glassmorphism design.

## Setup Instructions

### 1. Backend Setup
1. Open the terminal and navigate to the `server` directory.
2. Run `npm install` to install dependencies.
3. Configure the environment variables:
   - Rename `.env.example` to `.env` (or create one).
   - Add your `MONGO_URI` and `JWT_SECRET`.
4. Run `npm run dev` to start the backend server on `http://localhost:5000`.

### 2. Frontend Setup
1. Open a new terminal and navigate to the `client` directory.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the Vite development server.
4. The application will be accessible at `http://localhost:5173`.

## Deployment Guide

### Vercel (Frontend)
1. Push your code to GitHub.
2. Log in to Vercel and import the repository.
3. Set the Root Directory to `client`.
4. Ensure the Framework Preset is `Vite`.
5. Add an environment variable `VITE_API_URL` pointing to your deployed backend.
6. Deploy!

### Render (Backend)
1. Log in to Render and create a new Web Service.
2. Connect your GitHub repository.
3. Set the Root Directory to `server`.
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add environment variables (`MONGO_URI`, `JWT_SECRET`).
7. Deploy!
