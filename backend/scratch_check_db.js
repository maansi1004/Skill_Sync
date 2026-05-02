const db = require('./config/db');

async function checkData() {
    try {
        const [skills] = await db.query('SELECT s.skill_name, COUNT(*) AS demand FROM event_requirements er JOIN skills s ON s.id = er.skill_id GROUP BY s.skill_name ORDER BY demand DESC LIMIT 5');
        console.log('Skill Demand Data:', skills);

        const [teams] = await db.query('SELECT COUNT(*) as count FROM teams');
        console.log('Total Teams:', teams[0].count);

        const [collabs] = await db.query('SELECT u.name, COUNT(tm.team_id) AS team_count FROM team_members tm JOIN students u ON u.id = tm.student_id GROUP BY u.id ORDER BY team_count DESC LIMIT 5');
        console.log('Top Collaborators:', collabs);

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
checkData();
