const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Set up a basic route
app.get("/", (req, res) => {
	res.send("Welcome to your Express MVC app!");
});

// Import routes
const railwayRoutes = require("./routes/railwayRoutes");
app.use("/railways", railwayRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
