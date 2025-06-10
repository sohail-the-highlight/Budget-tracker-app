import React, { useState, useEffect, useContext } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, TextField, MenuItem, Box, Typography, Pagination
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { format } from 'date-fns';
import { getTransactions, deleteTransaction, getCategories } from '../api/budget';
import { AuthContext } from '../context/AuthContext';

const TransactionList = ({ onEdit, refresh, setRefresh }) => {
  const [transactions, setTransactions] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    category: '',
    amount: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1
  });

  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const categoriesData = await getCategories(token);
        console.log("Fetched categories:", categoriesData); // 🔍 Inspect what the API returns

        // ✅ Handle array or wrapped object response
        if (Array.isArray(categoriesData)) {
          setAllCategories(categoriesData);
        } else if (categoriesData && Array.isArray(categoriesData.categories)) {
          setAllCategories(categoriesData.categories);
        } else {
          console.error('Unexpected category response:', categoriesData);
          setAllCategories([]); // fallback to empty
        }

      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchAllCategories();
  }, [token]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const isValidDate = (date) => date instanceof Date && !isNaN(date);

        const apiFilters = {
          start_date: isValidDate(filters.startDate) ? format(filters.startDate, 'yyyy-MM-dd') : null,
          end_date: isValidDate(filters.endDate) ? format(filters.endDate, 'yyyy-MM-dd') : null,
          category: filters.category,
          amount: filters.amount,
          page: pagination.page,
          page_size: pagination.pageSize,
        };

        const response = await getTransactions(token, apiFilters);

        setTransactions(response.results || []);
        setPagination(prev => ({
          ...prev,
          totalCount: response.count || 0,
          totalPages: Math.ceil((response.count || 0) / pagination.pageSize)
        }));

      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };
    fetchTransactions();
  }, [token, filters, pagination.page, refresh]);

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(token, id);
      setRefresh(prev => !prev);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }

  const handleDateChange = (name, date) => {
    const validDate = date instanceof Date && !isNaN(date) ? date : null;
    setFilters(prev => ({ ...prev, [name]: validDate }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (event, value) => {
    setPagination(prev => ({ ...prev, page: value }));
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>Transactions</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Start Date"
            value={filters.startDate}
            onChange={(date) => handleDateChange('startDate', date)}
            renderInput={(params) => <TextField {...params} name="startDate" />}
          />
          <DatePicker
            label="End Date"
            value={filters.endDate}
            onChange={(date) => handleDateChange('endDate', date)}
            renderInput={(params) => <TextField {...params} name="endDate" />}
          />
        </LocalizationProvider>

        <TextField
          select
          label="Category"
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          {Array.isArray(allCategories) &&
            allCategories.map((category) => (
              <MenuItem key={category.id} value={category.name}>
                {category.name}
              </MenuItem>
            ))}
        </TextField>

        <TextField
          label="Amount"
          name="amount"
          type="number"
          value={filters.amount}
          onChange={handleFilterChange}
          sx={{ minWidth: 120 }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{format(new Date(transaction.date), 'yyyy-MM-dd')}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>{transaction.category?.name}</TableCell>
                <TableCell align="right" style={{ color: transaction.category?.category_type === 'IN' ? 'green' : 'red' }}>
                  {transaction.amount}
                </TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => onEdit(transaction)}><Edit /></IconButton>
                  <IconButton onClick={() => handleDelete(transaction.id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination count={pagination.totalPages} page={pagination.page} onChange={handlePageChange} color="primary" />
      </Box>
    </Box>
  );
};

export default TransactionList;
