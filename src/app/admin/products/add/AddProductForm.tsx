"use client";

import { useActionState } from "react";
import { saveProduct } from "./action";
import {
    TextField,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Box,
    Alert,
    Typography // <--- Add this line
} from "@mui/material";

export default function AddProductForm({ categories = [] }: { categories: any[] }) {
    // 2. Update the hook name. The arguments (action, initialState) stay the same.
    const [state, formAction, isPending] = useActionState(saveProduct, null);

    return (
        <Box component="form" action={formAction} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
                name="name"
                label="Product Name"
                fullWidth
                required
                defaultValue={state?.inputs?.name || ""}
            />

            <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                    name="categoryId"
                    label="Category"
                    defaultValue={state?.inputs?.categoryId || ""}
                >
                    {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                            {cat.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField
                name="price"
                label="Price"
                type="number"
                fullWidth
                required
                defaultValue={state?.inputs?.price || ""}
            />

            <TextField
                name="description"
                label="Description"
                multiline
                rows={3}
                fullWidth
                defaultValue={state?.inputs?.description || ""}
            />

            <Box>
                <Typography variant="caption" display="block" gutterBottom>
                    Product Image
                </Typography>
                <input type="file" name="imageUrl" accept="image/*" required />
            </Box>

            {/* 3. isPending is a new 3rd value returned by useActionState for loading states */}
            <Button
                type="submit"
                variant="contained"
                disabled={isPending}
            >
                {isPending ? "Saving..." : "Save Product"}
            </Button>

            {state?.message && (
                <Alert severity={state.success ? "success" : "error"} sx={{ mt: 2 }}>
                    {state.message}
                </Alert>
            )}
        </Box>
    );
}