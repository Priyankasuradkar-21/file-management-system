const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("./database/mongoDBConnection");

const userRoutes = require("./routes/userRoutes");
const fileRoutes = require("./routes/fileRoutes");
const systemRoutes = require("./routes/systemRoutes");
const directoryRoutes = require("./routes/directoryRoutes");
const clipboardRoutes = require("./routes/clipBoardRoutes");

app.use(bodyParser.json());
app.use(userRoutes);
app.use(fileRoutes);
app.use(systemRoutes);
app.use(directoryRoutes);
app.use(clipboardRoutes);

app.get("/", (req, res) => {
  return res.status(200).json("Hello World!");
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
