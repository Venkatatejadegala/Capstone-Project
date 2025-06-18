const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../models/db');

// SIGNUP
router.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.render('signup', { error: 'Email already exists!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);

    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.render('signup', { error: 'Signup failed. Try again.' });
  }
});

// LOGIN
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.render('login', { error: 'Email not found' });

    const isMatch = await bcrypt.compare(password, rows[0].password);
    if (!isMatch) return res.render('login', { error: 'Incorrect password' });

    req.session.userId = rows[0].id;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Login failed. Try again.' });
  }
});

// DASHBOARD
router.get('/dashboard', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  try {
    const [userRows] = await db.query('SELECT * FROM users WHERE id = ?', [req.session.userId]);
    const user = userRows[0];

    const [detailsRows] = await db.query('SELECT * FROM student_details WHERE user_id = ?', [req.session.userId]);
    user.student_details = detailsRows[0] || null;

    const [registeredEvents] = await db.query(`
      SELECT e.id, e.name, e.description 
      FROM events e 
      JOIN registrations r ON e.id = r.event_id 
      WHERE r.user_id = ?`, [req.session.userId]);

    const [availableEvents] = await db.query(`
      SELECT * FROM events 
      WHERE id NOT IN (
        SELECT event_id FROM registrations WHERE user_id = ?
      )`, [req.session.userId]);

    res.render('dashboard', { user, registeredEvents, availableEvents });

  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong while loading dashboard.');
  }
});

// PROFILE UPDATE
router.post('/profile', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  const { name, age, dob, year_of_study, college, branch, year } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM student_details WHERE user_id = ?', [req.session.userId]);

    if (rows.length > 0) {
      // Update existing
      await db.query(`
        UPDATE student_details 
        SET name = ?, age = ?, dob = ?, year_of_study = ?, college = ?, branch = ?, year = ? 
        WHERE user_id = ?
      `, [name, age, dob, year_of_study, college, branch, year, req.session.userId]);
    } else {
      // Insert new
      await db.query(`
        INSERT INTO student_details (user_id, name, age, dob, year_of_study, college, branch, year) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [req.session.userId, name, age, dob, year_of_study, college, branch, year]);
    }

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Profile update failed.');
  }
});


// LOGOUT (POST)
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.redirect('/dashboard');
    }
    res.redirect('/login');
  });
});

module.exports = router;
