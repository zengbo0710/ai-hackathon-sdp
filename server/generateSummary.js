const axios = require('axios')

async function generateSummary (longText) {
  const apiKey = process.env.OPENAI_API_KEY
  const apiUrl = 'https://api.openai.com/v1/chat/completions'

  try {
    const response = await axios.post(apiUrl, {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that summarizes key achievements and impacts from a given text.' },
        { role: 'user', content: `Please based on the following text, extract the key things has been done, and more importantly the impacts in one single paragraph not more than 100 words, do not add any additional information that is not part of the provided data:\n\n${longText}` }
      ],
      max_tokens: 150,
      temperature: 0.7
    }, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    return response.data.choices[0].message.content.trim()
  } catch (error) {
    console.error('Error generating top picks:', error)
    throw new Error('Failed to generate top picks')
  }
}

module.exports = generateSummary
