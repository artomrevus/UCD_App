import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import mongoose from 'mongoose';


export const createTask = async (req, res) => {
    try {
        const {boardName, header, description, date} = req.body;
        const taskCreatorId = req.user._id;

        const newTask = await Task.create({
            boardName, 
            header, 
            description, 
            date
        });

        await newTask.save();


        // SOCKET IO: 
        
        const users = await User.find({ _id: { $ne: taskCreatorId } }).select("-password");
        const savePromises = [];

        users.forEach(user => {
            user.newTasks.push(newTask._id);
            savePromises.push(user.save());
        });
       
        await Promise.all(savePromises);

        users.forEach(user => {
            const userSocketId = getReceiverSocketId(user._id);
            if(userSocketId) {
                io.to(userSocketId).emit("newTask", newTask);
            }
        });


        res.status(201).json(newTask);

    } catch (error) {
        console.error("Error in createTask controller: ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}


export const getAllTasks = async (req, res) => {
    try {
        const allTasks = await Task.find({ });

        res.status(200).json(allTasks);

    } catch (error) {
        console.error("Error in getAllTasks controller: ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
};


export const deleteTask = async (req, res) => {
    try {
        const {id: taskId} = req.params;
        const taskDeletorId = req.user._id;

        const deletedTask = await Task.findByIdAndDelete(taskId);
        if (!deletedTask) {
            return res.status(404).send({error: 'Item not found'});
        }


        // SOCKET IO:

        const users = await User.find({ _id: { $ne: taskDeletorId } }).select("-password");

        users.forEach(user => {
            const userSocketId = getReceiverSocketId(user._id);
            if(userSocketId) {
                io.to(userSocketId).emit("deletedTask", deletedTask);
            }
        });
       

        res.status(200).send({responseMessage: 'Item deleted successfully'});

    } catch (error) {
        console.error("Error in deleteTask controller: ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
};


export const updateTask = async (req, res) => {
    try {
        const {boardName, header, description, date} = req.body;
        const taskUpdatorId = req.user._id;
        const {id: taskId} = req.params

        const updatedTask = await Task.findOneAndUpdate(
            { _id: taskId }, 
            {boardName, header, description, date}, 
            { new: true } 
        );

        await updatedTask.save();


        // SOCKET IO:

        const users = await User.find({ _id: { $ne: taskUpdatorId } }).select("-password");

        users.forEach(user => {
            const userSocketId = getReceiverSocketId(user._id);
            if(userSocketId) {
                io.to(userSocketId).emit("updatedTask", updatedTask);
            }
        });
       

        res.status(200).json(updatedTask);

    } catch (error) {
        console.error("Error in updateTask controller: ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
};