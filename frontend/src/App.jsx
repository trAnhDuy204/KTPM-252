import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RoomManagement from "./pages/reception/RoomManagement";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/reception/rooms" replace />} />
        <Route path="/reception/rooms" element={<RoomManagement />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
