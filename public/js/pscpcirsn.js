(function()
{

    var toolTechVersion = ''; 
    var method = '' ; 
    var offset = 0; 
    var checkCount = 0; 
    var initiateWorkSpaceFlag = false; 
    var sitesArr = [];
    var all_overlays_polygon_circle = [];
    var all_overlays_polygon_psc = [];
    var circleLat = 0;
    var circleLong = 0;
    var circleRadius = 0;
    var pscarr = [];

// Initialize WorkSpace 

    function initializeWorkSpace() {

        toolTechVersion = '';

        method = $('#method').val();

        switch (method) {
            case 'PSC':
                offset = 8;
                break;
            case 'PCI':
                offset = 1;
                break;
            case 'RSN':
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
            }
        });

    }


// upload the site database. 


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

// Search Free Group Values. 

function GetFreeGroupValues() {

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
        url: "/pscPciRsnReuse",
        data: JSON.stringify(data),
        contentType: 'application/json',
        dataType: 'json',
        success: function (data) {

            var arr = data;

            var tablebody = "";

            for (i = 0; i < arr.length; i++) {

                tablebody += "<tr><td>";
                tablebody += '<input type="checkbox" onclick="GetSelectedGroup(' + i + ',' + arr[i].GroupString + ')" id="cbox' + i + '" value= "' + arr[i].GroupString + '"> <label for="cbox' + i + '">' + arr[i].GroupString + '</label>';
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
        }
    });
}

// Get Selected Group Values 

function GetSelectedGroup(a, b) {

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
                url: "/getPropertySector",
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

// Assignvalues 

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

                        $('#newSiteAzimuth1').val("0");
                        $('#newSiteAzimuth1').val("120");
                        $('#newSiteAzimuth1').val("240");
                         
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

// Site Selected on Change

        function siteSelectedChange() {
            checkCount = 0;
            $('#maintable').dataTable().fnDestroy();
            $('#reusetable').html("");
        }

// Method selection on Change

        function methodChange() {
            initiateWorkSpaceFlag = false;
            checkCount = 0;
            $('#maintable').dataTable().fnDestroy();
            $('#reusetable').html("");
        }

// Commit values 

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

                    }
                });

        }

// download data 

   function downloadChanges() {

            initiateWorkSpaceFlag = false; 

            var data = {};
            data.signum = 'epunina';
            data.project = 'TOOL_TEAM_TESTING';

            $.ajax(
                {
                    method: "post",
                    url: "/downloadValues",
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    dataType: 'json',
                    success: function (data) {
                        
                        JSONToCSVConvertor(data, "Planning Report", true);

                    }
                });
        }

// Json to CSV Convertor 


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


}());