import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
    Box, Typography, Paper, Grid, Divider, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Chip,
} from "@mui/material";
import Sidebar from "@/app/admin/portal/sidebar";
import SignedImage from "@/component/signed-image";
import StatusButtons from "./StatusButtons";

const drawerWidth = 240;

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            items: {
                include: {
                    product: true,
                }
            },
        },
    });

    if (!order) return notFound();

    // --- CALCULATE DISCOUNT BREAKDOWN ---
    const subtotal = order.items.reduce((acc, item) =>
        acc + (item.priceAtPurchase + item.discountApplied) * item.quantity, 0
    );
    const totalDiscount = order.items.reduce((acc, item) =>
        acc + (item.discountApplied * item.quantity), 0
    );

    return (
        <Box sx={{ display: "flex", bgcolor: "#f9f9f9", minHeight: "100vh" }}>
            <Sidebar mobileOpen={false} />

            <Box component="main" sx={{
                flexGrow: 1, p: 3, mt: 8,
                ml: { sm: `${drawerWidth}px` },
                width: { sm: `calc(100% - ${drawerWidth}px)` },
            }}>
                {/* HEADER */}
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>Order Details</Typography>
                        <Typography color="text.secondary">
                            ID: {order.id} • Submitted {new Date(order.createdAt).toLocaleString()}
                        </Typography>
                    </Box>
                    <Chip label={order.status} color={order.status === "DELIVERED" ? "success" : "primary"} sx={{ fontWeight: 'bold' }} />
                </Box>

                <Grid container spacing={3}>
                    {/* LEFT: Customer & Payment */}
                    <Grid item xs={12} md={5}>
                        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Customer Information</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Typography><strong>Name:</strong> {order.clientName}</Typography>
                            <Typography><strong>Email:</strong> {order.clientEmail}</Typography> 
                            <Typography><strong>Phone:</strong> {order.phone}</Typography>
                            <Typography><strong>Remaining Amount:</strong> {order.remainingAmount}</Typography>

                            <Typography sx={{ mt: 2 }}><strong>Shipping Address:</strong></Typography>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary', bgcolor: '#f5f5f5', p: 1.5, borderRadius: 1 }}>
                                {order.clientAddress}
                            </Typography>
                        </Paper>

                        <Paper sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Payment Screenshot</Typography>
                            <Divider sx={{ mb: 2 }} />
                            {order.paymentScreenshot ? (
                                <Box sx={{ width: '100%', borderRadius: 1, overflow: 'hidden', border: '1px solid #ddd' }}>
                                    <SignedImage fileKey={order.paymentScreenshot} alt="Payment Proof" type={"order"}/>
                                </Box>
                            ) : (
                                <Typography color="error">No screenshot provided.</Typography>
                            )}
                        </Paper>
                    </Grid>

                    {/* RIGHT: Ordered Items & Math */}
                    <Grid item xs={12} md={7}>
                        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Order Summary</Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableCell><strong>Item</strong></TableCell>
                                            <TableCell align="center"><strong>Qty</strong></TableCell>
                                            <TableCell align="right"><strong>Original Price</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {order.items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="500">
                                                        {item.product?.name || "Deleted Product"}
                                                    </Typography>
                                                    {item.discountApplied > 0 && (
                                                        <Typography variant="caption" color="success.main" sx={{ display: 'block' }}>
                                                            - ${(item.discountApplied).toFixed(2)} Promo Applied
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">{item.quantity}</TableCell>
                                                <TableCell align="right">
                                                    ${(item.priceAtPurchase + item.discountApplied).toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))}

                                        {/* SUBTOTALS */}
                                        <TableRow>
                                            <TableCell colSpan={2} align="right" sx={{ borderBottom: 'none', pt: 3 }}>Subtotal:</TableCell>
                                            <TableCell align="right" sx={{ borderBottom: 'none', pt: 3 }}>${subtotal.toFixed(2)}</TableCell>
                                        </TableRow>

                                        {totalDiscount > 0 && (
                                            <TableRow>
                                                <TableCell colSpan={2} align="right" sx={{ borderBottom: 'none', color: 'green' }}>Total Discount:</TableCell>
                                                <TableCell align="right" sx={{ borderBottom: 'none', color: 'green' }}>-${totalDiscount.toFixed(2)}</TableCell>
                                            </TableRow>
                                        )}

                                        <TableRow>
                                            <TableCell colSpan={2} align="right"><strong>Grand Total:</strong></TableCell>
                                            <TableCell align="right">
                                                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                                                    ${order.totalAmount.toFixed(2)}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>

                        <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Fulfillment</Typography>
                            <StatusButtons orderId={order.id}
                                           currentStatus={order.status}
                                           customerName={order.clientName}
                                           customerAddress={order.clientAddress}
                                           remainingAmountForPrint = {order.remainingAmount}
                                           phone = {order.phone}
                            />
                        </Paper>
                    </Grid>
                </Grid>

                {/* Print Styles (Omitted for brevity, keep your existing CSS) */}
            </Box>
        </Box>
    );
}