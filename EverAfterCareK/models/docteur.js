
// schema pour doctor
const mongoose = require('mongoose');
const doctorSchema = new mongoose.Schema({
    first_name: { type: String, required: true},
    last_name: { type: String, required: true},
    email: { type: String, required: true},
    password: { type: String, required: true},
    phone_number: {type: String, required: true}
});

const doctor = mongoose.model('docteur', doctorSchema);

// pour l'acces dans les autres fichiers
module.exports = doctor;