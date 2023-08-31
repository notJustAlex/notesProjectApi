import User from "../models/User";
import Note from "../models/Note";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import express from "express";

const getAllUsers = asyncHandler(
	async (_req: express.Request, res: express.Response): Promise<any> => {
		const users = await User.find().select("-password").lean();
		if (!users?.length) {
			return res.status(400).json({ message: "No users found" });
		}
		res.json(users);
	}
);

const createNewUser = asyncHandler(
	async (req: express.Request, res: express.Response): Promise<any> => {
		const { username, password } = req.body;

		if (!username || !password) {
			return res.status(400).json({ message: "All fields are required" });
		}

		const duplicate = await User.findOne({ username }).lean().exec();

		if (duplicate) {
			return res.status(409).json({ message: "Duplicate username" });
		}

		const hashedPwd = await bcrypt.hash(password, 10);

		const userObject = { username, password: hashedPwd };

		const user = await User.create(userObject);

		if (user) {
			res.status(201).json({ message: `New user ${username} created` });
		} else {
			res.status(400).json({ message: "Invalid user data received" });
		}
	}
);

const updateUser = asyncHandler(
	async (req: express.Request, res: express.Response): Promise<any> => {
		const { id, username, password } = req.body;

		if (!id || !username) {
			return res.status(400).json({ message: "All fields are required" });
		}

		const user = await User.findById(id).exec();

		if (!user) {
			return res.status(400).json({ message: "User not found" });
		}

		const duplicate = await User.findOne({ username }).lean().exec();

		if (duplicate && duplicate?._id.toString() !== id) {
			return res.status(409).json({ message: "Duplicate username" });
		}

		user.username = username;

		if (password) {
			user.password = await bcrypt.hash(password, 10);
		}

		const updatedUser = await user.save();

		res.json({ message: `${updatedUser.username} updated` });
	}
);

const deleteUser = asyncHandler(
	async (req: express.Request, res: express.Response): Promise<any> => {
		const { id } = req.body;

		if (!id) {
			return res.status(400).json({ message: "User ID Required" });
		}

		const note = await Note.findOne({ user: id }).lean().exec();
		if (note) {
			return res.status(400).json({ message: "User has assigned notes" });
		}

		const user = await User.findById(id).exec();

		if (!user) {
			return res.status(400).json({ message: "User not found" });
		}

		const result = await user.deleteOne();

		const reply = `Username ${result.username} deleted`;

		res.json(reply);
	}
);

export { getAllUsers, createNewUser, updateUser, deleteUser };
