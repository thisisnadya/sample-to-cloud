const express = require("express");
require("dotenv").config();
const cors = require("cors");
const routes = require("./routes/placeOrder");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/orders", routes);

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.listen(process.env.PORT, () =>
  console.log(`Listening on PORT ${process.env.PORT}`)
);
