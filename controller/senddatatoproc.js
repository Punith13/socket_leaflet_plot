
module.exports = function(socket)
{
    
var rfdb = require('./retrievedatafromdb');
    
var random = parseInt(Math.random()*10000);

console.log('socket.io connected');

var sql = require('mssql');

var receiver; 
var noofobj = 0;
var emitter; 
  
socket.on('data', function(data) {

receiver =  data.receiver ; 
emitter = data.emitter;
noofobj = parseInt(data.noofobj) ; 
 
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
    
     var request = new sql.Request();
     socket.emit('ConnectDB' , 'DBConnect');

     var poly = "POLYGON((50.480804443359375 26.040743577081134, 50.61195373535156 26.141261425055767, 50.67649841308594 26.195492799699977, 50.712890625 26.204118192100207, 50.659332275390625 26.305110877819093, 50.590667724609375 26.306957486827372, 50.56251525878906 26.251546424213046, 50.469818115234375 26.234917947598124, 50.4217529296875 26.212126912880876, 50.45196533203125 26.12831612064242, 50.464324951171875 26.05184794762951, 50.480804443359375 26.040743577081134))";

     request.input('operator', sql.VarChar(50), 'Batelco_TR');
     request.input('technology', sql.VarChar(50), 'UMTS');
     request.input('kpi', sql.VarChar(50), 'UMTS_Active_RSCP_dBm0');
     request.input('polygonstring', sql.VarChar(500), poly);
     request.input('Account', sql.VarChar(50), 'BaTelCo');
     request.input('UserID', sql.VarChar(50), 'epunina');
     request.input('Zoom', sql.VarChar(50), '19');
     request.input('Randnum', sql.VarChar(50), random);
     request.input('Date1', sql.VarChar(50), '2016-01-08');
     request.input('Date2', sql.VarChar(50), '2016-02-10');
     socket.emit('ExecuteDB' , 'ExecuteDB');
     request.execute('[dbo].[sp_getAllData_v5]');
    
     rfdb(request , socket , receiver , emitter,  noofobj);  
       
 });
      
 });
 
// plot sectors  
 
socket.on('plot_sectors' , function(data){
    
receiver =  data.receiver ; 
emitter = data.emitter;
noofobj = parseInt(data.noofobj) ; 
    
  var config = {
     user: 'sa',
     password: 'dell@123',
     server: '10.184.56.41\\EMATIX',
     database: 'Usrmngmt_Account_KKPINNACLE',
     port: 1433,
     stream: true,
     requestTimeout: 0
 };
       
  sql.connect(config, function(err) {
  
     var request = new sql.Request();
     socket.emit('ConnectDB','DBConnect');
     
     request.query("SELECT [Latitude] ,[Longitude] ,[Azimuth] FROM [site_upload] where Operator = 'Airtel' and Technology = 'CustComp' and versionid = 28");
     socket.emit('ExecuteDB' , 'ExecuteDB');
            
     rfdb(request , socket , receiver ,emitter, noofobj);  
       
 });   
    
    
});


// Plot Drop Call Reasons . 

socket.on('plot_dropCall' , function(data){

console.log(data.dropReason);
    
receiver =  data.receiver ; 
emitter = data.emitter;
noofobj = parseInt(data.noofobj) ; 
    
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
    
     var request = new sql.Request();

     socket.emit('ConnectDB' , 'DBConnect');

     var poly = "POLYGON((44.95159149169922 32.93464052174691,44.94077682495117 32.891984367967275,45.005836486816406 32.85002872678845,45.04291534423828 32.94342859314646,44.9970817565918 32.95581684949438,44.95159149169922 32.93464052174691))";

     request.input('operator', sql.VarChar(50), 'Zain_TR');
     request.input('technology', sql.VarChar(50), 'UMTS');
     request.input('polygonstring', sql.VarChar(500), poly);
     request.input('Account', sql.VarChar(50), 'Zain');
     request.input('UserID', sql.VarChar(50), 'epunina');
     request.input('Zoom', sql.VarChar(50), '20');
     request.input('Randnum', sql.VarChar(50), random);
     request.input('Date1', sql.VarChar(50), '2015-07-01');
     request.input('Date2', sql.VarChar(50), '2016-07-04');
     request.input('DropReason', sql.VarChar(5), data.dropReason);

     socket.emit('ExecuteDB' , 'ExecuteDB');
     request.execute('[dbo].[sp_getAllDataPerDropReason_v3]');
    
     rfdb(request , socket , receiver , emitter,  noofobj);  
       
 });
    
    
});




  
}