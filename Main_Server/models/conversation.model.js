import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: []
        }
    ],
    // createdAt, updatedAt
}, {timestamps: true});

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;