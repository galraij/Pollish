const PollModel = require('../models/PollModel');

class PollController {
  static async createPoll(req, res, next) {
    try {
      const { question, options, language, isMultipleChoice, minSelections, maxSelections } = req.body;

      if (!question || !question.trim()) return res.status(400).json({ error: 'Question is required' });
      if (!Array.isArray(options) || options.length < 2) return res.status(400).json({ error: 'At least 2 options required' });
      if (options.length > 100) return res.status(400).json({ error: 'Maximum 100 options' });

      if (isMultipleChoice) {
        if (typeof minSelections !== 'number' || minSelections < 1) return res.status(400).json({ error: 'Invalid min selections' });
        if (typeof maxSelections !== 'number' || maxSelections < minSelections || maxSelections > options.length) return res.status(400).json({ error: 'Invalid max selections' });
      }

      const validOptions = options.filter((o) => o && o.trim()).map((o) => o.trim());
      if (validOptions.length < 2) return res.status(400).json({ error: 'At least 2 non-empty options required' });

      const poll = await PollModel.create({
        question: question.trim(),
        options: validOptions,
        language: language || 'en',
        isMultipleChoice: !!isMultipleChoice,
        minSelections: isMultipleChoice ? minSelections : 1,
        maxSelections: isMultipleChoice ? maxSelections : 1,
      });

      res.status(201).json(poll);
    } catch (err) {
      next(err);
    }
  }

  static async getAllPolls(req, res, next) {
    try {
      const { language } = req.query;
      res.json(await PollModel.findAll(language));
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
