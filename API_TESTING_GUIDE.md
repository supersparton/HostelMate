# HostelMate API Testing Guide

## Quick Start

1. **Start the server:**
   ```bash
   cd backend
   node src/index.js
   ```

2. **Check server health:**
   ```
   GET http://localhost:5000/api/health
   ```

## API Testing with cURL Commands

### 1. Health Check
```bash
curl -X GET http://localhost:5000/api/health
```

### 2. Public Endpoints (No authentication required)

**Get Home Information:**
```bash
curl -X GET http://localhost:5000/api/public/home
```

**Get Vision & Mission:**
```bash
curl -X GET http://localhost:5000/api/public/vision
```

**Get Contact Information:**
```bash
curl -X GET http://localhost:5000/api/public/contact
```

**Get Rules & Regulations:**
```bash
curl -X GET http://localhost:5000/api/public/rules
```

**Get Fee Structure:**
```bash
curl -X GET http://localhost:5000/api/public/fees
```

### 3. Authentication Endpoints

**Student Registration:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "9876543210",
    "password": "SecurePass123",
    "caste": "General",
    "religion": "Hindu",
    "income": 50000,
    "parentName": "Jane Doe",
    "parentPhone": "9876543211",
    "course": "Computer Science",
    "year": 2,
    "rollNumber": "CS2023001",
    "address": {
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "phone": "9876543212",
      "relation": "Uncle"
    }
  }'
```

**Admin Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hostelmate.com",
    "password": "admin123"
  }'
```

**Student Login (after registration approval):**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123"
  }'
```

### 4. Admin Endpoints (Requires admin token)

**Get Pending Admissions:**
```bash
curl -X GET http://localhost:5000/api/admin/admissions/pending \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Accept Student Admission:**
```bash
curl -X POST http://localhost:5000/api/admin/admissions/STUDENT_ID/accept \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roomNumber": "101",
    "bedLetter": "A"
  }'
```

**Get Admin Dashboard:**
```bash
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Update Weekly Menu:**
```bash
curl -X POST http://localhost:5000/api/admin/menu \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "weekStartDate": "2025-07-26",
    "menuItems": {
      "monday": {
        "breakfast": "Poha, Tea",
        "lunch": "Dal Rice, Sabzi, Roti",
        "dinner": "Rajma Rice, Salad"
      },
      "tuesday": {
        "breakfast": "Upma, Coffee",
        "lunch": "Chole Rice, Roti, Pickle",
        "dinner": "Paneer Curry, Rice, Roti"
      }
    }
  }'
```

### 5. Student Endpoints (Requires student token)

**Get Student Dashboard:**
```bash
curl -X GET http://localhost:5000/api/student/dashboard \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

**Get Weekly Menu:**
```bash
curl -X GET http://localhost:5000/api/student/menu \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

**Book Meals:**
```bash
curl -X POST http://localhost:5000/api/student/meals/book \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-07-27",
    "meals": ["breakfast", "lunch", "dinner"]
  }'
```

**Generate QR Code:**
```bash
curl -X GET http://localhost:5000/api/student/qr-code \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

**Mark Attendance (QR Scan):**
```bash
curl -X POST http://localhost:5000/api/student/attendance/scan \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "DINNER",
    "location": "MESS_HALL"
  }'
```

**Apply for Leave:**
```bash
curl -X POST http://localhost:5000/api/student/leaves \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fromDate": "2025-08-01",
    "toDate": "2025-08-03",
    "reason": "Family function",
    "emergencyContact": {
      "name": "Parent",
      "phone": "9876543211",
      "relation": "Father"
    }
  }'
```

**Submit Complaint:**
```bash
curl -X POST http://localhost:5000/api/student/complaints \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AC not working",
    "description": "The air conditioner in room 101 is not working properly",
    "category": "MAINTENANCE",
    "priority": "MEDIUM"
  }'
```

**Create Community Post:**
```bash
curl -X POST http://localhost:5000/api/student/community \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Improve WiFi Speed",
    "description": "The WiFi in the hostel is very slow. We need better internet connectivity.",
    "type": "SUGGESTION",
    "category": "FACILITIES"
  }'
```

## Testing with Postman

1. **Import Collection:**
   - Create a new Postman collection called "HostelMate APIs"
   - Add environment variables:
     - `baseUrl`: `http://localhost:5000/api`
     - `adminToken`: (set after admin login)
     - `studentToken`: (set after student login)

2. **Test Flow:**
   1. Test public endpoints first
   2. Login as admin and save the token
   3. Register a new student
   4. Accept the student's admission (admin)
   5. Login as student and save the token
   6. Test all student endpoints

## Response Examples

**Successful Health Check:**
```json
{
  "status": "OK",
  "timestamp": "2025-07-26T10:30:00.000Z",
  "environment": "development"
}
```

**Successful Login:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "System Administrator",
      "email": "admin@hostelmate.com",
      "role": "ADMIN"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

## Common HTTP Status Codes

- `200`: Success
- `201`: Created successfully
- `400`: Bad request (validation error)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found
- `500`: Internal server error

## Environment Variables Required

Make sure these are set in your `.env` file:
- `PORT=5000`
- `MONGODB_URI=mongodb://localhost:27017/hostelmate`
- `JWT_ACCESS_SECRET=your_secret_key`
- `JWT_REFRESH_SECRET=your_refresh_secret`
- `ADMIN_EMAIL=admin@hostelmate.com`
- `ADMIN_PASSWORD=admin123`

## Troubleshooting

1. **Server won't start:**
   - Check if MongoDB is running
   - Verify all environment variables are set
   - Check for port conflicts (port 5000)

2. **401 Unauthorized:**
   - Ensure you're including the Authorization header
   - Check if token has expired (access tokens expire in 15 minutes)
   - Use refresh token to get a new access token

3. **Validation Errors:**
   - Check request body format
   - Ensure all required fields are provided
   - Verify data types match the expected format

4. **MongoDB Connection Issues:**
   - The server will automatically use in-memory database if local MongoDB is not available
   - Look for "Connected to MongoDB Memory Server" in console output
