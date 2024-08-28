const request = require('supertest'); 
const app = require('../app');
const db = require('../db');

beforeEach(async () => {
  await db.query("DELETE FROM invoices");
  await db.query("DELETE FROM companies");
  await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
           ('ibm', 'IBM', 'Big blue.');
  `); 
  await db.query(`
    INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date)
    VALUES ('apple', 100, false, '2023-08-25', null),
           ('apple', 200, true, '2023-08-24', '2023-08-24'),
           ('ibm', 300, false, '2023-08-23', null);
  `);
});

afterEach(async () => {
  await db.query('DELETE FROM invoices'); // Clean up invoices as well
  await db.query('DELETE FROM companies'); 
}); 

afterAll(async () => {
  await db.end();
});

describe("GET /companies", () => {
  test('It should respond with an array of companies', async () => {
    const response = await request(app).get('/companies');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      companies: [
        { code: "apple", name: "Apple Computer" },
        { code: "ibm", name: "IBM" },
      ],
    });
  });
});

describe("GET /companies/:code", () => {
  test("It should return details of a specific company", async () => {
    const response = await request(app).get("/companies/apple");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      company: { 
        code: "apple", 
        name: "Apple Computer", 
        description: "Maker of OSX.", 
        industries: []  // Updated to include industries array
      },
    });
  });

  test("It should return 404 for a non-existent company", async () => {
    const response = await request(app).get("/companies/nonexistent");
    expect(response.statusCode).toBe(404);
  });
});

describe("POST /companies", () => {
  test("It should add a new company", async () => {
    const response = await request(app)
      .post("/companies")
      .send({ name: "Microsoft", description: "Software giant" });
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      company: { code: "microsoft", name: "Microsoft", description: "Software giant" }, // Updated to match slugify behavior
    });
  });
});

describe("PUT /companies/:code", () => {
  test("It should update an existing company", async () => {
    const response = await request(app)
      .put("/companies/apple")
      .send({ name: "Apple Inc.", description: "Tech giant" });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      company: { code: "apple", name: "Apple Inc.", description: "Tech giant" },
    });
  });

  test("It should return 404 for updating a non-existent company", async () => {
    const response = await request(app)
      .put("/companies/nonexistent")
      .send({ name: "No Name", description: "No Description" });
    expect(response.statusCode).toBe(404);
  });
});

describe("DELETE /companies/:code", () => {
  test("It should delete a company", async () => {
    const response = await request(app).delete("/companies/apple");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "deleted" });
  });

  test("It should return 404 for deleting a non-existent company", async () => {
    const response = await request(app).delete("/companies/nonexistent");
    expect(response.statusCode).toBe(404);
  });
});
