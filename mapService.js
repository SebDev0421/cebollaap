
/* // initalize leaflet map
var map = L.map('mapBox').setView([8.1752348,-73.3287409], 9);

// add OpenStreetMap basemap
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
 */
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 15,
    attribution: '© OpenStreetMap'
});

const mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
const mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

var units = ""

var hidric = false

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


//Charger study area
fetch("http://201.185.137.195:3000/mapsService/Area_estudio_cebolla_v2.geojson").
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
//

//scale map
L.control.scale({
  position: 'topright',
  maxWidth:50
}).addTo(map);


//var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

var popup = L.popup();

var layers = {};

var countLayers = 0;

var activeLayer = "";


const buttonNext = document.getElementById("button-next");
const banner = document.getElementById("informationBanner");


buttonNext.onclick = function(){
    //close banner
    banner.style.display="none"
}

//201.185.137.195 mode
var url_to_geotiff_file = [{name:"Erodabilidad",url:'http://201.185.137.195:3000/mapsService/K_v2_mg.TIF',min:0.0071108155,index:1,noData:-3.4028234663852886e+38},
{name:"Erosividad",url:'http://201.185.137.195:3000/mapsService/R_v2_mg.TIF',min:5214.5060806088,index:2,noData:-3.4028234663852886e+38},
{name:"Factor de Cobertura (C)",url:'http://201.185.137.195:3000/mapsService/C.tif',min:0.0444006175,index:3,noData:-3.4028234663852886e+38},
{name:"Factor longitud e inclinación de la pendiente (LS)",url:'http://201.185.137.195:3000/mapsService/LS.tif',min:0.608716805,index:4,noData:-3.3999999521443642e+38},
{name:"Tasa de erosión hídrica (E)",url:'http://201.185.137.195:3000/mapsService/E_v5.tif',min:1.5943226757,index:5,noData:65535},
{name:"Abril 1",url:'http://201.185.137.195:3000/mapsService/TT_01_abr_geo_1.tif',min:234.9737324721,index:6,noData:-3.4028230607370965e+38},
{name:"Abril 16",url:'http://201.185.137.195:3000/mapsService/TT_15_abr_RP.tif',min:203.5155869378,index:7},
{name:"Mayo 1",url:'http://201.185.137.195:3000/mapsService/TT_01_may_RP.tif',min:203.5155869378,index:8},
{name:"Mayo 15",url:'http://201.185.137.195:3000/mapsService/TT_15_may_RP.tif',min:203.5155869378,index:9},
{name:"Octubre 1",url:'http://201.185.137.195:3000/mapsService/TT_01_oct_RP.tif',min:203.5155869378,index:10},
{name:"Octubre 15",url:'http://201.185.137.195:3000/mapsService/TT_15_oct_RP.tif',min:203.5155869378,index:11},
{name:"Noviembre 1",url:'http://201.185.137.195:3000/mapsService/TT_01_nov_RP.tif',min:203.5155869378,index:12},
{name:"Noviembre 15",url:'http://201.185.137.195:3000/mapsService/TT_15_nov_RP.tif',min:203.5155869378,index:13}
]
var marker


fetch("http://201.185.137.195:3000/mapsService/Huella-Hidrica.geojson").
  then((res) => {return res.json()}).
  then((res)=>{

    var geojsonMarkerOptions = {
      radius: 8,
      fillColor: "#ff7800",
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
  };

  function onEachFeature(feature,layer){
    var customOptions =
    {
    'maxWidth': '400',
    'width': '200',
    'className' : 'custom'
    }

    var customPopup = "<br>ESTACION:"+JSON.stringify(feature.properties.ESTACION)+"<br/><br>NOMBRE:"+JSON.stringify(feature.properties.NOMBRE)+"<br/><br>LATITUD:"+JSON.stringify(feature.properties.LATITUD)+"<br/><br>LONGITUD:"+JSON.stringify(feature.properties.LONGITUD)+"<br/><br>ET_AZUL:"+JSON.stringify(feature.properties.ET_AZUL)+"<br/><br>ET_VERDE:"+JSON.stringify(feature.properties.ET_VERDE)+"<br/><br>ET_TOTAL:"+JSON.stringify(feature.properties.ET_TOTAL)+"<br/><br>ADT_mm_m:"+JSON.stringify(feature.properties.ADT_mm_m)+"<br/>";

    layer.bindPopup(customPopup,customOptions);
  }

  marker = L.geoJSON(res,{onEachFeature:onEachFeature})
  //areas.addTo(map);
  })



