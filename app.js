const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const EMPLOYEES_CSV_PATH = path.join(__dirname, 'employees.csv');

const CSV_HEADERS = ['EmployeeID', 'FirstName', 'LastName', 'Title', 'Email', 'Status'];

// Middleware
app.use(express.json());
app.use(cors());

// Utility: Read CSV to JSON
function readCSV() {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(EMPLOYEES_CSV_PATH)
      .pipe(csv())
      .on('data', data => results.push(data))
      .on('end', () => resolve(results))
      .on('error', err => reject(err));
  });
}

// Utility: Write JSON to CSV
function writeCSV(data) {
  const header = CSV_HEADERS.join(',') + '\n';
  const rows = data.map(emp =>
    CSV_HEADERS.map(field => (emp[field] || '').replace(/,/g, '')).join(',')
  ).join('\n');

  fs.writeFileSync(EMPLOYEES_CSV_PATH, header + rows, 'utf8');
}

// Validate employee object
function isValidEmployee(employee) {
  return CSV_HEADERS.every(field => field in employee && employee[field].toString().trim() !== '');
}

// Routes

// Get all employees
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await readCSV();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve employees', error: error.message });
  }
});

// Add new employee
app.post('/api/employees', async (req, res) => {
  const newEmployee = req.body;

  if (!isValidEmployee(newEmployee)) {
    return res.status(400).json({ message: 'Invalid employee data' });
  }

  try {
    const employees = await readCSV();
    employees.push(newEmployee);
    writeCSV(employees);
    res.status(201).json({ message: 'Employee added successfully', employee: newEmployee });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add employee', error: error.message });
  }
});

// Update employee by ID
app.put('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  const update = req.body;

  try {
    let employees = await readCSV();
    let found = false;

    employees = employees.map(emp => {
      if (emp.EmployeeID === id) {
        found = true;
        return { ...emp, ...update };
      }
      return emp;
    });

    if (!found) {
      return res.status(404).json({ message: `Employee with ID ${id} not found` });
    }

    writeCSV(employees);
    res.json({ message: 'Employee updated successfully', id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update employee', error: error.message });
  }
});

// Delete employee by ID
app.delete('/api/employees/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const employees = await readCSV();
    const filtered = employees.filter(emp => emp.EmployeeID !== id);

    if (filtered.length === employees.length) {
      return res.status(404).json({ message: `Employee with ID ${id} not found` });
    }

    writeCSV(filtered);
    res.json({ message: 'Employee deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete employee', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock HR API server is running at http://localhost:${PORT}`);
});
