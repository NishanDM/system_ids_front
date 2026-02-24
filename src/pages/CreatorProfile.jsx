import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Box,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Backdrop, CircularProgress, Fade,
} from "@mui/material";

import {
  Menu as MenuIcon,
  ExpandLess,
  ExpandMore,
  Work,
  Receipt,
  Inventory,
  Person,
  People,
  Settings,
  Logout,
  Dashboard,
  Refresh,
  Build,
  Warning
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

// Your components
import JobForm from "../components/JobForm";
import MyJobs from "../components/MyJobs";
import AllJobs from "../components/AllJobs";
import Register from "../components/Register";
import EditProfile from "../components/EditProfile";
import GRN from "../stock_GRN/GRN";
import ViewGRN from "../stock_GRN/ViewGRN";
import MakeBill from "../components/MakeBill";
import BillsModal from "../stock_GRN/BillsModal";
import ManualStock from "../stock_GRN/ManualStock";
import StockModal from "../stock_GRN/StockModal";
import BillEdit from "../stock_GRN/BillEdit";
import DamagedParts from "../components/DamagedParts";
import AdvancedPayments from "../components/AdvancedPayments";
import CashHandeling from "../components/cash_handeling/CashHandeling";
import LowItemNotifications from "../components/LowItemNotifications";
import MakeWarrantyBill from "../components/MakeWarrantyBill";
import MakeBillForWalkingCustomer from "../components/MakeBillForWalkingCustomer";
import OnlyTradeItem from "../components/Trade_Items/OnlyTradeItem";
import CustomerEdit from "../components/customer/CustomerEdit";
import AutoRefresh from "../components/AutoRefresh";
import ViewWhatsAppMsg from "../components/ViewWhatsAppMsg";

const drawerWidth = 260;

export default function CreatorProfile() {

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [expandedTab, setExpandedTab] = useState("");

  // dialogs & modals
  const [pinDialog, setPinDialog] = useState(false);
  const [pinValue, setPinValue] = useState("");
  const [billEditPinDialog, setBillEditPinDialog] = useState(false);
const [billEditPending, setBillEditPending] = useState(false);
  const [refreshOpen, setRefreshOpen] = useState(false);
  const [tradeItemOpen, setTradeItemOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const verifyPin = () => {
    if (pinValue === "0702985029") {
      setActiveTab("manual_stock");
      setPinDialog(false);
      setPinValue("");
    } else {
      alert("Incorrect PIN");
    }
  };

  /* ---------------- Styling helpers ---------------- */

  const mainTabStyle = (openState) => ({
    backgroundColor: openState ? "#FFD54F" : "transparent",
    fontWeight: "bold",
    "& .MuiListItemText-primary": {
      fontWeight: "bold"
    }
  });

  const nestedTabStyle = (tabName) => ({
    pl: 4,
    backgroundColor: activeTab === tabName ? "#81D4FA" : "transparent",
    fontWeight: "bold",
    "& .MuiListItemText-primary": {
      fontWeight: "bold"
    }
  });

  const singleTabStyle = (tabName) => ({
    backgroundColor: activeTab === tabName ? "#81D4FA" : "transparent",
    fontWeight: "bold",
    "& .MuiListItemText-primary": {
      fontWeight: "bold"
    }
  });

  // ---------------- Sidebar ----------------
// ---------------- Sidebar ----------------

const drawer = (
  <Box>
    <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
      <Typography variant="h6" fontWeight="bold">
        Dashboard
      </Typography>

      <IconButton color="inherit" onClick={() => setRefreshOpen(true)}>
        <Refresh />
      </IconButton>
    </Toolbar>

    <Divider />

    <List>

      {/* Dashboard */}
      <ListItemButton
        sx={singleTabStyle("dashboard")}
        onClick={() => setActiveTab("dashboard")}
      >
        <ListItemIcon><Dashboard /></ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItemButton>

      {/* JOBS */}
      <ListItemButton
        sx={mainTabStyle(expandedTab === "jobs")}
        onClick={() =>
          setExpandedTab(expandedTab === "jobs" ? "" : "jobs")
        }
      >
        <ListItemIcon><Work /></ListItemIcon>
        <ListItemText primary="Jobs" />
        {expandedTab === "jobs" ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>

      <Collapse in={expandedTab === "jobs"}>
        <List component="div" disablePadding>
          <ListItemButton
            sx={nestedTabStyle("createJob")}
            onClick={() => setActiveTab("createJob")}
          >
            <ListItemText primary="New Job" />
          </ListItemButton>

          <ListItemButton
            sx={nestedTabStyle("allJobs")}
            onClick={() => setActiveTab("allJobs")}
          >
            <ListItemText primary="All Jobs" />
          </ListItemButton>

          <ListItemButton
            sx={nestedTabStyle("myJobs")}
            onClick={() => setActiveTab("myJobs")}
          >
            <ListItemText primary="My Jobs" />
          </ListItemButton>
        </List>
      </Collapse>

      {/* BILLING */}
      <ListItemButton
        sx={mainTabStyle(expandedTab === "bill")}
        onClick={() =>
          setExpandedTab(expandedTab === "bill" ? "" : "bill")
        }
      >
        <ListItemIcon><Receipt /></ListItemIcon>
        <ListItemText primary="Billing" />
        {expandedTab === "bill" ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>

      <Collapse in={expandedTab === "bill"}>
        <List component="div" disablePadding>
          <ListItemButton
            sx={nestedTabStyle("bill")}
            onClick={() => setActiveTab("bill")}
          >
            <ListItemText primary="New Bill" />
          </ListItemButton>

          <ListItemButton
            sx={nestedTabStyle("warranty_bill")}
            onClick={() => setActiveTab("warranty_bill")}
          >
            <ListItemText primary="Warranty Bill" />
          </ListItemButton>

          <ListItemButton
            sx={nestedTabStyle("walking_customer_bill")}
            onClick={() => setActiveTab("walking_customer_bill")}
          >
            <ListItemText primary="Walking Customer Bill" />
          </ListItemButton>

          <ListItemButton
            sx={{ ...nestedTabStyle("trade_items") }}
            onClick={() => setTradeItemOpen(true)}
          >
            <ListItemText primary="Trade Items" />
          </ListItemButton>

          <ListItemButton
            sx={nestedTabStyle("invoices")}
            onClick={() => setActiveTab("invoices")}
          >
            <ListItemText primary="All Bills" />
          </ListItemButton>

          <ListItemButton
            sx={nestedTabStyle("bill_edit")}
            onClick={() => {
              setBillEditPinDialog(true);
              setBillEditPending(true);
            }}
          >
            <ListItemText primary="Edit Bill" />
          </ListItemButton>
        </List>
      </Collapse>

      {/* FINANCE */}
      <ListItemButton
        sx={mainTabStyle(expandedTab === "finance")}
        onClick={() =>
          setExpandedTab(expandedTab === "finance" ? "" : "finance")
        }
      >
        <ListItemIcon><Build /></ListItemIcon>
        <ListItemText primary="Finance" />
        {expandedTab === "finance" ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>

      <Collapse in={expandedTab === "finance"}>
        <List component="div" disablePadding>
          <ListItemButton
            sx={nestedTabStyle("advanced_payments")}
            onClick={() => setActiveTab("advanced_payments")}
          >
            <ListItemText primary="Advanced Payments" />
          </ListItemButton>

          <ListItemButton
            sx={nestedTabStyle("cash_handeling")}
            onClick={() => setActiveTab("cash_handeling")}
          >
            <ListItemText primary="Cash Handling" />
          </ListItemButton>
        </List>
      </Collapse>

      {/* STOCK */}
      <ListItemButton
        sx={mainTabStyle(expandedTab === "stock")}
        onClick={() =>
          setExpandedTab(expandedTab === "stock" ? "" : "stock")
        }
      >
        <ListItemIcon><Inventory /></ListItemIcon>
        <ListItemText primary="Stock" />
        {expandedTab === "stock" ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>

      <Collapse in={expandedTab === "stock"}>
        <List component="div" disablePadding>
          <ListItemButton
            sx={nestedTabStyle("grn")}
            onClick={() => setActiveTab("grn")}
          >
            <ListItemText primary="GRN" />
          </ListItemButton>

          <ListItemButton
            sx={nestedTabStyle("view_grn")}
            onClick={() => setActiveTab("view_grn")}
          >
            <ListItemText primary="View GRN" />
          </ListItemButton>

          <ListItemButton
            sx={nestedTabStyle("stock")}
            onClick={() => setActiveTab("stock")}
          >
            <ListItemText primary="View Stock" />
          </ListItemButton>

          <ListItemButton
            sx={nestedTabStyle("manual_stock")}
            onClick={() => setPinDialog(true)}
          >
            <ListItemText primary="Manual Stock Edit" />
          </ListItemButton>
        </List>
      </Collapse>

      {/* Single Tabs */}
      <ListItemButton
        sx={singleTabStyle("damaged_parts")}
        onClick={() => setActiveTab("damaged_parts")}
      >
        <ListItemIcon><Warning /></ListItemIcon>
        <ListItemText primary="Damaged Parts" />
      </ListItemButton>

      <ListItemButton
        sx={singleTabStyle("register")}
        onClick={() => setActiveTab("register")}
      >
        <ListItemIcon><People /></ListItemIcon>
        <ListItemText primary="Register User" />
      </ListItemButton>

      {/* UTILITIES */}
      <ListItemButton
        sx={mainTabStyle(expandedTab === "utility")}
        onClick={() =>
          setExpandedTab(expandedTab === "utility" ? "" : "utility")
        }
      >
        <ListItemIcon><Settings /></ListItemIcon>
        <ListItemText primary="Utilities" />
        {expandedTab === "utility" ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>

      <Collapse in={expandedTab === "utility"}>
        <List component="div" disablePadding>
          <ListItemButton
            sx={nestedTabStyle("edit_customer")}
            onClick={() => setActiveTab("edit_customer")}
          >
            <ListItemText primary="Edit Customer" />
          </ListItemButton>

          <ListItemButton
            sx={nestedTabStyle("whatsapp_messages")}
            onClick={() => setActiveTab("whatsapp_messages")}
          >
            <ListItemText primary="WhatsApp Msg" />
          </ListItemButton>
        </List>
      </Collapse>

      <ListItemButton
        sx={singleTabStyle("profile")}
        onClick={() => setActiveTab("profile")}
      >
        <ListItemIcon><Person /></ListItemIcon>
        <ListItemText primary="My Profile" />
      </ListItemButton>

      <Divider />

      <ListItemButton onClick={logout}>
        <ListItemIcon><Logout color="error" /></ListItemIcon>
        <ListItemText
          primary="Logout"
          primaryTypographyProps={{ fontWeight: "bold" }}
        />
      </ListItemButton>

    </List>
  </Box>
);
  // ---------------- Content Renderer ----------------

  const renderContent = () => {

    switch(activeTab){

      case "createJob": return <JobForm />;
      case "myJobs": return <MyJobs />;
      case "allJobs": return <AllJobs />;
      case "bill": return <MakeBill onClose={() => setActiveTab("dashboard")}/>;
      case "invoices": return <BillsModal onClose={() => setActiveTab("dashboard")}/>;
      case "grn": return <GRN onClose={() => setActiveTab("dashboard")}/>;
      case "view_grn": return <ViewGRN onClose={() => setActiveTab("dashboard")} />;
      case "stock": return <StockModal onClose={() => setActiveTab("dashboard")}/>;
      case "manual_stock": return <ManualStock onClose={() => setActiveTab("dashboard")}/>;
      case "bill_edit": return <BillEdit onClose={() => setActiveTab("dashboard")} />;
      case "damaged_parts": return <DamagedParts onClose={() => setActiveTab("dashboard")}/>;
      case "register": return <Register />;
      case "profile": return <EditProfile />;
      case "advanced_payments": return <AdvancedPayments onClose={() => setActiveTab("dashboard")} />;
      case "cash_handeling": return <CashHandeling onClose={() => setActiveTab("dashboard")}/>;
      case "warranty_bill": return <MakeWarrantyBill onClose={() => setActiveTab("dashboard")}/>;
      case "walking_customer_bill": return <MakeBillForWalkingCustomer onClose={() => setActiveTab("dashboard")}/>;
      case "edit_customer": return <CustomerEdit onClose={() => setActiveTab("dashboard")}/>;
      case "whatsapp_messages": return <ViewWhatsAppMsg onClose={() => setActiveTab("dashboard")} />;


      default:
        return (
<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
  {/* Welcome Card */}
  <Box
    sx={{
      p: 3,
      bgcolor: "#1976d2",
      color: "white",
      borderRadius: 2,
      boxShadow: 3,
      display: "flex",
      flexDirection: { xs: "column", sm: "row" },
      alignItems: "center",
      justifyContent: "space-between",
      gap: 2
    }}
  >
    <Box>
      <Typography variant="h4" fontWeight="bold">
        Welcome, {user?.username} Web System
      </Typography>

    </Box>
  </Box>

  {/* Notifications Card */}
  <Box
    sx={{
      p: 3,
      bgcolor: "#ffffff",
      borderRadius: 2,
      boxShadow: 1,
    }}
  >
    <Typography variant="h6" fontWeight="bold" gutterBottom>
       Low Stock Notifications
    </Typography>
    <LowItemNotifications />
  </Box>
</Box>
        )
    }
  };

  return (
    <Box sx={{ display: "flex" }}>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box"
          }
        }}
      >
        {drawer}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 0 }}>
        {renderContent()}
      </Box>

      {/* Trade Item Modal */}
      <OnlyTradeItem
        open={tradeItemOpen}
        onClose={() => setTradeItemOpen(false)}
      />

      {/* PIN Dialog */}
      <Dialog open={pinDialog}>
        <DialogTitle>Enter Security PIN</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="password"
            label="PIN"
            value={pinValue}
            onChange={(e)=>setPinValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setPinDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={verifyPin}>Verify</Button>
        </DialogActions>
      </Dialog>

      {/* Auto Refresh Dialog */}
      <Dialog open={refreshOpen} maxWidth="sm" fullWidth>
          <AutoRefresh onClose={()=>setRefreshOpen(false)} />
      </Dialog>

      <Dialog open={billEditPinDialog}>
  <DialogTitle>Enter Security PIN to Edit Bill</DialogTitle>
  <DialogContent>
    <TextField
      fullWidth
      type="password"
      label="PIN"
      value={pinValue}
      onChange={(e) => setPinValue(e.target.value)}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => {
      setBillEditPinDialog(false);
      setBillEditPending(false);
      setPinValue("");
    }}>Cancel</Button>
    <Button
      variant="contained"
      onClick={() => {
        if (pinValue === "2883") {
          setActiveTab("bill_edit");
          setBillEditPinDialog(false);
          setPinValue("");
          setBillEditPending(false);
        } else {
          alert("Incorrect PIN");
        }
      }}
    >
      Verify
    </Button>
  </DialogActions>
</Dialog>


    </Box>
  );
}
