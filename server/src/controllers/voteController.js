const VoteModel = require('../models/VoteModel');
const PollModel = require('../models/PollModel');

class VoteController {
  static async castVote(req, res, next) {
    try {
      const { pollId, optionId, voterId } = req.body;

      if (!pollId) return res.status(400).json({ error: 'Poll ID required' });
      if (!optionId) return res.status(400).json({ error: 'Option ID required' });
      if (!voterId) return res.status(400).json({ error: 'Voter ID required' });

      const poll = await PollModel.findById(pollId);
      if (!poll) return res.status(404).json({ error: 'Poll not found' });

      const result = await VoteModel.create({ pollId, optionId, voterId });
      if (result.error) return res.status(409).json({ error: result.error });

      // Return updated poll with new vote counts
      res.status(201).json(await PollModel.findById(pollId));
    } catch (err) {
      next(err);
    }
  }

  static async checkVote(req, res, next) {
    try {
      const { pollId, voterId } = req.params;
      const vote = await VoteModel.hasVoted(pollId, voterId);
      res.json({ hasVoted: !!vote, votedOptionId: vote?.option_id || null });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = VoteController;
