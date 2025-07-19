const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: ['Open', 'Resolved'],
        default: 'Open',
    },
    resolvedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Issue', IssueSchema);