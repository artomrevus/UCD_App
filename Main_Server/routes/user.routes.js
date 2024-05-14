import express from "express";

import protectRoute from "../middleware/protectRoute.js";
import { getAllUsers, getUserById, tasksReviewed } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", protectRoute, getAllUsers);
router.get("/:id", protectRoute, getUserById);
router.put("/tasksreviewed", protectRoute, tasksReviewed);

export default router;