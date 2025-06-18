const express = require('express');
const router = express.Router();

// Event data (Could be replaced with a database in production)
let events = [];

// Route to get all events
router.get('/events', (req, res) => {
    res.render('events', { events });
});

// Route to create a new event
router.post('/events', (req, res) => {
    const { title, date, description } = req.body;
    const newEvent = {
        id: events.length + 1, // Simple ID assignment
        title,
        date,
        description
    };
    events.push(newEvent);
    res.redirect('/events'); // Redirecting to event list
});

// Route to get a specific event by ID
router.get('/events/:id', (req, res) => {
    const eventId = parseInt(req.params.id, 10);
    const event = events.find(e => e.id === eventId);
    
    if (event) {
        res.render('eventDetail', { event });
    } else {
        res.status(404).send('Event not found');
    }
});

// Route to delete an event
router.delete('/events/:id', (req, res) => {
    const eventId = parseInt(req.params.id, 10);
    events = events.filter(e => e.id !== eventId);
    res.status(204).send(); // No content
});

module.exports = router;
