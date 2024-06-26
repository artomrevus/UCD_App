import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";


export const sendMessage = async (req, res) => {
    try {
        const {message} = req.body;
        const {id: conversationId } = req.params;
        const senderId = req.user._id;
      
        let conversation = await Conversation.findOne({
            _id : conversationId
        });
      
        if(!conversation) {
            res.status(404).json({error: "Conversation not found"});
        }

        const newMessage = new Message({
            senderId,
            conversationId,
            message
        });

        if(newMessage) {
            conversation.messages.push(newMessage._id);
        }

        await Promise.all([conversation.save(), newMessage.save()]);


        // SOCKET IO: 
        
        conversation.participants.forEach(practicipantId => {
            const practicipantSocketId = getReceiverSocketId(practicipantId);
            if(practicipantSocketId) {
                io.to(practicipantSocketId).emit("newMessage", newMessage);
            }
        });


        res.status(201).json(newMessage);

    } catch (error) {
        console.error("Error in sendMessage controller: ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
};


export const getMessages = async (req, res) => {
    try {
        const {id: userToChatId} = req.params;
        const senderId = req.user._id;
        
        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] }
        }).populate("messages");

        if(!conversation){
            return res.status(200).json([]);
        }

        res.status(200).json(conversation.messages);

    } catch (error) {
        console.error("Error in getMessages controller: ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}
