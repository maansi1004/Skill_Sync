const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

router.post('/', teamController.createTeam);
router.get('/', teamController.getAllTeams);
router.get('/detailed', teamController.getAllTeamsWithDetails);
router.get('/:id', teamController.getTeamById);
router.post('/requests', teamController.createTeamRequest);
router.put('/requests/:id/accept', teamController.acceptRequest);
router.put('/requests/:id/reject', teamController.rejectRequest);
router.get('/my-teams/:userId', teamController.getMyTeams);
router.delete('/:teamId/leave/:userId', teamController.leaveTeam);
router.get('/:teamId/requests', teamController.getTeamRequests);

module.exports = router;
