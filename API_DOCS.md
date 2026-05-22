# MediConnect API Documentation

## Base URL
```
http://localhost:5000/api
```

---

## Authentication
- Most endpoints require a JWT token in the `Authorization` header: `Bearer <token>`

---

## Endpoints

### User
- `POST /user/register`
  - Register a new user
  - Body: `{ name, email, password }`
- `POST /user/login`
  - Login user
  - Body: `{ email, password }`
- `GET /user/profile`
  - Get user profile (auth required)

### Doctor
- `GET /doctor/all`
  - List all doctors
- `GET /doctor/:id`
  - Get doctor profile by ID
- `POST /doctor/appointments`
  - Get doctor's appointments (auth required)

### Appointment
- `POST /appointment/book`
  - Book an appointment (auth required)
  - Body: `{ doctorId, date, time, ... }`
- `GET /appointment/user`
  - Get user's appointments (auth required)

### Admin
- `POST /admin/login`
  - Admin login
  - Body: `{ email, password }`
- `GET /admin/doctors`
  - List all doctors
- `POST /admin/doctor/add`
  - Add a new doctor
  - Body: `{ name, speciality, ... }`
- `GET /admin/appointments`
  - List all appointments

---

## Error Response Example
```
{
  "success": false,
  "message": "Error message here"
}
```

---

## Notes
- All POST requests expect `Content-Type: application/json`.
- All protected routes require a valid JWT token.
- Customize and expand endpoints as per your project needs.
