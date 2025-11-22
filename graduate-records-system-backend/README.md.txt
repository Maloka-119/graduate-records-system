# Backend - Graduate Records System

This is the backend of the Graduate Records System built with Node.js and Express.

## Requirements

- Node.js (v18+ recommended)
- npm
- PostgreSQL (or your preferred database)

## Installation

1. Open terminal and navigate to the backend folder:
```bash
cd backend
Install dependencies:

bash
Copy code
npm install
Configuration
Create a .env file in the backend folder with your database and server info. Example:

ini
Copy code
PORT=5000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=graduate_records
JWT_SECRET=your_secret_key
Running the Backend
bash
Copy code
npm run dev
The server will start at http://localhost:5000