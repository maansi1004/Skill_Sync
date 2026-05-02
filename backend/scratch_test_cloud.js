const db = require('./config/db');
async function test() {
    try {
        const [event] = await db.query("SELECT id, event_name FROM events WHERE event_name = 'Cloud Computing Olympiad'");
        if(event.length === 0) {
            console.log("Event not found");
            process.exit(0);
        }
        const eventId = event[0].id;
        console.log("Event ID:", eventId);
        
        const query = `
            SELECT st.id, st.name, COUNT(ss.skill_id) AS matched_skills
            FROM students st
            JOIN student_skills ss ON st.id = ss.student_id
            JOIN event_requirements er ON ss.skill_id = er.skill_id
            WHERE er.event_id = ? 
            AND st.id NOT IN (
                SELECT tm.student_id 
                FROM team_members tm 
                JOIN teams t ON tm.team_id = t.id 
                WHERE t.event_id = ?
            )
            GROUP BY st.id
            ORDER BY matched_skills DESC
            LIMIT 10;
        `;
        const [results] = await db.query(query, [eventId, eventId]);
        console.log("Results:", results);
        
        const [allStudentsWithSkills] = await db.query(`
            SELECT st.id, st.name, ss.skill_id, er.skill_id as req_skill
            FROM students st
            JOIN student_skills ss ON st.id = ss.student_id
            JOIN event_requirements er ON ss.skill_id = er.skill_id
            WHERE er.event_id = ?
        `, [eventId]);
        console.log("Students with matching skills:", allStudentsWithSkills);
    } catch(e) { console.error(e); } finally { process.exit(0); }
} test();
