"use client";

import React, { useActionState, useState, useRef, useEffect } from "react";
import { saveProduct } from "./action";
import Sidebar from "@/app/admin/portal/sidebar";
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Divider,
    Snackbar,
    Alert,
} from "@mui/material";

const initialState = {
    success: false,
    message: "",
    inputs: {} as any,
};

export default function ProductsPage() {
    const [state, formAction, pending] = useActionState(saveProduct, initialState);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarSeverity, setSnackbarSeverity] =
        useState<"success" | "error">("success");
    const [snackbarMessage, setSnackbarMessage] = useState("");    const formRef = useRef<HTMLFormElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const drawerWidth = 240;
    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    // Reset form & show snackbar on success
    useEffect(() => {
        if (state.success) {
            if (formRef.current) formRef.current.reset();
            setSelectedFile(null);
            setSnackbarSeverity("success");
            setSnackbarMessage(state.message || "Product added successfully!");
            setSnackbarOpen(true);
        } else if (state.message) {
            setSnackbarSeverity("error");
            setSnackbarMessage(state.message || "Failed to add product.");
            setSnackbarOpen(true);
        }
    }, [state]);

    return (
        <Box sx={{ display: "flex" }}>
            {/* Sidebar */}
            <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    height: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 3,
                }}
            >
                <Card sx={{ maxWidth: 500, width: "100%" }}>
                    <CardContent>
                        <Typography variant="h5" gutterBottom textAlign="center">
                            Add Product
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        <form
                            ref={formRef}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "1rem",
                            }}
                            action={formAction}
                        >
                            <TextField name="name" label="Name" variant="outlined" fullWidth />
                            <TextField
                                name="description"
                                label="Description"
                                variant="outlined"
                                multiline
                                rows={3}
                                fullWidth
                            />
                            <TextField
                                name="price"
                                label="Price"
                                type="number"
                                variant="outlined"
                                fullWidth
                            />
                            <Button
                                variant="outlined"
                                component="label"
                                sx={{ justifyContent: "space-between" }}
                            >
                                {selectedFile ? selectedFile.name : "Upload Image"}
                                <input
                                    name="imageUrl"
                                    type="file"
                                    hidden
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        setSelectedFile(file);
                                    }}
                                />
                            </Button>

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={pending}
                            >
                                {pending ? "Saving..." : "Add Product"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Snackbar for success */}
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={3000}
                    onClose={() => setSnackbarOpen(false)}
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                >
                    <Alert
                        onClose={() => setSnackbarOpen(false)}
                        severity="success"
                        sx={{ width: "100%" }}
                    >
                        Product added successfully!
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
}
