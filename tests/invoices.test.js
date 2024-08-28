const request = require('supertest');
const app = require('../app');
const db = require('../db');

beforeEach(async () => {
  // Reset the ID sequences for tables
  await db.query("ALTER SEQUENCE invoices_id_seq RESTART WITH 1");
  
  // Insert fresh data
  await db.query("DELETE FROM invoices");
  await db.query("DELETE FROM companies");

  await db.query(`INSERT INTO companies (code, name, description)
      VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
             ('ibm', 'IBM', 'Big blue.')`);
  
  await db.query(`
      INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date)
      VALUES ('apple', 100, false, '2023-08-25', null),
             ('apple', 200, true, '2023-08-24', '2023-08-24'),
             ('ibm', 300, false, '2023-08-23', null);
  `);
});

afterEach(async () => {
    // Rollback the transaction after each test to ensure a clean state
    await db.query("ROLLBACK");
});

afterAll(async () => {
    // Close the database connection
    await db.end();
});

describe("GET /invoices", () => {
    test("it should respond with an array of invoices", async () => {
        const response = await request(app).get("/invoices");
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            invoices: [
                { id: 1, comp_code: "apple" },
                { id: 2, comp_code: "apple" },
                { id: 3, comp_code: "ibm" },
            ],
        });
    });
});

describe("GET /invoices/:id", () => {
  test("It should return details of a specific invoice", async () => {
      const response = await request(app).get("/invoices/1");
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
          invoice: {
              id: 1,
              amt: 100,
              paid: false,
              add_date: "2023-08-25T07:00:00.000Z", // Expect the full ISO format
              paid_date: null,
              comp_code: "apple", // Include the comp_code field
              company: {
                  code: "apple",
                  name: "Apple Computer",
                  description: "Maker of OSX.",
              },
          },
      });
  });

  test("It should return 404 for a non-existent invoice", async () => {
      const response = await request(app).get("/invoices/999");
      expect(response.statusCode).toBe(404);
  });
});

describe("POST /invoices", () => {
    test("It should create a new invoice", async () => {
        const response = await request(app)
            .post("/invoices")
            .send({ comp_code: "ibm", amt: 400 });
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
            invoice: {
                id: 4,
                comp_code: "ibm",
                amt: 400,
                paid: false,
                add_date: expect.any(String),
                paid_date: null,
            },
        });
    });
});


describe("PUT /invoices/:id", () => {
  test("It should update an existing invoice", async () => {
      const response = await request(app)
          .put("/invoices/1")
          .send({ amt: 500, paid: true });
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
          invoice: {
              id: 1,
              comp_code: "apple",
              amt: 500,
              paid: true,
              add_date: "2023-08-25T07:00:00.000Z", // Expect the full ISO format
              paid_date: expect.any(String), // Expect any valid date string
          },
      });
  });

  test("It should return 404 for updating a non-existent invoice", async () => {
      const response = await request(app)
          .put("/invoices/999")
          .send({ amt: 500 });
      expect(response.statusCode).toBe(404);
  });
});

describe("DELETE /invoices/:id", () => {
    test("It should delete an invoice", async () => {
        const response = await request(app).delete("/invoices/1");
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ status: "deleted" });
    });

    test("It should return 404 for deleting a non-existent invoice", async () => {
        const response = await request(app).delete("/invoices/999");
        expect(response.statusCode).toBe(404);
    });
});
