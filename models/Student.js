const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rollNumber: { type: String, required: true, unique: true, uppercase: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
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

StudentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

StudentSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Student', StudentSchema);