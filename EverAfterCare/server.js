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
	database: "eac"
});

const siteTitle = "Simple application";
const baseURL = "http://localhost:4000/";


app.get('/',function (req,res) {    
	con.query("SELECT * FROM client ORDER BY id DESC", function (err, result){
		res.render('pages/index',{
			siteTitle : siteTitle,
			pageTitle : "Clients",
			items : result
		});
	});

});

/*
pour generer la page add event 
*/

app.get('/event/add',function (req,res) {
	con.query("SELECT * FROM client ORDER BY id DESC", function (err, result){
    	res.render('pages/add-event.ejs',{
        siteTitle : siteTitle,
        pageTitle : "Add new Event",
        items : result
    	});
	});
});



/*
post method to data : pour ajouter un evenement à la BD
*/

app.post('/event/add',function (req,res) {
	
	/* get the record base on ID
	*/
	var query = "INSERT INTO client (id, first_name, last_name, email, password) VALUES (";
	query += getRandomString(3) +",";
		query += " '"+req.body.first_name+"',";
		query += " '"+req.body.last_name+"',";
		query += " '"+req.body.email+"',";
		query += " '"+req.body.password+"')";
		
	con.query(query, function (err, result){
		if (err) throw err;
		res.redirect(baseURL);
	});
});	

/*
pour editer un event 
*/

app.get('/event/edit/:id',function (req,res) {
    con.query("SELECT * FROM client WHERE id = '" + req.params.id + "'", function (err, result){
        res.render('pages/edit-event.ejs',{
        siteTitle : siteTitle,
        pageTitle : "Editing profile : "+ result[0].last_name + " " + result[0].first_name,
        items : result
    	});
	});
});




function getRandomString(length) {
	var randomChars = '0123456789';
	var result = '';
	for ( var i = 0; i < length; i++ ) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
	}
	return result;
};


/*
methode post a la bd : modifier un evenement
*/

app.post('/event/edit/:id',function (req,res) {

	var query = "UPDATE  client SET";
        query += " first_name = '"+req.body.first_name+"',";
        query += " last_name = '"+req.body.last_name+"',";
        query += " email = '"+req.body.email+"'";
		query += " WHERE id = "+req.body.id+"";
		
	con.query(query, function (err, result){
        if (err) throw err;
		res.redirect(baseURL);
	});
});


/*
pour supprimer un event 
*/

app.get('/event/delete/:id',function (req,res) {
    con.query("DELETE FROM client WHERE id = '" + req.params.id + "'", function (err, result){
        if (err) throw err;
        res.redirect(baseURL);
	});
});

/**
 * La connexion au serveur sur le port 4000
 */
var server = app.listen(4000, function () {
	console.log("serveur fonctionne sur 4000... ! ");
});
