# NexChat 📱

A secure, real-time messaging app built with React Native.

## Features

- 💬 **Real-Time Chat**: Instant message delivery using Socket.IO.
- 🔐 **Secure Authentication**: JWT-based authentication and encrypted storage.
- 👥 **Contact List**: Clean interface to manage and view contacts.
- ⚡ **Admin Dashboard**: Centralized monitoring for application health.

## Tech Stack

- **Frontend**: React Native
- **Backend**: Node.js & Express
- **Database**: MongoDB
- **Real-time Engine**: Socket.IO
- **Authentication**: JWT (JSON Web Tokens)

## Installation

### Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Update the `.env` file with your configuration:
    ```bash
    PORT=3000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    ```
4.  Run the server:
    ```bash
    npm start
    ```

### Frontend Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  **Important**: In `socket.js`, update the `io` URL to match your backend IP:
    ```javascript
    // Replace with your backend IP
    socket = io("http://[IP_ADDRESS]", { ... });
    ```
4.  Start the application:
    ```bash
    npm start
    ```

## Usage

1.  Launch the app on your device or emulator.
2.  **First Time Users**: Use the **Register** button to create an account.
3.  **Existing Users**: Use the **Login** button to sign in.
4.  Once logged in, you will be redirected to the **Contacts** list to start chatting.
 