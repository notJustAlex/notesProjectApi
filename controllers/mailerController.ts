import express from "express";
import nodemailer from "nodemailer";

const mailer = async (
	req: express.Request,
	res: express.Response
): Promise<void> => {
	const { recipient, subject, structure } = req.body;

	if (!recipient || !subject || !structure) {
		res.status(400).json({ message: "All fields are required" });
		return;
	}

	const config = {
		service: "gmail",
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	};

	const transporter = nodemailer.createTransport(config);

	const mail = {
		from: "Notes App",
		to: recipient,
		subject: subject,
		html: structure,
	};

	await transporter
		.sendMail(mail)
		.then((info) => {
			return res.status(201).json({ message: "Success", info: info.messageId });
		})
		.catch((err) => {
			return res.status(400).json({ message: err });
		});
};

export default mailer;
