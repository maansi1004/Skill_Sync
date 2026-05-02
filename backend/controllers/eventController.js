const db = require('../config/db');

exports.getAllEvents = async (req, res) => {
    try {
        const [events] = await db.query('SELECT * FROM events');
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving events' });
    }
};

exports.getEventById = async (req, res) => {
    const { id } = req.params;
    try {
        const [events] = await db.query('SELECT * FROM events WHERE id = ?', [id]);
        
        if (events.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        // Fetch required skills for the event
        const [skills] = await db.query(`
            SELECT s.id, s.skill_name 
            FROM skills s
            JOIN event_requirements er ON s.id = er.skill_id
            WHERE er.event_id = ?
        `, [id]);
        
        const event = events[0];
        event.requirements = skills;
        
        res.json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving event' });
    }
};
