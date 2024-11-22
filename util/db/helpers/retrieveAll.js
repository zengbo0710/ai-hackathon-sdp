module.exports = async (tableName) => {
  try {
    const knex = global.dbConnection()
    const records = await knex(tableName).select()
    knex.destroy()
    return records
  } catch (error) { console.log(error) }
}
