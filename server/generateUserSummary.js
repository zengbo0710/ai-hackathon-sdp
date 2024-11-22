const axios = require('axios')
const _ = require('lodash')

async function generateSummary (userId) {
  const user = _.find(global.users, user => user.user.user_id === Number(userId))
  const userSchema = user.schema
  const apiKey = process.env.OPENAI_API_KEY
  const apiUrl = 'https://api.openai.com/v1/chat/completions'

  try {
    const response = await axios.post(apiUrl, {
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
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
      ],
      max_tokens: 800,
      temperature: 0.7
    }, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    console.log(response.data.choices[0].message.content.trim())
    return response.data.choices[0].message.content.trim()
  } catch (error) {
    console.error('Error generating top picks:', error)
    throw new Error('Failed to generate top picks')
  }
}

module.exports = generateSummary
