const pool = require('./config/db');

async function dump() {
    try {
        let tables = ['teams', 'team_requests', 'team_members', 'events'];
        for (let t of tables) {
            const [rows] = await pool.query(`SHOW CREATE TABLE ${t}`);
            console.log(rows[0]['Create Table']);
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

dump();
