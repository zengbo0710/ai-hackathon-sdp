const axios = require('axios')

async function gradeEnglishEssay (essay, user, gradingResponse) {
  const apiKey = process.env.OPENAI_API_KEY
  const apiUrl = 'https://api.openai.com/v1/chat/completions'

  const evidenceSummaryPrompt = `As an English teacher analyzing a ${user.user.level} level student's essay, create an objective evidence summary including:

1. Essay Grading Marks 
2. Key Writing Strengths (3 points)
3. Areas for Improvement (3 points)
4. Language Level Assessment:
   Analyze vocabulary usage, grammar accuracy, and sentence structure complexity
5. Progress Indicators:
   Compare to expected ${user.user.level} level standards and provide specific examples from the essay
6. Recommendations for next learning focus

Please provide your analysis in clear paragraphs, organizing the information under these headings. Include specific examples from the essay to support your observations. please generate in a innerHTML format, with no header tags.`

  try {
    const evidenceResponse = await axios.post(apiUrl, {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: evidenceSummaryPrompt },
        { role: 'user', content: `Essay: ${essay}\n\nGrading Response: ${gradingResponse}` }
      ],
      max_tokens: 1000,
      temperature: 0.7
    }, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    console.log(evidenceResponse.data.choices[0].message.content.trim().replace(/```html|```/g, ''))
    const response = evidenceResponse.data.choices[0].message.content.trim().replace(/```html|```/g, '')
    return response
  } catch (error) {
    console.error('Error processing essay:', error)
    throw new Error('Failed to process essay')
  }
}

module.exports = gradeEnglishEssay
