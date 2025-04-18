import Map from './components/Map';
import Admin from './components/Admin';
import {BrowserRouter, Routes, Route} from 'react-router-dom';

function App() {
    return (
        <div className='App'>
            <h1>Helsinki Transit Tracker V2</h1>
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
