// Import express framework
import express from "express";

// Import Redis client
import Redis from "ioredis";


// Create express application
const app = express();


// Middleware:
// Converts incoming JSON request body into JavaScript object
//
// Example:
// {
//   "name": "Akash"
// }
//
// becomes
//
// req.body = { name: "Akash" }
app.use(express.json());


// Create Redis connection
//
// process.env.REDIS_URL
// -> Used in production environments
//
// fallback:
// redis://localhost:6379
// -> Local Redis running on machine/docker
const redis = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379"
);




/* =========================================================
   STORE USER PROFILE AS JSON STRING
   =========================================================

   Redis SET command stores everything as STRING.

   We convert object into JSON string using JSON.stringify()

   Key Example:
   user:1:json

   Value Example:
   {
      "name":"Akash",
      "age":23
   }

========================================================= */


// POST API
// Save user object as JSON string
app.post("/user/:id/json", async (req, res) => {

  // Convert object -> JSON string
  await redis.set(
    `user:${req.params.id}:json`,
    JSON.stringify(req.body)
  );

  // Send response
  res.json({
    savedAs: "json"
  });
});




// GET API
// Read JSON string from Redis
app.get("/user/:id/json", async (req, res) => {

  // Fetch raw string from Redis
  const raw = await redis.get(
    `user:${req.params.id}:json`
  );

  // Convert JSON string -> JavaScript object
  res.json({
    user: raw ? JSON.parse(raw) : null
  });
});





/* =========================================================
   STORE USER PROFILE AS HASH
   =========================================================

   Redis HASH stores object field-by-field.

   Example:

   Key:
   user:1:hash

   Fields:
   name -> Akash
   age  -> 23

========================================================= */


// POST API
// Save object as HASH
app.post("/user/:id/hash", async (req, res) => {

  // hset stores multiple fields in Redis hash
  await redis.hset(
    `user:${req.params.id}:hash`,
    req.body
  );

  // Send response
  res.json({
    savedAs: "hash"
  });
});




// GET API
// Retrieve complete HASH object
app.get("/user/:id/hash", async (req, res) => {

  // hgetall returns all fields from hash
  const user = await redis.hgetall(
    `user:${req.params.id}:hash`
  );

  // Return response
  res.json({
    user
  });
});





/* =========================================================
   START SERVER
========================================================= */

app.listen(3000, () => {

  console.log(
    "Server is running on http://localhost:3000"
  );

});