import { Box } from '@mui/material'

const Controls = ({ 
    toggles, 
    onToggle 
  }) => {
    return (
      <Box className='map-controls' component='div' sx={{display: 'flex', maxHeight: '50px', width: '80%', padding:'5px', margin:'10px', flexDirection : 'column', flexWrap:'wrap', justifyContent: 'space-around', alignContent:'stretch'}}>
        {toggles.map(toggle => (
          <label key={toggle.id}>
            <input 
              type="checkbox"
              checked={toggle.checked}
              onChange={() => onToggle(toggle.id)}
            />
            {toggle.label}
          </label>
        ))}
      </Box>
    );
  };
  
  export default Controls;
