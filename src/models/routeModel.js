const pool = require("../config/database");
const buildGraph = require("../utils/buildGraph");
const dijkstra = require("../utils/dijkstra");

async function findShortestRoute(startStation, endStation) {
	// Fetch data from the database
	const [stations] = await pool.query("SELECT station_cd, lon, lat FROM railway_stations");
	const [connections] = await pool.query(`SELECT station_cd1, station_cd2, line_cd FROM railway_line_connections`);
	const [lines] = await pool.query("SELECT line_cd, line_name FROM railway_lines");

	// Build the graph
	const graph = buildGraph(connections, stations);

	// Run Dijkstra's algorithm
	const { path, totalDistance, transfers } = dijkstra(graph, startStation, endStation);

	// Build the response
	const route = [];
	for (let i = 0; i < path.length - 1; i++) {
		const currentStation = path[i];
		const nextStation = path[i + 1];
		const connection = connections.find(
			(conn) =>
				(conn.station_cd1 === currentStation && conn.station_cd2 === nextStation) ||
				(conn.station_cd1 === nextStation && conn.station_cd2 === currentStation)
		);
		if (connection) {
			const line = lines.find((l) => l.line_cd === connection.line_cd);
			route.push({
				from: currentStation,
				to: nextStation,
				line: line ? line.line_name : null,
			});
		} else {
			// If there is no connection, it means we are transferring lines
			route.push({
				from: currentStation,
				to: nextStation,
				line: null,
			});
		}
	}

	return {
		start: startStation,
		end: endStation,
		totalDistance,
		route,
		transfers,
	};
}

module.exports = { findShortestRoute };
