const Student = require('../models/Student');

const createUTCDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString + 'T00:00:00.000Z');
};


exports.registerStudent = async (req, res) => {
    const { name, rollNumber, email, password, messStartDate, messEndDate } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are now required for student registration.' });
    }
    if (!name || !rollNumber || !messStartDate || !messEndDate) {
        return res.status(400).json({ message: 'All fields including start and end dates are required.' });
    }
    try {
        const studentExists = await Student.findOne({ $or: [{ rollNumber }, { email }] });
        if (studentExists) {
            return res.status(400).json({ message: 'Student with this roll number or email already exists' });
        }

        const start = new Date(messStartDate.split('T')[0] + 'T00:00:00.000Z');
        const end = new Date(messEndDate.split('T')[0] + 'T00:00:00.000Z');

        const student = await Student.create({
            name,
            rollNumber,
            email,
            password,
            messStartDate: createUTCDate(messStartDate),
            messEndDate: createUTCDate(messEndDate),
        });
        res.status(201).json(student);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAllStudents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const searchQuery = req.query.search ? {
            $or: [
                { name: { $regex: req.query.search, $options: 'i' } },
                { rollNumber: { $regex: req.query.search, $options: 'i' } }
            ]
        } : {};

        const totalStudents = await Student.countDocuments(searchQuery);

        const students = await Student.find(searchQuery)
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit);

        res.json({
            students,
            currentPage: page,
            totalPages: Math.ceil(totalStudents / limit)
        });
    } catch (error) {
        console.error("Error in getAllStudents:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateStudentStatus = async (req, res) => {
    const { status, leaveStartDate, leaveEndDate } = req.body;
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        student.status = status;
        if (status === 'OnLeave') {
            student.leaveStartDate = leaveStartDate;
            student.leaveEndDate = leaveEndDate;
        } else if (status === 'Active') {
            student.leaveStartDate = null;
            student.leaveEndDate = null;
        }
        const updatedStudent = await student.save();
        res.json(updatedStudent);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.reactivateStudent = async (req, res) => {
    const { messStartDate, messEndDate } = req.body;
    if (!messStartDate || !messEndDate) {
        return res.status(400).json({ message: 'New start and end dates are required for reactivation.' });
    }

    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        student.status = 'Active';
        student.messStartDate = createUTCDate(messStartDate);
        student.messEndDate = createUTCDate(messEndDate);
        student.leaveStartDate = null;
        student.leaveEndDate = null;

        await student.save();
        res.json({ message: 'Student reactivated successfully.' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.renewSubscription = async (req, res) => {
    const { newMessEndDate } = req.body;

    if (!newMessEndDate) {
        return res.status(400).json({ message: 'A new end date is required for renewal.' });
    }

    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }
        if (new Date(student.messEndDate) < new Date()) {
            student.messStartDate = new Date();
        }

        student.messEndDate = createUTCDate(newMessEndDate);

        if (student.status === 'Terminated') {
            student.status = 'Active';
        }

        await student.save();
        res.json({ message: 'Subscription renewed successfully.' });

    } catch (error) {
        console.error("Error renewing subscription:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};