module.exports = async (table) => {
  try {
    const knex = global.dbConnection()
    await knex(table).del()
    knex.destroy()
  } catch (error) { console.log(error) }
}
