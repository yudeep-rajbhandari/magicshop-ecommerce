'use client';

import React, { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from './sidebar'; // Adjust path as needed

const drawerWidth = 240;

export default function SidebarPage() {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            {/* Sidebar controlled by mobileOpen */}
            <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />

            {/* Main content area, with top margin to clear Navbar height */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    mt: 8, // offset for appbar if any
                }}
            >
                {/* Optionally, show menu icon on mobile to toggle sidebar */}
                <IconButton
                    color="inherit"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ mb: 2, display: { sm: 'none' } }}
                    aria-label="open sidebar"
                >
                    <MenuIcon />
                </IconButton>

                <Typography paragraph>
                    Welcome to Admin Dashboard. Select items from the sidebar to navigate.
                </Typography>
            </Box>
        </Box>
    );
}
