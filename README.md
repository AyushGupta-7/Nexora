# NEXORA

> A career-focused social platform for building your professional identity, connecting with opportunities, and growing your network.

NEXORA is a comprehensive professional career and networking platform designed specifically for students, freshers, and early-career developers. It seamlessly combines career networking, professional profile building, social feed interactions, job discovery, resume management, and real-time messaging into a single, cohesive experience.

## 1. Features

### 🔐 Authentication
* User registration
* Secure login
* JWT-based authentication
* Protected API routes
* Password hashing with bcrypt

### 👤 Professional Profiles
* Comprehensive profile information (About, Skills, Experience, Education)
* Profile avatar and cover image uploads
* Public profiles for networking
* Dynamic profile editing
* Delete/edit functionality for profile sections with confirmation modals

### 📝 Social Feed
* Create text and image/media posts
* Like and unlike posts
* Comment on posts and reply to comments
* Like comments and replies
* Edit and delete posts (with confirmation)
* Delete comments and replies
* Seamlessly view author profiles from their posts

### 🤝 Networking
* Send, accept, and reject connection requests
* Disconnect from existing connections
* Connection state handling across the platform
* View detailed profiles of other users

### 💼 Jobs
* Job listing and discovery
* Detailed job views
* Streamlined job application flow
* Application tracking (Applied, Withdrawn, Selected, Rejected states)

### 📄 Resume Management
* Upload and manage multiple resumes (PDFs)
* Select a specific resume when applying for a job
* Resume association with specific applications
* View and delete uploaded resumes

### 💬 Messaging
* One-to-one messaging
* Real-time messaging powered by Socket.IO
* Support for both text and image/media messages
* Persistent message history
* **Message actions**: Reply to messages, copy message text, and delete own messages
* Action confirmation modals for destructive operations

### 🔔 Notifications
* Real-time notifications for connections, post interactions, and system events
* Unread notification tracking and marking as read

## 2. Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React, React Router, Context API |
| **Build Tool** | Vite |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB |
| **ODM** | Mongoose |
| **Authentication**| JWT (JSON Web Tokens), bcryptjs |
| **Real-time** | Socket.IO |
| **Media Storage** | Cloudinary |
| **File Upload** | Multer |
| **Form Handling** | React Hook Form, Yup |
| **API Client** | Axios |

## 3. Architecture

NEXORA follows a standard MERN (MongoDB, Express, React, Node.js) stack architecture with Socket.IO for real-time features.

```text
NEXORA
│
├── client (Frontend)
│   ├── React application built with Vite
│   ├── Communicates with the backend via Axios (REST) and Socket.IO (Real-time)
│   └── Manages global state using React Context API
│
└── server (Backend)
    ├── Express.js REST API
    ├── Mongoose models for MongoDB data structures
    ├── Socket.IO server for real-time bidirectional event-based communication
    └── Cloudinary integration via Multer for media uploads
```

## 4. Project Structure

```text
Nexora/
├── client/
│   ├── src/
│   │   ├── components/      # Reusable UI components (layout, common, profile)
│   │   ├── context/         # React Context (AuthContext, SocketContext)
│   │   ├── pages/           # Route/Page components (Home, Profile, Jobs, Messages, etc.)
│   │   ├── services/        # API integration (api.js, authService.js, messageService.js)
│   │   ├── App.jsx          # Main application routing
│   │   └── main.jsx         # React entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── controllers/         # Request handlers (auth, post, message, job, etc.)
│   ├── middleware/          # Express middlewares (auth, upload)
│   ├── models/              # Mongoose schemas (User, Post, Message, Job, etc.)
│   ├── routes/              # Express API routes
│   ├── package.json
│   └── server.js            # Node/Express server entry point & Socket.IO setup
│
└── README.md
```

## 5. Installation & Setup

### Clone the repository
```bash
git clone https://github.com/AyushGupta-7/Nexora.git
cd Nexora
```

### Install Backend Dependencies
```bash
cd server
npm install
```

### Install Frontend Dependencies
```bash
cd ../client
npm install
```

## 6. Environment Variables

Create a `.env` file in the `server` directory with the following variables. 

