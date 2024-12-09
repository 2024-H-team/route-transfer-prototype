const pool = require("../config/database");
const buildGraph = require("../utils/buildGraph");
const dijkstra = require("../utils/dijkstra");

async function findShortestRoute(startGcd, endGcd) {
	const [stations] = await pool.query("SELECT station_cd, station_g_cd, station_name FROM railway_stations");
	const [connections] = await pool.query("SELECT station_cd1, station_cd2, line_cd FROM railway_line_connections");
	const [lines] = await pool.query("SELECT line_cd, line_name FROM railway_lines");

	const graphData = buildGraph(connections, stations);

	const { path, totalDistance, transfers, previous } = dijkstra(graphData.graph, startGcd, endGcd);

	const groupedStations = graphData.groupedStations;

	const route = [];
	const detailedTransfers = [];

	let previousLine = null;
	for (let i = 0; i < path.length - 1; i++) {
		const currentGcd = path[i];
		const nextGcd = path[i + 1];

		const lineCd = previous[nextGcd]?.line;
		if (!lineCd) {
			continue;
		}

		const currentCandidates = groupedStations[currentGcd];
		const nextCandidates = groupedStations[nextGcd];
		let chosenCurrentCd = null;
		let chosenNextCd = null;

		outerLoop: for (const ccd of currentCandidates) {
			for (const ncd of nextCandidates) {
				const conn = connections.find(
					(conn) =>
						((conn.station_cd1 === ccd && conn.station_cd2 === ncd) ||
							(conn.station_cd1 === ncd && conn.station_cd2 === ccd)) &&
						conn.line_cd === lineCd
				);
				if (conn) {
					chosenCurrentCd = ccd;
					chosenNextCd = ncd;
					break outerLoop;
				}
			}
		}

		const fromStation = stations.find((s) => s.station_cd === chosenCurrentCd);
		const toStation = stations.find((s) => s.station_cd === chosenNextCd);
		const lineObj = lines.find((l) => l.line_cd === lineCd);

		route.push({
			from: chosenCurrentCd,
			from_name: fromStation ? fromStation.station_name : null,
			to: chosenNextCd,
			to_name: toStation ? toStation.station_name : null,
			line: lineObj ? lineObj.line_name : null,
		});

		if (previousLine && previousLine !== lineCd) {
			const transferStation = fromStation || toStation;
			detailedTransfers.push({
				station_name: transferStation?.station_name,
				from_line: lines.find((l) => l.line_cd === previousLine)?.line_name,
				to_line: lineObj?.line_name,
			});
		}
		previousLine = lineCd;
	}

	return {
		start: startGcd,
		end: endGcd,
		totalDistance,
		route,
		transfers: detailedTransfers,
	};
}

module.exports = { findShortestRoute };
