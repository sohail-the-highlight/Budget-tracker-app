import React, { useState, useEffect, useContext } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  TextField, Button, Box, Typography, MenuItem,
  Select, InputLabel, FormControl
} from '@mui/material';
import { getCategories } from '../api/budget';
import { AuthContext } from '../context/AuthContext';
import { format } from 'date-fns';

// FIX: Added 'refresh' prop
const BudgetForm = ({ onSubmit, onCancel, initialData, refresh }) => {
  const { token } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    month: new Date(),
    category_id: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories(token);
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data && (Array.isArray(data.results) || Array.isArray(data.categories))) {
          setCategories(data.results || data.categories);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };
    fetchCategories();
    // FIX: Added 'refresh' to the dependency array to trigger re-fetch
  }, [token, refresh]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount.toString(),
        month: new Date(initialData.month),
        category_id: initialData.category?.id || '',
      });
    } else {
      setFormData({
        amount: '',
        month: new Date(),
        category_id: '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, month: date }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(formData.amount);
    if (isNaN(parsedAmount)) {
      alert('Please enter a valid amount.');
      return;
    }

    const payload = {
      amount: parsedAmount,
      month: format(formData.month, 'yyyy-MM-01'),
      category_id: parseInt(formData.category_id),
    };
    
    if (initialData?.id) {
      payload.id = initialData.id;
    }

    onSubmit(payload);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, p: 2, border: '1px solid grey', borderRadius: '4px' }}>
      <Typography variant="h6" gutterBottom>
        {initialData ? 'Edit Budget' : 'Add Budget'}
      </Typography>

      <TextField
        margin="normal"
        required
        fullWidth
        label="Budget Amount"
        type="number"
        name="amount"
        value={formData.amount}
        onChange={handleChange}
      />

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Budget Month"
          views={['year', 'month']}
          value={formData.month}
          onChange={handleDateChange}
          renderInput={(params) => (
            <TextField {...params} fullWidth margin="normal" required />
          )}
        />
      </LocalizationProvider>

      <FormControl fullWidth margin="normal" required>
        <InputLabel>Category</InputLabel>
        <Select name="category_id" value={formData.category_id} onChange={handleChange} label="Category" disabled={!!initialData}>
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name} ({cat.category_type === 'IN' ? 'Income' : 'Expense'})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button type="submit" fullWidth variant="contained">
          {initialData ? 'Update Budget' : 'Add Budget'}
        </Button>
        {onCancel && (
          <Button variant="outlined" color="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default BudgetForm;