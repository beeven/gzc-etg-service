"use strict";
var sql = require('mssql'),
    Promise = require("bluebird");

sql.Promise = Promise;

var config = {
    user: 'risk_readonly',
    password: 'risk_readonly',
    server: '10.53.1.8\\mssql2008bin2', // You can use 'localhost\\instance' to connect to named instance 
    database: 'RiskH2000',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
}


class CompanyDataSource {
    constructor() {
        this.connection = null;
    }
    init() {
        var that = this;
        return new Promise(function(resolve,reject){
            that.connection = new sql.Connection(config, function(err){
                if(err) {
                    console.log(err);
                    return reject(err);
                } 
                resolve();
            });
            
        }).then(function(){
            that.connection.on('error',function(err){
                console.error(err);
                process.exit(1);
            });
            process.on('exit',(code)=>{
                if(that.connection) {
                    console.log("closing CompanyDataSource connection");
                    that.connection.close();
                    that.connection = null;
                }
            });
        });
    }
    getCompanyData(companyId) {
//        var queryStr ='select [FULL_NAME],[COP_GB_CODE],[TRADE_CO],[CONTAC_CO],[TEL_CO],[CUSTOMS_CODE] from [RiskH2000].[risk].[COMPANY_REL] where [RiskH2000].[risk].[COMPANY_REL].TRADE_CO = @Id';

        console.log("querying companyData by companyId:",companyId);
        var queryStr ='select [FULL_NAME],[COP_GB_CODE],[TRADE_CO],[CONTAC_CO],[MOBILE] as [TEL_CO],[CUSTOMS_CODE],[ADDR_CO],[LAW_MAN],[MOBILE] as [LAW_MAN_TEL],[SOCIAL_CREDIT_CODE] from [RiskH2000].[dbo].[COMPANY_REL_VIEW] where TRADE_CO = @Id';
        var request = new sql.Request(this.connection);
        request.input('Id',companyId);
        return request.query(queryStr).then(function(recordset){
            console.log("company query result:",recordset[0]);
            return recordset[0];
        });
    }
    getCompanyDataByOrgCo(orgCo) {
        var queryStr ='select TOP 1 [FULL_NAME], [COP_GB_CODE],[TRADE_CO],[CONTAC_CO],[MOBILE] as [TEL_CO],[CUSTOMS_CODE] from [RiskH2000].[dbo].[COMPANY_REL_VIEW] where COP_GB_CODE = @orgCo order by CHK_DATE desc';
        var request = new sql.Request(this.connection);
        request.input('orgCo',orgCo);
        return request.query(queryStr).then(function(recordset){
            return recordset[0];
        });
    }
    getCompanyDataBySCC(scc) {
        var queryStr ='select [FULL_NAME],[COP_GB_CODE],[TRADE_CO],[CONTAC_CO],[MOBILE] as [TEL_CO],[CUSTOMS_CODE],[ADDR_CO],[LAW_MAN],[MOBILE] as [LAW_MAN_TEL],[SOCIAL_CREDIT_CODE] from [RiskH2000].[dbo].[COMPANY_REL_VIEW] where SOCIAL_CREDIT_CODE = @Id';
        var request = new sql.Request(this.connection);
        request.input('Id',scc);
        return request.query(queryStr).then(function(recordset){
            console.log("company query result:",recordset[0]);
            return recordset[0];
        });
    }
    getCompanyAllData(companyId){
        var queryStr = 'select TOP 1 * from [RiskH2000].[dbo].[COMPANY_REL_VIEW] where TRADE_CO=@Id';
        var request = new sql.Request(this.connection);
        request.input('Id',companyId);
        return request.query(queryStr).then(function(recordset){
            return recordset[0];
        });
    }
}


module.exports = CompanyDataSource;
