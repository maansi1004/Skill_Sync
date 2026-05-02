const db = require('../config/db');

// ==========================================
// 1. JOINS & BASIC FILTERS
// ==========================================
exports.getStudentProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT st.id, st.name, st.email, st.department, st.year_of_study, s.skill_name
            FROM students st
            LEFT JOIN student_skills ss ON st.id = ss.student_id
            LEFT JOIN skills s ON ss.skill_id = s.id
            WHERE st.id = ?;
        `;
        const [results] = await db.query(query, [id]);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.getTeamMembersProfiles = async (req, res) => {
    try {
        const { teamId } = req.params;
        const query = `
            SELECT t.team_name, st.name AS member_name, st.department, st.year_of_study
            FROM teams t
            JOIN team_members tm ON t.id = tm.team_id
            JOIN students st ON tm.student_id = st.id
            WHERE t.id = ?;
        `;
        const [results] = await db.query(query, [teamId]);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.getEventRequirements = async (req, res) => {
    try {
        const { eventId } = req.params;
        const query = `
            SELECT e.event_name, s.skill_name
            FROM events e
            JOIN event_requirements er ON e.id = er.event_id
            JOIN skills s ON er.skill_id = s.id
            WHERE e.id = ?;
        `;
        const [results] = await db.query(query, [eventId]);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.searchStudents = async (req, res) => {
    try {
        const { q } = req.query; 
        const query = `
            SELECT st.id, st.name, st.department, st.year_of_study, GROUP_CONCAT(sk.skill_name SEPARATOR ', ') AS skills
            FROM students st
            LEFT JOIN student_skills ss ON st.id = ss.student_id
            LEFT JOIN skills sk ON ss.skill_id = sk.id
            WHERE st.name LIKE ? OR st.department LIKE ?
            GROUP BY st.id;
        `;
        const [results] = await db.query(query, [`%${q}%`, `%${q}%`]);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.getPendingInvites = async (req, res) => {
    try {
        const { studentId } = req.params;
        const query = `
            SELECT tr.id, t.id AS team_id, t.team_name, s.name AS student_name, tr.createdAt, tr.type, tr.student_id, t.leader_id,
                   sl.name AS leader_name, e.event_name
            FROM team_requests tr
            JOIN teams t ON tr.team_id = t.id
            JOIN students s ON tr.student_id = s.id
            JOIN students sl ON t.leader_id = sl.id
            LEFT JOIN events e ON t.event_id = e.id
            WHERE tr.status = 'PENDING'
            AND tr.createdAt >= NOW() - INTERVAL 7 DAY;
        `;
        const [results] = await db.query(query);
        
        for (let r of results) {
            const [members] = await db.query('SELECT s.name FROM students s JOIN team_members tm ON s.id = tm.student_id WHERE tm.team_id = ? AND s.id != ?', [r.team_id, r.leader_id]);
            r.team_members = members.map(m => m.name);
        }
        
        let actionable = results.filter(r => 
            (r.type === 'INVITE' && r.student_id == studentId) ||
            (r.type === 'REQUEST' && r.leader_id == studentId)
        );
        let waiting = results.filter(r => 
            (r.type === 'REQUEST' && r.student_id == studentId) ||
            (r.type === 'INVITE' && r.leader_id == studentId)
        );

        res.json({ actionable, waiting });
    } catch (err) { res.status(500).send(err); }
};

exports.getUserSkills = async (req, res) => {
    try {
        const { studentId } = req.params;
        const query = `
            SELECT s.skill_name 
            FROM skills s
            JOIN student_skills ss ON s.id = ss.skill_id
            WHERE ss.student_id = ?;
        `;
        const [results] = await db.query(query, [studentId]);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.getEventLeaderboard = async (req, res) => {
    try {
        const { eventId } = req.params;
        const query = `
            SELECT t.team_name, COUNT(tm.student_id) AS members
            FROM teams t
            JOIN team_members tm ON t.id = tm.team_id
            WHERE t.event_id = ?
            GROUP BY t.id
            ORDER BY members DESC;
        `;
        const [results] = await db.query(query, [eventId]);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.getTeamStatus = async (req, res) => {
    try {
        const query = `SELECT id, team_name, status, event_id FROM teams;`;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

// ==========================================
// 2. SUBQUERIES & ADVANCED FILTERING
// ==========================================
exports.getStudentsWithoutTeam = async (req, res) => {
    try {
        const query = `
            SELECT st.id, st.name, st.department, st.year_of_study, GROUP_CONCAT(sk.skill_name SEPARATOR ', ') AS skills
            FROM students st
            LEFT JOIN student_skills ss ON st.id = ss.student_id
            LEFT JOIN skills sk ON ss.skill_id = sk.id
            WHERE st.id NOT IN (SELECT student_id FROM team_members)
            GROUP BY st.id;
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.getEventsWithoutTeams = async (req, res) => {
    try {
        const query = `
            SELECT id, event_name, event_date
            FROM events
            WHERE id NOT IN (SELECT event_id FROM teams WHERE event_id IS NOT NULL);
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.getEmptyTeams = async (req, res) => {
    try {
        const query = `
            SELECT t.id, t.team_name, s.name AS leader_name
            FROM teams t
            JOIN students s ON t.leader_id = s.id
            WHERE t.id NOT IN (
                SELECT team_id FROM team_members GROUP BY team_id HAVING COUNT(*) > 1
            );
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.getStudentsLackingSkills = async (req, res) => {
    try {
        const { eventId } = req.params;
        const query = `
            SELECT st.name, st.department
            FROM students st
            WHERE NOT EXISTS (
                SELECT 1 FROM event_requirements er
                WHERE er.event_id = ? AND er.skill_id NOT IN (
                    SELECT ss.skill_id FROM student_skills ss WHERE ss.student_id = st.id
                )
            );
            -- Wait, NOT EXISTS means they have ALL skills. The user wants LACKING skills.
        `;
        
        const queryCorrect = `
            SELECT DISTINCT st.name 
            FROM students st
            WHERE EXISTS (
                SELECT er.skill_id FROM event_requirements er WHERE er.event_id = ?
                AND NOT EXISTS (
                    SELECT 1 FROM student_skills ss WHERE ss.student_id = st.id AND ss.skill_id = er.skill_id
                )
            );
        `;
        const [results] = await db.query(queryCorrect, [eventId]);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.getMostRecentEvent = async (req, res) => {
    try {
        const query = `
            SELECT event_name, event_date 
            FROM events 
            WHERE event_date = (SELECT MAX(event_date) FROM events);
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.getStudentsManySkills = async (req, res) => {
    try {
        const query = `
            SELECT st.name, COUNT(ss.skill_id) AS skill_count
            FROM students st
            JOIN student_skills ss ON st.id = ss.student_id
            GROUP BY st.id
            HAVING COUNT(ss.skill_id) > 5
            ORDER BY skill_count DESC;
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

// ==========================================
// 3. AGGREGATIONS & GROUPING
// ==========================================
exports.getMostPopularSkills = async (req, res) => {
    try {
        const query = `
            SELECT s.skill_name, COUNT(ss.student_id) AS student_count
            FROM skills s
            JOIN student_skills ss ON s.id = ss.skill_id
            GROUP BY s.id
            ORDER BY student_count DESC
            LIMIT 10;
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.getAvgTeamSize = async (req, res) => {
    try {
        const query = `
            SELECT e.event_name, ROUND(AVG(member_count), 2) AS avg_team_size
            FROM events e
            JOIN (
                SELECT team_id, COUNT(student_id) as member_count
                FROM team_members
                GROUP BY team_id
            ) AS team_sizes
            JOIN teams t ON t.id = team_sizes.team_id AND t.event_id = e.id
            GROUP BY e.id;
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.getFullyStaffedTeams = async (req, res) => {
    try {
        const query = `
            SELECT t.team_name, COUNT(tm.student_id) AS member_count
            FROM teams t
            JOIN team_members tm ON t.id = tm.team_id
            GROUP BY t.id
            HAVING COUNT(tm.student_id) >= 4;
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.getCountPerDepartment = async (req, res) => {
    try {
        const query = `
            SELECT department, COUNT(*) AS student_count
            FROM students
            GROUP BY department
            ORDER BY student_count DESC;
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.getEventsByMonth = async (req, res) => {
    try {
        const query = `
            SELECT MONTHNAME(event_date) AS event_month, COUNT(*) AS total_events
            FROM events
            GROUP BY MONTH(event_date), MONTHNAME(event_date)
            ORDER BY MONTH(event_date);
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.getMostActiveDepartments = async (req, res) => {
    try {
        const query = `
            SELECT st.department, COUNT(tm.team_id) AS total_participations
            FROM students st
            JOIN team_members tm ON st.id = tm.student_id
            GROUP BY st.department
            ORDER BY total_participations DESC;
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.getSkillFrequency = async (req, res) => {
    try {
        const query = `
            SELECT s.skill_name, COUNT(er.event_id) AS requested_by_events
            FROM skills s
            JOIN event_requirements er ON s.id = er.skill_id
            GROUP BY s.id
            ORDER BY requested_by_events DESC
            LIMIT 10;
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.getAcceptanceRate = async (req, res) => {
    try {
        const query = `
            SELECT status, COUNT(*) AS total
            FROM team_requests
            GROUP BY status;
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.getUsersByYear = async (req, res) => {
    try {
        const query = `
            SELECT year_of_study, COUNT(*) AS total_users
            FROM students
            GROUP BY year_of_study
            ORDER BY year_of_study ASC;
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

// ==========================================
// 4. SMART ANALYTICS & COMPLEX LOGIC
// ==========================================
exports.suggestMissingRole = async (req, res) => {
    try {
        const { teamId } = req.params;
        const query = `
            SELECT s.skill_name AS missing_skill
            FROM event_requirements er
            JOIN teams t ON t.event_id = er.event_id
            JOIN skills s ON er.skill_id = s.id
            WHERE t.id = ? 
            AND er.skill_id NOT IN (
                SELECT ss.skill_id 
                FROM student_skills ss
                JOIN team_members tm ON ss.student_id = tm.student_id
                WHERE tm.team_id = ?
            );
        `;
        const [results] = await db.query(query, [teamId, teamId]);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.lastMinuteFastBuilder = async (req, res) => {
    try {
        const { eventId } = req.params;
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
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.getGlobalLeaderboard = async (req, res) => {
    try {
        const query = `
            SELECT st.name, st.department, COUNT(tm.team_id) AS total_participations,
            RANK() OVER (ORDER BY COUNT(tm.team_id) DESC) AS global_rank
            FROM students st
            LEFT JOIN team_members tm ON st.id = tm.student_id
            GROUP BY st.id
            ORDER BY global_rank ASC
            LIMIT 15;
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.getDeadlineAlerts = async (req, res) => {
    try {
        const query = `
            SELECT event_name, event_date,
            DATEDIFF(event_date, NOW()) AS days_remaining,
            CASE 
                WHEN DATEDIFF(event_date, NOW()) < 7 THEN 'URGENT'
                WHEN DATEDIFF(event_date, NOW()) BETWEEN 7 AND 30 THEN 'UPCOMING'
                ELSE 'FUTURE'
            END AS priority_level
            FROM events
            WHERE event_date > NOW()
            ORDER BY days_remaining ASC
            LIMIT 10;
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.getEventTimeline = async (req, res) => {
    try {
        const query = `
            SELECT event_name, 
                   DATE_FORMAT(event_date, '%W, %M %D %Y') AS formatted_date,
                   TIME_FORMAT(event_date, '%h:%i %p') AS formatted_time
            FROM events
            ORDER BY event_date ASC;
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.getFormattedDirectory = async (req, res) => {
    try {
        const query = `
            SELECT 
                UPPER(name) AS student_name_caps,
                CONCAT(name, ' (Year ', year_of_study, ', ', department, ')') AS detailed_profile,
                LENGTH(name) AS name_length
            FROM students
            ORDER BY department ASC, name ASC;
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.getSmartRecommendations = async (req, res) => {
    try {
        const { eventId } = req.params;
        const query = `
            SELECT s.name, COUNT(*) AS match_score
            FROM student_skills ss
            JOIN event_requirements er ON ss.skill_id = er.skill_id
            JOIN students s ON s.id = ss.student_id
            WHERE er.event_id = ?
            GROUP BY s.id
            ORDER BY match_score DESC
            LIMIT 5;
        `;
        const [results] = await db.query(query, [eventId]);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.getStudentSkillGap = async (req, res) => {
    try {
        const { eventId, studentId } = req.params;
        const query = `
            SELECT s.skill_name AS missing_skill
            FROM event_requirements er
            JOIN skills s ON er.skill_id = s.id
            WHERE er.event_id = ?
            AND er.skill_id NOT IN (
                SELECT skill_id FROM student_skills WHERE student_id = ?
            );
        `;
        const [results] = await db.query(query, [eventId, studentId]);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.getMatchPercentage = async (req, res) => {
    try {
        const { eventId } = req.params;
        const query = `
            SELECT s.id AS student_id, s.name, 
            ROUND((COUNT(ss.skill_id) * 100.0 / NULLIF((SELECT COUNT(*) FROM event_requirements WHERE event_id = ?), 0)), 0) AS match_percentage
            FROM student_skills ss
            JOIN event_requirements er ON ss.skill_id = er.skill_id
            JOIN students s ON s.id = ss.student_id
            WHERE er.event_id = ?
            GROUP BY s.id
            ORDER BY match_percentage DESC;
        `;
        const [results] = await db.query(query, [eventId, eventId]);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.getEventCountdown = async (req, res) => {
    try {
        const query = `
            SELECT event_name, TIMESTAMPDIFF(HOUR, NOW(), event_date) AS hours_left
            FROM events
            WHERE event_date > NOW();
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

// ==========================================
// 5. SUPREME ANALYTICS: TRIGGERS, UNIONS & LOGS
// ==========================================
exports.getAuditLogs = async (req, res) => {
    try {
        const query = `
            SELECT a.id, s.name, a.action, a.timestamp 
            FROM audit_logs a
            JOIN students s ON a.student_id = s.id
            ORDER BY a.timestamp DESC LIMIT 10;
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.getActiveNetworkers = async (req, res) => {
    try {
        const query = `
            SELECT s.name, 'Outgoing Request' AS activity_type 
            FROM team_requests tr JOIN students s ON tr.student_id = s.id WHERE tr.type='REQUEST' AND tr.status='PENDING'
            UNION ALL
            SELECT s.name, 'Incoming Invite' AS activity_type 
            FROM team_requests tr JOIN students s ON tr.student_id = s.id WHERE tr.type='INVITE' AND tr.status='PENDING'
            LIMIT 15;
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

exports.getDynamicDuos = async (req, res) => {
    try {
        const query = `
            SELECT s1.name AS student1, s2.name AS student2, COUNT(*) AS times_teamed_up
            FROM team_members a
            JOIN team_members b ON a.team_id = b.team_id AND a.student_id < b.student_id
            JOIN students s1 ON a.student_id = s1.id
            JOIN students s2 ON b.student_id = s2.id
            GROUP BY a.student_id, b.student_id
            HAVING times_teamed_up >= 1
            ORDER BY times_teamed_up DESC
            LIMIT 5;
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

// ==========================================
// NEW ANALYTICS (AS REQUESTED)
// ==========================================

// 1. Skill Demand Analytics
exports.getSkillDemand = async (req, res) => {
    try {
        const query = `
            SELECT s.skill_name, COUNT(*) AS demand
            FROM event_requirements er
            JOIN skills s ON s.id = er.skill_id
            GROUP BY s.skill_name
            ORDER BY demand DESC
            LIMIT 5;
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

// 1b. Bulk Event Requirements (Internal helper for discovery)
exports.getAllEventRequirements = async (req, res) => {
    try {
        const query = `
            SELECT er.event_id, s.skill_name
            FROM event_requirements er
            JOIN skills s ON er.skill_id = s.id;
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

// 2. Team Formation Trend
exports.getTeamTrends = async (req, res) => {
    try {
        // Fallback: If createdAt doesn't exist, we might need a workaround or use team_requests
        const query = `
            SELECT DATE(createdAt) as date, COUNT(*) as teams_created
            FROM team_requests
            WHERE type = 'INVITE' -- Using invites as a proxy for team creation events if teams table lacks timestamp
            GROUP BY DATE(createdAt)
            ORDER BY date;
        `;
        // Wait, let's try to query the teams table first, if it fails because of missing column, we use team_requests
        try {
            const [results] = await db.query(`SELECT DATE(created_at) as date, COUNT(*) as teams_created FROM teams GROUP BY DATE(created_at) ORDER BY date`);
            return res.json(results);
        } catch (e) {
            const [results] = await db.query(query);
            res.json(results);
        }
    } catch (err) { res.status(500).send(err); }
};

// 3. Top Collaborators
exports.getTopCollaborators = async (req, res) => {
    try {
        const query = `
            SELECT u.name, COUNT(tm.team_id) AS team_count
            FROM team_members tm
            JOIN students u ON u.id = tm.student_id
            GROUP BY u.id
            ORDER BY team_count DESC
            LIMIT 5;
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) { res.status(500).send(err); }
};

// ==========================================
// DASHBOARD SPECIFIC ANALYTICS
// ==========================================

exports.getDashboardRecommendations = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        // 1. Recommended Teams (Teams needing user skills)
        const teamsQuery = `
            SELECT t.id, t.team_name, e.event_name,
            ROUND(COUNT(er.skill_id) * 100.0 / (SELECT COUNT(*) FROM event_requirements WHERE event_id = t.event_id), 0) as match_percentage
            FROM teams t
            JOIN events e ON t.event_id = e.id
            JOIN event_requirements er ON e.id = er.event_id
            JOIN student_skills ss ON er.skill_id = ss.skill_id
            WHERE ss.student_id = ?
            AND t.id NOT IN (SELECT team_id FROM team_members WHERE student_id = ?)
            GROUP BY t.id
            ORDER BY match_percentage DESC
            LIMIT 2;
        `;
        const [teams] = await db.query(teamsQuery, [studentId, studentId]);

        // 2. Suggested Teammates (Students with complementary skills)
        const teammatesQuery = `
            SELECT s.id, s.name, 
            (SELECT COUNT(*) FROM student_skills ss2 WHERE ss2.student_id = s.id AND ss2.skill_id NOT IN (SELECT skill_id FROM student_skills WHERE student_id = ?)) as score
            FROM students s
            WHERE s.id != ?
            AND s.id NOT IN (SELECT student_id FROM team_members WHERE team_id IN (SELECT id FROM teams WHERE leader_id = ?))
            ORDER BY score DESC
            LIMIT 2;
        `;
        const [teammates] = await db.query(teammatesQuery, [studentId, studentId, studentId]);

        res.json({ teams, teammates });
    } catch (err) { res.status(500).send(err); }
};

exports.getDashboardActivity = async (req, res) => {
    try {
        const { studentId } = req.params;

        const [teamsJoined] = await db.query('SELECT COUNT(*) as count FROM team_members WHERE student_id = ?', [studentId]);
        const [invitesSent] = await db.query("SELECT COUNT(*) as count FROM team_requests WHERE type = 'INVITE' AND (student_id = ? OR team_id IN (SELECT id FROM teams WHERE leader_id = ?))", [studentId, studentId]);
        const [skillsCount] = await db.query('SELECT COUNT(*) as count FROM student_skills WHERE student_id = ?', [studentId]);
        
        // Profile strength calculation (simple heuristic)
        const totalSkillsPossible = 10; 
        const profileStrength = Math.min(Math.round((skillsCount[0].count / totalSkillsPossible) * 100), 100);

        res.json({
            teamsJoined: teamsJoined[0].count,
            invitesSent: invitesSent[0].count,
            profileStrength: profileStrength
        });
    } catch (err) { res.status(500).send(err); }
};
