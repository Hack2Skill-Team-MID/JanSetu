# JanSetu API Documentation

## Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `TBD`

## Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login |
| GET | `/auth/me` | ✅ | Get current user |

### Community Needs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/needs` | ✅ | List needs (with filters) |
| GET | `/needs/:id` | ✅ | Get single need |
| POST | `/needs` | ✅ NGO | Create need manually |
| PATCH | `/needs/:id` | ✅ NGO | Update need |

### Tasks
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/tasks` | ✅ | List tasks |
| POST | `/tasks` | ✅ NGO | Create task from need |
| GET | `/tasks/:id` | ✅ | Get task with applicants |
| POST | `/tasks/:id/apply` | ✅ Vol | Volunteer applies |

### Surveys
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/surveys/upload` | ✅ NGO | Upload survey file |
| GET | `/surveys/:id/status` | ✅ | Check processing status |
| GET | `/surveys/:id/result` | ✅ | Get processed results |

### Volunteers
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/volunteers/me` | ✅ Vol | Get my profile |
| PUT | `/volunteers/me` | ✅ Vol | Update my profile |
| GET | `/volunteers/matches` | ✅ Vol | Get AI-matched tasks |

### Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard/stats` | ✅ | Platform statistics |
| GET | `/dashboard/heatmap` | ✅ | Geospatial need data |

---

## Query Parameters

### GET /needs
- `region` — Filter by region
- `category` — Filter by category
- `urgency` — Filter by urgency level
- `status` — Filter by status
- `page` — Page number (default: 1)
- `limit` — Items per page (default: 20)
- `sort` — Sort field (default: `-priorityScore`)

See `packages/shared/src/types/api.types.ts` for full request/response types.
