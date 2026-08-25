/**
 * Backend Diagnostics & Verification Engine
 * 
 * Verifies:
 * 1. Environment variables configurations
 * 2. Direct MongoDB connection and data integrity (collections counts)
 * 3. Server HTTP availability (checks running instance or spawns one)
 * 4. Swagger API Documentation service
 * 5. E2E User Sign-up -> Sign-in -> Authorized Profile retrieval flow
 */

require('dotenv').config();
const { spawn } = require('child_process');
const mongoose = require('mongoose');
const User = require('../models/User');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;
const MONGODB_URI = process.env.MONGODB_URI;

// ANSI Colors for beautiful formatted CLI output
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
    magenta: "\x1b[35m",
    bgGreen: "\x1b[42m",
    bgRed: "\x1b[41m"
};

function logHeader(title) {
    console.log(`\n${colors.bright}${colors.cyan}=== ${title} ===${colors.reset}`);
}

function logSuccess(message) {
    console.log(`  ${colors.green}✓${colors.reset} ${message}`);
}

function logFailure(message, error = null) {
    console.error(`  ${colors.red}✗${colors.reset} ${message}`);
    if (error) {
        console.error(`    ${colors.red}Details: ${error.message || error}${colors.reset}`);
    }
}

function logInfo(message) {
    console.log(`  ${colors.yellow}i${colors.reset} ${message}`);
}

// 1. Verify Env Configurations
function verifyEnv() {
    logHeader("ENVIRONMENT CONFIGURATION CHECKS");
    let hasErrors = false;
    const requiredKeys = ['PORT', 'MONGODB_URI', 'JWT_SECRET'];

    for (const key of requiredKeys) {
        if (process.env[key]) {
            logSuccess(`Environment variable '${key}' is defined.`);
        } else {
            logFailure(`Environment variable '${key}' is missing!`);
            hasErrors = true;
        }
    }

    if (hasErrors) {
        throw new Error("Missing required environment variables in .env");
    }
}

// 2. Direct Database Checks
async function checkDatabase() {
    logHeader("MONGODB CONNECTIVITY & SCHEMA CHECKS");
    if (!MONGODB_URI) {
        throw new Error("MONGODB_URI is not set.");
    }

    logInfo("Attempting to connect to MongoDB...");
    
    // Set custom DNS if in local env to bypass potential lookup issues
    if (!process.env.RENDER && process.env.NODE_ENV !== 'production') {
        try {
            const dns = require('dns');
            dns.setServers(['8.8.8.8', '8.8.4.4']);
        } catch (err) {
            // ignore
        }
    }

    await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
    });

    logSuccess("Successfully connected to MongoDB server.");
    logInfo(`Host: ${mongoose.connection.host}`);
    logInfo(`Database Name: ${mongoose.connection.name}`);

    // Retrieve collection stats
    const collections = await mongoose.connection.db.listCollections().toArray();
    logSuccess(`Discovered collections: ${collections.map(c => c.name).join(', ')}`);

    // Verify models and count documents
    const modelsToCheck = [
        { name: 'User', model: require('../models/User') },
        { name: 'Appointment', model: require('../models/Appointment') },
        { name: 'Department', model: require('../models/Department') },
        { name: 'Patient', model: require('../models/Patient') },
        { name: 'Payment', model: require('../models/Payment') },
        { name: 'Review', model: require('../models/Review') },
        { name: 'Setting', model: require('../models/Setting') }
    ];

    for (const item of modelsToCheck) {
        try {
            const count = await item.model.countDocuments();
            logSuccess(`Schema '${item.name}': found ${count} documents.`);
        } catch (err) {
            logFailure(`Failed to query '${item.name}' documents count`, err);
        }
    }
}

// Helper to check if server is active on PORT
async function isServerRunning() {
    try {
        const res = await fetch(`${BASE_URL}/`);
        return res.status === 200;
    } catch (e) {
        return false;
    }
}

// 3 & 4. HTTP Endpoint Diagnostics
async function runHTTPDiagnostics() {
    logHeader("HTTP ENDPOINTS DIAGNOSTICS");

    // Check Root Endpoint
    try {
        const startTime = Date.now();
        const res = await fetch(`${BASE_URL}/`);
        const duration = Date.now() - startTime;
        const data = await res.json();

        if (res.status === 200 && data.message) {
            logSuccess(`Root API Endpoint GET / is working perfectly (${duration}ms)`);
            logInfo(`Response: ${JSON.stringify(data)}`);
        } else {
            throw new Error(`Unexpected status code: ${res.status}`);
        }
    } catch (e) {
        logFailure("Root API Endpoint GET / is failing", e);
        throw e;
    }

    // Check Swagger Documentation Endpoint
    try {
        const startTime = Date.now();
        const res = await fetch(`${BASE_URL}/api-docs/`);
        const duration = Date.now() - startTime;

        if (res.status === 200 || res.status === 301 || res.status === 304) {
            logSuccess(`Swagger UI docs page GET /api-docs/ is available (${duration}ms)`);
        } else {
            throw new Error(`Unexpected status code: ${res.status}`);
        }
    } catch (e) {
        logFailure("Swagger UI docs page GET /api-docs/ is unavailable", e);
        throw e;
    }
}

