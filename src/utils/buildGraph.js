function buildGraph(connections, stations) {
	const graph = {};

	// Initialize the graph with empty arrays
	stations.forEach((station) => {
		graph[station.station_cd] = [];
	});

	// Add connections to the graph
	connections.forEach((conn) => {
		graph[conn.station_cd1].push({ to: conn.station_cd2, weight: 1, line: conn.line_cd });
		graph[conn.station_cd2].push({ to: conn.station_cd1, weight: 1, line: conn.line_cd });
	});

	return graph;
}

module.exports = buildGraph;
