'use client';

import { AppBar, Toolbar, IconButton, Typography, Button, Box, Drawer, List, ListItem, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import {redirect} from "next/navigation";

const Navbar = () => {
    const { data: session } = useSession();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isLoggedIn = !!session?.user;
    const navItems = ['Home', 'About', 'Products'];

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleAuthClick = () => {
        console.log('session', session);

        if(isLoggedIn){
            signOut()
        }
        else {
            redirect('/login')
        }
    };

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ my: 2 }}>MyApp</Typography>
            <List>
                {[...navItems, isLoggedIn ? 'Logout' : 'Login'].map((item) => (
                    <ListItem key={item} disablePadding>
                        <ListItem button onClick={() => item === 'Login' || item === 'Logout' ? handleAuthClick() : null}>
                            <ListItemText>
                                <Link href={item === 'Home' ? '/' : `/admin/${item.toLowerCase()}`
                                }>{item}</Link>
                            </ListItemText>
                        </ListItem>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>MagicShop</Typography>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        {navItems.map((item) => (
                            <Button key={item} sx={{ color: '#fff' }} component={Link} href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}>
                                {item}
                            </Button>
                        ))}
                        <Button sx={{ color: '#fff' }} onClick={handleAuthClick}>
                            {isLoggedIn ? 'Logout' : 'Login'}
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
            <Drawer
                anchor="left"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
                }}
            >
                {drawer}
            </Drawer>
        </Box>
    );
};

export default Navbar;
