const db = require('../config/db');

exports.createTeam = async (req, res) => {
    const { team_name, event_id, leader_id } = req.body;
    if (!team_name || !event_id || !leader_id) return res.status(400).json({message:'Missing fields'});
    try {
        const [ledTeams] = await db.query('SELECT COUNT(*) as count FROM teams WHERE leader_id = ?', [leader_id]);
        if (ledTeams[0].count >= 3) {
            return res.status(400).json({ message: 'You have reached the maximum limit of creating 3 teams.' });
        }
        
        if (event_id) {
            const [existingEventTeams] = await db.query(`
                SELECT t.id FROM teams t
                JOIN team_members tm ON t.id = tm.team_id
                WHERE tm.student_id = ? AND t.event_id = ?
            `, [leader_id, event_id]);
            
            if (existingEventTeams.length > 0) {
                return res.status(400).json({ message: 'You are already in a team for this event.' });
            }
        }
        
        const [result] = await db.execute(
            'INSERT INTO teams (team_name, event_id, leader_id, status) VALUES (?, ?, ?, ?)',
            [team_name, event_id, leader_id, 'Recruiting']
        );
        const teamId = result.insertId;
        await db.execute('INSERT INTO team_members (team_id, student_id) VALUES (?, ?)', [teamId, leader_id]);
        res.status(201).json({ message: 'Team created', id: teamId });
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') return res.status(400).json({message: 'Team name already exists'});
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllTeams = async (req, res) => {
    try {
        const [teams] = await db.query(`
            SELECT t.id, t.team_name, t.status, t.event_id, e.event_name, t.leader_id, s.name as leader_name
            FROM teams t
            LEFT JOIN events e ON t.event_id = e.id
            JOIN students s ON t.leader_id = s.id
        `);
        res.json(teams);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving teams' });
    }
};

exports.getTeamById = async (req, res) => {
    const { id } = req.params;
    try {
        const [teams] = await db.query(`
            SELECT t.id, t.team_name, t.status, t.event_id, e.event_name, t.leader_id, s.name as leader_name
            FROM teams t
            LEFT JOIN events e ON t.event_id = e.id
            JOIN students s ON t.leader_id = s.id
            WHERE t.id = ?
        `, [id]);
        
        if (teams.length === 0) {
            return res.status(404).json({ message: 'Team not found' });
        }
        
        // Fetch team members
        const [members] = await db.query(`
            SELECT s.id, s.name, s.username, s.department
            FROM students s
            JOIN team_members tm ON s.id = tm.student_id
            WHERE tm.team_id = ?
        `, [id]);
        
        const team = teams[0];
        team.members = members;
        
        res.json(team);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving team' });
    }
};

exports.createTeamRequest = async (req, res) => {
    const { team_id, student_id, type } = req.body;
    // type should be 'REQUEST' or 'INVITE'
    try {
        if (type === 'REQUEST') {
            const [pendingCount] = await db.query('SELECT COUNT(*) as count FROM team_requests WHERE student_id = ? AND type = "REQUEST" AND status = "PENDING"', [student_id]);
            if (pendingCount[0].count >= 5) {
                return res.status(400).json({ message: 'Limit reached: You can only have up to 5 pending join requests at a time.' });
            }
        }
        
        const [existingMember] = await db.query('SELECT * FROM team_members WHERE team_id = ? AND student_id = ?', [team_id, student_id]);
        if (existingMember.length > 0) {
            return res.status(400).json({ message: 'User is already a member of this team.' });
        }

        const [teamData] = await db.query('SELECT event_id FROM teams WHERE id = ?', [team_id]);
        if (teamData.length > 0 && teamData[0].event_id) {
            const e_id = teamData[0].event_id;
            const [userEventTeams] = await db.query(`
                SELECT t.id FROM teams t
                JOIN team_members tm ON t.id = tm.team_id
                WHERE tm.student_id = ? AND t.event_id = ?
            `, [student_id, e_id]);
            
            if (userEventTeams.length > 0) {
                return res.status(400).json({ message: 'User is already in a team for this event.' });
            }
        }
        
        const [result] = await db.execute(
            'INSERT INTO team_requests (team_id, student_id, type) VALUES (?, ?, ?)',
            [team_id, student_id, type]
        );
        res.status(201).json({ message: 'Request created successfully', requestId: result.insertId });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Request already exists for this team and student' });
        }
        res.status(500).json({ message: 'Server error creating request' });
    }
};

exports.acceptRequest = async (req, res) => {
    const { id } = req.params;
    try {
        const [requests] = await db.query('SELECT * FROM team_requests WHERE id = ?', [id]);
        if (requests.length === 0) return res.status(404).json({ message: 'Request not found' });
        const request = requests[0];
        
        if (request.status !== 'PENDING') return res.status(400).json({ message: 'Request already processed' });
        
        const [teams] = await db.query('SELECT * FROM teams WHERE id = ?', [request.team_id]);
        const team = teams[0];
        
        const [members] = await db.query('SELECT COUNT(*) as count FROM team_members WHERE team_id = ?', [team.id]);
        const memberCount = members[0].count;
        
        if (memberCount >= 4) {
            await db.query('UPDATE teams SET status = "Closed" WHERE id = ?', [team.id]);
            return res.status(400).json({ message: 'Team is already full (max 4 members)' });
        }
        
        if (team.event_id) {
            const [userTeams] = await db.query(`
                SELECT t.id FROM teams t
                JOIN team_members tm ON t.id = tm.team_id
                WHERE tm.student_id = ? AND t.event_id = ?
            `, [request.student_id, team.event_id]);
            if (userTeams.length > 0) return res.status(400).json({ message: 'User is already in a team for this event' });
        }
        
        await db.query('UPDATE team_requests SET status = "ACCEPTED" WHERE id = ?', [id]);
        await db.query('INSERT IGNORE INTO team_members (team_id, student_id) VALUES (?, ?)', [team.id, request.student_id]);
        
        if (memberCount + 1 >= 4) {
            await db.query('UPDATE teams SET status = "Closed" WHERE id = ?', [team.id]);
        } else {
            await db.query('UPDATE teams SET status = "Active" WHERE id = ?', [team.id]);
        }
        
        res.json({ message: 'Accepted successfully' });
    } catch (e) {
        console.error(e); res.status(500).json({ message: 'Server error' });
    }
};

exports.rejectRequest = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE team_requests SET status = "REJECTED" WHERE id = ?', [id]);
        res.json({ message: 'Request rejected' });
    } catch (e) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMyTeams = async (req, res) => {
    const { userId } = req.params;
    try {
        const [teams] = await db.query(`
            SELECT t.id, t.team_name, t.leader_id, t.event_id, e.event_name, s.name as leader_name,
                   (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count
            FROM teams t
            JOIN team_members tm ON t.id = tm.team_id
            LEFT JOIN events e ON t.event_id = e.id
            JOIN students s ON t.leader_id = s.id
            WHERE tm.student_id = ?
        `, [userId]);
        
        for (let team of teams) {
            const [members] = await db.query(`
                SELECT s.name, s.id as student_id, s.username
                FROM students s
                JOIN team_members tm ON s.id = tm.student_id
                WHERE tm.team_id = ? AND s.id != ?
            `, [team.id, team.leader_id]);
            team.members = members;
            if (team.event_id) {
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
                `, [team.event_id, team.id]);
                team.missing_skills = missing.map(m => m.missing_skill);
            } else {
                team.missing_skills = [];
            }
        }
        res.json(teams);
    } catch (e) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.leaveTeam = async (req, res) => {
    const { teamId, userId } = req.params;
    try {
        const [teams] = await db.query('SELECT leader_id FROM teams WHERE id = ?', [teamId]);
        if (teams.length === 0) return res.status(404).json({ message: 'Team not found' });
        
        if (teams[0].leader_id == userId) {
            // If leader leaves, delete the team. Cascades will remove members/requests
            await db.query('DELETE FROM teams WHERE id = ?', [teamId]);
            return res.json({ message: 'Team disbanded successfully.' });
        } else {
            await db.query('DELETE FROM team_members WHERE team_id = ? AND student_id = ?', [teamId, userId]);
            return res.json({ message: 'Left team successfully.' });
        }
    } catch (e) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getTeamRequests = async (req, res) => {
    const { teamId } = req.params;
    try {
        const [requests] = await db.query(`
            SELECT tr.id, s.name as student_name, tr.createdAt
            FROM team_requests tr
            JOIN students s ON tr.student_id = s.id
            WHERE tr.team_id = ? AND tr.type = 'REQUEST' AND tr.status = 'PENDING'
        `, [teamId]);
        res.json(requests);
    } catch (e) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllTeamsWithDetails = async (req, res) => {
    try {
        const [teams] = await db.query(`
            SELECT t.id, t.team_name, t.status, t.event_id, e.event_name, t.leader_id, s.name as leader_name, s.username as leader_username
            FROM teams t
            LEFT JOIN events e ON t.event_id = e.id
            JOIN students s ON t.leader_id = s.id
        `);
        for (let team of teams) {
            const [members] = await db.query('SELECT s.name, s.id, s.username FROM students s JOIN team_members tm ON s.id = tm.student_id WHERE tm.team_id = ? AND s.id != ?', [team.id, team.leader_id]);
            team.members = members;
            if (team.event_id) {
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
                `, [team.event_id, team.id]);
                team.missing_skills = missing.map(m => m.missing_skill);
            } else {
                team.missing_skills = [];
            }
        }
        res.json(teams);
    } catch (e) {
        res.status(500).json({ message: 'Server error' });
    }
};
