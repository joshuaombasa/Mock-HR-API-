const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const EMPLOYEES_CSV = path.join(__dirname, 'employees.csv');

// Middleware
app.use(express.json());
app.use(cors());

// CSV Headers
const CSV_HEADERS = ['EmployeeID', 'FirstName', 'LastName', 'Title', 'Email', 'Status'];

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
  const headerLine = CSV_HEADERS.join(',') + '\n';
  const rows = employees.map(emp => 
    CSV_HEADERS.map(h => emp[h] || '').join(',')
  ).join('\n');
  fs.writeFileSync(EMPLOYEES_CSV, headerLine + rows, 'utf8');
}

// Validate employee object
function isValidEmployee(employee) {
  return CSV_HEADERS.every(key => key in employee);
}

// GET all employees
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await getEmployeesFromCSV();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error reading employee data', error: error.message });
  }
});

// POST new employee (simulate hiring)
app.post('/api/employees', async (req, res) => {
  try {
    const newEmployee = req.body;

    if (!isValidEmployee(newEmployee)) {
      return res.status(400).json({ message: 'Invalid employee data' });
    }

    const employees = await getEmployeesFromCSV();
    employees.push(newEmployee);
    writeEmployeesToCSV(employees);

    res.status(201).json({ message: 'Employee added', newEmployee });
  } catch (error) {
    res.status(500).json({ message: 'Error adding employee', error: error.message });
  }
});

// PUT update existing employee
app.put('/api/employees/:id', async (req, res) => {
  try {
    const employeeId = req.params.id;
    const updatedData = req.body;

    let employees = await getEmployeesFromCSV();
    let updated = false;

    employees = employees.map(emp => {
      if (emp.EmployeeID === employeeId) {
        updated = true;
        return { ...emp, ...updatedData };
      }
      return emp;
    });

    if (!updated) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    writeEmployeesToCSV(employees);
    res.json({ message: 'Employee updated', employeeId });
  } catch (error) {
    res.status(500).json({ message: 'Error updating employee', error: error.message });
  }
});

// DELETE employee
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const employeeId = req.params.id;
    const employees = await getEmployeesFromCSV();

    const filtered = employees.filter(emp => emp.EmployeeID !== employeeId);

    if (filtered.length === employees.length) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    writeEmployeesToCSV(filtered);
    res.json({ message: 'Employee deleted', employeeId });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting employee', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock HR server is running on http://localhost:${PORT}`);
});
