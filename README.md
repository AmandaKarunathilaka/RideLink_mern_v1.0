# RideLink 🚗

A full-stack carpooling web application built with the MERN stack and Clean Architecture. RideLink connects drivers and passengers for affordable, eco-friendly shared rides across Sri Lanka.

---

## 🌟 Features

### Passenger
- Search rides by origin, destination, date, seats and price
- Filter by time slot, verified drivers, sort by price or rating
- Book seats with real-time availability
- View and cancel bookings
- Rate and review drivers after rides
- Today's rides feed on dashboard

### Driver
- Upload driving license for admin verification
- Post rides with route, date, time, seats and price
- View passenger bookings per ride
- Cancel rides with passenger notification

### Admin
- Approve or reject driver license submissions
- View and cancel any ride on the platform
- Monitor all bookings across the system
- User management with role overview
- Live stats dashboard (users, rides, bookings, revenue)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v3 |
| Backend | Node.js, Express.js (ES Modules) |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (JSON Web Tokens) + bcryptjs |
| File Upload | Multer |
| Notifications | react-hot-toast |
| Architecture | Clean Architecture (Domain → Use Cases → Infrastructure → Interface) |

---

## 📁 Folder Structure

```
RideLink/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                          # MongoDB connection
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── User.js                    # User domain entity
│   │   │   │   ├── Ride.js                    # Ride domain entity
│   │   │   │   ├── Booking.js                 # Booking domain entity
│   │   │   │   └── Review.js                  # Review domain entity
│   │   │   ├── repositories/
│   │   │   │   ├── IUserRepository.js         # User repository interface
│   │   │   │   ├── IRideRepository.js         # Ride repository interface
│   │   │   │   ├── IBookingRepository.js      # Booking repository interface
│   │   │   │   └── IReviewRepository.js       # Review repository interface
│   │   │   └── errors/
│   │   │       └── AppError.js                # Custom error class
│   │   ├── usecases/
│   │   │   ├── auth/
│   │   │   │   ├── RegisterUser.js            # Register use case
│   │   │   │   └── LoginUser.js               # Login use case
│   │   │   ├── rides/
│   │   │   │   ├── PostRide.js                # Post ride use case
│   │   │   │   ├── SearchRides.js             # Search rides use case
│   │   │   │   ├── GetTodaysRides.js          # Today's rides use case
│   │   │   │   ├── GetRideById.js             # Get ride by ID use case
│   │   │   │   └── CancelRide.js              # Cancel ride use case
│   │   │   ├── bookings/
│   │   │   │   ├── BookRide.js                # Book ride use case
│   │   │   │   ├── CancelBooking.js           # Cancel booking use case
│   │   │   │   └── GetMyBookings.js           # Get bookings use case
│   │   │   ├── reviews/
│   │   │   │   ├── AddReview.js               # Add review use case
│   │   │   │   └── GetDriverReviews.js        # Get driver reviews use case
│   │   │   └── driver/
│   │   │       └── UploadLicense.js           # License upload use case
│   │   ├── infrastructure/
│   │   │   ├── models/
│   │   │   │   ├── UserModel.js               # Mongoose User schema
│   │   │   │   ├── RideModel.js               # Mongoose Ride schema
│   │   │   │   ├── BookingModel.js            # Mongoose Booking schema
│   │   │   │   └── ReviewModel.js             # Mongoose Review schema
│   │   │   ├── repositories/
│   │   │   │   ├── MongoUserRepository.js     # MongoDB User repository
│   │   │   │   ├── MongoRideRepository.js     # MongoDB Ride repository
│   │   │   │   ├── MongoBookingRepository.js  # MongoDB Booking repository
│   │   │   │   └── MongoReviewRepository.js   # MongoDB Review repository
│   │   │   ├── auth/
│   │   │   │   └── JwtService.js              # JWT token service
│   │   │   └── fileUpload/
│   │   │       └── multerConfig.js            # Multer file upload config
│   │   ├── interfaces/
│   │   │   ├── controllers/
│   │   │   │   ├── AuthController.js          # Auth endpoints
│   │   │   │   ├── UserController.js          # User profile endpoints
│   │   │   │   ├── DriverController.js        # Driver license endpoints
│   │   │   │   ├── AdminController.js         # Admin management endpoints
│   │   │   │   ├── RideController.js          # Ride CRUD endpoints
│   │   │   │   ├── BookingController.js       # Booking endpoints
│   │   │   │   └── ReviewController.js        # Review endpoints
│   │   │   ├── routes/
│   │   │   │   ├── authRoutes.js              # /api/auth/*
│   │   │   │   ├── userRoutes.js              # /api/users/*
│   │   │   │   ├── driverRoutes.js            # /api/driver/*
│   │   │   │   ├── adminRoutes.js             # /api/admin/*
│   │   │   │   ├── rideRoutes.js              # /api/rides/*
│   │   │   │   ├── bookingRoutes.js           # /api/bookings/*
│   │   │   │   └── reviewRoutes.js            # /api/reviews/*
│   │   │   └── middleware/
│   │   │       ├── authMiddleware.js          # JWT protect + authorize
│   │   │       └── errorMiddleware.js         # Global error handler
│   │   └── app.js                             # Express app setup
│   ├── uploads/
│   │   ├── licenses/                          # Driver license documents
│   │   └── profiles/                          # Profile images
│   ├── server.js                              # Entry point
│   ├── package.json
│   └── .env                                   # Environment variables
│
├── frontend/
│   ├── public/
│   │   └── hero-bg.jpg                        # Hero background image
│   ├── src/
│   │   ├── api/
│   │   │   ├── axiosConfig.js                 # Axios base config + interceptors
│   │   │   ├── authApi.js                     # Auth API calls
│   │   │   ├── rideApi.js                     # Ride API calls
│   │   │   ├── bookingApi.js                  # Booking API calls
│   │   │   ├── reviewApi.js                   # Review API calls
│   │   │   ├── driverApi.js                   # Driver API calls
│   │   │   └── adminApi.js                    # Admin API calls
│   │   ├── context/
│   │   │   └── AuthContext.jsx                # Global auth state
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   └── ProtectedRoute.jsx         # Role-based route guard
│   │   │   └── layout/
│   │   │       ├── Navbar.jsx                 # Floating glassmorphism navbar
│   │   │       ├── Footer.jsx                 # Footer
│   │   │       └── Layout.jsx                 # Page layout wrapper
│   │   ├── pages/
│   │   │   ├── Home.jsx                       # Landing page
│   │   │   ├── HomeStyles.css                 # Landing page styles
│   │   │   ├── Search.jsx                     # Ride search + filters
│   │   │   ├── SearchStyles.css               # Search page styles
│   │   │   ├── RideDetail.jsx                 # Ride detail + booking
│   │   │   ├── Profile.jsx                    # User profile page
│   │   │   ├── ForgotPassword.jsx             # Password reset flow
│   │   │   ├── NotFound.jsx                   # 404 page
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx                  # Sign in / Sign up
│   │   │   │   └── AuthStyles.css             # Auth page styles
│   │   │   ├── passenger/
│   │   │   │   ├── PassengerDashboard.jsx     # Passenger home dashboard
│   │   │   │   └── MyBookings.jsx             # Booking history + reviews
│   │   │   ├── driver/
│   │   │   │   ├── DriverDashboard.jsx        # Driver home dashboard
│   │   │   │   ├── PostRide.jsx               # Post new ride form
│   │   │   │   └── UploadLicense.jsx          # License upload page
│   │   │   └── admin/
│   │   │       └── AdminDashboard.jsx         # Admin control panel
│   │   ├── App.jsx                            # Routes + layout
│   │   ├── main.jsx                           # React entry point
│   │   └── index.css                          # Global styles
│   ├── vite.config.js                         # Vite + proxy config
│   ├── package.json
│   └── .env                                   # VITE_API_URL
│
├── package.json                               # Root — concurrently scripts
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v18 or higher
- MongoDB (local installation)
- npm v9 or higher

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ridelink.git
cd ridelink
```

