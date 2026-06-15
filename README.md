# Taskora — Backend

The Node.js/Express API server for Taskora. Handles auth, workspaces, projects, tasks, comments, real-time events, and a super admin layer — all in a clean modular structure.

---

## Tech stack

| | |
|--|--|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Database | MongoDB (Mongoose 8) |
| Auth | JWT (jsonwebtoken) |
| Password hashing | bcryptjs |
| Validation | Zod |
| Real-time | Socket.IO 4 |
| Environment | dotenv |

---

## Getting started

```bash
git clone https://github.com/saidudanishtv/taskora-server
cd taskora-server
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Start the dev server:

```bash
npm run dev
```

API runs at `http://localhost:5000/api`.

---

## API overview

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login, returns JWT |

### Workspaces
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/workspaces` | Get all workspaces for the current user |
| POST | `/api/workspaces/join` | Join via invite code |
| GET | `/api/workspaces/:id/members` | List workspace members |
| PATCH | `/api/workspaces/:id/members/:userId/role` | Update member role (owner/admin only) |
| DELETE | `/api/workspaces/:id/members/:userId` | Remove member (owner/admin only) |
| DELETE | `/api/workspaces/:id` | Delete workspace (owner only) |

### Workspace requests
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/workspace-requests` | Request a new workspace (any authed user) |
| GET | `/api/workspace-requests` | List pending requests (super admin only) |
| PATCH | `/api/workspace-requests/:id/approve` | Approve request (super admin only) |
| PATCH | `/api/workspace-requests/:id/reject` | Reject request (super admin only) |

### Workspace invites
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/workspace-invites/preview/:token` | Get invite info without auth (public) |
| POST | `/api/workspace-invites` | Create invite link (owner/admin only) |
| POST | `/api/workspace-invites/accept/:token` | Accept invite (any active user) |

### Projects
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/projects?workspaceId=` | List projects in a workspace |
| POST | `/api/projects` | Create project (owner/admin only) |
| DELETE | `/api/projects/:id` | Delete project (owner/admin only) |

### Tasks
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/tasks?projectId=` | List tasks in a project |
| POST | `/api/tasks` | Create task (owner/admin/member) |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Comments
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/comments?taskId=` | List comments on a task |
| POST | `/api/comments` | Add a comment |
| PUT | `/api/comments/:id` | Edit own comment |
| DELETE | `/api/comments/:id` | Delete own comment |

### Analytics
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/analytics?workspaceId=` | Task stats for a workspace |

### Dashboard
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/dashboard?workspaceId=` | Recent activity + assigned tasks |

### Super admin
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/super-admin/overview` | Platform-wide stats |
| GET | `/api/super-admin/users` | All users |
| GET | `/api/super-admin/workspaces` | All workspaces |
| PATCH | `/api/super-admin/users/:id/toggle` | Suspend/activate user |
| PATCH | `/api/super-admin/workspaces/:id/toggle` | Suspend/activate workspace |
| DELETE | `/api/super-admin/workspaces/:id` | Delete workspace |

---

## Project structure

```
src/
├── config/
│   ├── db.js          # MongoDB connection
│   └── env.js         # environment variable loader
├── middlewares/
│   ├── auth.middleware.js        # requireAuth, requireActiveUser
│   ├── superAdmin.middleware.js  # requireSuperAdmin
│   ├── validate.middleware.js    # Zod schema validation
│   └── error.middleware.js       # global error handler
├── modules/
│   ├── auth/
│   ├── workspace/
│   ├── workspaceInvite/
│   ├── workspaceRequest/
│   ├── project/
│   ├── task/
│   ├── comment/
│   ├── analytics/
│   ├── dashboard/
│   └── superAdmin/
├── socket/
│   └── socket.js      # Socket.IO setup + room management
├── utils/
│   ├── asyncHandler.js
│   ├── errors.js      # NotFoundError, ForbiddenError, BadRequestError
│   └── generateToken.js
├── app.js             # Express app setup
└── server.js          # HTTP server + socket attachment
```

Each module follows the same pattern: `model → service → controller → route`. Business logic lives in the service, the controller just wires HTTP in/out.

---

## Auth flow

1. User signs up → `status: "pending"`, no workspace
2. User submits workspace request → super admin approves → workspace created, `status: "active"`
3. OR: user receives an invite link → signs up → accepts invite → `status: "active"`, added to workspace with the invited role
4. JWT is issued at login/signup and sent as `Authorization: Bearer <token>` on every protected request

---

## Role system

```
super_admin  →  platform-wide access, manages workspace requests
owner        →  full control of their workspace, can invite admins
admin        →  can invite members/viewers, manage projects and tasks
member       →  can create and update tasks, add comments
viewer       →  read-only
```

Roles are enforced in each service function — not just middleware — so even direct API calls without the UI respect the hierarchy.

---

## Real-time events

Socket.IO rooms are scoped per project (`project:<id>`). When a task is created, updated, or deleted, the server emits to the room and all connected clients update their board instantly.

| Event | Payload |
|-------|---------|
| `task_created` | full task object |
| `task_updated` | full task object |
| `task_deleted` | `{ taskId }` |
