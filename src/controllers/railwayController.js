const db = require("../config/database");

const getFirstRailwayCompany = async (req, res) => {
	try {
		// Truy vấn lấy dòng đầu tiên từ bảng railway_companies
		const [rows] = await db.query("SELECT * FROM railway_companies LIMIT 1");
		if (rows.length > 0) {
			console.log("First Railway Company:", rows[0]);
			res.json(rows[0]); // Gửi dữ liệu về client nếu cần
		} else {
			console.log("No data found in railway_companies.");
			res.status(404).send("No data found.");
		}
	} catch (error) {
		console.error("Database Query Error:", error);
		res.status(500).send("Internal Server Error");
	}
};

module.exports = { getFirstRailwayCompany };
