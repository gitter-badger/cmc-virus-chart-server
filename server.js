var sql = require('mssql'),
    express = require('express'),
    Q = require('q'),
    bodyParser = require('body-parser'),
    app = express(),
    crypto = require('crypto'),
    generatedTokens = [],
    sqlConfig = {
      user: 'sa',
      password: '123',
    //  server: 'subnet2.noip.me', // You can use 'localhost\\instance' to connect to named instance
      server: '192.168.225.53',
      database: 'cisegate',
      port: '1219',

      options: {
        encrypt: true // Use this if you're on Windows Azure
      }
    };


var getDataWithQuery = function (query, callback) {
  sql.connect(sqlConfig, function (err) {
    // ... error checks
    if (err) {
      console.log('err: ' + err);
      callback('Error:' + err);
    }
    var request = new sql.Request();
    request.query(query, function (err, recordset) {
      // ... error checks
      if (err) {
        console.log('err: ' + err);
        callback('Error:' + err);
      }
      callback(recordset);
//      console.dir(recordset);
    });
  });
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.all("/*", function (req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Headers', 'Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST');
  return next();
});

/*
Precheck access to all api routes and block if valid token not presented
 */
app.post('/api/*', function (req, res, next) {
  if (validTokenProvided(req.body.token)){
    return next();
  }
  else {
    res.status(401).send();
    return;
  }

});

var generateToken = function () {
  var token = crypto.randomBytes(48).toString('hex');
  generatedTokens.push(token);

  return token;
};

var validTokenProvided = function(token) {
  console.log('requested with token = ' + token);
  if (token && generatedTokens.indexOf(token) > -1) {
    return true;
  }
  else return false;
};

app.post('/auth.json', function (req, res) {
  var username = encodeURIComponent(req.body.username);
  var password = encodeURIComponent(req.body.password);
  getDataWithQuery("select top 1 * from users where username = '"+username+"' and password = '"+password+"'",
    function (data) {
      console.dir(data);
      if (data.length > 0)
      {
        res.send({token: generateToken()});
      }
      else
        res.status(401).send();
    });
});

app.post('/api/server-clients-count.json', function (req, res) {
  getDataWithQuery("select * from vw_server_clients_count",
    function (data) {
//        console.dir(data);
      console.dir(req.body);
      res.send(data);
    });
});


app.post('/api/server-infected-clients-lastest.json', function (req, res) {
  getDataWithQuery("exec server_with_infected_clients_lastest",
    function (data) {
//        console.dir(data);
      res.send(data);
    });
});

app.post('/api/top-10-infected-clients-lastest.json', function (req, res) {
  getDataWithQuery("exec top_10_infected_clients_lastest",
    function (data) {
//        console.dir(data);
//        res.status(400).end();
      res.send(data);
    });
});

app.post('/api/top-10-infected-lastest.json', function (req, res) {
  getDataWithQuery("exec top_10_infected_lastest",
    function (data) {
//        console.dir(data);
//        res.status(400).end();
      res.send(data);
    });
});

app.listen(8080);

//app.post('/get-tables', function(request, response){
//  getDataWithQuery("SELECT TABLE_NAME FROM INFORMATION_SCHEMA." +
//      "TABLES WHERE TABLE_TYPE = 'BASE TABLE' ",
//      function(data){
//        response.send(data);
//      });
//});

//app.post('/get-clients', function(request, response){
//  getDataWithQuery("select * from clients",
//                function(data){
////                  console.dir(data);
//                  response.send(data);
//                });
//});


//sql.connect(sqlConfig, function (err) {
//  var request = new sql.Request();
//  request.input('input_parameter', sql.Int, 3);
//  request.output('output_parameter', sql.VarChar(50));
//  request.execute('procedure_name', function (err, recordsets, returnValue) {
//    // ... error checks
//    console.dir(recordsets);
//  });
//});
