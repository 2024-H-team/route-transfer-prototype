const pool = require("../config/database");
const buildGraph = require("../utils/buildGraph");
const dijkstra = require("../utils/dijkstra");

async function findStationsByName(name) {
	const [stations] = await pool.query(
		"SELECT station_cd, station_g_cd, station_name, lat, lon FROM railway_stations WHERE station_name = ?",
		[name]
	);

	if (!stations.length) {
		throw new Error(`Station "${name}" not found`);
	}

	// Nhóm các ga theo station_g_cd hoặc lat-lon
	const groupedStations = {};
	stations.forEach((station) => {
		if (!groupedStations[station.station_g_cd]) {
			groupedStations[station.station_g_cd] = [];
		}
		groupedStations[station.station_g_cd].push(station);
	});

	// Thêm các ga có cùng lat-lon vào nhóm tương ứng
	stations.forEach((station) => {
		const key = `${station.lat},${station.lon}`;
		stations.forEach((otherStation) => {
			if (
				station.station_cd !== otherStation.station_cd &&
				station.lat === otherStation.lat &&
				station.lon === otherStation.lon
			) {
				if (!groupedStations[station.station_g_cd].includes(otherStation)) {
					groupedStations[station.station_g_cd].push(otherStation);
				}
			}
		});
	});

	return groupedStations;
}

async function findShortestRoute(startName, endName) {
	// Lấy các nhóm ga cho điểm bắt đầu và kết thúc
	const startGroups = await findStationsByName(startName);
	const endGroups = await findStationsByName(endName);

	// Lấy tất cả các ga (station_g_cd) trong nhóm bắt đầu và kết thúc
	const startGcds = Object.keys(startGroups);
	const endGcds = Object.keys(endGroups);

	const [stations] = await pool.query("SELECT station_cd, station_g_cd, station_name, lat, lon FROM railway_stations");
	const [connections] = await pool.query("SELECT station_cd1, station_cd2, line_cd FROM railway_line_connections");
	const [lines] = await pool.query("SELECT line_cd, line_name FROM railway_lines");

	const graphData = buildGraph(connections, stations);

	// Lưu trữ kết quả đường đi ngắn nhất
	let bestRoute = null;
	let minCost = Infinity;

	// Duyệt qua tất cả các tổ hợp ga bắt đầu và kết thúc
	for (const startGcd of startGcds) {
		for (const endGcd of endGcds) {
			// Tính đường đi
			const { path, totalCost, previous } = dijkstra(graphData.graph, startGcd, endGcd, lines);

			if (totalCost !== null && totalCost < minCost) {
				minCost = totalCost;

				// Tạo thông tin tuyến đường
				const route = [];
				const detailedTransfers = [];
				let previousLine = null;

				for (let i = 0; i < path.length - 1; i++) {
					const currentGcd = path[i];
					const nextGcd = path[i + 1];
					const lineCd = previous[nextGcd]?.line;
					if (!lineCd) continue;

					const currentCandidates = graphData.groupedStations[currentGcd];
					const nextCandidates = graphData.groupedStations[nextGcd];

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

				bestRoute = {
					start_name: startName,
					end_name: endName,
					totalCost: minCost,
					route,
					transfers: detailedTransfers,
				};
			}
		}
	}

	if (!bestRoute) {
		throw new Error(`No route found between "${startName}" and "${endName}"`);
	}

	return bestRoute;
}

module.exports = { findShortestRoute };
