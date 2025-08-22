const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/ping", (req, res) => {
  res.json({ message: "connected" });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
