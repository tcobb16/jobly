const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


class Jobs{
    static async create({ companyHandle, title, salary, equity }) {
        const result = await db.query(
                `INSERT INTO jobs
                (company_handle, title, salary, equity)
                VALUES ($1, $2, $3, $4)
                RETURNING company_handle AS "companyHandle", title, salary, equity`,
            [
                companyHandle,
                title,
                salary,
                equity
            ],
        );
        const jobs = result.rows[0];

        return jobs;
    }

    static async findAll(title, minSalary, hasEquity) {
        let q = `SELECT company_handle AS "companyHandle",
                title,
                salary,
                equity
            FROM jobs`;
        let whereAdded = false;
        if(title) {
            q = `${q} WHERE title = '${title}'`;
            whereAdded = true;
        }
        if(minSalary) {
            if(whereAdded) {
                q = `${q} AND salary >= ${minSalary}`;
            } else {
                q = `${q} WHERE salary >= ${minSalary}`;
            }
            whereAdded = true;
        }
        if(hasEquity) {
            if(whereAdded) {
                q = `${q} AND equity > 0`;
            } else {
                q = `${q} WHERE equity > 0`;
            }
            whereAdded = true;
        }
        q = `${q} ORDER BY company_handle`;
        const jobsRes = await db.query(q);
        return jobsRes.rows;
    }
}

module.exports = Jobs;