const express = require("express");
const mongoose = require("mongoose");
const app = express();
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const user = require("./models/user");
const methodOverride = require("method-override");
require('dotenv').config();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true}));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.flash());

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
.then(() => {
    app.listen(3000, () => {
        console.log('listening on port 3000');
    });
});


