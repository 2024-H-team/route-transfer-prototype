// app.js
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

const { initGraph } = require("./utils/graphManager");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Import routes
const railwayRoutes = require("./routes/railwayRoutes");
const routeRoutes = require("./routes/route");
app.use("/railways", railwayRoutes);
app.use("/api", routeRoutes);

// Default route serves index.html
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

(async () => {
	try {
		await initGraph();
		console.log("Graph is ready for use.");

		// Start the server
		const PORT = process.env.PORT || 3000;
		app.listen(PORT, () => {
			console.log(`Server is running on http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error("Failed to initialize graph:", error);
		process.exit(1);
	}
})();
