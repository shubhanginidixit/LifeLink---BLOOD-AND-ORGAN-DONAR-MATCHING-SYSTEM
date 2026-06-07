const express = require("express");
const Request = require("../models/Request");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const request = await Request.create(
      req.body
    );

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/", async (req, res) => {
  try {
    const requests = await Request.find()
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const request =
      await Request.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

    res.json(request);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
