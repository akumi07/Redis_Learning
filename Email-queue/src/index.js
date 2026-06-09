import express from 'express';
import Redis from 'ioredis';

const app = express();
app.use(express.json());

// Create connection with Redis
const redis = new Redis(
  process.env.REDIS_URL || 'redis://localhost:6379'
);

// Redis List key
const QUEUE_KEY = 'queue:emails';


// Producer API
// Push email job into Redis queue
app.post('/emails', async (req, res) => {

  const job = {
    to: req.body.to,
    subject: req.body.subject || 'No subject',
    body: req.body.body || 'No content',
    createdAt: new Date().toISOString()
  };

  // Add job to LEFT side of Redis List
  await redis.lpush(
    QUEUE_KEY,
    JSON.stringify(job)
  );

  res.json({
    queued: true,
    job
  });
});


// Consumer API
// Process one email from queue
app.get('/emails/process-one', async (req, res) => {

  const rawJob = await redis.rpop(QUEUE_KEY);

  if (!rawJob) {
    return res.json({
      message: 'No jobs in the queue'
    });
  }

  const job = JSON.parse(rawJob);

  // Simulate email sending

  res.json({
    message: 'Email sent',
    job
  });
});


app.listen(3000, () => {
  console.log(
    'Server is running on port http://localhost:3000'
  );
});