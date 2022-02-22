/**
 * import all modules
 **/

var express = require("express");
var http = require("http");
var mysql = require("mysql");
var app = express();
var bodyParser = require("body-parser");

/*
app.use((req, res, next) => {
	console.log('Requête reçue !');
	next(); // passer au prochain middleware
  });
  
  app.use((req, res, next) => {
	res.json({ message: 'Votre requête a bien été reçue !' });
	next();
  });
  app.use((req, res, next) => {
	console.log('Réponse envoyée avec succès !');
	next();
  });
  */

/*
 * parse all form data
 */
app.use(bodyParser.urlencoded({ extended: true }));

module.exports = app;
/*
 *used for formatting dates
 */
var dateFormat = require("dateformat");
const { debug } = require("console");
var now = new Date();

/*
 * view engine template parsing (ejs types)
 */

app.set("view engine", "ejs");

/**
 * import all related Javascript and css files to inject in our app
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
 * connection à la BD
 */

var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "eac",
});

/*
 * Global site title and base url
 */

const siteTitle = "EverAfterCare";
const baseURL = "http://localhost:4000/";
/*
 * Envoyer le contenu au client
 * get the event list
 */
app.get("/", function (req, res) {
	con.query("SELECT * FROM client ORDER BY id DESC", function (err, result) {
		res.render("pages/index", {
			siteTitle: siteTitle,
			pageTitle: "Accueil",
			items: result,
		});
	});
});

app.get("/debug", function (req, res) {
	con.query("SELECT * FROM client ORDER BY id DESC", function (err, result) {
		res.render("pages/debug", {
			siteTitle: siteTitle,
			pageTitle: "Liste Client Debug",
			items: result,
		});
	});
});

app.get("/debugD", function (req, res) {
	con.query("SELECT * FROM docteur ORDER BY id DESC", function (err, result) {
		res.render("pages/debug", {
			siteTitle: siteTitle,
			pageTitle: "Liste Docteur Debug",
			items: result,
		});
	});
});

/* 
fin de app.get(....)*/

/*
pour generer la page add event 
*/

app.get("/inscription", function (req, res) {
	con.query("SELECT * FROM client ORDER BY id DESC", function (err, result) {
		res.render("pages/inscription.ejs", {
			siteTitle: siteTitle,
			pageTitle: "Inscription",
			items: result,
		});
	});
});

/*
post method to data : pour ajouter un evenement à la BD
*/

app.post("/inscription", function (req, res) {
	/* get the record base on ID
	 */
	var query =
		"INSERT INTO client (id, first_name, last_name, email, password) VALUES (";
	query += getRandomString(3) + ",";
	query += " '" + req.body.first_name + "',";
	query += " '" + req.body.last_name + "',";
	query += " '" + req.body.email + "',";
	query += " '" + req.body.password + "')";

	con.query(query, function (err, result) {
		if (err) throw err;
		res.redirect(baseURL);
	});
});

app.get("/connexion", function (req, res) {
	con.query("SELECT * FROM client ORDER BY id DESC", function (err, result) {
		res.render("pages/connection.ejs", {
			siteTitle: siteTitle,
			pageTitle: "Connexion",
			items: result,
		});
	});
});

/**
 * Pour la page de connexion des docteurs
 */

 app.get("/connexion/docteurs", function (req, res) {
	con.query("SELECT * FROM docteur ORDER BY id DESC", function (err, result) {
		res.render("pages/connection.ejs", {
			siteTitle: siteTitle,
			pageTitle: "Connexion",
			items: result,
		});
	});
});

/*
	post method to data : pour ajouter un evenement à la BD
	*/

app.post("/connected", function (req, res) {
	/* get the record base on ID
	 */
	var query = "SELECT * FROM client WHERE ";
	query += "EMAIL = '" + req.body.email + "' AND ";
	query += "PASSWORD = '" + req.body.password + "';";

	con.query(query, function (err, result) {
		if (result.length < 1) {
			console.log("Utilisateur Introuvable");
			res.redirect(baseURL + "connexion");
		} else {
			var query2 =
				"SELECT * FROM rdv r join docteur d on d.id = r.docteur_id WHERE ";
			query2 += "client_id = " + result[0].id + ";";

			con.query(query2, function (err, result2) {
				if (err) {
					console.log("Aucun Rendez Vous");
				}

				res.render("pages/confirmconnection.ejs", {
					siteTitle: siteTitle,
					pageTitle: "Compte",
					items: result,
					rdv: result2,
				});
			});
		}
	});
});

/**
 * Pour la connexion des docteurs
 */

 app.post("/connectedDoctor", function (req, res) {
	/* get the record base on ID
	 */
	var query = "SELECT * FROM docteur WHERE ";
	query += "EMAIL = '" + req.body.email + "' AND ";
	query += "PASSWORD = '" + req.body.password + "';";

	con.query(query, function (err, result) {
		if (result.length < 1) {
			console.log("Utilisateur Introuvable");
			res.redirect(baseURL + "connexion");
		} else {
			var query2 =
				"SELECT * FROM rdv r join docteur d on d.id = r.docteur_id WHERE ";
			query2 += "client_id = " + result[0].id + ";";

			con.query(query2, function (err, result2) {
				if (err) {
					console.log("Aucun Rendez Vous");
				}

				res.render("pages/confirmconnection.ejs", {
					siteTitle: siteTitle,
					pageTitle: "Compte",
					items: result,
					rdv: result2,
				});
			});
		}
	});
});

/*
pour editer un event 
*/

app.get("/account/edit/:id", function (req, res) {
	con.query(
		"SELECT * FROM client WHERE id = '" + req.params.id + "'",
		function (err, result) {
			res.render("pages/modifierClient.ejs", {
				siteTitle: siteTitle,
				pageTitle:
					"Modification Compte : " +
					result[0].last_name +
					" " +
					result[0].first_name,
				items: result,
			});
		}
	);
});

function getRandomString(length) {
	var randomChars = "0123456789";
	var result = "";
	for (var i = 0; i < length; i++) {
		result += randomChars.charAt(
			Math.floor(Math.random() * randomChars.length)
		);
	}
	return result;
}

/*
methode post a la bd : modifier un evenement
*/

app.post("/account/edit/:id", function (req, res) {
	/* get the record base on ID
	 */
	var query = "UPDATE  client SET";
	query += " first_name = '" + req.body.first_name + "',";
	query += " last_name = '" + req.body.last_name + "',";
	query += " email = '" + req.body.email + "'";
	query += " WHERE id = " + req.body.id + "";

	con.query(query, function (err, result) {
		if (err) throw err;
		res.redirect(baseURL);
	});
});

/*
pour supprimer un event 
*/

app.get("/account/delete/:id", function (req, res) {
	con.query(
		"DELETE FROM client WHERE id = '" + req.params.id + "'",
		function (err, result) {
			if (err) throw err;
			res.redirect(baseURL);
		}
	);
});
/**
 * connect to server
 */

var server = app.listen(4000, function () {
	console.log("serveur fonctionne sur 4000... ! ");
});
