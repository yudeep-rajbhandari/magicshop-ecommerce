"use client";

import React, { useState } from "react";
import {
    Box, TextField, Button, Typography, CircularProgress,
    Grid, Paper, InputAdornment
} from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import { submitPaymentProof } from "./action";
import CustomerOrderStatus from "@/app/checkout/[orderId]/PaymentPageClient";

export default function PaymentForm({ order }: { order: any }) {
    // LOG 1: Check if the component is rendering at all
    // console.log("PaymentForm component rendering. Received orderId:", order.id);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        street: "",
        city: "",
        nearestLandmark: ""
    });
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);




    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        const { name, phone, street, city, nearestLandmark, email } = formData;
        if (!name || !phone || !street || !city || !nearestLandmark || !email || !file) {
            return alert("Please complete all fields and upload the screenshot");
        }

        setLoading(true);

        // Combine 3 address lines into one
        const combinedAddress = `${street}, ${city}, ${nearestLandmark}`;

        const data = new FormData();
        data.append("name", name);
        data.append("phone", phone);
        data.append("address", combinedAddress);
        data.append("email", email);
        data.append("file", file);
        data.append("orderId", order.id);
        console.log("Submitting payment proof:", data);
        const result = await submitPaymentProof(data);
        if (result.success) setDone(true);
        setLoading(false);
    };



    // ... handleChange and other functions remain the same
    const isAlreadySubmitted = order.status !== 'PENDING';
    // console.log("isAlreadySubmitted:", order);

    if (isAlreadySubmitted || done) {
        return (
           <CustomerOrderStatus currentStatus={order.status}/>
        );
    }
    else{
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Section 1: Personal Info */}
                <Box>
                    <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 'bold', textTransform: 'uppercase' }}>
                        1. Personal Information
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={8}>
                            <TextField fullWidth label="Full Name" name="name" variant="filled" onChange={handleChange}
                                       InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="Phone" name="phone" type="number" variant="filled" onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Email Address" name="email" type="email" variant="filled" onChange={handleChange}
                                       InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }} />
                        </Grid>
                    </Grid>
                </Box>

                {/* Section 2: Address (3 Lines UI) */}
                <Box>
                    <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 'bold', textTransform: 'uppercase' }}>
                        2. Shipping Address
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Street Address" name="street" variant="filled" onChange={handleChange}
                                       InputProps={{ startAdornment: <InputAdornment position="start"><HomeIcon /></InputAdornment> }} />
                        </Grid>
                        <Grid item xs={12} sm={7}>
                            <TextField fullWidth label="City / State" name="city" variant="filled" onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={5}>
                            <TextField fullWidth label="Nearest LandMark" name="nearestLandmark" variant="filled" onChange={handleChange} />
                        </Grid>
                    </Grid>
                </Box>

                {/* Section 3: Payment */}
                <Box>
                    <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 'bold', textTransform: 'uppercase' }}>
                        3. Proof of Payment
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderStyle: 'dashed', bgcolor: '#fafafa' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Please upload a screenshot of your PayPal confirmation.
                        </Typography>
                        <Button
                            variant="contained"
                            component="label"
                            color="inherit"
                            startIcon={<CloudUploadIcon />}
                            sx={{ bgcolor: 'white' }}
                        >
                            {file ? file.name : "Select Screenshot"}
                            <input type="file" hidden accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                        </Button>
                    </Paper>
                </Box>

                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{ py: 2, fontWeight: 'bold', fontSize: '1.1rem', borderRadius: 2 }}
                >
                    {loading ? <CircularProgress size={26} color="inherit" /> : "Complete Order"}
                </Button>
            </Box>
        )
    }




}