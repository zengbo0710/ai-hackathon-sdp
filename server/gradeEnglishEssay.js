const axios = require('axios')

async function gradeEnglishEssay (essay, user) {
  const apiKey = process.env.OPENAI_API_KEY
  const apiUrl = 'https://api.openai.com/v1/chat/completions'

  const levelPrompt = `You are an experienced and strict English teacher grading a ${user.user.level} student's essay. 
Grade this essay out of 100 marks, with the following breakdown:
- Content and Ideas (20 marks): Evaluate the clarity, relevance, and development of ideas
- Organization (20 marks): Assess structure, flow, and coherence
- Language Use (20 marks): Judge vocabulary choice and expression
- Grammar and Mechanics (20 marks): Check spelling, punctuation, and grammar
- Creativity and Style (20 marks): Evaluate voice and creative expression

Be strict in grading. Only give high marks for truly exceptional writing. Poor writing may receive as low as 30 total marks. 
Consider the student's level (${user.user.level}) when grading, the same essay should be marked differently for a lower grade and a upper grade student.

Format your response exactly as follows (including the pipe symbols):
Content and Ideas|[score]/20|[well elaborated explanation]
Organization|[score]/20|[well elaborated explanation]
Language Use|[score]/20|[well elaborated explanation]
Grammar and Mechanics|[score]/20|[well elaborated explanation]
Creativity and Style|[score]/20|[well elaborated explanation]
Total|[total]/100|Overall assessment`

  try {
    const response = await axios.post(apiUrl, {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: levelPrompt },
        { role: 'user', content: essay }
      ],
      max_tokens: 500,
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
    console.error('Error grading essay:', error)
    throw new Error('Failed to grade essay')
  }
}

module.exports = gradeEnglishEssay
