"use client";

import { useTransition } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Switch,
    Typography,
    Box,
    Chip,
} from "@mui/material";
import type { Category } from "@prisma/client";
import { toggleCategoryPromo } from "./action";

interface CategoryClientPageProps {
    categories: Category[];
}

export default function CategoryClientPage({ categories }: CategoryClientPageProps) {
    const [isPending, startTransition] = useTransition();
    const handleTogglePromo = (id: string, newStatus: boolean) => {
        startTransition(() => {
            toggleCategoryPromo(id, newStatus);
        });
    };

    return (
        <TableContainer>
            <Table>
                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                    <TableRow>
                        <TableCell><strong>Category Name</strong></TableCell>
                        <TableCell><strong>Promotion Details</strong></TableCell>
                        <TableCell align="center"><strong>Toggle Promotion</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {categories.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={3} align="center">
                                <Typography sx={{ py: 3 }}>No categories found. You can add one!</Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        categories.map((category) => (
                            <TableRow key={category.id} hover>
                                <TableCell>
                                    <Typography variant="body1" fontWeight="500">
                                        {category.name}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    {category.hasPromo ? (
                                        <Box>
                                            <Chip label="Active" color="success" size="small" sx={{ mb: 1 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                Min. Quantity: <strong>{category.minQuantity ?? 'N/A'}</strong>
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Discount Rate: <strong>{category.discountRate ? `${category.discountRate * 100}%` : 'N/A'}</strong>
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Chip label="Inactive" size="small" />
                                    )}
                                </TableCell>
                                <TableCell align="center">
                                    <Switch
                                        checked={category.hasPromo}
                                        onChange={(e) => handleTogglePromo(category.id, e.target.checked)}
                                        disabled={isPending}
                                        color="primary"
                                    />
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}