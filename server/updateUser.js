const db = require('../util/db')
const _ = require('lodash')
async function getUsers (user) {
  try {
    const userCycle = await db.retrieveOne('user_cycle', { id: user.user.user_cycle_id })
    const userCycleDetails = JSON.parse(userCycle.details)
    userCycleDetails.schema.summary = user.schema.summary
    userCycleDetails.schema.impact = user.schema.impact
    _.forEach(userCycleDetails.schema.behaviour, behaviour => {
      _.forEach(behaviour.sub_behaviour, oldSubBehaviour => {
        const foundSubBehaviour = _.find(user.schema.behaviour, newBehaviour => {
          return oldSubBehaviour.sub_behaviour_id === newBehaviour.sub_behaviour_id
        })
        if (foundSubBehaviour) oldSubBehaviour.evidences = foundSubBehaviour.evidences
        else oldSubBehaviour.evidences = []
      })
    })
    console.log(JSON.stringify(userCycleDetails))
    await db.updateTableByIdAndObj('user_cycle', user.user.user_cycle_id, { details: JSON.stringify(userCycleDetails) })
    return { success: true, message: 'User updated successfully' }
  } catch (error) { console.error('Error fetching users:', error) }
}

module.exports = getUsers
