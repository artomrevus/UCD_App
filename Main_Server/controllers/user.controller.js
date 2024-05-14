import User from "../models/user.model.js";

export const getAllUsers = async (req, res) => {
    try {
        const allUsers = await User.find({ }).select("-password");

        res.status(200).json(allUsers);

    } catch (error) {
        console.error("Error in getAllUsers controller: ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
};


export const getUserById = async (req, res) => {
    try {
        const {id: userId} = req.params;

        const user = await User.findOne({ _id: userId}).select("-password").populate('newTasks');

        res.status(200).json(user);

    } catch (error) {
        console.error("Error in getUsersExceptCurrent controller: ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
};


export const tasksReviewed = async (req, res) => {
    try {
        const currUserId = req.user._id;

        const user = await User.findOne({ _id: currUserId}).select("-password");
        user.newTasks = [];

        await user.save();

        res.status(200).json(user);

    } catch (error) {
        console.error("Error in tasksReviewed controller: ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
};