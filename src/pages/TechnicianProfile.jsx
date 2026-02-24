import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { io } from 'socket.io-client';
import axios from 'axios';
import MyJobsForTechnician from '../components/for_technician/MyJobsForTechnician';
import EditProfile from '../components/EditProfile';
import MacGRN from "../stock_GRN/MacGRN";
import MacStock from "../stock_GRN/MacStock";
import TharinduPerformance from '../performance/TharinduPerformance';
import AutoRefresh from "../components/AutoRefresh";
import MacStockEdit from "../stock_GRN/MacStockEdit";
import AssetGRN from "../stock_GRN/AssetGRN";
import ViewAssetStock from '../stock_GRN/ViewAssetStock';
import FullStockModalForTharindu from "../components/Tharindu_Folder/FullStockModalForTharindu";

const socket = io(import.meta.env.VITE_API_URL);

const TechnicianProfile = () => {
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState('welcome');
  const [showRefreshPopup, setShowRefreshPopup] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const handleCloseGRN = () => setActiveTab("welcome");
  const handleCloseAssetGRN = () => setActiveTab("welcome");
  const handleCloseTharinduPerformance = () => setActiveTab("welcome");
  const handleCloseStock = () => setActiveTab ("welcome");
  const handleCloseAssetStock = () => setActiveTab ("welcome");
  const handleCloseStockEdit = () => setActiveTab ("welcome");
  const handleCloseFullStockModalForTharindu = () => setActiveTab ("welcome");

   useEffect(() => {
    const blockBack = () => {
      // Re-push the same state to prevent leaving
      window.history.pushState(null, "", window.location.href);
      alert("Back navigation is disabled on this page!");
    };

    // Always push a dummy state when page loads (even after refresh)
    window.history.pushState(null, "", window.location.href);

    // Listen for back/forward navigation
    window.addEventListener("popstate", blockBack);
        // Warn on tab close or refresh
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ""; // Required for Chrome
      // Modern browsers ignore custom messages, but will show a confirmation dialog
    };
     window.addEventListener("beforeunload", handleBeforeUnload);

    // Optional: prevent leaving on refresh or closing tab
    window.addEventListener("beforeunload", (e) => {
      e.preventDefault();
      e.returnValue = "";
    });

    return () => {
      window.removeEventListener("popstate", blockBack);
      window.removeEventListener("beforeunload", () => {});
    };
  }, []);

  // Redirect unauthorized
  useEffect(() => {
    if (!user || user.type !== 'technician') navigate('/');
  }, [user, navigate]);

  // Real-time unread chat & notifications
  useEffect(() => {
    if (!user?.username) return;

    // Join Socket.IO room
    socket.emit('join', user.username);

    // Listen for new chat messages
    const handleNewChat = (chat) => {
      if (chat.to === user.username && activeTab !== 'contactCreator') {
        setUnreadChatCount((prev) => prev + 1);
      }
    };
    socket.on('newMessage', handleNewChat);

    // Listen for new notifications
    const handleNewNotif = () => setUnreadNotifications((prev) => prev + 1);
    socket.on(`notificationToTech-${user.username}`, handleNewNotif);

    // Polling fallback every 10s (in case a Socket.IO event is missed)
    const pollInterval = setInterval(async () => {
      try {
        const [chatRes, notifRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/chat/unread/${user.username}`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/notifications/unread/${user.username}`)
        ]);
        setUnreadChatCount(chatRes.data.count || 0);
        setUnreadNotifications(notifRes.data.count || 0);
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 10000);

    return () => {
      socket.off('newMessage', handleNewChat);
      socket.off(`notificationToTech-${user.username}`, handleNewNotif);
      clearInterval(pollInterval);
    };
  }, [user.username, activeTab]);

  // Mark chat messages read when opening chat tab
  useEffect(() => {
    if (activeTab === 'contactCreator') {
      const markRead = async () => {
        try {
          await axios.post(`${import.meta.env.VITE_API_URL}/api/chat/mark-read`, {
            from: '',
            to: user.username,
          });
          setUnreadChatCount(0);
        } catch (err) {
          console.error(err);
        }
      };
      markRead();
    }
  }, [activeTab, user.username]);


  //LOGOUT FUNCTION
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if(confirmLogout){
        localStorage.removeItem("user");
    navigate("/");
    }
  };

  const handleMouseEnter = () => setShowSidebar(true);
  const handleMouseLeave = () => setShowSidebar(false);

    const navItems = user?.username === 'Tharindu Sandaruwan'
    ? [
        { id: "refresh", label: "Refresh" },
        { id: 'viewJobs', label: 'My Jobs' },
        { id: 'editProfile', label: 'Edit Profile' },
        { id: 'mac_grn', label: 'Mac GRN' },
        { id: 'asset_grn', label: 'Asset GRN' },
        { id: 'tharindu_performance', label: 'Performance' },
        { id: 'mac_stock', label: 'Mac Stock' },
        { id: 'asset_stock', label: 'Asset Stock' },
        { id: 'full_stock', label: 'Full Stock' },
        { id: 'mac_stock_edit', label: 'Mac Stock Edit' },
      ]
    : [
        { id: "refresh", label: "Refresh" },
        { id: 'viewJobs', label: 'My Jobs' },
        { id: 'editProfile', label: 'Edit Profile' },
      ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md px-6 py-4 flex justify-between items-center z-50">
        <div className="text-xl font-bold text-blue-600">Technician Dashboard</div>

        <div className="flex items-center space-x-4">
          <span className="hidden sm:inline text-gray-700 font-medium">
            {user?.email}
          </span>
          <strong className="hidden sm:inline text-gray-700 font-medium">
            {user?.type}
          </strong>


          {/* Profile */}
          <div className="cursor-pointer" onClick={() => setActiveTab('editProfile')}>
            <FaUserCircle size={28} className="text-gray-700" />
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md font-semibold transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Sidebar */}
      <div className="flex flex-1 relative pt-20">
        <div className="fixed top-20 left-0 h-full w-4 z-50" onMouseEnter={handleMouseEnter} />
        <div
          className={`fixed top-0 left-0 h-full w-52 bg-gray-900/20 backdrop-blur-lg shadow-lg transform transition-all duration-300 ease-in-out z-40
            ${showSidebar ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex flex-col gap-2 text-sm mt-20 px-4
                h-[calc(100vh-5rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent">
            {navItems.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => {
                    if (id === "refresh") {
                      setShowRefreshPopup(true);
                    } else {
                      setActiveTab(id);
                    }
                  }}
                className={`px-4 py-2 rounded-md font-medium transition ${
                  activeTab === id
                    ? 'bg-cyan-800 text-amber-50'
                    : 'bg-amber-50 text-black hover:bg-blue-600 hover:text-amber-50 hover:cursor-pointer'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-10 transition-all duration-300 overflow-y-auto">
          {activeTab === 'welcome' && (
            <>
              <h1 className="text-3xl font-semibold text-gray-800 mb-2 text-center">
                Welcome, {user?.username}!
              </h1>
              <p className="text-gray-600 text-lg text-center">
                Move your cursor to left open the navigation bar.
              </p>
            </>
          )}
          {activeTab === 'viewJobs' && <MyJobsForTechnician />}

          {activeTab === 'contactCreator' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Contact Job Creator</h2>
              <ChatToJC />
            </div>
          )}
          {activeTab === 'editProfile' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-center">You Can Update Your Password Here</h2>
              <EditProfile />
            </div>
          )}
           {/* New tabs for Tharindu */}
              {activeTab === 'mac_grn' && <MacGRN onClose={handleCloseGRN}/>}
              {activeTab === 'asset_grn' && <AssetGRN onClose={handleCloseAssetGRN}/>}
              {activeTab === 'tharindu_performance' && <TharinduPerformance onclose={() => handleCloseTharinduPerformance(false)}/>}
              {activeTab === 'mac_stock' && <MacStock onClose={handleCloseStock}/>}
              {activeTab === 'asset_stock' && <ViewAssetStock onClose={handleCloseAssetStock}/>}
              {activeTab === 'full_stock' && <FullStockModalForTharindu onClose={handleCloseFullStockModalForTharindu}/>}
              {activeTab === 'mac_stock_edit' && <MacStockEdit onClose={handleCloseStockEdit}/>}
        </main>
      </div>
            {showRefreshPopup && (
  <AutoRefresh onClose={() => setShowRefreshPopup(false)} />
)}

    </div>
  );
};

export default TechnicianProfile;
