import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';
import { generateResult } from './services/ai.service.js';

const port = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

// ------------------ AUTH MIDDLEWARE ------------------
io.use(async (socket, next) => {
    try {
        const token =
            socket.handshake.auth?.token ||
            socket.handshake.headers.authorization?.split(' ')[1];

        const projectId = socket.handshake.query.projectId;

        // Validate projectId before querying
        if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
            return next(new Error("Invalid or missing projectId"));
        }

        const project = await projectModel.findById(projectId);

        if (!project) {
            return next(new Error("Project not found"));
        }

        socket.project = project;

        // Validate token
        if (!token) {
            return next(new Error("Authentication token missing"));
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return next(new Error("Invalid or expired token"));
        }

        socket.user = decoded;

        next();
    } catch (error) {
        next(error);
    }
});

// ------------------ SOCKET EVENTS ------------------
io.on("connection", socket => {
    try {
        if (!socket.project) {
            console.error("❌ socket.project is missing! Cannot join room.");
            return socket.disconnect(true);
        }

        socket.roomId = socket.project._id.toString();

        console.log("✅ User connected, joining room:", socket.roomId);

        socket.join(socket.roomId);

        // ----------- MESSAGE EVENT -----------
        socket.on("project-message", async data => {
            const message = data.message;

            // Broadcast user message
            socket.broadcast.to(socket.roomId).emit("project-message", data);

            // AI processing
            const aiIsPresentInMessage = message.includes("@ai");

            if (aiIsPresentInMessage) {
                const prompt = message.replace("@ai", "").trim();

                const result = await generateResult(prompt);

                io.to(socket.roomId).emit("project-message", {
                    message: result,
                    sender: {
                        _id: "ai",
                        email: "AI"
                    }
                });
            }
        });

        // ----------- DISCONNECT -----------
        socket.on("disconnect", () => {
            console.log("🔌 User disconnected:", socket.id);
            socket.leave(socket.roomId);
        });

    } catch (err) {
        console.error("🔥 Error handling connection:", err);
    }
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
