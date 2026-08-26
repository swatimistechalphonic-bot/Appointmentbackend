# CareSync SaaS — DocAdmin Architecture

Multi-tenant, microservices-based SaaS architecture for scalable clinic and hospital management.

---

## 📁 Directory Structure

```
DocAdmin/
├── frontend/
│   ├── admin/              → Clinic Admin App (operations, billing, staff mgmt)
│   ├── doctor/             → Doctor App (prescriptions, schedules, EHR)
│   ├── receptionist/       → Receptionist App (queue desk, walk-ins)
│   ├── patient/            → Patient App (book appointments, view Rx, telemedicine)
│   └── super-admin/        → SaaS Platform Owner (tenant management, subscriptions)
│
├── backend/
│   ├── api-gateway/        → Central entry point, rate limiting, auth routing
│   ├── microservices/
│   │   ├── auth-service/           → JWT/OAuth, sessions, MFA
│   │   ├── organization-service/   → Multi-tenant org management
│   │   ├── user-service/           → User CRUD, roles & permissions
│   │   ├── doctor-service/         → Doctor profiles, specializations
│   │   ├── patient-service/        → Patient demographics & EHR base
│   │   ├── appointment-service/    → Booking, slots, statuses
│   │   ├── schedule-service/       → Doctor availability & timetables
│   │   ├── queue-service/          → Live queue tokens & waiting room board
│   │   ├── medical-record-service/ → EHR timeline, vitals, lab reports
│   │   ├── prescription-service/   → Digital Rx, medicine items, Rx IDs
│   │   ├── chat-service/           → In-app messaging
│   │   ├── telemedicine-service/   → Video consultation sessions
│   │   ├── payment-service/        → Payment gateway integration
│   │   ├── billing-service/        → Invoice generation, receipts
│   │   ├── notification-service/   → SMS/Email/Push notifications
│   │   ├── report-service/         → Analytics & PDF reports
│   │   ├── review-service/         → Doctor ratings & patient feedback
│   │   ├── analytics-service/      → Platform-wide telemetry
│   │   ├── subscription-service/   → SaaS plans, billing cycles
│   │   └── audit-service/          → Compliance & audit logs
│   │
│   ├── shared/
│   │   ├── middleware/     → Auth guards, rate limiter, error handler
│   │   ├── utils/          → Date helpers, formatters, token generators
│   │   ├── constants/      → Enums, status codes, role definitions
│   │   ├── validators/     → Joi/Zod schema validators
│   │   └── events/         → Event publishers/subscribers (message bus)
│   │
│   └── migrations/         → DB migration & seed scripts
│
├── infrastructure/
│   ├── docker/             → Dockerfiles & docker-compose.yml
│   ├── nginx/              → Reverse proxy & load balancing config
│   ├── redis/              → Cache & session store configuration
│   └── monitoring/         → Prometheus, Grafana dashboards
│
├── docs/                   → API docs, architecture diagrams
└── README.md
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|:---|:---|
| Frontend (Admin, Doctor, Receptionist) | React 18 + Vite + React Router |
| Frontend (Patient Portal) | React 18 + Vite |
| API Gateway | Node.js + Express |
| Microservices | Node.js + Express |
| Database | MongoDB (Mongoose ORM) |
| Caching | Redis |
| Auth | JWT (Access + Refresh Tokens) |
| File Storage | AWS S3 / Cloudinary |
| Messaging | EventEmitter / Redis Pub-Sub (future: RabbitMQ) |
| Containerization | Docker + Docker Compose |
| Reverse Proxy | Nginx |
| API Documentation | Swagger / OpenAPI 3.0 |
| Monitoring | Prometheus + Grafana |

---

## 🚀 API Gateway Routing

| Route Prefix | Proxied To |
|:---|:---|
| `/api/auth/*` | `auth-service:5001` |
| `/api/users/*` | `user-service:5002` |
| `/api/organizations/*` | `organization-service:5003` |
| `/api/appointments/*` | `appointment-service:5004` |
| `/api/queue/*` | `queue-service:5005` |
| `/api/prescriptions/*` | `prescription-service:5006` |
| `/api/patients/*` | `patient-service:5007` |
| `/api/doctors/*` | `doctor-service:5008` |
| `/api/schedules/*` | `schedule-service:5009` |
| `/api/payments/*` | `payment-service:5010` |
| `/api/billing/*` | `billing-service:5011` |
| `/api/notifications/*` | `notification-service:5012` |
| `/api/reports/*` | `report-service:5013` |
| `/api/analytics/*` | `analytics-service:5014` |
| `/api/subscriptions/*` | `subscription-service:5015` |
| `/api/audit/*` | `audit-service:5016` |
| `/api/reviews/*` | `review-service:5017` |
| `/api/chat/*` | `chat-service:5018` |
| `/api/telemedicine/*` | `telemedicine-service:5019` |
| `/api/records/*` | `medical-record-service:5020` |

---

## 🗂️ Microservice Structure (per service)

Each microservice follows a consistent internal structure:

```
<service-name>/
├── src/
│   ├── controllers/       → Route handler functions
│   ├── routes/            → Express router definitions
│   ├── models/            → Mongoose schema & model
│   ├── services/          → Business logic layer
│   ├── validators/        → Request body validation
│   └── index.js           → Service entry point
├── tests/                 → Unit & integration tests
├── .env                   → Service-specific environment variables
└── package.json
```

---

## 👥 Frontend Role Apps

| App | Port | Audience |
|:---|:---|:---|
| `admin/` | 3000 | Clinic Admin — Full control |
| `doctor/` | 3001 | Physicians — Clinical tools |
| `receptionist/` | 3002 | Desk staff — Queue & walk-ins |
| `patient/` | 3003 | Patients — Self-service portal |
| `super-admin/` | 3004 | SaaS Owner — Tenant management |

---

## 🔑 Implemented APIs (Current State)

| Service | Status | Endpoints |
|:---|:---|:---|
| Appointment Service | ✅ Complete | GET, POST, PUT, DELETE /api/appointments + stats |
| Queue Service | ✅ Complete | 13 endpoints (check-in, call-next, skip, recall, board) |
| Prescription Service | ✅ Complete | 8 endpoints (CRUD, stats, patient/doctor history) |
| Patient Service | ✅ Complete | CRUD + search |
| Auth Service | ✅ Complete | Login, Register, JWT |
| Report Service | ✅ Complete | Analytics, revenue trends, doctor performance |
| Review Service | ✅ Complete | Ratings, CRUD |
| Department Service | ✅ Complete | CRUD |
| Chat Service | ✅ Complete | Messages, rooms |
| Settings Service | ✅ Complete | Clinic configuration |
| Payment Service | ✅ Complete | Payment records |

---

## 📋 Environment Variables

```env
# Common across all services
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379

# API Gateway
GATEWAY_PORT=5000

# Individual service ports
AUTH_SERVICE_PORT=5001
APPOINTMENT_SERVICE_PORT=5004
QUEUE_SERVICE_PORT=5005
PRESCRIPTION_SERVICE_PORT=5006
```

---

*Built for robust, scalable healthcare operations at enterprise SaaS scale.*
