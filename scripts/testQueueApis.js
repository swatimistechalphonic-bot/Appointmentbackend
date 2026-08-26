const mongoose = require('mongoose');
const express = require('express');
require('dotenv').config();

const connectDB = require('../db');
const queueRoutes = require('../routes/queueRoutes');
const Queue = require('../models/Queue');

const app = express();
app.use(express.json());
app.use('/api/queue', queueRoutes);

async function runTests() {
    console.log('--- Starting Queue API Comprehensive Test Suite ---');
    let server;
    try {
        await connectDB();
        
        await new Promise((resolve) => {
            server = app.listen(5099, () => {
                console.log('Test server listening on port 5099');
                resolve();
            });
        });

        const baseUrl = 'http://127.0.0.1:5099/api/queue';
        const testDate = '2026-08-26';

        // Clean up test items for this date
        await Queue.deleteMany({ date: testDate, notes: 'Test queue item' });

        // Helper request
        const apiReq = async (endpoint, options = {}) => {
            const res = await fetch(`${baseUrl}${endpoint}`, {
                headers: { 'Content-Type': 'application/json' },
                ...options
            });
            const data = await res.json();
            return { status: res.status, data };
        };

        // 1. GET /api/queue/today
        console.log('\n[1] Testing GET /api/queue/today ...');
        const resStats1 = await apiReq(`/today?date=${testDate}`);
        console.log('Status:', resStats1.status, 'Body:', JSON.stringify(resStats1.data));
        if (resStats1.status !== 200 || !resStats1.data.success) throw new Error('Failed GET /api/queue/today');

        // 2. GET /api/queue/check-in/today
        console.log('\n[2] Testing GET /api/queue/check-in/today ...');
        const resCheckInList = await apiReq(`/check-in/today?date=${testDate}`);
        console.log('Status:', resCheckInList.status, 'Count:', resCheckInList.data.count);
        if (resCheckInList.status !== 200 || !resCheckInList.data.success) throw new Error('Failed GET /api/queue/check-in/today');

        // 3. POST /api/queue/check-in (Create 2 patients)
        console.log('\n[3] Testing POST /api/queue/check-in ...');
        const resCheckIn1 = await apiReq('/check-in', {
            method: 'POST',
            body: JSON.stringify({
                patientName: 'Aarav Gupta',
                patientPhone: '+91 9999911111',
                doctorName: 'Dr. Rahul Sharma',
                date: testDate,
                timeSlot: '12:30 PM',
                notes: 'Test queue item'
            })
        });
        console.log('Patient 1 Token:', resCheckIn1.data.data?.token);
        if (resCheckIn1.status !== 201 || !resCheckIn1.data.data?.token?.startsWith('T-')) throw new Error('Failed Check-In 1');

        const resCheckIn2 = await apiReq('/check-in', {
            method: 'POST',
            body: JSON.stringify({
                patientName: 'Neha Malhotra',
                patientPhone: '+91 9999922222',
                doctorName: 'Dr. Amit Verma',
                date: testDate,
                timeSlot: '01:00 PM',
                notes: 'Test queue item'
            })
        });
        console.log('Patient 2 Token:', resCheckIn2.data.data?.token);
        if (resCheckIn2.status !== 201 || !resCheckIn2.data.data?.token?.startsWith('T-')) throw new Error('Failed Check-In 2');

        const queueItem1Id = resCheckIn1.data.data._id;
        const queueItem2Id = resCheckIn2.data.data._id;

        // 4. GET /api/queue/today/board
        console.log('\n[4] Testing GET /api/queue/today/board ...');
        const resBoard = await apiReq(`/today/board?date=${testDate}`);
        console.log('Status:', resBoard.status, 'Total in board:', resBoard.data.total);
        if (resBoard.status !== 200 || resBoard.data.total < 2) throw new Error('Failed GET /api/queue/today/board');

        // 5. GET /api/queue/current
        console.log('\n[5] Testing GET /api/queue/current ...');
        const resCurrent1 = await apiReq(`/current?date=${testDate}`);
        console.log('Status:', resCurrent1.status, 'Active data:', resCurrent1.data.data);

        // 6. POST /api/queue/call-next
        console.log('\n[6] Testing POST /api/queue/call-next ...');
        const resCallNext = await apiReq('/call-next', {
            method: 'POST',
            body: JSON.stringify({ date: testDate })
        });
        console.log('Status:', resCallNext.status, 'Called:', resCallNext.data.data?.token, resCallNext.data.data?.patientName);
        if (resCallNext.status !== 200 || resCallNext.data.data?.status !== 'In Consultation') throw new Error('Failed POST /api/queue/call-next');

        // 7. POST /api/queue/:id/start
        console.log('\n[7] Testing POST /api/queue/:id/start ...');
        const resStart = await apiReq(`/${queueItem1Id}/start`, {
            method: 'POST',
            body: JSON.stringify({ date: testDate })
        });
        console.log('Status:', resStart.status, 'Status value:', resStart.data.data?.status);
        if (resStart.status !== 200 || resStart.data.data?.status !== 'In Consultation') throw new Error('Failed POST /:id/start');

        // 8. POST /api/queue/:id/complete
        console.log('\n[8] Testing POST /api/queue/:id/complete ...');
        const resComplete = await apiReq(`/${queueItem1Id}/complete`, {
            method: 'POST',
            body: JSON.stringify({ date: testDate })
        });
        console.log('Status:', resComplete.status, 'Status value:', resComplete.data.data?.status);
        if (resComplete.status !== 200 || resComplete.data.data?.status !== 'Completed') throw new Error('Failed POST /:id/complete');

        // 9. POST /api/queue/:id/skip
        console.log('\n[9] Testing POST /api/queue/:id/skip ...');
        const resSkip = await apiReq(`/${queueItem2Id}/skip`, {
            method: 'POST',
            body: JSON.stringify({ date: testDate })
        });
        console.log('Status:', resSkip.status, 'Status value:', resSkip.data.data?.status);
        if (resSkip.status !== 200 || resSkip.data.data?.status !== 'Skipped') throw new Error('Failed POST /:id/skip');

        // 10. POST /api/queue/:id/recall
        console.log('\n[10] Testing POST /api/queue/:id/recall ...');
        const resRecall = await apiReq(`/${queueItem2Id}/recall`, {
            method: 'POST',
            body: JSON.stringify({ date: testDate })
        });
        console.log('Status:', resRecall.status, 'Status value:', resRecall.data.data?.status);
        if (resRecall.status !== 200 || resRecall.data.data?.status !== 'Waiting') throw new Error('Failed POST /:id/recall');

        // 11. POST /api/queue/:id/cancel
        console.log('\n[11] Testing POST /api/queue/:id/cancel ...');
        const resCancel = await apiReq(`/${queueItem2Id}/cancel`, {
            method: 'POST',
            body: JSON.stringify({ date: testDate })
        });
        console.log('Status:', resCancel.status, 'Status value:', resCancel.data.data?.status);
        if (resCancel.status !== 200 || resCancel.data.data?.status !== 'Cancelled') throw new Error('Failed POST /:id/cancel');

        // 12. GET /api/queue/doctor/:doctorId
        console.log('\n[12] Testing GET /api/queue/doctor/:doctorId ...');
        const resDoctor = await apiReq(`/doctor/Rahul?date=${testDate}`);
        console.log('Status:', resDoctor.status, 'Doctor queue count:', resDoctor.data.data?.length);
        if (resDoctor.status !== 200 || !resDoctor.data.success) throw new Error('Failed GET /doctor/:doctorId');

        // 13. GET /api/queue/patient/:patientId
        console.log('\n[13] Testing GET /api/queue/patient/:patientId ...');
        const resPatient = await apiReq(`/patient/Aarav`);
        console.log('Status:', resPatient.status, 'Patient queue count:', resPatient.data.count);
        if (resPatient.status !== 200 || !resPatient.data.success) throw new Error('Failed GET /patient/:patientId');

        // Clean up
        await Queue.deleteMany({ date: testDate, notes: 'Test queue item' });
        console.log('\n✅ ALL 13 QUEUE API ENDPOINTS VERIFIED & WORKING PERFECTLY!');
        if (server) server.close();
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Test failure:', err);
        if (server) server.close();
        process.exit(1);
    }
}

runTests();
