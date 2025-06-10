import React, { useState, useEffect, useContext } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Box, Typography
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import { getBudgets } from '../api/budget';
import { AuthContext } from '../context/AuthContext';
import { format } from 'date-fns';

const BudgetList = ({ onEdit, refresh }) => {
  const [budgets, setBudgets] = useState([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const response = await getBudgets(token);
        // The backend returns a paginated-like response or a direct array
        setBudgets(response.results || response || []);
      } catch (error) {
        console.error('Error fetching budgets:', error);
      }
    };
    fetchBudgets();
  }, [token, refresh]);

const handleDelete = async (id) => {
    try {
      await deleteTransaction(token, id);
      setRefresh(prev => !prev);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };


  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>Monthly Budgets</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Month</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Budgeted Amount</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {budgets.map((budget) => (
              <TableRow key={budget.id}>
                <TableCell>{format(new Date(budget.month), 'MMMM yyyy')}</TableCell>
                <TableCell>{budget.category?.name}</TableCell>
                <TableCell align="right">${parseFloat(budget.amount).toFixed(2)}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => onEdit(budget)}><Edit /></IconButton>
                  <IconButton onClick={() => handleDelete(transaction.id)}><Delete /></IconButton>

                  
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BudgetList;
