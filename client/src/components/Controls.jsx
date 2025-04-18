const Controls = ({ 
    toggles, 
    onToggle 
  }) => {
    return (
      <div className='map-controls'>
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
      </div>
    );
  };
  
  export default Controls;
