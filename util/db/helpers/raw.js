module.exports = async (query, bindings) => {
  try {
    const knex = global.dbConnection()
    const records = await knex.raw(query, bindings)
    knex.destroy()
    return records[0]
  } catch (error) { console.log(error) }
}
