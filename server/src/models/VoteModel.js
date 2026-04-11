const db = require('../db/connection');
const { v4: uuidv4 } = require('uuid');

class VoteModel {
  static async create({ pollId, optionId, voterId }) {
    const existing = await db.query(
      'SELECT id FROM votes WHERE poll_id = $1 AND voter_id = $2',
      [pollId, voterId]
    );

    if (existing.rows.length > 0) {
      return { error: 'Already voted on this poll' };
    }

    const option = await db.query(
      'SELECT id FROM options WHERE id = $1 AND poll_id = $2',
      [optionId, pollId]
    );

    if (option.rows.length === 0) {
      return { error: 'Invalid option for this poll' };
    }

    const voteId = uuidv4();
    await db.query(
      'INSERT INTO votes (id, poll_id, option_id, voter_id) VALUES ($1, $2, $3, $4)',
      [voteId, pollId, optionId, voterId]
    );

    return { id: voteId };
  }

  static async hasVoted(pollId, voterId) {
    const voteResult = await db.query(
      'SELECT id, option_id FROM votes WHERE poll_id = $1 AND voter_id = $2',
      [pollId, voterId]
    );
    return voteResult.rows.length > 0 ? voteResult.rows[0] : null;
  }
}

module.exports = VoteModel;
