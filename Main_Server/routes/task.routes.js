import express from "express";

import {createTask, getAllTasks, deleteTask, updateTask} from "../controllers/task.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();


router.post("/", protectRoute, createTask);
router.get("/", protectRoute, getAllTasks);
router.delete("/:id", protectRoute, deleteTask);
router.put("/:id", protectRoute, updateTask);


export default router;