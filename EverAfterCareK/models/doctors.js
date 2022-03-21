
// schema pour doctor
const mongoose = require('mongoose');
const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true},
    email: { type: String, required: true},
    password: { type: String, required: true}
});

const doctor = mongoose.model('Doctor', doctorSchema);

// pour l'acces dans les autres fichiers
module.exports = doctor;