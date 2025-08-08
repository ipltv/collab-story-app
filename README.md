# Collaborative Storytelling App

Welcome to the Collaborative Storytelling App! This is a full-stack application built with React, TypeScript, Redux Toolkit, and a Node.js Express backend. It allows users to create, view, and work on stories.

## 🚀 Features
- **User Authentication**: Secure user registration, login, and logout.
- **Story Management**: Create, view, and manage your personal stories.
- **Collaboration**: Stories can be co-authored by multiple users.
- **Persistent Data**: All stories and user data are stored in a PostgreSQL database using `Knex.js` for migrations and queries.
- **State Management**: `Redux Toolkit` manages the application state, including asynchronous API calls with `createAsyncThunk`.
- **Secure API**: The backend API is protected with JWT for access tokens and HTTP-only cookies for refresh tokens.
- **Responsive UI**: Built with `Tailwind CSS` for a clean, modern, and responsive user interface.

## 🛠️ Tech Stack

### Frontend
- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
- **Redux Toolkit**: The official, opinionated, batteries-included toolset for efficient Redux development.
- **React Router**: For client-side routing.
- **Axios**: A promise-based HTTP client for the browser and Node.js.
- **js-cookie**: A simple, lightweight JavaScript API for handling cookies.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.

### Backend
- **Node.js & Express**: A fast, unopinionated, minimalist web framework for Node.js.
- **TypeScript**: Ensures type safety on the server.
- **PostgreSQL**: A powerful, open-source object-relational database system.
- **Knex.js**: A SQL query builder for Node.js.
- **bcrypt**: A library to help hash passwords.
- **jsonwebtoken**: A library to sign and verify JSON Web Tokens.
- **cookie-parser**: A middleware for parsing cookies.
- **dotenv**: To load environment variables from a `.env` file.
- **CORS**: Middleware to handle Cross-Origin Resource Sharing.

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database instance

### Installation
1. **Clone the repository:**
```
bash
git clone [repository-url]
cd [repository-name]
```

2. **Install dependencies for both frontend and backend:**
```
# From the backend and frontend root (2 folders)
npm install
# or
yarn install
```
3. **Configure Environment Variables:**
```
# Database configuration
DATABASE_URL="postgresql://user:password@host:port/database"

# JWT Secrets
JWT_SECRET="your_strong_access_token_secret"
JWT_REFRESH_SECRET="your_strong_refresh_token_secret"

# Server configuration
PORT=3000
ORIGIN_URL="http://localhost:5173" # The URL of your frontend application
NODE_ENV="development"
```

4. **Run Database Migrations:**
Use Knex.js to set up your database schema.
```
npm run knex migrate:latest
```

### Running the Application 
**Start the backend server:**
```
npm run dev
```
The server will run on the port specified in your .env file (e.g., http://localhost:3000).

**Start the frontend development server:**
```
npm run dev:client
```
The frontend will be available at the ORIGIN_URL specified in your .env file (e.g., http://localhost:5173).
