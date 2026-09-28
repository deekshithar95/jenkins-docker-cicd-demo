const express = require("express");
const db = require("../db");

const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, name, price, description FROM products ORDER BY id DESC"
        );

        res.json({
            success: true,
            count: rows.length,
            products: rows
        });
    } catch (error) {
        console.error("Database error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch products"
        });
    }
});

// Create a product
router.post("/", async (req, res) => {
    try {
        const { name, price, description } = req.body;

        if (!name || price === undefined) {
            return res.status(400).json({
                success: false,
                message: "Name and price are required"
            });
        }

        const [result] = await db.query(
            "INSERT INTO products (name, price, description) VALUES (?, ?, ?)",
            [name, price, description || null]
        );

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            productId: result.insertId
        });
    } catch (error) {
        console.error("Database error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create product"
        });
    }
});

module.exports = router;