import {Button, Modal, Box} from '@mui/material'

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'gray',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

export default function DeleteModal({transactionID, transactionDeleteModalOpen, setTransactionDeleteModalOpen, getTransactions, getStationResults, getVehicleResults, getTopVehicle, getTodaysVotes}) {

    const handleModalClose = () => setTransactionDeleteModalOpen(false)

    //used to delete the specific report using its ID
    const deleteTransaction = async () => {
        await fetch(`http://localhost:3000/admin/${transactionID}`, {
            method: "DELETE",
        })
        await getTransactions() //refresh applications
        await getVehicleResults()
        await getStationResults()
        await getTodaysVotes()
        await getTopVehicle()
        await setTransactionDeleteModalOpen(false) //close modal
    }

    return (
        // popup to ensure user wants to delete application
        <Modal open={transactionDeleteModalOpen} onClose = {handleModalClose}>
            <Box sx={style}>
                Are you sure you want to delete?
                <Button onClick={deleteTransaction}>Delete Report</Button>
                <Button onClick={handleModalClose}>Close</Button>
            </Box>
        </Modal>
    )
}