module.exports = async (tableName) => {
  try {
    const knex = global.dbConnection()
    const records = await knex(tableName).truncate()
    knex.destroy()
    return records
  } catch (error) { console.log(error) }
}
