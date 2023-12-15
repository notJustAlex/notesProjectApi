import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "User",
	},
	icon: {
		type: String,
		required: false,
		default: "",
	},
});

export default mongoose.model("Image", imageSchema);
