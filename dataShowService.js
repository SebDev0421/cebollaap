
let parameters = []

var type = ""


var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 15,
    attribution: '© OpenStreetMap'
});

const ctx = document.getElementById('myChart');

let myChart = new Chart("myChart", {
    type: "line",
    data: {
      datasets: [{
        borderColor: "red",
        label:parameters,
        fill: false
      }
    ]
    },
    options: {
      legend: {display: true,position:'right'}
    }
  });


const mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
const mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';


var streets = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr});

const satellite = L.tileLayer(mbUrl, {id: 'mapbox/satellite-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr});

var map = L.map('mapBox', {
    center: [8.1752348,-73.3287409],
    zoom: 10,
    layers: [osm]
});


const baseLayers = {
  'OpenStreetMap': osm,
  'Streets': streets,
  'Satellite':satellite
};


var marker = L.marker([8.1752348,-73.3287409],
    {alt: '01.SGR-OCANA'}).addTo(map) // "Kyiv" is the accessible name of this marker
  .bindPopup('01.SGR-OCANA, z6-19634');



  fetch("http://201.185.137.195:3000/mapsService/Area_estudio_cebolla.geojson").
  then((res) => {return res.json()}).
  then((res)=>{
    function polystyle(feature){
      return{
        fillColor: 'blue',
        weight: 2,
        opacity: 0.7,
        color: 'white',  //Outline color
        fillOpacity: 0.1
      }
    }
    var areas = L.geoJSON(res,{style:polystyle})
    areas.addTo(map);
  })


L.control.scale().addTo(map);
function getDBdata(dateInit,dateEnd,parameters,unit){

    fetch("http://201.185.137.195:3000/Meterological",{
        method:"POST",
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify(
            {
                dateInit:dateInit,
                dateEnd: dateEnd,
                param:parameters
            }
        )
    })
    .then((res)=>{
        return res.json()
    })
    .then((res)=>{
        dataBase=res

        var date = []
        var variable = []

        dataBase.map((data)=>{
            date.push(data.dateLog)
            variable.push(data[parameters])
        })

        console.log(date)
        console.log(variable)

        myChart.destroy();
        myChart = new Chart("myChart", {
          type: "line",
          data: {
            labels: date,
            datasets: [{
                type:type,
                data: variable,
                borderColor: "red",
                fill: true,
                backgroundColor:"red",
                label:unit,
                fill: false
            }
          ]
          },
          options: {
            legend: {display: true,position:'right'}
          }
        });
        

        
    })
    .catch((err)=>{
        if(err)throw err
    })
}



/* function getDBdata(date,option){
    fetch("http://201.185.137.195:3000/Meterological",{
        method:"GET",
        headers:{
            'Content-Type':'application/json'
        }
    })
    .then((res)=>{
        return res.json()
    })
    .then((res)=>{
        parameters = res.data
        
    })
    .catch((err)=>{
        if(err)throw err
    })
} */


const buttonNext = document.getElementById("button-next");
const banner = document.getElementById("informationBanner");


buttonNext.onclick = function(){
    //close banner
    banner.style.display="none"
}




console.log("Greafica generada");



function startDate(val){
    document.getElementById("end").min = val
}


function selectParameter(val){
    //get api from database
    let dataGraf = []
    let labelsGraf = []
    let unit = ""

    
/* 
    // aux variables
    let tempAir = [],
        precipitation = [],
        vaporPressure = [],
        vaporPressureSaturation = [],
        humidity = [],
        atmosphericPressure = [],
        ratePrecip = [],
        VPD = [] */
    
    /* parameters.map((value)=>{
                
                const vps = 0.6108*Math.exp((17.27*value.AirTemp)/(value.AirTemp+237.3))
                
                tempAir.push(value.AirTemp)
                precipitation.push(value.Precipitation)
                vaporPressure.push(value.VaporPressure)
                vaporPressureSaturation.push(vps)
                humidity.push(value.VaporPressure/vps)
                atmosphericPressure.push(value.AtmPress)
                ratePrecip.push(value.MaxPrecipitationRate)
                VPD.push(vps-value.VaporPressure)
                labelsGraf.push(value.dateLog)
                vaporPressureSaturation.push()

    }) */

    switch(val){
        case "AirTemp":
            type = 'line'
            unit = "Temperatura ambiente °C"
            break;
        case "Precipitation":
            type = 'bar'
            unit = "Precipitacion mm"
            break;
        case "VaporPressure":
            type = 'line'
            unit = "Presion de vapor kPa"
            break;
        case "AtmPress":
            type = 'line'
            
            unit = " Presion Atmosferica kPa"
        
            break;
        case " MaxPrecipitationRate":
            type = 'line'
            unit = "mm/h"
            break;
        case "VPD":
            type = 'line'
            unit = " kPa VPD"
            break;
    }

    const dateInit = document.getElementById("start").value;
    const dateEnd = document.getElementById("end").value;
    

    if((dateInit !== "") && (dateEnd !== "")){
        getDBdata(dateInit,dateEnd,val,unit)
    }else{
        console.log("not date")
    }


    

    

    

}