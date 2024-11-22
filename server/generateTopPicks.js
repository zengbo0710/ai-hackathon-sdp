const axios = require('axios')
const _ = require('lodash')

async function generateSummaryAndBehaviours (longText, userId) {
  const userSchema = _.find(global.users, user => user.user.user_id === Number(userId)).schema.behaviour
  const clonedUserSchema = _.cloneDeep(userSchema)
  clonedUserSchema.forEach(behaviour => {
    behaviour.sub_behaviour.forEach(subBehaviour => {
      subBehaviour.evidences = subBehaviour.evidences.length
    })
  })
  const apiKey = process.env.OPENAI_API_KEY
  const apiUrl = 'https://api.openai.com/v1/chat/completions'

  try {
    const response = await axios.post(apiUrl, {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that analyzes text and suggests relevant behaviours.' },
        {
          role: 'user',
          content: `Given the following text and the sample schema, please suggest the top 5 most relevant sub_behaviours along with their corresponding behaviour names based on the given text. 
          
Text: ${longText}

Sample Schema:
${JSON.stringify(clonedUserSchema, null, 2)}

Your response must follow this exact format with no deviations:
Top 5 Sub-behaviours:
1. sub_behaviour_name | subbehaviour_id | behaviour_name | behaviour_id | number_of_evidences
2. sub_behaviour_name | subbehaviour_id | behaviour_name | behaviour_id | number_of_evidences
3. sub_behaviour_name | subbehaviour_id | behaviour_name | behaviour_id | number_of_evidences
4. sub_behaviour_name | subbehaviour_id | behaviour_name | behaviour_id | number_of_evidences
5. sub_behaviour_name | subbehaviour_id | behaviour_name | behaviour_id | number_of_evidences
`
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

    const content = response.data.choices[0].message.content.trim()
    const [, behaviours] = content.split('Top 5 Sub-behaviours:')

    if (!behaviours) {
      throw new Error('No behaviours found in the API response')
    }
    console.log(content)
    const parsedBehaviours = behaviours.trim().split('\n')
      .map(b => {
      // Updated regex to match the new format
        const match = b.match(/(\d+)\.\s*(.*?)\s*\|\s*(\d+)\s*\|\s*(.*?)\s*\|\s*(\d+)\s*\|\s*(\d+)/)
        if (match) {
          const [, , subBehaviourName, subBehaviourId, behaviourName, behaviourId, evidences] = match
          return {
            subBehaviour: `[${subBehaviourName.trim()} | sub_behaviour_id: ${subBehaviourId}]`,
            behaviour: `${behaviourName.trim()} | behaviour_id: ${behaviourId}`,
            evidences: Number(evidences)
          }
        }
        return null
      })
      .filter(b => b !== null)
      .filter(b => !b.subBehaviour.includes('Explanation'))
    console.log(parsedBehaviours)
    return {
      behaviours: parsedBehaviours
    }
  } catch (error) {
    console.error('Error generating summary and behaviours:', error)
    throw new Error('Failed to generate summary and behaviours: ' + error.message)
  }
}

module.exports = generateSummaryAndBehaviours
