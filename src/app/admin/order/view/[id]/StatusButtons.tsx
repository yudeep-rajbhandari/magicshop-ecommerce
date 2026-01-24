"use client";

import React, {useState, useTransition} from "react";
import {
    Box,
    Button,
    CircularProgress,
    Step,
    Stepper,
    StepLabel,
    Typography, Dialog, DialogTitle, TextField, DialogContent, DialogActions
} from "@mui/material";
import UndoIcon from '@mui/icons-material/Undo';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {updateOrderRemainingAmount, updateOrderStatus} from "./action";

// Define the logical flow of your business
const statusSteps = [
    "PAID",
    "SENT_TO_THIRD_PARTY",
    "RECEIVED_FROM_THIRD_PARTY",
    "PREPARING_DELIVERY",
    "DELIVERED"
];

interface StatusButtonsProps {
    orderId: string;
    currentStatus: string;
    customerName: string;
    customerAddress: string;
    remainingAmountForPrint: string
    phone: string
}


export default function StatusButtons({ orderId, currentStatus,customerName,customerAddress,remainingAmountForPrint,phone }: StatusButtonsProps) {
    const [isPending, startTransition] = useTransition();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [remainingAmount, setRemainingAmount] = useState<string>("");
    const [error, setError] = useState<string>("");


    // Calculate positions in the flow
    const currentIndex = statusSteps.indexOf(currentStatus);
    const nextStatus = statusSteps[currentIndex + 1];
    const prevStatus = statusSteps[currentIndex - 1];

    const handleUpdate = (status: string) => {
        // const confirmMsg = status === "REJECTED"
        //     ? "Are you sure you want to REJECT this order?"
        //     : `Move order to ${status.replace(/_/g, ' ')}?`;
        //
        // if (!confirm(confirmMsg)) return;

        startTransition(async () => {
            try {
                await updateOrderStatus(orderId, status);
            } catch (error) {

                alert("Failed to update status. Please try again. Error: " + error.status || "Unknown error");
            }
        });
    };
    const handlePaidStatus = () => {
        setIsDialogOpen(true);
    };

    const handleConfirmPaid = () => {
        const amount = parseFloat(remainingAmount);

        if (isNaN(amount)) {
            setError("Please enter a valid amount");
            return;
        }

        if (amount < 0) {
            setError("Amount cannot be negative");
            return;
        }

        setIsDialogOpen(false);
        startTransition(async () => {
            try {
                await updateOrderRemainingAmount(orderId, amount);
                await updateOrderStatus(orderId, "PAID");
            } catch (error) {
                alert("Failed to update status. Please try again.");
            }
        });
    };

    // Replace the existing SUBMITTED status button with this
    const renderSubmittedButtons = () => (
        <>
            <Button
                variant="contained"
                color="success"
                fullWidth
                startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                onClick={handlePaidStatus}
                disabled={isPending}
            >
                Approve & Mark Paid
            </Button>

            <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
                <DialogTitle>Enter Remaining Amount</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Remaining Amount"
                        type="number"
                        fullWidth
                        value={remainingAmount}
                        onChange={(e) => {
                            setRemainingAmount(e.target.value);
                            setError("");
                        }}
                        error={!!error}
                        helperText={error}
                        InputProps={{
                            inputProps: {
                                min: 0,
                                step: "0.01"
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDialogOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmPaid} color="primary" variant="contained">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );

    const handlePrint = () => {
        // Create a new window for printing
        const printWindow = window.open('', '_blank', 'width=600,height=600');
        if (!printWindow) return;

        // Create the print content
        const printContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Shipping Label</title>
                    <style>
                        @media print {
                            body { margin: 0; }
                            .shipping-label { 
                                border: 2px solid #000; 
                                padding: 20px;
                                max-width: 400px;
                                margin: 20px auto;
                            }
                        }
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .shipping-label { 
                            border: 2px solid #000; 
                            padding: 20px;
                            max-width: 400px;
                            margin: 20px auto;
                        }
                        .customer-name { 
                            font-size: 18px; 
                            font-weight: bold; 
                            margin-bottom: 10px; 
                        }
                        .customer-address { 
                            line-height: 1.5; 
                            white-space: pre-line; 
                        }
                    </style>
                </head>
                <body>
                    <div class="shipping-label">
                    <p>Shipping Label</p>
                        <div class="customer-name">Name: ${customerName}</div>
                        <div class="customer-address">Address: ${customerAddress}</div>
                         <div class="customer-address">Remaing Amount: ${remainingAmountForPrint}</div>
                          <div class="customer-address">Phone: ${phone}</div>

                    </div>
                    <script>
                        // Wait for content to load then trigger print
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                            }, 500);
                        };
                    </script>
                </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
    };



    // If order is rejected, show a simple reset or status message
    if (currentStatus === "REJECTED") {
        return (
            <Box sx={{ mt: 3, p: 2, bgcolor: '#fff1f0', border: '1px solid #ffa39e', borderRadius: 2 }}>
                <Typography color="error" fontWeight="bold">This order has been REJECTED.</Typography>
                <Button size="small" onClick={() => handleUpdate("SUBMITTED")} sx={{ mt: 1 }}>
                    Undo Rejection
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 3, width: '100%' }}>
            {/* Visual Progress Tracker */}
            <Stepper activeStep={currentIndex} alternativeLabel sx={{ mb: 4 }}>
                {statusSteps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label.replace(/_/g, ' ')}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>

                {/* 1. BACK BUTTON: Move backwards in case of mistake */}
                {prevStatus && (
                    <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<UndoIcon />}
                        onClick={() => handleUpdate(prevStatus)}
                        disabled={isPending}
                    >
                        Back
                    </Button>
                )}

                {/* 2. INITIAL APPROVAL: From Submitted to Paid */}
                {currentStatus === "SUBMITTED" &&  renderSubmittedButtons()}
                {/*(*/}
                {/*    <Button*/}
                {/*        variant="contained"*/}
                {/*        color="success"*/}
                {/*        fullWidth*/}
                {/*        startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}*/}
                {/*        onClick={() => handleUpdate("PAID")}*/}
                {/*        disabled={isPending}*/}
                {/*    >*/}
                {/*        Approve & Mark Paid*/}
                {/*    </Button>*/}
                {/*)}*/}

                {/* 3. NEXT STEP: The primary forward-moving action */}
                {nextStatus && currentStatus !== "SUBMITTED" && (
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ flexGrow: 1 }}
                        onClick={() => handleUpdate(nextStatus)}
                        disabled={isPending}
                    >
                        {isPending ? <CircularProgress size={24} color="inherit" /> : `Move to ${nextStatus.replace(/_/g, ' ')}`}
                    </Button>
                )}

                {/* 4. PRINT LABEL: Specifically for the delivery preparation stage */}
                {currentStatus === "PREPARING_DELIVERY" && (
                    <Button
                        variant="contained"
                        color="warning"
                        startIcon={<PrintIcon />}
                        onClick={handlePrint}
                        sx={{ fontWeight: 'bold' }}
                    >
                        Print Label
                    </Button>
                )}

                {/* 5. REJECT: Available until the item is delivered */}
                {currentStatus !== "DELIVERED" && (
                    <Button
                        variant="text"
                        color="error"
                        onClick={() => handleUpdate("REJECTED")}
                        disabled={isPending}
                    >
                        Reject
                    </Button>
                )}
            </Box>

            {isPending && (
                <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'center', color: 'text.secondary' }}>
                    Updating database...
                </Typography>
            )}
        </Box>
    );
}