const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.get('/', (req, res) => {
    res.render('index', {})
})

app.get('/connexion', (req, res) => {
    res.render('connexion');
})

app.get('/inscription', (req, res) => {
    res.render('inscription');
})
mongoose
    .connect('mongodb://localhost:27017/auth', { 
    useUnifiedTopology: true,
    useNewUrlParser: true,
})
