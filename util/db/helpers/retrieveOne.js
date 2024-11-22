module.exports = async (tableName, whereClause = null) => {
  try {
    const knex = global.dbConnection()
    let query = knex(tableName)

    if (whereClause) {
      query = query.where(whereClause)
    }

    const records = await query.select()
    knex.destroy()
    return records[0]
  } catch (error) {
    console.error('Error in retrieveOne:', error)
    throw error
  }
}
