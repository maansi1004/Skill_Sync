const db = require('./config/db');

async function seedTrends() {
    try {
        console.log('Smoothing out trend data for better visualization...');
        // Let's update team_requests createdAt to be spread over the last 7 days
        const [requests] = await db.query('SELECT id FROM team_requests');
        for (let i = 0; i < requests.length; i++) {
            const daysAgo = Math.floor(i / (requests.length / 7));
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);
            const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
            await db.query('UPDATE team_requests SET createdAt = ? WHERE id = ?', [formattedDate, requests[i].id]);
        }
        console.log('Trend data seeded successfully.');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
seedTrends();
