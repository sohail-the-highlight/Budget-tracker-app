import React, { useState, useContext, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Box, Typography, Card, CardContent, Grid, Paper } from '@mui/material';
import { getFinancialSummary } from '../api/budget';
import { AuthContext } from '../context/AuthContext';

// Reusable D3 Bar Chart Component
const D3BarChart = ({ data, layout = 'vertical' }) => {
  const ref = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); // Clear previous renders

    const width = 500;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 40, left: 90 };

    if (layout === 'vertical') {
        const x = d3.scaleLinear()
            .domain([0, d3.max(data, d => Math.max(d.budget, d.actual))])
            .range([margin.left, width - margin.right]);

        const y = d3.scaleBand()
            .domain(data.map(d => d.category))
            .range([margin.top, height - margin.bottom])
            .padding(0.1);

        svg.append("g")
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(y));

        // Create a group for each category
        const group = svg.selectAll(".group")
          .data(data)
          .enter().append("g")
          .attr("transform", d => `translate(0, ${y(d.category)})`);

        // Add budget bars
        group.append("rect")
            .attr("x", margin.left)
            .attr("y", 0)
            .attr("width", d => x(d.budget) - margin.left)
            .attr("height", y.bandwidth() / 2)
            .attr("fill", "#8884d8");

        // Add actual bars
        group.append("rect")
            .attr("x", margin.left)
            .attr("y", y.bandwidth() / 2)
            .attr("width", d => x(d.actual) - margin.left)
            .attr("height", y.bandwidth() / 2)
            .attr("fill", "#82ca9d");
    } else { // Horizontal layout for Income vs Expense
         const x = d3.scaleBand()
            .domain(data.map(d => d.name))
            .range([margin.left, width - margin.right])
            .padding(0.1);
        
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)])
            .range([height - margin.bottom, margin.top]);

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => x(d.name))
            .attr("y", d => y(d.value))
            .attr("width", x.bandwidth())
            .attr("height", d => y(0) - y(d.value))
            .attr("fill", d => d.name === 'Income' ? 'green' : 'red');
    }

  }, [data, layout]);

  return <svg ref={ref} width={500} height={400}></svg>;
};


const FinancialSummary = ({ refresh }) => {
  const [summary, setSummary] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getFinancialSummary(token);
        setSummary(data);
      } catch (error) {
        console.error('Error fetching financial summary:', error);
      }
    };
    fetchSummary();
  }, [token, refresh]); // Refresh when the refresh prop changes

  if (!summary) return <div>Loading...</div>;

  const incomeExpenseData = [
    { name: 'Income', value: summary.total_income },
    { name: 'Expenses', value: summary.total_expenses }
  ];

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>Financial Summary</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Income</Typography>
              <Typography variant="h4" color="success.main">${summary.total_income.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Expenses</Typography>
              <Typography variant="h4" color="error.main">${summary.total_expenses.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Balance</Typography>
              <Typography variant="h4" color={summary.balance >= 0 ? 'success.main' : 'error.main'}>
                ${summary.balance.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Grid container spacing={3} sx={{mt: 2}}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{p: 2}}>
              <Typography variant="h6" gutterBottom>Income vs Expenses</Typography>
              <D3BarChart data={incomeExpenseData} layout="horizontal" />
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
             {summary.budget_vs_actual.length > 0 && (
                <Paper elevation={3} sx={{p: 2}}>
                    <Typography variant="h6" gutterBottom>Budget vs Actual Expenses</Typography>
                    <Typography variant="body2">Budget (Blue), Actual (Green)</Typography>
                    <D3BarChart data={summary.budget_vs_actual} layout="vertical" />
                </Paper>
            )}
          </Grid>
      </Grid>
    </Box>
  );
};

export default FinancialSummary;