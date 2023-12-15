import Image from "../models/Image";
import express from "express";

const getAllImages = async (
	_req: express.Request,
	res: express.Response
): Promise<void> => {
	const images = await Image.find().lean();
	if (!images?.length) {
		res.status(400).json({ message: "No images found" });
		return;
	}
	res.json(images);
};

const sendImage = async (
	req: express.Request,
	res: express.Response
): Promise<void> => {
	const { icon, user } = req.body;

	if (!icon || !user) {
		res.status(400).json({ message: "All fields are required" });
		return;
	}

	const image = await Image.findOne({ "user.id": user.id }).exec();

	if (!image) {
		await Image.create({ icon, user });
		res.json({ message: `${user.username}'s image created` });
	} else {
		image.icon = icon;

		await image.save();
		res.json({ message: `${user.username}'s image updated` });
	}
};

const deleteImage = async (
	req: express.Request,
	res: express.Response
): Promise<void> => {
	const { id } = req.body;

	if (!id) {
		res.status(400).json({ message: "Image Required" });
		return;
	}

	const foundImage = await Image.findOne({ user: id }).exec();

	if (!foundImage) {
		res.status(400).json({ message: "Image not found" });
		return;
	}

	await foundImage.deleteOne();

	res.json({ message: `Image deleted` });
};

export { getAllImages, sendImage, deleteImage };
