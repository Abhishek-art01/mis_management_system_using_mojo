import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from '../Components/Sidebar';
import Login          from '../Login/Login';
import Dashboard      from '../Dashboard/Dashboard';
import LocalityChecker from '../LocalityChecker/LocalityChecker';
import VehicleList    from '../VehicleList/VehicleList';
import Sidebar, { SidebarProvider } from './Components/Sidebar.jsx';
// import GPSChecker     from '../GPSChecker/GPSChecker';
import Downloads      from '../Downloads/Downloads';

import './App.css';

const SB_WIDTH = 270;

function AppContent() {
  const location   = useLocation();
  const { open }   = useSidebar();
  const isLogin    = location.pathname === '/';

  return (
    <div className="app-shell">
      {!isLogin && <Sidebar />}

      <main
        className="app-main"
        style={{
          marginLeft: (!isLogin && open) ? SB_WIDTH : 0,
          transition: 'margin-left 0.38s cubic-bezier(.16,1,.3,1)',
        }}
      >
        <Routes>
          <Route path="/"                element={<Login />} />
          <Route path="/dashboard"       element={<Dashboard />} />
          <Route path="/locality-manager" element={<LocalityChecker />} />
          <Route path="/vehicle-list"    element={<VehicleList />} />
          {/* <Route path="/gps-checker"     element={<GPSChecker />} /> */}
          <Route path="/downloads"       element={<Downloads />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <Sidebar />
        {/* your routes */}
      </SidebarProvider>
    </BrowserRouter>
  );
}
