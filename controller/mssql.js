var bodyParser = require('body-parser');
var urlencodedParser =  bodyParser.urlencoded({ extended: false }); // encoding the post parameters
var jsonParser = bodyParser.json(); // using json for the objects
var sql = require('mssql');

module.exports = function(app){
    
    app.post("/PSCReuse", jsonParser, function(req, res) {
       
        var config = {
            user: 'sa',
            password: 'dell@123',
            server: '10.184.56.41\\EMATIX',
            database: 'PSC_PCI',
            port: 1433,
            stream: true,
            requestTimeout:0
        };

        sql.connect(config, function(err) {
            
            var request = new sql.Request();
            var jsonoutput = [];

            console.log(req.body.lat); 
            console.log(req.body.long);

            console.log("exec GetReuseTableGroup_2 '" + req.body.lat + "','" + req.body.long + "','" + req.body.radius + "','" + req.body.offSet + "','" + req.body.project + "','" + req.body.propertyName + "','" + req.body.technologyVersion + "','" + req.body.signum + "'");
            
            
            request.input('lat', sql.VarChar(50), req.body.lat );
            request.input('long', sql.VarChar(50), req.body.long);
            request.input('radius', sql.VarChar(500), req.body.radius );
            request.input('offsetParam', sql.VarChar(50), req.body.offSet);
            request.input('Project', sql.VarChar(50),  req.body.project );
            request.input('PropertyName', sql.VarChar(50), req.body.propertyName );
            request.input('Technologyversion', sql.VarChar(50), req.body.technologyVersion);
            request.input('signum', sql.VarChar(50), req.body.signum );

            request.execute('[dbo].[GetReuseTableGroup_2]',function(err, recordsets, returnValue) {
             if(err) 
             {console.log(err)};
            
            });

            //request.query("exec GetReuseTableGroup_2 '" + req.body.lat + "','" + req.body.long + "','" + //req.body.radius + "','" + req.body.offSet + "','" + req.body.project + "','" + req.body.propertyName //+ "','" + req.body.technologyVersion + "','" + req.body.signum + "'");
           
            request.on('row', function(row){
                jsonoutput.push(row);
            });  
            
            request.on('done', function(affected){ 
               res.json(jsonoutput);
               sql.close();
            });
            
        });
        
    

    });


    app.post("/getPSCSector", jsonParser, function(req, res) {
       
        var config = {
            user: 'sa',
            password: 'dell@123',
            server: '10.184.56.41\\EMATIX',
            database: 'PSC_PCI',
            port: 1433,
            stream: true,
            requestTimeout:0
        };

        sql.connect(config, function(err) {
            
            

            var request = new sql.Request();
            var jsonoutput = [];

           console.log("exec GetPropertySector '" + req.body.lat + "','" + req.body.long + "','" + req.body.radius + "','" + req.body.project + "','" + req.body.propertyName + "','" + 
            req.body.propertyValue + "','" + req.body.technologyVersion + "','" + req.body.signum + "'");
            
            
            request.input('lat', sql.VarChar(50), req.body.lat );
            request.input('long', sql.VarChar(50), req.body.long);
            request.input('radius', sql.VarChar(500), req.body.radius );
            request.input('Project', sql.VarChar(50),  req.body.project );
            request.input('PropertyName', sql.VarChar(50), req.body.propertyName );
            request.input('PropertyValue', sql.VarChar(50), req.body.propertyValue );
            request.input('Technologyversion', sql.VarChar(50), req.body.technologyVersion);
            request.input('signum', sql.VarChar(50), req.body.signum );
            
            request.execute('[dbo].[GetPropertySector]');
            
           // request.query("exec GetPropertySector '" + req.body.lat + "','" + req.body.long + "','" + //req.body.radius + "','" + req.body.project + "','" + req.body.propertyName + "','" + 
           // req.body.propertyValue + "','" + req.body.technologyVersion + "','" + req.body.signum + "'");
           
            request.on('row', function(row){
                jsonoutput.push(row);
            });  
            
            request.on('done', function(affected){ 
               res.json(jsonoutput);
            });
            
        });

    });

    app.post("/initializeWorkSpace", jsonParser, function(req, res) {
       
        var config = {
            user: 'sa',
            password: 'dell@123',
            server: '10.184.56.41\\EMATIX',
            database: 'PSC_PCI',
            port: 1433,
            stream: true,
            requestTimeout:0
        };

        sql.connect(config, function(err) {

            var request = new sql.Request();

           console.log("exec [dbo].[InitializeWorkSpace] '" + req.body.project + "','" + req.body.propertyName + "','" + req.body.technologyVersion   + "','" + req.body.signum + "'");
            request.verbose = true; 
            
            request.input('Project', sql.VarChar(50),  req.body.project );
            request.input('PropertyName', sql.VarChar(50), req.body.propertyName );
            request.input('Technologyversion', sql.VarChar(50), req.body.technologyVersion);
            request.input('signum', sql.VarChar(50), req.body.signum );
            
            request.execute('[dbo].[InitializeWorkSpace]');
            
            //request.query("exec [dbo].[InitializeWorkSpace] '" + req.body.project + "','" + req.body.propertyName //+ "','" + req.body.technologyVersion   + "','" + req.body.signum + "'");

             request.on('row', function(row){
               res.send(row);
            });  

        });

    });


    app.post("/commitValues", jsonParser, function(req, res) {

        console.log(req.body.dataArray);
       
        var config = {
            user: 'sa',
            password: 'dell@123',
            server: '10.184.56.41\\EMATIX',
            database: 'PSC_PCI',
            port: 1433,
            stream: true,
            requestTimeout:0
        };

        sql.connect(config, function(err) {

            var request = new sql.Request();
            
            request.verbose = true;
            
            request.input('Circle' , sql.VarChar(50),  req.body.Circle );
            request.input('Operator' , sql.VarChar(50),  req.body.Operator );
            request.input('Technology' , sql.VarChar(50),  req.body.Technology );
            request.input('Sitename' , sql.VarChar(50),  req.body.Sitename );
            request.input('Cellname' , sql.VarChar(50),  req.body.Cellname );
            request.input('Latitude' , sql.VarChar(50),  req.body.Latitude );
            request.input('Longitude' , sql.VarChar(50),  req.body.Longitude );
            request.input('Azimuth' , sql.VarChar(50),  req.body.Azimuth );
            request.input('Status' , sql.VarChar(50),  req.body.Status );
            request.input('Beamwidth' , sql.VarChar(50),  req.body.Beamwidth );
            request.input('Propertyvalue' , sql.VarChar(50),  req.body.Propertyvalue );
            request.input('signum', sql.VarChar(50), req.body.signum );
            
            request.execute('[dbo].[insertToTemp]');

            // request.query("exec [dbo].[insertToTemp] '" + req.body.Circle + "','" + req.body.Operator + "','" + //req.body.Technology + "','" + req.body.Sitename + "','" + req.body.Cellname + "','" + //req.body.Latitude + "','" + req.body.Longitude + "','" + req.body.Azimuth + "','" + req.body.Status + //"','" + req.body.Beamwidth + "','" + req.body.Propertyvalue + "','" + req.body.Signum + "'");

            request.on('done', function(affected){ 
               res.send({ 'response' : 'Values Commited'});
            });

        });

    });

    app.post("/downloadValues", jsonParser, function(req, res) {

        console.log(req.body.dataArray);
       
        var config = {
            user: 'sa',
            password: 'dell@123',
            server: '10.184.56.41\\EMATIX',
            database: 'PSC_PCI',
            port: 1433,
            stream: true,
            requestTimeout:0
        };

        sql.connect(config, function(err) {

            var request = new sql.Request();
            var jsonoutput = [];

             request.query("SELECT [Circle],[Operator],[Technology],[Site Name],[Cell Name],[Latitude],[Longitude],[Azimuth],[Status],[Beamwidth],[PropertyValue] as NewValue ,isnull([OldValue],'') as OldValue FROM [Usrmngmt_Account_" + req.body.project + "].[dbo].[site_upload_temp] where ElementID is null or Oldvalue is not null and signum = '" + req.body.signum + "' delete from [Usrmngmt_Account_" + req.body.project + "].[dbo].[site_upload_temp] where signum = '" + req.body.signum + "'");

           request.on('row', function(row){
                jsonoutput.push(row);
            });  
            
            request.on('done', function(affected){ 
               res.json(jsonoutput);
            });

        });

    });


    app.post("/GetDropReasonsPie", jsonParser, function (req, res) {

        console.log(req.body.operator);

        var config = {
            user: 'sa',
            password: 'acd@123',
            server: '10.184.56.41',
            database: 'USERMANAGEMENT',
            port: 1433,
            stream: true,
            requestTimeout: 0
        };

        sql.connect(config, function (err) {

            var request = new sql.Request();
            var jsonoutput = [];

            var poly = "POLYGON((44.95159149169922 32.93464052174691,44.94077682495117 32.891984367967275,45.005836486816406 32.85002872678845,45.04291534423828 32.94342859314646,44.9970817565918 32.95581684949438,44.95159149169922 32.93464052174691))";

            request.input('operator', sql.VarChar(50), req.body.operator );
            request.input('technology', sql.VarChar(50), 'UMTS');
            request.input('polygonstring', sql.VarChar(500), poly);
            request.input('Account', sql.VarChar(50), 'Zain');
            request.input('UserID', sql.VarChar(50), 'epunina');
            request.input('Zoom', sql.VarChar(50), '20');
            request.input('Randnum', sql.VarChar(50), '12345');
            request.input('Date1', sql.VarChar(50), '2015-07-01');
            request.input('Date2', sql.VarChar(50), '2016-07-04');

            request.execute('[dbo].[sp_getAllDataDropReason_v3]');

            request.on('row', function (row) {
                jsonoutput.push(row);
            });

            request.on('done', function (affected) {
                res.json(jsonoutput);
            });

        });

    });
    
    
    
    app.post("/getCircleOperatorTech" , jsonParser , function(req , res) {
        
           console.log(req.body.signum);

          var config = {
              user: 'sa',
              password: 'dell@123',
              server: '10.184.56.41\\EMATIX',
              database: 'Usrmngmt_Account_' + req.body.project,
              port: 1433,
              stream: true,
              requestTimeout: 0
          };
        
            sql.connect(config, function (err) {

            var request = new sql.Request();
            var jsonoutput = [];
                
           console.log("if ( select count(*) from (SELECT Circle , Operator , Technology , [Site Name] , [Cell Name] , Azimuth , Status , Beamwidth FROM [Usrmngmt_Account_TOOL_TEAM_TESTING].[dbo].[site_upload_temp] where signum = '" + req.body.signum + "' and [Site Name] = '" + req.body.siteName + "') a)  = 0 begin SELECT distinct Circle , Operator , Technology from [Usrmngmt_Account_" + req.body.project + "].[dbo].[site_upload_temp] where signum = '" + req.body.signum + "' end else begin SELECT Circle , Operator , Technology , [Site Name] , [Cell Name] , Azimuth , Status , Beamwidth FROM [Usrmngmt_Account_" + req.body.project + "].[dbo].[site_upload_temp] where signum = '" + req.body.signum + "' and [Site Name] = '" + req.body.siteName + "' end");

           request.query("if (select count(*) from (SELECT Circle,Operator,Technology,[Site Name],[Cell Name],Azimuth,Status,Beamwidth FROM [Usrmngmt_Account_TOOL_TEAM_TESTING].[dbo].[site_upload_temp] where signum = '" + req.body.signum + "' and [Site Name] = '" + req.body.siteName + "') a)  = 0 begin SELECT distinct Circle , Operator , Technology from [Usrmngmt_Account_" + req.body.project + "].[dbo].[site_upload_temp] where signum = '" + req.body.signum + "' end else begin SELECT Circle , Operator , Technology , [Site Name] as siteName , [Cell Name] as cellName , Azimuth , Status , Beamwidth FROM [Usrmngmt_Account_" + req.body.project + "].[dbo].[site_upload_temp] where signum = '" + req.body.signum + "' and [Site Name] = '" + req.body.siteName + "' end");
                         
           request.on('row', function(row){
                jsonoutput.push(row);
            });  
            
            request.on('done', function(affected){ 
               res.json(jsonoutput);
            });

            });      
    }); 


}