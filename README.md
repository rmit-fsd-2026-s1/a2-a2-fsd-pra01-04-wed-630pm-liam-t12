# VenueVendors — Full Stack Web Application
## COSC2758/2938 Full Stack Development — Assignment 2
**Student:** Vidanalage Jinushi Amaya Kariyakarana  
**Student ID:** S4029450  
**GitHub Repo:** https://github.com/rmit-fsd-2025-s1/a2-a2-fsd-pra01-04-wed-630pm-liam-t12

---

## Project Overview
VenueVendors is a full-stack venue booking platform built with React TypeScript, Node.js, Express, TypeORM, and MS SQL Server. It supports three user roles: Hirer, Vendor, and Admin.

---

## Project Structure
venue-vendors/
├── vv-frontend/       # React TS frontend (Vite + Tailwind)
├── vv-backend/        # Node + Express + TypeORM REST API
├── admin-frontend/    # React TS admin dashboard (Apollo Client)
└── admin-backend/     # Node + Apollo Server GraphQL API

---

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Axios, React Router |
| Backend | Node.js, Express, TypeORM, TypeScript |
| Database | MS SQL Server (AWS RDS) |
| Admin Frontend | React 18, TypeScript, Apollo Client, GraphQL |
| Admin Backend | Node.js, Apollo Server, GraphQL, TypeORM |
| Auth | JWT, bcryptjs |
| Charts | Recharts |
| Testing | Jest, ts-jest, Supertest |

---

## Database
- **Server:** dipto-database.cn2ems8y2mfe.ap-southeast-2.rds.amazonaws.com
- **Database:** s4029450
- **Tables:** users, venues, blocked_periods, bookings, hire_records, preferred_venues, compliance_documents, vendor_notes

---

## How to Run Locally

### Prerequisites
- Node.js 18+
- npm

### 1. Clone the repo
```bash
git clone https://github.com/rmit-fsd-2025-s1/a2-a2-fsd-pra01-04-wed-630pm-liam-t12
cd a2-a2-fsd-pra01-04-wed-630pm-liam-t12/venue-vendors
```

### 2. Set up environment variables

**vv-backend/.env**
PORT=5000
JWT_SECRET=vv_secret_key_change_in_production
DB_HOST=dipto-database.cn2ems8y2mfe.ap-southeast-2.rds.amazonaws.com
DB_PORT=1433
DB_USERNAME=s4029450
DB_PASSWORD=DBpswd@1467
DB_NAME=s4029450

**admin-backend/.env**
PORT=4000
JWT_SECRET=admin_secret_key
DB_HOST=dipto-database.cn2ems8y2mfe.ap-southeast-2.rds.amazonaws.com
DB_PORT=1433
DB_USERNAME=s4029450
DB_PASSWORD=DBpswd@1467
DB_NAME=s4029450

### 3. Install and run each project

**Terminal 1 — VV Backend**
```bash
cd vv-backend
npm install
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 — VV Frontend**
```bash
cd vv-frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

**Terminal 3 — Admin Backend**
```bash
cd admin-backend
npm install
npm run dev
# Runs on http://localhost:4000/graphql
```

**Terminal 4 — Admin Frontend**
```bash
cd admin-frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## Test Accounts
| Role | Email | Password |
|---|---|---|
| Hirer | alice@email.com | password |
| Vendor | vendor1@email.com | password |
| Admin | admin / admin | admin / admin |

---

## Running Tests
```bash
cd vv-backend
npm test
```
6 test suites, 12 tests — all passing.

Tests cover:
1. Password hashing (bcrypt)
2. Password validation (regex)
3. JWT token generation and verification
4. Role-based access control middleware
5. Booking input validation
6. Compliance score calculation

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/signup | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/profile | Get profile |
| PUT | /api/auth/profile | Update profile |

### Venues
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/venues | Get all venues |
| GET | /api/venues/featured | Get featured venues |
| GET | /api/venues/suitability | Keyword search |
| POST | /api/venues | Create venue (vendor) |
| PUT | /api/venues/:id | Update venue |
| DELETE | /api/venues/:id | Delete venue |
| POST | /api/venues/:id/block | Block timeslot |
| DELETE | /api/venues/:id/block/:bpId | Unblock timeslot |

### Bookings
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/bookings | Create booking (hirer) |
| GET | /api/bookings | Get bookings |
| PUT | /api/bookings/:id/status | Accept/reject (vendor) |
| GET | /api/bookings/history | Hire history |

### Hirer
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/hirer/documents | Get documents |
| POST | /api/hirer/documents | Upload document |
| GET | /api/hirer/preferred | Get preferred venues |
| POST | /api/hirer/preferred | Add preferred venue |
| GET | /api/hirer/stats | Vendor analytics |

---

## GraphQL Operations (Admin)

```graphql
# Login
query { login(email: "admin", password: "admin") { token role } }

# Get all venues
query { venues { id name location vendor { name } isFeatured } }

# Top venues report
query { topVenues { venueName totalBookings popularDay popularTime } }

# Top hirers report  
query { topHirers { hirerName totalApplications successfulBookings } }

# Assign vendor to venue
mutation { assignVendor(venueId: 1, vendorId: 2) { id vendorId } }

# Toggle featured
mutation { setFeatured(id: 1, isFeatured: true) { id isFeatured } }
```

---

## Deployment (Render)
| Service | URL |
|---|---|
| VV Frontend | https://vv-frontend-nvwv.onrender.com |
| VV Backend | https://vv-backend-5wwk.onrender.com |
| Admin Frontend | https://admin-frontend-hswj.onrender.com |
| Admin Backend | https://admin-backend-wsaw.onrender.com |

---

## References
- React documentation: https://react.dev
- TypeORM documentation: https://typeorm.io
- Apollo Server documentation: https://www.apollographql.com/docs/apollo-server
- Tailwind CSS: https://tailwindcss.com
- Recharts: https://recharts.org
- JWT: https://jwt.io
- bcryptjs: https://www.npmjs.com/package/bcryptjs
- Unsplash (images): https://unsplash.com
- UI Avatars: https://ui-avatars.com
- Vite: https://vitejs.dev
- React Router: https://reactrouter.com
- Axios: https://axios-http.com
- RMIT course materials and lecture slides (COSC2758/2938)
- Generative AI (Claude by Anthropic) was used to assist with code structure, debugging TypeScript errors, and generating boilerplate. All logic, architecture decisions, and implementation were reviewed and understood by the student.

---

## AI Usage Declaration
Claude (Anthropic) was used to assist with:
- TypeScript error debugging
- Boilerplate code generation for Express routes and TypeORM entities
- GraphQL schema design
- Unit test structure

All generated code was reviewed, understood, and modified as needed by the student.