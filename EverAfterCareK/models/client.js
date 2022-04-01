
// schema pour user
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true},
    last_name: { type: String, required: true},
    email: { type: String, required: true},
    password: { type: String, required: true},
    user_type: { type: String,"enum": ["client", "docteur"], default : "client", required: true}
});

const user = mongoose.model('client', userSchema);

// pour l'acces dans les autres fichiers
module.exports = user;