const fs = require("fs");
const path = require("path");
const pool = require("../config/database");
const buildGraph = require("./buildGraph");

const GRAPH_FILE_PATH = path.join(__dirname, "data", "graph.json");

async function buildAndSaveGraph() {
	try {
		const [stations] = await pool.query(
			"SELECT station_cd, station_g_cd, station_name, lat, lon FROM railway_stations"
		);
		const [connections] = await pool.query("SELECT station_cd1, station_cd2, line_cd FROM railway_line_connections");

		const graphData = buildGraph(connections, stations);

		fs.writeFileSync(GRAPH_FILE_PATH, JSON.stringify(graphData, null, 2));
		console.log("Graph has been built and saved successfully.");
	} catch (error) {
		console.error("Error building the graph:", error);
		throw error;
	}
}

async function loadGraphFromFile() {
	const fs = require("fs");
	const path = require("path");
	const GRAPH_FILE_PATH = path.join(__dirname, "data", "graph.json");

	try {
		if (!fs.existsSync(GRAPH_FILE_PATH)) {
			console.log("Graph file not found. Building graph...");
			await buildAndSaveGraph();
		}

		const data = fs.readFileSync(GRAPH_FILE_PATH, "utf-8");
		console.log("Graph loaded from file successfully.");
		return JSON.parse(data);
	} catch (error) {
		console.error("Error loading or building graph from file:", error);
		throw error;
	}
}

module.exports = {
	buildAndSaveGraph,
	loadGraphFromFile,
};
