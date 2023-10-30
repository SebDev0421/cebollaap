//grapsh example

//const { config } = require("../Models/devicesData-connection");
//const configProject = require("./configProject.json")
var nonIrrigation = false;


let myChart =new Chart("myChart", {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      data: [],
      borderColor: "red",
      label:'ADT',
      fill: false
    },
    {
      data: [],
      borderColor: "black",
      label:'AFA',
      fill: false
    },
    {
      data: [],
      borderColor: "#FF5733",
      label:'ETc_mm',
      fill: true,
      backgroundColor:"RGBA(255, 87, 51 ,0.5)"
    },
    {
      data: [],
      borderColor: "#11AEC1",
      label:'DR_final_mm',
      fill: true,
      backgroundColor:"RGBA(17, 174, 193 ,0.5)"
    },{
      type:'bar',
      data: [],
      borderColor: "#00E3FF",
      label:'P_efe_mm',
      fill: true,
      backgroundColor:"RGBA(0,227,255,0.5)"
    },
    {
      type:'bar',
      data: [],
      borderColor: "#A7A7A7",
      label:'Perc_prof_mm',
      fill: true,
      backgroundColor:"RGBA(167, 167, 167,0.5)"
    },{
      type:'bar',
      data: [],
      borderColor: "#1300FF ",
      label:'lamina_neta_mm/Efic_riego',
      fill: true,
      backgroundColor:"RGBA(19, 0, 255 ,0.5)"
    }
    
  ]
  },
  options: {
    legend: {display: true,position:'right'}
  }
});

//get data section
//test CSV


const buttonNext = document.getElementById("button-next");
const banner = document.getElementById("informationBanner");


function model(){
  
}



