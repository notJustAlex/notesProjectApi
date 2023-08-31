import Note from "../models/Note";
import User from "../models/User";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import express from "express";

const getAllNotes = asyncHandler(
	async (_req: express.Request, res: express.Response): Promise<any> => {
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
	}
);

const createNewNote = asyncHandler(
	async (req: express.Request, res: express.Response): Promise<any> => {
		const { user, title, description, topic } = req.body;

		if (!user || !title || !description || !topic) {
			return res.status(400).json({ message: "All fields are required" });
		}

		const note = await Note.create({ user, title, description, topic });
		if (note) {
			res.status(201).json({ message: `New note created` });
		} else {
			res.status(400).json({ message: "Invalid user data received" });
		}
	}
);

const updateNote = asyncHandler(
	async (req: express.Request, res: express.Response): Promise<any> => {
		const { id, user, title, description, topic } = req.body;

		if (!id || !title || !description || !topic || !user) {
			return res.status(400).json({ message: "All fields are required" });
		}

		const note = await Note.findById(id).exec();
		if (!note) {
			return res.status(400).json({ message: "Note not found" });
		}

		note.user = user;
		note.title = title;
		note.description = description;
		note.topic = topic;

		const updatedNote = await note.save();
		res.json({ message: `${updatedNote.title} updated` });
	}
);

const deleteNote = asyncHandler(
	async (req: express.Request, res: express.Response): Promise<any> => {
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
	}
);

export { getAllNotes, createNewNote, updateNote, deleteNote };
