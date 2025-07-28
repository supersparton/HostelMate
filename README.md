# HostelMate

A comprehensive hostel management application built with React frontend and Node.js backend.

## Project Structure

```
HostelMate/
├── backend/           # Node.js backend server
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # Data models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   ├── services/      # Business logic
│   │   └── index.js       # Main server file
│   ├── .env              # Backend environment variables
│   ├── package.json      # Backend dependencies
│   └── README.md         # Backend documentation
│
├── frontend/          # React frontend application
│   ├── public/           # Static files
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context
│   │   ├── services/     # API calls
│   │   ├── routes/       # Routing logic
│   │   └── App.js        # Main App component
│   ├── .env             # Frontend environment variables
│   ├── package.json     # Frontend dependencies
│   └── tailwind.config.js # Tailwind CSS configuration
│
├── README.md          # Main project documentation
└── .gitignore         # Git ignore rules
```

## Getting Started

### Backend
1. Navigate to backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

### Frontend
1. Navigate to frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start development server: `npm start`

## Features

- User authentication and authorization
- Hostel room management
- Student registration and management
- Mess and food management
- Complaint management system
- Payment tracking
- Admin dashboard

## Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (to be configured)
- **Authentication**: JWT (to be implemented)
