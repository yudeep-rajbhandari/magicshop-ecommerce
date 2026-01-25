'use client';

import React, { useState, useMemo } from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Toolbar,
    Box,
    Collapse,
    Typography,
    Divider,
    Button,
    IconButton,
    Chip
} from '@mui/material';
import Link from 'next/link';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const drawerWidth = 240;
const cartWidth = 300;

// Updated to include Category Promo Data
type Product = {
    id: string;
    name: string;
    price: number;
    // We need these fields to calculate discounts
    categoryId?: string;
    category?: {
        name: string;
        hasPromo: boolean;
        minQuantity: number | null;
        discountRate: number | null;
    } | null;
};

type SidebarProps = {
    mobileOpen: boolean;
    handleDrawerToggle?: () => void;
    cart?: Product[];
    onRemoveFromCart?: (id: string) => void;
    onCreateOrder?: () => void;
};

const navItems = [
    { label: 'Home', href: '/' },
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
            { label: 'View All', href: '/order/view' },
        ],
    },
    {
        label: 'Category',
        children: [
            { label: 'Add', href: '/category/add' },
            { label: 'View All', href: '/category/view' }
        ],
    },
];

export default function Sidebar({
                                    mobileOpen,
                                    handleDrawerToggle,
                                    cart = [],
                                    onRemoveFromCart,
                                    onCreateOrder,
                                }: SidebarProps) {
    const [openProducts, setOpenProducts] = useState(true);
    const [openOrders, setOpenOrders] = useState(true);

    // --- Discount Calculation Logic ---
    const { subtotal, totalDiscount, finalTotal } = useMemo(() => {
        // 1. Count how many items of each category are in the cart
        const categoryCounts: Record<string, number> = {};
        cart.forEach((item) => {
            // Use optional chaining just in case categoryId is missing
            const catId = item.category?.name || item.categoryId || "unknown";
            categoryCounts[catId] = (categoryCounts[catId] || 0) + 1;
        });

        let sub = 0;
        let disc = 0;

        // 2. Iterate and apply rules
        cart.forEach((item) => {
            sub += item.price;

            // Check if this specific item qualifies for a promo
            const promo = item.category;
            const catId = item.category?.name || item.categoryId || "unknown";

            if (
                promo?.hasPromo &&
                promo.minQuantity &&
                promo.discountRate &&
                categoryCounts[catId] >= promo.minQuantity
            ) {
                disc += item.price * promo.discountRate;
            }
        });

        return { subtotal: sub, totalDiscount: disc, finalTotal: sub - disc };
    }, [cart]);

    const leftDrawer = (
        <Box sx={{ textAlign: 'center' }}>
            <Toolbar>
                <Typography variant="h6" sx={{ my: 2, fontWeight: 'bold' }}>
                    ADMIN PORTAL
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {navItems.map((item) => (
                    <React.Fragment key={item.label}>
                        <ListItem disablePadding>
                            <ListItemButton
                                onClick={() => {
                                    if (item.label === 'Products') setOpenProducts(!openProducts);
                                    if (item.label === 'Order') setOpenOrders(!openOrders);
                                }}
                                component={item.children ? 'div' : Link}
                                href={item.href || '#'}
                            >
                                <ListItemText primary={item.label} />
                                {item.children ? (
                                    (item.label === 'Products' ? openProducts : openOrders) ? <ExpandLess /> : <ExpandMore />
                                ) : null}
                            </ListItemButton>
                        </ListItem>
                        {item.children && (
                            <Collapse
                                in={item.label === 'Products' ? openProducts : openOrders}
                                timeout="auto"
                                unmountOnExit
                            >
                                <List component="div" disablePadding>
                                    {item.children.map((subItem) => (
                                        <ListItem key={subItem.label} disablePadding>
                                            <ListItemButton
                                                component={Link}
                                                href={`/admin/${subItem.href}`}
                                                sx={{ pl: 4 }}
                                                onClick={() => handleDrawerToggle?.()}
                                            >
                                                <ListItemText primary={subItem.label} />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            </Collapse>
                        )}
                    </React.Fragment>
                ))}
            </List>
        </Box>
    );

    const rightDrawer = (
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Toolbar />
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShoppingCartIcon /> Draft Order
            </Typography>
            <Divider />

            {/* Cart Items List */}
            <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
                {cart.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
                        No products added.
                    </Typography>
                ) : (
                    cart.map((item, index) => (
                        <ListItem
                            key={`${item.id}-${index}`}
                            disableGutters
                            secondaryAction={
                                <IconButton edge="end" color="error" onClick={() => onRemoveFromCart?.(item.id)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            }
                        >
                            <ListItemText
                                primary={
                                    <Box component="span" sx={{ display: 'block', fontWeight: 500 }}>
                                        {item.name}
                                    </Box>
                                }
                                secondary={
                                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <span>${item.price.toFixed(2)}</span>
                                        {/* Optional: Tiny badge if this item category is 'active' promo */}
                                        {item.category?.hasPromo && (
                                            <Chip label="%" size="small" color="success" variant="outlined" sx={{ height: 16, fontSize: '0.6rem' }} />
                                        )}
                                    </Box>
                                }
                            />
                        </ListItem>
                    ))
                )}
            </List>

            <Divider />

            {/* Totals Section */}
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
                    <Typography variant="body2">${subtotal.toFixed(2)}</Typography>
                </Box>

                {totalDiscount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'green' }}>
                        <Typography variant="body2" fontWeight="bold">Discount:</Typography>
                        <Typography variant="body2" fontWeight="bold">-${totalDiscount.toFixed(2)}</Typography>
                    </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6" color="primary">${finalTotal.toFixed(2)}</Typography>
                </Box>

                <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    disabled={cart.length === 0}
                    onClick={onCreateOrder}
                    sx={{ mt: 2, py: 1.5, fontWeight: 'bold' }}
                >
                    Generate Link
                </Button>
            </Box>
        </Box>
    );

    return (
        <>
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
                {leftDrawer}
            </Drawer>

            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
                open
            >
                {leftDrawer}
            </Drawer>

            {onCreateOrder && (
                <Drawer
                    variant="permanent"
                    anchor="right"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            width: cartWidth,
                            boxSizing: 'border-box',
                            borderLeft: '1px solid rgba(0,0,0,0.12)'
                        },
                    }}
                    open
                >
                    {rightDrawer}
                </Drawer>
            )}
        </>
    );
}