/**
 * Initialisation des modules
 */
const sendEmail = require("./sendEmail");
const titreSite = "EverAfterCare";
const express = require("express");
const handlebars = require("handlebars");
const mongoose = require("mongoose");
const app = express();
const moment = require("moment");
const nodemailer = require("nodemailer");
currentlyConnectedUser = null;
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const User = require("./models/client");
const Confirmes = require("./models/confirmation");
const Rdv = require("./models/rdv");
const Service = require("./models/service");
const methodOverride = require("method-override");
const bodyparser = require('body-parser');
const path = require('path');
require("dotenv").config();
const bcrypt = require("bcryptjs");
var Publishable_Key = 'pk_test_51Kt9oSCnmso28bfJvG5lopyYW1LRp5FvU6fRpwbMQm16wwYoCVU71crPRwJ7oITPr62FOiHeLzNt4dJkcVMDke3Q00LZhLTgqt'
var Secret_Key = 'sk_test_51Kt9oSCnmso28bfJ8EKLGYNsZAt1qy9KjCtp3fncIbfgRCkzF59rKmZKXdhvupqxfbWcwEYFVR4Tesqsft8xhDpx00g7gCIL70'
const stripe = require('stripe')(Secret_Key)
var total = 50

const {
    checkAuthenticated,
    checkNotAuthenticated,
} = require("./middlewares/auth");
const initializePassport = require("./passport-config");
const rdv = require("./models/rdv");
initializePassport(
    passport,
    async(email) => {
        const userFound = await User.findOne({ email });
        return userFound;
    },
    async(id) => {
        const userFound = await User.findOne({ _id: id });
        return userFound;
    }
);

// pour activer le module ejs
app.set("view engine", "ejs");

// pour permettre le parsing des URLs
app.use(express.urlencoded({ extended: true }));

// pour l'acces au dossier "public"
app.use(express.static("public"));

// pour l'acces au dossier "images"
app.use(express.static("images"));

// pour activer le module express-flash
app.use(flash());

// pour activer le module session
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUnitialized: true,
    })
);

// pour utiliser la fonction intialize() dans passport
app.use(passport.initialize());

// pour activer session du passport
app.use(passport.session());

app.use(methodOverride("_method"));

// pour charger la page d'accueil
app.get("/", (req, res) => {
    res.render("index", {
        titrePage: "Accueil",
        titreSite: titreSite,
        ConnectedUser: currentlyConnectedUser,
    });
});

// pour charger la page de connexion
app.get("/connexion", checkNotAuthenticated, (req, res) => {
    res.render("connexion", {
        titrePage: "Connexion",
        titreSite: titreSite,
        ConnectedUser: currentlyConnectedUser,
    });
    if (checkNotAuthenticated) {
        currentlyConnectedUser = null;
    }
});

// pour charger la page d'inscription
app.get("/inscription", checkNotAuthenticated, (req, res) => {
 
    res.render("inscription", {
        titrePage: "Inscription",
        titreSite: titreSite,
        ConnectedUser: currentlyConnectedUser,
    });
});


app.get("/rdv/confirm/:rdvid", checkAuthenticated, async(req, res) => {
    frlid = req.params.rdvid;

    var thatrdv = await Rdv.findOneAndUpdate({ _id: frlid, docteur_id: currentlyConnectedUser._id, confirme: false }, { confirme: true });

    res.redirect("/");
});

app.get("/rdv/refuse/:rdvid", checkAuthenticated, async(req, res) => {
    frlid = req.params.rdvid;

    var thatrdv = await Rdv.findOneAndDelete({
        _id: frlid,
        docteur_id: currentlyConnectedUser._id,
        confirme: false,
    });

    res.redirect("/");
});
app.get("/services", (req, res) => {
    Service.find({}, function(err, services) {
        res.render("services", {
            titrePage: "Services",
            titreSite: titreSite,
            ListServices: services,
            ConnectedUser: currentlyConnectedUser,
        });
    });
});
app.get("/rendezvous", checkAuthenticated, (req, res) => {
    if (currentlyConnectedUser.user_type == "client") {
        User.find({ user_type: "docteur" }, function(err, users) {
            Service.find({}, function(err, services) {
                res.render("rendezvous", {
                    titrePage: "Prise de Rendez-Vous",
                    titreSite: titreSite,
                    ListDocteur: users,
                    ListServices: services,
                    key: Publishable_Key,
                    total: total,
                    ConnectedUser: currentlyConnectedUser,
                });
            });
        });
    } else if (currentlyConnectedUser.user_type == "docteur") {
        Rdv.find({ docteur_id: currentlyConnectedUser._id, confirme: false },
            function(err, rdvs) {
                User.find({}, function(err, us) {
                    res.render("publicrdv", {
                        titrePage: "Prise de Rendez-Vous",
                        titreSite: titreSite,
                        rdv: rdvs,
                        users: us,
                        ConnectedUser: currentlyConnectedUser,
                    });
                });
            }
        );
    } else if (currentlyConnectedUser.user_type == "admin") {}
});



