const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const { protect } = require('../middleware/auth');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

router.post('/generate-cover-note', protect, async (req, res) => {
  try {
    const { taskTitle, taskDescription, skillsRequired, userSkills, userName } = req.body;

    if (!taskTitle || !taskDescription)
      return res.status(400).json({ message: 'Task details are required' });

    if (taskTitle.length > 200 || taskDescription.length > 3000)
      return res.status(400).json({ message: 'Input too long' });

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
      messages: [{ role: 'user', content: prompt }],
    });

    res.json({ coverNote: message.content[0].text });
  } catch (error) {
    console.error('AI Error:', error.message);
    res.status(500).json({ message: 'AI generation failed', error: error.message });
  }
});

router.post('/analyze-skill-gap', protect, async (req, res) => {
  try {
    const { taskTitle, skillsRequired, userSkills } = req.body;

    if (!skillsRequired?.length)
      return res.status(400).json({ message: 'Task skills are required' });

    const prompt = `You are a career advisor analyzing skill match for a micro-internship.

Task: ${taskTitle}
Skills Required: ${skillsRequired.join(', ')}
Applicant Skills: ${userSkills?.length > 0 ? userSkills.join(', ') : 'None listed'}

Respond ONLY with a JSON object in this exact format, nothing else:
{
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3", "skill4"],
  "matchPercentage": 75,
  "suggestion": "one sentence of honest, specific advice for this applicant"
}

Rules:
- matchPercentage is what percentage of required skills the applicant has
- Be smart about matching: treat React and React.js as the same
- suggestion must be specific to this task, not generic
- If applicant has no skills, matchPercentage is 0`;

    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content[0].text.trim();
    const parsed = JSON.parse(raw);

    res.json(parsed);
  } catch (error) {
    console.error('AI Error:', error.message);
    res.status(500).json({ message: 'Skill analysis failed', error: error.message });
  }
});

module.exports = router;