
var DataArray = [];

google.maps.visualRefresh = true;

function initialize()
{
    
var socket = io.connect('http://localhost:3700/', {'force new connection': true});    
    
var mapOptions = 
{
zoom: 11,
center: new google.maps.LatLng(12.9781, 77.5992),
mapTypeId: google.maps.MapTypeId.ROADMAP  ,
mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU}, 

};  
    
map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);  





socket.emit('data', {
    firstname: "Punith",
    lastname: "Nayak"
});

// firsttime plotting
socket.emit('doneplotting');   

socket.on('single_row', function(data) {
    
geojson ={
  "type": "FeatureCollection",
  "features": [
	]
};
   
    
$('#statusWindow').html("Plotting data on map...");

for(var i = 0; i < data.length; i++)

{
	  				
var colorcode ;     
    
 if( data[i].KPI >= -65 && data[i].KPI < 0 )  
 {
     colorcode = "#00FF00";   
 } 
 else if( data[i].KPI >=-95 && data[i].KPI < -65 )
 {
     colorcode = "#FFFF00";
 }
 else if( data[i].KPI >= -120 && data[i].KPI < -95)
 {
       colorcode = "#FF0000";
 }

var arr1 = [];

arr1.push([data[i].MinLong , data[i].MaxLat]);
					
arr1.push([data[i].MaxLong , data[i].MaxLat]);
					
arr1.push([data[i].MaxLong , data[i].MinLat]);
				
arr1.push([data[i].MinLong , data[i].MinLat]);

arr1.push([data[i].MinLong , data[i].MaxLat]);

geojson.features.push(CreateJsonObject(colorcode , arr1));

}


map.data.addGeoJson(geojson);   
map.data.setStyle(function (feature) {
        var color = feature.getProperty('fillColor');
        return {
            fillColor: color,
            strokeWeight: 0.1
        };
    });

delete geojson;

socket.emit('doneplotting');

});

socket.on('donesending' , function(data)
{
    $('#statusWindow').html("Completed data loading."); 
    $('#preloader').hide();
    $("statusmsg").css("padding-left", "30px");
});

socket.on('ConnectDB' , function(data)
{
    $('#statusWindow').html("Connecting to database...");
});
   
   
socket.on('ExecuteDB' , function(data)
{
    $('#statusWindow').html("Executing query...");
});   
   
}


google.maps.event.addDomListener(window, 'load', initialize);

function CreateJsonObject(colorcode  , arr1)
{
      var jsonobject = { 
      "type": "Feature",
      "properties": {
        "fillColor": ""
                     },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
        ]
      }
	 }; 
      
      jsonobject.properties.fillColor = colorcode; 
      jsonobject.geometry.coordinates = [arr1]; 
      
      return jsonobject; 
      
  
}