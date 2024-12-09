const pool = require("../config/database");
const buildGraph = require("../utils/buildGraph");
const dijkstra = require("../utils/dijkstra");

async function findShortestRoute(startStation, endStation) {
	// Fetch data from the database
	const [stations] = await pool.query("SELECT station_cd, station_g_cd, station_name FROM railway_stations");
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
			const fromStation = stations.find((s) => s.station_cd === currentStation);
			const toStation = stations.find((s) => s.station_cd === nextStation);

			// Add current route segment
			route.push({
				from: currentStation,
				from_name: fromStation ? fromStation.station_name : null,
				to: nextStation,
				to_name: toStation ? toStation.station_name : null,
				line: line ? line.line_name : null,
			});

			// Check for transfer at intermediate station
			if (i > 0) {
				const prevConnection = connections.find(
					(conn) =>
						(conn.station_cd1 === path[i - 1] && conn.station_cd2 === currentStation) ||
						(conn.station_cd1 === currentStation && conn.station_cd2 === path[i - 1])
				);
				const prevLine = lines.find((l) => l.line_cd === prevConnection?.line_cd);

				if (prevLine?.line_cd !== line?.line_cd) {
					// Transfer station
					const transferStation = fromStation || toStation;
					route.push({
						transfer_at: transferStation?.station_name,
						from_line: prevLine?.line_name,
						to_line: line?.line_name,
					});
				}
			}
		}
	}

	// Simplify transfers
	const simplifiedTransfers = transfers.map((transfer) => {
		const station = stations.find((s) => s.station_cd === transfer.node);
		return {
			station_name: station ? station.station_name : null,
			from_line: lines.find((l) => l.line_cd === transfer.line)?.line_name,
			to_line: transfer.transferLine ? lines.find((l) => l.line_cd === transfer.transferLine)?.line_name : null,
		};
	});

	return {
		start: startStation,
		end: endStation,
		totalDistance,
		route,
		transfers: simplifiedTransfers,
	};
}

module.exports = { findShortestRoute };
