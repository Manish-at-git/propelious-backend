const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");
const PORT = process.env.PORT || 4000;
const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Playlist Management",
			version: "1.0.0",
			description: "APIs",
		},
		servers: [
			{
				url: `http://localhost:${PORT}`,
			},
			{
				url: "https://propelious-backend.onrender.com",
			},
		],
	},
	apis: [path.join(__dirname, "../routes/*.js"), path.join(__dirname, "../routes/pilot/*.js")],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
