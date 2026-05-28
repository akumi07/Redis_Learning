// ===============================
// IMPORTING REQUIRED PACKAGES
// ===============================

// Express is used to create the backend server and APIs
import express from "express";

// ioredis is a Redis client for Node.js
// It helps our Node.js app communicate with Redis server
import Redis from "ioredis";


// ===============================
// CREATING EXPRESS APPLICATION
// ===============================

// express() creates our backend application
const app = express();


// ===============================
// MIDDLEWARE
// ===============================

// express.json() allows server to read JSON data
// coming from request body.
//
// Example:
// {
//    "message": "Hello"
// }
//
// Without this middleware,
// req.body will be undefined.
app.use(express.json());


// ===============================
// CONNECTING TO REDIS
// ===============================

// Creating Redis client connection.
//
// process.env.REDIS_URL
// -> used when app is deployed on cloud/server
//
// "redis://localhost:6379"
// -> fallback for local machine
//
// 6379 is default Redis port
const redis = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379"
);


// ===============================
// REDIS KEY
// ===============================

// This is the key name under which
// banner message will be stored in Redis.
//
// Redis stores data in key-value format.
//
// Example:
// Key   -> app:banner
// Value -> "Welcome to chai aur redis!"
const BANNER_KEY = "app:banner";


// ======================================================
// POST API -> CREATE OR UPDATE BANNER
// ======================================================

// This API stores banner message into Redis.
//
// Endpoint:
// POST /banner
//
// Example request body:
// {
//    "message": "Big Sale Today!"
// }
//
// If user does not send message,
// default message will be stored.
app.post("/banner", async (req, res) => {

  // redis.set(key, value)
  // Stores data into Redis

  await redis.set(
    BANNER_KEY,
    req.body.message || "Welcome to chai aur redis!"
  );

  // Sending success response
  res.json({
    success: true
  });

});


// ======================================================
// GET API -> FETCH BANNER
// ======================================================

// This API fetches banner message from Redis.
//
// Endpoint:
// GET /banner
app.get("/banner", async (req, res) => {

  // redis.get(key)
  // Fetches value from Redis
  const message = await redis.get(BANNER_KEY);

  // Sending banner message in response
  res.json({
    message
  });

});


// ======================================================
// DELETE API -> DELETE BANNER
// ======================================================

// This API removes banner from Redis.
//
// Endpoint:
// DELETE /banner
app.delete("/banner", async (req, res) => {

  // redis.del(key)
  // Deletes data from Redis
  await redis.del(BANNER_KEY);

  // Success response
  res.json({
    success: true
  });

});


// ======================================================
// GET API -> CHECK WHETHER BANNER EXISTS
// ======================================================

// This API checks if banner exists in Redis.
//
// Endpoint:
// GET /banner/exists
app.get("/banner/exists", async (req, res) => {

  // redis.exists(key)
  //
  // Returns:
  // 1 -> if key exists
  // 0 -> if key does not exist
  const exists = await redis.exists(BANNER_KEY);

  // Boolean() converts:
  // 1 -> true
  // 0 -> false
  res.json({
    exists: Boolean(exists)
  });

});


// ===============================
// STARTING SERVER
// ===============================

// Server will run on PORT variable
// OR default 3000
const PORT = process.env.PORT || 3000;


// app.listen starts backend server
app.listen(PORT, () => {

  console.log(
    `Server running on http://localhost:${PORT}`
  );

});