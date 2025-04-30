import { Stack, Box, Grid, AppBar, Toolbar, IconButton, Typography, Tooltip} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';

const AppHeader = () => {
    return (
        <Box>
            <AppBar position="static" sx={{borderRadius:"0px 0px 10px 10px"}}>
                <Toolbar size="small" edge="start">
                    <IconButton
                        size="medium"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <IconButton
                        size="medium"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                    >
                        <Tooltip title="Add Report">
                            <AddIcon/>
                        </Tooltip>
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{color:'inherit'}}>
                        Helsinki Transit Tracker v2
                    </Typography>
                </Toolbar>
            </AppBar>
        </Box>
    )
}

export default AppHeader;