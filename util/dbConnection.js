const SIGNALE = require('signale')
const chalk = require('chalk')

const connection = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  port: process.env.MYSQL_PORT || 3306
}

const knexConnection = () => {
  const knex = require('knex')({
    client: 'mysql',
    connection,
    pool: { min: 0, max: 10 }
  })
  return knex
}

SIGNALE.start('MySQL Connected Successfully on ' + chalk.cyan(`${connection.host}:${connection.port}/${connection.database}`))

module.exports = knexConnection
