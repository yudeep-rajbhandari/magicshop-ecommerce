"use client";

import { Order, OrderStatus } from "@prisma/client";
import PaymentForm from "./PaymentForm";
import { Paper, Typography, Box, Stepper, Step, StepLabel } from "@mui/material";
import React from "react";

// 1. Define the simplified statuses for the customer view.
const customerSteps = ['Submitted', 'Out for Delivery', 'Delivered'];

// 2. This function maps your detailed backend statuses to a simple step index for the customer.
const mapStatusToStep = (status: OrderStatus): number => {
    switch (status) {
        case 'PENDING':
            return -1; // Not yet submitted, so no steps are active.
        case 'SUBMITTED':
        case 'PAID':
        case 'SENT_TO_THIRD_PARTY':
        case 'RECEIVED_FROM_THIRD_PARTY':
            return 0; // The 'Submitted' step is active.
        case 'PREPARING_DELIVERY':
            return 1; // The 'Out for Delivery' step is active.
        case 'DELIVERED':
            return 2; // The 'Delivered' step is active.
        case 'REJECTED':
            return 0; // Show it was at least submitted, but with an error.
        default:
            return -1; // Default case.
    }
};

// 3. Create the new, self-contained display component.
export default function CustomerOrderStatus({ currentStatus }: { currentStatus: OrderStatus }) {
    const activeStep = mapStatusToStep(currentStatus);
    const isRejected = currentStatus === 'REJECTED';

    return (
        <Box sx={{ width: '100%', my: 4 }}>
            <Typography variant="h6" gutterBottom align="center">Your Order Status</Typography>
            <Stepper activeStep={activeStep} alternativeLabel>
                {customerSteps.map((label, index) => (
                    <Step key={label}>
                        <StepLabel error={isRejected && activeStep === index}>
                            {label}
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>
            {isRejected && (
                <Typography variant="h6" color="error" align="center" sx={{ mt: 2 }}>
                    There was an issue with your order. Please contact us.
                </Typography>
            )}
        </Box>
    );
}

// 4. Update the main client page to use this new component.
// export default function PaymentPageClient({ order }: { order: Order }) {
//     const isFormVisible = order.status === 'PENDING';
//
//     return (
//         <Box sx={{ maxWidth: '800px', mx: 'auto', p: 2 }}>
//             <CustomerOrderStatus currentStatus={order.status} />
//
//             {isFormVisible ? (
//                 <PaymentForm orderId={order.id} />
//             ) : (
//                 <Paper sx={{ p: 4, mt: 4, textAlign: 'center', bgcolor: '#f0fff4', border: '1px solid #c6f6d5' }}>
//                     <Typography variant="h5" color="success.main" gutterBottom>
//                         Information Received
//                     </Typography>
//                     <Typography variant="body1">
//                         We have received your details. You can track the progress of your order above.
//                     </Typography>
//                 </Paper>
//             )}
//         </Box>
//     );
// }