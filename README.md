# NEXORA

> A MERN-based professional networking and job platform focused on students, freshers, and early-career professionals.

NEXORA combines professional networking, daily progress sharing, job discovery, recruiter job posting, resume management, job applications, application tracking, recruiter applicant management, and real-time messaging. Built as a full-stack solution, it empowers users to build their careers while enabling recruiters to seamlessly find and manage emerging talent.

## User Roles

NEXORA features a role-based access control system supporting two distinct account types through a unified authentication system.

### User
The standard account for students and professionals. Users can:
* Create an account and build their professional profile (About, Skills, Education, Experience).
* Create social posts, including single-image or multiple-image posts (up to 5 images).
* Engage with the community by liking, commenting, and replying.
* Connect with other users to build a professional network.
* Use real-time messaging with their connections.
* Discover and view job postings.
* Maintain multiple PDF resumes.
* Select a specific resume when applying to a job.
* Track application status/stages and withdraw applications where allowed.
* View the specific resume they submitted for an application.

### Recruiter
Recruiters have access to all normal platform capabilities, plus exclusive hiring functionalities protected by backend authorization middleware.
* Separate recruiter registration flow.
* Recruiter-specific dashboard and "Post a Job" functionality.
* Create detailed job postings and attach a Job Description (JD) PDF.
* Manage job postings.
* View and download JD PDFs.
* View applicants for their posted jobs.
* View and download applicant resumes securely.
* Update applicant application stages (e.g., Shortlisted, Interview, Selected).
* Close applications to stop receiving new applicants.

## Job System

The platform provides a comprehensive job discovery and management system:
* Recruiter-created jobs automatically appear on the global Jobs page.
* Users and recruiters can view detailed job postings including required skills, salary, duration, and company information.
* Attached Job Description (JD) PDFs can be viewed inline or downloaded directly from the job details page.
* Users can apply using one of their uploaded resumes.
* The system actively prevents duplicate applications for the same job.
* Jobs the user has already applied to clearly display an "APPLIED" indicator badge.
* Applied job details provide a Withdraw functionality for the user (if the stage permits).
* When a recruiter marks a job application phase as closed, new applications are prevented while the job remains viewable.

## Application System

The application workflow bridges users and recruiters:
1. **Apply:** Users open a job, select a specific resume, and apply.
2. **Track:** The application appears in the user's "Applications" tab with its current stage.
3. **Manage:** Recruiters view the application, access the chosen resume, and update the candidate's stage.

**Application Stages:**
The system supports tracking candidates through the following stages: `Applied`, `Under Review`, `Shortlisted`, `Interview`, `DSA Round`, `Technical Interview`, `HR Interview`, `Selected`, `Rejected`, and `Withdrawn`.

* Enforces one application per user, per job.
* Retains a strict reference to the exact resume used during the application.
* Provides real-time reflection of recruiter stage updates to the user.

## Resume Management

Users have complete control over their application documents:
* Upload and manage multiple PDF resumes simultaneously.
* Maintain different resumes tailored for specific job profiles or roles.
* View and download their own resumes.
* Choose a specific resume dynamically when applying for a job.
* Applications retain the exact resume reference, ensuring recruiters see the correct version even if the user uploads new resumes later.
* Recruiters are securely authorized to view and download resumes only for applicants who applied to their specific jobs.

## JD PDF Handling

Recruiters can provide extensive context for their roles:
* Attach a Job Description (JD) PDF document while creating a new job posting.
* Users can seamlessly View the JD PDF in a modal.
* Users can Download the JD PDF directly to their device.

## Social / Networking Features

NEXORA fosters professional growth through community interaction:
* **Profiles:** Customizable avatars, cover images, About sections, Skills, Education, and Experience.
* **Posts:** Share updates with text, single images, or multiple images (strict limit of maximum 5 images per post).
* **Engagement:** Like, comment, and reply to community posts.
* **Content Management:** Edit or delete supported content securely.
* **Connections:** Send, accept, and reject connection requests to discover and build a professional network.

## Real-Time Chat

Stay connected with your network instantly:
* Secure one-to-one user messaging.
* Powered by **Socket.IO** for instantaneous, bidirectional event-based communication.
* Support for text messages and image attachments.
* Persistent message history stored in the database.
* Robust message actions: Reply, Copy, and Delete.
* Dynamic message action menu available for every message bubble.

## Notifications

Stay updated with platform activity:
* Real-time notifications for connection requests.
* Notifications for post interactions (likes, comments).
* Unread notification badge tracking.
* Mark all as read functionality.

## Responsive Design

NEXORA is built with a mobile-first, highly responsive approach. The platform is optimized for desktop, laptop, tablet, and mobile phones.
* Features a dedicated bottom navigation bar for mobile users.
* Forms, cards, and data tables automatically adapt to stacked layouts on smaller screens to prevent horizontal overflow.
* The application interface adapts seamlessly across the feed, profiles, recruiter dashboards, chat, and job details.

## Technology Stack

**Frontend:**
* React (v19)
* Vite (v8)
* JavaScript
* CSS (Vanilla, Mobile-First)
* React Router DOM
* React Hook Form & Yup (Validation)
* Axios

**Backend:**
* Node.js
* Express.js (v5)
* JSON Web Tokens (JWT) for authentication
* bcryptjs for password hashing

**Database:**
* MongoDB
* Mongoose (v9)

