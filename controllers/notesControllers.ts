import Note from "../models/Note";
import User from "../models/User";
import express from "express";

const getAllNotes = async (
	_req: express.Request,
	res: express.Response
): Promise<any> => {
	const notes = await Note.find().lean();
	if (!notes?.length) {
		return res.status(400).json({ message: "No notes found" });
	}
	const notesWithUser = await Promise.all(
		notes.map(async (note) => {
			const user = await User.findById(note.user).lean().exec();
			return { ...note, username: user?.username };
		})
	);

	res.json(notesWithUser);
};

const createNewNote = async (
	req: express.Request,
	res: express.Response
): Promise<any> => {
	const { user, title, description, category } = req.body;

	if (!user || !title || !description || !category) {
		return res.status(400).json({ message: "All fields are required" });
	}

	const note = await Note.create({ user, title, description, category });
	if (note) {
		res.status(201).json({ message: `New note created` });
	} else {
		res.status(400).json({ message: "Invalid user data received" });
	}
};

const updateNote = async (
	req: express.Request,
	res: express.Response
): Promise<any> => {
	const { id, user, title, description, category, completed } = req.body;

	if (
		!id ||
		!title ||
		!description ||
		!category ||
		!user ||
		typeof completed !== "boolean"
	) {
		return res.status(400).json({ message: "All fields are required" });
	}

	const note = await Note.findById(id).exec();
	if (!note) {
		return res.status(400).json({ message: "Note not found" });
	}

	note.user = user;
	note.title = title;
	note.description = description;
	note.category = category;
	note.completed = completed;

	const updatedNote = await note.save();
	res.json({ message: `${updatedNote.title} updated` });
};

const deleteNote = async (
	req: express.Request,
	res: express.Response
): Promise<any> => {
	const { id } = req.body;

	if (!id) {
		return res.status(400).json({ message: "Note ID Required" });
	}

	const note = await Note.findById(id).exec();

	if (!note) {
		return res.status(400).json({ message: "Note not found" });
	}

	const result = await note.deleteOne();

	const reply = `Note '${result.title}' with ID ${result._id} deleted`;

	res.json(reply);
};

export { getAllNotes, createNewNote, updateNote, deleteNote };
