'use client';

import React, { useState } from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Toolbar,
    Box,
    Collapse,
} from '@mui/material';
import Link from 'next/link';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const drawerWidth = 240;

const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    {
        label: 'Products',
        children: [
            { label: 'Add', href: '/products/add' },
            { label: 'View', href: '/products/view' },
        ],
    },
    {
        label: 'Order',
        children: [
            { label: 'Add', href: '/order/add' },
            { label: 'View', href: '/order/view' },
        ],
    },
];

type SidebarProps = {
    mobileOpen: boolean;
    handleDrawerToggle: () => void;
};

export default function Sidebar({ mobileOpen, handleDrawerToggle }: SidebarProps) {
    const [openProducts, setOpenProducts] = useState(false);

    const handleProductsClick = () => {
        setOpenProducts((prev) => !prev);
    };

    const drawer = (
        <Box sx={{ textAlign: 'center' }}>
            <Toolbar />
            <List>
                {navItems.map((item) =>
                    item.children ? (
                        <React.Fragment key={item.label}>
                            {/* Parent item (Products) */}
                            <ListItem disablePadding>
                                <ListItemButton onClick={handleProductsClick}>
                                    <ListItemText primary={item.label} />
                                    {openProducts ? <ExpandLess /> : <ExpandMore />}
                                </ListItemButton>
                            </ListItem>
                            {/* Collapsible sub-items */}
                            <Collapse in={openProducts} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {item.children.map((subItem) => (
                                        <ListItem key={subItem.label} disablePadding>
                                            <ListItemButton
                                                component={Link}
                                                href={`/admin/${subItem.href}`}
                                                sx={{ pl: 4 }}
                                                onClick={handleDrawerToggle} // closes drawer on mobile
                                            >
                                                <ListItemText primary={subItem.label} />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            </Collapse>
                        </React.Fragment>
                    ) : (
                        <ListItem key={item.label} disablePadding>
                            <ListItemButton
                                component={Link}
                                href={item.href}
                                onClick={handleDrawerToggle}
                            >
                                <ListItemText primary={item.label} />
                            </ListItemButton>
                        </ListItem>
                    )
                )}
            </List>
        </Box>
    );

    return (
        <>
            {/* Mobile temporary drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                {drawer}
            </Drawer>

            {/* Desktop permanent drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
                open
            >
                {drawer}
            </Drawer>
        </>
    );
}
