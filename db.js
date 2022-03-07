const mysql = require('mysql2')

const pool = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  database : 'csa360v1',
  password : ''
})

module.exports = pool.promise()