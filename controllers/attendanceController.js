const Attendance = require('../models/Attendance');
const mongoose = require('mongoose');

exports.getAttendanceByDate = async (req, res) => {
    try {
        const date = new Date(req.query.date);
        const startOfDay = new Date(new Date(req.query.date).setHours(0, 0, 0, 0));
        const endOfDay = new Date(new Date(req.query.date).setHours(23, 59, 59, 999));

        const attendanceRecords = await Attendance.find({
            date: { $gte: startOfDay, $lte: endOfDay }
        }).populate('student', 'name rollNumber');

        const validRecords = attendanceRecords.filter(record => record.student !== null);

        const response = validRecords.map(record => ({
            _id: record._id,
            student: record.student._id.toString(),
            morning: record.morning,
            evening: record.evening,
            date: record.date
        }));

        res.json(response);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.markAttendance = async (req, res) => {
    const { studentId, date, meal, status } = req.body;

    try {
        const attendanceDate = new Date(`${date}T00:00:00.000Z`);

        const attendanceRecord = await Attendance.findOneAndUpdate(
            { student: studentId, date: attendanceDate },
            { $set: { [meal]: status, student: studentId, date: attendanceDate } },
            { new: true, upsert: true }
        ).populate('student', 'name rollNumber');

        res.status(200).json(attendanceRecord);
    } catch (error) {
        console.error('Mark Attendance Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};