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
  const sql_query = "SELECT id,username,name,post_count,follower_count,following_count,date_created FROM profile WHERE is_deleted=0";
  db.query(sql_query, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  })
})

app.get('/postfeed/:id', (req, res) => {
  const profile_id = parseInt(req.params.id)
  const sql_query = `SELECT * FROM post WHERE id=${profile_id}`
  db.query(sql_query, (err, data) => {
    if (err) return res.json(err)
    return res.json(data)
  })
})

app.get('/create-profile/:username&:name&:password&:isprivate', (req, res) => {
  console.log(req.url)
  const username = req.params.username
  const name = req.params.name === "." ? '' : req.params.name
  const password_hash = req.params.password
  const is_private = req.params.isprivate === 'false' ? '0' : '1'
  const values = [[username, name, password_hash, is_private]]
  console.log(is_private)
  const sql_query = "INSERT INTO profile (`username`, `name`, `password`, `is_private`) VALUES (?)"
  db.query(sql_query, values, (err, data) => {
    if (err) return res.json(err);
    return res.json(data)
  })
})

app.get('/profile-matches/:username', (req, res) => {
  const username = req.params.username
  const sql_query = `SELECT username,password FROM profile WHERE username='${username}' AND is_deleted=0`
  db.query(sql_query, (err, data) => {
    if (err) return res.json(err)
    if (data && data.length > 0) {
      let profile_data = data[0]
      return res.json({...profile_data, exists: true})
    }
    return res.json({exists: false})
  })
})

app.get('/profile-show/:username', (req, res) => {
  const username = req.params.username
  const sql_query = `SELECT id,username,name,post_count,follower_count,following_count,date_created,is_private FROM profile WHERE username='${username}' AND is_deleted=0`
  db.query(sql_query, (err, data) => {
    if (err) return res.json(err)
    if (data && data.length > 0) {
      let profile_data = data[0]
      return res.json({...profile_data, exists: true})
    }
    return res.json({exists: false})
  })
})

app.get('/profile-exists/:username', (req, res) => {
  const username = req.params.username;
  const sql_query = `SELECT id FROM profile WHERE username="${username}"`
  db.query(sql_query, (err, data) => {
    if (err) return res.json(err);
    return res.json({ exists: data && data.length>0 })
  })
})


app.listen(config.server.port, config.server.host, () => {
  console.log(`Server running at http://${config.server.host}:${config.server.port}/`);
})
