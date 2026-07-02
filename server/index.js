const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/forecast", async (req, res) => {
  try {
    const { ticker, days } = req.body;
    const response = await axios.post("http://127.0.0.1:5000/forecast", { ticker, days });
    res.json(response.data);
  } catch (error) {
    console.error("Error from python backend:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Failed to fetch from python backend", details: error.response ? error.response.data : error.message });
  }
});

app.post("/api/current-price", async (req, res) => {
  try {
    const { ticker } = req.body;
    const response = await axios.post("http://127.0.0.1:5000/current_price", { ticker });
    res.json(response.data);
  } catch (error) {
    console.error("Error from python backend:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Failed to fetch from python backend", details: error.response ? error.response.data : error.message });
  }
});

// Start the server
app.listen(3001, () => {
  console.log("Node.js backend running at http://localhost:3001");
});
