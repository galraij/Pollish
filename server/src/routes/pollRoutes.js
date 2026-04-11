const express = require('express');
const router = express.Router();
const PollController = require('../controllers/pollController');

router.post('/', PollController.createPoll);
router.get('/', PollController.getAllPolls);
router.get('/:id', PollController.getPollById);

module.exports = router;
