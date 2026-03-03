# Eduflow - MERN Stack Learning Platform

## Prerequisites
- Node.js
- MongoDB (running locally or a cloud URI)

## Setup

### Backend
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (if not exists) with:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/eduflow
   JWT_SECRET=your_secret_key
   NODE_ENV=development
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Features
- **Authentication**: Register and Login (Student/Instructor).
- **Instructor**: Create and manage courses.
- **Student**: Browse, enroll, and track progress in courses.
- **Content**: Supports Text, Video (URL), and PDF (URL).

## API Endpoints
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course (Instructor only)
- `POST /api/courses/:id/enroll` - Enroll in course (Student only)
- `GET /api/progress/:courseId` - Get progress
