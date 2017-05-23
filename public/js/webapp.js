
var DataArray = [];
var circleLat = 0; 
var circleLong = 0; 
var circleRadius = 0; 

var all_overlays_polygon = [];
var all_overlays_polygon_psc = [];
var all_overlays_polygon_circle = []; 
var checkCount = 0; 

var sitesArr = [];
var pscarr = [];

var markers = [];
var markerClusterer = null;

var method = '';
var toolTechVersion = '';
var offset = 0; 
var initiateWorkSpaceFlag = false; 

function initialize()
{
      
map = new L.Map('map-canvas');

// create the tile layer with correct attribution
var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
var osm = new L.TileLayer(osmUrl, {minZoom: 2, maxZoom: 20, attribution: osmAttrib});	

// start the map in South-East England
map.setView(new L.LatLng(12.9781, 77.5992),11);
map.addLayer(osm);
     
$('#statusWindow').html("Status");

$('#preloader').hide(); 

}

function plotdata()
{
    
$('#preloader').show();

var socketplotdata = io.connect('http://localhost:3700/', {'force new connection': true}); 

socketplotdata.on('donesending' , function(data)
{
    $('#statusWindow').html("Completed data loading."); 
    $('#preloader').hide();
    $("statusmsg").css("padding-left", "30px");
    socketplotdata.disconnect(); 
});

socketplotdata.on('ConnectDB' , function(data)
{
    $('#statusWindow').html("Connecting to database...");
});
   
   
socketplotdata.on('ExecuteDB' , function(data)
{
    $('#statusWindow').html("Executing query...");
});


socketplotdata.emit('data', {
    receiver:'single_row',
    emitter:'doneplottingrows',
    noofobj : '5000'
});

// firsttime plotting
socketplotdata.emit('doneplottingrows');   

socketplotdata.on('single_row', function(data) {
    
$('#statusWindow').html("Plotting data on map...");

for(var i = 0; i < data.length; i++)

{
	
 var arr1 = [];    
    				
var latlng = L.latLng(data[i].MaxLat, data[i].MinLong);
arr1.push(latlng);
					
var latlng = L.latLng(data[i].MaxLat ,data[i].MaxLong);
arr1.push(latlng);
					
var latlng = L.latLng(data[i].MinLat , data[i].MaxLong);
arr1.push(latlng);
					
var latlng = L.latLng(data[i].MinLat, data[i].MinLong);
arr1.push(latlng);
    
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
    
newpoly= L.polygon( arr1,{
stroke:true, 
color:"#000000",
opacity:0.4,
weight:1,
fill :true,    
fillColor: colorcode ,
fillOpacity:0.8
});  
          	      
newpoly.addTo(map); 
	
all_overlays_polygon.push(newpoly);

delete newpoly;    

}
    
socketplotdata.emit('doneplottingrows');

});

//socketplotdata.disconnect(); 

}

function plotsector()
{
     
$('#preloader').show();

var socketplotsector = io.connect('http://localhost:3700/', {'force new connection': true}); 

socketplotsector.on('donesending' , function(data)
{
    $('#statusWindow').html("Completed data loading."); 
    $('#preloader').hide();
    $("statusmsg").css("padding-left", "30px");
    socketplotsector.disconnect(); 
});

socketplotsector.on('ConnectDB' , function(data)
{
    $('#statusWindow').html("Connecting to database...");
});
   
   
socketplotsector.on('ExecuteDB' , function(data)
{
    $('#statusWindow').html("Executing query...");
});

   socketplotsector.emit('plot_sectors', {
    receiver:'sector_row',
    emitter:'doneplottingsector',
    noofobj : '100'
});

// firsttime plotting
socketplotsector.emit('doneplottingsector');   

socketplotsector.on('sector_row', function(data) {
 
$('#statusWindow').html("Plotting data on map...");
    
for(var i = 0; i < data.length; i++)
{
 var arr1 = [];
     
 var cell_rad = 2/1000 ;
    				
var latlng = L.latLng(data[i].Latitude, data[i].Longitude);
arr1.push(latlng);

var AZIMUTH1 = 90 - parseInt(data[i].Azimuth);

var ANG1 = AZIMUTH1 - 32.5;
var ANG2 = AZIMUTH1 + 32.5;

for (var j = ANG1;j < ANG2; j+=15)
{
latlng  = L.latLng(parseFloat(data[i].Latitude) + Math.sin(j*3.14/180)*cell_rad  ,  parseFloat(data[i].Longitude) + Math.cos(j*3.14/180)*cell_rad) ;  
arr1.push(latlng);
}
					    
var colorcode ;     
    
colorcode = "#00FF00";   
    
newpoly= L.polygon( arr1,{
stroke:true, 
color:"#000000",
opacity:0.4,
weight:0.1,
fill :true,    
fillColor: colorcode ,
fillOpacity:0.8
});  
          	      
newpoly.addTo(map); 
	
all_overlays_polygon.push(newpoly);

delete newpoly;    

}   
    
socketplotsector.emit('doneplottingsector');
    
}); 
    
   
}

