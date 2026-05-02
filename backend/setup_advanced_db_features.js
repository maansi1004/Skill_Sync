const db = require('./config/db');

async function setup() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT,
                action VARCHAR(255),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Created audit_logs table');

        await db.query(`DROP TRIGGER IF EXISTS log_member_exit`);
        await db.query(`
            CREATE TRIGGER log_member_exit 
            AFTER DELETE ON team_members 
            FOR EACH ROW 
            INSERT INTO audit_logs (student_id, action) VALUES (OLD.student_id, CONCAT('Left Team ID: ', OLD.team_id))
        `);
        console.log('Created trigger log_member_exit');
        
    } catch(e) {
        console.error("Error setting up advanced features:", e);
    } finally {
        process.exit();
    }
}
setup();
