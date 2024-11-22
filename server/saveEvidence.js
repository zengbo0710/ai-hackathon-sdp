const db = require('../util/db')

async function saveEvidence (fullText, link, summary, userBehaviours, addToImpact) {
  try {
    // Save evidence to the evidence table
    const evidenceData = {
      original_text: fullText,
      summary,
      link: link || ''
    }
    const evidenceId = await db.insertRow('evidence', [evidenceData])
    const evidenceObject = { id: evidenceId, link: link || '', summary }
    const impactObject = { id: evidenceId, link: link || '', description: summary }

    // Update user behaviors with the new evidence
    for (const userBehaviour of userBehaviours) {
      const { userId, selectedBehaviours } = userBehaviour

      // Find the user in the global.users array
      const user = global.users.find(u => u.user.user_id.toString() === userId)
      if (user) {
        if (addToImpact) user.schema.impact.push(impactObject)
        for (const selected of selectedBehaviours) {
          const { behaviourId, subBehaviourId } = selected
          // Find the matching behavior and sub-behavior
          const behavior = user.schema.behaviour.find(b => b.behaviour_id.toString() === behaviourId.toString())
          if (behavior) {
            const subBehavior = behavior.sub_behaviour.find(sb => sb.sub_behaviour_id.toString() === subBehaviourId.toString())
            if (subBehavior) {
              subBehavior.evidences.push(evidenceObject)
            }
          }
        }
      }
    }

    for (let index = 0; index < global.users.length; index++) {
      await db.updateTableByIdAndObj('user_cycle', global.users[index].user.user_cycle_id, { details: JSON.stringify(global.users[index]) })
    }

    console.log('Evidence saved successfully:', evidenceId)
    return { success: true, message: 'Evidence saved successfully', evidenceId }
  } catch (error) {
    console.error('Error saving evidence:', error)
    return { success: false, message: 'Failed to save evidence' }
  }
}

module.exports = saveEvidence
