function buildGraph(connections, stations) {
	const graph = {};

	// Group stations by station_g_cd
	const groupedStations = {};
	stations.forEach((station) => {
		if (!groupedStations[station.station_g_cd]) {
			groupedStations[station.station_g_cd] = [];
		}
		groupedStations[station.station_g_cd].push(station.station_cd);
	});

	// Initialize the graph with empty arrays
	Object.keys(groupedStations).forEach((stationGcd) => {
		graph[stationGcd] = [];
	});

	// Add connections to the graph using station_g_cd
	connections.forEach((conn) => {
		const stationGcd1 = stations.find((s) => s.station_cd === conn.station_cd1)?.station_g_cd;
		const stationGcd2 = stations.find((s) => s.station_cd === conn.station_cd2)?.station_g_cd;

		if (stationGcd1 && stationGcd2 && stationGcd1 !== stationGcd2) {
			graph[stationGcd1].push({ to: stationGcd2, weight: 1, line: conn.line_cd });
			graph[stationGcd2].push({ to: stationGcd1, weight: 1, line: conn.line_cd });
		}
	});

	return graph;
}

module.exports = buildGraph;
