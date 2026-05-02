const db = require('./config/db');
async function test() {
    try {
        const [teams] = await db.query("SELECT * FROM teams WHERE team_name = 'wizardss'");
        if(teams.length === 0) {
            console.log("Team wizardss not found");
            process.exit(0);
        }
        const team = teams[0];
        console.log("Team:", team);
        
        const [event] = await db.query("SELECT * FROM events WHERE id = ?", [team.event_id]);
        console.log("Event:", event[0]);
        
        const [reqs] = await db.query("SELECT er.skill_id, s.skill_name FROM event_requirements er JOIN skills s ON er.skill_id = s.id WHERE er.event_id = ?", [team.event_id]);
        console.log("Event Requirements:", reqs);
        
        const [members] = await db.query("SELECT student_id FROM team_members WHERE team_id = ?", [team.id]);
        console.log("Team Members:", members);
        
        const memberIds = members.map(m => m.student_id);
        if(memberIds.length > 0) {
            const [skills] = await db.query(`SELECT ss.skill_id, s.skill_name, ss.student_id FROM student_skills ss JOIN skills s ON ss.skill_id = s.id WHERE ss.student_id IN (?)`, [memberIds]);
            console.log("Member Skills:", skills);
        }
    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
test();
