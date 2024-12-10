// routeController.js
const { findShortestRoute } = require("../models/routeModel");

exports.getRoute = async (req, res) => {
	const { startStation, endStation } = req.body;

	if (!startStation || !endStation) {
		return res.status(400).json({
			error: "Please enter both start and end station names",
		});
	}

	try {
		const result = await findShortestRoute(startStation, endStation);
		res.status(200).json(result);
	} catch (error) {
		console.error(error);
		if (error.message.includes("not found")) {
			return res.status(404).json({ error: error.message });
		}
		res.status(500).json({
			error: "An error occurred while finding the route",
		});
	}
};
