# MediConnect Full Stack

MediConnect is a full-stack web application for managing doctor appointments, profiles, and administration. It consists of three main parts:

- **Frontend**: Patient-facing React app
- **Admin**: Admin dashboard (React)
- **Backend**: Node.js/Express API with MongoDB

---

## Features

- User registration/login
- Book appointments with doctors
- View doctor profiles and specialties
- Admin panel for managing doctors, appointments, and users
- Secure authentication and authorization

---

## Project Structure

```
mediconnect-full-stack/
  admin/        # Admin dashboard (React)
  backend/      # Node.js/Express backend API
  frontend/     # Main user-facing React app
```

---

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB

### Setup

1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd mediconnect-full-stack
   ```

2. **Install dependencies:**
   ```sh
   cd backend && npm install
   cd ../frontend && npm install
   cd ../admin && npm install
   ```

3. **Configure environment variables:**
   - Create `.env` files in `backend/`, `frontend/`, and `admin/` as needed.

4. **Run the backend:**
   ```sh
   cd backend
   npm start
   ```

5. **Run the frontend:**
   ```sh
   cd frontend
   npm run dev
   ```

6. **Run the admin panel:**
   ```sh
   cd admin
   npm run dev
   ```

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### User
- `POST /user/register` — Register a new user
- `POST /user/login` — User login
- `GET /user/profile` — Get user profile (auth required)

#### Doctor
- `GET /doctor/all` — List all doctors
- `GET /doctor/:id` — Get doctor profile
- `POST /doctor/appointments` — Get doctor's appointments (auth required)

#### Appointment
- `POST /appointment/book` — Book an appointment (auth required)
- `GET /appointment/user` — Get user's appointments (auth required)

#### Admin
- `POST /admin/login` — Admin login
- `GET /admin/doctors` — List all doctors
- `POST /admin/doctor/add` — Add a new doctor
- `GET /admin/appointments` — List all appointments

---

## Environment Variables

Create a `.env` file in the `backend/` folder with:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_URL=your_cloudinary_url
```

---

## Deployment
- Use Vercel, Heroku, or AWS for deployment.
- Configure environment variables in your deployment platform.

---

## License
MIT

---

## Contributors
- Your Name
- ...
