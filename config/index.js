const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

module.exports = {
	port: process.env.PORT || 3000,
	dbConfig: {
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		dialect: process.env.DB_DIALECT,
	},
};
