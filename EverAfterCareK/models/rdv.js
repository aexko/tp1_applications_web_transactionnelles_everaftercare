
// schema pour rdv
const mongoose = require('mongoose');
const rdvSchema = new mongoose.Schema({
    date: { type: date, required: true},
    heure: { type: String, required: true},
    doctor: { type: String, required: true}
});

const rdv = mongoose.model('Rdv', rdvSchema);

// pour l'acces dans les autres fichiers
module.exports = rdv;