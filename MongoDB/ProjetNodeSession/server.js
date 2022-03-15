const express = require ( 'express' ) ;
const session = require ( 'express-session' ) ;
const bodyParser = require ( 'body-parser' ) ; 
const app = express ( ) ;
const routeur = express.Router ( ) ;


app.use ( session ( { secret : '1111111' ,saveUninitialized : false , resave : false } ) ) ;
app.use ( bodyParser.json ( ) ) ;      
app.use ( bodyParser.urlencoded ( { extended : true } ) ) ;
app.use ( express.static ( __dirname + '/views' ) ) ;

var sess ; // session globale, NON recommandée

routeur.get ( '/' , ( req , res ) => {
    sess = req.session ;
    if ( sess.email ) {
        return res.redirect ( '/admin' ) ;
    }
    res.sendFile(__dirname + '/views/index.html');
} ) ;

routeur.post ( '/login' , ( req , res ) => {
    sess = req.session ;
    sess.email = req.body.email ;
    res.end ( 'done' ) ;
} ) ;

routeur.get ( '/admin' , ( req , res ) => {
    sess = req.session ;
    if ( sess.email ) {
        res.write ( '<h1> Bonjour </h1> <h2>'+sess.email+'</h2></h1> <br>' ) ;
        res.end ( '<a href=' +'/logout' +'> Logout </a>' ) ; } 
    else {        
         res.write ( '<h1> Veuillez d abord vous connecter. </h1>' );
         res.end ( '<a href=' +'/' +'> Connexion </a>' ) ; 
        } 
    } ) ; 
    
routeur.get( '/logout' ,(req , res ) => {
    req.session.destroy ( ( err ) => {
        if ( err ) {
           console.log( err ) ;
        }
        res.redirect ( '/' ) ;
    } ) ;

} ) ;

app.use ( '/' , routeur ) ;

app.listen(process.env.PORT || 3000,() => {
    console.log ( `Application démarrée sur PORT $ { process. env . PORT || 3000 } ` ) ;
} ) ;

