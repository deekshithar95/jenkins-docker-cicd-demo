const request = require("supertest");
const app = require("../src/server");

describe("Application API", () => {
    test("GET / should return application information", async () => {
        const response = await request(app).get("/");

        expect(response.statusCode).toBe(200);
        expect(response.body.application).toBe(
            "Jenkins Docker CI/CD Demo"
        );
        expect(response.body.status).toBe("running");
    });
});