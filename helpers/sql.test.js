const { BadRequestError } = require('../expressError');
const { sqlForPartialUpdate } = require('./sql');

describe("sqlForPartialUpdate", ()=>{
    test('success given two arguments, one has snake case column name', ()=> {
        const dataToUpdate = {cellphone: "123-456-7890", emailAddress: 'test@test.com'};
        const jsToSql = {emailAddress: 'email_address'};
        const res = sqlForPartialUpdate(dataToUpdate, jsToSql);
        
        expect(res.setCols).toEqual('"cellphone"=$1, "email_address"=$2');
        expect(res.values).toEqual(['123-456-7890', 'test@test.com']);
    });

    test('success given no arguments', ()=> {
        const dataToUpdate = {};
        const jsToSql = {};
        
        expect(()=>sqlForPartialUpdate(dataToUpdate, jsToSql)).toThrow(BadRequestError);
    });
})