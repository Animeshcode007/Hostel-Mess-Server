require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const issueRoutes = require('./routes/issueRoutes');
const reportRoutes = require('./routes/reportRoutes');
const studentDataRoutes = require('./routes/studentDataRoutes');
const studentAuthRoutes = require('./routes/studentAuthRoutes');

const app = express();
const allowedOrigins = ['https://hostel-mess-client-lgtz4s2rb-animeshcode007s-projects.vercel.app'];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
};
// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/student', studentDataRoutes);
app.use('/api/auth/student', studentAuthRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));