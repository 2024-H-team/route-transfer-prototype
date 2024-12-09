const express = require("express");
const { getFirstRailwayCompany } = require("../controllers/railwayController");

const router = express.Router();

router.get("/first", getFirstRailwayCompany);

module.exports = router;
