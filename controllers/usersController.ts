import User from "../models/User";
import Note from "../models/Note";
import Image from "../models/Image";
import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";

const getAllUsers = async (
	_req: express.Request,
	res: express.Response
): Promise<void> => {
	const users = await User.find().select("-password").lean();
	if (!users?.length) {
		res.status(400).json({ message: "No users found" });
		return;
	}
	res.json(users);
};

const createNewUser = async (
	req: express.Request,
	res: express.Response
): Promise<void> => {
	const {
		username,
		email: { name: email },
		password,
	} = req.body;

	if (!username || !password || !email) {
		res.status(400).json({ message: "All fields are required" });
		return;
	}

	const duplicate = await User.findOne({ username })
		.collation({ locale: "en", strength: 2 })
		.lean()
		.exec();

	const duplicateEmail = await User.findOne({ "email.name": email })
		.collation({ locale: "en", strength: 2 })
		.lean()
		.exec();

	if (duplicate) {
		res.status(409).json({ message: "Duplicate username" });
		return;
	}
	if (duplicateEmail) {
		res.status(409).json({ message: "Duplicate email" });
		return;
	}

	const hashedPwd = await bcrypt.hash(password, 10);

	const userObject = {
		username,
		email: {
			name: email,
		},
		password: hashedPwd,
	};

	const user = await User.create(userObject);

	const accessToken = jwt.sign(
		{
			UserInfo: {
				id: user._id,
			},
		},
		process.env.ACCESS_TOKEN_SECRET!,
		{ expiresIn: "15m" }
	);

	const refreshToken = jwt.sign(
		{ id: user._id },
		process.env.REFRESH_TOKEN_SECRET!,
		{ expiresIn: "7d" }
	);

	res.cookie("jwt", refreshToken, {
		httpOnly: true,
		secure: true,
		sameSite: "none",
		maxAge: 7 * 24 * 60 * 60 * 1000,
	});

	if (user) {
		res
			.status(201)
			.json({ message: `New user ${username} created`, accessToken });
	} else {
		res.status(400).json({ message: "Invalid user data received" });
	}
};

const updateUser = async (
	req: express.Request,
	res: express.Response
): Promise<void> => {
	const { id, username, email, password } = req.body;

	if (!id || !username || !email.name) {
		res.status(400).json({ message: "All fields are required" });
		return;
	}

	const user = await User.findById(id).exec();

	if (!user) {
		res.status(400).json({ message: "User not found" });
		return;
	}

	const duplicate = await User.findOne({ username })
		.collation({ locale: "en", strength: 2 })
		.lean()
		.exec();

	const duplicateEmail = await User.findOne({ "email.name": email.name })
		.collation({ locale: "en", strength: 2 })
		.lean()
		.exec();

	if (duplicate && duplicate?._id.toString() !== id) {
		res.status(409).json({ message: "Duplicate username" });
		return;
	}

	if (duplicateEmail && duplicateEmail?._id.toString() !== id) {
		res.status(409).json({ message: "Duplicate email" });
		return;
	}

	user.username = username;
	user.email = email;

	if (password) {
		user.password = await bcrypt.hash(password, 10);
	}

	const updatedUser = await user.save();

	const accessToken = jwt.sign(
		{
			UserInfo: {
				id: updatedUser._id,
			},
		},
		process.env.ACCESS_TOKEN_SECRET!,
		{ expiresIn: "15m" }
	);

	const refreshToken = jwt.sign(
		{ id: updatedUser._id },
		process.env.REFRESH_TOKEN_SECRET!,
		{ expiresIn: "7d" }
	);

	res.cookie("jwt", refreshToken, {
		httpOnly: true,
		secure: true,
		sameSite: "none",
		maxAge: 7 * 24 * 60 * 60 * 1000,
	});

	res.json({ message: `${updatedUser.username} updated`, accessToken });
};

const deleteUser = async (
	req: express.Request,
	res: express.Response
): Promise<void> => {
	const { id } = req.body;

	if (!id) {
		res.status(400).json({ message: "User ID Required" });
		return;
	}

	const user = await User.findById(id).exec();

	if (!user) {
		res.status(400).json({ message: "User not found" });
		return;
	}

	const notes = await Note.find({ user: id }).lean().exec();

	if (notes) {
		try {
			await Note.deleteMany({ user: id });
		} catch (err) {
			res
				.status(500)
				.json({ message: "An error occurred while deleting notes." });
			return;
		}
	}

	const images = await Image.find({ user: id }).lean().exec();

	if (images) {
		try {
			await Image.deleteMany({ user: id });
		} catch (err) {
			res
				.status(500)
				.json({ message: "An error occurred while deleting images." });
			return;
		}
	}

	const result = await user.deleteOne();

	res.json({ message: `Username ${result.username} deleted` });
};

export { getAllUsers, createNewUser, updateUser, deleteUser };
