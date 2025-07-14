// mock-hr-server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const EMPLOYEES_CSV = path.join(__dirname, 'employees.csv');

app.use(bodyParser.json());

// Read CSV and convert to JSON
function getEmployeesFromCSV() {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(EMPLOYEES_CSV)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

// Write employee data back to CSV
function writeEmployeesToCSV(employees) {
  const headers = 'EmployeeID,FirstName,LastName,Title,Email,Status\n';
  const rows = employees.map(emp => `${emp.EmployeeID},${emp.FirstName},${emp.LastName},${emp.Title},${emp.Email},${emp.Status}`).join('\n');
  fs.writeFileSync(EMPLOYEES_CSV, headers + rows);
}

// GET all employees
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await getEmployeesFromCSV();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error reading employee data', error });
  }
});

// POST new employee (simulate hiring)
app.post('/api/employees', async (req, res) => {
  try {
    const employees = await getEmployeesFromCSV();
    const newEmployee = req.body;
    employees.push(newEmployee);
    writeEmployeesToCSV(employees);
    res.status(201).json({ message: 'Employee added', newEmployee });
  } catch (error) {
    res.status(500).json({ message: 'Error adding employee', error });
  }
});

// PUT update existing employee (simulate update)
app.put('/api/employees/:id', async (req, res) => {
  try {
    const employeeId = req.params.id;
    const updatedData = req.body;
    let employees = await getEmployeesFromCSV();
    let found = false;
    employees = employees.map(emp => {
      if (emp.EmployeeID === employeeId) {
        found = true;
        return { ...emp, ...updatedData };
      }
      return emp;
    });
    if (!found) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    writeEmployeesToCSV(employees);
    res.json({ message: 'Employee updated', employeeId });
  } catch (error) {
    res.status(500).json({ message: 'Error updating employee', error });
  }
});

// DELETE employee (simulate termination)
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const employeeId = req.params.id;
    let employees = await getEmployeesFromCSV();
    const filtered = employees.filter(emp => emp.EmployeeID !== employeeId);
    if (filtered.length === employees.length) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    writeEmployeesToCSV(filtered);
    res.json({ message: 'Employee deleted', employeeId });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting employee', error });
  }
});

app.listen(PORT, () => {
  console.log(`Mock HR server is running on http://localhost:${PORT}`);
});
