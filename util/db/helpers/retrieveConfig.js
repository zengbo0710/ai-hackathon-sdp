module.exports = async (key) => {
  try {
    const knex = global.dbConnection()
    const record = await knex('config').select().where('key', key)
    knex.destroy()
    return Number(record[0].value)
  } catch (error) { console.log(error) }
}
