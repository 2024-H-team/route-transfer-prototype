const express = require("express");
const { getRoute } = require("../controllers/routeController");

const router = express.Router();
router.post("/route", getRoute);

module.exports = router;
