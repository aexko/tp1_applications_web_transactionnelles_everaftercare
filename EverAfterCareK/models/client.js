// schema pour user
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
	first_name: {
		type: String,
		required: true,
	},
	last_name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	user_type: {
		type: String,
		enum: ["client", "docteur", "admin"],
		default: "client",
		required: true,
	},
	balance: {
		type: Number,
		required: true,
		default: 0,
	},
});

const user = mongoose.model("client", userSchema);

// pour l'acces dans les autres fichiers
module.exports = user;
