import { prisma } from "@/lib/prisma";
import Sidebar from "@/app/admin/portal/sidebar";
import { Box, Typography, Paper } from "@mui/material";
import AddProductForm from "./AddProductForm";

const drawerWidth = 240;

export default async function AddProductPage() {
    // Fetch categories to populate the dropdown
    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <Box sx={{ display: "flex", bgcolor: "#f9f9f9", minHeight: "100vh" }}>
            <Sidebar mobileOpen={false} />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    mt: 8,
                    ml: { sm: `${drawerWidth}px` },
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                }}
            >
                <Box sx={{ maxWidth: 800, mx: "auto" }}>
                    <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
                        Add New Product
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 4 }}>
                        Create a new listing and assign it to a category for automatic promos.
                    </Typography>

                    <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0px 4px 20px rgba(0,0,0,0.05)" }}>
                        {/* Pass categories to the Client Component form */}
                        <AddProductForm categories={categories} />
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
}