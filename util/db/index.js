module.exports = {
  // create
  insertRow: require('./helpers/insertRow'),
  // retrieve
  retrieveOne: require('./helpers/retrieveOne'),
  retrieveAll: require('./helpers/retrieveAll'),
  retrieveByTableColumnAndKey: require('./helpers/retrieveByTableColumnAndKey'),
  retrieveAllWithDateLimit: require('./helpers/retrieveAllWithDateLimit'),
  // update
  updateTableByIdAndObj: require('./helpers/updateTableByIdAndObj'),
  // delete
  deleteByIds: require('./helpers/deleteByIds'),
  deleteAll: require('./helpers/deleteAll'),
  truncate: require('./helpers/truncate'),
  // others
  raw: require('./helpers/raw'),
  // application specific
  retrieveConfig: require('./helpers/retrieveConfig'),
  updateConfig: require('./helpers/updateConfig')
}
