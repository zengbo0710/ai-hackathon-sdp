const axios = require('axios')
const _ = require('lodash')

async function generateSummary (userId, audioFile) {
  const user = _.find(global.users, user => user.user.user_id === Number(userId))
  const userSchema = user.schema
  const apiKey = process.env.OPENAI_API_KEY

  try {
    // First, transcribe the audio using Whisper API
    const formData = new FormData()
    formData.append('file', audioFile)
    formData.append('model', 'whisper-1')

    const transcriptionResponse = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    const transcription = transcriptionResponse.data.text

    // Then analyze the transcription using GPT-4
    const analysisResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert in speech and communication analysis. Your task is to:
            1. Analyze speech patterns and delivery
            2. Identify key communication strengths
            3. Evaluate clarity and effectiveness
            4. Assess speaking confidence and engagement
            5. Create concise, actionable feedback`
          },
          {
            role: 'user',
            content: `Generate a professional analysis for ${user.user.name} based on the following:

Speech Transcription:
${transcription}

Previous Impact Achievements:
${userSchema.impact.map(i => `• ${i.description}`).join('\n')}

Format the analysis in one paragraph (max 150 words) highlighting:
1. Communication effectiveness
2. Speaking style and clarity
3. Areas of strength and improvement
Use only information from the provided data.`
          }
        ],
        temperature: 0.4,
        max_tokens: 200
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )
    return analysisResponse.data.choices[0].message.content.trim()
  } catch (error) {
    console.error('Error analyzing speech:', error)
    throw new Error('Failed to analyze speech recording')
  }
}

module.exports = generateSummary
