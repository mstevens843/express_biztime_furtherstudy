const express = require('express'); 
const router = new express.Router(); 
const db = require('../db');
const ExpressError = require('../expressError'); 


// GET /invoices - Getr list of invoices 
router.get('/', async (req, res, next) => {
    try {
        const result = await db.query(`SELECT id, comp_code FROM invoices`); 
        return res.json({ invoices: result.rows }); 
    } catch (err){
        return next(err); 
    }
}); 


// GET /invoices/:id - get details of a single invoice 
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const invoiceResult = await db.query(
            `SELECT id, amt, paid, add_date, paid_date, comp_code
            FROM invoices WHERE id = $1`,
            [id]
        );

        if (invoiceResult.rows.length === 0) {
            throw new ExpressError("Invoice not found", 404);
        }
        const invoice = invoiceResult.rows[0]; 
        const companyResult = await db.query(
            `SELECT code, name, description
            FROM companies WHERE code = $1`,
            [invoice.comp_code]
        );
        invoice.company = companyResult.rows[0];
        return res.json({ invoice }); 
    } catch(err) {
        return next(err);
    }
}); 


// POST /invoices - Add a new invoice 
router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const result = await db.query(
            `INSERT INTO invoices (comp_code, amt)
            VALUES ($1, $2)
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [comp_code, amt]
        );
        return res.status(201).json({ invoice: result.rows[0] }); 
    } catch (err) {
        return next(err); 
    }
}); 

// PUT /invoices/:id - Edit existing invoice 
router.put('/:id', async (req, res, next) => { 
    try {
        const { id } = req.params; 
        const { amt } = req.body; 

        const result = await db.query(
            `UPDATE invoices SET amt=$1 WHERE id=$2
             RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [amt, id]
        );

        if (result.rows.length === 0) {
            throw new ExpressError("Invoice not found", 404); 
        }

        return res.json({ invoice: result.rows[0] }); 
    } catch (err) {
        return next(err);
    }
});



// DELETE /invoice/:id - Delete an invoice
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `DELETE FROM invoices WHERE id=$1
            RETURNING id`,
            [id]
        );

        if (result.rows.length === 0) {
            throw new ExpressError("Invoice not found", 404); 
        }

        return res.json({ status: "deleted"});
    } catch(err) {
        return next(err); 
    }
});

module.exports = router; 