const db = require('../db/connection');
const { v4: uuidv4 } = require('uuid');

class VoteModel {
  static async create({ pollId, optionIds, voterId }) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      const existing = await client.query(
        'SELECT id FROM votes WHERE poll_id = $1 AND voter_id = $2 LIMIT 1',
        [pollId, voterId]
      );

      if (existing.rows.length > 0) {
        throw new Error('Already voted on this poll');
      }

      // Verify poll configuration
      const pollResult = await client.query(
        'SELECT is_multiple_choice, min_selections, max_selections FROM polls WHERE id = $1',
        [pollId]
      );

      if (pollResult.rows.length === 0) {
        throw new Error('Poll not found');
      }

      const poll = pollResult.rows[0];

      if (!poll.is_multiple_choice && optionIds.length > 1) {
        throw new Error('Multiple choice is not allowed for this poll');
      }

      if (poll.is_multiple_choice) {
        if (optionIds.length < poll.min_selections || optionIds.length > poll.max_selections) {
          throw new Error(`Please select between ${poll.min_selections} and ${poll.max_selections} options`);
        }
      }

      // Verify all options exist and belong to the poll
      const placeholders = optionIds.map((_, i) => `$${i + 2}`).join(',');
      const optionsResult = await client.query(
        `SELECT id FROM options WHERE poll_id = $1 AND id IN (${placeholders})`,
        [pollId, ...optionIds]
      );

      if (optionsResult.rows.length !== optionIds.length) {
        throw new Error('One or more invalid options for this poll');
      }

      const voteIds = [];
      for (const optionId of optionIds) {
        const voteId = uuidv4();
        await client.query(
          'INSERT INTO votes (id, poll_id, option_id, voter_id) VALUES ($1, $2, $3, $4)',
          [voteId, pollId, optionId, voterId]
        );
        voteIds.push(voteId);
      }

      await client.query('COMMIT');
      return { ids: voteIds };
    } catch (e) {
      await client.query('ROLLBACK');
      return { error: e.message };
    } finally {
      client.release();
    }
  }

  static async hasVoted(pollId, voterId) {
    const voteResult = await db.query(
      'SELECT option_id FROM votes WHERE poll_id = $1 AND voter_id = $2',
      [pollId, voterId]
    );
    if (voteResult.rows.length > 0) {
      return {
        hasVoted: true,
        votedOptionIds: voteResult.rows.map(r => r.option_id)
      };
    }
    return null;
  }
}

module.exports = VoteModel;
