const db = require('../util/db')

async function saveEvidence (userId, summary) {
  try {
    const user = global.users.find(u => u.user.user_id.toString() === userId)
    if (user) {
      user.schema.summary = summary
      await db.updateTableByIdAndObj('user_cycle', user.user.user_cycle_id, { details: JSON.stringify(user) })
    }

    console.log('Summary saved successfully:', userId)
    return { success: true, message: 'Summary saved successfully', userId }
  } catch (error) {
    console.error('Error saving evidence:', error)
    return { success: false, message: 'Failed to save evidence' }
  }
}

module.exports = saveEvidence
