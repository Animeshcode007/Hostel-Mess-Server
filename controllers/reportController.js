const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const mongoose = require('mongoose');
const { calculateAllottedMeals } = require('../utils/date.helper');

exports.getDailySummary = async (req, res) => {
    try {
        if (!req.query.date) {
            return res.status(400).json({ message: 'Date query parameter is required.' });
        }

        const date = new Date(req.query.date);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        
        const endOfDay = new Date(new Date(req.query.date).setHours(23, 59, 59, 999));

        const attendanceSummary = await Attendance.aggregate([
            { $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
            {
                $group: {
                    _id: null,
                    morningMeals: { $sum: { $cond: ["$morning", 1, 0] } },
                    eveningMeals: { $sum: { $cond: ["$evening", 1, 0] } }
                }
            }
        ]);

        const totalActiveStudents = await Student.countDocuments({ status: 'Active' });

        const result = {
            date: startOfDay.toISOString().split('T')[0],
            morningMeals: attendanceSummary[0]?.morningMeals || 0,
            eveningMeals: attendanceSummary[0]?.eveningMeals || 0,
            totalMeals: (attendanceSummary[0]?.morningMeals || 0) + (attendanceSummary[0]?.eveningMeals || 0),
            totalActiveStudents
        };

        res.json(result);

    } catch (error) {
        console.error('Error getting daily summary:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getMonthlyStudentSummary = async (req, res) => {
    const { studentId, month } = req.query;

    if (!studentId || !month) {
        return res.status(400).json({ message: 'studentId and month are required.' });
    }


    try {
        const year = parseInt(month.split('-')[0]);
        const monthIndex = parseInt(month.split('-')[1]) - 1;
        const startDate = new Date(year, monthIndex, 1);
        const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

        const attendanceSummary = await Attendance.aggregate([
            {
                $match: {
                    student: new mongoose.Types.ObjectId(studentId),
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: "$student",
                    morningMeals: { $sum: { $cond: ["$morning", 1, 0] } },
                    eveningMeals: { $sum: { $cond: ["$evening", 1, 0] } }
                }
            }
        ]);

        const result = {
            studentId,
            month,
            morningMeals: attendanceSummary[0]?.morningMeals || 0,
            eveningMeals: attendanceSummary[0]?.eveningMeals || 0,
            totalMeals: (attendanceSummary[0]?.morningMeals || 0) + (attendanceSummary[0]?.eveningMeals || 0)
        };

        res.json(result);

    } catch (error) {
        console.error("Error getting monthly student summary:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getStudentMealLedger = async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId).lean();
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        const { messStartDate, messEndDate } = student;

        if (!messStartDate || !messEndDate) {
            return res.status(400).json({ message: 'Student subscription dates are not set.' });
        }

        const queryStartDate = new Date(messStartDate);
        queryStartDate.setUTCHours(0, 0, 0, 0);

        const queryEndDate = new Date(messEndDate);
        queryEndDate.setUTCHours(23, 59, 59, 999);

        const totalAllottedMeals = calculateAllottedMeals(messStartDate, messEndDate);

        const attendanceSummary = await Attendance.aggregate([
            {
                $match: {
                    student: new mongoose.Types.ObjectId(req.params.studentId),
                    date: { $gte: queryStartDate, $lte: queryEndDate }
                }
            },
            {
                $group: {
                    _id: "$student",
                    morningMeals: { $sum: { $cond: ["$morning", 1, 0] } },
                    eveningMeals: { $sum: { $cond: ["$evening", 1, 0] } }
                }
            }
        ]);

        const consumedMorning = attendanceSummary[0]?.morningMeals || 0;
        const consumedEvening = attendanceSummary[0]?.eveningMeals || 0;
        const totalConsumedMeals = consumedMorning + consumedEvening;
        const remainingMeals = totalAllottedMeals - totalConsumedMeals;

        res.json({
            subscription: {
                startDate: messStartDate,
                endDate: messEndDate
            },
            ledger: {
                totalAllotted: totalAllottedMeals,
                totalConsumed: totalConsumedMeals,
                remaining: remainingMeals,
                consumedMorning,
                consumedEvening
            }
        });

    } catch (error) {
        console.error("Error getting student meal ledger:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};