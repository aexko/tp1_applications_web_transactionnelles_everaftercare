var express = require('express');

var app = express();

app.use(express.static(__dirname + "/public"));

app.get('/', function(req, res) {
  //  res.setHeader('Content-type', 'text/plain');
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end('Vous êtes à l\'accueil');
});



app.get('/sous-sol', function(req, res) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end('Vous êtes  au sous-sol  !');
});

app.get('/etage/1/chambre', function(req, res) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end('Hé ho, c\'est la chambre principale !');
});

/*
app.get('/etage/:etagenum/chambre', function(req, res) {
	
  //  res.setHeader('Content-type', 'text/plain');
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end('Vous êtes a la chambre de l\'etage n°' + req.params.etagenum);
});
*/

app.get('/etage/:etagenum/chambre', function(req, res) {
    res.render('chambre.ejs', {etage: req.params.etagenum});
});


app.get('/compter/:nombre', function(req, res) {
    var noms = ['Robert', 'Jacques', 'David'];
    res.render('pages.ejs', {compteur: req.params.nombre, noms: noms});
});

app.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.send(404, 'Page introuvable !');
});

console.log("C'est fait !!!")
app.listen(3000);


// AVEC FETCH()
const fetch = require ('node-fetch');
fetch ('https://api.github.com/users')
.then (res => res.json ()) // type de réponse
.then (data => console.log (data)); // la console du terminal



/* 
//AVEC XMLHTTPREQUEST
 //Create the XHR Object
 var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
 let xhr = new XMLHttpRequest;
 //Call the open function, GET-type of request, url, true-asynchronous
 xhr.open('GET', 'https://api.github.com/users', true)
 //call the onload 
 xhr.onload = function() 
     {
         //check if the status is 200(means everything is okay)
         if (this.status === 200) 
             {
                 //return server response as an object with JSON.parse
                 console.log(JSON.parse(this.responseText));
     }
             }
 //call send
 xhr.send();
 */

 /*
 // AVEC XMLHTTPREQUEST
 var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
 let request = new XMLHttpRequest();
 
request.open('GET', 'https://api.github.com/users',true);
request.onload = function() 
     {
       console.log(JSON.parse(this.responseText));
        this.responseType = 'text';
     }
     request.send();
*/