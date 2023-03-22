const db = require("../db.js");
const Jobs = require("./jobs.js");
const Company = require("./company.js");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
  } = require("./_testCommon");
  
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);
  
describe("jobs", () => {
    const newCompany = {
        handle: "new",
        name: "New",
        description: "New Description",
        numEmployees: 1,
        logoUrl: "http://new.img",
    };
    

    const job = () => {return {
        companyHandle: "new",
        title: "new",
        salary: 12,
        equity: "1"
    }};

    test ("create", async () =>{
        await Company.create(newCompany);

        const newJob = job();
        const createdJob = await Jobs.create(newJob);
        expect(createdJob).toEqual(newJob);

        const result = await db.query(
            `SELECT company_handle as "companyHandle", title, salary, equity
             FROM jobs
             WHERE company_handle = 'new'`);
        expect(result.rows).toEqual([
            newJob
        ]);
    })
});