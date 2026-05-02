const db = require('../config/db');

exports.getAllStudents = async (req, res) => {
    try {
        const [students] = await db.query('SELECT id, username, name, email, department, year_of_study FROM students');
        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving students' });
    }
};

exports.getStudentById = async (req, res) => {
    const { id } = req.params;
    try {
        const [students] = await db.query('SELECT id, username, name, email, department, year_of_study FROM students WHERE id = ?', [id]);
        
        if (students.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        // Fetch their skills
        const [skills] = await db.query(`
            SELECT s.id, s.skill_name 
            FROM skills s
            JOIN student_skills ss ON s.id = ss.skill_id
            WHERE ss.student_id = ?
        `, [id]);
        
        const student = students[0];
        student.skills = skills;
        
        res.json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving student' });
    }
};

exports.getSkills = async (req, res) => {
    try {
        const [skills] = await db.query('SELECT * FROM skills ORDER BY skill_name ASC');
        res.json(skills);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateStudentSkills = async (req, res) => {
    const { studentId, skillIds } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        // Clear previous skills
        await connection.query('DELETE FROM student_skills WHERE student_id = ?', [studentId]);
        
        // Add new skills
        if (skillIds && skillIds.length > 0) {
            const values = skillIds.map(sid => [studentId, sid]);
            await connection.query('INSERT INTO student_skills (student_id, skill_id) VALUES ?', [values]);
        }
        
        await connection.commit();
        res.json({ message: 'Skills updated successfully' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server error updating skills' });
    } finally {
        connection.release();
    }
};
