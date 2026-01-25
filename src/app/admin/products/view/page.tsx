"use client";

import React, { useState, useTransition, useEffect } from "react";
import Sidebar from "@/app/admin/portal/sidebar";
import {
    Box, TextField, Select, MenuItem, InputLabel, FormControl,
    Card, CardContent, Typography, Grid, Dialog, DialogTitle,
    DialogContent, DialogActions, CircularProgress, CardActions, Button,
    Chip, DialogContentText, Divider, Alert,
    Snackbar
} from "@mui/material";
import { deleteProduct, viewProducts, createOrderAction,sendLinkByEmail } from "./action";
import SignedImage from '../../../../component/s3-image';

const drawerWidth = 240;
const cartWidth = 300;

// Updated Type to handle relational data from Prisma
type Product = {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    category?: {
        name: string;
    } | null;
};

export default function ProductsViewPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<Product[]>([]);
    const [isPending, startTransition] = useTransition();

    // UI States
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState(""); // Renamed for clarity
    const [mobileOpen, setMobileOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [linkData, setLinkData] = useState<{open: boolean, url: string}>({open: false, url: ""});
    const [email, setEmail] = useState("");
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);

    const handleSendEmail = () => {
        if (!email || !linkData.url) return;

        startTransition(async () => {
            const result = await sendLinkByEmail(email, linkData.url);
            setSnackbar({
                open: true,
                message: result.message,
                severity: result.success ? 'success' : 'error',
            });
            if (result.success) {
                // Close the dialog and reset the email field on success
                setLinkData({ open: false, url: "" });
                setEmail("");
            }
        });
    };


    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    const fetchProducts = () => {
        startTransition(async () => {
            const data = await viewProducts();
            setProducts(data as Product[]);
        });
    };

    useEffect(() => { fetchProducts(); }, []);

    // Cart Logic
    const addToCart = (product: Product) => setCart([...cart, product]);
    const removeFromCart = (id: string) => {
        const index = cart.findIndex(item => item.id === id);
        if (index > -1) {
            const newCart = [...cart];
            newCart.splice(index, 1);
            setCart(newCart);
        }
    };

    const handleGenerateLink = async () => {
        const result = await createOrderAction(cart);
        if (result.success) {
            const url = `${window.location.origin}/checkout/${result.orderId}`;
            setLinkData({ open: true, url });
            setCart([]); // Clear cart after success
        } else {
            alert("Error creating order");
        }
    };

    // Extract unique categories from loaded products for the dropdown
    const uniqueCategories = Array.from(
        new Set(products.map((p) => p.category?.name).filter(Boolean))
    );

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) &&
        (categoryFilter ? p.category?.name === categoryFilter : true)
    );

    return (
        <Box sx={{ display: "flex", bgcolor: "#f5f5f5", minHeight: "100vh" }}>
            <Sidebar
                mobileOpen={mobileOpen}
                handleDrawerToggle={handleDrawerToggle}
                cart={cart}
                onRemoveFromCart={removeFromCart}
                onCreateOrder={handleGenerateLink}
            />

            <Box component="main" sx={{
                flexGrow: 1,
                p: 3,
                mt: 8,
                ml: { sm: `${drawerWidth}px` },
                mr: { md: `${cartWidth}px` },
                width: { sm: `calc(100% - ${drawerWidth}px - ${cartWidth}px)` }
            }}>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>Product Catalog</Typography>

                {/* Search & Filter Bar */}
                <Box sx={{ display: "flex", gap: 2, mb: 4, bgcolor: "white", p: 2, borderRadius: 2, boxShadow: 1 }}>
                    <TextField
                        fullWidth
                        label="Search by name..."
                        variant="outlined"
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <FormControl sx={{ minWidth: 200 }} size="small">
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            label="Category"
                        >
                            <MenuItem value="">All Categories</MenuItem>
                            {uniqueCategories.map((name) => (
                                <MenuItem key={name} value={name}>{name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {isPending ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>
                ) : (
                    <Grid container spacing={3}>
                        {filteredProducts.map((product) => (
                            <Grid item xs={12} sm={6} lg={4} key={product.id}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden', transition: '0.3s', '&:hover': { boxShadow: 6 } }}>
                                    <SignedImage fileKey={product.imageUrl} />
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                                                {product.name}
                                            </Typography>
                                            <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold' }}>
                                                ${product.price.toFixed(2)}
                                            </Typography>
                                        </Box>

                                        {/* Category Badge */}
                                        <Chip
                                            label={product.category?.name || "N/A"}
                                            size="small"
                                            color={product.category ? "primary" : "default"}
                                            variant="outlined"
                                            sx={{ fontSize: '0.75rem' }}
                                        />
                                    </CardContent>
                                    <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={() => addToCart(product)}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            Add to Order
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => setDeleteId(product.id)}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            Delete
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            {/* Success Link Modal */}
            <Dialog open={linkData.open} onClose={() => setLinkData({open: false, url: ""})} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 'bold' }}>Order Link Ready</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Share this unique checkout link with your customer:
                    </DialogContentText>
                    <Box sx={{ p: 2, bgcolor: '#f0f7ff', border: '1px dashed #1976d2', borderRadius: 2, wordBreak: 'break-all', mt: 2, mb: 3 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{linkData.url}</Typography>
                    </Box>

                    <Divider sx={{ mb: 2 }}>OR</Divider>

                    <DialogContentText>
                        Send the link directly to their email.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="email"
                        label="Customer Email Address"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ p: '0 24px 24px' }}>
                    <Button onClick={() => setLinkData({open: false, url: ""})}>Close</Button>
                    <Button variant="outlined" onClick={() => {
                        navigator.clipboard.writeText(linkData.url);
                        setSnackbar({ open: true, message: 'Copied to clipboard!', severity: 'success' });
                    }}>Copy Link</Button>
                    <Button
                        variant="contained"
                        onClick={handleSendEmail}
                        disabled={isPending || !email}
                    >
                        {isPending ? "Sending..." : "Email Link"}
                    </Button>
                </DialogActions>
            </Dialog>
            {snackbar && (
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert onClose={() => setSnackbar(null)} severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            )}


            {/* Delete Confirmation */}
            <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
                <DialogTitle>Permanent Delete?</DialogTitle>
                <DialogContent>
                    <Typography>This action cannot be undone. Are you sure you want to delete this product?</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteId(null)}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={async () => {
                        if (deleteId) {
                            await deleteProduct(deleteId); // Passed as string
                            setDeleteId(null);
                            fetchProducts();
                        }
                    }}>Confirm Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}