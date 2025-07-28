# HostelMate Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

## Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Update `.env` file with your MongoDB connection string
   - Set JWT secrets (generate strong random strings)
   - Configure email settings for notifications

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

## Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

   The frontend will start on `http://localhost:3000`

## Database Setup

The application will automatically:
- Create a default admin user
- Initialize 200 rooms with 4 beds each
- Set up all required collections

### Default Admin Credentials
- **Email:** admin@hostelmate.com
- **Password:** admin123

## API Endpoints Overview

### Public Routes (`/api/public`)
- `GET /home` - Home page information
- `GET /vision` - Vision and mission
- `GET /trustees` - Trustees and staff info
- `GET /contact` - Contact information
- `GET /rules` - Rules and regulations
- `GET /fees` - Fee structure
- `GET /facilities` - Facilities information

### Authentication Routes (`/api/auth`)
- `POST /register` - Student registration
- `POST /login` - User login
- `POST /refresh` - Refresh JWT token
- `GET /admission-status/:email` - Check admission status

### Admin Routes (`/api/admin`)
- `GET /dashboard` - Admin dashboard data
- `GET /admissions/pending` - Pending admissions
- `POST /admissions/:id/accept` - Accept admission
- `POST /admissions/:id/reject` - Reject admission
- `GET /students` - All students with filters
- `GET /menu/current` - Current week menu
- `POST /menu` - Update weekly menu
- `GET /leaves` - Leave applications
- `PATCH /leaves/:id/:action` - Approve/reject leave
- `GET /reports/attendance` - Attendance reports
- `GET /reports/absent-students` - Absent students
- `GET /reports/meal-count` - Meal count for preparation
- `GET /complaints` - All complaints
- `PATCH /complaints/:id` - Update complaint status

### Student Routes (`/api/student`)
- `GET /dashboard` - Student dashboard
- `GET /menu` - Weekly menu
- `POST /meals/book` - Book meals
- `DELETE /meals/cancel/:date/:type` - Cancel meal booking
- `GET /qr-code` - Generate QR code
- `POST /attendance/scan` - Mark attendance via QR
- `GET /attendance` - Attendance history
- `GET /leaves` - Leave applications
- `POST /leaves` - Apply for leave
- `DELETE /leaves/:id` - Cancel leave application
- `GET /complaints` - Student complaints
- `POST /complaints` - Submit complaint
- `GET /community` - Community posts
- `POST /community` - Create community post
- `POST /community/:id/vote` - Vote on post
- `POST /community/:id/comment` - Add comment

## Features Implemented

### ✅ Backend Complete
- **Authentication & Authorization** - JWT-based with role management
- **Database Models** - All 9 models with relationships
- **Admin Panel APIs** - Complete admission, menu, leave, complaint management
- **Student APIs** - Dashboard, QR attendance, meal booking, community forum
- **QR Code Service** - Generation and verification
- **Email Service** - Notifications for admissions, leaves, complaints
- **Room Management** - 200 rooms with 4 beds each (A,B,C,D)
- **Security** - Rate limiting, validation, error handling

### 🎯 Next Phase: Frontend Development
1. **Public Website** - Landing pages with hostel information
2. **Authentication Pages** - Login, registration, password reset
3. **Admin Dashboard** - Full admin interface
4. **Student Dashboard** - Student portal with all features
5. **QR Scanner** - Mobile-friendly QR code scanning
6. **Responsive Design** - Mobile-first approach

## Room Structure

- **Total Rooms:** 200 (numbered 1-200)
- **Beds per Room:** 4 (A, B, C, D)
- **Wings:** A (1-50), B (51-100), C (101-150), D (151-200)
- **Floors:** 20 rooms per floor (10 floors total)
- **Room Types:** 
  - Standard rooms: ₹5,000/month
  - AC rooms (every 10th room): ₹7,000/month

## Key Features

1. **Digital Admission Process** - Online applications with admin approval
2. **QR-based Attendance** - Dinner attendance and gate in/out tracking
3. **Meal Management** - Weekly menu updates and advance booking
4. **Leave Management** - Application, approval, and tracking system
5. **Complaint System** - Student complaints with admin responses
6. **Community Forum** - Discussion posts with voting and comments
7. **Real-time Reports** - Attendance, absent students, meal counts
8. **Email Notifications** - Automated emails for all major events

## Development Tips

1. **Environment Setup:**
   - Use strong JWT secrets in production
   - Configure proper email credentials
   - Set up MongoDB with proper indexes

2. **Testing:**
   - Use Postman for API testing
   - Test all authentication flows
   - Verify QR code generation and scanning

3. **Deployment:**
   - Use environment variables for configuration
   - Set up proper logging
   - Configure CORS for production domains

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting on API endpoints
- Input validation and sanitization
- Role-based access control
- Secure QR code generation with expiry

## Monitoring & Analytics

The system provides comprehensive dashboards for:
- Student admission statistics
- Room occupancy rates
- Meal consumption patterns
- Attendance tracking
- Leave application trends
- Complaint resolution metrics

---

Your HostelMate backend is now fully functional! The next step is to build the React frontend to interact with these APIs.
