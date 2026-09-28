require("dotenv").config();

const express = require("express");
const cors = require("cors");

const db = require("./db");
const productsRouter = require("./routes/products");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Root endpoint
app.get("/", (req, res) => {
    res.json({
        application: "Jenkins Docker CI/CD Demo",
        status: "running"
    });
});

// Health check
app.get("/api/health", async (req, res) => {
    try {
        await db.query("SELECT 1");

        res.status(200).json({
            status: "UP",
            database: "CONNECTED",
            message: "Application is healthy"
        });
    } catch (error) {
        console.error("Health check failed:", error);

        res.status(503).json({
            status: "DOWN",
            database: "DISCONNECTED",
            message: "Application is unhealthy"
        });
    }
});

// Product API
app.use("/api/products", productsRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Start server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;