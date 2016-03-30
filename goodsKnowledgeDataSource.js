"use strict";
var sql = require('mssql'),
    Promise = require("bluebird");

sql.Promise = Promise;

var config = {
    user: 'branchgoods_readonly',
    password: 'branchgoods_readonly',
    server: '10.53.1.155', // You can use 'localhost\\instance' to connect to named instance 
    database: 'BranchGoodsKnowledge',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
}


var goodsPagingQueryString = `
with Goods_cte as (
     select GOODS_ID, G_NAME, CODE_TS, SUBSTRING(GOODS_DESC,1,50) as GOODS_DESC, GOODS_ORDER_NO
     from GENERAL_GOODS_INFO
     where IS_PUBLISH = 1 and (
           CODE_TS like '%'+@keyword+'%' 
           or G_NAME like '%'+@keyword + '%'
           )
)

select * from (
    select ROW_NUMBER() OVER(ORDER BY GOODS_ORDER_NO,CODE_TS) AS NUMBER, GOODS_ID, G_NAME, CODE_TS, GOODS_DESC,GOODS_ORDER_NO,
    tCountGoods.CountGoods as TOTAL_ROWS
    from Goods_cte
    cross join (select count(*) as CountGoods from Goods_cte) as tCountGoods
) AS TBL
where NUMBER BETWEEN((@pageNumber-1)*@pageSize+1) AND (@pageNumber*@pageSize)
order by NUMBER
`;

var goodsDetailQueryString = `
select G_NAME,CODE_TS,GOODS_DESC from GENERAL_GOODS_INFO where GOODS_ID = @goodsId;
select THUMBNAIL, TITLE, FILE_ID from GENERAL_GOODS_PIC where GOODS_ID = @goodsId;
select LOW_RATE, COMPLEX.TAX_RATE, REG_RATE, OUT_RATE,CONTROL_MARK, OUT_TAXRATE.TAX_RATE as RETURN_RATE, HS_POINTS
from COMPLEX 
join GENERAL_GOODS_INFO on GENERAL_GOODS_INFO.CODE_TS = COMPLEX.CODE_TS
left join DECLARE_STANDARD on DECLARE_STANDARD.HS_CODE = GENERAL_GOODS_INFO.CODE_TS
left join OUT_TAXRATE on OUT_TAXRATE.CODE_TS = GENERAL_GOODS_INFO.CODE_TS
where GOODS_ID = @goodsId;
`;

class GoodsKnowledgeDataSource {
    constructor(){
        this.connection = null;
    }
    init() {
        var that = this;
        return new Promise(function(resolve,reject){
            that.connection = new sql.Connection(config,function(err){
                if(err){
                    console.error(err);

                    return reject(err);
                }
                resolve();
            });
        }).then(function(){
            that.connection.on('error',function(err){
                console.error(err);
                process.exit(1);
            });
            process.on('exit',(code,signal)=>{
                console.log("closing connection");
                if(that.connection) {
                    console.log("closing GoodsDataSource connection");
                    that.connection.close();
                    that.connection = null;
                }
            });
        });
    }

    getGoodsData(keyword,pageSize, pageNumber) {
        var request = new sql.Request(this.connection);
        request.input('keyword',sql.NVarChar(100),keyword);
        request.input('pageSize',sql.Int,pageSize);
        request.input('pageNumber',sql.Int,pageNumber);
        return request.query(goodsPagingQueryString);
    }

    getPhotosByGoodsId(goodsId) {
        var request = new sql.Request(this.connection);
        request.multiple = true;
        request.input('goodsId',goodsId);
        return request.query(goodsDetailQueryString)
                    .then(function(recordsets){
                        var ret;
                        if(recordsets[0].length > 0) { // general info
                            ret = recordsets[0][0];
                        } else {
                            return null;
                        }

                        ret.THUMBNAILS = recordsets[1].map((row)=>{ // thumbnails
                            return {
                                "DATA": "data:image/jpeg;base64,"+row.THUMBNAIL.toString("base64"),
                                "FILE_ID": row.FILE_ID,
                                "TITLE": row.TITLE
                            }
                        });
                        if(recordsets[2][0]) { // tax rate
                            for(let p in recordsets[2][0]) {
                                ret[p] = recordsets[2][0][p];
                            }
                        }
                        return ret;
                    });
    }
    getPhoto(fileId) {
        var request = new sql.Request(this.connection);
        request.input('fileId',fileId);
        return request.query("select top 1 TITLE+'.jpg' as FILE_NAME, FILE_SAVE from GENERAL_GOODS_PIC where FILE_ID = @fileId")
                    .then(function(recordset){
                        return recordset[0];
                    });
    }
}

module.exports = GoodsKnowledgeDataSource;