// function heatmap 

function heatmap(){
    
var heatmapArray = {data:[]};     
    
$('#preloader').show();

var socketplotsector = io.connect('http://localhost:3700/', {'force new connection': true}); 

socketplotsector.on('donesending' , function(data)
{
    $('#statusWindow').html("Completed data loading."); 
    $('#preloader').hide();
    $("statusmsg").css("padding-left", "30px");
    
    
        var baseLayer = L.tileLayer(
        'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        attribution: '...',
        maxZoom: 18
        }); 

        var cfg = {
        // radius should be small ONLY if scaleRadius is true (or small radius is intended)
        // if scaleRadius is false it will be the constant radius used in pixels
        "radius": 2,
        "maxOpacity": .8, 
        // scales the radius based on map zoom
        "scaleRadius": true, 
        // if set to false the heatmap uses the global maximum for colorization
        // if activated: uses the data maximum within the current map boundaries 
        //   (there will always be a red spot with useLocalExtremas true)
        "useLocalExtrema": true,
        // which field name in your data represents the latitude - default "lat"
        latField: 'lat',
        // which field name in your data represents the longitude - default "lng"
        lngField: 'lng',
        // which field name in your data represents the data value - default "value"
        valueField: 'count'
        };
    
    var heatmapLayer = new HeatmapOverlay(cfg);
    
    heatmapLayer.setData(heatmapArray);
    
    map.addLayer(heatmapLayer);

    socketplotsector.disconnect(); 
});

socketplotsector.on('ConnectDB' , function(data)
{
    $('#statusWindow').html("Connecting to database...");
});
   
   
socketplotsector.on('ExecuteDB' , function(data)
{
    $('#statusWindow').html("Executing query...");
});

   socketplotsector.emit('plot_sectors', {
    receiver:'sector_row',
    emitter:'doneplottingsector',
    noofobj : '100'
});

// firsttime plotting
socketplotsector.emit('doneplottingsector');    
    
    
socketplotsector.on('sector_row', function(data) {
 
$('#statusWindow').html("Plotting data on map...");
    
for(var i = 0; i < data.length; i++)
{
				
var latlng = 
    {
    lat : data[i].Latitude,
    lng : data[i].Longitude, 
    count : 1 
    }; 
    
heatmapArray.data.push(latlng);

}   
    
socketplotsector.emit('doneplottingsector');
    
});     
    
    
}


function clear_map()
{
for (var i=0; i < all_overlays_polygon.length; i++)
{
all_overlays_polygon[i].setMap(null);
}
all_overlays_polygon = [];

for (var i=0; i < all_overlays_polygon_psc.length; i++)
{
all_overlays_polygon_psc[i].setMap(null);
}
all_overlays_polygon_psc = [];

for (var i=0; i < all_overlays_polygon_circle.length; i++)
{
all_overlays_polygon_circle[i].setMap(null);
}
all_overlays_polygon_circle = [];

}


