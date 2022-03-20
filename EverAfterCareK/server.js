const titreSite = "EverAfterCare";
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const User = require("./models/users");
const methodOverride = require("method-override");
require("dotenv").config();
const bcrypt = require("bcryptjs");

const {
	checkAuthenticated,
	checkNotAuthenticated,
} = require("./middlewares/auth");

const initializePassport = require("./passport-config");
initializePassport(
	passport,
	async (email) => {
		const userFound = await User.findOne({ email });
		return userFound;
	},
	async (id) => {
		const userFound = await User.findOne({ _id: id });
		return userFound;
	}
);
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(flash());
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: true,
		saveUnitialized: true,
	})
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

app.get("/", checkAuthenticated, (req, res) => {
	res.render("index", {});
	res.render("index", {
		titrePage: "Accueil",
		titreSite: titreSite,
	});
});

app.get("/connexion", checkNotAuthenticated, (req, res) => {
	res.render("connexion");
	res.render("connexion", {
		titrePage: "Connexion",
		titreSite: titreSite,
	});
});

app.get("/inscription", checkNotAuthenticated, (req, res) => {
	res.render("inscription");
});
	res.render("inscription", {
		titrePage: "Inscription",
		titreSite: titreSite,
	});});

app.post(
	"/connexion",
	checkNotAuthenticated,
	passport.authenticate("local", {
		successRedirect: "/profil",
		failureRedirect: "/connexion",
		failureFlash: true,
	})
);

app.post("/inscription", checkNotAuthenticated, async (req, res) => {
	const userFound = await User.findOne({ email: req.body.email });

	if (userFound) {
		req.flash(
			"error",
			"Il existe déjà un utilisateur avec cette adresse courriel."
		);
		res.redirect("/inscription");
	} else {
		try {
			const hashedPassword = await bcrypt.hash(req.body.password, 10);
			const user = new User({
				name: req.body.name,
				email: req.body.email,
				password: hashedPassword,
			});

            await user.save();
            res.redirect('/connexion');
		} catch (error) {
			console.log(error);
			res.redirect("/inscription");
		}
	}
});

app.delete("/deconnexion", (req, res) => {
	req.logOut();
	res.redirect("/connexion");
});

app.get("/profil/",checkAuthenticated, (req, res) => {
	res.render("profil", {
		titrePage: "Votre profil",
		titreSite: titreSite,
        name: req.user.name
	});
})

// Connexion à MongoDB
mongoose
	.connect("mongodb://127.0.0.1:27017/auth", {
		useUnifiedTopology: true,
		useNewUrlParser: true,
	})
	.then(() => {
		app.listen(3000, () => {
			console.log("listening on port 3000");
		});
	});