//server mode
/* 
var url_to_geotiff_file = [{name:"Erodabilidad",url:'http://201.185.137.195:3000/mapsService/K_v2_mg.TIF',index:1,noData:-3.4028234663852886e+38},
{name:"Erosividad",url:'http://201.185.137.195:3000/mapsService/R_v2_mg.TIF',index:2,noData:-3.4028234663852886e+38},
{name:"Factor de Cobertura (C)",url:'http://201.185.137.195:3000/mapsService/C.tif',index:3,noData:-3.4028234663852886e+38},
{name:"Factor longitud e inclinación de la pendiente (LS)",url:'http://201.185.137.195:3000/mapsService/LS.tif',index:4,noData:-3.3999999521443642e+38},
{name:"Tasa de erosión hídrica (E)",url:'http://201.185.137.195:3000/mapsService/BS_01_ENE_geo.tif',index:5,noData:65535},
{name:"Abril 1",url:'http://201.185.137.195:3000/mapsService/TT_01_abr_geo_1.tif',index:6,noData:-3.4028230607370965e+38},
{name:"Abril 15",url:'http://201.185.137.195:3000/mapsService/TT_15_abr_RP_EX.tif',index:7}]
 */
url_to_geotiff_file.forEach(data=>{
  fetch(data.url).
    then(response => response.arrayBuffer()).
    then(arrayBuffer => {
      parseGeoraster(arrayBuffer).then(georaster =>{
        //console.log("geoRaster: ",georaster)

        

        const min = data.min;
        const max = georaster.maxs[0];
        const range = georaster.ranges[0];
        const noData = georaster.noDataValue;
        console.log(data.url)
        console.log(noData)

        function convertToRgb(pixelValue) {
          var red, green, blue,alpha;
          if(pixelValue > 0 && pixelValue < 10000 ){
            const normalizedValue=(pixelValue - min) / max
            alpha = 1;
            if (normalizedValue <= 0.5) {
              red = parseInt(384*(normalizedValue)+24);
              green = parseInt(216);
              blue = parseInt(24);
            } else {
              red = parseInt(216);
              green = parseInt(-384*(normalizedValue) + 408);
              blue = parseInt(24);
            }
          }else{
              red = parseInt(255);
              green = parseInt(255);
              blue = parseInt(255);
              alpha = 0
          }

          
        
          return 'rgba(' + red + ', ' + green + ', ' + blue + ','+alpha+')';
        }

        var overlay =  new GeoRasterLayer({
          georaster:georaster,
          pixelValuesToColorFn: (pixelValues)=>{
            var pixelValue = pixelValues[0];
            var color = convertToRgb(pixelValue);

            return color;
          },
          resolution:256
        })

        

        layers[data.name] = overlay
        

       map.on('click',function(evt){
        
        var latlng = map.mouseEventToLatLng(evt.originalEvent);
        if(data.name == activeLayer){
          var value = geoblaze.identify(georaster, [latlng.lng, latlng.lat])[0]
          value = value.toFixed(3)
          console.log(noData)  
          if(value != noData){
            popup
            .setLatLng(evt.latlng)
            .setContent(
              '<p>Lat:'+evt.latlng.lat.toFixed(4)+',Lon:'+evt.latlng.lng.toFixed(4)+'<p><p>      '+value.toString()+units+'</p>'
              )
            .openOn(map);
          }
        }
      })


      

      })
    })
})

var latId = document.getElementById('latId');

map.on('mousemove',(e)=>{
  //get lat lng 
  latId.innerText = "Lat: "+e.latlng.lat.toFixed(4)+" , Lon: "+e.latlng.lng.toFixed(4)

})



const onErosividad = document.querySelector("#buttonLayerErosividad")
const inputLayerErosividad = document.querySelector("#sliderLayerErosividad")

