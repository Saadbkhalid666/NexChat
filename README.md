# 🚀 NexChat - Premium Real-Time Messaging

NexChat is a high-performance, real-time messaging application built for seamless communication. Featuring a modern glassmorphic UI, secure authentication, and a powerful administrative dashboard, NexChat delivers a premium chat experience on mobile.

---

## ✨ Key Features

### 💬 Seamless Communication
- **Real-Time Messaging**: Powered by Socket.IO for instantaneous message delivery.
- **Dynamic Contact Discovery**: Automatically syncs and displays available contacts.
- **Interactive Chat Interface**: Smooth keyboard management and typing indicators.

### 🛡️ Secure & Robust
- **JWT Authentication**: Secure token-based user sessions.
- **Persistent Sessions**: Automated login using encrypted local storage (AsyncStorage).
- **Role-Based Access**: Specialized permissions for Users and Administrators.

### 📊 Powerful Administration
- **Advanced Dashboard**: Real-time monitoring of system health.
- **Data Visualization**: Beautifully rendered charts for message volume and user growth.
- **User Management**: Direct control over user accounts and message history.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React Native (Expo), Linear Gradient, Reanimated |
| **Backend** | Node.js, Express.js |
| **Real-time** | Socket.IO |
| **Database** | MongoDB (Mongoose) |
| **Analytics** | Gifted Charts (Bar, Line, Donut) |
| **Auth** | JWT, Bcrypt |

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v16+)
- Expo Go app on your mobile device (for testing)
- MongoDB instance (Local or Atlas)

### 2. Backend Installation
```bash
cd backend
npm install
```
**Configure Environment Variables (.env):**
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_premium_jwt_secret
```
**Start Server:**
```bash
npm run dev
```

### 3. Frontend Installation
```bash
cd frontend
npm install
```
**Configure API Endpoint (`axios.js`):**
Ensure the `baseURL` matches your local IP address:
```javascript
baseURL: "http://[YOUR_LOCAL_IP]:3000/api"
```
**Start Expo:**
```bash
npx expo start -c
```

---

## 📱 User Roles

| Role | Permissions |
| :--- | :--- |
| **👤 User** | Chat with contacts, view profile, manage personal messages. |
| **👑 Admin** | All User features + Full Dashboard access, user management, and global analytics. |

---

## 🎨 UI Aesthetics
NexChat prioritizes a **Modern Dark Aesthetic**:
- **Glassmorphism**: Translucent headers and dropdowns.
- **Vibrant Gradients**: Custom color palettes for stat cards and buttons.
- **Fluid Animations**: Smooth transitions and interactive elements.

---

## 👨‍💻 Development
This project is under active development. For contribution or feedback, please reach out via GitHub.

---

*Built with ❤️ by Saad Bin Khalid*