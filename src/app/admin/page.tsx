'use client';

import React from 'react';
import { Container, Typography } from '@mui/material';
import Navbar from "@/app/admin/navbar";

const AdminPage: React.FC = () => {
    return (
        <>
            <Navbar/>
        <Container maxWidth="md" sx={{ mt: 8 }}>
            <Typography variant="h4" align="center">
                This is the admin page
            </Typography>
        </Container>
        </>
    );
};

export default AdminPage;
