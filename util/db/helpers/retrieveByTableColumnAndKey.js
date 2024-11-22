module.exports = async (table, column, value) => {
  try {
    const knex = global.dbConnection()
    const record = await knex(table).select().where(column, value)
    knex.destroy()
    return record[0]
  } catch (error) { console.log(error) }
}
