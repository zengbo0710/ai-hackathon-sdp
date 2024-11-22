module.exports = async (tableName, date) => {
  try {
    const knex = global.dbConnection()
    const records = await knex(tableName).select().where('date', '>', date)
    knex.destroy()
    return records
  } catch (error) { console.log(error) }
}
