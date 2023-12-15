import express from "express";
const router = express.Router();
import {
	getAllUsers,
	updateUser,
	deleteUser,
	createNewUser,
} from "../controllers/usersController";
import verifyJWT from "../middleware/verifyJWT";

router
	.route("/")
	.get(getAllUsers)
	.post(createNewUser)
	.patch(updateUser)
	.delete(verifyJWT, deleteUser);

module.exports = router;
