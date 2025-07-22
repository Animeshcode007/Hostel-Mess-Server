const Student = require('../models/Student');
const jwt = require('jsonwebtoken');

exports.loginStudent = async (req, res) => {
    const { email, password } = req.body;
    try {
        const student = await Student.findOne({ email });

        if (student && (await student.matchPassword(password))) {
            const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
                expiresIn: '7d',
            });
            res.json({
                _id: student._id,
                name: student.name,
                email: student.email,
                token: token,
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMyProfile = async (req, res) => {
    res.json(req.student);
};