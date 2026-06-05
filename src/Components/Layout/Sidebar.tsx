import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Description as DescriptionIcon,
  ListAlt as ListAltIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { NavLink, useLocation } from "react-router-dom";

const drawerWidth = 240;

const navItems = [
  { label: "SOWs", path: "/", icon: <DescriptionIcon /> },
  { label: "Requirements", path: "/requirements", icon: <ListAltIcon /> },
  { label: "Templates", path: "/templates", icon: <AssignmentIcon /> },
];

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const location = useLocation();

  const toggleDrawer = () => setOpen(!open);

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? drawerWidth : 56,
          flexShrink: 0,
          transition: "width 0.3s",
          [`& .MuiDrawer-paper`]: {
            width: open ? drawerWidth : 56,
            boxSizing: "border-box",
            overflowX: "hidden",
            transition: "width 0.3s",
          },
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: open ? "space-between" : "center",
            px: [1],
          }}
        >
          {open && (
            <Typography variant="h6" noWrap component="div">
              Boeing SOW
            </Typography>
          )}
          <IconButton onClick={toggleDrawer}>
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </Toolbar>
        <Divider />
        <List>
          {navItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={NavLink}
                to={item.path}
                selected={location.pathname === item.path}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  "&.active": {
                    backgroundColor: "rgba(25, 118, 210, 0.12)",
                    color: "#1976d2",
                    "& .MuiListItemIcon-root": {
                      color: "#1976d2",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  );
}
