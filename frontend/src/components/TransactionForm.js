import React, { useState, useEffect, useContext } from 'react';
import {
  TextField, Button, Box, Typography, MenuItem,
  Select, InputLabel, FormControl
} from '@mui/material';
import { getCategories } from '../api/budget';
import { AuthContext } from '../context/AuthContext';

const TransactionForm = ({ onSubmit, onCancel, initialData, refresh }) => {
  const { token } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    category_id: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories(token);
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data?.results) {
          setCategories(data.results);
        } else if (data?.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, [token, refresh]); // <== Important

  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount.toString(),
        date: initialData.date,
        description: initialData.description,
        category_id: initialData.category?.id || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, p: 2, border: '1px solid grey', borderRadius: '4px' }}>
      <Typography variant="h6" gutterBottom>
        {initialData ? 'Edit Transaction' : 'Add Transaction'}
      </Typography>

      <TextField
        margin="normal"
        required
        fullWidth
        label="Amount"
        type="number"
        name="amount"
        value={formData.amount}
        onChange={handleChange}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        label="Date"
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
      />

      <FormControl fullWidth margin="normal" required>
        <InputLabel>Category</InputLabel>
        <Select
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          label="Category"
        >
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name} ({cat.category_type === 'IN' ? 'Income' : 'Expense'})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button type="submit" fullWidth variant="contained">
          {initialData ? 'Update' : 'Add'}
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

export default TransactionForm;
