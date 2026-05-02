const db = require('./config/db');
async function test() {
    try {
        const teamId = 1;
        const [subqueryResult] = await db.query(`
            SELECT ss.skill_id 
            FROM student_skills ss
            JOIN team_members tm ON ss.student_id = tm.student_id
            WHERE tm.team_id = ?
        `, [teamId]);
        console.log("Subquery result:", subqueryResult);
    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
test();
