const jsonschema = require("jsonschema");
const express = require("express");

const Jobs = require("../models/jobs");

const router = new express.Router();

router.get("/", async function (req, res, next) {
    try {
      const {title, minSalary, hasEquity} = req.query;
      const jobs = await Jobs.findAll(title, minSalary, hasEquity);
      return res.json({ jobs });
    } catch (err) {
      return next(err);
    }
});

module.exports = router;