const db = require('../db/connection');
const { v4: uuidv4 } = require('uuid');

class PollModel {
  static create({ title, question, createdBy, options }) {
    const pollId = uuidv4();

    const insertPoll = db.prepare(
      'INSERT INTO polls (id, title, question, created_by) VALUES (?, ?, ?, ?)'
    );
    const insertOption = db.prepare(
      'INSERT INTO options (id, poll_id, text, position) VALUES (?, ?, ?, ?)'
    );

    const transaction = db.transaction(() => {
      insertPoll.run(pollId, title, question, createdBy);
      options.forEach((text, index) => {
        insertOption.run(uuidv4(), pollId, text, index);
      });
    });

    transaction();
    return this.findById(pollId);
  }

  static findById(id) {
    const poll = db.prepare('SELECT * FROM polls WHERE id = ?').get(id);
    if (!poll) return null;

    const options = db.prepare(
      `SELECT o.id, o.text, o.position, COUNT(v.id) AS vote_count
       FROM options o
       LEFT JOIN votes v ON v.option_id = o.id
       WHERE o.poll_id = ?
       GROUP BY o.id
       ORDER BY o.position`
    ).all(id);

    const totalVotes = options.reduce((sum, o) => sum + o.vote_count, 0);

    return { ...poll, options, totalVotes };
  }

  static findAll() {
    const polls = db.prepare(
      `SELECT p.*, COUNT(DISTINCT v.id) AS totalVotes
       FROM polls p
       LEFT JOIN votes v ON v.poll_id = p.id
       GROUP BY p.id
       ORDER BY p.created_at DESC`
    ).all();

    return polls;
  }
}

module.exports = PollModel;
