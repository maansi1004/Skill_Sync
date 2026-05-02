const db = require('./config/db');
async function test() {
    try {
        const teamId = 109;
        const [team] = await db.query("SELECT * FROM teams WHERE id = ?", [teamId]);
        const eventId = team[0].event_id;
        
        const [missing] = await db.query(`
            SELECT s.skill_name AS missing_skill
            FROM event_requirements er
            JOIN skills s ON er.skill_id = s.id
            WHERE er.event_id = ? 
            AND er.skill_id NOT IN (
                SELECT ss.skill_id 
                FROM student_skills ss
                JOIN team_members tm ON ss.student_id = tm.student_id
                WHERE tm.team_id = ?
            )
        `, [eventId, teamId]);
        console.log("Missing skills:", missing);
    } catch(e) { console.error(e); } finally { process.exit(0); }
} test();
