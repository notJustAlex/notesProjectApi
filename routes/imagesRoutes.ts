import express from "express";
const router = express.Router();
import verifyJWT from "../middleware/verifyJWT";
import {
	deleteImage,
	getAllImages,
	sendImage,
} from "../controllers/imagesController";

router.route("/").get(getAllImages).patch(sendImage).delete(deleteImage);

module.exports = router;
