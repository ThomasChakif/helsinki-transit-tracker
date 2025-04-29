import express from 'express'
import cors from 'cors'
import 'dotenv/config'

import { query } from './db/postgres.js'

//create the app
const app = express()

//set the port
app.set('port', 3000)

//set up some middleware
//set up some can read the body requests
app.use(express.json())
//middleware to make requests happen from client/frontend
app.use(cors())

//base route
app.get('/', (req, res) => {
    res.send('Welcome to the helsinki transit tracker')
})

//health check route
app.get('/up', (req, res) => {
    res.json({status: 'up'})
})

//route to grab all reports from the database
app.get('/admin', (req, res) => {
    try{
        const qs = 'select * from reports'
        query(qs).then(data => {res.send(data.rows)}) //send all data in the table
    }catch(err){
        res.send('error', err)
    }
})

//route to get all banned users
app.get('/adminGetBans', (req, res) => {
  try {
    const qs = 'select * from user_bans'
    query(qs).then(data => {res.send(data.rows)}) //send all data in the table
  }catch(err){
    res.send('error', err)
  }
})

//route to get the average inspector count of the last 10 vehicle reports
app.get('/adminVehicleResults', (req, res) => {
  try{
      const qs = "select round(avg(inspector_count), 2) as avg from reports where report_type = 'vehicle' limit 10"
      query(qs).then(data => {res.send(data.rows)}) //send all data in the table
  }catch(err){
      res.send('error', err)
  }
})

//route to get the average inspector count of the last 10 station reports
app.get('/adminStationResults', (req, res) => {
  try{
    const qs = "select round(avg(inspector_count), 2) as avg from reports where report_type = 'station' limit 10"
    query(qs).then(data => {res.send(data.rows)}) //send all data in the table
  }catch(err){
      res.send('error', err)
  }
})

//route to get the name and average inspector count of the vehicle with the highest average inspector count (all-time)
//the vehicle must have at least 5 votes to be considered
app.get('/adminTopVehicle', (req, res) => {
  try{
    const qs = "SELECT name, (SUM(inspector_count) / count(*)) as average_inspectors FROM reports WHERE report_type = 'vehicle' GROUP BY name having count(*) >= 5 ORDER BY average_inspectors DESC LIMIT 1"
    query(qs).then(data => {res.send(data.rows)}) //send all data in the table
  }catch(err){
      res.send('error', err)
  }
})

//route to get the number of reports made on the current day (only counts reports that weren't deleted)
app.get('/adminGetTodaysVotes', (req, res) => {
  try{
    const qs = "SELECT count(*) FROM reports WHERE DATE(created_at) = CURRENT_DATE"
    query(qs).then(data => {res.send(data.rows)}) //send all data in the table
  }catch(err){
      res.send('error', err)
  }
})

//route for when a user searches for the last 5 votes for a particular station/vehicle
//we only consider the last 5 votes that were made on the same day the user is using the app (doesn't factor in previous votes)
app.post('/adminGetRecentVotes', (req, res) => {
  try {
    let body = req.body
    let reqName = body.name
    let todayDate = body.todayDate
    let tomDate = body.tomDate
    const qs = `SELECT ROUND(AVG(recent_votes.inspector_count), 2) as average  FROM (SELECT inspector_count FROM reports WHERE name LIKE '${reqName}' AND created_at >= '${todayDate}' AND created_at < '${tomDate}' ORDER BY created_at DESC LIMIT 5) AS recent_votes`
    query(qs).then(data => {res.send(data.rows)})
  }catch(err){
    res.send('error', err)
  }
})


//route to add in a new report 
app.post('/newReport', (req, res) => {
  try{
    let body = req.body
    const qs = `insert into reports (user_email, report_type, name, notes, inspector_count, created_at) values ('${body.email}', '${body.type}', '${body.name}', '${body.notes}', '${body.count}', '${body.time}')`
    query(qs).then(data => {res.send(data.rows)})
  }catch(err){
    res.send('error', err) 
  }
})

//route to ban a user
app.post('/newBan', (req, res) => {
  try {
    let body = req.body
    const qs = `insert into user_bans(user_email, ban_notes, ban_time) values ('${body.email}', '${body.notes}', '${body.time}')`
    query(qs).then(data => {res.send(data.rows)})
  }catch(err){
    res.send('error', err) 
  }
})

//route to delete a report from the database
app.delete('/admin/:id', (req, res) => {
  try {
      const reportID = req.params.id
      let qs = `delete from reports where report_id = ${reportID}`
      query(qs).then(data => res.send(`${data.rowCount} row deleted`))
  } catch (err) {
      res.send('error', err)
  }
}) 

//route to unban a user based of their id
app.delete('/adminUnban/:id', (req, res) => {
  try {
      const banID = req.params.id
      let qs = `delete from user_bans where ban_id = ${banID}`
      query(qs).then(data => res.send(`${data.rowCount} row deleted`))
  } catch (err) {
      res.send('error', err)
  }
}) 

app.listen(app.get('port'), () => {
    console.log('App listening on http://localhost:3000')
    console.log('Press Ctrl+C to stop')
})