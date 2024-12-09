function dijkstra(graph, startGcd, targetGcd) {
	const distances = {};
	const previous = {};
	const visited = new Set();
	const pq = new Map(); // Priority queue with {node: {cost, transfers, currentLine}}

	Object.keys(graph).forEach((node) => {
		distances[node] = { cost: 0, transfers: Infinity }; // cost = 0 vì bỏ qua độ dài
		previous[node] = null;
	});

	distances[startGcd] = { cost: 0, transfers: 0 };
	pq.set(startGcd, { cost: 0, transfers: 0, currentLine: null });

	while (pq.size > 0) {
		// Thay đổi logic chọn nút có ưu tiên:
		// Ưu tiên ít transfers trước, nếu bằng nhau mới ưu tiên cost
		const [currentNode, currentData] = [...pq.entries()].reduce((min, entry) =>
			entry[1].transfers < min[1].transfers || (entry[1].transfers === min[1].transfers && entry[1].cost < min[1].cost)
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
			const altTransfers = currentData.transfers + (isTransfer ? 1 : 0);

			// cost không quan trọng nữa, luôn là 0
			const altCost = currentData.cost; // hoặc = currentData.cost + weight; nhưng weight = 0 rồi

			if (
				altTransfers < distances[to].transfers ||
				(altTransfers === distances[to].transfers && altCost < distances[to].cost)
			) {
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