function getDataModel(dateInit,dateEnd,CC,pmp){
  let dataSrc = []
//201.185.137.195 //PUBLIC ACCESS  
//"http://201.185.137.195:3000/Meterological/ETo"
fetch( "http://localhost:3000/Meterological/ETo",{
   method:"POST",
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify(
        {
          dateInit:dateInit,
          dateEnd:dateEnd
        }
      )
    })
    .then(res =>{
      return res.json()
    })
    .then(res =>{
        dataSrc = res.data

        console.log(dataSrc)


        //suelo
        //const CC = 77.7 //Capacidad de campo a 0.1 cbar(%g) (52 % vol_3, 49.2%_2, 53.53%_1)
        //const pmp = 54.95 //Punto de marchitez permanente (%g)(35.5% vol_3, 29.5%_2,35.1%_1)
        const da = 0.646 //#Densidad aparente (-)(0.646_3, 0.65_2,0.646_1) 
        
        //planta
        const Rmin = 0.1 //Longitud de Raiz minima(m)
        const Rmax = 0.3 //Longitud de Raiz maxima(m)
        const Jini = 1  //Tiempo de crecimiento de la raÃ�z (dia)
        const Jmax = 60
        
        //Coeficientes del cultivo por etapas>
        const Kcini = 0.7
        const Kcmed = 1.1
        const Kcfin = 0.9

        const Lini = 20
        const Ldes = 40 
        const Lmed = 20 
        const Lfin = 10

        //Factor de agotamiento
        const pini = 0.3
        const pdes = 0.3

        //Cálculode Agua disponible total
        const a = 0.95 //Porcentaje para Precipitacion efectiva

        //Agotamiento inicial de agua en el suelo
        const Dr0=0 //Cero para iniciar a capacidad de campo

        const k = Lini+Ldes+Lmed+Lfin
        const ciclo = Lini+Ldes+Lmed+Lfin


        let x = []
        let R = []

        let con = 1

        let ADT = 1000*((CC-pmp)/100)    //ADT (mm/m)
        let auxR = []
        //fill base array null
        for(let i = 0; i < dataSrc.length-1; i++){
            auxR = []
            for(let j = 0; j < 20; j++){
                auxR.push(null)
            }
            x.push(auxR)
            R.push(auxR)
        }
        

        //fill table
        for(let i = 1; i < dataSrc.length-1; i++){
            R[i][4] = i;
            R[0][4] = "J";

            //Calculo de la longitud de ra??z

            if(R[i][4]<=Jini){
                R[i][5] = Rmin
            }else{
                if(R[i][4] <= Jmax){
                    R[i][5] = parseFloat((Rmin+((Rmax-Rmin)*((R[i][4]-Jini)/(Jmax-Jini)))).toFixed(2))
                }else{
                    R[i][5] = Rmax
                }
            }
            
            R[0][5] = "Longitud_de_raiz_m";

            //Cálculo de coeficiente del cultivo Kc

            if(R[i][4] <= Lini){
                R[i][6] = Kcini
            }else if(R[i][4]<=(Lini+Ldes)){
                R[i][6] = Kcini+((R[i][4]-Lini)/Ldes)*(Kcmed-Kcini)
            }else if(R[i][4]<=(Lini+Ldes+Lmed)){
                R[i][6] = Kcmed
            }else{
                R[i][6] = Kcmed+((R[i][4]-(Lini+Ldes+Lmed))/Lfin)*(Kcfin-Kcmed)
            }

            R[0][6] = "Kc" 

            //Cálculo de agua disponible total ADT

            R[i][7] = ADT* R[i][5]
            R[0][7] = "ADT_mm"

            //Cálculo factor de agotamiento  (cuadro 22 FAO 56)
            if(R[i][4]<=Lini+Ldes){
                if(parseFloat(dataSrc[i][3])*R[i][6] == 5){
                    R[i][8] = pini
                }else{
                    R[i][8] = Math.max(pini+(0.04*(5-(parseFloat(dataSrc[i][2])*R[i][6]))),0.1)
                }
            }else{
                if(parseFloat(dataSrc[i][3])*R[i][6] == 5){
                    R[i][8] = pdes
                }else{
                    R[i][8] = Math.max(pini+(0.04*(5-(parseFloat(dataSrc[i][2])*R[i][6]))),0.1)
                }
            }

            R[0][8] = "p_aj"

            //Cálculo de agua fácilmente aprovechable AFA

            R[i][9] = R[i][7]*R[i][8]
            R[0][9] = "AFA_mm" 

            //Cálculo de lámina neta
            if(i==1){
    
                if((R[i][9] <= Dr0)){                                               
                  R[i][10] = Dr0
                }else{
                  R[i][10] = 0
                }
              }
              
            else{  
              R[i][10] = 0

                if(nonIrrigation == true){
                  R[i][10] = 0
                }else{
                  if(dates.length>0){
                    for(let j=0 ; j<dates.length; j++){
                      if(dataSrc[i][0]==dates[j]){
                        R[i][10] = R[i-1][16]
                        console.log(dataSrc[i][0])
                        console.log("riego detectado")
                      }
                    }
                  }else{
                    if(R[i][9] <= R[i-1][16]){  
                      R[i][10] = R[i-1][16]
                    }
                    else{
                      R[i][10] = 0
                    }
                  }
                }
              }

              R[0][10] = "Lamina_neta_mm"
              
              console.log(R[i][10])

              //Cálculo de la precipitación efectiva

              R[i][11] = parseFloat(dataSrc[i][1]*a)
              R[0][11] = "P_efec_mm"

              //Cálculo del coeficiente de estrés hidrico Ks (condicionesd no estandar)
              if(i==1){
    
                if((R[i][9])<=Dr0){                                               
                  R[i][12] = Math.max(((R[i][7]-Dr0)/((1-R[i][8])*R[i][7])),0)
                }else{
                  R[i][12] = 1
                }
              }else{
                if((R[i][9])<=R[i-1][19]){                                               
                    R[i][12] = Math.max(((R[i][7]-R[i-1][19])/((1-R[i][8])*R[i][7])),0)
                  }else{
                    R[i][12] = 1
                  }
              }

              R[0][12] = "Ks"

              //Cálculo del coeficiente de estrés hidrico Ks (condicionesd estandar Ks =1)
              R[i][13] = 1
              R[0][13] = "Ks_estand"

              //Cálculo de la evapotranspiración del cultivo  ETc
              R[i][14] = parseFloat(dataSrc[i][2])*R[i][13]*R[i][6]
              R[0][14] = "ETc_mm"
              console.log(R[i][14])

              //Cálculo de la evapotranspiración del cultivo ajustado  ETcaj
              R[i][17] = parseFloat(dataSrc[i][2])*R[i][12]*R[i][6]
              R[0][17] = "ETc_aj_mm"
              
              
              //Cálculo de la percolación profunda estandar
              if(i==1){
                if((R[i][11]+R[i][10]-R[i][14]-Dr0)<0){                                               
                  R[i][15] = 0
                }else{
                  R[i][15]= R[i][11]+R[i][10]-R[i][14]-Dr0
                }
              }else{
                if(i>1){
                    if((R[i][11]+R[i][10]-R[i][14]-R[i-1][16])<0){
                        R[i][15]=0
                      }
                      else{
                        R[i][15]= R[i][11]+R[i][10]-R[i][14]-R[i-1][16]
                      }
                }
                
              }

              R[0][15] = "Perc_Prof_mm"

              

              //Cálculo de la percolación profunda estandar no estandar

              if(i==1){
    
                if((R[i][11]-R[i][17]-Dr0)<0){                                               
                  R[i][18]=0
                }else{
                  R[i][18] = R[i][11]-R[i][17]-Dr0
                }
              }
              
              else{
                if((R[i][11]-R[i][17]-R[i-1][19])<0){
                    R[i][18] = 0
                }
                else{
                    R[i][18] =R[i][11]-R[i][17]-R[i-1][19]
                }
              }
              
              R[0][18] = "Perc_Prof_aj_mm"

              //Cálculo del agotamiento de agua final en el suelo Dr final
              
              if(i==1){
                R[i][16] = Dr0-R[i][11]+R[i][14]+R[i][15]-R[i][10]          //Ya tiene el riego en Dr ini
              }else{
                R[i][16] = R[i-1][16]-R[i][11]+R[i][14]+R[i][15]-R[i][10]
                 
              }
              R[0][16] = "Dr_final_mm"


              
              if(i==1){
                R[i][19]=Dr0-R[i][11]+R[i][17]+R[i][18]          //Ya tiene el riego en Dr ini
              }else{
                R[i][19]=R[i-1][19]-R[i][11]+R[i][17]+R[i][18]
              }
              R[0][19] = "Dr_final_aj_mm" 


              R[i][3] = parseFloat(dataSrc[i][2])
              R[0][3] = "ETO"

              R[i][2] = parseFloat(dataSrc[i][1])
              R[0][2] = "P(mm)"

              R[i][1] = dataSrc[i][0]
              R[0][1] = "Fecha"
        }

        //Params: Dr, ETc, Perc, AFA, ADT, R, P, Um


        //create varibles than save parameters
        let ADT_mm = []
        let AFA_mm = []
        let ETc_mm = []
        let Dr_final_mm = []
        let P_efec_mm = []
        let Perc_Prof_mm = []
        let Lamina_neta_mm = []
        let ks = []
        let Kc = []
        let ks_standart = []
        let ETc_aj = []
        let Date_label = []
        let Colors_Alarms = []
        let radius_controll = []

        const table = document.getElementById("bodyData");

        

        for(let i = 1 ; i<R.length; i++){
          //add to ADT
          ADT_mm.push(-R[i][7])
          ks.push(R[i][12])
          Kc.push(R[i][6])
          ETc_aj.push(R[i][17])
          ks_standart.push(R[i][13])
          AFA_mm.push(-R[i][9])
          ETc_mm.push(R[i][14])
          Dr_final_mm.push(-R[i][16])
          P_efec_mm.push(R[i][11])
          Perc_Prof_mm.push(-R[i][15])
          Lamina_neta_mm.push(R[i][10])
          Date_label.push(R[i][1])
          

          if(R[i][16]>=R[i][9] && R[i][16]<=R[i][7]){
            Colors_Alarms.push('orange')
            radius_controll.push(4)
          }else if(R[i][16]>R[i][7]){
            Colors_Alarms.push('red')
            radius_controll.push(6)
          }else{
            Colors_Alarms.push('RGBA(17, 174, 193 ,0.5)')
            radius_controll.push(1)
          }

          


        }

        console.log(ETc_mm)

        for(let i = 0 ; i<Date_label.length; i++){

          //console.log(Date_label[i],ADT_mm[i],AFA_mm[i],ETc_mm[i],Dr_final_mm[i],P_efec_mm[i],Perc_Prof_mm[i],Lamina_neta_mm[i])
          let row = table.insertRow();
          let date = row.insertCell(0);
          date.innerHTML = Date_label[i]
          let prec = row.insertCell(1);
          prec.innerHTML = dataSrc[i+1][1]
          let eto = row.insertCell(2);
          eto.innerHTML = dataSrc[i+1][2]
          let dr = row.insertCell(3);
          dr.innerHTML = Math.round(Dr_final_mm[i]*100)/100
          let etc = row.insertCell(4);
          etc.innerHTML = Math.round(ETc_mm[i]*100)/100
          let per = row.insertCell(5);
          per.innerHTML = Math.round(Perc_Prof_mm[i]*100)/100
          let afa = row.insertCell(6);
          afa.innerHTML = Math.round(AFA_mm[i]*100)/100
          let adt = row.insertCell(7);
          adt.innerHTML = Math.round(ADT_mm[i]*100)/100
          let lamina = row.insertCell(8);
          lamina.innerHTML = Math.round(Lamina_neta_mm[i]*100)/100
          let p = row.insertCell(9);
          p.innerHTML = Math.round(P_efec_mm[i]*100)/100
          let KS = row.insertCell(10);
          KS.innerHTML = ks[i]
          let KC = row.insertCell(11);
          KC.innerHTML = Kc[i]
          let KS_stand = row.insertCell(12);
          KS_stand.innerHTML = ks_standart[i]
          let ETc_AJ = row.insertCell(13);
          ETc_AJ.innerHTML = ETc_aj[i]
          
        }
        

        ////console.log(Dr_final_mm)
      

        //variables to graph


        const xValues = Date_label;

        const ctx = document.getElementById('myChart');

        myChart.destroy();

        /* agregar Agotamiento de humedad en el suelo [mm] en el eje Y y en el eje x dias depues de siembra  */

        /* tabla de datos debajo de la generecion de grafica Eto , presipitacion y la salida del ,modelo */
        

        myChart =new Chart("myChart", {
          type: "line",
          options:{

            scale:{
              x:{
                type:'time',
                ticks:{
                  major:{
                    enabled:true
                  } 
                }
              }
            },
            elements:{
              
              point:{
                radius:0
              }
            }
          },
          data: {
            labels: xValues,
            datasets: [{
              data: ADT_mm,
              borderColor: "red",
              pointRadius: 1,
              label:'ADT',
              fill: false
            },
            {
              data: AFA_mm,
              borderColor: "black",
              pointRadius: 1,
              label:'AFA',
              fill: false
            },
            {
              data: ETc_mm,
              borderColor: "#FF5733",
              label:'ETc_mm',
              pointRadius: 1,
              fill: true,
              hidden:true,
              backgroundColor:"RGBA(255, 87, 51 ,0.5)"
            },
            {
              data: Dr_final_mm,
              pointRadius: radius_controll,
              pointBackgroundColor:Colors_Alarms,
              label:'DR_final_mm',
              fill: true,
              backgroundColor:"RGBA(17, 174, 193 ,0.5)"
            },{
              type:'bar',
              data: P_efec_mm,
              borderColor: "#00E3FF",
              label:'P_efe_mm',
              fill: true,
              hidden:false,
              backgroundColor:"RGBA(0,227,255,0.5)"
            },
            {
              type:'bar',
              data: Perc_Prof_mm,
              borderColor: "#A7A7A7",
              label:'Perc_prof_mm',
              fill: true,
              hidden:true,
              backgroundColor:"RGBA(167, 167, 167,0.5)"
            },{
              type:'bar',
              data: Lamina_neta_mm,
              borderColor: "#1300FF ",
              label:'lamina_neta_mm/Efic_riego',
              fill: true,
              backgroundColor:"RGBA(19, 0, 255 ,0.5)"
            }
            
          ]
          },
          options: {
            legend: {display: true,position:'right'}
          }
        });
    }
    )
}