const onErodabilidad = document.querySelector("#buttonLayerErodabilidad")
const inputLayerErodabilidad = document.querySelector("#sliderLayerErodabilidad")

const onC = document.querySelector("#buttonLayerC")
const inputLayerC = document.querySelector("#sliderLayerC")

const onLS = document.querySelector("#buttonLayerLS")
const inputLayerLS = document.querySelector("#sliderLayerLS")


const onE = document.querySelector("#buttonLayerE")
const inputLayerE = document.querySelector("#sliderLayerE")

const onAbril1 = document.querySelector("#buttonLayerAbril1")
const inputLayerAbril1 = document.querySelector("#sliderLayerAbril1")

const onAbril16 = document.querySelector("#buttonLayerAbril16")
const inputLayerAbril16 = document.querySelector("#sliderLayerAbril16")

const onMayo1 = document.querySelector("#buttonLayerMayo1")
const inputLayerMayo1 = document.querySelector("#sliderLayerMayo1")

const onMayo15 = document.querySelector("#buttonLayerMayo15")
const inputLayerMayo15 = document.querySelector("#sliderLayerMayo15")

const onOctubre1 = document.querySelector("#buttonLayerOctubre1")
const inputLayerOctubre1 = document.querySelector("#sliderLayerOctubre1")

const onOctubre15 = document.querySelector("#buttonLayerOctubre15")
const inputLayerOctubre15 = document.querySelector("#sliderLayerOctubre15")

const onNoviembre1 = document.querySelector("#buttonLayerNoviembre1")
const inputLayerNoviembre1 = document.querySelector("#sliderLayerNoviembre1")

const onNoviembre15 = document.querySelector("#buttonLayerNoviembre15")
const inputLayerNoviembre15 = document.querySelector("#sliderLayerNoviembre15")

const onHidric = document.querySelector(".hidric")

onHidric.addEventListener("click",()=>{
  hidric = !hidric
  if(hidric){
    marker.addTo(map);  
  }else{
    marker.removeFrom(map);
  }

  
  document.getElementById("Information-Layer").innerHTML = "La escasez del recurso hídrico, así como el deterioro progresivo de su calidad es una de las mayores fuentes de preocupación a nivel mundial.  Hacer una gestión eficiente del recurso hídrico puede ayudar a paliar dicha situación, garantizando la seguridad alimentaria de la población. Los puntos indican el cálculo de huella hídrica para las áreas de influencia de quince (15) estaciones meteorológicas repartidas a lo largo del área de estudio, por lo que al seleccionar cada uno de los puntos despliegan los valores correspondientes. Se calculó específicamente los valores de Evapotranspiración Azul, que indica el agua utilizada proveniente de la lluvia y es captado diferentes acuíferos para ser aprovechada en actividades como el riego en agricultura, y los valores de Evapotranspiración Verde que indica la apropiación humana del agua verde por actividad agrícola aprovechando el agua lluvia almacenada en la humedad del suelo. "
})


onAbril1.addEventListener("change",()=>{
  if(onAbril1.checked){
    map.addLayer(layers["Abril 1"]) 
    console.log(layers["Abril 1"])
  activeLayer =  "Abril 1"
  //document.getElementById("legend-layer").src = "http://201.185.137.195:3000/mapsService/thermicTemp.png";
  }else{
    map.removeLayer(layers["Abril 1"])
  }
   
})

inputLayerAbril1.addEventListener("input",(event)=>{
  layers["Abril 1"].setOpacity(event.target.value/100);
})

onAbril16.addEventListener("change",()=>{
  if(onAbril16.checked){
    map.addLayer(layers["Abril 16"]) 
    console.log(layers["Abril 16"])
  activeLayer =  "Abril 16"
  document.getElementById("legend-layer").src = "http://201.185.137.195:3000/mapsService/thermicTemp.png";
  }else{
    map.removeLayer(layers["Abril 16"])
  }
   
})

inputLayerAbril16.addEventListener("input",(event)=>{
  layers["Abril 16"].setOpacity(event.target.value/100);
})

