const axios = require('axios')

async function analyzeDrawing (drawing, user) {
  const apiKey = process.env.OPENAI_API_KEY
  const apiUrl = 'https://api.openai.com/v1/chat/completions'

  const imagePrompt = `You are an experienced art therapist and educator analyzing a drawing from a ${user.user.level} level student.
Please provide a detailed analysis in the following areas:

1. General Assessment: Evaluate the drawing considering the student's level ${user.user.level}, including technical skills, composition, and age-appropriate expectations.

2. Strengths and Weaknesses: Identify specific strong points and areas for improvement in the artwork.

3. Psychological Insights: Based on art therapy principles, provide observations about the student's emotional state and mental well-being as reflected in the drawing.

4. Additional Observations: Note any other significant elements, such as color usage, symbols, or recurring patterns.

Format your response in HTML with appropriate tags for structured presentation:
<div class="analysis-details">
  <section class="general">
    <h3>General Assessment</h3>
    [detailed analysis]
  </section>
  <section class="strengths-weaknesses">
    <h3>Strengths and Areas for Growth</h3>
    <div class="strengths">[strengths analysis]</div>
    <div class="weaknesses">[weaknesses analysis]</div>
  </section>
  <section class="psychological">
    <h3>Psychological Insights</h3>
    [psychological analysis]
  </section>
  <section class="additional">
    <h3>Additional Observations</h3>
    [additional analysis]
  </section>
</div>
`

  try {
    const response = await axios.post(apiUrl, {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: imagePrompt },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                // url: 'https://i.ibb.co/9vhgZPQ/face-drawing.jpg'
                url: drawing
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    }, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    const cleanedResponse = response.data.choices[0].message.content.trim().replace(/\n/g, ' ').replace(/"/g, '')
    return cleanedResponse
  } catch (error) {
    console.error('Error analyzing drawing:', error)
    throw new Error('Failed to analyze drawing')
  }
}

module.exports = analyzeDrawing
