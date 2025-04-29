import Map from './components/Map';
import Admin from './components/Admin';
import AppHeader from './components/AppHeader';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import { Box, Stack } from '@mui/material';

function App() {
    return (
        <div>
            <AppHeader/>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<Map />} />
                    <Route path='/admin' element={<Admin />} />
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App;
