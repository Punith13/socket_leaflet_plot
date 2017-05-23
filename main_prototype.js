var express = require('express');
var app = express()
   , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);
  
var fs = require('fs');
var port = 3700;

// webserver on port 3700
server.listen(port); 

var sql = require('mssql');

var socket = io.listen(server);

// Custom event emitter 

const EventEmitter = require('events');
const util = require('util');

function MyEmitter() {
  EventEmitter.call(this);
}
util.inherits(MyEmitter, EventEmitter);

const myEmitter = new MyEmitter();

//use static files in ROOT/public folder
app.use(express.static(__dirname + '/public')); 

// Pipe stream index.html 

app.get("/", function(req, res){ 
   res.writeHead(200,{"Context-Type":"text/html"});
	fs.createReadStream("index.html").pipe(res);
});


socket.on('connection', function(socket) {
    
var random = parseInt(Math.random()*10000);
    
var jsonoutput = [];
var jsonBufferArray = [];
console.log('socket.io connected');
  
socket.on('data', function(data) {
console.log(data.firstname);
 
 var config = {
     user: 'sa',
     password: 'acd@123',
     server: '10.184.56.41',
     database: 'USERMANAGEMENT',
     port: 1433,
     stream: true,
     requestTimeout: 0
 };
    
  
 sql.connect(config, function(err) {
     
     var counter = 0;
     var request = new sql.Request();
     socket.emit('ConnectDB' , 'DBConnect');

     var poly = "POLYGON((50.480804443359375 26.040743577081134, 50.61195373535156 26.141261425055767, 50.67649841308594 26.195492799699977, 50.712890625 26.204118192100207, 50.659332275390625 26.305110877819093, 50.590667724609375 26.306957486827372, 50.56251525878906 26.251546424213046, 50.469818115234375 26.234917947598124, 50.4217529296875 26.212126912880876, 50.45196533203125 26.12831612064242, 50.464324951171875 26.05184794762951, 50.480804443359375 26.040743577081134))";

     request.input('operator', sql.VarChar(50), 'Batelco_TR');
     request.input('technology', sql.VarChar(50), 'UMTS');
     request.input('kpi', sql.VarChar(50), 'UMTS_Active_RSCP_dBm0');
     request.input('polygonstring', sql.VarChar(500), poly);
     request.input('Account', sql.VarChar(50), 'BaTelCo');
     request.input('UserID', sql.VarChar(50), 'epunina');
     request.input('Zoom', sql.VarChar(50), '18');
     request.input('Randnum', sql.VarChar(50), random);
     request.input('Date1', sql.VarChar(50), '2016-01-08');
     request.input('Date2', sql.VarChar(50), '2016-02-10');
     request.execute('[dbo].[sp_getAllData_v5]');
     socket.emit('ExecuteDB' , 'ExecuteDB');
    
     var firstrowcounter =0; 
     var Plottingflag = 0;
     
     request.on('row', function(row) {
         jsonoutput.push(row);
        
         if(Plottingflag == 0)
         {
         firstrowcounter++; 
         }

         if(firstrowcounter == 1000)
         {
          myEmitter.emit('1000event');
          firstrowcounter = 0;
         }
     });

     myEmitter.on('1000event', () => {
        
         Plottingflag = 1;
         
         jsonBufferArray = [];
         jsonBufferArray.push(jsonoutput.shift())
         socket.emit('single_row', jsonBufferArray);
         
         socket.on('doneplotting', function() {

             jsonBufferArray = [];
           
             for (var i = 0; i <= 1000; i++) 
             {    
                 var a = jsonoutput.shift();
                 if(a !== undefined)
                 {
                 jsonBufferArray.push(a);
                 }
                 counter++; 
             }
                 
             if(counter < 100000 ) 
             {
                 if(jsonBufferArray.length > 0)
                 {
              socket.emit('single_row', jsonBufferArray);
                 }
                 else
                 {
              socket.emit('donesending' , 'Completed work');     
                 }
             }
         });
     });
     
       request.on('done', function(affected) {
      
         if(Plottingflag == 0)
         { 
         jsonBufferArray = [];
         jsonBufferArray.push(jsonoutput.shift())
         socket.emit('single_row', jsonBufferArray);
         
         socket.on('doneplotting', function() {
            
             jsonBufferArray = [];
           
             for (var i = 0; i <= 1000; i++) 
             {    
                 var a = jsonoutput.shift();
                 if(a !== undefined)
                 {
                 jsonBufferArray.push(a);
                 counter++; 
                 }
                 
             }
                 
             if(counter < 100000 ) 
             { 
                 if(jsonBufferArray.length > 0)
                 {         
              socket.emit('single_row', jsonBufferArray);
                 }
                 else
                 {
              socket.emit('donesending' , 'Completed work');     
                 }
             }
         });
         }
     });   
    
     
 });
  
});

});

//var mssqlRoute = require('./mssqlroute');
//mssqlRoute(app);