**Media / File Handling:**
* Cloudinary (Cloud Storage)
* Multer & multer-storage-cloudinary

**Real-Time:**
* Socket.IO (v4)

**Deployment:**
* Vercel (Frontend routing configured via `vercel.json`)

## Project Structure

```text
Nexora/
├── client/                 # Frontend React Application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable UI components (layout, home, chat, etc.)
│   │   ├── context/        # React Context (Auth, Socket)
│   │   ├── pages/          # Route pages (Home, Jobs, Profile, Messages, etc.)
│   │   ├── services/       # Axios API integration services
│   │   ├── App.jsx         # Main React Router setup
│   │   ├── index.css       # Global styles
│   │   └── main.jsx        # React entry point
│   ├── package.json
│   ├── vercel.json         # Vercel SPA routing config
│   └── vite.config.js
│
├── server/                 # Backend Node.js/Express Application
│   ├── controllers/        # Route controllers (auth, jobs, resumes, etc.)
│   ├── middleware/         # Custom middleware (auth guard, upload handlers)
│   ├── models/             # Mongoose schemas (User, Job, Application, etc.)
│   ├── routes/             # Express API routers
│   ├── package.json
│   └── server.js           # Server entry point & Socket.IO initialization
│
└── README.md
```

## Architecture

* **Frontend:** A React Single Page Application (SPA) that manages global state via Context API, communicates with the backend via REST APIs (Axios), and connects to Socket.IO for live chat.
* **Backend:** An Express.js REST API that handles business logic, securely hashes passwords, manages JWT authorization, and interacts with the MongoDB database using Mongoose.
* **Media:** Multer intercepts file uploads (resumes, images, JDs) and streams them directly to Cloudinary using `multer-storage-cloudinary`.
* **Real-time:** Socket.IO runs alongside the Express server, managing rooms based on conversation IDs to emit real-time chat events.
* **Authentication/Authorization:** Stateless JWT authentication. Specialized role-based middleware guards recruiter-only routes and validates ownership before allowing data mutations.

## API Overview

The backend exposes a structured RESTful API grouped logically:

* **Authentication:** `/api/auth` (Register, Login, Get Current User)
* **Profiles:** `/api/profile` (Get Profile, Update Profile, Search Users)
* **Posts:** `/api/posts` (Create Post, Get Feed, Like, Comment, Delete)
* **Network:** `/api/network` (Send Request, Accept/Reject, Get Connections)
* **Jobs:** `/api/jobs` (Create Job, Get Jobs, Get Job By ID)
* **Applications:** `/api/applications` (Apply, Get My Applications, Update Stage, Get Job Applicants)
* **Resumes:** `/api/resumes` (Upload, Get My Resumes, Delete, View/Download Proxy)
* **Messages:** `/api/messages` (Get Conversations, Get Messages, Send Message, Delete Message)
* **Notifications:** `/api/notifications` (Get Notifications, Mark Read)

## Database Models

The MongoDB database relies on these core models:

* **User:** Stores authentication details, role (`user` or `recruiter`), profile info (skills, education, experience), and Cloudinary media references.
* **Job:** Represents a job posting created by a recruiter. Includes JD references and recruiter ID.
* **Application:** Bridges a User, a Job, and a specific Resume. Tracks the candidate's current recruitment `stage`.
* **Resume:** Represents a user-uploaded PDF resume hosted on Cloudinary.
* **Post:** Represents user feed updates with text, an array of media items, and nested comments/replies.
* **Connection:** Manages networking links between two users and tracks the request status.
* **Conversation:** Tracks chat participants and the most recent message for the inbox view.
* **Message:** Individual chat messages (text/image) linked to a Conversation.
* **Notification:** System alerts for interactions (likes, connections).

## Security

NEXORA implements robust security practices:
* **JWT Authentication:** Secure token-based API access.
* **Password Hashing:** All passwords are mathematically hashed via `bcryptjs` before storage.
* **Protected Routes:** Frontend and backend guardrails prevent unauthenticated access.
* **Role-Based Authorization:** Recruiter functionality is strictly locked behind `isRecruiter` backend middleware.
* **Ownership Checks:** Backend controllers strictly verify ownership before allowing edits or deletions of Posts, Resumes, or Messages.
* **Secure PDF Proxy:** Recruiters accessing applicant resumes are authorized via an application-ownership lookup, preventing unauthorized direct access.
* **Environment Variables:** All secrets and API keys are stored securely in `.env` files and excluded from version control.

## Media / File Uploads

Cloudinary is utilized for seamless asset hosting:
* Profile avatars and cover images
* Post media (single or multiple images)
* Chat image attachments
* User Resumes (PDF)
* Recruiter Job Description (JD) PDFs

## Setup / Installation

### Prerequisites
* Node.js installed
* MongoDB instance (Local or Atlas)
* Cloudinary account

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

### Environment Variables

Create a `.env` file in the `server` directory. Use the following template:

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

### Running the Application

You will need two terminal windows to run the stack locally.

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

The frontend will start at `http://localhost:5173` and the backend will run on `http://localhost:5000`.

## Deployment

* **Frontend:** Configured for seamless deployment on **Vercel**. A `vercel.json` file handles the SPA routing fallback to `index.html`.

## Screenshots

*(Screenshots can be added here in the future)*

## Future Improvements

* Advanced job recommendations based on user skills.
* Resume-to-job parsing and matching algorithms.
* Detailed profile analytics and views tracking.
