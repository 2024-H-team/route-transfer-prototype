const pool = require("../config/database");
const buildGraph = require("../utils/buildGraph");
const dijkstra = require("../utils/dijkstra");

async function findShortestRoute(startGcd, endGcd) {
	// Lấy dữ liệu
	const [stations] = await pool.query("SELECT station_cd, station_g_cd, station_name FROM railway_stations");
	const [connections] = await pool.query("SELECT station_cd1, station_cd2, line_cd FROM railway_line_connections");
	const [lines] = await pool.query("SELECT line_cd, line_name FROM railway_lines");

	// Xây dựng đồ thị dựa trên station_g_cd
	const graphData = buildGraph(connections, stations);

	// Chạy Dijkstra trên station_g_cd
	const { path, totalDistance, transfers, previous } = dijkstra(graphData.graph, startGcd, endGcd);

	// Lấy map groupedStations để tiện truy xuất
	const groupedStations = graphData.groupedStations;

	const route = [];
	const detailedTransfers = [];

	let previousLine = null;
	for (let i = 0; i < path.length - 1; i++) {
		const currentGcd = path[i];
		const nextGcd = path[i + 1];

		// Tìm line dùng để đến nextGcd
		const lineCd = previous[nextGcd]?.line;
		if (!lineCd) {
			// Ở node bắt đầu có thể chưa có previous line, trường hợp này có thể bỏ qua hoặc tìm line bằng cách khác.
			// Tuy nhiên, thông thường previous[nextGcd].line sẽ có giá trị từ node thứ hai trở đi.
			continue;
		}

		const currentCandidates = groupedStations[currentGcd]; // Mảng station_cd thuộc gcd hiện tại
		const nextCandidates = groupedStations[nextGcd]; // Mảng station_cd thuộc gcd kế tiếp

		let chosenCurrentCd = null;
		let chosenNextCd = null;

		// Tìm cặp station_cd thoả mãn lineCd và kết nối giữa currentGcd và nextGcd
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

		// Lấy thông tin ga và line
		const fromStation = stations.find((s) => s.station_cd === chosenCurrentCd);
		const toStation = stations.find((s) => s.station_cd === chosenNextCd);
		const lineObj = lines.find((l) => l.line_cd === lineCd);

		// Thêm segment vào route
		route.push({
			from: chosenCurrentCd,
			from_name: fromStation ? fromStation.station_name : null,
			to: chosenNextCd,
			to_name: toStation ? toStation.station_name : null,
			line: lineObj ? lineObj.line_name : null,
		});

		// Kiểm tra chuyển tuyến
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