// DEBUG
app.get("/TestDebug", checkAuthenticated, async(req, res) => {
    const confirm = new Confirms({
        client_id: currentlyConnectedUser._id,
        type: "mdp",
        newpass: "mdp",
        ConnectedUser: currentlyConnectedUser,
    });


    await confirm.save();

    res.redirect("/");
});

app.get("/mailchange/:confirmid", checkAuthenticated, (req, res) => {

    User.find({ user_type: "docteur" }, function(err, users) {
        res.render("rendezvous", {
            titrePage: "Prise de Rendez-Vous",
            titreSite: titreSite,
            ListDocteur: users,
            ConnectedUser: currentlyConnectedUser,
        });
    });
});

app.post("/rendezvous", checkAuthenticated, async(req, res) => {
    d_id = req.body.nom_doc;
    const userFound = await User.findOne({ _id: d_id, user_type: "docteur" });
    if (userFound) {
        var startdate = req.body.tripstart;
        var time = req.body.time;

        Rdv.findOne({ date: startdate, docteur_id: d_id, heure: time },
            async function(err, Rendezvous) {
                if (Rendezvous == null) {
                    Rdv.findOne({
                            date: startdate,
                            client_id: currentlyConnectedUser._id,
                            heure: time,
                        },
                        async function(err, crdv) {
                            if (crdv == null) {
                                try {
                                    const rdv = new Rdv({
                                        docteur_id: d_id,
                                        client_id: currentlyConnectedUser._id,
                                        type: req.body.type,
                                        date: startdate,
                                        heure: time,
                                    });

                                    await rdv.save();

                                    console.log(
                                        "RDV with docteur : " +
                                        userFound.first_name +
                                        " " +
                                        userFound.last_name +
                                        " | Client : " +
                                        currentlyConnectedUser.first_name +
                                        " " +
                                        currentlyConnectedUser.last_name
                                    );

                                    res.redirect("/");
                                } catch (error) {
                                    console.log(error);
                                    res.redirect("/rendezvous");
                                }
                            } else {

                                console.log(
                                    "Rendez-Vous existe déja dans la plage horaire pour le client"
                                );
                                res.redirect("/rendezvous");
                            }
                        }
                    );
                } else {
                    alert(
                        "Rendez-Vous existe déja dans la plage horaire pour le docteur"
                    );
                    console.log(
                        "Rendez-Vous existe déja dans la plage horaire pour le docteur"
                    );
                    res.redirect("/rendezvous");
                }
            }
        );
    } else {
        res.redirect("/");
    }
});
app.post(
    "/connexion",
    StoreUser,
    checkNotAuthenticated,
    passport.authenticate("local", {
        successRedirect: "/profil",
        failureRedirect: "/connexion",
        failureFlash: true,
    }),
    async(req, res) => {}
);
app.post("/services", async(req, res) => {

    res.redirect("/rendezvous");
});
app.post('/services', (req, res) => {
    res.redirect("/rendezvous");
})
app.post(
    "/connexiond",
    StoreUser,
    checkNotAuthenticated,
    passport.authenticate("local", {
        successRedirect: "/profil",
        failureRedirect: "/connexion",
        failureFlash: true,
    }),
    async(req, res) => {}
);

async function StoreUser(req, res, next) {
    const userFound = await User.findOne({ email: req.body.email });

    if (userFound) {
        currentlyConnectedUser = userFound;
    } else {
        console.log("Lol t'existe pas");
    }

    next();
}

// pour faire l'inscription
app.post("/inscription", checkNotAuthenticated, async(req, res) => {
    var userFound = await User.findOne({ email: req.body.email });

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
                first_name: req.body.firstname,
                last_name: req.body.lastname,
                email: req.body.email,
                password: hashedPassword,
                user_type: "client",
            });

            await user.save();
            res.redirect("/connexion");
        } catch (error) {
            console.log(error);
            res.redirect("/inscription");
        }
    }
});

// pour se deconnecter
app.delete("/deconnexion", (req, res) => {
    currentlyConnectedUser = null;
    req.logOut();
    res.redirect("/connexion");
});



