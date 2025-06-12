// src/components/BudgetList.js

import React, { useState, useEffect, useContext } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Box, Typography, CircularProgress
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { getBudgets, deleteBudget } from '../api/budget';
import { AuthContext } from '../context/AuthContext';
import { format } from 'date-fns';

// The props now include `setRefresh`, which is passed from DashboardPage
const BudgetList = ({ onEdit, refresh, setRefresh }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getBudgets(token);
        setBudgets(response.data.results || response.data || []);
      } catch (error) {
        console.error('Error fetching budgets:', error);
        setError('Failed to load budgets. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchBudgets();
  }, [token, refresh]);

  const handleDelete = async (id) => {
    // Add a confirmation before deleting
    if (window.confirm('Are you sure you want to delete this budget?')) {
        try {
            await deleteBudget(token, id);
            // This now works because `setRefresh` is passed as a prop
            if(setRefresh) {
                setRefresh(prev => !prev); 
            }
        } catch (error) {
            console.error('Error deleting budget:', error.response?.data || error);
            alert('Failed to delete budget.');
        }
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error" sx={{ mt: 4 }}>{error}</Typography>;
  }

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
            {budgets.length > 0 ? budgets.map((budget) => (
              <TableRow key={budget.id}>
                <TableCell>{format(new Date(budget.month), 'MMMM yyyy')}</TableCell>
                <TableCell>{budget.category?.name || 'N/A'}</TableCell>
                <TableCell align="right">${parseFloat(budget.amount).toFixed(2)}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => onEdit(budget)} aria-label="edit"><Edit /></IconButton>
                  <IconButton onClick={() => handleDelete(budget.id)} aria-label="delete"><Delete /></IconButton>
                </TableCell>
              </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={4} align="center">No budgets found.</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BudgetList;
