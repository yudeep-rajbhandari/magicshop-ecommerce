// src/app/admin/categories/page.tsx
"use client";

import { Box, TextField, Button, FormControlLabel, Checkbox, Typography, Paper } from "@mui/material";
import { useState } from "react";
import { createCategory } from "./action";

export default function AddCategoryPage() {
    const [showPromo, setShowPromo] = useState(false);

    return (
        <Box sx={{ p: 4, maxWidth: 500 }}>
            <Typography variant="h5" gutterBottom>Add New Category</Typography>
            <Paper component="form" action={createCategory} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField name="name" label="Category Name" fullWidth required />

                <FormControlLabel
                    control={<Checkbox name="hasPromo" checked={showPromo} onChange={(e) => setShowPromo(e.target.checked)} />}
                    label="Enable Automatic Promo"
                />

                {showPromo && (
                    <>
                        <TextField
                            name="minQuantity"
                            label="Minimum Items for Discount"
                            type="number"
                            defaultValue={2}
                        />
                        <TextField
                            name="discountRate"
                            label="Discount Percentage (e.g. 10)"
                            type="number"
                            inputProps={{ step: "0.1" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                            Example: 10 = 10% discount when threshold is met.
                        </Typography>
                    </>
                )}

                <Button type="submit" variant="contained" color="primary">Save Category</Button>
            </Paper>
        </Box>
    );
}