function ShowDialog() {
    $("#magnifier").dialog({
        height: 500,
        width: 500
    });
}

function ShowConflictDialog() {
  $("#tableform").dialog({
       height: 600,
        width: 800
   });

    $('select').material_select();

    $('#reusetable').html("");

}


function ShowPSCConflict() {

    if(initiateWorkSpaceFlag === false )
    {
        Materialize.toast("WorkSpace Not Initialized" , 2000 , "rounded Blue"); 
        return;
    }

    checkCount = 0;

    for (var i = 0; i < all_overlays_polygon_circle.length; i++) {
        all_overlays_polygon_circle[i].setMap(null);
    }
    all_overlays_polygon_circle = [];

    console.log();

    $('#preloader').show();
    $('#statusWindow').html("Fetching Results...");

    $('#maintable').dataTable().fnDestroy();
    $('#reusetable').html("");

    circleLat = sitesArr[$("#siteSelected").val()].latitude;
    circleLong = sitesArr[$("#siteSelected").val()].longitude;
    circleRadius = parseFloat($('#circleRad').val());

    var marker = new google.maps.Marker({
        position: {
            lat: parseFloat(circleLat),
            lng: parseFloat(circleLong)
        },
        map: map
    });

    all_overlays_polygon_circle.push(marker);

    var searchCircle = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: '#ffff00',
        fillOpacity: 0.35,
        map: map,
        center: {
            lat: parseFloat(circleLat),
            lng: parseFloat(circleLong)
        },
        radius: circleRadius
    });

    map.setCenter({
        lat: parseFloat(circleLat),
        lng: parseFloat(circleLong)
    });

    searchCircle.setMap(map);

    all_overlays_polygon_circle.push(searchCircle);

    var data = {};
    data.lat = circleLat;
    data.long = circleLong;
    data.radius = $('#circleRad').val();
    data.offSet = offset, 
    data.project = 'TOOL_TEAM_TESTING';
    data.propertyName = method;
    data.technologyVersion = toolTechVersion;
    data.signum = 'epunina';

    $.ajax({
        method: "post",
        url: "/PSCReuse",
        data: JSON.stringify(data),
        contentType: 'application/json',
        dataType: 'json',
        success: function (data) {

            var arr = data;

            var tablebody = "";

            for (i = 0; i < arr.length; i++) {

                tablebody += "<tr><td>";

                tablebody += '<input type="checkbox" onclick="getCellPSC(' + i + ',' + arr[i].GroupString + ')" id="cbox' + i + '" value= "' + arr[i].GroupString + '"> <label for="cbox' + i + '">' + arr[i].GroupString + '</label>';
                //tablebody += arr[i].PropertyValue;
                //tablebody += "</td><td>";
                //tablebody += arr[i].Group;
                // tablebody += "</td><td>";
                // tablebody += parseFloat(arr[i].MinDistance).toFixed(2);
                // tablebody += "</td><td>";
                //  tablebody += arr[i].Total_Reuse;
                tablebody += "</td>";
                tablebody += "</tr>";

            }

            $("#reusetable").append(tablebody);

            $('#maintable').DataTable({
                "bPaginate": true,
                "bLengthChange": false,
                "bFilter": true,
                "bInfo": false,
                "bAutoWidth": false,
                "pageLength": 10
            });

            $('#preloader').hide();
            $('#statusWindow').html("Completed");
        }
    });
}

