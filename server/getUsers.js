const db = require('../util/db');
const _ = require('lodash');
const moment = require('moment');

async function getUsers() {
  try {
    const behaviours = await db.retrieveAll('schema_type');
    const subbehaviours = await db.retrieveAll('schema_subtype');
    const rawUsers = await fetchRawUsers();
    const users = mapUsers(rawUsers);

    const userCycles = await db.raw(`SELECT * FROM user_cycle WHERE cycle_id = ${global.current_cycle_id}`);
    await processUsers(users, userCycles, behaviours, subbehaviours);

    global.users = users;
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

async function fetchRawUsers() {
  return await db.raw(`
    SELECT u1.*, l1.name AS level_name, r1.name AS role_name
    FROM user u1
    LEFT JOIN level l1 ON l1.id = u1.level_id
    LEFT JOIN role r1 ON r1.id = u1.role_id
    ORDER BY u1.role_id ASC, SUBSTRING_INDEX(u1.name, ' ', -1) ASC, u1.name ASC
  `);
}

function mapUsers(rawUsers) {
  return _.map(rawUsers, user => ({
    user: {
      name: user.name,
      role: user.role_name,
      level: user.level_name,
      user_id: user.id,
      level_id: user.level_id,
      role_id: user.role_id
    }
  }));
}

async function processUsers(users, userCycles, behaviours, subbehaviours) {
  for (let index = 0; index < users.length; index++) {
    const user = users[index];
    const found = _.find(userCycles, userCycle => userCycle.user_id === user.user.user_id);

    if (found) {
      user.user.user_cycle_id = found.id;
      user.schema = JSON.parse(found.details).schema;
      user.additional_info = JSON.parse(found.details).additional_info;
    } else {
      user.schema = await generateNewCycleUserDetails(user.user, behaviours, subbehaviours);
      const userCycleId = await db.insertRow('user_cycle', [{
        cycle_id: global.current_cycle_id,
        user_id: user.user.user_id,
        details: JSON.stringify(user)
      }]);
      user.user.user_cycle_id = userCycleId;
      user.additional_info = { progress_velocity: [] };
    }
    await updateUserProgressVelocity(user);
  }
}

async function updateUserProgressVelocity(user) {
  const currentCycle = await db.retrieveOne('cycle', { id: global.current_cycle_id });
  const startDate = moment(currentCycle.start_date).utcOffset('+0800');
  const currentDate = moment().utcOffset('+0800');
  const weeksDiff = currentDate.diff(startDate, 'weeks') + 1;

  if (!user.additional_info.progress_velocity) {
    user.additional_info.progress_velocity = [];
  }

  const existingDataLength = user.additional_info.progress_velocity.length;
  const lastValue = existingDataLength > 0 ? user.additional_info.progress_velocity[existingDataLength - 1] : 0;

  for (let i = existingDataLength; i < weeksDiff - 1; i++) {
    user.additional_info.progress_velocity.push(lastValue);
  }

  const currentWeekData = calculateProgressScore(user.schema);

  if (user.additional_info.progress_velocity.length < weeksDiff) {
    user.additional_info.progress_velocity.push(currentWeekData);
  } else {
    user.additional_info.progress_velocity[weeksDiff - 1] = currentWeekData;
  }

  await db.updateTableByIdAndObj('user_cycle', user.user.user_cycle_id, { details: JSON.stringify(user) });
}

function calculateProgressScore(schema) {
  let score = 0;
  for (const behaviour of schema.behaviour) {
    const completedSubbehaviours = behaviour.sub_behaviour.filter(sub => sub.evidences.length >= 1);
    if (completedSubbehaviours.length >= 2) {
      score += 0.2;
    } else if (completedSubbehaviours.length === 1) {
      score += 0.1;
    }
  }
  return Number(score.toFixed(1));
}

async function generateNewCycleUserDetails(user, behaviours, subbehaviours) {
  const schema = {
    impact: [],
    summary: ''
  };
  schema.behaviour = behaviours.map(behaviour => {
    const allSubbehaviours = _.chain(subbehaviours)
        .filter(subbehaviour => subbehaviour.role_id === user.role_id && subbehaviour.level_id === user.level_id && subbehaviour.schema_type_id === behaviour.id)
        .map(subbehaviour => ({
          description: subbehaviour.description,
          sub_behaviour_id: subbehaviour.id,
          evidences: []
        })).value();
    return {
      name: behaviour.name,
      description: behaviour.description,
      behaviour_id: behaviour.id,
      sub_behaviour: allSubbehaviours
    };
  });

  return schema;
}

module.exports = getUsers;