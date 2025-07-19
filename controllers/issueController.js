const Issue = require('../models/Issue');

exports.createIssue = async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required.' });
    }

    const issue = new Issue({
        title,
        description
    });

    try {
        const newIssue = await issue.save();
        res.status(201).json({ message: 'Issue raised successfully!', data: newIssue });
    } catch (err) {
        res.status(500).json({ message: 'Failed to save the issue.', error: err.message });
    }
};

exports.updateIssueStatus = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        issue.status = req.body.status || issue.status;

        if (req.body.status === 'Resolved' && issue.status !== 'Resolved') {
            issue.resolvedAt = new Date();
        }

        const updatedIssue = await issue.save();
        res.json(updatedIssue);

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAllIssues = async (req, res) => {
    try {
        const issues = await Issue.find({}).sort({ status: 1, createdAt: -1 });
        res.json(issues);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};