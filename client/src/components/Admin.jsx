import { useState, useEffect, useMemo } from 'react'
import {Snackbar, MenuItem } from '@mui/material'
import { MaterialReactTable } from 'material-react-table'
import DeleteIcon from '@mui/icons-material/Delete'
import DeleteModal from './DeleteModal'
import './Admin.css'

function Admin() {
  // initialize all variables
  const [reports, setReports] = useState([])
  const [selectedReport, setSelectedReport] = useState()
  const [reportDeleteModalOpen, setReportDeleteModalOpen] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const handleSnackbarClose = () => setSnackbarOpen(false) //used to handle errors

  const [vehicleResults, setVehicleResults] = useState(0)
  const [stationResults, setStationResults] = useState(0)

  const [topVehicleName, setTopVehicleName] = useState()
  const [topVehicleCount, setTopVehicleCount] = useState(0)
  const [todaysVotes, setTodaysVotes] = useState(0)

  //function to fetch the all time top vehicle with the most inspector reports
  const getTopVehicle = async () => {
    try {
      const resp = await fetch('http://localhost:3000/adminTopVehicle')
      if (!resp.ok) {
        setSnackbarOpen(true)
      }
      const data = await resp.json()
      setTopVehicleName(data[0]?.name ?? 'N/A') //set vehicle name
      setTopVehicleCount(data[0]?.average_inspectors ?? 'None') //set vehicle avg inspectors
    } catch (err) {
      console.error(err)
      setSnackbarOpen(true)
    }
  }
 
  //function to get the amount of reports made on the current day
  const getTodaysVotes = async () => {
    try {
      const resp = await fetch('http://localhost:3000/adminGetTodaysVotes')
      if (!resp.ok) {
        setSnackbarOpen(true)
      }
      const data = await resp.json()
      setTodaysVotes(data[0]?.count ?? 0)
    } catch (err) {
      console.error(err)
      setSnackbarOpen(true)
    }
  }

  //function to get all reports so that they may be added to admin dashboard table
  const getReports = async () => {
    try {
      const resp = await fetch('http://localhost:3000/admin')
      if (!resp.ok) {
        setSnackbarOpen(true)
      }
      const data = await resp.json()
      setReports(data)
    } catch (err) {
      console.error(err)
      setSnackbarOpen(true)
    }
  }

  //function to get the average inspector count of the last 10 vehicle reports
  const getVehicleResults = async () => {
    try {
      const resp = await fetch('http://localhost:3000/adminVehicleResults')
      if (!resp.ok) {
        setSnackbarOpen(true)
      }
      const data = await resp.json()
      setVehicleResults(data[0]?.avg ?? 'N/A') //set the avg
    } catch (err) {
      console.error(err)
      setSnackbarOpen(true)
    }
  }

  //function to get the average inspector count of the last 10 station reports
  const getStationResults = async () => {
    try {
      const resp = await fetch('http://localhost:3000/adminStationResults')
      if (!resp.ok) {
        setSnackbarOpen(true)
      }
      const data = await resp.json()
      setStationResults(data[0]?.avg ?? 'N/A') //set the average
    } catch (err) {
      console.error(err)
      setSnackbarOpen(true)
    }
  }

  //call all functions to initialize data on admin dashboard. Having them all together is better for convenience on the deleteModal side
  const refreshAllData = () => {
    getReports()
    getVehicleResults()
    getStationResults()
    getTopVehicle()
    getTodaysVotes()
  }

  useEffect(() => {
    refreshAllData()
  }, [])

  //initialize our table with the following attributes: 
  //report ID, type, vehicle name, inspector count, notes, email of the user who submitted it, and when it was created
  const columns = useMemo(() => [
    {
      accessorKey: 'report_id',
      header: 'Report ID'
    },
    {
      accessorKey: 'report_type',
      header: 'Station/Vehicle',
    },
    {
      accessorKey: 'name',
      header: 'Vehicle or Station name',
    },
    {
      accessorKey: 'inspector_count',
      header: 'Inspector Count',
    },
    {
      accessorKey: 'notes',
      header: 'Notes',
    },
    {
      accessorKey: 'user_email',
      header: 'User email',
    },
    {
      accessorKey: 'created_at',
      header: 'Created at:',
    }
  ], [])

  return (
    <>
      <h1>Helsinki Transit Admin Dashboard</h1>
      
      {/* containers for the different admin statistics boxes: today's reports, all-time vehicle, average of last 10 vehicle and station reports*/}
      <div className="stats-container">
        <h3>Admin Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-title">Today's Reports</div>
            <div className="stat-value">{todaysVotes}</div>
            <div className="stat-description">Report(s) submitted today</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Top Vehicle</div>
            <div className="stat-value">{topVehicleName}</div>
            <div className="stat-description">Average of {topVehicleCount} inspector(s) per report</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Vehicle Reports</div>
            <div className="stat-value">{vehicleResults}</div>
            <div className="stat-description">Average inspectors (last 10 reports)</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Station Reports</div>
            <div className="stat-value">{stationResults}</div>
            <div className="stat-description">Average inspectors (last 10 reports)</div>
          </div>
        </div>
      </div>
      
      {/* reports table, made up of the data found in reports and structured using columns */}
      {/* admins can delete a report if they deem it necessary*/}
      <h3>All Reports</h3>
      <MaterialReactTable 
        data={reports} 
        columns={columns}
        enableRowActions
        renderRowActionMenuItems={({ row }) => [
          <MenuItem key='delete' onClick={() => {
            setSelectedReport(row.original.report_id)
            setReportDeleteModalOpen(true)
          }}>
            <DeleteIcon style={{ marginRight: '8px' }}/>
            Delete
          </MenuItem>,
        ]}
      />
      
      {/* delete modal when an admin deletes a report */}
      <DeleteModal 
        reportID={selectedReport} 
        reportDeleteModalOpen={reportDeleteModalOpen}
        setReportDeleteModalOpen={setReportDeleteModalOpen}
        refreshAllData={refreshAllData}
      />

    {/* snackbar for handling errors */}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        message="Error Getting Application Data"
      />
    </>
  )
}

export default Admin