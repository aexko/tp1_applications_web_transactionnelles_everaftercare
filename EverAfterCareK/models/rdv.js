
// schema pour rdv
const mongoose = require('mongoose');
const rdvSchema = new mongoose.Schema({
    date: { type: Date, required: true},
    heure: { type: String, required: true},
    docteur_id: { type: String, required: true},
    client_id: { type: String, required: true},
    type: { type: String, required: true}
});

const rdv = mongoose.model('Rdv', rdvSchema);

// pour l'acces dans les autres fichiers
module.exports = rdv;