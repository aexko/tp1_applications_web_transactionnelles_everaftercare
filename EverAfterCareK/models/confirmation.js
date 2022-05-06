// schema pour confirmation
const mongoose = require("mongoose");
const confirmationSchema = new mongoose.Schema({
	client_id: { type: String, required: true },
	type: { type: String, required: true, default: "newpass" }, //useless for now
	newpass: { type: String, required: true, default: "lol" },
});

const confirmation = mongoose.model("confirmation", confirmationSchema);

// pour l'acces dans les autres fichiers
module.exports = confirmation;
