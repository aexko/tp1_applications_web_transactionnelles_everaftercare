/**
 * Importation de tous les modules requis
 * pour le fonctionnement de l'application
 */

var express = require("express");
var http = require("http");
var mysql = require("mysql");
var app = express();
var bodyParser = require("body-parser");

/**
 * Parse all the data form
 */
app.use(bodyParser.urlencoded({ extended: true }));

module.exports = app;

/**
 * Pour le formatage des dates
 */
var dateFormat = require("dateformat");
var now = new Date();

/**
 * Pour activer EJS
 */
app.set("view engine", "ejs");

/**
 * Pour importer tous les fichiers JS et CSS relatifs pour l'injecter dans notre application
 */
app.use("/js", express.static(__dirname + "/node_modules/bootstrap/dist/js"));
app.use("/js", express.static(__dirname + "/node_modules/tether/dist/js"));
app.use("/js", express.static(__dirname + "/node_modules/jquery/dist"));
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));

/**
 * Pour que l'application puisse voir le dossier
 */
app.use(express.static("public"));

/**
 * Pour que l'application puisse accéder aux images
 */
app.use(express.static("images"));

/**
 * Pour la connexion de l'application -> la base de données
 */
var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "mybd",
});

/**
 * Nom du site + URL de base
 */
const siteTitle = "EverAfterCare";
const baseURL = "http://localhost:4000/";

/**
 * La page d'accueil
 */
app.get("/", function (req, res) {
	res.render("pages/index", {
		siteTitle: siteTitle,
		pageTitle: "Accueil",
		items: null,
	});
});

/**
 * La connexion au serveur sur le port 4000
 */
var server = app.listen(4000, function () {
	console.log("serveur fonctionne sur 4000... ! ");
});
