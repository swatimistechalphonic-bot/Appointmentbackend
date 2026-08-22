const Department = require('../models/Department');

const defaultDepartments = [
    { name: 'Cardiology', description: 'Comprehensive heart care, cardiovascular diagnosis, and surgery.', icon: 'Heart', headOfDepartment: 'Dr. Toni Kover', totalDoctors: 12, status: 'Active' },
    { name: 'Orthopedic', description: 'Bone, joint replacement, trauma, and sports injury rehabilitation.', icon: 'Bone', headOfDepartment: 'Dr. Calvin Carlo', totalDoctors: 8, status: 'Active' },
    { name: 'Gynecology & Obstetrics', description: 'Maternal health, prenatal care, and women reproductive health.', icon: 'User', headOfDepartment: 'Dr. Cristino Murphy', totalDoctors: 15, status: 'Active' },
    { name: 'Neurology & Brain Care', description: 'Brain tumor, stroke management, and nervous system disorders.', icon: 'Activity', headOfDepartment: 'Dr. Jessica Taylor', totalDoctors: 10, status: 'Active' },
    { name: 'Psychotherapy & Mental Health', description: 'Psychological counseling, behavioral therapy, and mental health.', icon: 'Brain', headOfDepartment: 'Dr. Alia Reddy', totalDoctors: 6, status: 'Active' },
    { name: 'General Physician', description: 'Primary health care, routine medical checkups, and wellness care.', icon: 'Stethoscope', headOfDepartment: 'Dr. Rahul Sharma', totalDoctors: 20, status: 'Active' }
];

module.exports = {
    up: async () => {
        console.log('  ↳ Seeding default Hospital Departments...');
        for (const dept of defaultDepartments) {
            await Department.updateOne(
                { name: dept.name },
                { $setOnInsert: dept },
                { upsert: true }
            );
        }
        console.log('  ↳ Default Hospital Departments Migration complete!');
    },

    down: async () => {
        console.log('  ↳ Removing seeded departments...');
    }
};
