\c biztime_test

DROP TABLE IF EXISTS company_industries;
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK (amt > 0)
);

-- Create industries table
CREATE TABLE industries (
    code text PRIMARY KEY,
    industry text NOT NULL
);

-- Create company_industries table
CREATE TABLE company_industries (
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    industry_code text NOT NULL REFERENCES industries ON DELETE CASCADE,
    PRIMARY KEY (comp_code, industry_code)
); 

-- Insert data into companies
INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.');

-- Insert data into invoices
INSERT INTO invoices (comp_code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);

-- Insert data into industries
INSERT INTO industries
  VALUES ('tech', 'Technology'),
         ('finance', 'Finance'),
         ('retail', 'Retail');

-- Insert data into company_industries
INSERT INTO company_industries (comp_code, industry_code)
  VALUES ('apple', 'tech'),
         ('ibm', 'tech'),
         ('ibm', 'finance');
