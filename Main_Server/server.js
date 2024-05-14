import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";
import conversationRoutes from "./routes/conversation.routes.js"
import taskRoutes from "./routes/task.routes.js"

import connectToMongoDB from './db/connectToMongoDB.js';
import { app, server } from './socket/socket.js';


const PORT = process.env.PORT || 5001;

dotenv.config();


app.use(express.json());
app.use(cookieParser());
app.use(express.static("frontend"));


app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes)
app.use("/api/tasks", taskRoutes)


server.listen(PORT, () => {
    connectToMongoDB();
    console.log(`Server running on port ${PORT}`);
});