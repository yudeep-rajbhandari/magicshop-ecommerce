'use client';

import React, { useState, useMemo } from "react";
import {
    Box,
    TextField,
    List,
    ListItem,
    ListItemText,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

// Sample inventory items
const inventory = [
    { id: "1", name: "Apple", price: 1.2 },
    { id: "2", name: "Banana", price: 0.8 },
    { id: "3", name: "Orange Juice", price: 3.5 },
    { id: "4", name: "Bread", price: 2.0 },
    { id: "5", name: "Milk", price: 1.5 },
];

export default function PosAddItemScreen() {
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState([]);

    // Filter inventory by search text (case-insensitive)
    const filteredItems = useMemo(() => {
        if (!search.trim()) return [];
        const lower = search.toLowerCase();
        return inventory.filter((item) =>
            item.name.toLowerCase().includes(lower)
        );
    }, [search]);

    const updatePrice = (id, newPrice) => {
        const priceNum = parseFloat(newPrice);
        if (isNaN(priceNum) || priceNum < 0) return; // basic validation
        setCart((prev) =>
            prev.map((ci) => (ci.id === id ? { ...ci, price: priceNum } : ci))
        );
    };

    // Add item to cart or increment quantity if already added
    const addItemToCart = (item) => {
        setCart((prevCart) => {
            const existing = prevCart.find((ci) => ci.id === item.id);
            if (existing) {
                return prevCart.map((ci) =>
                    ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
                );
            } else {
                return [...prevCart, { ...item, quantity: 1 }];
            }
        });
        setSearch(""); // clear search after adding
    };

    // Remove item from cart
    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((ci) => ci.id !== id));
    };

    // Change quantity for an item in cart
    const updateQuantity = (id, quantity) => {
        if (quantity < 1) return;
        setCart((prev) =>
            prev.map((ci) => (ci.id === id ? { ...ci, quantity } : ci))
        );
    };

    // Calculate total
    const total = cart.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );

    return (
        <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
            <Typography variant="h5" mb={2}>
                POS Add Item
            </Typography>

            {/* Search input */}
            <TextField
                label="Search items"
                variant="outlined"
                fullWidth
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="off"
            />

            {/* Search results */}
            {search.trim() && filteredItems.length > 0 && (
                <List
                    sx={{
                        maxHeight: 200,
                        overflowY: "auto",
                        border: "1px solid #ccc",
                        mt: 1,
                    }}
                >
                    {filteredItems.map((item) => (
                        <ListItem
                            key={item.id}
                            onClick={() => addItemToCart(item)}
                            divider
                            sx={{ cursor: "pointer" }}
                        >
                            <ListItemText
                                primary={item.name}
                                secondary={`$${item.price.toFixed(2)}`}
                            />
                        </ListItem>
                    ))}
                </List>
            )}

            {/* Current Transaction (Cart) */}
            <Typography variant="h6" mt={4} mb={1}>
                Current Transaction
            </Typography>

            {cart.length === 0 ? (
                <Typography>No items added yet.</Typography>
            ) : (
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Item</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Qty</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cart.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        size="small"
                                        inputProps={{ min: 0, step: 0.01 }}
                                        value={item.price}
                                        onChange={(e) => updatePrice(item.id, e.target.value)}
                                        sx={{ width: 80 }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        size="small"
                                        inputProps={{ min: 1 }}
                                        value={item.quantity}
                                        onChange={(e) =>
                                            updateQuantity(item.id, parseInt(e.target.value, 10) || 1)
                                        }
                                        sx={{ width: 60 }}
                                    />
                                </TableCell>
                                <TableCell>
                                    ${(item.price * item.quantity).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        color="error"
                                        onClick={() => removeFromCart(item.id)}
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell colSpan={3} align="right">
                                <strong>Total:</strong>
                            </TableCell>
                            <TableCell colSpan={2}>
                                <strong>${total.toFixed(2)}</strong>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            )}
        </Box>
    );
}
