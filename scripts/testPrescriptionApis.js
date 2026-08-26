const mongoose = require('mongoose');
const express = require('express');
require('dotenv').config();

const connectDB = require('../db');
const prescriptionRoutes = require('../routes/prescriptionRoutes');
const Prescription = require('../models/Prescription');

const app = express();
app.use(express.json());
app.use('/api/prescriptions', prescriptionRoutes);

async function runTests() {
    console.log('--- Starting Prescription API Comprehensive Test Suite ---');
    let server;
    try {
        await connectDB();

        await new Promise((resolve) => {
            server = app.listen(5098, () => {
                console.log('Prescription test server listening on port 5098');
                resolve();
            });
        });

        const baseUrl = 'http://127.0.0.1:5098/api/prescriptions';

        // Helper request
        const apiReq = async (endpoint, options = {}) => {
            const res = await fetch(`${baseUrl}${endpoint}`, {
                headers: { 'Content-Type': 'application/json' },
                ...options
            });
            const data = await res.json();
            return { status: res.status, data };
        };

        // 1. GET /api/prescriptions/stats
        console.log('\n[1] Testing GET /api/prescriptions/stats ...');
        const resStats = await apiReq('/stats');
        console.log('Status:', resStats.status, 'Stats:', JSON.stringify(resStats.data));
        if (resStats.status !== 200 || !resStats.data.success) throw new Error('Failed GET /stats');

        // 2. POST /api/prescriptions (Create test prescription)
        console.log('\n[2] Testing POST /api/prescriptions ...');
        const resCreate = await apiReq('/', {
            method: 'POST',
            body: JSON.stringify({
                patientName: 'Swati Test Patient',
                age: 26,
                gender: 'Female',
                doctorName: 'Dr. Rahul Sharma',
                diagnosis: 'Acute Viral Fever & Sore Throat',
                medicines: [
                    { name: 'Paracetamol', dosage: '500 mg', frequency: 'Three times a day (1-1-1)', duration: '5 Days', instructions: 'Post meals' },
                    { name: 'Amoxicillin', dosage: '500 mg', frequency: 'Twice daily', duration: '5 Days', instructions: 'After food' }
                ],
                followUp: '2026-09-02',
                notes: 'Drink plenty of fluids and rest.'
            })
        });
        console.log('Status:', resCreate.status, 'Created Rx ID:', resCreate.data.data?.prescriptionId);
        if (resCreate.status !== 201 || !resCreate.data.data?.prescriptionId?.startsWith('RX-')) throw new Error('Failed POST /api/prescriptions');

        const createdRxId = resCreate.data.data._id;
        const rxCode = resCreate.data.data.prescriptionId;

        // 3. GET /api/prescriptions
        console.log('\n[3] Testing GET /api/prescriptions ...');
        const resList = await apiReq('?search=Swati');
        console.log('Status:', resList.status, 'Count:', resList.data.count);
        if (resList.status !== 200 || resList.data.count < 1) throw new Error('Failed GET /api/prescriptions');

        // 4. GET /api/prescriptions/:id
        console.log('\n[4] Testing GET /api/prescriptions/:id (by Rx code) ...');
        const resGetById = await apiReq(`/${rxCode}`);
        console.log('Status:', resGetById.status, 'Fetched diagnosis:', resGetById.data.data?.diagnosis);
        if (resGetById.status !== 200 || resGetById.data.data?.diagnosis !== 'Acute Viral Fever & Sore Throat') throw new Error('Failed GET /:id');

        // 5. PUT /api/prescriptions/:id
        console.log('\n[5] Testing PUT /api/prescriptions/:id ...');
        const resUpdate = await apiReq(`/${createdRxId}`, {
            method: 'PUT',
            body: JSON.stringify({
                diagnosis: 'Recovering Viral Fever',
                notes: 'Patient showing good recovery.'
            })
        });
        console.log('Status:', resUpdate.status, 'Updated diagnosis:', resUpdate.data.data?.diagnosis);
        if (resUpdate.status !== 200 || resUpdate.data.data?.diagnosis !== 'Recovering Viral Fever') throw new Error('Failed PUT /:id');

        // 6. GET /api/prescriptions/patient/:patientId
        console.log('\n[6] Testing GET /api/prescriptions/patient/:patientId ...');
        const resPatient = await apiReq('/patient/Swati');
        console.log('Status:', resPatient.status, 'Count:', resPatient.data.count);
        if (resPatient.status !== 200 || resPatient.data.count < 1) throw new Error('Failed GET /patient/:patientId');

        // 7. GET /api/prescriptions/doctor/:doctorId
        console.log('\n[7] Testing GET /api/prescriptions/doctor/:doctorId ...');
        const resDoc = await apiReq('/doctor/Rahul');
        console.log('Status:', resDoc.status, 'Count:', resDoc.data.count);
        if (resDoc.status !== 200 || resDoc.data.count < 1) throw new Error('Failed GET /doctor/:doctorId');

        // 8. DELETE /api/prescriptions/:id
        console.log('\n[8] Testing DELETE /api/prescriptions/:id ...');
        const resDelete = await apiReq(`/${createdRxId}`, {
            method: 'DELETE'
        });
        console.log('Status:', resDelete.status, 'Deleted message:', resDelete.data.message);
        if (resDelete.status !== 200 || !resDelete.data.success) throw new Error('Failed DELETE /:id');

        console.log('\n✅ ALL PRESCRIPTION API ENDPOINTS VERIFIED & WORKING PERFECTLY!');
        if (server) server.close();
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Test failure:', err);
        if (server) server.close();
        process.exit(1);
    }
}

runTests();
