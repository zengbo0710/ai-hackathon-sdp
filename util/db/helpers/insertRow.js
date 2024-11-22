module.exports = async (tableName, insertRows) => {
  try {
    const knex = global.dbConnection()
    const result = await knex(tableName).insert(insertRows)
    knex.destroy()
    return result[0]
  } catch (error) { console.log(error) }
}
