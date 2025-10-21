import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Checkout from './pages/Checkout';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);