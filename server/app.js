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

//route to grab all inserts from database
app.get('/admin', (req, res) => {
    try{
        const qs = 'select * from reports'
        query(qs).then(data => {res.send(data.rows)}) //send all data in the table
    }catch(err){
        res.send('error', err)
    }
})

app.get('/adminVehicleResults', (req, res) => {
  try{
      const qs = "select round(avg(inspector_count), 2) as avg from reports where report_type = 'vehicle' limit 10"
      query(qs).then(data => {res.send(data.rows)}) //send all data in the table
  }catch(err){
      res.send('error', err)
  }
})

app.get('/adminStationResults', (req, res) => {
  try{
    const qs = "select round(avg(inspector_count), 2) as avg from reports where report_type = 'station' limit 10"
    query(qs).then(data => {res.send(data.rows)}) //send all data in the table
  }catch(err){
      res.send('error', err)
  }
})

app.get('/adminTopVehicle', (req, res) => {
  try{
    const qs = "SELECT name, (SUM(inspector_count) / count(*)) as average_inspectors FROM reports WHERE report_type = 'vehicle' GROUP BY name having count(*) >= 5 ORDER BY average_inspectors DESC LIMIT 1"
    query(qs).then(data => {res.send(data.rows)}) //send all data in the table
  }catch(err){
      res.send('error', err)
  }
})

app.get('/adminGetTodaysVotes', (req, res) => {
  try{
    const qs = "SELECT count(*) FROM reports WHERE DATE(created_at) = CURRENT_DATE"
    query(qs).then(data => {res.send(data.rows)}) //send all data in the table
  }catch(err){
      res.send('error', err)
  }
})

//get 5 most recent votes made today for a specific station or vehicle
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

app.post('/newReport', (req, res) => {
  try{
    let body = req.body
    const qs = `insert into reports (user_email, report_type, name, notes, inspector_count, created_at) values ('${body.email}', '${body.type}', '${body.name}', '${body.notes}', '${body.count}', '${body.time}')`
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

app.listen(app.get('port'), () => {
    console.log('App listening on http://localhost:3000')
    console.log('Press Ctrl+C to stop')
})