const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rollNumber: { type: String, required: true, unique: true },
    status: {
        type: String,
        enum: ['Active', 'OnLeave', 'Terminated'],
        default: 'Active',
    },
    messStartDate: { type: Date, required: true },
    messEndDate: { type: Date, required: true },
    leaveStartDate: { type: Date },
    leaveEndDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);