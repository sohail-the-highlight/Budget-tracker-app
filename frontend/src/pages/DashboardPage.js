import React, { useState, useContext } from 'react';
import { Box, Button, Typography, Modal } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import FinancialSummary from '../components/FinancialSummary';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import BudgetList from '../components/BudgetList';
import BudgetForm from '../components/BudgetForm';
import CategoryForm from '../components/CategoryForm';
import { createTransaction, updateTransaction, createBudget, updateBudget } from '../api/budget';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const DashboardPage = () => {
  const [modalContent, setModalContent] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const { logout, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const triggerRefresh = () => setRefresh(prev => !prev);

  const handleTransactionSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString().split('T')[0],
      };

      if (editingTransaction?.id) {
        await updateTransaction(token, editingTransaction.id, payload);
      } else {
        await createTransaction(token, payload);
      }

      handleCloseForms();
      triggerRefresh();
    } catch (error) {
      console.error('Error saving transaction:', error.response?.data || error.message);
    }
  };

  const handleBudgetSubmit = async (formData) => {
    try {
      // FIX: Rely on the component's state (`editingBudget`) for more reliable updates.
      const budgetId = editingBudget?.id;
      
      if (budgetId) {
        await updateBudget(token, budgetId, formData);
      } else {
        await createBudget(token, formData);
      }
      handleCloseForms();
      triggerRefresh();
    } catch (error) {
      console.error('Error saving budget:', error.response?.data || error.message);
    }
  };
  
  const handleCategorySubmitSuccess = () => {
    handleCloseForms();
    triggerRefresh();
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setModalContent('transaction');
  };
  
  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setModalContent('budget');
  };
  
  const handleOpenForm = (formType) => {
    setEditingTransaction(null);
    setEditingBudget(null);
    setModalContent(formType);
  };
  
  const handleCloseForms = () => {
    setModalContent(null);
    setEditingTransaction(null);
    setEditingBudget(null);
  };
  
  const renderModalContent = () => {
    switch (modalContent) {
      case 'transaction':
        return (
          <TransactionForm
            onSubmit={handleTransactionSubmit}
            initialData={editingTransaction}
            onCancel={handleCloseForms}
            // FIX: Add a key to ensure the form component resets when the data changes
            key={`transaction-${editingTransaction?.id || 'new'}`}
          />
        );
      case 'budget':
        return (
          <BudgetForm
            onSubmit={handleBudgetSubmit}
            initialData={editingBudget}
            onCancel={handleCloseForms}
            // FIX: Add a key to ensure the form component resets when the data changes
            key={`budget-${editingBudget?.id || 'new'}`}
          />
        );
      case 'category':
        return (
          <CategoryForm
            onSubmitSuccess={handleCategorySubmitSuccess}
            onCancel={handleCloseForms}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Budget Dashboard</Typography>
        <Button onClick={handleLogout} variant="outlined" color="error">Logout</Button>
      </Box>

      <FinancialSummary refresh={refresh} />

      <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button variant="contained" onClick={() => handleOpenForm('transaction')}>Add Transaction</Button>
        <Button variant="contained" color="secondary" onClick={() => handleOpenForm('budget')}>Add Budget</Button>
      </Box>

      <Modal open={!!modalContent} onClose={handleCloseForms}>
        <Box sx={style}>
          {renderModalContent()}
        </Box>
      </Modal>

      {/* FIX: Pass the `triggerRefresh` function as the `setRefresh` prop.
        This allows the BudgetList component to trigger a data refresh after deleting an item.
      */}
      <BudgetList onEdit={handleEditBudget} refresh={refresh} setRefresh={triggerRefresh} />
      
      <TransactionList onEdit={handleEditTransaction} refresh={refresh} setRefresh={triggerRefresh} />
    </Box>
  );
};

export default DashboardPage;
