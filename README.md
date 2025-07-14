# Mock HR Server

This project is a simple Node.js/Express-based mock HR REST API server. It simulates an HR system using a CSV file (`employees.csv`) as its data source.

You can use it to:

* Retrieve a list of employees
* Add a new employee
* Update an existing employee
* Delete an employee

This is especially useful for simulating integrations with systems like Microsoft Identity Manager (MIM), SAP SuccessFactors, or for educational and testing purposes.

---

## Project Structure

```
mock-hr-server/
├── employees.csv         # CSV file storing employee records
├── mock-hr-server.js     # Express server with REST API
└── README.md             # Project documentation
```

---

##  Prerequisites

* [Node.js](https://nodejs.org/) (v14 or newer)
* npm (Node package manager)

---

##  Installation

```bash
# Clone or download this project
git clone https://github.com/joshuaombasa/mock-hr-server.git
cd mock-hr-server

# Install dependencies
npm install express csv-parser body-parser
```

---

##  Running the Server

### 1. Create the employee CSV file

Create a file named `employees.csv` with the following content:

```csv
EmployeeID,FirstName,LastName,Title,Email,Status
1001,Alice,Wanjiku,HR Manager,alice@example.com,Active
1002,Bob,Kariuki,Developer,bob@example.com,Active
```

### 2. Start the server

```bash
node mock-hr-server.js
```

Visit `http://localhost:3000` to access the API.

---

##  API Endpoints

### `GET /api/employees`

Returns a list of all employees.

**Response:**

```json
[
  {
    "EmployeeID": "1001",
    "FirstName": "Alice",
    "LastName": "Wanjiku",
    "Title": "HR Manager",
    "Email": "alice@example.com",
    "Status": "Active"
  }
]
```

---

### `POST /api/employees`

Adds a new employee to the CSV.

**Request Body:**

```json
{
  "EmployeeID": "1003",
  "FirstName": "Jane",
  "LastName": "Doe",
  "Title": "QA Engineer",
  "Email": "jane.doe@example.com",
  "Status": "Active"
}
```

**Response:**
`201 Created` with success message and employee details.

---

### `PUT /api/employees/:id`

Updates an existing employee record.

**Example:**
`PUT /api/employees/1003`

**Request Body:**

```json
{
  "Title": "Senior QA Engineer",
  "Status": "On Leave"
}
```

---

### `DELETE /api/employees/:id`

Deletes an employee by `EmployeeID`.

**Example:**
`DELETE /api/employees/1003`

---

##  Use Cases

* HR system integration testing
* MIM synchronization simulation
* Local dev/testing with file-based data
* Lightweight HR mock API for demos

---

##  Notes

* Data is read from and written to `employees.csv` in real-time.
* CSV headers must match exactly: `EmployeeID,FirstName,LastName,Title,Email,Status`
* No database is used; it’s entirely file-based.
* No authentication or validation logic is included — meant for development only.

---

## 📃 License

MIT
