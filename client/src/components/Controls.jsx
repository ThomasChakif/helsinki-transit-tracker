import { Box, Checkbox, Grid} from '@mui/material'
/*
<Box className='map-controls' component='div' sx={{display: 'flex', maxHeight: '50px', width: '80%', padding:'5px', margin:'10px', 
      flexDirection: 'column', flexWrap:'wrap', justifyContent: 'space-evenly'}}
>
<label key={toggle.id}>
            <input 
              type="checkbox"
              checked={toggle.checked}
              onChange={() => onToggle(toggle.id)}
            />
            {toggle.label}
          </label>
</Box>
*/
const Controls = ({ 
    toggles, 
    onToggle 
  }) => {
    return (
      <Grid container spacing={2} direction={"row"} justifyContent={"space-evenly"} alignItems={"center"} textAlign={'center'} sx={{maxWidth: '80%'}}>
        {toggles.map(toggle => (
          <Grid size={3}>
            <label key={toggle.id}>
              <Checkbox sx={{color:'white'}}
                defaultChecked={toggle.checked} label={`${toggle.label}`} onChange={() => onToggle(toggle.id)}
              />
              {toggle.label}
            </label>
          </Grid>
        ))}
      </Grid>
    );
  };
  
  export default Controls;
