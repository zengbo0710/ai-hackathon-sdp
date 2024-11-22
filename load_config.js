const path = require('path')
const dotenv = require('dotenv-safe')
dotenv.config({
  path: path.join(__dirname, './.env'),
  sample: path.join(__dirname, './.env.example')
})

require('./util/global')
