function dijkstra(graph, startGcd, targetGcd) {
	const distances = {};
	const previous = {};
	const visited = new Set();
	const pq = new Map();

	Object.keys(graph).forEach((node) => {
		distances[node] = Infinity;
		previous[node] = null;
	});
	distances[startGcd] = 0;
	pq.set(startGcd, 0);

	while (pq.size > 0) {
		const [currentNode] = [...pq.entries()].reduce((min, entry) => (entry[1] < min[1] ? entry : min));
		pq.delete(currentNode);

		if (currentNode === targetGcd) break;
		if (visited.has(currentNode)) continue;
		visited.add(currentNode);

		graph[currentNode].forEach((neighbor) => {
			const { to, weight, line } = neighbor;
			const alt = distances[currentNode] + weight;

			if (alt < distances[to]) {
				distances[to] = alt;
				previous[to] = { node: currentNode, line };
				pq.set(to, alt);
			}
		});
	}

	const path = [];
	let node = targetGcd;
	while (node) {
		path.unshift(node);
		node = previous[node]?.node;
	}

	return {
		path,
		totalDistance: distances[targetGcd] !== Infinity ? distances[targetGcd] : null,
		transfers: path.map((station) => previous[station]).filter((prev) => prev),
	};
}

module.exports = dijkstra;
