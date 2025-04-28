import {Button, Modal, Box} from '@mui/material'

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'white',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

export default function DeleteModal({reportID, reportDeleteModalOpen, setReportDeleteModalOpen, refreshAllData}) {

    const handleModalClose = () => setReportDeleteModalOpen(false)

    //function used to delete the specific report using its ID
    const deleteReport = async () => {
        await fetch(`http://localhost:3000/admin/${reportID}`, {
            method: "DELETE",
        })
        //after a report is deleted, update all of the statistics on the admin interface, as well as the reports listing on the admin interface
        await refreshAllData()
        await setReportDeleteModalOpen(false) //close modal
    }

    return (
        // popup to ensure user wants to delete report
        <Modal open={reportDeleteModalOpen} onClose = {handleModalClose}>
            <Box sx={style}>
                Are you sure you want to delete?
                <Button onClick={deleteReport}>Delete Report</Button>
                <Button onClick={handleModalClose}>Close</Button>
            </Box>
        </Modal>
    )
}