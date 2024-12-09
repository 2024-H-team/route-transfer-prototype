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

module.exports = dijkstra;