function getCellPSC(a, b) {

    pscarr = [];
    pscarr = b;

    if ($('#cbox' + a).is(":checked")) {

        checkCount++; 
    
        console.log(checkCount);

        var PropertyString = pscarr[0] + "|" + pscarr[1] + "|" + pscarr[2];

        var data = {};
        data.lat = circleLat;
        data.long = circleLong;
        data.radius = circleRadius;
        data.propertyValue = PropertyString;
        data.project = 'TOOL_TEAM_TESTING';
        data.propertyName = method ;
        data.technologyVersion = toolTechVersion ;
        data.signum = 'epunina';


        $.ajax(
            {
                method: "post",
                url: "/getPSCSector",
                data: JSON.stringify(data),
                contentType: 'application/json',
                dataType: 'json',
                success: function (data) {

                    for (var i = 0; i < data.length; i++) {
                        var arr1 = [];

                        var cell_rad = 5 / 1000;

                        var latlng = new google.maps.LatLng(data[i].Latitude, data[i].Longitude);
                        arr1.push(latlng);

                        var AZIMUTH1 = 90 - parseInt(data[i].Azimuth);

                        var ANG1 = AZIMUTH1 - 32.5;
                        var ANG2 = AZIMUTH1 + 32.5;

                        for (var j = ANG1; j < ANG2; j += 15) {
                            latlng = new google.maps.LatLng(parseFloat(data[i].Latitude) + Math.sin(j * 3.14 / 180) * cell_rad, parseFloat(data[i].Longitude) + Math.cos(j * 3.14 / 180) * cell_rad);
                            arr1.push(latlng);
                        }

                        var colorcode;

                        colorcode = "#00FF00";

                        newpoly = new google.maps.Polygon({
                            path: arr1,
                            strokeColor: "#000000",
                            strokeOpacity: 0.4,
                            strokeWeight: 0.6,
                            fillColor: "#FF0000",
                            fillOpacity: 0.8,
                            zIndex: 2,
                            PSC: data[i].PropertyValue
                        });

                        newpoly.setMap(map);

                        all_overlays_polygon_psc.push(newpoly);

                        delete newpoly;
                    }
                }
            });
    }
    else {

        checkCount--;

        console.log(checkCount);

        for (var j = 0; j < pscarr.length; j++) {
            for (var i = 0; i < all_overlays_polygon_psc.length; i++) {

                if (all_overlays_polygon_psc[i].PSC === pscarr[j]) {
                    //Remove the marker from Map   
                    all_overlays_polygon_psc[i].setMap(null);
                    all_overlays_polygon_psc.splice(i, 1);
                    i--;
                }
            }
        }
    }
}


