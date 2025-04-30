import { Box, Stack } from '@mui/material'


const ReportModal = () => {
    return (
        <Box sx={style2}>
            <h3 className='newReportH3'>Make a new report</h3>
            <Stack spacing={2}>
                <TextField
                    style={{ marginBottom: '20px', width: '400px' }}
                    select
                    label='Select a vehicle or station'
                    variant='outlined'
                    required
                    value={vehicleStationName}
                    onChange={(event) => {
                        //first set the name 
                        const selectedPlatform = vehicleStationData.find(platform => platform.name === event.target.value)
                        setVehicleStationName(event.target.value)
                        const rt = selectedPlatform?.type;
                        setReportType(rt)
                    }}
                >
                    {vehicleStationData.map((vsData) => (
                        <MenuItem key={vsData.name} value={vsData.name}>
                            {vsData.name}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField style={{ marginBottom: '20px', width: '400px' }} required label="Number of inspectors" type="text" value={inspectorCount} onChange={event => {
                    const ic = event.target.value
                    if (/^\d*$/.test(ic)) { // regex to allow only whole numbers
                        setInspectorCount(ic)
                    }
                }}
                />
                <TextField style={{ marginBottom: '20px', width: '400px' }} label="Notes (optional)" onChange={event => setNotes(event.target.value)} />
            </Stack>
            <Button onClick={addReport}>Submit report</Button>
        </Box>
    )
};

export default ReportModal;