const express = require("express");
const { PORT, HOST } = require("./config");
const morgan = require("morgan");
const cors = require("cors");
const { checkAuthentication } = require("./middlewares/authMiddleware");

const app = express();

const adminRoutes = require("./routes/adminRoutes");
const courseRoutes = require("./routes/courseRoutes");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const videoRoutes = require("./routes/videoRoutes");

// Middlewares
app.use(express.json());
app.use(cors());
app.use(checkAuthentication);
app.use(morgan("dev"));

// Routes
app.use("/admin", adminRoutes);
app.use("/course", courseRoutes);
app.use("/auth", authRoutes);
app.use("/video", videoRoutes);
app.use("/student", studentRoutes);

app.listen(PORT, HOST, () => {
  console.log(`Server Started at: http://${HOST}:${PORT}/`);
});