$(document).on("click", ".importNewSite", function () {

    $("#siteSelected").html('');

    var fileInput = $(".importnewSiteFile")[0];
    var fileList = fileInput.files;
    for (var i = 0; i < fileList.length; i++) {
        var file = fileList[i];
        fr = new FileReader();
        fr.onload = receivedText;
        fr.readAsText(file);
    }

    sitesArr = [];

    function receivedText() {

        Materialize.toast("File Successfully Uploaded!  ", 2000, "rounded Blue");

        var csvval = fr.result.split("\n");

        for (var i = 1; i < csvval.length; i++) {
            var params = csvval[i].split(",");

            var siteObj = {};

            siteObj.siteName = params[0];
            siteObj.latitude = params[1];
            siteObj.longitude = params[2];
            siteObj.identity = i - 1;
            sitesArr.push(siteObj);

        }
        console.log(sitesArr);
        console.log(sitesArr.length);

        var optionHtml = '';
        for (i = 0; i < sitesArr.length; i++) {
            if (sitesArr[i].siteName !== '') {
                optionHtml += "<option value=" + sitesArr[i].identity + ">" + sitesArr[i].siteName + "</option>"
            }
        }

        $("#siteSelected").append(optionHtml);

        $('select').material_select();
    }

});


        function initializeWorkSpace() {

            method = $('#method').val();
            
            switch (method) {
                case 'PSC':
                    toolTechVersion = "'UMTS_37'";
                    offset = 8;
                    break;
                case 'PCI':
                    toolTechVersion = "'LTE_17'";
                    offset = 1;
                    break;
                case 'RSN':
                    toolTechVersion = "'LTE_17'";
                    offset = 10;
                    break;
            }


            if ($('#circleRad').val() === '') {
                Materialize.toast("Enter Search Radius", 2000, "rounded Blue");
                return;
            }


            checkCount = 0;
            var data = {};

            data.signum = 'epunina';
            data.project = 'TOOL_TEAM_TESTING';
            data.propertyName = method;
            data.technologyVersion = toolTechVersion;

            $('#preloader').show();
            $('#statusWindow').html("Initializing WorkSpace...");

            $.ajax({
                method: "post",
                url: "/initializeWorkSpace",
                data: JSON.stringify(data),
                contentType: 'application/json',
                dataType: 'json',
                success: function (data) {

                    if (data.response === "WorkSpace Created") {
                        initiateWorkSpaceFlag = true;
                    }
                    else {
                        initiateWorkSpaceFlag = false;
                        Materialize.toast("WorkSpace Not Initialized", 2000, "rounded Blue");
                    }
                    $('#preloader').hide();
                    $('#statusWindow').html("Completed");
                }
            });

        }


        function assignValues()
        {

        $('#methodTable').text(method);

        if(checkCount > 1)
        {
              Materialize.toast("Please select only one Group  ", 2000,"rounded Blue");
        }
        else if (checkCount === 0)
        {
             Materialize.toast("Please select a Group", 2000,"rounded Blue");
        }
        else 
        {

            var data = {};
            data.signum = 'epunina';
            data.project = 'TOOL_TEAM_TESTING';
            data.siteName = sitesArr[$("#siteSelected").val()].siteName;

            $.ajax({
                method: "post",
                url: "/getCircleOperatorTech",
                data: JSON.stringify(data),
                contentType: 'application/json',
                dataType: 'json',
                success: function (data) {

                    if (data[0].cellName !== undefined) {

                        for (var i = 0; i < 3; i++) {
                            var j = i + 1;

                            $('#newSiteCheck' + j).attr('checked', true);
                            $('#newSitecircle' + j).val(data[i].Circle);
                            $('#newSiteOperator' + j).val(data[i].Operator);
                            $('#newSiteTechnology' + j).val(data[i].Technology);
                            $('#newSiteSitename' + j).val(sitesArr[$("#siteSelected").val()].siteName);
                            $('#newSiteLatitude' + j).val(sitesArr[$("#siteSelected").val()].latitude);
                            $('#newSiteLongitude' + j).val(sitesArr[$("#siteSelected").val()].longitude);
                            $('#newSiteProperty' + j).val(pscarr[i]);

                            $('#newSiteCellname' + j).val(data[i].cellName);
                            $('#newSiteAzimuth' + j).val(data[i].Azimuth);
                            $('#newSiteStatus' + j).val(data[i].Status);
                            $('#newSiteBeamwidth' + j).val(data[i].Beamwidth);

                        }
                    }
                    else {

                        for (var i = 0; i < 3; i++) {
                            var j = i + 1;
                            $('#newSiteCheck' + j).attr('checked', true);
                            $('#newSitecircle' + j).val(data[0].Circle);
                            $('#newSiteOperator' + j).val(data[0].Operator);
                            $('#newSiteTechnology' + j).val(data[0].Technology);
                            $('#newSiteSitename' + j).val(sitesArr[$("#siteSelected").val()].siteName);
                            $('#newSiteLatitude' + j).val(sitesArr[$("#siteSelected").val()].latitude);
                            $('#newSiteLongitude' + j).val(sitesArr[$("#siteSelected").val()].longitude);
                            $('#newSiteProperty' + j).val(pscarr[i]);

                        }

                        $('#newSiteCellname1').val("A");
                        $('#newSiteCellname2').val("B");
                        $('#newSiteCellname3').val("C");

                        $('#newSiteStatus1').val("Planned");
                        $('#newSiteStatus2').val("Planned");
                        $('#newSiteStatus3').val("Planned");

                        $('#newSiteBeamwidth1').val("65");
                        $('#newSiteBeamwidth2').val("65");
                        $('#newSiteBeamwidth3').val("65");

                    }
                }

            });

            $("#assignValues").dialog({
                height: 800,
                width: 1500
            });

        }
        
        }

        function siteSelectedChange() {
            checkCount = 0;
            $('#maintable').dataTable().fnDestroy();
            $('#reusetable').html("");
        }

         function methodChange() {
            initiateWorkSpaceFlag = false; 
            checkCount = 0;
            $('#maintable').dataTable().fnDestroy();
            $('#reusetable').html("");
        }

        function commitValues() {

            var data = {};
            data.Circle = '';
            data.Operator = '';
            data.Technology = '';
            data.Sitename = '';
            data.Cellname = '';
            data.Latitude = '';
            data.Longitude = '';
            data.Azimuth = '';
            data.Status = '';
            data.Beamwidth = '';
            data.Propertyvalue = '';
            data.signum = "epunina";

            for (var i = 0; i < 7; i++) {

                if ($('#newSiteCheck' + i).is(":checked")) {

                    data.Circle += $("#newSitecircle" + i).val() + "|";
                    data.Operator += $("#newSiteOperator" + i).val() + "|";
                    data.Technology += $("#newSiteTechnology" + i).val() + "|";
                    data.Sitename += $("#newSiteSitename" + i).val() + "|";
                    data.Cellname += $("#newSiteCellname" + i).val() + "|";
                    data.Latitude += $("#newSiteLatitude" + i).val() + "|";
                    data.Longitude += $("#newSiteLongitude" + i).val() + "|";
                    data.Azimuth += $("#newSiteAzimuth" + i).val() + "|";
                    data.Status += $("#newSiteStatus" + i).val() + "|";
                    data.Beamwidth += $("#newSiteBeamwidth" + i).val() + "|";
                    data.Propertyvalue += $("#newSiteProperty" + i).val() + "|";
                }
            }

            $.ajax(
                {
                    method: "post",
                    url: "/commitValues",
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    dataType: 'json',
                    success: function (data) {

                        Materialize.toast(data.repsonse , 2000,"rounded Blue" );

                        $('#assignValues').dialog('close');

                        $('#preloader').hide();
                        $('#statusWindow').html("Completed");
                    }
                });

            console.log(data);
        }


        function downloadChanges() {

            initiateWorkSpaceFlag = false; 

            var data = {};
            data.signum = 'epunina';
            data.project = 'TOOL_TEAM_TESTING';

            $('#preloader').show();
            $('#statusWindow').html("Downloading data...");

            $.ajax(
                {
                    method: "post",
                    url: "/downloadValues",
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    dataType: 'json',
                    success: function (data) {

                        $('#preloader').hide();
                        $('#statusWindow').html("Completed");

                        JSONToCSVConvertor(data, "Planning Report", true);

                    }
                });
        }

  

  function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
      //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
      var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

      var CSV = '';
      //Set Report title in first row or line

      CSV += ReportTitle + '\r\n\n';

      //This condition will generate the Label/Header
      if (ShowLabel) {
          var row = "";

          //This loop will extract the label from 1st index of on array
          for (var index in arrData[0]) {

              //Now convert each value to string and comma-seprated
              row += index + ',';
          }

          row = row.slice(0, -1);

          //append Label row with line break
          CSV += row + '\r\n';
      }

      //1st loop is to extract each row
      for (var i = 0; i < arrData.length; i++) {
          var row = "";

          //2nd loop will extract each column and convert it in string comma-seprated
          for (var index in arrData[i]) {
              row += '"' + arrData[i][index] + '",';
          }

          row.slice(0, row.length - 1);

          //add a line break after each row
          CSV += row + '\r\n';
      }

      if (CSV === '') {
          alert("Invalid data");
          return;
      }

      //Generate a file name
      var fileName = "MyReport_";
      //this will remove the blank-spaces from the title and replace it with an underscore
      fileName += ReportTitle.replace(/ /g, "_");

      //Initialize file format you want csv or xls
      var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

      // Now the little tricky part.
      // you can use either>> window.open(uri);
      // but this will not work in some browsers
      // or you will not get the correct file extension    

      //this trick will generate a temp <a /> tag
      var link = document.createElement("a");
      link.href = uri;

      //set the visibility hidden so it will not effect on your web-layout
      link.style = "visibility:hidden";
      link.download = fileName + ".csv";

      //this part will append the anchor tag and remove it after automatic click
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }



