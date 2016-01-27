var express = require("express"),
    app = express();

var etgServices = require("./routes");

app.set('port', 3003);

etgServices.init().then(function(){
    app.use("/",etgServices.routes);
    app.listen(app.get('port'));
    console.log("app listening on port",app.get('port'));
});
