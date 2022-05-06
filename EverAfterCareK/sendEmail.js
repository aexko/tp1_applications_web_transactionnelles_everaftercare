const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

async function sendEmail(userEmail, subject, payload, template) {
	try {
		// create reusable transporter object using the default SMTP transport
		const transporter = nodemailer.createTransport({
			host: "smtp.gmail.com",
			port: 465,
			auth: {
				user: "confirmationbotbdeb@gmail.com",
				pass: "letp12345", // naturally, replace both with your real credentials or an application-specific password
			},
			tls: {
				rejectUnauthorized: false,
			},
		});

		const source = fs.readFileSync(path.join(__dirname, template), "utf8");
		console.log(source);
		const compiledTemplate = handlebars.compile(source);
		console.log("worked5");

		console.log(userEmail);

		const options = () => {
			return {
				from: "confirmationbotbdeb@gmail.com",
				to: userEmail,
				subject: subject,
				html: compiledTemplate(payload),
			};
		};
		console.log("worked3");
		// Send email
		transporter.sendMail(options(), (error, info) => {
			if (error) {
				console.log(error);
				return error;
			} else {
				console.log("Est-ce que ça marche?");
				return res.status(200).json({
					success: true,
				});
			}
		});
		console.log("email sent");
	} catch (error) {
		console.log("Dafuk?");
		return error;
	}
}

/*
Example:
sendEmail(
	"youremail@gmail.com,
	"Email subject",
	{ name: "Eze" },
	"./templates/layouts/main.handlebars"
);
  */

module.exports = sendEmail;
