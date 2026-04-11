const express = require('express');
const router = express.Router();
const VoteController = require('../controllers/voteController');

router.post('/', VoteController.castVote);
router.get('/check/:pollId/:voterId', VoteController.checkVote);

module.exports = router;
