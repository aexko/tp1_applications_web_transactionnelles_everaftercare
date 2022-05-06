// schema pour services
const mongoose = require('mongoose');
const serviceSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    description: { type: String, required: true },
    prix: { type: Number, required: true },

});

const service = mongoose.model('Service', serviceSchema);

// pour l'acces dans les autres fichiers
module.exports = service;