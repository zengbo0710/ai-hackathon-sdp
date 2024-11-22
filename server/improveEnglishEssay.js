const axios = require('axios')

async function gradeEnglishEssay (essay, user) {
  const apiKey = process.env.OPENAI_API_KEY
  const apiUrl = 'https://api.openai.com/v1/chat/completions'

  const levelPrompt = `You are an experienced English teacher helping a ${user.user.level} level student improve their essay while maintaining their current language proficiency level.

Please restructure the given essay in STAR format (Situation, Task, Action, Reflection) following these rules:
1. Situation: One paragraph describing the background
2. Task: One paragraph explaining what needed to be done
3. Action: Three paragraphs using two elements from FACT (Feeling, Action, Context, Thought)
4. Reflection: One concluding paragraph

Important guidelines:
- Maintain the student's original language level and writing style
- Do not upgrade vocabulary or grammar beyond their current ability
- It's acceptable to have one-sentence paragraphs if that matches the original
- Label each paragraph with its word count
- End with total word count and which two FACT elements were used

Format your response exactly as follows:
[SITUATION] |
[paragraph content]
(word count: X)

[TASK] |
[paragraph content]
(word count: X)

[ACTION 1] - FACT Element 1 and FACT Element 2 |
[paragraph content]
(word count: X)

[ACTION 2] - FACT Element 1 and FACT Element 2 |
[paragraph content]
(word count: X)

[ACTION 3] - FACT Element 1 and FACT Element 2 |
[paragraph content]
(word count: X)

[REFLECTION] |
[paragraph content]
(word count: X)

Total word count: X`

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
