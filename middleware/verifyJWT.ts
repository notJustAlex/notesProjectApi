import jwt, { VerifyErrors } from "jsonwebtoken";
import express from "express";

const verifyJWT = (
	req: express.Request,
	res: express.Response,
	next: express.NextFunction
) => {
	const authHeader = req.headers.authorization || req.headers.Authorization;

	if (typeof authHeader !== "string" || !authHeader?.startsWith("Bearer ")) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const token: string = authHeader?.split(" ")[1];

	jwt.verify(
		token,
		process.env.ACCESS_TOKEN_SECRET!,
		(err: VerifyErrors | null, decoded: any) => {
			if (err) return res.status(403).json({ message: "Forbidden" });
			// @ts-ignore
			req.user = decoded.UserInfo.username;
			next();
		}
	);
};

export default verifyJWT;
