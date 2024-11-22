const axios = require('axios');
const _ = require('lodash');

async function generateSummary(userId) {
    const user = getUserById(userId);
    const userSchema = user.schema;
    const apiKey = process.env.OPENAI_API_KEY;
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    const messages = createMessages(user, userSchema);

    try {
        const response = await fetchSummary(apiUrl, apiKey, messages);
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        handleError(error);
    }
}

function getUserById(userId) {
    return _.find(global.users, user => user.user.user_id === Number(userId));
}

function createMessages(user, userSchema) {
    return [
        {
            role: 'user',
            content: 'You are an educational analyst specialized in student development. Analyze provided data to create comprehensive student assessments with actionable insights.'
        },
        {
            role: 'user',
            content: `Please analyze the following data for student ${user.user.name} and provide in innerHTML format with no header tags but clear paragraphs and sub-titles:
1. A comprehensive summary of their overall characteristics (max 100 words)
2. Key strengths with specific recommendations for further development and relevant learning resources
3. Areas for improvement with targeted action items and suggested training materials

Base your analysis strictly on the following evidence:

Impact Achievements:
${userSchema.impact.map(i => i.description).join('\n')}

Behavioral Evidence:
${userSchema.behaviour.flatMap(b => b.sub_behaviour.flatMap(sb => sb.evidences.map(e => e.summary))).join('\n')}`
        }
    ];
}

async function fetchSummary(apiUrl, apiKey, messages) {
    return await axios.post(apiUrl, {
        model: 'o1-preview',
        messages: messages,
        max_tokens: 800,
        temperature: 0.7
    }, {
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    });
}

function handleError(error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate summary');
}

module.exports = generateSummary;