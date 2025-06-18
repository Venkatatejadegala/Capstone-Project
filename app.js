const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();

// Import routes
const authRoutes = require('./routes/auth');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use sessions
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

// Attach routes
app.use('/', authRoutes); // ✅ This connects /login, /signup

// Start the server
app.listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
});