onMayo1.addEventListener("change",()=>{
  if(onMayo1.checked){
    map.addLayer(layers["Mayo 1"]) 
    console.log(layers["Mayo 1"])
  activeLayer =  "Mayo 1"
  document.getElementById("legend-layer").src = "http://201.185.137.195:3000/mapsService/thermicTemp.png";
  }else{
    map.removeLayer(layers["Mayo 1"])
  }
   
})

inputLayerMayo1.addEventListener("input",(event)=>{
  layers["Mayo 1"].setOpacity(event.target.value/100);
})

onMayo15.addEventListener("change",()=>{
  if(onMayo15.checked){
    map.addLayer(layers["Mayo 15"]) 
    console.log(layers["Mayo 15"])
  activeLayer =  "Mayo 15"
  document.getElementById("legend-layer").src = "http://201.185.137.195:3000/mapsService/thermicTemp.png";
  }else{
    map.removeLayer(layers["Mayo 15"])
  }
   
})

inputLayerMayo15.addEventListener("input",(event)=>{
  layers["Mayo 15"].setOpacity(event.target.value/100);
})


onOctubre1.addEventListener("change",()=>{
  if(onOctubre1.checked){
    map.addLayer(layers["Octubre 1"]) 
    console.log(layers["Octubre 1"])
  activeLayer =  "Octubre 1"
  document.getElementById("legend-layer").src = "http://201.185.137.195:3000/mapsService/thermicTemp.png";
  }else{
    map.removeLayer(layers["Octubre 1"])
  }
   
})

inputLayerOctubre1.addEventListener("input",(event)=>{
  layers["Octubre 1"].setOpacity(event.target.value/100);
})

onOctubre15.addEventListener("change",()=>{
  if(onOctubre15.checked){
    map.addLayer(layers["Octubre 15"]) 
    console.log(layers["Octubre 15"])
  activeLayer =  "Octubre 15"
  document.getElementById("legend-layer").src = "http://201.185.137.195:3000/mapsService/thermicTemp.png";
  }else{
    map.removeLayer(layers["Octubre 15"])
  }
   
})

inputLayerOctubre15.addEventListener("input",(event)=>{
  layers["Octubre 15"].setOpacity(event.target.value/100);
})


onNoviembre1.addEventListener("change",()=>{
  if(onNoviembre1.checked){
    map.addLayer(layers["Noviembre 1"]) 
    console.log(layers["Noviembre 1"])
  activeLayer =  "Noviembre 1"
  document.getElementById("legend-layer").src = "http://201.185.137.195:3000/mapsService/thermicTemp.png";
  }else{
    map.removeLayer(layers["Noviembre 1"])
  }
   
})

inputLayerNoviembre1.addEventListener("input",(event)=>{
  layers["Noviembre 1"].setOpacity(event.target.value/100);
})

onNoviembre15.addEventListener("change",()=>{
  if(onNoviembre15.checked){
    map.addLayer(layers["Noviembre 15"]) 
    console.log(layers["Noviembre 15"])
  activeLayer =  "Noviembre 15"
  document.getElementById("legend-layer").src = "http://201.185.137.195:3000/mapsService/thermicTemp.png";
  }else{
    map.removeLayer(layers["Noviembre 15"])
  }
   
})

inputLayerNoviembre15.addEventListener("input",(event)=>{
  layers["Noviembre 15"].setOpacity(event.target.value/100);
})

/*Layers erosividad control*/

onErosividad.addEventListener("change",()=>{
  console.log(onErosividad.checked)
  if(onErosividad.checked){
    map.addLayer(layers["Erosividad"])
    //units = "t*ha*h*(ha*MJ*mm)^(-1)"
    document.getElementById("legend-layer").src = "http://201.185.137.195:3000/mapsService/erodabilidadLegend.png";
    document.getElementById("Information-Layer").innerHTML = "La erosividad de la lluvia o factor R hace referencia a la propensión del suelo a ser arrastrado debido a las características físicas de la lluvia, en especial el tamaño de las gotas, la propagación, la energía cinética y la velocidad. La erosividad es expresada en   y para su cálculo se utilizó una adaptación del Índice Modificado de Fourier (IMF)."
    activeLayer =  "Erosividad"
  }else{
    map.removeLayer(layers["Erosividad"])
  }
   
}) 
inputLayerErosividad.addEventListener("input",(event)=>{
  layers["Erosividad"].setOpacity(event.target.value/100);
})




