const db = require('../config/db');

exports.getAllSkills = async (req, res) => {
    try {
        const [skills] = await db.query('SELECT * FROM skills ORDER BY skill_name ASC');
        res.json(skills);
    } catch(err) {
        res.status(500).json({ message: 'Error fetching skills' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Calling the stored procedure from the SQL schema
        await db.query('CALL login_user(?, ?, @status, @id)', [email, password]);

        // Retrieve the OUT parameters from the session variables
        const [results] = await db.query('SELECT @status AS status, @id AS id');
        const output = results[0];

        if (output.status === 'SUCCESS') {
            res.json({ message: 'Login successful', userId: output.id });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

exports.register = async (req, res) => {
    const { username, name, email, password, department, year_of_study, skills } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO students (username, name, email, password, department, year_of_study) VALUES (?, ?, ?, ?, ?, ?)',
            [username, name, email, password, department, year_of_study]
        );
        const studentId = result.insertId;

        // Insert Skills if provided
        if (skills && Array.isArray(skills) && skills.length > 0) {
            const values = skills.map(skillId => [studentId, skillId]);
            // Use bulk insert format: VALUES ? and nested array [[...]]
            await db.query('INSERT INTO student_skills (student_id, skill_id) VALUES ?', [values]);
        }

        res.status(201).json({ message: 'User registered successfully', userId: studentId });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Username or Email already exists' });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
};
