const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const { protect } = require('../middleware/auth');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// POST /api/ai/generate-cover-note
router.post('/generate-cover-note', protect, async (req, res) => {
  try {
    const { taskTitle, taskDescription, skillsRequired, userSkills, userName } = req.body;

    if (!taskTitle || !taskDescription) {
      return res.status(400).json({ message: 'Task details are required' });
    }

    const prompt = `You are helping ${userName} write a cover note for a micro-internship task.

TASK DETAILS:
Title: ${taskTitle}
Description: ${taskDescription}
Skills Required: ${skillsRequired?.join(', ') || 'Not specified'}

APPLICANT DETAILS:
Name: ${userName}
Their Skills: ${userSkills?.length > 0 ? userSkills.join(', ') : 'Not specified yet'}

Write a short, genuine, enthusiastic cover note (3-4 sentences max) from ${userName}'s perspective. 
- Sound human and natural, not robotic
- Mention 1-2 specific things from the task description
- Keep it under 100 words
- Do NOT use generic phrases like "I am writing to express my interest"
- Start directly with something engaging
- Do not add subject line or greeting, just the note body`;

    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const generatedNote = message.content[0].text;
    res.json({ coverNote: generatedNote });

  } catch (error) {
    console.error('AI Error:', error.message);
    res.status(500).json({ message: 'AI generation failed', error: error.message });
  }
});

module.exports = router;