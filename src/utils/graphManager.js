// utils/graphManager.js
const { loadGraphFromFile } = require("./graphBuilder");

// Local variable to store the loaded graphData
let graphData = null;

/**
 * Initialize the graph (only needs to be called once when the server starts).
 * If `graphData` already exists, do not load it again.
 */
async function initGraph() {
	if (!graphData) {
		graphData = await loadGraphFromFile();
	}
	return graphData;
}

/**
 * Retrieve the pre-loaded graphData from memory.
 * Throw an error if not initialized.
 */
function getGraph() {
	if (!graphData) {
		throw new Error("Graph has not been initialized yet!");
	}
	return graphData;
}

module.exports = {
	initGraph,
	getGraph,
};
