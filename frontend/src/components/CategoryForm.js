import React, { useState, useContext } from 'react';
import {
  TextField, Button, Box, Typography, MenuItem,
  Select, InputLabel, FormControl
} from '@mui/material';
import { createCategory } from '../api/budget';
import { AuthContext } from '../context/AuthContext';

const CategoryForm = ({ onSubmitSuccess, onCancel }) => {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    category_type: 'EX', // Default to Expense
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.category_type) {
      setError('Both fields are required.');
      return;
    }

    try {
      await createCategory(token, formData);
      onSubmitSuccess(); // This will trigger a refresh and close the modal
    } catch (err) {
      console.error('Failed to create category:', err);
      setError(err.response?.data?.name?.[0] || 'Failed to create category.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, p: 2, border: '1px solid grey', borderRadius: '4px' }}>
      <Typography variant="h6" gutterBottom>
        Add New Category
      </Typography>

      <TextField
        margin="normal"
        required
        fullWidth
        label="Category Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        autoFocus
      />

      <FormControl fullWidth margin="normal" required>
        <InputLabel>Category Type</InputLabel>
        <Select name="category_type" value={formData.category_type} onChange={handleChange} label="Category Type">
          <MenuItem value="EX">Expense</MenuItem>
          <MenuItem value="IN">Income</MenuItem>
        </Select>
      </FormControl>
      
      {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button type="submit" fullWidth variant="contained">
          Add Category
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

export default CategoryForm;