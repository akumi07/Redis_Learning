// ======================================================
// IMPORTS
// ======================================================

// Express framework import kar rahe hain
// Express ka use backend server aur APIs banane ke liye hota hai
import express from 'express';

// Redis library import kar rahe hain
// ioredis -> Redis database se connect karne ke liye
import Redis from 'ioredis';


// ======================================================
// EXPRESS APP CREATE
// ======================================================

// express() ek application/server object return karta hai
const app = express();


// ======================================================
// MIDDLEWARE
// ======================================================

// express.json() middleware JSON body ko read karta hai
//
// Example:
// Client bhejta hai:
// {
//    "phone": "9876543210"
// }
//
// To ye req.body me convert kar dega
app.use(express.json());


// ======================================================
// REDIS CONNECTION
// ======================================================

// Redis client create kar rahe hain
//
// process.env.REDIS_URL
// Agar deployment pe Redis URL ho to usko use karo
//
// Otherwise localhost Redis use karo
//
// redis://localhost:6379
// localhost -> same machine
// 6379 -> default Redis port
const redis = new Redis(
    process.env.REDIS_URL || 'redis://localhost:6379'
);


// ======================================================
// HELPER FUNCTION
// ======================================================

// Ye function Redis key banata hai
//
// Example:
// phone = 9999999999
//
// return:
// otp:9999999999
//
// Hum direct phone use nahi karte
// because structured naming better hoti hai
function otpKey(phone) {
    return `otp:${phone}`;
}


// ======================================================
// ROUTE 1 -> SEND OTP
// ======================================================

// POST API create kar rahe hain
//
// Endpoint:
// POST /otp
//
// Client phone bhejega
//
// Example body:
// {
//    "phone": "9876543210"
// }
app.post('/otp', async (req, res) => {

    // req.body se phone nikal rahe hain
    const { phone } = req.body;


    // ======================================================
    // RANDOM OTP GENERATE
    // ======================================================

    // Math.random()
    // random decimal deta hai
    //
    // Example:
    // 0.34567
    //
    // * 900000
    // number ko bada kar diya
    //
    // +100000
    // taaki minimum 6 digit aaye
    //
    // Example final:
    // 456789
    const otp = Math.floor(
        100000 + Math.random() * 900000
    ).toString();


    // ======================================================
    // REDIS ME STORE KARO
    // ======================================================

    // Redis command internally:
    //
    // SET otp:9876543210 456789 EX 30
    //
    // EX = expiry time
    //
    // 30 seconds baad OTP automatically delete ho jayega
    await redis.set(
        otpKey(phone),
        otp,
        'EX',
        60
    );


    // ======================================================
    // RESPONSE
    // ======================================================

    // Real-world app me:
    // OTP SMS service se bhejte hain
    //
    // Filhaal testing ke liye response me bhej rahe hain
    res.json({
        message: 'OTP sent successfully',
        otp
    });
});


// ======================================================
// ROUTE 2 -> VERIFY OTP
// ======================================================

// Endpoint:
// POST /otp/verify
//
// Client bhejega:
// {
//    "phone": "9876543210",
//    "otp": "456789"
// }
app.post('/otp/verify', async (req, res) => {

    // body se phone aur otp nikal rahe hain
    const { phone, otp } = req.body;

    console.log("================================");
    console.log("VERIFY API HIT");
    console.log("PHONE RECEIVED:", phone);
    console.log("OTP RECEIVED:", otp);

    // Redis key create karo
    const key = otpKey(phone);

    console.log("REDIS KEY:", key);

    // Redis se OTP nikalo
    const savedOtp = await redis.get(key);

    console.log("OTP FROM REDIS:", savedOtp);


    // ======================================================
    // CASE 1 -> OTP EXPIRED
    // ======================================================

    if (!savedOtp) {

        console.log("OTP NOT FOUND IN REDIS");

        return res.status(400).json({
            message: 'OTP expired or not found'
        });
    }


    // ======================================================
    // CASE 2 -> WRONG OTP
    // ======================================================

    if (savedOtp !== otp) {

        console.log("OTP MISMATCH");

        return res.status(400).json({
            message: 'Invalid OTP'
        });
    }


    // ======================================================
    // CASE 3 -> SUCCESS
    // ======================================================

    console.log("OTP VERIFIED SUCCESSFULLY");

    await redis.del(key);

    res.json({
        message: 'OTP verified successfully'
    });
});


// ======================================================
// ROUTE 3 -> CHECK TTL
// ======================================================

// Endpoint:
// GET /otp/:phone/ttl
//
// Example:
// /otp/9876543210/ttl
//
// TTL = Time To Live
//
// Matlab:
// OTP expire hone me kitna time bacha hai
app.get('/otp/:phone/ttl', async (req, res) => {

    // req.params.phone
    // URL parameter read karta hai

    // Redis TTL command
    //
    // Example:
    // TTL otp:9876543210
    //
    // return:
    // 20
    //
    // matlab 20 seconds bache hain
    const ttl = await redis.ttl(
        otpKey(req.params.phone)
    );


    // Response bhejo
    res.json({
        ttl
    });
});


app.post('/test', (req, res) => {

    console.log(req.body);

    res.json({
        body: req.body
    });
});
// ======================================================
// SERVER START
// ======================================================

// app.listen()
// Server ko start karta hai
//
// 3000 -> port number
app.listen(3000, () => {

    console.log(
        'Server running on port 3000'
    );
});