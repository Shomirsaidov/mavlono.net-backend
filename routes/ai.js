const express = require('express');
const router = express.Router();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';

router.post('/send', async (req, res) => {
    const { query } = req.body;
    
    if (!query) {
        return res.status(400).json({ error: 'Query is required.' });
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: MODEL,
                max_tokens: 1000,
                system: 'answer only in tajik language. i will send you tajik poems and dont even try to conitnue them or to guess the author, the only thing you have to do is to tell how you understand each line of the poem and the idea of this specific provided piece in general',
                messages: [
                    { role: 'user', content: `Лутфан ин шеърро шарҳ диҳед:\n\n${query}` }
                ]
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error('Anthropic API error:', errData);
            throw new Error(errData.error?.message || 'Anthropic API returned an error.');
        }

        const data = await response.json();
        const aiResponse = data.content.filter(b => b.type === 'text').map(b => b.text).join('');

        res.json({ response: aiResponse });

    } catch (error) {
        console.error('AI Interpretation Error:', error);
        res.status(500).json({ error: 'Failed to interpret poem using Claude.' });
    }
});

module.exports = router;
