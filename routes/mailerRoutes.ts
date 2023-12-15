import express from "express";
const router = express.Router();
import mailer from "../controllers/mailerController";

router.route("/").post(mailer);

module.exports = router;
