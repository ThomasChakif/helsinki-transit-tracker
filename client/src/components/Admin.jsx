import { useState, useEffect, useMemo } from 'react'
import {Snackbar, MenuItem } from '@mui/material'
import { MaterialReactTable } from 'material-react-table'
import DeleteIcon from '@mui/icons-material/Delete'
import DeleteModal from './DeleteModal'
import './Admin.css'

function Admin() {
  const [applications, setApplications] = useState([])
  const [selectedTransaction, setSelectedTransaction] = useState()
  const [transactionDeleteModalOpen, setTransactionDeleteModalOpen] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)

  const handleModalOpen = () => setTransactionModalOpen(true)
  const handleSnackbarClose = () => setSnackbarOpen(false)

  const [vehicleResults, setVehicleResults] = useState(0)
  const [stationResults, setStationResults] = useState(0)

  const [topVehicleName, setTopVehicleName] = useState()
  const [topVehicleCount, setTopVehicleCount] = useState(0)
  const [todaysVotes, setTodaysVotes] = useState(0)

  const getTopVehicle = async () => {
    try {
      const resp = await fetch('http://localhost:3000/adminTopVehicle')
      if (!resp.ok) {
        setSnackbarOpen(true)
      }
      const data = await resp.json()
      setTopVehicleName(data[0]?.name ?? 'N/A')
      setTopVehicleCount(data[0]?.average_inspectors ?? 'None')
    } catch (err) {
      console.error(err)
      setSnackbarOpen(true)
    }
  }
 
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

  const getTransactions = async () => {
    try {
      const resp = await fetch('http://localhost:3000/admin')
      if (!resp.ok) {
        setSnackbarOpen(true)
      }
      const data = await resp.json()
      setApplications(data)
    } catch (err) {
      console.error(err)
      setSnackbarOpen(true)
    }
  }

  const getVehicleResults = async () => {
    try {
      const resp = await fetch('http://localhost:3000/adminVehicleResults')
      if (!resp.ok) {
        setSnackbarOpen(true)
      }
      const data = await resp.json()
      setVehicleResults(data[0]?.avg ?? 'N/A')
    } catch (err) {
      console.error(err)
      setSnackbarOpen(true)
    }
  }

  const getStationResults = async () => {
    try {
      const resp = await fetch('http://localhost:3000/adminStationResults')
      if (!resp.ok) {
        setSnackbarOpen(true)
      }
      const data = await resp.json()
      setStationResults(data[0]?.avg ?? 'N/A')
    } catch (err) {
      console.error(err)
      setSnackbarOpen(true)
    }
  }

  const refreshAllData = () => {
    getTransactions()
    getVehicleResults()
    getStationResults()
    getTopVehicle()
    getTodaysVotes()
  }

  useEffect(() => {
    refreshAllData()
  }, [])

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
      
      <div className="stats-container">
        <h3>Admin Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-title">Today's Reports</div>
            <div className="stat-value">{todaysVotes}</div>
            <div className="stat-description">Reports submitted today</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Top Vehicle</div>
            <div className="stat-value">{topVehicleName}</div>
            <div className="stat-description">Average of {topVehicleCount} inspectors per report</div>
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
      
      <h3>All Reports</h3>
      <MaterialReactTable 
        data={applications} 
        columns={columns}
        enableRowActions
        renderRowActionMenuItems={({ row }) => [
          <MenuItem key='delete' onClick={() => {
            setSelectedTransaction(row.original.report_id)
            setTransactionDeleteModalOpen(true)
          }}>
            <DeleteIcon style={{ marginRight: '8px' }}/>
            Delete
          </MenuItem>,
        ]}
      />
      
      <DeleteModal 
        transactionID={selectedTransaction} 
        transactionDeleteModalOpen={transactionDeleteModalOpen}
        setTransactionDeleteModalOpen={setTransactionDeleteModalOpen}
        getTransactions={getTransactions}
        getVehicleResults={getVehicleResults}
        getStationResults={getStationResults}
        getTodaysVotes={getTodaysVotes}
        getTopVehicle={getTopVehicle}
      />

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