// dijkstra.js
function dijkstra(graph, startGcd, targetGcd) {
	// Define costs
	const STATION_HOP_COST = 4; // 4 minutes between stations
	const TRANSFER_COST = 8; // 8 minutes per line transfer

	const distances = {};
	const previous = {};
	const visited = new Set();

	// We'll store {cost, currentLine} and minimize cost this time
	const pq = new Map();

	Object.keys(graph).forEach((node) => {
		distances[node] = { cost: Infinity };
		previous[node] = null;
	});

	distances[startGcd] = { cost: 0 };
	pq.set(startGcd, { cost: 0, currentLine: null });

	while (pq.size > 0) {
		// Choose the node with the smallest cost
		const [currentNode, currentData] = [...pq.entries()].reduce((min, entry) =>
			entry[1].cost < min[1].cost ? entry : min
		);
		pq.delete(currentNode);

		if (currentNode === targetGcd) break;
		if (visited.has(currentNode)) continue;
		visited.add(currentNode);

		graph[currentNode].forEach((neighbor) => {
			const { to, line } = neighbor;

			// If currentLine is null (start), no transfer cost. Otherwise, check if line changes
			const isTransfer = currentData.currentLine && currentData.currentLine !== line;
			const lineChangeCost = isTransfer ? TRANSFER_COST : 0;

			// Each hop between stations costs STATION_HOP_COST
			const altCost = currentData.cost + STATION_HOP_COST + lineChangeCost;

			if (altCost < distances[to].cost) {
				distances[to].cost = altCost;
				previous[to] = { node: currentNode, line };
				pq.set(to, { cost: altCost, currentLine: line });
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
		totalCost: distances[targetGcd].cost !== Infinity ? distances[targetGcd].cost : null,
		previous,
	};
}

module.exports = dijkstra;
