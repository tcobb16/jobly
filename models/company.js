"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
          `SELECT handle
           FROM companies
           WHERE handle = $1`,
        [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
          `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
        [
          handle,
          name,
          description,
          numEmployees,
          logoUrl,
        ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * 
   * Checks for added params for name, minEmployees, and/or maxEmployees. If any combination of those params are present those params are added to the query.
   * */

  static async findAll(name, minEmployees, maxEmployees) {
    let q = `SELECT handle,
          name,
          description,
          num_employees AS "numEmployees",
          logo_url AS "logoUrl"
      FROM companies`;
    let whereAdded = false;
    if(name) {
      q = `${q} WHERE name = '${name}'`;
      whereAdded = true;
    }
    if(minEmployees) {
      if(whereAdded) {
        q = `${q} AND num_employees >= ${minEmployees}`;
      } else {
        q = `${q} WHERE num_employees >= ${minEmployees}`;
      }
      whereAdded = true;
    }
    if(maxEmployees) {
      if(whereAdded) {
        q = `${q} AND num_employees <= ${maxEmployees}`;
      } else {
        q = `${q} WHERE num_employees <= ${maxEmployees}`;
      }
      whereAdded = true;
    }
    q = `${q} ORDER BY name`;
    const companiesRes = await db.query(q);
    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
          `SELECT c.name,
                  c.description,
                  c.num_employees AS "numEmployees",
                  c.logo_url AS "logoUrl",
                  j.id,
                  j.title,
                  j.salary,
                  j.equity
           FROM companies c
           JOIN jobs j on j.company_handle = c.handle
           WHERE handle = $1`,
        [handle]);


    if (!companyRes.rows[0]) throw new NotFoundError(`No company: ${handle}`);

    const { name, description, numEmployees, logoUrl } = companyRes.rows[0];
    const jobs = [];
    for(const row of companyRes.rows) {
      const { id, title, salary, equity } = row;
      jobs.push(
        {
          id: id,
          title: title,
          salary: salary,
          equity: equity,
        }
      );
    }

    return {
      handle: handle,
      name: name,
      description: description,
      numEmployees: numEmployees,
      logoUrl: logoUrl,
      jobs: jobs,
    };
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
          `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
        [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;
