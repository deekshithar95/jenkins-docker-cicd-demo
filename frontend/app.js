const BACKEND_URL = "http://localhost:5000";

async function checkHealth() {
    const statusElement = document.getElementById("status");

    try {
        const response = await fetch(`${BACKEND_URL}/api/health`);

        const data = await response.json();

        if (response.ok) {
            statusElement.textContent =
                `Backend: ${data.status} | Database: ${data.database}`;
        } else {
            statusElement.textContent = "Backend is unavailable";
        }

    } catch (error) {
        console.error("Health check error:", error);

        statusElement.textContent =
            "Unable to connect to backend";
    }
}

async function loadProducts() {
    const productsElement = document.getElementById("products");

    try {
        const response =
            await fetch(`${BACKEND_URL}/api/products`);

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error("Failed to load products");
        }

        if (data.products.length === 0) {
            productsElement.innerHTML =
                "<p>No products available.</p>";

            return;
        }

        productsElement.innerHTML = data.products
            .map(product => `
                <div class="product">
                    <h3>${product.name}</h3>

                    <p class="price">
                        ₹${Number(product.price).toFixed(2)}
                    </p>

                    <p>
                        ${product.description || "No description"}
                    </p>
                </div>
            `)
            .join("");

    } catch (error) {
        console.error("Product loading error:", error);

        productsElement.innerHTML =
            "<p>Failed to load products.</p>";
    }
}

checkHealth();
loadProducts();