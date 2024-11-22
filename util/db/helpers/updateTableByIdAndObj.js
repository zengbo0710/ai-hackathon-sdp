module.exports = async (table, id, updateObj) => {
  try {
    const knex = global.dbConnection()
    await knex(table)
      .where('id', '=', id)
      .update(updateObj)
    knex.destroy()
  } catch (error) { console.log(error) }
}
