var express = require("express"),
    router = express.Router(),
    Promise = require("bluebird");

var CompanyDataSource = require("./companyDataSource"),
    companyDS = new CompanyDataSource(),
    GoodsKnowledgeDataSource = require("./goodsKnowledgeDataSource"),
    goodsDS = new GoodsKnowledgeDataSource();


router.get("/company/getById/:companyId",function(req,res){
    companyDS.getCompanyData(req.params.companyId)
        .then(function(data){
            if(typeof(data) === 'undefined') {
                res.status(200).end();
            } else {
                res.status(200).json(data);
            }
        })
        .catch(function(err){
            res.status(500).end();
            console.error(err);
        });
});

router.get("/company/getByOrgCo/:orgCo",function(req,res){
    companyDS.getCompanyDataByOrgCo(req.params.orgCo)
        .then(function(data){
            if(typeof(data) === 'undefined') {
                res.status(200).end();
            } else {
                res.status(200).json(data);
            }
        })
        .catch(function(err){
            res.status(500).end();
            console.error(err);
        });
});
router.get("/company/getBySCC/:scc",function(req,res){
    companyDS.getCompanyDataBySCC(req.params.scc)
        .then(function(data){
            if(typeof(data) === 'undefined') {
                res.status(200).end();
            } else {
                res.status(200).json(data);
            }
        })
        .catch(function(err){
            res.status(500).end();
            console.error(err);
        });
});



router.get("/company/getAllData/:companyId",function(req,res){
    companyDS.getCompanyAllData(req.params.companyId)
        .then(function(data){
            if(typeof(data) === 'undefined') {
                res.status(200).end();
            } else {
                res.status(200).json(data);
            }
        })
        .catch(function(err){
            res.status(500).end();
            console.error(err);
        });
});

router.get("/goods/query/:keyword",function(req,res){
    var pageSize = req.query.pageSize || 20;
    var pageNumber = req.query.pageNumber || 1;
    var keyword = req.params.keyword;
    keyword = decodeURIComponent(keyword);
        console.log(keyword, pageSize,pageNumber);
    goodsDS.getGoodsData(keyword, pageSize, pageNumber).then(function(data){
        if(data.length > 0) {
            res.json({code:0, data:data});
        } else {
            res.json({code:1, error:"not found"});
        }
    })
    .catch(function(err){
        console.error(err);
        res.json({code:1,error: err});
    });
});

router.get("/goods/details/:goodsId",function(req,res) {
    goodsDS.getPhotosByGoodsId(req.params.goodsId).then(function(data){
        if(data) { 
            res.json({code:0,data:data});
        } else {
            res.json({code:1, error:"not found"});
        }
    })
    .catch(function(err){
        console.error(err);
        res.json({code:1,error:err});
    });
});

router.get("/goods/photo/:fileId",function(req,res) {
    goodsDS.getPhoto(req.params.fileId).then(function(data){
        res.attachment(data.FILE_NAME);
        res.append('Cache-Control','max-age=86400');
        res.send(data.FILE_SAVE);
    })
    .catch(function(err){
        console.error(err);
        res.status(500).end();
    });
});

router.get("/diagnostic/echo",function(req,res){
    res.end("echo");
});

router.get("/diagnostic/now",function(req,res){
    res.end((new Date()).toISOString());
});


exports.routes = router;
exports.init = function(){
   return Promise.all([companyDS.init(),goodsDS.init()]);
}
