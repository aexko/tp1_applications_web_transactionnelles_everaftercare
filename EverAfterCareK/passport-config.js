const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypjs");

function initialize(passport, getUserByEmail, getUserByID) {
	const authenticationUser = async (email, password, done) => {
		const user = await getUserByEmail(email);
		if (user == null) {
			return done(null, false, {
				message:
					"Il n'y a pas d'utilisateur avec cet adressse courriel. ",
			});
		}
		try {
			if (await bcrypt.compare(password, user.password)) {
				return done(null, user);
			} else {
				return done(null, false, {
					message: "Mot de passe incorrect !",
				});
			}
		} catch (err) {
			return done(e);
		}
	};

	passport.use(
		new LocalStrategy({
			usernameField: "email",
		})
	);

	passport.serializeUser((user, done) => done(null, user.id));
	passport.deserializeUser(async (id, done) => {
		return done(null, await getUserById(id));
	});
}

module.exports = initialize;
