"use client";
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
    FormControlLabel,
    Switch,
} from "@mui/material";
import Sidebar from "@/app/admin/portal/sidebar";
import { useState } from "react";
import { useRouter } from "next/navigation";

const drawerWidth = 240;

export default function AddCategoryPage() {
    const [name, setName] = useState("");
    const [hasPromo, setHasPromo] = useState(false);
    const [minQuantity, setMinQuantity] = useState<number | undefined>();
    const [discountRate, setDiscountRate] = useState<number | undefined>();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        if (!name) {
            setError("Category name is required.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    hasPromo,
                    minQuantity,
                    discountRate,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Something went wrong");
            }

            router.push("/admin/categories");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: "flex" }}>
            <Sidebar mobileOpen={false} />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    mt: 8,
                    ml: { sm: `${drawerWidth}px` },
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Box sx={{ width: '100%', maxWidth: '800px' }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
                        Add New Category
                    </Typography>
                </Box>

                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3, width: '100%', maxWidth: '800px' }}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Category Name"
                                    variant="outlined"
                                    fullWidth
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={hasPromo}
                                            onChange={(e) => setHasPromo(e.target.checked)}
                                        />
                                    }
                                    label="Has Promotion"
                                />
                            </Grid>
                            {hasPromo && (
                                <>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Minimum Quantity"
                                            type="number"
                                            variant="outlined"
                                            fullWidth
                                            value={minQuantity || ""}
                                            onChange={(e) =>
                                                setMinQuantity(parseInt(e.target.value))
                                            }
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Discount Rate (e.g., 0.1 for 10%)"
                                            type="number"
                                            variant="outlined"
                                            fullWidth
                                            value={discountRate || ""}
                                            onChange={(e) =>
                                                setDiscountRate(parseFloat(e.target.value))
                                            }
                                        />
                                    </Grid>
                                </>
                            )}
                            <Grid item xs={12}>
                                {error && (
                                    <Typography color="error" sx={{ mb: 2 }}>
                                        {error}
                                    </Typography>
                                )}
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={loading}
                                >
                                    {loading ? "Adding..." : "Add Category"}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Box>
        </Box>
    );
}