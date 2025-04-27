import { Stack, Box, Grid, AppBar, Toolbar, IconButton, Typography} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const AppHeader = () => {
    return (
        <Box sx={{color:'red'}}>
            <AppBar position="static">
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
                    
                    <Typography variant="h6" component="div" sx={{color:'inherit'}}>
                        Helsinki Transit Tracker v2
                    </Typography>
                </Toolbar>
            </AppBar>
        </Box>
    )
}

export default AppHeader;