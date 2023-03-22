"use strict";
/** Database setup for jobly. */
const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

let db;

if (process.env.NODE_ENV === "production") {
  db = new Client({
    database: getDatabaseUri(),
    ssl: {
      rejectUnauthorized: false
    },
  });
} else {
  db = new Client({
    database: getDatabaseUri(),
    user: "tcobb2162",
    password: "2162",
  });
}

db.connect();

module.exports = db;