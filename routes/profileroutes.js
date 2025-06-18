const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) return next();
  res.redirect('/login');
}

// GET /profile - Show profile edit form (optional because you embed form in dashboard)
router.get('/profile', isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  db.query('SELECT * FROM student_details WHERE user_id = ?', [userId], (err, results) => {
    if (err) throw err;
    res.render('profile', { profile: results[0] || null });
  });
});

// POST /profile - Handle profile form submission
router.post('/profile', isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const { name, age, year_of_study, dob } = req.body;

  if (!name || !age || !year_of_study || !dob) {
    return res.status(400).send('All fields are required');
  }

  db.query('SELECT * FROM student_details WHERE user_id = ?', [userId], (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      // Update existing record
      db.query(
        'UPDATE student_details SET name = ?, age = ?, year_of_study = ?, dob = ? WHERE user_id = ?',
        [name, age, year_of_study, dob, userId],
        (err2) => {
          if (err2) throw err2;
          res.redirect('/dashboard');
        }
      );
    } else {
      // Insert new record
      db.query(
        'INSERT INTO student_details (user_id, name, age, year_of_study, dob) VALUES (?, ?, ?, ?, ?)',
        [userId, name, age, year_of_study, dob],
        (err3) => {
          if (err3) throw err3;
          res.redirect('/dashboard');
        }
      );
    }
  });
});

module.exports = router;
