const axios = require('axios');
const _ = require('lodash');

async function generateSummaryAndBehaviours(longText, userId) {
    const userSchema = getUserSchema(userId);
    const clonedUserSchema = cloneUserSchema(userSchema);
    const apiKey = process.env.OPENAI_API_KEY;
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    try {
        const response = await fetchSummaryAndBehaviours(apiUrl, apiKey, longText, clonedUserSchema);
        return parseBehaviours(response.data.choices[0].message.content);
    } catch (error) {
        handleError(error);
    }
}

function getUserSchema(userId) {
    return _.find(global.users, user => user.user.user_id === Number(userId)).schema.behaviour;
}

function cloneUserSchema(userSchema) {
    const clonedSchema = _.cloneDeep(userSchema);
    clonedSchema.forEach(behaviour => {
        behaviour.sub_behaviour.forEach(subBehaviour => {
            subBehaviour.evidences = subBehaviour.evidences.length;
        });
    });
    return clonedSchema;
}

async function fetchSummaryAndBehaviours(apiUrl, apiKey, longText, clonedUserSchema) {
    return await axios.post(apiUrl, {
        model: 'gpt-4o',
        messages: [
            { role: 'system', content: 'You are a helpful assistant that analyzes text and suggests relevant behaviours.' },
            {
                role: 'user',
                content: `Given the following text and the sample schema, please suggest the top 5 most relevant sub_behaviours along with their corresponding behaviour names based on the given text.

IMPORTANT: Prioritize suggesting sub_behaviours that have 0 evidences (meaning they haven't been used before) unless there is a very strong match with a sub_behaviour that already has evidence. This helps in discovering new relevant behaviours.

Text: ${longText}

Sample Schema:
${JSON.stringify(clonedUserSchema, null, 2)}

Your response must follow this exact format with no deviations:
Top 5 Sub-behaviours:
1. sub_behaviour_name | subbehaviour_id | behaviour_name | behaviour_id | number_of_evidences
2. sub_behaviour_name | subbehaviour_id | behaviour_name | behaviour_id | number_of_evidences
3. sub_behaviour_name | subbehaviour_id | behaviour_name | behaviour_id | number_of_evidences
4. sub_behaviour_name | subbehaviour_id | behaviour_name | behaviour_id | number_of_evidences
5. sub_behaviour_name | subbehaviour_id | behaviour_name | behaviour_id | number_of_evidences`
            }
        ],
        max_tokens: 800,
        temperature: 0.7
    }, {
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    });
}

function parseBehaviours(content) {
    const [, behaviours] = content.split('Top 5 Sub-behaviours:');
    if (!behaviours) {
        throw new Error('No behaviours found in the API response');
    }

    return behaviours.trim().split('\n')
        .map(b => {
            const match = b.match(/(\d+)\.\s*(.*?)\s*\|\s*(\d+)\s*\|\s*(.*?)\s*\|\s*(\d+)\s*\|\s*(\d+)/);
            if (match) {
                const [, , subBehaviourName, subBehaviourId, behaviourName, behaviourId, evidences] = match;
                return {
                    subBehaviour: `[${subBehaviourName.trim()} | sub_behaviour_id: ${subBehaviourId}]`,
                    behaviour: `${behaviourName.trim()} | behaviour_id: ${behaviourId}`,
                    evidences: Number(evidences)
                };
            }
            return null;
        })
        .filter(b => b !== null)
        .filter(b => !b.subBehaviour.includes('Explanation'));
}

function handleError(error) {
    console.error('Error generating summary and behaviours:', error);
    throw new Error('Failed to generate summary and behaviours: ' + error.message);
}

module.exports = generateSummaryAndBehaviours;