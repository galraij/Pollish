const PollModel = require('../models/PollModel');

class PollController {
  static async createPoll(req, res, next) {
    try {
      const { title, question, createdBy, options } = req.body;

      if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });
      if (!question || !question.trim()) return res.status(400).json({ error: 'Question is required' });
      if (!createdBy || !createdBy.trim()) return res.status(400).json({ error: 'Username is required' });
      if (!Array.isArray(options) || options.length < 2) return res.status(400).json({ error: 'At least 2 options required' });
      if (options.length > 8) return res.status(400).json({ error: 'Maximum 8 options' });

      const validOptions = options.filter((o) => o && o.trim()).map((o) => o.trim());
      if (validOptions.length < 2) return res.status(400).json({ error: 'At least 2 non-empty options required' });

      const poll = await PollModel.create({
        title: title.trim(),
        question: question.trim(),
        createdBy: createdBy.trim(),
        options: validOptions,
      });

      res.status(201).json(poll);
    } catch (err) {
      next(err);
    }
  }

  static async getAllPolls(req, res, next) {
    try {
      res.json(await PollModel.findAll());
    } catch (err) {
      next(err);
    }
  }

  static async getPollById(req, res, next) {
    try {
      const poll = await PollModel.findById(req.params.id);
      if (!poll) return res.status(404).json({ error: 'Poll not found' });
      res.json(poll);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PollController;
