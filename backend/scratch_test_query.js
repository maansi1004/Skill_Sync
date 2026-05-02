const db = require('./config/db');
async function test() {
    try {
        const teamId = 1; // Assuming team "wizardss" is one of the teams
        const eventId = 62;
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
    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
test();
