# 🏴‍☠️ Anime World Project

A full-stack Node.js & Express application that catalogs anime characters. It uses a **Hybrid Database Architecture**: static content (Animes) is served via JSON files for performance, while dynamic user data (Users, Favorites) is stored in **MongoDB**.

---

## 🚀 Features
* **Authentication:** Secure Login/Signup using MongoDB & Sessions.
* **Hybrid Data:** Combines `fs` (File System) for static content and Mongoose for user data.
* **Browsing:** View details for Anime and specific Characters.
* **Favorites:** Create a private collection of favorite characters (stored in DB).
* **Tech Stack:** Node.js, Express, MongoDB (Mongoose), EJS, CSS (Glassmorphism).

---

## 🛠️ Prerequisites
Before running this project, make sure you have the following installed:
1. **Node.js**
2. **MongoDB** (Make sure the local service is running)

---
## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/TANAY-BARGIR/Anime-World-Project.git](https://github.com/TANAY-BARGIR/Anime-World-Project.git)
   cd Anime-World-Project
2. **Install Dependencies** (This installs Express, EJS, Cookie-Session, etc.)
   ```bash
   npm install
3. Configure Environment Variables Create a file named .env in the root folder and add the following:
   ```bash
   SESSION_SECRET=your_secret_key_here
   MONGODB_URI=mongodb://127.0.0.1:27017/anime_world
5. Start the Server
   ```bash
   node server.js
6. Visit the App
   Open your browser and go to: [http://localhost:3000](http://localhost:3000)

---

## 📂 Project Structure
- `server.js` — Main application logic and routes.
- `models/` — Mongoose Schemas (User.js, Favorite.js).
- `views/` — EJS templates (Frontend).
- `public/` — CSS and Images.
- `data/` — JSON files acting as the database.

---

## 👤 Author
Tanay Bargir
