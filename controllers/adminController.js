const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// exports.registerAdmin = async (req, res) => {
//     const { username, password } = req.body;
//     try {
//         const adminExists = await Admin.findOne({ username });
//         if (adminExists) {
//             return res.status(400).json({ message: 'Admin already exists' });
//         }
//         const admin = await Admin.create({ username, password });
//         res.status(201).json({ _id: admin._id, username: admin.username });
//     } catch (error) {
//         res.status(500).json({ message: 'Server Error' });
//     }
// };

exports.loginAdmin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await Admin.findOne({ username });
        if (admin && (await admin.matchPassword(password))) {
            const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
            res.json({
                _id: admin._id,
                username: admin.username,
                token,
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.changeAdminPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Please provide both current and new passwords.' });
    }

    try {
        const admin = await Admin.findById(req.admin.id);

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        const isMatch = await admin.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password.' });
        }

        admin.password = newPassword;
        await admin.save();

        res.json({ message: 'Password updated successfully.' });

    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};