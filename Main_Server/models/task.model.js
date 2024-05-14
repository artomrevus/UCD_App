import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    boardName: {
        type: String,
        required: true
    },
    header: {
        type: String,
    },
    description: {
        type: String,
    },
    date: {
        type: Date,
    }
    // createdAt, updatedAt
}, {timestamps: true});

const Task = mongoose.model("Task", taskSchema);

export default Task;