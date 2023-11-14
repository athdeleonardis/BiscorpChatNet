const express = require('express')
const mysql = require('mysql')
const cors = require('cors')

const app = express()
app.use(cors())

const config = require("../config.private.json")
const db = mysql.createConnection({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name
})

app.get('/', (req, res) => {
  return res.json("Response from backend side.");
})

app.get('/profiles', (req, res) => {
  const sql_query = "SELECT * FROM profile";
  db.query(sql_query, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  })
})


app.listen(config.server.port, config.server.host, () => {
  console.log(`Server running at http://${config.server.host}:${config.server.port}/`);
})
