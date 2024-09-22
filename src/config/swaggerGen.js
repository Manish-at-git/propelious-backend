
const swaggerAutogen = require("swagger-autogen")({ openapi: "3.0.0" });
const path = require("path");

const PORT = process.env.PORT || 8080;
const swaggerGen = () => {
	const doc = {
		info: {
			version: "3.0.0",
			title: "My API",
			description: "APIs",
		},
		servers: [
			{
				url: `http://localhost:${PORT}`, 
				description: "Local development server",
			},
			{
				url: "https://propelious-backend.onrender.com", 
				description: "Production server",
			},
		],
		basePath: "/",
		schemes: ["http", "https"],
		consumes: ["application/json"],
		produces: ["application/json"],
		tags: [
			{
				name: "Playlist",
				description: "Endpoints",
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
				},
			},
		},
	};

	const outputFile = "./src/output/swagger-output.json";
	const endpointsFiles = [path.join(__dirname, "../../app.js")];

	swaggerAutogen(outputFile, endpointsFiles, doc).then(async () => {
		await require(path.join(__dirname, "../../app.js"));
	});
};

module.exports = swaggerGen;