---

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Go back to root
cd ..
```

---

### 3. Configure Environment Variables

**Backend — create `backend/.env`:**

```env
PORT=5000
MONGO_URI="put your atlas conn string/localhost"
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**Frontend — create `frontend/.env`:**

```env
VITE_API_URL=/api
```

---

### 4. Start MongoDB

Make sure MongoDB is running locally:

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

---

### 5. Run the Application

```bash
# From the root directory — runs both servers concurrently
npm run dev
```

- Backend runs on: `http://localhost:5000`
- Frontend runs on: `http://localhost:5173`

---

### 6. Create Admin Account

1. Register a new account at `http://localhost:5173/login`
2. Open **MongoDB Compass** → connect to `mongodb://localhost:27017`
3. Open `ridelink` → `users` collection
4. Find your account → edit `role` field from `"passenger"` to `"admin"`
5. Save and log back in

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login | Public |
| GET | `/api/auth/me` | Get current user | Token |
| POST | `/api/auth/verify-email` | Verify email exists | Public |
| POST | `/api/auth/reset-password` | Reset password | Public |

### Rides
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/rides/search` | Search rides with filters | Public |
| GET | `/api/rides/today` | Get today's rides | Public |
| GET | `/api/rides/:id` | Get ride by ID | Public |
| POST | `/api/rides` | Post new ride | Verified Driver |
| GET | `/api/rides/my-rides` | Get driver's rides | Driver |
| PUT | `/api/rides/:id/cancel` | Cancel ride | Driver |

### Bookings
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/bookings` | Book a ride | Passenger |
| GET | `/api/bookings/my-bookings` | Get my bookings | Passenger |
| PUT | `/api/bookings/:id/cancel` | Cancel booking | Passenger |
| POST | `/api/bookings/auto-complete` | Auto-complete past bookings | Passenger |
| GET | `/api/bookings/ride/:rideId` | Get bookings for a ride | Driver |

