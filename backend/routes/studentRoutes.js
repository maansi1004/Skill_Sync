const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.get('/', studentController.getAllStudents);
router.get('/meta/skills', studentController.getSkills);
router.post('/skills/update', studentController.updateStudentSkills);
router.get('/:id', studentController.getStudentById);

module.exports = router;
