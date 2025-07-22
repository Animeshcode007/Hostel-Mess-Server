const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const mongoose = require('mongoose');
const { calculateAllottedMeals } = require('../utils/date.helper');

exports.getMyLedger = async (req, res) => {
    try {
        const student = req.student; 
        const { messStartDate, messEndDate } = student;

        if (!messStartDate || !messEndDate) {
            return res.status(400).json({ message: 'Subscription dates not set.' });
        }
        
        const totalAllottedMeals = calculateAllottedMeals(messStartDate, messEndDate);

        const attendanceSummary = await Attendance.aggregate([
            { $match: { student: student._id, date: { $gte: messStartDate, $lte: messEndDate } } },
            { $group: {
                _id: null,
                morningMeals: { $sum: { $cond: ["$morning", 1, 0] } },
                eveningMeals: { $sum: { $cond: ["$evening", 1, 0] } }
            }}
        ]);
        
        const consumedMorning = attendanceSummary[0]?.morningMeals || 0;
        const consumedEvening = attendanceSummary[0]?.eveningMeals || 0;
        const totalConsumedMeals = consumedMorning + consumedEvening;
        const remainingMeals = totalAllottedMeals - totalConsumedMeals;

        res.json({
            totalAllotted: totalAllottedMeals,
            totalConsumed: totalConsumedMeals,
            remaining: remainingMeals,
        });

    } catch (error) {
        console.error("Error getting student ledger:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getMyAttendance = async (req, res) => {
    try {
        const studentId = req.student._id;
        const { month } = req.query;

        if (!month) {
            return res.status(400).json({ message: 'Month query parameter is required.' });
        }
        
        const year = parseInt(month.split('-')[0]);
        const monthIndex = parseInt(month.split('-')[1]) - 1;
        const startDate = new Date(Date.UTC(year, monthIndex, 1));
        const endDate = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999));

        const records = await Attendance.find({
            student: studentId,
            date: { $gte: startDate, $lte: endDate }
        }).select('date morning evening -_id');

        res.json(records);
    } catch (error) {
        console.error("Error getting student attendance:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};