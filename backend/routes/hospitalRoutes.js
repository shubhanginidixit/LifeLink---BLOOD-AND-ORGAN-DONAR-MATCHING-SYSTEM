const express = require("express");
const Hospital = require("../models/Hospital");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const hospital = await Hospital.create(req.body);

    res.status(201).json(hospital);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/", async (req, res) => {
  try {
    const hospitals = await Hospital.find();

    res.json(hospitals);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
