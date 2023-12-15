import express from "express";
import { format } from "date-fns";
import { v4 as uuid } from "uuid";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";

const logEvents = async (message: string, logFileName: string) => {
	const dateTime = format(new Date(), "yyyyMMdd\tHH:mm:ss");
	const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

	try {
		if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
			await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
		}
		await fsPromises.appendFile(
			path.join(__dirname, "..", "logs", logFileName),
			logItem
		);
	} catch (error: any) {
		throw new Error(error);
	}
};

const logger = (
	req: express.Request,
	res: express.Response,
	next: express.NextFunction
) => {
	logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log");
	next();
};

export { logger, logEvents };
