const { getFirstRailwayCompany } = require("./controllers/railwayController");

(async () => {
	try {
		const company = await getFirstRailwayCompany();
		console.log("Company Info:", company);
	} catch (error) {
		console.error("Error during test:", error);
	}
})();
