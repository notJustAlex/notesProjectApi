import express from "express";
import { logEvents } from "./logger";

const errorHandler = (
	err: Error,
	req: express.Request,
	res: express.Response,
	next: express.NextFunction
) => {
	logEvents(
		`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
		"errLog.log"
	);
	const status = res.statusCode ? res.statusCode : 500;

	res.status(status);

	res.json({ message: err.message, isError: true });
};

export default errorHandler;
