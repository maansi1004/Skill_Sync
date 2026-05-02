const db = require('./config/db');
async function test() {
    try {
        const [teams] = await db.query(`
            SELECT t.id, t.team_name, e.event_name, s.name as leader_name 
            FROM teams t 
            JOIN events e ON t.event_id = e.id 
            JOIN students s ON t.leader_id = s.id 
            WHERE s.name LIKE '%Neha%' AND e.event_name = 'EdTech Builder Bash'
        `);
        console.log(teams);
    } catch(e) { console.error(e); } finally { process.exit(0); }
} test();
