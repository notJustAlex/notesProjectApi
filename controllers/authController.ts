import User from "../models/User";
import bcrypt from "bcrypt";
import jwt, { VerifyErrors } from "jsonwebtoken";
import express from "express";

const login = async (
	req: express.Request,
	res: express.Response
): Promise<void> => {
	const { username, password } = req.body;

	if (!username || !password) {
		res.status(400).json({ message: "All fields are required" });
		return;
	}

	let foundUser;

	if (username.includes("@")) {
		foundUser = await User.findOne({ "email.name": username }).exec();
	} else {
		foundUser = await User.findOne({ username }).exec();
	}

	if (!foundUser) {
		res.status(401).json({ message: "Unauthorized" });
		return;
	}

	const match = await bcrypt.compare(password, foundUser.password);

	if (!match) {
		res.status(401).json({ message: "Unauthorized" });
		return;
	}

	const accessToken = jwt.sign(
		{
			UserInfo: {
				id: foundUser._id,
			},
		},
		process.env.ACCESS_TOKEN_SECRET!,
		{ expiresIn: "15m" }
	);

	const refreshToken = jwt.sign(
		{ id: foundUser._id },
		process.env.REFRESH_TOKEN_SECRET!,
		{ expiresIn: "7d" }
	);

	res.cookie("jwt", refreshToken, {
		httpOnly: true,
		secure: true,
		sameSite: "none",
		maxAge: 7 * 24 * 60 * 60 * 1000,
	});

	res.json({ accessToken });
};

const refresh = (req: express.Request, res: express.Response): void => {
	const cookies = req.cookies;

	if (!cookies?.jwt) {
		res.status(401).json({ message: "Unauthorized" });
		return;
	}

	const refreshToken = cookies.jwt;

	jwt.verify(
		refreshToken,
		process.env.REFRESH_TOKEN_SECRET!,
		async (err: VerifyErrors | null, decoded: any) => {
			if (err) return res.status(403).json({ message: "Forbidden" });

			const foundUser = await User.findById(decoded?.id).exec();

			if (!foundUser) return res.status(401).json({ message: "Unauthorized" });

			const accessToken = jwt.sign(
				{
					UserInfo: {
						id: foundUser._id,
					},
				},
				process.env.ACCESS_TOKEN_SECRET!,
				{ expiresIn: "15m" }
			);

			res.json({ accessToken });
		}
	);
};

const logout = (req: express.Request, res: express.Response): void => {
	const cookies = req.cookies;
	if (!cookies?.jwt) {
		res.sendStatus(204);
		return;
	}
	res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
	res.json({ message: "Cookie cleared" });
};

export default { logout, login, refresh };