> **Note:** Never commit `.env` files or secret credentials to GitHub.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## 7. Running the Project

You will need two terminal windows to run the frontend and backend concurrently.

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

The frontend will be accessible at `http://localhost:5173` and the backend API at `http://localhost:5000`.

## 8. API Overview

The backend exposes a RESTful API grouped by domain:

* **Authentication:** `/api/auth` (Login, Register, Get Me)
* **Users & Profiles:** `/api/profile` (Get user, Update profile, Get connections)
* **Posts:** `/api/posts` (Create, Read, Update, Delete posts and comments)
* **Networking:** `/api/network` (Send request, Accept/Reject, Disconnect)
* **Jobs:** `/api/jobs` (List jobs, Get job details)
* **Resumes:** `/api/resumes` (Upload resume, Get my resumes, Delete resume)
* **Applications:** `/api/applications` (Apply to job, Withdraw, Get my applications)
* **Messages:** `/api/messages` (Get conversations, Send message, Delete message)
* **Notifications:** `/api/notifications` (Get notifications, Mark as read)

## 9. Database Models

The MongoDB database is structured around these core models:

* **User:** Stores authentication details, profile info (skills, education, experience), and avatars.
* **Post:** Represents user feed posts (text, images) and nested comments/replies.
* **Connection:** Manages networking links between users (pending, accepted, rejected).
* **Job:** Job postings available on the platform.
* **Resume:** User-uploaded PDF resumes hosted on Cloudinary.
* **Application:** Tracks a user's application to a specific Job using a specific Resume.
* **Conversation:** Tracks participants and the last message in a chat thread.
* **Message:** Individual chat messages (text or image) linked to a Conversation.
* **Notification:** System alerts for user interactions (likes, comments, connections).

## 10. Media Handling

Media uploads (avatars, post images, chat images, and PDF resumes) are handled seamlessly:

1. Frontend sends FormData containing the file.
2. Backend intercepts it using `multer` middleware.
3. `multer-storage-cloudinary` directly streams the upload to **Cloudinary**.
4. The Cloudinary secure URL and Public ID are returned and stored in MongoDB documents for quick retrieval and persistence.

## 11. Real-Time Messaging

NEXORA leverages **Socket.IO** for real-time features:

* Bidirectional real-time message delivery in chat rooms based on Conversation IDs.
* "User is typing" indicators.
* Real-time message deletion sync (`message:deleted` events).
* Online status tracking.

## 12. Security

* **Authentication:** Secure JWT-based authentication for API access.
* **Password Protection:** bcrypt hashing for all user passwords.
* **Authorization:** Middleware enforces that only authorized users can mutate or delete their own data (e.g., you can only delete your own posts and messages).
* **Environment Variables:** Secrets are kept out of the codebase.
* **CORS:** Cross-Origin Resource Sharing is configured to prevent unauthorized domain access.

## 13. UI / UX

* **Professional Design:** Clean, modern interface tailored for career networking.
* **Responsive:** Fully responsive layouts for desktop, tablet, and mobile.
* **Destructive Actions:** Contextual confirmation modals for all destructive actions (deleting posts, messages, skills, disconnecting) instead of jarring browser alerts.
* **Interactive:** Hover states, action dropdowns, and dynamic UI updates for a lively user experience.

## 14. Screenshots

*(Screenshots can be added here in the future)*

## 15. Future Improvements

* Advanced job recommendations based on user skills.
* Resume-to-job parsing and matching algorithms.
* Recruiter and company specific workflows/dashboards.
* Enhanced global search and filtering capabilities.
* Detailed profile analytics and views tracking.

## 16. Learning / Development Notes

This project demonstrates a comprehensive understanding of modern full-stack development:
* **MERN Stack Mastery:** Building a complete ecosystem from database schema design to interactive frontend components.
* **Real-time Systems:** Implementing Socket.IO for live chat and presence.
* **Third-Party Integrations:** Utilizing Cloudinary for robust media and file hosting.
* **State Management:** Managing complex application state and auth flows in React.
* **API Design:** Designing clean, RESTful endpoints with proper error handling and authorization guards.
