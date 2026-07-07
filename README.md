# GradLink

GradLink is a full-stack job portal application that connects job seekers, recruiters, and admins. It includes features such as user authentication, job posting, applications, CV upload, and notifications.

## Project Overview

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB
- Authentication: JWT
- File handling: Multer + PDF parsing for CV uploads

## Project Structure

- client/ - React frontend
- server/ - Express backend API
- server/uploads/ - Uploaded CVs and profile images

## Prerequisites

Make sure you have the following installed:

- Node.js (v18 or newer recommended)
- npm
- MongoDB instance or MongoDB Atlas connection string

## Backend Setup

1. Open the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a .env file in the server folder with the following values:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   CLIENT_URL=http://localhost:5173
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

The API will be available at:
- http://localhost:5000/api/health

## Frontend Setup

1. Open the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at:
- http://localhost:5173

## Main Features

- User registration and login
- Role-based dashboards for job seekers and recruiters
- Job posting and job browsing
- CV upload and analysis
- Application tracking
- Notifications

## Useful Commands

### Server
```bash
cd server
npm run dev
npm start
```

### Client
```bash
cd client
npm run dev
npm run build
```

## Notes

- Ensure your MongoDB server is running before starting the backend.
- The backend serves uploaded files from the uploads folder.
- For production deployment, set proper environment variables and secure your JWT secret.
