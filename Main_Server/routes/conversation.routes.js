import express from "express";

import {createConversation, updateConversation, getConversationById, getAllConversationsWithCurrentUser} from "../controllers/conversation.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();


router.post("/", protectRoute, createConversation);
router.put("/:id", protectRoute, updateConversation);
router.get("/:id", protectRoute, getConversationById);
router.get("/", protectRoute, getAllConversationsWithCurrentUser);


export default router;