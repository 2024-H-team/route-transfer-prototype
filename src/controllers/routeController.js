const { findShortestRoute } = require("../models/routeModel");

exports.getRoute = async (req, res) => {
	const { startStation, endStation } = req.query;

	try {
		const result = await findShortestRoute(parseInt(startStation), parseInt(endStation));
		res.status(200).json(result);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "An error occurred while finding the route." });
	}
};
