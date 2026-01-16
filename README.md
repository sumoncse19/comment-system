# Assessment Comment System

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) comment system with real-time updates, authentication, and interactive features. This application allows users to view, add, edit, delete, like, dislike, and reply to comments with live updates across all connected clients.

## 🌐 Live Demo

**Frontend (Production):** [https://comment-system-techzu.vercel.app/](https://comment-system-techzu.vercel.app/)

**Backend API:** [https://comment-system-techzu.onrender.com/](https://comment-system-techzu.onrender.com/)

**API Documentation (Swagger):** [https://comment-system-techzu.onrender.com/api-docs/](https://comment-system-techzu.onrender.com/api-docs/)

**Health Check:** [https://comment-system-techzu.onrender.com/health](https://comment-system-techzu.onrender.com/health)

> **Note:** The backend is hosted on Render's free tier, which may spin down after periods of inactivity. First request may take 30-60 seconds to wake up the server.

## ✨ Highlights

- 🔐 **JWT Authentication** with email or username login
- 💬 **3-Layer Nested Replies** with collapse/expand functionality
- ⚡ **Real-time Updates** via Socket.io (no page refresh needed)
- 🎨 **Dark/Light Theme** with system preference detection
- 📱 **Fully Responsive** design for all screen sizes
- 🔔 **Toast Notifications** for all user actions
- ⌨️ **Keyboard Shortcuts** (Ctrl+Enter to submit)
- 🚀 **Optimistic UI** for instant feedback
- 📊 **Smart Pagination** with auto-navigation
- 🎯 **Modern Stack**: TypeScript, Tailwind CSS 4, shadcn/ui, React 19

## Features

### Core Features
- **User Authentication**: Secure JWT-based authentication with access and refresh tokens
- **Login Flexibility**: Login with either email or username
- **Comment CRUD Operations**: Create, read, update, and delete comments with confirmation dialogs
- **Authorization**: Users can only edit or delete their own comments
- **Like/Dislike System**: Toggle-based reaction system with optimistic UI updates (one reaction per user per comment)
- **Sorting Options**: Sort comments by newest, most liked, or most disliked
- **Smart Pagination**: Efficient pagination with 10 comments per page and automatic page navigation
- **Nested Reply System**: Three-layer deep threaded discussions (Parent → Child → Child)
- **Collapse/Expand Replies**: Toggle visibility of nested replies with chevron indicators
- **Real-time Updates**: Live updates using Socket.io for instant synchronization across all clients
- **Responsive Design**: Mobile-first UI that works on all screen sizes

### User Experience Features
- **Dark/Light Theme**: Seamless theme toggle with system preference detection
- **Toast Notifications**: Success and error messages using Sonner
- **Keyboard Shortcuts**: Ctrl+Enter (Cmd+Enter on Mac) to submit comments
- **Optimistic UI Updates**: Instant visual feedback for likes/dislikes before server response
- **Delete Confirmation**: Beautiful modal dialog before deleting comments
- **Relative Timestamps**: Human-readable time indicators (e.g., "2m ago", "1h ago")
- **Comment Count Badge**: Live counter showing total comments with "Live" indicator
- **Empty States**: Friendly messages when no comments exist
- **Edited Indicator**: Badge showing when comments have been modified
- **User Avatars**: Initial-based avatars or custom profile pictures
- **Loading States**: Smooth spinner animations during data fetching
- **Auto-collapse on Delete**: Reply form closes when collapsing comment threads

### Technical Features
- **TypeScript**: Full type safety on both frontend and backend
- **Form Validation**: React Hook Form with Zod schemas for client-side validation
- **Input Validation**: Comprehensive server-side validation with Zod schemas
- **Security**: Helmet, CORS, rate limiting, XSS protection, NoSQL injection prevention
- **API Documentation**: Interactive Swagger/OpenAPI documentation at `/api-docs`
- **Error Handling**: Centralized error handling with custom error classes
- **Database Optimization**: Compound indexes for fast sorting and pagination
- **Token Refresh**: Automatic access token refresh on expiration with retry logic
- **Recursive Operations**: Efficient recursive algorithms for nested comment operations

## Technology Stack

### Frontend
- **React** 19.2.0 - UI library
- **TypeScript** 5.9.3 - Type safety
- **Vite** 7.2.4 - Build tool and dev server
- **React Router** 7.12.0 - Client-side routing
- **Tailwind CSS** 4.1.18 - Utility-first CSS framework with OKLCH color support
- **shadcn/ui** - Beautifully designed component library (Alert, Button, Card, Input, Textarea, Badge, AlertDialog)
- **Radix UI** - Headless UI primitives for accessible components
- **lucide-react** - Icon library with 1000+ icons
- **Axios** 1.13.2 - HTTP client with interceptors and auto token refresh
- **Socket.io-client** 4.8.3 - Real-time bidirectional communication
- **React Context API** - Global state management for authentication
- **React Hook Form** 7.54.2 - Performant form validation
- **Zod** 4.3.5 - TypeScript-first schema validation
- **Sonner** - Beautiful toast notifications
- **class-variance-authority** - CSS variant utilities

### Backend
- **Node.js** 18+ - Runtime environment
- **Express.js** 5.2.1 - Web framework
- **TypeScript** 5.9.3 - Type safety
- **MongoDB** - NoSQL database (hosted on MongoDB Atlas)
- **Mongoose** 9.1.4 - MongoDB ODM
- **JWT** (jsonwebtoken 9.0.3) - Authentication
- **bcryptjs** 3.0.3 - Password hashing
- **Socket.io** 4.8.3 - Real-time updates
- **Zod** 4.3.5 - Schema validation
- **Swagger** - API documentation
- **Helmet** 8.1.0 - Security headers
- **express-rate-limit** 8.2.1 - Rate limiting

## Project Structure

```
comment-system/
├── backend/                      # Backend application
│   ├── src/
│   │   ├── config/              # Configuration files
│   │   │   ├── database.ts      # MongoDB connection
│   │   │   └── socket.ts        # Socket.io configuration
│   │   ├── controllers/         # Request handlers
│   │   │   ├── authController.ts
│   │   │   └── commentController.ts
│   │   ├── middleware/          # Custom middleware
│   │   │   ├── auth.ts          # Authentication middleware
│   │   │   ├── errorHandler.ts  # Global error handler
│   │   │   └── validate.ts      # Validation middleware
│   │   ├── models/              # Mongoose models
│   │   │   ├── User.ts
│   │   │   └── Comment.ts
│   │   ├── routes/              # API routes
│   │   │   ├── authRoutes.ts
│   │   │   └── commentRoutes.ts
│   │   ├── services/            # Business logic
│   │   │   ├── authService.ts
│   │   │   └── commentService.ts
│   │   ├── types/               # TypeScript type definitions
│   │   ├── utils/               # Utility functions
│   │   │   └── ApiError.ts      # Custom error class
│   │   ├── validators/          # Zod validation schemas
│   │   │   ├── authValidator.ts
│   │   │   └── commentValidator.ts
│   │   ├── app.ts               # Express app setup
│   │   └── server.ts            # Server entry point
│   ├── .env                     # Environment variables
│   ├── .env.example             # Example environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                     # Frontend application
│   ├── src/
│   │   ├── api/                 # API integration
│   │   │   ├── axios.ts         # Axios instance with interceptors
│   │   │   ├── authApi.ts       # Authentication API calls
│   │   │   └── commentApi.ts    # Comment API calls
│   │   ├── components/          # Reusable components
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   │   ├── alert.tsx
│   │   │   │   ├── alert-dialog.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── form.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── sonner.tsx
│   │   │   │   └── textarea.tsx
│   │   │   ├── CommentForm.tsx
│   │   │   ├── CommentItem.tsx
│   │   │   ├── CommentList.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── theme-provider.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── contexts/            # React contexts
│   │   │   └── AuthContext.tsx  # Authentication state
│   │   ├── hooks/               # Custom React hooks
│   │   │   └── useSocket.ts     # Socket.io hook
│   │   ├── lib/                 # Utility libraries
│   │   │   └── utils.ts         # Helper functions (cn, etc.)
│   │   ├── pages/               # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── types/               # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── App.tsx              # Root component
│   │   ├── App.css              # Global styles
│   │   ├── index.css            # Tailwind CSS with theme variables
│   │   └── main.tsx             # Entry point
│   ├── components.json          # shadcn/ui configuration
│   ├── package.json
│   ├── postcss.config.js        # PostCSS configuration for Tailwind
│   └── tsconfig.json
│
├── IMPLEMENTATION_PLAN.md        # Implementation roadmap
├── requirement_documentation.md  # Project requirements
└── README.md                     # This file
```

## 🚀 Running Locally

Follow these steps to run the application on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB Atlas** account - [Sign up free](https://www.mongodb.com/cloud/atlas/register)
- **Git** - [Download](https://git-scm.com/)

### Step 1: Clone the Repository

```bash
git clone https://github.com/sumoncse19/comment-system.git
cd comment-system
```

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Directory

```bash
cd backend
```

#### 2.2 Install Dependencies

```bash
npm install
```

#### 2.3 Create Environment File

Create a `.env` file in the `backend` directory:

```bash
# On Mac/Linux
cp .env.example .env

# On Windows
copy .env.example .env
```

#### 2.4 Configure Environment Variables

Open `.env` file and update with your values:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Configuration (REQUIRED - Get from MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/comment-system?retryWrites=true&w=majority

# JWT Configuration (REQUIRED - Generate secure random strings)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters-long
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration (REQUIRED for local development)
CLIENT_URL=http://localhost:5173

# Rate Limiting (Optional - has defaults)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important Configuration Notes:**

1. **MongoDB URI**:
   - Go to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Create a free cluster
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<username>`, `<password>`, and `<dbname>` with your values

2. **JWT Secrets**:
   - Generate secure random strings (at least 32 characters)
   - You can use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - **Never** use the example values in production

3. **CLIENT_URL**:
   - Must be `http://localhost:5173` for local development
   - For production, use your deployed frontend URL

#### 2.5 Start Backend Server

```bash
# Development mode (with hot reload)
npm run dev
```

You should see:
```
✓ MongoDB connected successfully
✓ Server running on http://localhost:5000
✓ Socket.io initialized
```

**Backend is now running at:** `http://localhost:5000`

### Step 3: Frontend Setup

Open a **new terminal window** (keep backend running).

#### 3.1 Navigate to Frontend Directory

```bash
# From project root
cd frontend
```

#### 3.2 Install Dependencies

```bash
npm install
```

#### 3.3 Create Environment File

Create a `.env` file in the `frontend` directory:

```env
# Backend API URL (REQUIRED)
VITE_API_URL=http://localhost:5000/api
```

**Note:** Make sure the URL matches your backend server (default: `http://localhost:5000/api`)

#### 3.4 Start Frontend Development Server

```bash
npm run dev
```

You should see:
```
VITE v7.2.4  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Frontend is now running at:** `http://localhost:5173`

### Step 4: Access the Application

1. **Open your browser** and navigate to: `http://localhost:5173`

2. **Register a new account**:
   - Click "Register" in the navbar
   - Fill in username, email, and password
   - Click "Register" button

3. **Login**:
   - Enter your email/username and password
   - You'll be redirected to the home page

4. **Start commenting!**:
   - Write a comment in the text area
   - Press **Ctrl+Enter** (or Cmd+Enter on Mac) to submit
   - Try liking, replying, editing, and deleting comments
   - Open multiple tabs to see real-time updates in action

### Step 5: Verify Everything Works

**Backend Verification:**
- Visit `http://localhost:5000/health` - Should show: `{"success": true, "message": "Server is running"}`
- Visit `http://localhost:5000/api-docs` - Should show Swagger API documentation

**Frontend Verification:**
- Check browser console (F12) for any errors
- Look for "Socket connected" message in console
- Verify you can register, login, and create comments

### Troubleshooting

#### Backend won't start

**Port already in use:**
```bash
# Find process on port 5000
lsof -i :5000           # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process or change PORT in .env
```

**MongoDB connection fails:**
- Verify your connection string in `.env`
- Check if your IP is whitelisted in MongoDB Atlas (Network Access)
- Ensure MongoDB Atlas cluster is running
- Try adding `0.0.0.0/0` to allow all IPs (for development only)

#### Frontend can't connect to backend

- Verify backend is running on `http://localhost:5000`
- Check `VITE_API_URL` in `frontend/.env` is correct
- Check browser console for CORS errors
- Verify `CLIENT_URL` in `backend/.env` is `http://localhost:5173`

#### Real-time updates not working

- Open browser console (F12) and check for Socket.io errors
- Look for "Socket connected" message
- Verify backend Socket.io is initialized (check terminal logs)
- Make sure both backend and frontend are running

#### Token/Authentication issues

- Clear browser localStorage: Open DevTools → Application → Local Storage → Clear All
- Try logging out and logging in again
- Check if `JWT_SECRET` and `JWT_REFRESH_SECRET` are set in `backend/.env`

### Development Tips

- **Backend logs**: Watch terminal for request logs and errors
- **Frontend console**: Open browser DevTools (F12) to see client-side logs
- **API testing**: Use Swagger docs at `http://localhost:5000/api-docs`
- **Hot reload**: Both servers support hot reload - just save your changes
- **Multi-user testing**: Open multiple browser windows/tabs to test real-time features

## API Documentation

### Swagger Documentation

Interactive API documentation is available at:

**Production:** [https://comment-system-techzu.onrender.com/api-docs/](https://comment-system-techzu.onrender.com/api-docs/)

**Local Development:** `http://localhost:5000/api-docs`

### API Endpoints

#### Authentication Routes (`/api/auth`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login with email/username and password |
| POST | `/api/auth/refresh-token` | No | Refresh access token |
| GET | `/api/auth/me` | Yes | Get current user profile |
| POST | `/api/auth/logout` | Yes | Logout (clear tokens) |

#### Comment Routes (`/api/comments`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/comments` | Optional | Get paginated comments with sorting |
| GET | `/api/comments/:id` | Optional | Get single comment with replies |
| POST | `/api/comments` | Yes | Create a new comment |
| PUT | `/api/comments/:id` | Yes | Update own comment |
| DELETE | `/api/comments/:id` | Yes | Delete own comment |
| POST | `/api/comments/:id/like` | Yes | Like/unlike a comment |
| POST | `/api/comments/:id/dislike` | Yes | Dislike/undislike a comment |

### Request Examples

#### Register User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "johndoe",  // Can be email or username
  "password": "password123"
}
```

#### Get Comments

```bash
GET /api/comments?pageId=home&page=1&limit=10&sort=newest
```

#### Create Comment

```bash
POST /api/comments
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "content": "This is my comment",
  "pageId": "home"
}
```

#### Like Comment

```bash
POST /api/comments/:commentId/like
Authorization: Bearer <access_token>
```

## Real-time Updates

The application uses Socket.io for real-time bidirectional updates. When any user performs an action, all connected clients receive instant updates without page refresh:

### Socket Events

| Event | Trigger | Updates |
|-------|---------|---------|
| **`comment:created`** | New parent comment added | All clients see new comment appear instantly |
| **`reply:created`** | Reply added to any comment | Reply appears under parent at any nesting level |
| **`comment:updated`** | Comment edited | Content updates across all clients |
| **`comment:deleted`** | Comment removed | Comment disappears, pagination updates |
| **`comment:liked`** | Comment liked/unliked | Like count updates with optimistic UI |
| **`comment:disliked`** | Comment disliked/undisliked | Dislike count updates with optimistic UI |

### Real-time Features

- **Instant Updates**: No polling, pure push-based updates
- **Page-based Rooms**: Users only receive updates for the page they're viewing
- **Optimistic UI**: Like/dislike updates immediately, then syncs with server
- **Pagination Sync**: Total counts and page numbers update in real-time
- **Nested Updates**: Replies at any depth update correctly
- **Auto Page Navigation**: Users moved to valid page when current becomes empty
- **Live Indicator**: Visual badge shows connection status

### How It Works

1. **Connection**: Frontend connects to Socket.io server on app load
2. **Join Room**: User joins page-specific room (e.g., "home-page")
3. **Action**: User performs action (create/edit/delete/like/dislike)
4. **Broadcast**: Server broadcasts event to all users in the same page room
5. **Update**: All connected clients receive event and update UI recursively
6. **Sync**: Optimistic updates reconcile with server response
7. **Pagination**: Counts and page numbers automatically adjust

## Database Schema

### User Model

```typescript
{
  username: String (unique, 3-30 chars)
  email: String (unique, lowercase)
  password: String (hashed with bcrypt)
  avatar: String (optional)
  createdAt: Date
  updatedAt: Date
}
```

### Comment Model

```typescript
{
  content: String (1-5000 chars)
  author: ObjectId (ref: User)
  pageId: String (indexed)
  likes: ObjectId[] (User IDs who liked)
  dislikes: ObjectId[] (User IDs who disliked)
  likesCount: Number
  dislikesCount: Number
  parentComment: ObjectId (ref: Comment, null for top-level)
  replies: ObjectId[] (ref: Comment, nested up to 3 levels)
  isEdited: Boolean
  createdAt: Date
  updatedAt: Date
}
```

**Note**: The reply system supports 3 layers of nesting:
- **Layer 0** (Depth 0): Parent comment
- **Layer 1** (Depth 1): Reply to parent
- **Layer 2** (Depth 2): Reply to reply (maximum depth)

### Database Indexes

For optimal performance, the following indexes are created:

- `pageId + createdAt` - Fast retrieval of newest comments
- `pageId + likesCount` - Fast retrieval of most liked comments
- `pageId + dislikesCount` - Fast retrieval of most disliked comments
- `parentComment` - Fast retrieval of replies

## Security Features

### Backend Security

1. **Helmet** - Sets secure HTTP headers
2. **CORS** - Configured cross-origin resource sharing
3. **Rate Limiting** - 5 login attempts per 15 minutes per IP
4. **XSS Protection** - Input sanitization
5. **NoSQL Injection Prevention** - Query parameter validation
6. **Password Hashing** - bcrypt with 12 salt rounds
7. **JWT Tokens** - Short-lived access tokens (15 min) with refresh tokens (7 days)
8. **Input Validation** - Zod schemas validate all inputs

### Frontend Security

1. **Protected Routes** - Authentication required for comment actions
2. **Token Storage** - Tokens stored in localStorage (consider httpOnly cookies for production)
3. **Automatic Token Refresh** - Axios interceptor refreshes expired tokens
4. **XSS Prevention** - React's built-in XSS protection

## Development Scripts

### Backend

```bash
npm run dev        # Start development server with hot reload
npm run build      # Compile TypeScript to JavaScript
npm start          # Start production server
npm run lint       # Run TypeScript type checking
```

### Frontend

```bash
npm run dev        # Start Vite development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## Testing the Application

### Manual Testing Checklist

1. **Authentication**
   - ✅ Register a new user with validation
   - ✅ Login with email
   - ✅ Login with username
   - ✅ See success toast notifications
   - ✅ Logout
   - ✅ Try accessing protected routes without authentication (should redirect)

2. **Comments**
   - ✅ Create a comment (watch toast notification)
   - ✅ Submit comment with Ctrl+Enter (Cmd+Enter on Mac)
   - ✅ Edit your own comment (see "edited" badge)
   - ✅ Try editing someone else's comment (edit button should not appear)
   - ✅ Delete your own comment (confirmation dialog appears)
   - ✅ Try deleting someone else's comment (delete button should not appear)
   - ✅ See loading states during operations

3. **Reactions**
   - ✅ Like a comment (instant optimistic update)
   - ✅ Unlike a comment (click like again, count decreases)
   - ✅ Dislike a comment (like is removed if present)
   - ✅ Toggle between like and dislike rapidly
   - ✅ Verify count updates in real-time

4. **Sorting**
   - ✅ Switch to "Most Liked" sorting
   - ✅ Switch to "Most Disliked" sorting
   - ✅ Switch back to "Newest" sorting
   - ✅ Verify comments reorder correctly
   - ✅ Check that pagination resets to page 1

5. **Pagination**
   - ✅ Navigate to next page (comment count updates)
   - ✅ Navigate to previous page
   - ✅ Check page numbers display (e.g., "Page 2 of 5")
   - ✅ Add/delete comments and watch page numbers update
   - ✅ Delete last comment on a page (auto-navigate to previous page)
   - ✅ Verify buttons disable at first/last page

6. **Nested Replies (3 Layers)**
   - ✅ Reply to a parent comment (Layer 1)
   - ✅ Reply to a reply (Layer 2)
   - ✅ Try replying to Layer 2 (reply button should not appear)
   - ✅ Verify all replies display with proper indentation
   - ✅ Check reply count badge shows correct number

7. **Collapse/Expand**
   - ✅ Click chevron to collapse replies
   - ✅ Verify replies are hidden
   - ✅ Click chevron to expand replies
   - ✅ Verify reply count displays (e.g., "3 replies")
   - ✅ Collapse while reply form is open (form closes)

8. **Theme Toggle**
   - ✅ Click theme toggle in navbar
   - ✅ Switch between light and dark modes
   - ✅ Verify icon changes (Moon in light, Sun in dark)
   - ✅ Check that preference persists on page reload
   - ✅ Test system preference detection

9. **Real-time Updates (Multi-User)**
   - ✅ Open two browser windows/tabs
   - ✅ Login as different users
   - ✅ Create comment in window 1 → appears instantly in window 2
   - ✅ Edit comment in window 1 → updates instantly in window 2
   - ✅ Delete comment in window 1 → disappears in window 2
   - ✅ Like/dislike in window 1 → counts update in window 2
   - ✅ Reply to comment → appears at correct nesting level in both windows
   - ✅ Verify "Live" badge is visible
   - ✅ Check pagination updates in real-time

10. **User Experience**
    - ✅ Verify toast notifications for all actions
    - ✅ Check relative timestamps (2m ago, 1h ago)
    - ✅ See empty state message when no comments
    - ✅ View comment count badge with live indicator
    - ✅ Check user avatars show initials
    - ✅ Verify loading spinners during data fetch
    - ✅ Test responsive design on mobile

## Troubleshooting

### Common Issues

#### Backend won't start

```bash
# Check if port 5000 is already in use
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process or change PORT in .env file
```

#### Frontend can't connect to backend

- Verify backend is running on `http://localhost:5000`
- Check `VITE_API_URL` in frontend `.env` file
- Check CORS settings in backend (`CLIENT_URL` in `.env`)

#### MongoDB connection fails

- Verify MongoDB Atlas connection string
- Check if IP address is whitelisted in MongoDB Atlas
- Ensure network access is configured in MongoDB Atlas

#### Socket.io not working

- Check browser console for Socket.io connection errors
- Verify backend Socket.io is initialized
- Check if CORS is properly configured for Socket.io

#### Token refresh issues

- Clear browser localStorage and try logging in again
- Check if refresh token is expired (7 days by default)
- Verify `JWT_REFRESH_SECRET` is set in backend `.env`

## 🌍 Deployment

This project is currently deployed using **Vercel** (frontend) and **Render** (backend).

**Live URLs:**
- Frontend: [https://comment-system-techzu.vercel.app/](https://comment-system-techzu.vercel.app/)
- Backend: [https://comment-system-techzu.onrender.com/](https://comment-system-techzu.onrender.com/)

### Deploy Your Own Instance

Follow these steps to deploy your own version:

### Backend Deployment (Render)

#### 1. Create Render Account
- Go to [render.com](https://render.com/) and sign up
- Connect your GitHub account

#### 2. Create New Web Service
- Click "New +" → "Web Service"
- Connect your GitHub repository
- Select the repository: `comment-system`

#### 3. Configure Build Settings

| Setting | Value |
|---------|-------|
| **Name** | `your-app-name-backend` |
| **Region** | Choose closest to your users |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

#### 4. Add Environment Variables

Click "Advanced" and add these environment variables:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/comment-system
JWT_SECRET=your-production-secret-min-32-characters
JWT_REFRESH_SECRET=your-production-refresh-secret-min-32-characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173,https://your-frontend-url.vercel.app
NODE_ENV=production
```

**Important Notes:**
- Use **production-grade** secrets (generate with `crypto.randomBytes(32).toString('hex')`)
- `CLIENT_URL` can support multiple origins (comma-separated) for local + production
- **DO NOT** set `PORT` - Render sets it automatically
- Get `MONGODB_URI` from MongoDB Atlas

#### 5. Deploy
- Click "Create Web Service"
- Wait for deployment (usually 2-3 minutes)
- Copy your backend URL: `https://your-app-name.onrender.com`

### Frontend Deployment (Vercel)

#### 1. Create Vercel Account
- Go to [vercel.com](https://vercel.com/) and sign up
- Connect your GitHub account

#### 2. Import Project
- Click "Add New..." → "Project"
- Import your repository: `comment-system`

#### 3. Configure Build Settings

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Vite` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

#### 4. Add Environment Variables

In "Environment Variables" section, add:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://your-backend-url.onrender.com/api` |

(Use your Render backend URL from Step 5 above)

#### 5. Deploy
- Click "Deploy"
- Wait for deployment (usually 1-2 minutes)
- You'll get a URL like: `https://your-app-name.vercel.app`

#### 6. Update Backend CORS

Go back to **Render** → Your backend service → **Environment**:
- Update `CLIENT_URL` to include your Vercel URL:
  ```
  CLIENT_URL=http://localhost:5173,https://your-app-name.vercel.app
  ```
- Save (backend will auto-redeploy)

### Deployment Verification

After deployment, verify everything works:

1. **Health Check**: Visit `https://your-backend.onrender.com/health`
   - Should return: `{"success": true, "message": "Server is running"}`

2. **API Docs**: Visit `https://your-backend.onrender.com/api-docs`
   - Should show Swagger documentation

3. **Frontend**: Visit your Vercel URL
   - Register a new account
   - Create a comment
   - Check browser console for errors

4. **Real-time**: Open two tabs
   - Create comment in one tab
   - Should appear instantly in the other tab

### Production Considerations

#### Security
- ✅ Use strong, unique JWT secrets (32+ characters)
- ✅ Never commit `.env` files to Git
- ✅ Enable HTTPS (automatic on Vercel/Render)
- ✅ Keep dependencies updated
- ✅ Use environment-specific MongoDB databases

#### Performance
- ✅ Enable MongoDB Atlas connection pooling
- ✅ Add database indexes (already configured)
- ✅ Consider upgrading Render to paid tier for better performance
- ✅ Enable Vercel Analytics for monitoring
- ✅ Use CDN for static assets (automatic with Vercel)

#### Monitoring
- 📊 Set up error monitoring (Sentry, LogRocket)
- 📊 Monitor Render logs for backend errors
- 📊 Check Vercel Analytics for frontend metrics
- 📊 Set up MongoDB Atlas alerts for database issues
- 📊 Monitor API response times

#### Scaling
- Render free tier: 512 MB RAM, spins down after inactivity
- Render paid tier ($7+/mo): No spin down, more resources
- Vercel: Scales automatically (generous free tier)
- MongoDB Atlas: Scale cluster as needed (M0 free tier → paid tiers)

#### Cost Estimate (Free Tier)
- **MongoDB Atlas**: Free (M0 cluster - 512 MB storage)
- **Render**: Free (with spin-down limitations)
- **Vercel**: Free (100 GB bandwidth, unlimited requests)
- **Total**: $0/month for hobby projects

#### Cost Estimate (Production)
- **MongoDB Atlas**: $9+/month (M10 cluster - 2 GB RAM)
- **Render**: $7+/month (Starter plan - 512 MB RAM, no spin-down)
- **Vercel**: Free (Pro: $20/month if needed)
- **Total**: ~$16-36/month for production use

### Environment Variables Reference

#### Backend Environment Variables

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `MONGODB_URI` | Yes | `mongodb+srv://...` | MongoDB connection string |
| `JWT_SECRET` | Yes | `abc123...` (32+ chars) | Access token secret |
| `JWT_REFRESH_SECRET` | Yes | `xyz789...` (32+ chars) | Refresh token secret |
| `JWT_EXPIRES_IN` | Yes | `15m` | Access token expiry |
| `JWT_REFRESH_EXPIRES_IN` | Yes | `7d` | Refresh token expiry |
| `CLIENT_URL` | Yes | `https://app.vercel.app` | Frontend URL(s) for CORS |
| `NODE_ENV` | Recommended | `production` | Environment mode |
| `PORT` | No | (auto-set by Render) | Server port |

#### Frontend Environment Variables

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `VITE_API_URL` | Yes | `https://api.onrender.com/api` | Backend API URL |

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support:
- **GitHub Repository** - [sumoncse19/comment-system](https://github.com/sumoncse19/comment-system)
- **Live Demo** - [https://comment-system-techzu.vercel.app/](https://comment-system-techzu.vercel.app/)

## Key Features & Improvements

This implementation goes beyond the basic requirements with several polish and quality-of-life improvements:

### 🎨 Modern UI/UX
- **shadcn/ui Components**: Beautiful, accessible component library
- **Tailwind CSS 4**: Latest CSS framework with OKLCH color support
- **Dark/Light Theme**: Seamless theme switching with system preference detection
- **Toast Notifications**: Non-intrusive success/error messages
- **Loading States**: Smooth animations and feedback
- **Responsive Design**: Works perfectly on all screen sizes

### ⚡ Performance
- **Optimistic UI Updates**: Instant feedback before server confirmation
- **Efficient Pagination**: Only loads 10 comments per page
- **Database Indexing**: Compound indexes for fast queries
- **Recursive Algorithms**: Efficient nested comment operations
- **Smart Caching**: Token refresh prevents unnecessary re-authentication

### 🔒 Security
- **JWT Authentication**: Access (15m) + Refresh tokens (7d)
- **Password Hashing**: bcrypt with 12 salt rounds
- **Input Validation**: Client + server-side with Zod
- **Rate Limiting**: Prevents abuse (100 req/15min)
- **Security Headers**: Helmet, CORS, XSS protection
- **Authorization**: Ownership checks on all mutations

### 🚀 Developer Experience
- **TypeScript**: Full type safety across entire stack
- **Modular Architecture**: Clean separation of concerns
- **API Documentation**: Interactive Swagger docs
- **Error Handling**: Centralized error management
- **Code Quality**: Consistent patterns and best practices
- **Hot Reload**: Fast development with Vite + ts-node-dev

### 🎯 Unique Features
- **3-Layer Nested Replies**: Threaded discussions with depth control
- **Collapse/Expand**: Hide/show reply threads
- **Keyboard Shortcuts**: Ctrl+Enter to submit
- **Auto Page Navigation**: Smart pagination adjustments
- **Real-time Pagination**: Live count and page updates
- **Delete Confirmation**: Beautiful modal dialogs
- **Edited Indicator**: Transparency on modified content
- **Relative Timestamps**: Human-readable time (2m ago)
- **Live Badge**: Visual indicator of real-time connection

## Acknowledgments

- MERN Stack community
- Socket.io documentation
- MongoDB Atlas
- React and TypeScript communities
- shadcn/ui for beautiful components
- Radix UI for accessible primitives
- Tailwind CSS for utility-first styling

---
