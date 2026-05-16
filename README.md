# ConnectICT 🚀

### The ultimate networking hub for the Department of ICT.

ConnectICT is a professional networking platform designed specifically for the alumni, seniors, and juniors of the Department of ICT. It bridges the gap between students and professionals, enabling collaboration, mentorship, and career growth.

![ConnectICT Banner](https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200&h=400)

## ✨ Features

- 👥 **Connect**: Find and connect with alumni and peers from your department.
- 🏢 **Company Explorer**: See where fellow ICTians are working and browse members by company.
- 💻 **Project Showcase**: Automatically showcase your GitHub projects by adding `#ConnectICT` to your repository's README.
- 💼 **Job Board**: Discover and share job opportunities within the ICT network.
- 💬 **Real-time Messaging**: Connect directly with mentors and peers.
- 🗓️ **Events & Forum**: Stay updated with department events and engage in community discussions.
- 🛡️ **GitHub OAuth**: Secure and easy authentication using your GitHub account.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, CSS (Vanilla), Lucide Icons
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: Passport.js (GitHub Strategy), JWT
- **Deployment**: Render (Unified Service)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- GitHub Developer App (for OAuth)

### Installation & Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hinex-vaghadiya/ConnectICT.git
   cd ConnectICT
   ```

2. **Install dependencies:**
   ```bash
   # From the root directory
   npm install
   npm run install-all
   ```

3. **Set up environment variables:**
   Create a `.env` file in the `server/` directory and add:
   ```env
   MONGODB_URI=your_mongodb_uri
   GITHUB_CLIENT_ID=your_github_id
   GITHUB_CLIENT_SECRET=your_github_secret
   GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
   JWT_SECRET=your_jwt_secret
   SESSION_SECRET=your_session_secret
   CLIENT_URL=http://localhost:5173
   PORT=5000
   ```

4. **Run the application:**
   ```bash
   # Start both client and server from the root
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

## 🌐 Deployment (Render)

This project is configured for unified deployment on Render.

1. Connect your GitHub repository to Render.
2. Select **Web Service**.
3. Use the following configuration:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. Add the required Environment Variables in the Render dashboard.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
Built with ❤️ by the ICT Community.
