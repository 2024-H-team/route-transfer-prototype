function buildGraph(connections, stations) {
	const graph = {};
	const groupedStations = {};

	stations.forEach((station) => {
		if (!groupedStations[station.station_g_cd]) {
			groupedStations[station.station_g_cd] = [];
		}
		groupedStations[station.station_g_cd].push(station.station_cd);
	});

	Object.keys(groupedStations).forEach((stationGcd) => {
		graph[stationGcd] = [];
	});

	// Each connection is still line-based, but we will calculate costs in Dijkstra, not here
	connections.forEach((conn) => {
		const stationGcd1 = stations.find((s) => s.station_cd === conn.station_cd1)?.station_g_cd;
		const stationGcd2 = stations.find((s) => s.station_cd === conn.station_cd2)?.station_g_cd;

		if (stationGcd1 && stationGcd2 && stationGcd1 !== stationGcd2) {
			// Weight is not set here because we'll handle cost logic in Dijkstra
			graph[stationGcd1].push({ to: stationGcd2, line: conn.line_cd });
			graph[stationGcd2].push({ to: stationGcd1, line: conn.line_cd });
		}
	});

	return { graph, groupedStations };
}

module.exports = buildGraph;
