var bodyParser = require('body-parser');
var urlencodedParser =  bodyParser.urlencoded({ extended: false }); // encoding the post parameters
var jsonParser = bodyParser.json(); // using json for the objects
var sql = require('mssql');

module.exports = function(app, io){
   
var socket = io.listen(server);   
    
socket.on('connection', function(socket) {
  console.log('socket.io connected');
  
socket.on('data', function(data) {
    
    console.log("In data post");
    
     var config = {
            user: 'sa',
            password: 'acd@123',
            server: '10.184.56.41',
            database: 'USERMANAGEMENT',
            port: 1433,
            stream: true,
            requestTimeout:0
        };
    
   
        sql.connect(config, function(err) {

            var request = new sql.Request();
            request.verbose = true;
            var jsonoutput = [];
            var jsonArray = {};
   
            var poly = "POLYGON((50.473594665527344 26.13016553770187,50.49659729003906 26.137254698472056,50.501747131347656 26.15482163306069,50.47393798828125 26.161292995018663,50.465354919433594 26.148658097467425,50.46947479248047 26.135097173359778,50.473594665527344 26.13016553770187))";
            
            request.input('operator', sql.VarChar(50), 'Batelco_TR');
            request.input('technology', sql.VarChar(50), 'UMTS');
            request.input('kpi', sql.VarChar(50), 'UMTS_Active_RSCP_dBm0');
            request.input('polygonstring', sql.VarChar(500),poly);
            request.input('Account', sql.VarChar(50), 'BaTelCo');
            request.input('UserID', sql.VarChar(50), 'epunina');
            request.input('Zoom', sql.VarChar(50), '20');
            request.input('Randnum', sql.VarChar(50), '12345');
            request.input('Date1', sql.VarChar(50), '2016-02-08');
            request.input('Date2', sql.VarChar(50), '2016-02-10');
            request.execute('[dbo].[sp_getAllData_v5]');
            
            request.on('row', function(row) {
               
            socket.emit('single_row', JSON.stringify(row));

            });  
        }) ;
});

});  
        
}