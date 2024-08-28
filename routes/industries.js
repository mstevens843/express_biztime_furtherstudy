const express = require('express'); 
const router = new express.Router(); 
const db = require('../db'); 
const expressError = require('../expressError'); 

// GET /industries - Get list of industries 
router.get('/', async (req, res, next) => {
    try {
        const result = await db.query(`SELECT * FROM industries`);
        return res.json({ industries: result.rows });  // Fixed typo here
    } catch(err) {
        return next(err);
    }
}); 

// POST /industries - Add a new Industry
router.post('/', async(req, res, next) => {
    try {
        const { code, industry } = req.body; 
        const result = await db.query(
            `INSERT INTO industries (code, industry)
            VALUES ($1, $2)
            RETURNING code, industry`,
            [code, industry]
        );
        return res.status(201).json({ industry: result.rows[0] }); 
    } catch(err) {
        return next(err);
    }
});

// POST /companies/:code/industries - Associate a company with an industry
router.post('/companies/:code/industries', async (req, res, next) => {
    try {
        const { code } = req.params;
        const { industry_code } = req.body;

        const result = await db.query(
            `INSERT INTO company_industries (comp_code, industry_code)
            VALUES ($1, $2)
            RETURNING comp_code, industry_code`,
            [code, industry_code]
        );
        return res.status(201).json({ association: result.rows[0] }); 
    } catch(err) {
        return next(err);
    }
});

module.exports = router;
