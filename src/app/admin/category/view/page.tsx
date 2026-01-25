import { prisma } from "@/lib/prisma";
import { Box, Typography, Paper } from "@mui/material";
import Sidebar from "@/app/admin/portal/sidebar";
import CategoryClientPage from "./CategoryClientPage";
import { Suspense } from "react";

const drawerWidth = 240;
export const dynamic = 'force-dynamic';

export default async function ViewCategoriesPage() {
    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
    });
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
                }}
            >
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Manage Categories & Promotions
                </Typography>
                <Paper sx={{ boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
                    <Suspense fallback={<Typography sx={{ p: 3 }}>Loading categories...</Typography>}>
                        <CategoryClientPage categories={categories} />
                    </Suspense>
                </Paper>
            </Box>
        </Box>
    );
}