function DropCallReasons()
{

var latlng = {
    lat: 33.2869, 
    lng: 44.2646
}


map.setCenter(latlng);

    $('#dropReasonsChart').dialog({
        width: 800,
        height: 500
    });

var chartData=[]; 

var data = {}; 
data.operator = 'Zain_TR';

$.ajax(
{
method:"post",
url: "/GetDropReasonsPie" ,
data: JSON.stringify(data),
contentType: 'application/json',
dataType: 'json',
success: function(data)
{
 
for( var i=0; i < data.length; i++)
{
   chartData.push({ 'name' : data[i]['Module'], 'y' : data[i]['CountInstance'] })
}

 $('#dropReasonsChart').highcharts({
        chart: {
            type: 'pie',
            options3d: {
                enabled: true,
                alpha: 45,
                beta: 0
            }
        },
        title: {
            text: 'Drop Reasons'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                depth: 35,
                dataLabels: {
                    enabled: true,
                    format: '{point.name}'
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Module share',
            data: chartData , 
               point:{
                  events:{
                      click: function (event) {


                           console.log( markers.length);

                          for (var i = 0; i < markers.length; i++) {
                              markers[i].setMap(null);
                          }
                          markers = [];

                          console.log(markerClusterer);
                          
                          if (markerClusterer !== null) {
                              markerClusterer.clearMarkers();
                          }


                          var socketplotdrop = io.connect('http://localhost:3700/', { 'force new connection': true });

                          socketplotdrop.emit('plot_dropCall', {
                              receiver: 'singledrop_row',
                              emitter: 'doneplottingdroprows',
                              noofobj: '5000',
                              dropReason : this.name
                          });

                          socketplotdrop.on('donesending', function (data) {

                              var clusterStyles = [
                                  {
                                      opt_textColor: 'white',
                                      url: 'img/DropCall.png',
                                      textColor: '#0800FF',
                                      textSize: 20,
                                      height: 50,
                                      width: 50
                                  },
                                  {
                                      opt_textColor: 'white',
                                      url: 'img/DropCall.png',
                                      textColor: '#0800FF',
                                      textSize: 22,
                                      height: 50,
                                      width: 50
                                  },
                                  {
                                      opt_textColor: 'white',
                                      url: 'img/DropCall.png',
                                      textColor: '#0800FF',
                                      textSize: 24,
                                      height: 50,
                                      width: 50
                                  }
                              ];

                              var mcOptions = {
                                  gridSize: 50,
                                  styles: clusterStyles,
                                  maxZoom: 15
                              };
                              markerClusterer = new MarkerClusterer(map, markers, mcOptions);

                              $('#statusWindow').html("Completed data loading.");
                              $('#preloader').hide();
                              $("statusmsg").css("padding-left", "30px");
                              socketplotdrop.disconnect();
                          });

                          socketplotdrop.on('ConnectDB', function (data) {
                              $('#statusWindow').html("Connecting to database...");
                          });


                          socketplotdrop.on('ExecuteDB', function (data) {
                              $('#statusWindow').html("Executing query...");
                          });


                          // firsttime plotting
                          socketplotdrop.emit('doneplottingdroprows');

                          socketplotdrop.on('singledrop_row', function (data) {

                              $('#statusWindow').html("Plotting data on map...");

                              for (var i = 0; i < data.length; i++) {

                                  for (var j = 0 ; j < data[i].ReasonCount ; j++)
                                  {

                                  var latLng = new google.maps.LatLng(data[i].MaxLat, data[i].MinLong);

                                  var imageUrl = 'img/DropCall.ico';

                                  var markerImage = new google.maps.MarkerImage(imageUrl,
                                      new google.maps.Size(100, 100));

                                  var marker = new google.maps.Marker({
                                      position: latLng,
                                      draggable: false,
                                      icon: markerImage
                                  });

                                  markers.push(marker);

                              }

                              }

                              socketplotdrop.emit('doneplottingdroprows');

                          });

                      

                      }
                  }
              }  
        }]
    });
}
});


}




