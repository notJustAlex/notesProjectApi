import express from "express";
const router = express.Router();
import path from "path";

router.get(
	"^/$|/index(.html)?",
	(req: express.Request, res: express.Response) => {
		res.sendFile(path.join(__dirname, "..", "views", "index.html"));
	}
);

module.exports = router;