app.post("/annuler_rdv", async(req, res) => {
    s_rdv = req.body.selected_rdv;

    try {
        if (
            await bcrypt.compare(
                req.body.password,
                currentlyConnectedUser.password
            )
        ) {
            var thisrdv = await Rdv.findOneAndDelete({ _id: s_rdv });


            res.redirect("/profil");
            console.log("Bon MDP");
        } else {
            //alert("Mot De Passe Erroné.");
            res.redirect("/profil");
            console.log("Mauvais MDP");
        }
    } catch (err) {
        return err;
    }
});

function convertDate(inputFormat) {
    function pad(s) {
        return s < 10 ? "0" + s : s;
    }
    var d = new Date(inputFormat);
    return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join("/");
}

// pour charger le profil de l'utilisateur apres une connexion reussie
app.get("/profil/", checkAuthenticated, (req, res) => {
    //const userFound = await User.findOne({ email });
    Rdv.find({ client_id: currentlyConnectedUser._id }, function(err, RDVs) {
        res.render("profil", {
            titrePage: titreSite,
            titreSite: titreSite,
            name: currentlyConnectedUser.first_name +
                " " +
                currentlyConnectedUser.last_name,
            Cuser: currentlyConnectedUser,
            userFound_rdv: RDVs,
            ConnectedUser: currentlyConnectedUser,
        });
    });
});

// ajax
app.get("/recherche", (req, res) => {

    res.render("recherche", {
        titrePage: "Recherche",
        titreSite: titreSite,
        ConnectedUser: currentlyConnectedUser,
    });
});

app.post("/getUtilisateurs", async(req, res) => {
    let payload = typeof req.body.temp === "string" ? req.body.temp.trim() : "";
    let search = await User.find({
        email: { $regex: new RegExp("^" + payload + ".*", "i") },
    }).exec();
    search = search.slice(0, 10);
    res.send({ payload: search });
});


// reset password

app.post("/resetPassword", checkNotAuthenticated, async(req, res) => {
    if (req.body.password != req.body.passwordc) {
        alert("Les mots de passes ne sont pas les mêmes");
    } else {
        const userFound = await User.findOne({ email: req.body.email });

        if (!userFound) {
            req.flash(
                "error",
                "Cet utilisateur n'existe pas avec cette adresse courriel."
            );
        } else {
            const confirmcurrent = new Confirmes({
                client_id: userFound._id,
                type: "forgotpassword",
                newpass: req.body.password,
            });
            var confirm = await confirmcurrent.save();

            const link = `${process.env.CLIENT_URL}/resetPass/` + confirm._id;
            sendEmail(userFound.email, "Password Reset Request", { name: userFound.first_name, link: link, }, "./requeteResetPassword.handlebars");
        }
    }
    res.redirect("/");
});

app.get("/changepass", checkAuthenticated, async(req, res) => {
    res.render("changepass", {
        titrePage: "Changement de mot-de-passe",
        titreSite: titreSite,
    });
});


app.post("/changepass", checkAuthenticated, async(req, res) => {

    if (req.body.newpass != req.body.confirmnewpass) {

        alert("Les mots de passes ne sont pas les mêmes");
    } else {

        if (await bcrypt.compare(req.body.oldpass, currentlyConnectedUser.password)) {
            console.log("tkt");
            const hashednewPass = await bcrypt.hash(req.body.newpass, 10);

            currentlyConnectedUser.password = hashednewPass;

            const temp = await User.findOneAndUpdate({ _id: currentlyConnectedUser._id }, { password: hashednewPass });
            //currentlyConnectedUser = temp;

        } else {

        }

    }
    res.redirect("/profil");
});

app.get("/resetPass/:cid", checkNotAuthenticated, async(req, res) => {
    console.log(req.params.cid);
    var confirmid = req.params.cid;
    const objectid = confirmid;
    var confirmation = await Confirmes.findOne({ _id: objectid });

    const hashNewpass = await bcrypt.hash(confirmation.newpass, 10);
    console.log(hashNewpass);
    await User.findOneAndUpdate({ _id: confirmation.client_id }, { password: hashNewpass });

    await Confirmes.findOneAndDelete({ _id: confirmid });

    const link = `${process.env.CLIENT_URL}/resetPass/` + confirm._id;
    sendEmail(
        userFound.email,
        "Password Reset Request", { name: userFound.first_name, link: link },
        "./requeteResetPassword.handlebars"
    );
    res.redirect("/");
});

app.get("/changepass", checkAuthenticated, async(req, res) => {
    res.render("changepass", {
        titrePage: "Changement de mot-de-passe",
        titreSite: titreSite,
        ConnectedUser: currentlyConnectedUser,
    });
});

