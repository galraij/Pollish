const db = require('../db/connection');
const { v4: uuidv4 } = require('uuid');

class PollModel {
  static async create({ title, question, createdBy, options }) {
    const pollId = uuidv4();
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      await client.query(
        'INSERT INTO polls (id, title, question, created_by) VALUES ($1, $2, $3, $4)',
        [pollId, title, question, createdBy]
      );

      for (let i = 0; i < options.length; i++) {
        await client.query(
          'INSERT INTO options (id, poll_id, text, position) VALUES ($1, $2, $3, $4)',
          [uuidv4(), pollId, options[i], i]
        );
      }

      await client.query('COMMIT');
      return await this.findById(pollId);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  static async findById(id) {
    const pollResult = await db.query('SELECT * FROM polls WHERE id = $1', [id]);
    if (pollResult.rows.length === 0) return null;
    const poll = pollResult.rows[0];

    const optionsResult = await db.query(
      `SELECT o.id, o.text, o.position, COUNT(v.id)::INTEGER AS vote_count
       FROM options o
       LEFT JOIN votes v ON v.option_id = o.id
       WHERE o.poll_id = $1
       GROUP BY o.id
       ORDER BY o.position`,
      [id]
    );

    const options = optionsResult.rows;
    const totalVotes = options.reduce((sum, o) => sum + o.vote_count, 0);

    return { ...poll, options, totalVotes };
  }

  static async findAll() {
    const pollsResult = await db.query(
      `SELECT p.*, COUNT(DISTINCT v.id)::INTEGER AS "totalVotes"
       FROM polls p
       LEFT JOIN votes v ON v.poll_id = p.id
       GROUP BY p.id
       ORDER BY p.created_at DESC`
    );

    return pollsResult.rows;
  }
}

module.exports = PollModel;