const dateInit = document.getElementById("dateInit")
const dateLast = document.getElementById("dateEnd") //fecha ultimo riego
const button_deploy = document.getElementById("button-deploy")
const know_data = document.getElementById("know-data")
const data_fill = document.getElementById("data-fill")
const data_fill_date = document.getElementById("data-fill-date")
const add_dates_model = document.getElementById("button-add")
const dates_irragation = document.getElementById("riego-select")





const date = new Date();

const pastDate = new Date();
pastDate.setDate(date.getDate() - 90 );

var formattedPastDate = pastDate.toISOString().split('T')[0];

dateInit.min = formattedPastDate;

dateInit.max = date.toISOString().split('T')[0];


dateLast.min = formattedPastDate;

dateLast.max = date.toISOString().split('T')[0];

var prev = false;


dates_irragation.addEventListener("change",()=>{
  const x = dates_irragation.value
  if(x=='1'){
    data_fill_date.style.display = 'none'
    nonIrrigation = false
  }
  else if(x=='2'){
    data_fill_date.style.display = 'none'
    nonIrrigation = true
  }
  else if(x=='3'){
    data_fill_date.style.display = 'block'
    nonIrrigation = false
  }

})

know_data.addEventListener("click",()=>{

  prev=!prev
  if(prev){
    data_fill.style.display = 'block'
  }else{
    data_fill.style.display = 'none'
  }

})


var dates = []
add_dates_model.addEventListener("click",()=>{
  
  if(!dateLast.value == ''){
    let cum = 0
    for(let i = 0; i<dates.length; i++ ){
      if(dateLast.value == dates[i]){
        cum = 1;
      }
    }
    if(!cum){
      dates.push(dateLast.value)
      //console.log(dates)
      const node = document.createElement("li");
      const textnode = document.createTextNode(dateLast.value);
      node.appendChild(textnode);
      document.getElementById("dates-selected").appendChild(node);
    }
    
  }
  
  

})


button_deploy.addEventListener("click",()=>{


  const ccStr = document.getElementById("CapacidadCampo").value
  const pmpStr = document.getElementById("puntoMarchitez").value
//get today for calculated 90 days after maximun


  const cc = parseFloat(ccStr)
  const pmp = parseFloat(pmpStr)
  ////console.log(cc)
  ////console.log(pmp)

  const dateEnd = date.toISOString().split('T')[0]; //today date
  getDataModel(dateInit.value,dateEnd,cc,pmp)

})
