const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error("FATAL ERROR: MONGO_URI and JWT_SECRET are required in .env");
  process.exit(1);
}

const app = express();

// Security HTTP headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use("/api", limiter);

app.use(cors());
app.use(express.json());

const connectDB = require("./config/db");
connectDB();

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/donors", require("./routes/donorRoutes"));
app.use("/api/hospitals", require("./routes/hospitalRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/search", require("./routes/searchRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

