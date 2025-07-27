import express from "express"
import cors from "cors"
import connectDB from "./config/connect.js"
import userRoutes from "./routes/user.routes.js"
import projectRoutes from "./routes/project.routes.js"
import aiRoutes from "./routes/ai.routes.js"
import dotenv, { parse } from "dotenv"
import morgan from "morgan"
import cookieParser from 'cookie-parser';

import fs from "fs";
import path from "path";
import archiver from "archiver";
import { fileURLToPath } from "url";

dotenv.config()

connectDB();
const app=express()
app.use(cookieParser());
app.use(cors())
app.use(express.json())    
app.use(express.urlencoded({extended:true}))
app.use("/users",userRoutes)
app.use("/projects",projectRoutes)
app.use("/ai",aiRoutes)
app.use(morgan("dev"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_DIR = "D:/PROJECTS/AI_Project_Generator";

app.get("/download/:project", (req, res) => {
    const project = req.params.project;
    const folderPath = path.join(BASE_DIR, project);
  
    if (!fs.existsSync(folderPath)) {
      return res.status(404).send("❌ Project folder not found");
    }
  
    res.setHeader("Content-Disposition", `attachment; filename=${project}.zip`);
    res.setHeader("Content-Type", "application/zip");
  
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);
    archive.directory(folderPath, false);
    archive.finalize();
  });

app.get("/", (req,res)=>{
    res.send("Server is running")
})

export default app