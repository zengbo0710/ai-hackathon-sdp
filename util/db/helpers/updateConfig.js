module.exports = async (key, value) => {
  try {
    const knex = global.dbConnection()
    await knex('config').where('key', '=', key).update({ value })
    knex.destroy()
    global[key] = value
  } catch (error) { console.log(error) }
}
