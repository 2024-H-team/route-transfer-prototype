function dijkstra(graph, startGcd, targetGcd) {
	const distances = {};
	const previous = {};
	const visited = new Set();
	const pq = new Map(); // Priority queue with {node: {cost, transfers, currentLine}}

	Object.keys(graph).forEach((node) => {
		distances[node] = { cost: Infinity, transfers: Infinity };
		previous[node] = null;
	});
	distances[startGcd] = { cost: 0, transfers: 0 };
	pq.set(startGcd, { cost: 0, transfers: 0, currentLine: null });

	while (pq.size > 0) {
		const [currentNode, currentData] = [...pq.entries()].reduce((min, entry) =>
			entry[1].cost < min[1].cost || (entry[1].cost === min[1].cost && entry[1].transfers < min[1].transfers)
				? entry
				: min
		);
		pq.delete(currentNode);

		if (currentNode === targetGcd) break;
		if (visited.has(currentNode)) continue;
		visited.add(currentNode);

		graph[currentNode].forEach((neighbor) => {
			const { to, weight, line } = neighbor;
			const isTransfer = currentData.currentLine && currentData.currentLine !== line;
			const additionalCost = isTransfer ? 2 : 0; // Thêm chi phí khi chuyển line
			const altCost = currentData.cost + weight + additionalCost;
			const altTransfers = currentData.transfers + (isTransfer ? 1 : 0);

			if (altCost < distances[to].cost || (altCost === distances[to].cost && altTransfers < distances[to].transfers)) {
				distances[to] = { cost: altCost, transfers: altTransfers };
				previous[to] = { node: currentNode, line };
				pq.set(to, { cost: altCost, transfers: altTransfers, currentLine: line });
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
		totalDistance: distances[targetGcd].cost !== Infinity ? distances[targetGcd].cost : null,
		transfers: distances[targetGcd].transfers,
		previous,
	};
}

module.exports = dijkstra;
