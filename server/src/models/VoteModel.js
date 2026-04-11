const db = require('../db/connection');
const { v4: uuidv4 } = require('uuid');

class VoteModel {
  static create({ pollId, optionId, voterId }) {
    // Check if this browser already voted
    const existing = db.prepare(
      'SELECT id FROM votes WHERE poll_id = ? AND voter_id = ?'
    ).get(pollId, voterId);

    if (existing) {
      return { error: 'Already voted on this poll' };
    }

    // Verify option belongs to poll
    const option = db.prepare(
      'SELECT id FROM options WHERE id = ? AND poll_id = ?'
    ).get(optionId, pollId);

    if (!option) {
      return { error: 'Invalid option for this poll' };
    }

    const voteId = uuidv4();
    db.prepare(
      'INSERT INTO votes (id, poll_id, option_id, voter_id) VALUES (?, ?, ?, ?)'
    ).run(voteId, pollId, optionId, voterId);

    return { id: voteId };
  }

  static hasVoted(pollId, voterId) {
    const vote = db.prepare(
      'SELECT id, option_id FROM votes WHERE poll_id = ? AND voter_id = ?'
    ).get(pollId, voterId);
    return vote || null;
  }
}

module.exports = VoteModel;
