'use client';

import {AppBar, Toolbar, IconButton, Typography, Button, Box, Skeleton} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import {useEffect, useState} from 'react';
import Link from 'next/link';
import LoginLogoutButton from "@/app/admin/SignInButton";
import {useSession} from "next-auth/react";

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { data: session, status } = useSession();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isLoggedIn = status === "authenticated";
    const isLoading = status === "loading";

    // ... rest of your code

    // Important: Prevent the nav links from flashing incorrectly
    if (!mounted) return null;
    // const navItems = ['Home', 'About','Portal'];

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // const handleAuthClick = async () => {
    //     console.log('session', session);
    //
    //     if(isLoggedIn){
    //         await signOut({ redirect: true });
    //     }
    //     else {
    //         await signIn(undefined, { redirect: true });
    //
    //     }
    // };
    //
    // const drawer = (
    //     <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
    //         <Typography variant="h6" sx={{ my: 2 }}>MyApp</Typography>
    //         <List>
    //             {[...navItems, isLoggedIn ? 'Logout' : 'Login'].map((item) => (
    //                 <ListItem key={item} disablePadding>
    //                     <ListItem button onClick={() => item === 'Login' || item === 'Logout' ? handleAuthClick() : null}>
    //                         <ListItemText>
    //                             <Link href={item === 'Home' ? '/' : `/admin/${item.toLowerCase()}`
    //                             }>{item}</Link>
    //                         </ListItemText>
    //                     </ListItem>
    //                 </ListItem>
    //             ))}
    //         </List>
    //     </Box>
    // );

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>MagicShop</Typography>
                    {!mounted || isLoading ? (
                        <Skeleton variant="text" width={60} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                    ) : (
                        isLoggedIn && (
                            <Link href="/admin/portal" passHref>
                                <Button sx={{ color: '#fff' }}>Portal</Button>
                            </Link>
                        )
                    )}

                    <LoginLogoutButton />
                </Toolbar>
            </AppBar>
            {/*<Drawer*/}
            {/*    anchor="left"*/}
            {/*    open={mobileOpen}*/}
            {/*    onClose={handleDrawerToggle}*/}
            {/*    sx={{*/}
            {/*        display: { xs: 'block', sm: 'none' },*/}
            {/*        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },*/}
            {/*    }}*/}
            {/*>*/}
            {/*    {drawer}*/}
            {/*</Drawer>*/}
        </Box>
    );
};

export default Navbar;
