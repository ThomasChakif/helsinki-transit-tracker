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

export default function DeleteBanModal({banID, banDeleteModalOpen, setBanDeleteModalOpen, refreshAllData}) {

    const handleModalClose = () => setBanDeleteModalOpen(false)

    //function used to delete the specific ban using its ID
    const deleteBan = async () => {
        await fetch(`http://localhost:3000/adminUnban/${banID}`, {
            method: "DELETE",
        })
        //after a ban is deleted, update the banned list on the admin page
        await refreshAllData()
        await setBanDeleteModalOpen(false) //close modal
    }

    return (
        // popup to ensure user wants to delete report
        <Modal open={banDeleteModalOpen} onClose = {handleModalClose}>
            <Box sx={style}>
                Are you sure you want to unban this user?
                <Button onClick={deleteBan}>Unban</Button>
                <Button onClick={handleModalClose}>Close</Button>
            </Box>
        </Modal>
    )
}