onErodabilidad.addEventListener("change",()=>{
  if(onErodabilidad.checked){
    map.addLayer(layers["Erodabilidad"]) 
    //units = "t*ha*h*(ha*MJ*mm)^(-1)"
    document.getElementById("legend-layer").src = "http://201.185.137.195:3000/mapsService/erodabilidad.png";
    document.getElementById("Information-Layer").innerHTML = "La erodabilidad del suelo o factor K Variable que indica la tasa de pérdida de suelo, o susceptibilidad del suelo a ser erosionado, que describe la relación entre la resistencia del suelo al desprendimiento y al transporte de sus partículas y las propiedades físicas y químicas del suelo. El factor K es expresado en   y para su cálculo se utilizó un modelo no lineal descrito por Torri et al. (1997)."
    activeLayer =  "Erodabilidad"
  }else{
    map.removeLayer(layers["Erodabilidad"])
  }
}) 
inputLayerErodabilidad.addEventListener("input",(event)=>{
  layers["Erodabilidad"].setOpacity(event.target.value/100);
})

onC.addEventListener("change",()=>{
  if(onC.checked){
    map.addLayer(layers["Factor de Cobertura (C)"]) 
    document.getElementById("legend-layer").src = "http://201.185.137.195:3000/mapsService/C.png";
    document.getElementById("Information-Layer").innerHTML = "El factor C (adimensional) que indica la Cobertura de la Tierra, refleja el efecto amortiguador y combinado de las coberturas que incorporan biomasa y las actividades perturbadoras de los suelos. Tiene un rango entre 1 y 0, donde 1 indica ninguna cobertura que actúa como barrera, y 0 una cobertura muy fuerte del suelo que brinda una buena protección. El cálculo del factor C se realizó a través del análisis de Índices de Diferencia Normalizada de Vegetación (NDVI por su sigla en inglés)."
    activeLayer =  "Factor de Cobertura (C)"
  }else{
    map.removeLayer(layers["Factor de Cobertura (C)"])
  }
   
}) 
inputLayerC.addEventListener("input",(event)=>{
  layers["Factor de Cobertura (C)"].setOpacity(event.target.value/100);
})

onLS.addEventListener("change",()=>{
  if(onLS.checked){
    map.addLayer(layers["Factor longitud e inclinación de la pendiente (LS)"]) 
    document.getElementById("legend-layer").src = "http://201.185.137.195:3000/mapsService/LS.png";
    document.getElementById("Information-Layer").innerHTML = "El factor LS que indica la longitud e inclinación de la pendiente, es una combinación del factor L (longitud pendiente en m) y S (inclinación de la pendiente %), dos parámetros de carácter topográfico, en las que se relaciona la pérdida de suelo en función de la distancia que recorren los sedimentos por escorrentía y su pendiente. La combinación de los factores es adimensional y se calculó a partir de un Modelo Digital de Elevación (MDE) de 12.5 m de resolución espacial."
    activeLayer =  "Factor longitud e inclinación de la pendiente (LS)"
  }else{
    map.removeLayer(layers["Factor longitud e inclinación de la pendiente (LS)"])
  }
   
}) 
inputLayerLS.addEventListener("input",(event)=>{
  layers["Factor longitud e inclinación de la pendiente (LS)"].setOpacity(event.target.value/100);
})

onE.addEventListener("change",()=>{
  if(onE.checked){
    map.addLayer(layers["Tasa de erosión hídrica (E)"]) 
    document.getElementById("legend-layer").src = "http://201.185.137.195:3000/mapsService/E.png";
    activeLayer =  "Tasa de erosión hídrica (E)"
  }else{
    map.removeLayer(layers["Tasa de erosión hídrica (E)"])
  }
   
}) 
inputLayerE.addEventListener("input",(event)=>{
  layers["Tasa de erosión hídrica (E)"].setOpacity(event.target.value/100);
})