app.post("/changepass", checkAuthenticated, async(req, res) => {
    if (req.body.newpass != req.body.confirmnewpass) {
        alert("Les mots de passes ne sont pas les mêmes");
    } else {
        if (
            await bcrypt.compare(
                req.body.oldpass,
                currentlyConnectedUser.password
            )
        ) {
            console.log("tkt");
            const hashednewPass = await bcrypt.hash(req.body.newpass, 10);

            currentlyConnectedUser.password = hashednewPass;

            const temp = await User.findOneAndUpdate({ _id: currentlyConnectedUser._id }, { password: hashednewPass });
            //currentlyConnectedUser = temp;
        } else {}
    }
    res.redirect("/profil");
});

app.get("/resetPass/:cid", checkNotAuthenticated, async(req, res) => {
    console.log(req.params.cid);
    var confirmid = req.params.cid;
    const objectid = confirmid;
    var confirmation = await Confirmes.findOne({ _id: objectid });

    const hashNewpass = await bcrypt.hash(confirmation.newpass, 10);
    console.log(hashNewpass);
    await User.findOneAndUpdate({ _id: confirmation.client_id }, { password: hashNewpass });

    await Confirmes.findOneAndDelete({ _id: confirmid });
    res.redirect("/profil");
});

app.get("/resetPassword", checkNotAuthenticated, async(req, res) => {
    res.render("resetPassword", {
        titrePage: "resetPassword",
        titreSite: titreSite,
    });
});
// stripe
app.post("/getUtilisateurs", async(req, res) => {
    let payload = typeof req.body.temp === 'string' ? req.body.temp.trim() : '';
    let search = await User.find({
        email: { $regex: new RegExp("^" + payload + ".*", "i") },
    }).exec();
    search = search.slice(0, 10);
    res.send({ payload: search });
});


app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())



// app.get('/', function(req, res) {
//     res.render('Home', {
//         key: Publishable_Key
//     })
// })

app.post("/payment", checkAuthenticated, async(req, res) => {
        console.log("La page marche déja");
        d_id = req.body.nom_doc;
        console.log(req.body.testing);
        console.log(d_id);
        const userFound = await User.findOne({ _id: d_id, user_type: "docteur" });
        if (userFound) {
            var startdate = req.body.tripstart;
            var time = req.body.time;

            Rdv.findOne({ date: startdate, docteur_id: d_id, heure: time },
                async function(err, Rendezvous) {
                    console.log(Rendezvous);
                    if (Rendezvous == null) {
                        Rdv.findOne({
                                date: startdate,
                                client_id: currentlyConnectedUser._id,
                                heure: time,

                            },
                            async function(err, crdv) {
                                console.log(crdv);
                                if (crdv == null) {
                                    console.log("aucun rdv à cet heure");
                                    try {
                                        const rdv = new Rdv({
                                            docteur_id: d_id,
                                            client_id: currentlyConnectedUser._id,
                                            type: req.body.type,
                                            date: startdate,
                                            heure: time,

                                        });

                                        await rdv.save();
                                        console.log(
                                            "RDV with docteur : " +
                                            userFound.first_name +
                                            " " +
                                            userFound.last_name +
                                            " | Client : " +
                                            currentlyConnectedUser.first_name +
                                            " " +
                                            currentlyConnectedUser.last_name
                                        );

                                        stripe.customers.create({
                                                email: req.body.stripeEmail,
                                                source: req.body.stripeToken,
                                                name: currentlyConnectedUser.first_name + " " + currentlyConnectedUser.last_name,
                                            })
                                            .then((customer) => {
                                                return stripe.charges.create({
                                                    amount: total * 100,
                                                    description: 'Rendez vous ',
                                                    currency: 'CAD',
                                                    customer: customer.id
                                                });
                                            })
                                            .then((charge) => {
                                                res.redirect("/")
                                            });
                                    } catch (error) {
                                        console.log(error);
                                        res.redirect("/rendezvous");
                                    }
                                } else {

                                    res.redirect("/rendezvous");
                                }
                            }
                        );
                    } else {

                        console.log(
                            "Rendez-Vous existe déja dans la plage horaire pour le docteur"
                        );
                        res.redirect("/rendezvous");
                    }
                }
            );

            /*
             */
        } else {
            res.redirect("/");
        }
    })
    // Connexion à MongoDB
mongoose
    .connect("mongodb://127.0.0.1:27017/eac", {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then(() => {
        app.listen(3000, () => {
            console.log("listening on port 3000");
        });
    });
// mongodb+srv://eac:eac@eac.igvhj.mongodb.net/eac