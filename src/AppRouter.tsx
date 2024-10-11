import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Suppliers from './pages/Suppliers';

function AppRouter() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/suppliers" element={<Suppliers />} />
            </Routes>
        </Router>
    );
}

export default AppRouter;