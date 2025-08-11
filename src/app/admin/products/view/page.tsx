"use client";

import React, { useState, useTransition } from "react";
import Sidebar from "@/app/admin/portal/sidebar";
import {
    Box,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress, CardActions, Button,
} from "@mui/material";
import {deleteProduct, viewProducts} from "./action"; // import server action
import SignedImage from '../../../../component/s3-image';
const drawerWidth = 240;

type Product = {
    id: number;
    name: string;
    category?: string;
    price: number;
    imageUrl: string;
};

export default function ProductsViewPage() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [open, setOpen] = useState(false);


    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    const fetchProducts = () => {
        startTransition(async () => {
            try {
                const data = await viewProducts(); // Call the server action here
                setProducts(data);
                setError(null);
            } catch (err) {
                setError("Failed to load products");
            }
        });
    };

    const handleDelete = (id: number) => {
        startTransition(async ()=> {
            try {
                await deleteProduct(id);

            } catch (err) {
                setError("Failed to delete product");
            }
            fetchProducts();
        })
    }

    React.useEffect(() => {
        fetchProducts();
    }, []);

    // Filter products client-side
    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category ? product.category === category : true;
        return matchesSearch && matchesCategory;
    });

    const handleOpenDialog = (id) => {
        setSelectedProductId(id);
        setOpen(true);
    };

    const handleCloseDialog = () => {
        setOpen(false);
        setSelectedProductId(null);
    };

    const confirmDelete = () => {
        if (selectedProductId) {
            handleDelete(selectedProductId);
        }
        handleCloseDialog();
    };

    return (
        <><Box sx={{display: "flex"}}>
            <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle}/>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: {sm: `calc(100% - ${drawerWidth}px)`},
                    ml: {sm: `${drawerWidth}px`},
                    mt: 8,
                }}
            >
                <Box sx={{display: "flex", gap: 2, mb: 4}}>
                    <TextField
                        label="Search Products"
                        variant="outlined"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{flex: 1}}/>
                    <FormControl sx={{minWidth: 150}}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            label="Category"
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="Electronics">Electronics</MenuItem>
                            <MenuItem value="Clothing">Clothing</MenuItem>
                            <MenuItem value="Footwear">Footwear</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {isPending ? (
                    <CircularProgress/>
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : (
                    <Grid container spacing={3}>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                                    <Card>
                                        <SignedImage fileKey={product.imageUrl}/>
                                        <CardContent>
                                            <Typography variant="h6">{product.name}</Typography>
                                            {product.category && (
                                                <Typography variant="body2" color="text.secondary">
                                                    {product.category}
                                                </Typography>
                                            )}
                                            <Typography variant="subtitle1">${product.price}</Typography>
                                        </CardContent>
                                        <CardActions>
                                            <Button
                                                size="small"
                                                color="error"
                                                onClick={() => handleOpenDialog(product.id)}
                                            >
                                                Delete
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))
                        ) : (
                            <Typography>No products found.</Typography>
                        )}
                    </Grid>

                )}
            </Box>
        </Box><Dialog open={open} onClose={handleCloseDialog}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
                <Typography>Are you sure you want to delete this product?</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseDialog} color="primary">
                    Cancel
                </Button>
                <Button onClick={confirmDelete} color="error">
                    Delete
                </Button>
            </DialogActions>
        </Dialog></>
    );
}