### Reviews
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/reviews` | Submit review | Passenger |
| GET | `/api/reviews/driver/:id` | Get driver reviews | Public |
| GET | `/api/reviews/booking/:id` | Get review for booking | Token |

### Users
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| PUT | `/api/users/profile` | Update profile | Token |
| POST | `/api/users/upload-profile` | Upload profile photo | Token |

### Driver
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/driver/upload-license` | Upload driving license | Driver |
| GET | `/api/driver/license-status` | Get license status | Driver |

### Admin
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/admin/pending-licenses` | Get pending verifications | Admin |
| PUT | `/api/admin/verify-driver/:id` | Approve or reject license | Admin |
| GET | `/api/admin/all-users` | Get all users | Admin |
| GET | `/api/admin/all-rides` | Get all rides | Admin |
| PUT | `/api/admin/cancel-ride/:id` | Cancel any ride | Admin |
| GET | `/api/admin/all-bookings` | Get all bookings | Admin |
| GET | `/api/admin/stats` | Get platform statistics | Admin |

---

## 🗂️ Architecture

This project follows **Clean Architecture** principles:

```
Domain Layer          → Entities + Repository Interfaces (no dependencies)
Use Case Layer        → Business logic (depends only on domain)
Infrastructure Layer  → MongoDB models + repositories (implements interfaces)
Interface Layer       → Controllers + Routes (HTTP layer)
```

This separation ensures business logic is independent of frameworks and databases.

---

## 🔐 Environment Variables Reference

| Variable | Description | Example |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb atlas/localhost` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secret_key` |
| `JWT_EXPIRES_IN` | JWT expiry duration | `7d` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `VITE_API_URL` | API base path for frontend | `/api` |

---

## 📦 NPM Scripts

```bash
# Root
npm run dev          # Run both backend + frontend concurrently

# Backend (from /backend)
npm run dev          # Start with nodemon (hot reload)
npm start            # Start without hot reload

# Frontend (from /frontend)
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## 👩‍💻 Developer

**Amanda Karunathilaka**
Computing Undergraduate — Lanka Nippon BizTech Institute (LNBTI), Sri Lanka

---

## 📄 License

This project is developed as an academic project for the ICT module at LNBTI.
