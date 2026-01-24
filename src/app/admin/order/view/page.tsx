import { prisma } from "@/lib/prisma";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Button
} from "@mui/material";
import Sidebar from "@/app/admin/portal/sidebar";
import Link from "next/link";

const drawerWidth = 240;

export default async function AdminOrdersPage() {
    // Fetch all orders from MongoDB
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { items: true }
            }
        }
    });

    return (
        <Box sx={{ display: "flex" }}>
            {/* Sidebar with only required props */}
            <Sidebar mobileOpen={false} />

            <Box component="main" sx={{
                flexGrow: 1,
                p: 3,
                mt: 8,
                ml: { sm: `${drawerWidth}px` },
                width: { sm: `calc(100% - ${drawerWidth}px)` }
            }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Customer Orders
                </Typography>

                <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                            <TableRow>
                                <TableCell><strong>Customer Details</strong></TableCell>
                                <TableCell><strong>Date</strong></TableCell>
                                <TableCell><strong>Items</strong></TableCell>
                                <TableCell><strong>Total</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                                <TableCell align="right"><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Typography sx={{ py: 3 }}>No orders found.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order) => (
                                    <TableRow key={order.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                {order.clientName || "Pending Details"}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {order.clientEmail || "No email provided"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>{order._count.items} Products</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>
                                            ${order.totalAmount.toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={order.status}
                                                size="small"
                                                color={
                                                    order.status === "PAID" ? "success" :
                                                        order.status === "SUBMITTED" ? "warning" :
                                                            "default"
                                                }
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                component={Link}
                                                href={`/admin/order/view/${order.id}`}
                                                variant="outlined"
                                                size="small"
                                            >
                                                View Proof
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
}