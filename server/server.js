const express = require("express");
const db = require("./db");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Add user to database
app.post("/add-user", (req, res) => {
  const { name, email } = req.body;

  const sql = "INSERT INTO users (name, email) VALUES (?, ?)";
  db.query(sql, [name, email], (err, result) => {
    if (err) return res.json({ message: "Database Error" });
    res.json({ message: "User Added Successfully!" });
  });
});

app.listen(5000, () => console.log("Server running on port 5000"));
