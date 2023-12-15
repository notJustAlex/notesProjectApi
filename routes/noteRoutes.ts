import express from "express";
const router = express.Router();
import {
	getAllNotes,
	createNewNote,
	updateNote,
	deleteNote,
} from "../controllers/notesControllers";
import verifyJWT from "../middleware/verifyJWT";

router.use(verifyJWT);

router
	.route("/")
	.get(getAllNotes)
	.post(createNewNote)
	.patch(updateNote)
	.delete(deleteNote);

module.exports = router;
