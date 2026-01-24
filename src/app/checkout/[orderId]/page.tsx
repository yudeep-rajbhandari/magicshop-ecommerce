import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
    Container, Typography, Paper, List, ListItem,
    ListItemText, Divider, Box
} from "@mui/material";
import SignedImage from "@/component/s3-image";
import PaymentForm from "./PaymentForm";

type Props = {
    params: Promise<{ orderId: string }>;
};

export default async function PublicCheckoutPage({ params }: Props) {
    const { orderId } = await params;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: {
                include: {
                    product: true
                }
            }
        }
    });

    if (!order) return notFound();

    // --- CALCULATE TOTALS ---
    // Subtotal is the price before discounts
    const subtotal = order.items.reduce((acc, item) =>
        acc + (item.priceAtPurchase + item.discountApplied), 0
    );
    // Total savings across all items
    const totalSavings = order.items.reduce((acc, item) => acc + item.discountApplied, 0);

    // Prepare items to pass to PaymentForm for the finalizeCheckout action
    const cartItemsForAction = order.items.map(item => ({
        id: item.productId,
        categoryId: item.product.categoryId,
        price: item.priceAtPurchase + item.discountApplied // Send original price to action
    }));

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 8 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Order Summary
                </Typography>

                <List disablePadding sx={{ mb: 2 }}>
                    {order.items.map((item) => (
                        <ListItem key={item.id} sx={{ py: 2, px: 0, alignItems: 'center' }}>
                            <Box sx={{ width: 70, height: 70, mr: 2, flexShrink: 0, borderRadius: 1, overflow: 'hidden', border: '1px solid #eee' }}>
                                <SignedImage fileKey={item.product.imageUrl} />
                            </Box>
                            <ListItemText
                                primary={item.product.name}
                                secondary={
                                    <>
                                        <Typography variant="body2" component="span">Qty: {item.quantity}</Typography>
                                        {item.discountApplied > 0 && (
                                            <Typography variant="body2" color="success.main" sx={{ display: 'block', fontWeight: 'bold' }}>
                                                - ${(item.discountApplied).toFixed(2)} Savings applied
                                            </Typography>
                                        )}
                                    </>
                                }
                                primaryTypographyProps={{ fontWeight: 500 }}
                            />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                ${item.priceAtPurchase.toFixed(2)}
                            </Typography>
                        </ListItem>
                    ))}
                </List>

                <Divider sx={{ my: 2, borderBottomWidth: 2 }} />

                {/* --- PRICE BREAKDOWN --- */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">Subtotal</Typography>
                        <Typography>${subtotal.toFixed(2)}</Typography>
                    </Box>

                    {totalSavings > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'green' }}>
                            <Typography sx={{ fontWeight: 'bold' }}>Promo Discount</Typography>
                            <Typography sx={{ fontWeight: 'bold' }}>-${totalSavings.toFixed(2)}</Typography>
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="h6">Total Amount</Typography>
                        <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                            ${order.totalAmount.toFixed(2)}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 4 }}>
                    <Typography color="text.secondary" variant="body2">COMPLETE YOUR DETAILS</Typography>
                </Divider>

                {/* Pass orderId AND cart items into the form */}
                <PaymentForm order={order} cart={cartItemsForAction} />
            </Paper>
        </Container>
    );
}