import Conversation from "../models/conversation.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import mongoose from 'mongoose';


export const createConversation = async (req, res) => {
    try {
        const {name, conversationParticipants} = req.body;

        if (!Array.isArray(conversationParticipants)) {
            return res.status(400).json({ error: 'conversationParticipants must be an array' , conversationParticipants});
        }

        const { ObjectId } = mongoose.Types;
        const participantsObjectIds = conversationParticipants.map(id => new ObjectId(id));

      
        const conversation = await Conversation.create({
            name,
            participants: participantsObjectIds 
        });

        await conversation.save();

        // SOCKET IO: 
        
        participantsObjectIds.forEach(practicipantId => {
            const practicipantSocketId = getReceiverSocketId(practicipantId);
            if(practicipantSocketId) {
                io.to(practicipantSocketId).emit("newConversation", conversation);
            }
        });
       

        res.status(201).json(conversation);

    } catch (error) {
        console.error("Error in createConversation controller: ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}


export const updateConversation = async (req, res) => {
    try {
        const {name, conversationParticipants} = req.body;
        const {id: conversationId} = req.params;

        if (!Array.isArray(conversationParticipants)) {
            return res.status(400).json({ error: 'conversationParticipants must be an array' , conversationParticipants});
        }

        const { ObjectId } = mongoose.Types;
        const participantsObjectIds = conversationParticipants.map(id => new ObjectId(id));

        const oldConversation = await Conversation.findOne( { _id: conversationId });

        const conversation = await Conversation.findOneAndUpdate(
            { _id: conversationId }, 
            { name: name, participants: participantsObjectIds }, 
            { new: true } 
        );
      
        if(!conversation) {
            return res.status(404).json({ error: "Conversation with this id doesn't exist"});
        }


        await conversation.save();


        // SOCKET IO: 
        
        conversation.participants.forEach(practicipantId => {
            const practicipantSocketId = getReceiverSocketId(practicipantId);
            if(practicipantSocketId) {
                if(!oldConversation.participants.includes(practicipantId)) {
                    io.to(practicipantSocketId).emit("addedToConversation", conversation);
                }
            }
        });

        oldConversation.participants.forEach(practicipantId => {
            const practicipantSocketId = getReceiverSocketId(practicipantId);
            if(practicipantSocketId) {
                if(!conversation.participants.includes(practicipantId)) {
                    io.to(practicipantSocketId).emit("removedFromConversation", conversation);
                }
            }
        });

        conversation.participants.forEach(practicipantId => {
            const practicipantSocketId = getReceiverSocketId(practicipantId);
            if(practicipantSocketId) {
                if(oldConversation.name !== conversation.name) {
                    io.to(practicipantSocketId).emit("conversationNameChanged", conversation, oldConversation.name);
                }
            }
        });

       

        res.status(200).json(conversation);

    } catch (error) {
        console.error("Error in updateConversationPracticipants controller: ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}


export const getConversationById = async (req, res) => {
    try {
        const {id: conversationId} = req.params;
        
        const conversation = await Conversation.findOne({
            _id : conversationId
        }).populate("messages");

        if(!conversation){
            return res.status(404).json({error: "Conversation not found"});
        }

        res.status(200).json(conversation);

    } catch (error) {
        console.error("Error in getConversationById controller: ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}


export const getAllConversationsWithCurrentUser = async (req, res) => {
    try {
        const currUserId = req.user._id;

        const conversationsWithUser = await Conversation.find({ participants: currUserId }).populate("messages");

        res.status(200).json(conversationsWithUser);

    } catch (error) {
        console.error("Error in getAllConversationsWithCurrentUser controller: ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}