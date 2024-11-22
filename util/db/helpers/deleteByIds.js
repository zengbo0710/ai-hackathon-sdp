module.exports = async (table, deleteIdArray) => {
  try {
    const knex = global.dbConnection()
    await knex(table).whereIn('id', deleteIdArray).del()
    knex.destroy()
  } catch (error) { console.log(error) }
}