// 5. E2E Signup, Login, and Auth Token Profile Retrieval Flow
async function runE2EAuthFlow() {
    logHeader("E2E AUTHENTICATION & API ROUTE INTEGRITY CHECK");

    const testEmail = `diagnostic-test-${Date.now()}@example.com`;
    const testPassword = "securePassword123!";
    const testName = "Diagnostics Test User";
    let jwtToken = '';

    // Step A: Register Test User
    try {
        logInfo(`Attempting user registration for email: ${testEmail}...`);
        const startTime = Date.now();
        const res = await fetch(`${BASE_URL}/api/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: testName,
                email: testEmail,
                password: testPassword,
                phone: '1234567890',
                role: 'user'
            })
        });
        const duration = Date.now() - startTime;
        const data = await res.json();

        if (res.status === 201 && data.success) {
            logSuccess(`User Registration endpoint POST /api/users/register is functional (${duration}ms)`);
        } else {
            throw new Error(data.message || `Status: ${res.status}`);
        }
    } catch (e) {
        logFailure("User Registration endpoint POST /api/users/register failed", e);
        throw e;
    }

    // Step B: Login Test User
    try {
        logInfo("Attempting user login...");
        const startTime = Date.now();
        const res = await fetch(`${BASE_URL}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: testPassword
            })
        });
        const duration = Date.now() - startTime;
        const data = await res.json();

        if (res.status === 200 && data.success && data.token) {
            jwtToken = data.token;
            logSuccess(`User Login endpoint POST /api/users/login is functional (${duration}ms)`);
            logInfo("JWT Token acquired successfully.");
        } else {
            throw new Error(data.message || `Status: ${res.status}`);
        }
    } catch (e) {
        logFailure("User Login endpoint POST /api/users/login failed", e);
        throw e;
    }

    // Step C: Retrieve Authorized Profile Details
    try {
        logInfo("Attempting authorized profile fetch using JWT Bearer token...");
        const startTime = Date.now();
        const res = await fetch(`${BASE_URL}/api/users/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json'
            }
        });
        const duration = Date.now() - startTime;
        const data = await res.json();

        if (res.status === 200 && data.success) {
            logSuccess(`Authorized Profile retrieval GET /api/users/profile is functional (${duration}ms)`);
            logInfo(`Fetched profile name: ${data.user.name}, role: ${data.user.role}`);
        } else {
            throw new Error(data.message || `Status: ${res.status}`);
        }
    } catch (e) {
        logFailure("Authorized Profile retrieval GET /api/users/profile failed", e);
        throw e;
    }

    // Step D: Cleanup test user from Database
    try {
        logInfo("Cleaning up E2E test data from MongoDB...");
        const deleteRes = await User.deleteOne({ email: testEmail });
        if (deleteRes.deletedCount > 0) {
            logSuccess("Test user cleaned up successfully from database.");
        } else {
            logInfo("Test user was not found for database cleanup.");
        }
    } catch (e) {
        logFailure("Database cleanup of test user failed", e);
    }
}

// Main Runner
async function runDiagnostics() {
    console.log(`\n${colors.bright}${colors.magenta}====================================================`);
    console.log(`🚀 STARTING BACKEND DIAGNOSTICS & VERIFICATION RUNNER`);
    console.log(`====================================================${colors.reset}`);

    let serverProcess = null;
    let dbConnected = false;

    try {
        // Step 1: Check Environment variables
        verifyEnv();

        // Step 2: Check MongoDB
        await checkDatabase();
        dbConnected = true;

        // Step 3: Check if Server is running, if not start it
        let running = await isServerRunning();
        if (running) {
            logInfo(`Existing backend instance detected on port ${PORT}. Testing running instance.`);
        } else {
            logInfo(`No server active on port ${PORT}. Spawning a temporary backend process...`);
            serverProcess = spawn('node', ['server.js'], {
                cwd: process.cwd(),
                stdio: 'ignore', // Suppress console logs of spawned process to keep diagnostics output clean
                detached: false
            });

            // Wait for server to start up (up to 5 seconds)
            let retries = 10;
            while (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 500));
                running = await isServerRunning();
                if (running) break;
                retries--;
            }

            if (!running) {
                throw new Error(`Failed to spawn backend process on port ${PORT}. Please check if the port is busy.`);
            }

            logSuccess(`Temporary backend process spawned successfully on port ${PORT}.`);
        }

        // Step 4: Run HTTP diagnostics
        await runHTTPDiagnostics();

        // Step 5: Run E2E Auth checks
        await runE2EAuthFlow();

        // All tests passed
        console.log(`\n${colors.bright}${colors.bgGreen}${colors.green}  DIAGNOSTICS PASSED SUCCESSFULLY!  ${colors.reset}`);
        console.log(`${colors.bright}All backend modules, MongoDB connectivity, routers, and E2E flows are verified and running properly.${colors.reset}\n`);
        
        process.exitCode = 0;
    } catch (error) {
        console.error(`\n${colors.bright}${colors.bgRed}${colors.red}  DIAGNOSTICS RUNNER ENCOUNTERED FAILURE  ${colors.reset}`);
        console.error(`${colors.bright}Error occurred during backend check:${colors.reset}`, error.message || error);
        
        process.exitCode = 1;
    } finally {
        // Graceful cleanup
        if (dbConnected) {
            await mongoose.disconnect();
            logInfo("Disconnected from MongoDB.");
        }
        if (serverProcess) {
            logInfo("Shutting down the spawned temporary backend process...");
            serverProcess.kill();
        }
    }
}

runDiagnostics();
