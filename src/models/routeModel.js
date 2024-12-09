const pool = require("../config/database");

// Function to calculate the shortest path using Dijkstra
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
		const line = lines.find((line) => line.line_cd === connection.line_cd);
		route.push({
			from: currentStation,
			to: nextStation,
			line: line.line_name,
		});
	}

	return {
		start: startStation,
		end: endStation,
		totalDistance,
		route,
		transfers,
	};
}

// Build the graph from the database connections
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

// Dijkstra's Algorithm
function dijkstra(graph, start, target) {
	const distances = {};
	const previous = {};
	const transfers = [];
	const visited = new Set();
	const pq = new Map();

	Object.keys(graph).forEach((node) => {
		distances[node] = Infinity;
		previous[node] = null;
	});
	distances[start] = 0;
	pq.set(start, 0);

	while (pq.size > 0) {
		const [currentNode] = [...pq.entries()].reduce((min, entry) => (entry[1] < min[1] ? entry : min));
		pq.delete(currentNode);

		if (currentNode === target) break;
		if (visited.has(currentNode)) continue;
		visited.add(currentNode);

		graph[currentNode].forEach((neighbor) => {
			const { to, weight, line } = neighbor;
			const alt = distances[currentNode] + weight;

			if (alt < distances[to]) {
				distances[to] = alt;
				previous[to] = { node: currentNode, line };
				pq.set(to, alt);

				if (previous[currentNode]?.line !== line) {
					const existingTransfer = transfers.find((t) => t.at === currentNode && t.toLine === line);
					if (!existingTransfer) {
						transfers.push({ at: currentNode, toLine: line });
					}
				}
			}
		});

		// Handle other lines at the same station
		graph[currentNode].forEach((additionalNeighbor) => {
			if (!visited.has(additionalNeighbor.to)) {
				pq.set(additionalNeighbor.to, distances[currentNode] + 1); // Add alternative routes
			}
		});
	}

	const path = [];
	let node = target;
	while (node) {
		path.unshift(node);
		node = previous[node]?.node;
	}

	return {
		path,
		totalDistance: distances[target] !== Infinity ? distances[target] : null,
		transfers,
	};
}

module.exports = {
	findShortestRoute,
};
