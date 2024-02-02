/*	BRC Calculator
	BRC author: Sathaa Sathasivan
	Javascript & MATLAB implementation by Ram Singh
	v.1.0: 7 Sep 2021 - Implemented code with basic computational functions.
	v.1.1: 26 Dec 2021 - Implemented feedback text display to html.
	v.1.2: 27 Dec 2021 - Implemented coloured status feedback.
	v.1.3: 28 Dec 2021 - Implemented time to nitrification.
	Updates by Inuri Gunasekara
	Seperated BRC_calc() function to BRC_calc_sp() and BRC_calc_oa()
	Added BRC_calc() function for system decay analysis
	Added reset functions 
	Added an event listener to retrieve values from local storage
	Added new calculations for BRC_calc_sp()
*/


window.addEventListener("load",loadItems);

// Load values from localStorage or use default values
function loadItems(e) {
	// Load Values in from local storage 
	var path = window.location.pathname;
	var page = path.split("/").pop();

	if(page=="index.html" || page=="help.html") {
		return;
	} else if(page=="systemanalysis.html") {
		var key="sa_key";
	} else {
		var key="data_key";
	} 

	var records = window.localStorage.getItem(key);

	if(records!=null) {
		var struct = JSON.parse(records);

		for (var x in struct){
			if(document.getElementById(x).tagName.toLowerCase() === 'input') {
				document.getElementById(x).value = struct[x];
			} else {
				document.getElementById(x).innerHTML = struct[x];
			}
		} 		
	} // Else set values to default
		else {
			if (key == "data_key" && page=="statusprediction.html" || key == "data_key" && page=="optionsanalysis.html") {
				return
			} else if (key == "sa_key") {
					var records = '{"cl_t":"2.2","nh_t":"0.55","des_temp":"25","alk":"40","ph":"7.8"}';
			}

			var struct = JSON.parse(records);

			for (var x in struct){
				if(document.getElementById(x).tagName.toLowerCase() == 'input' || document.getElementById(x).tagName.toLowerCase() == 'select') {
					document.getElementById(x).value = struct[x];
				} else {
					document.getElementById(x).innerHTML = struct[x];
				}
			}
		}
}

// Go to chosen page on button click
function goTo() {
	var page = document.getElementById("nav-select").value;
	window.open(page,"_self");
}

function changeCard() {
	var id = document.getElementById("")
}

// Change text in details tag on click
function changeText() {
	var text = document.getElementById("summary-text");

	if(text.innerHTML == "Show detailed explaination of results") {
		text.innerHTML = "Hide detailed explaination of results";
;	} else {
		text.innerHTML = "Show detailed explaination of results";
	}
}

// function displayData(addressData) {
    
//     // Display only upto first comma
//     var region = addressData.results[0].components.country //.split(",",4)[2];
// 	// console.log(region)

// 	document.getElementById('region').value = region;
    
// }

// function getAddress(e) {

// 	if (navigator.geolocation) {
// 		navigator.geolocation.getCurrentPosition(getCoordinates)
		
// 	} else {
// 		displayMessage("Browser does not support GeoLocation",3) ;
// 	}
		
// }

// function getCoordinates(position) {
// 	var longitude = position.coords.longitude;
// 	var latitude = position.coords.latitude;
// 	getAPI(longitude,latitude);
// }

// // Get location data
// function getAPI(longitude,latitude) {
// 	var apikey = '685644160d1347d3b012544ee17d6214';
// 	var api_url = 'https://api.opencagedata.com/geocode/v1/json';

//  var request_url = api_url
//    + '?'
//    + 'key=' + apikey
//    + '&q=' + encodeURIComponent(latitude + ',' + longitude)
//    + '&callback=displayData';
   
//    let script = document.createElement('script');
//    script.src = request_url;
//    document.body.appendChild(script)
// }

function validateInputsDataEntry() {
	// Remove Error div
	var elem = document.getElementsByClassName("error-div");
	for(i=0; i < elem.length; i++) {
		if (elem[i] != null) {
			elem[i].innerHTML = '';
		}
	}

	// Reset error div
	var cells = document.getElementsByClassName("cell-input");
	for(i=0; i < cells.length; i++) {
		cells[i].childNodes[0].style.background = "#f1edf5";
	}

	// INPUT
	// Acquire following input variables from HTML form:
	// Data Entry variables

	var date = document.getElementById("date").value;				// Date
	var avg_vol = document.getElementById("avg_vol").value;			// Average volume of water (ML)
	var ret_t = document.getElementById("ret_t").value;				// Retention time within reservoir (h)
	var cl_i = document.getElementById("cl_i").value;				// Total chlorine in (mg/L)
	var cl_o = document.getElementById("cl_o").value;				// Total chlorine out (mg/L)
	var nh_o = document.getElementById("nh_o").value;				// Total ammonia (mg-N/L)
	var pH = (document.getElementById('pH').value);					// pH level
	var temp_i = document.getElementById("temp_i").value;			// Temperature in (deg-C)
	var temp_o = document.getElementById("temp_o").value;			// Temperature out (deg-C)
	var nano3_o = document.getElementById("nano3_o").value;			// Nitrate out (mg-N/L)
	var alk = document.getElementById("alk").value;					// Alkaline Value

	// Set flag 
	var flag = 0;
	// date
	if(!date) {
		flag = 1;
		errorMessage(0,1);
	} 

	// Average volume
	if(avg_vol < 0.1 || avg_vol > 500) {
		flag = 1;
		errorMessage(1,1);
	}
	// Retention time
	if(ret_t < 1 || ret_t > 150) {
		flag = 1;
		errorMessage(2,1);
	}
	// Total chlorine in
	if(cl_i < 0.5 || cl_i > 5) {
		flag = 1;
		errorMessage(3,1);
	}
	// Total chlorine out
	if(cl_o < 0.05 || cl_o > 5) {
		flag = 1;
		errorMessage(4,1);
	}
	// Total ammonia out
	if(nh_o < 0.05 || nh_o > 1.5) {
		flag = 1;
		errorMessage(5,1);
	}
	// pH
	if(pH < 0 || pH > 10) {
		flag = 1;
		errorMessage(6,1);
	}
	// Temperature in 
	if(temp_i < 10 || temp_i > 32) {
		flag = 1;
		errorMessage(7,1);
	}
	// Temperature out
	if(temp_o < 10 || temp_o > 32) {
		flag = 1;
		errorMessage(8,1);
	}
	// Nitrate out
	if(nano3_o < 0 || nano3_o > 1) {
		flag = 1;
		errorMessage(9,1);
	}
	// Alkaline 
	if(alk < 0 || alk > 200) {
		flag = 1;
		errorMessage(10,1);
	}
	// Chlorine to Ammonia ratio
	var cl_n_ratio = cl_o/nh_o;
	if(cl_n_ratio > 4.6) {
		flag = 2;
		errorMessage(11,2);
	}

	if(flag==0) {
		BRC_save_data();
	} 
}

function validateInputsSystem() {

	// Remove Error div
	var elem = document.getElementsByClassName("error-div");
	for(i=0; i < elem.length; i++) {
		if (elem[i] != null) {
			elem[i].innerHTML = '';
		}
	}

	// Reset error div
	var cells = document.getElementsByClassName("cell-input");
	for(i=0; i < cells.length; i++) {
		cells[i].childNodes[0].style.background = "#f1edf5";
	}

	var elem = document.getElementsByClassName("cl_disinf")[0].value;

	var flag = 0;

	if(elem.toLowerCase() != "yes") {
		flag = 3;
		errorMessage(2,3);
	}

	if(flag==0) {
		BRC_calc_sa();
	} 
}

// Display relevant error message
function errorMessage(errorID, flag) {
	
	displayText = {
		1:"INVALID INPUT",
		2:"Decay Status Not Valid",
		3:"Not Possible to Calculate"
	};
	// Highlight cell with error
	document.getElementsByClassName("cell-input")[errorID].childNodes[0].style.background = "#ffb3b3";

	// Create error div to display error
	const errorDiv = document.createElement("div");
	errorDiv.className = "error-div";

	const newContent = document.createTextNode(displayText[flag]);
	errorDiv.appendChild(newContent);

	errorDiv.style.fontWeight = "bold";
	errorDiv.style.textAlign = 'center';
	errorDiv.style.color = 'red';

	const prevDiv = document.getElementsByClassName("table-btn");
	const parentDiv = document.getElementsByClassName("wrapper")[1];
	parentDiv.insertBefore(errorDiv,prevDiv[0]);
	return;
}

function errorMessageOutput(parentNo,prevNo,flag) {

	displayText = {
		1:"INVALID INPUT",
		2:"Decay Status Not Valid",
		3:"Not Possible to Calculate"
	};

	// Create error div to display error
	const errorDiv = document.createElement("div");
	errorDiv.className = "error-div";

	const newContent = document.createTextNode(displayText[flag]);
	errorDiv.appendChild(newContent);

	errorDiv.style.fontWeight = "bold";
	errorDiv.style.textAlign = 'center';
	errorDiv.style.color = 'red';

	const prevDiv = document.getElementsByClassName("table-btn")[prevNo];
	const parentDiv = document.getElementsByClassName("wrapper")[parentNo];
	parentDiv.insertBefore(errorDiv,prevDiv);
	return;
}

function BRC_save_data() {
	
	// INPUT
	// Acquire following input variables from HTML form:
	// Data Entry variables

	var date = document.getElementById("date").value;				// Date
	var avg_vol = document.getElementById("avg_vol").value;			// Average colume of water (ML)
	var ret_t = document.getElementById("ret_t").value;				// Retention time within reservoir (h)
	var cl_i = document.getElementById("cl_i").value;				// Total chlorine in (mg/L)
	var cl_o = document.getElementById("cl_o").value;				// Total chlorine out (mg/L)
	var nh_o = document.getElementById("nh_o").value;				// Total ammonia (mg-N/L)
	var pH = (document.getElementById('pH').value);					// pH level
	var temp_i = document.getElementById("temp_i").value;			// Temperature in (deg-C)
	var temp_o = document.getElementById("temp_o").value;			// Temperature out (deg-C)
	var nano3_o = document.getElementById("nano3_o").value;			// Nitrate out (mg-N/L)
	var alk = document.getElementById("alk").value;					// Alkaline Value

	// Store updated values in localStorage

	var key = "data_key";

	const data = {
		date: date,
		avg_vol: avg_vol,
		ret_t: ret_t,
		cl_i: cl_i,
		cl_o: cl_o,
		nh_o: nh_o,	
		pH: pH,
		temp_i: temp_i,
		temp_o: temp_o,	
		nano3_o: nano3_o,
		alk: alk
		}

	window.localStorage.setItem(key,JSON.stringify(data));

}

function BRC_calc_sp(){
	// INPUT
	// Acquire following input variables from localStorage:
	// Data Entry variables
	
	var key = "data_key";
	var records = JSON.parse(window.localStorage.getItem(key));
	
	var date = records.date;
	var avg_vol = records.avg_vol;			// Average colume of water (ML)
	var ret_t = records.ret_t;				// Retention time within reservoir (h)
	var cl_i = records.cl_i;				// Total chlorine in (mg/L)
	var cl_o = records.cl_o;				// Total chlorine out (mg/L)
	var nh_o = records.nh_o;				// Total ammonia (mg-N/L)
	var pH = records.pH;					// pH level
	var temp_i = records.temp_i;			// Temperature in (deg-C)
	var temp_o = records.temp_o;			// Temperature out (deg-C)
	var nano3_o = records.nano3_o;			// Nitrate out (mg-N/L)
	var alk = records.alk;					// Alkaline value
	
	// Define output variables
	var k_rt_T1, k_cT1, FN_oT1, FN_iT1, Um_Kd_oT1, Um_Kd_iT1, BRC_oT1, BRC_iT1;
    var DT, Cl_iT2, k_rt_T2, Cl_oT2, N_oT2, T_o2, k_cT2, FN_oT2, FN_iT2, Um_Kd_oT2, Um_Kd_iT2, BRC_oT2, BRC_iT2, Res_decision_oT2;
    var Res_decision_iT2, Res_k_rtT2, y;
	var status_ni_i_curr,status_ni_r_curr,status_dec_curr,status_ni_i_pre,status_ni_r_pre,status_dec_pre;

	var d1 = new Date(date);			// Get current date
	var m = parseFloat(d1.getMonth())+parseFloat(1);		// Get current month index
	var d = 1;		// start things off

	DT_10 = calcTemp(date)
	console.log(DT_10);
	// var DT_10 = 1;
	var alpha = 0.95;				// Adjustment factor for increase or decrease

	if(m > 3 && m < 9) {
		// DT_10 = -0.5;
		alpha = 1.05;
	} 
	
    // Convert to floating-point value:
	temp_o = parseFloat(temp_o);
	temp_i = parseFloat(temp_i);
	nh_o = parseFloat(nh_o);
	cl_i = parseFloat(cl_i);
	
	// DATA ENTRY OUTPUT:
	nh_i = parseFloat(nh_o)+parseFloat((cl_i-cl_o)*0.07);				// Total inlet ammonia
	
    // N_iT1 =N_oT1 + (Cl_iT1-Cl_oT1)*0.07; %Total Ammonia in inlet

    k_rt_T1=(cl_i/cl_o - 1)/ret_t;

    // Chemical decay rate at reservoir
    k_cT1 = (Math.pow(10,-3.113) + Math.pow(10,(5.1 - pH)))*(81.98/(5.46-cl_o/nh_o))*(0.003+0.0002*cl_o)*(3.9+0.0029*alk)*Math.exp(-3560*(1/(273+temp_o)-1/298));
	
    FN_oT1 = nh_o - cl_o/5.07;

    FN_iT1 = nh_i - cl_i/5.07; 

    Um_Kd_oT1 = Um_Kd(temp_o);

    Um_Kd_iT1 = Um_Kd(temp_i);

    BRC_oT1 = BRC_T(Um_Kd(temp_o), FN_oT1);

    BRC_iT1 = Um_Kd(temp_i)*(FN_iT1/(0.18 + FN_iT1));  

    Res_decision_oT1 = cl_o - BRC_oT1;

    // Nitrification risk in inlet 
    Res_decision_iT1=cl_i - BRC_iT1;

    Res_k_rtT1 = k_rt_T1/k_cT1;         // now

    // Current reservoir status 
	status_ni_i_curr = NitrificationDecision(Res_decision_iT1);
    status_ni_r_curr = NitrificationDecision(Res_decision_oT1);
    status_dec_curr = DecayDecision(Res_k_rtT1);;

    // Reservoir status in 10 days
    d = 10;
    DT = DT_10/10*d;
    Cl_iT2 = Math.pow(alpha,d/10)*cl_i;              // Total chlorine at inlet
    k_rt_T2 = k_rt_T1 * Math.pow(1.08,DT);  
    Cl_oT2 = Cl_iT2/(1 + ret_t * k_rt_T2);            // Total chlorine at outlet
    N_oT2 = nh_o + 0.07*(cl_o - Cl_oT2);               // Total ammonia at outlet
    T_o2 = temp_o + d/10;                            // Future outlet temparate in 10 days
    T_i2 = temp_i + d/10;                              // Future inlet temparate in 10 days
    N_iT2 = nh_i + 0.07*(cl_i-Cl_iT2);                  // Total ammonia in inlet

    // Chemical decay rate at T2 
    
    k_cT2 = k_cT1 * Math.pow(1.04,DT);

    FN_oT2 = N_oT2 - Cl_oT2/5.07;
    // if(FN_oT2 < 0) {
    //     FN_oT2 = 0;
    // }
	
    FN_iT2 = N_iT2 - Cl_iT2/5.07; 
    // if (FN_iT2<0) {
    //     FN_iT2 = 0;
    // }

    Um_Kd_oT2 = Um_Kd(T_o2);

    Um_Kd_iT2 = Um_Kd(T_i2);

	BRC_oT2 = BRC_T(Um_Kd(T_o2), FN_oT2);
	BRC_iT2 = Um_Kd(T_i2)*(FN_iT2/(0.18 + FN_iT2));  
    Res_decision_oT2 = Cl_oT2 - BRC_oT2;

    // Nitrification risk in inlet 
    Res_decision_iT2 = Cl_iT2 - BRC_iT2;

    Res_k_rtT2 = k_rt_T2/k_cT2; // now

    // Reservoir status in given number of days (d)  
    status_ni_i_pre = NitrificationDecision(Res_decision_iT2);
    status_ni_r_pre = NitrificationDecision(Res_decision_oT2); 
	status_dec_pre = DecayDecision(Res_k_rtT2);
	

	// Time to Nitrification
	y = 0.4;
	d = 0;

	while (y > 0.2) {
		y = prediction(temp_o, k_cT1, k_rt_T1, cl_i, cl_o, nh_o, alpha, d, ret_t);
		d = d + 1 ;

		if (d > 25)
			break;
	}
		
	if (d > 25) {
		t2n = ">25";
	} else {
		t2n = d - 1;
	}

	// Return output variables to HTML:	
	var status = [status_ni_i_curr,status_ni_r_curr,status_dec_curr,status_ni_i_pre,status_ni_r_pre,status_dec_pre];
	var element = [
		document.getElementById('status_ni_i_curr'),
		document.getElementById('status_ni_r_curr'),
		document.getElementById('status_dec_curr'),
		document.getElementById('status_ni_i_pre'),
		document.getElementById('status_ni_r_pre'),
		document.getElementById('status_dec_pre')
	];

	for(var i = 0; i < 6; i++) {
		setStatus(element[i],status[i])
	}

	document.getElementById('t2n').innerHTML = t2n;

}

function Um_Kd(T) {
    // var y = (0.00000774*T^5-0.0008*T^4+0.0309*T^3-0.5579*T^2+4.8468*T-15.425)/1.16;
    var y = (0.00000774 * Math.pow(T,5) - 0.0008 * Math.pow(T,4) + 0.0309 * Math.pow(T,3) - 0.5579 * Math.pow(T,2) + 4.8468 * T - 15.425)/1.16;

    return y;
}

function BRC_T(NmKd_T, FN_T) {
    var y = NmKd_T*(FN_T/(0.18+FN_T));

    return y;
}

function NitrificationDecision(x) {

    var decision;

    if (x > 0.4) 
        decision = 'GREEN';
    else if (x > 0.2)
        decision = 'ORANGE';
    else
        decision = 'RED';
    return decision;
}

function DecayDecision(x) {
	var decision;

	if(x > 2.5)
		decision = 'RED';
	else if(x > 1)
		decision = 'ORANGE';
	else
		decision = 'GREEN';

	return decision;
}

function prediction(T_o1, k_cT1, k_rt_T1, Cl_iT1, Cl_oT1, N_oT1, alpha, d, ret_t) {

    var DT, Cl_iTd, k_rt_Td, Cl_oTd, N_oTd, T_od, k_cTd, FN_oTd, Um_Kd_oTd, BRC_oTd, y;

    DT = 1/10 * d;
    Cl_iTd = Math.pow((alpha),(d/10))*Cl_iT1; // Total chlorine in inlet
    k_rt_Td = k_rt_T1 * Math.pow(1.08,DT);  // This needs to be calculated here
    Cl_oTd = Cl_iTd/(1 + ret_t * k_rt_Td); //Total chlorine in outlet
    N_oTd = N_oT1 + 0.07*(Cl_oT1-Cl_oTd); // Total Amonia in outlet
    T_od = T_o1 + d/10; // Future outlet temparate in d days
    k_cTd = k_cT1 * Math.pow(1.04,DT);
    FN_oTd = N_oTd - Cl_oTd/5.07;
    Um_Kd_oTd = Um_Kd(T_od);
    BRC_oTd = BRC_T(Um_Kd(T_od), FN_oTd);

    y = Cl_oTd - BRC_oTd;

    return y;
}

// Decrease Retention time calculations
function BRC_calc_ret(){
// INPUT
	// Acquire following input variables from localStorage:
	// Data Entry variables
	
	var key = "data_key";
	var records = JSON.parse(window.localStorage.getItem(key));
	
	var ret_t = records.ret_t;				// Retention time within reservoir (h)
	var cl_i = records.cl_i;				// Total chlorine in (mg/L)
	var cl_o = records.cl_o;				// Total chlorine out (mg/L)
	
	// Option analysis: Decrease retention time
	var new_ret_t = document.getElementById("new_ret_t").value;		// New retention time (h)

	// Option analysis: Decrease retention time
	y_cl = cl_i/(parseFloat(1)+parseFloat(1/ret_t*((cl_i/cl_o)-1)*new_ret_t));							// Resulting chlorine for new retention time

	// Return output variables to HTML:
	document.getElementById('y_cl').innerHTML = y_cl.toFixed(2);
}

// Option analysis: Rechloramination calculations
function BRC_calc_clnh() {
	// INPUT
	// Acquire following input variables from localStorage:
	// Data Entry variables
	
	var key = "data_key";
	var records = JSON.parse(window.localStorage.getItem(key));
	
	var ret_t = records.ret_t;				// Retention time within reservoir (h)
	var cl_i = records.cl_i;				// Total chlorine in (mg/L)
	var cl_o = records.cl_o;				// Total chlorine out (mg/L)
	var nh_o = records.nh_o;				// Total ammonia (mg-N/L)
	var nano3_o = records.nano3_o;			// Nitrate out (mg-N/L)

	// Option analysis: Rechloramination
	var a_cl_1 = document.getElementById("a_cl_1").value;			// Added chlorine (kg/ML)
	var des_cl2n_1 = document.getElementById("des_cl2n_1").value;	// Desired Cl/N
	
	// Option analysis: Rechloramination
	// Ammonia to be added:
	if ((parseFloat(a_cl_1)+parseFloat(cl_o))/des_cl2n_1-nh_o > 0)
		y_nh_add = (parseFloat(a_cl_1)+parseFloat(cl_o))/des_cl2n_1-nh_o;
	else
		y_nh_add = 0;
	
	y_cl_im = parseFloat(cl_o)+parseFloat(a_cl_1);														// Chlorine immediately
	y_cl_nd1 = parseFloat(cl_o)+parseFloat((a_cl_1-nano3_o*5)*Math.exp(-cl_i/cl_o/ret_t*24));			// Chlorine next day
	
	// Return output variables to HTML:
	document.getElementById('y_nh_add').innerHTML = y_nh_add.toFixed(2);
	document.getElementById('y_cl_im').innerHTML = y_cl_im.toFixed(2);
	document.getElementById('y_cl_nd1').innerHTML = y_cl_nd1.toFixed(2);
}

// Option analysis: Rechlorination calculations
function BRC_calc_cl() {
	// INPUT
	// Acquire following input variables from localStorage:
	// Data Entry variables
	
	var key = "data_key";
	var records = JSON.parse(window.localStorage.getItem(key));
	
	var ret_t = records.ret_t;				// Retention time within reservoir (h)
	var cl_i = records.cl_i;				// Total chlorine in (mg/L)
	var cl_o = records.cl_o;				// Total chlorine out (mg/L)
	var nh_o = records.nh_o;				// Total ammonia (mg-N/L)
	var nano3_o = records.nano3_o;			// Nitrate out (mg-N/L)

	// Option analysis: Rechlorination
	var y_cl_dose = document.getElementById("y_cl_dose").value;

	// Option analysis: Rechlorination
	y_cl_res = parseFloat(cl_o) + parseFloat(y_cl_dose);
	des_cl2n_2 = y_cl_res/nh_o;													// Resulting chlorine/Ammonia ratio

	// Remove Error div
	var elem = document.getElementsByClassName("error-div");
	for(i=0; i < elem.length; i++) {
		if (elem[i] != null) {
			elem[i].innerHTML = '';
		}
	}

	// Error check for cl/n
	if(des_cl2n_2 > 5) {
		errorMessageOutput(6,2,3);
		return
	}

	y_cl_nd2 = parseFloat(cl_o)+parseFloat((y_cl_dose-5*nano3_o)*Math.exp(-cl_i/cl_o/ret_t*24));		// Chlorine next day

	// Return output variables to HTML:
	document.getElementById('des_cl2n_2').innerHTML = des_cl2n_2.toFixed(2);
	document.getElementById('y_cl_res').innerHTML = y_cl_res.toFixed(2);
	document.getElementById('y_cl_nd2').innerHTML = y_cl_nd2.toFixed(2);
}

// Option analysis: Partial breakpoint calculations
function BRC_calc_bp() {
// INPUT
	// Acquire following input variables from localStorage:
	// Data Entry variables
	
	var key = "data_key";
	var records = JSON.parse(window.localStorage.getItem(key));
	
	var ret_t = records.ret_t;				// Retention time within reservoir (h)
	var cl_i = records.cl_i;				// Total chlorine in (mg/L)
	var cl_o = records.cl_o;				// Total chlorine out (mg/L)
	var nh_o = records.nh_o;				// Total ammonia (mg-N/L)
	var nano3_o = records.nano3_o;			// Nitrate out (mg-N/L)
	var bp_no;

	// Option analysis: Partial breakpoint
	var des_cl2n_3 = document.getElementById("des_cl2n_3").value;	// Desired Cl/N
	
	// Option analysis: Partial breakpoint
	y_cl_im_pb = des_cl2n_3*nh_o+nano3_o/2*5;									// Chlorine immediately
	y_cl_dose_pb = y_cl_im_pb-cl_o;												// Chlorine dose
	y_cl_nd3 = parseFloat(cl_o)+parseFloat((y_cl_dose_pb-nano3_o*5)*Math.exp(-cl_i/cl_o/ret_t*24))-0.5*nh_o;	// Chlorine next day
	
	// Display calculation
	bp_no = cl_i - 0.1;

	// Return output variables to HTML:
	document.getElementById('y_cl_im_pb').innerHTML = y_cl_im_pb.toFixed(2);
	document.getElementById('y_cl_dose_pb').innerHTML = y_cl_dose_pb.toFixed(2);
	document.getElementById('y_cl_nd3').innerHTML = y_cl_nd3.toFixed(2);
	document.getElementById('bp_no').innerHTML = "~" + bp_no.toFixed(1);
}

// System analysis calculations
function BRC_calc_sa()
{
	// INPUT
	// Acquire following input variables from HTML form:
	// Data Entry variables

	// System: variables
	var cl_t = document.getElementById("cl_t").value;				// Total chlorine (mg/L)
	var nh_t = document.getElementById("nh_t").value;	
	var cl_disinf = document.getElementsByClassName("cl_disinf")[0].value;
	var des_temp = document.getElementById("des_temp").value;
	var alk = document.getElementById("alk").value;					// Alkalinity (mg/L as CaCO3)
	var ph = document.getElementById("ph").value;						// Bromide (mg/L)

	// Define output variables
	var y_cln, y_cl_drop;
	
	// DATA ENTRY OUTPUT:
	y_cln = cl_t/nh_t;							// Chlorine-to-ammonia ratio (<4.8)
	y_c_dec_20 = (Math.pow(10,-3.113)+Math.pow(10,5.1-ph))*(81.98/(5.46-y_cln))*(0.003+0.0002*cl_t)*(3.9+0.0029*alk)*Math.exp(-3560*(1/(273+parseFloat(des_temp))-1/298));	// Chloramine decay at 20 deg Cel (h^-1)
	
	// y_c_dec_25 = (Math.pow(10,-3.113)+Math.pow(10,5.1-ph))*(81.98/(5.46-y_cln))*(0.003+0.0002*cl_t)*(3.9+0.0029*alk)*Math.exp(-3560*(1/298-1/298));	// Chloramine decay at 25 deg Cel (h^-1)
	y_cl_drop = cl_t*(8.3 - ph)*0.06;

	// Return output variables to HTML:
	document.getElementById('y_cln').innerHTML = y_cln.toFixed(2);
	document.getElementById('y_c_dec_20').innerHTML = y_cl_drop.toFixed(3);
	document.getElementById('y_c_dec_25').innerHTML = y_c_dec_20.toFixed(4);
	// Store updated inputs and calculations in localStorage
	var key="sa_key";

	const systemAnalysis = {
		cl_t: cl_t,
		nh_t: nh_t,
		des_temp: des_temp,
		alk: alk,
		ph: ph
	}

	window.localStorage.setItem(key, JSON.stringify(systemAnalysis));
}

function BRC_reset_data()
{
	// Return output variables to HTML with void:
	document.getElementById('date').value = '';
	document.getElementById('avg_vol').value = '70';
	document.getElementById('ret_t').value = '65';
	document.getElementById('cl_i').value = '1.5';
	document.getElementById('cl_o').value = '1.1';
	document.getElementById('nh_o').value = '0.35';
	document.getElementById('pH').value = '7.6';
	document.getElementById('temp_i').value = '21';
	document.getElementById('temp_o').value = '20';
	document.getElementById('nano3_o').value = '0.009';
	document.getElementById('alk').value = '60';

	// Remove Error div
	var elem = document.getElementsByClassName("error-div");
	for(i=0; i < elem.length; i++) {
		if (elem[i] != null) {
			elem[i].innerHTML = '';
		}
	}

	// Reset error div
	var cells = document.getElementsByClassName("cell-input");
	for(i=0; i < cells.length; i++) {
		cells[i].childNodes[0].style.background = "#f1edf5";
	}

	// Remove from localStorage
	var key = "data_key"
	window.localStorage.removeItem(key);
}

function BRC_reset_sp()
{
	// Return output variables to HTML with void:
	document.getElementById('status_ni_i_curr').innerHTML = '';
	document.getElementById('status_ni_i_curr').className = 'status';
	document.getElementById('status_ni_r_curr').innerHTML = '';
	document.getElementById('status_ni_r_curr').className = 'status';
	document.getElementById('status_dec_curr').innerHTML = '';
	document.getElementById('status_dec_curr').className = 'status';
	document.getElementById('status_ni_i_pre').innerHTML = '';
	document.getElementById('status_ni_i_pre').className = 'status';
	document.getElementById('status_ni_r_pre').innerHTML = '';
	document.getElementById('status_ni_r_pre').className = 'status';
	document.getElementById('status_dec_pre').innerHTML = '';
	document.getElementById('status_dec_pre').className = 'status';

	document.getElementById('t2n').innerHTML = '';

	// Remove from localStorage
	var key = "sp_key"
	window.localStorage.removeItem(key);
}

function BRC_reset_ret() {
	// Return output variables to HTML with void:
	document.getElementById('new_ret_t').value = '20';
	document.getElementById('y_cl').innerHTML = '';
}

function BRC_reset_clnh() {
	// Return output variables to HTML with void:
	document.getElementById('a_cl_1').value = '0.8';
	document.getElementById('des_cl2n_1').value = '4.2';
	document.getElementById('y_nh_add').innerHTML = '';
	document.getElementById('y_cl_im').innerHTML = '';
	document.getElementById('y_cl_nd1').innerHTML = '';

}

function BRC_reset_cl() {

	// Remove Error div
	var elem = document.getElementsByClassName("error-div");
	for(i=0; i < elem.length; i++) {
		if (elem[i] != null) {
			elem[i].innerHTML = '';
		}
	}
	
	// Return output variables to HTML with void:
	document.getElementById('des_cl2n_2').innerHTML = '';
	document.getElementById('y_cl_res').innerHTML = '';
	document.getElementById('y_cl_dose').value = '0.22';
	document.getElementById('y_cl_nd2').innerHTML = '';
}

function BRC_reset_bp() {
	// Return output variables to HTML with void:
	document.getElementById('des_cl2n_3').value = '5.5';
	document.getElementById('y_cl_im_pb').innerHTML = '';
	document.getElementById('y_cl_dose_pb').innerHTML = '';
	document.getElementById('y_cl_nd3').innerHTML = '';
	document.getElementById('bp_no').innerHTML = '';
}

function BRC_reset_sa() 
{
	document.getElementById("cl_t").value = '2.2';				
	document.getElementById("nh_t").value = '0.55';	
	document.getElementsByClassName("cl_disinf")[0].value = 'Yes';
	document.getElementById("des_temp").value = '25';
	document.getElementById("alk").value = '40';					
	document.getElementById("ph").value = '7.8';						
	document.getElementById('y_cln').innerHTML = '';
	document.getElementById('y_c_dec_20').innerHTML = '';
	document.getElementById('y_c_dec_25').innerHTML = '';

		// Remove Error div
		var elem = document.getElementsByClassName("error-div");
		for(i=0; i < elem.length; i++) {
			if (elem[i] != null) {
				elem[i].innerHTML = '';
			}
		}
	
		// Reset error div
		var cells = document.getElementsByClassName("cell-input");
		for(i=0; i < cells.length; i++) {
			cells[i].childNodes[0].style.background = "#f1edf5";
		}

	// Remove from localStorage
	var key = "sa_key"
	window.localStorage.removeItem(key);
}

// Creates status attributes for current status of reservoir 
function setStatus(element, status) {
	if(status =='GREEN') {
		element.innerHTML = "Safe";
		element.classList.add("status-safe");
	} else if (status == 'ORANGE'){
		element.innerHTML = "Caution";
		element.classList.add("status-caution");

	} else if (status == 'RED') {
		element.innerHTML = "High Risk";
		element.classList.add("status-risk");
	}
}

// Go to next tab during selection
var currentTab = 0;

function goToPrevStep() {
	var steps = document.getElementsByClassName("table-card");
	var curr = document.getElementsByClassName("table-card-active")[0]
	prev = parseInt(curr.id) - 1

	for( var i =0; i < steps.length; i++) {
		if (parseInt(steps[i].id) == prev) {
			curr.style.display = "None"			
			currentTab = i
			steps[i].style.display = "grid"
		}
		if ( prev == 1 ){
			var btn = document.getElementsByClassName("table-card-nav-prev")[0];
			btn.style.color = "#bcbfcf"
		}
	}
	steps[currentTab].className = "table-card-active"
	curr.classList.remove("table-card-active")
	curr.classList.add("table-card")	
}

function goToStep() {
	var steps = document.getElementsByClassName("table-card");
	var curr = document.getElementsByClassName("table-card-active")[0]
	next = parseInt(curr.id) + 1

	if (next == 4) {
		var page = "dataentry.html";
		window.open(page,"_self");
	}

	for( var i =0; i < steps.length; i++) {
		if (parseInt(steps[i].id) == next) {
			curr.style.display = "None"			
			currentTab = i
			steps[i].style.display = "grid"
		}

		if (next > 1) {
			var btn = document.getElementsByClassName("table-card-nav-prev")[0];
			btn.style.color = "black"
			btn.disabled = false
		}
	}

	// Update active tab
	steps[currentTab].className = "table-card-active"
	curr.classList.remove("table-card-active")
	curr.classList.add("table-card")

	// Store varables 
	loadTemp(parseInt(curr.id))
}

function loadTemp(step) {
	console.log(step)
	// INPUT
	// Acquire following input variables from HTML form:
	// Data Entry variables
	if ( step == 1 ) {
		var max_month = document.getElementById("max_month").value;				// Month of maximum temperature
		var t_max = document.getElementById("t1").value;			// Minimum temperature
		var key = "max_temp_key";

		const data = {
			max_month: max_month,
			t_max: t_max,
			}
	
		window.localStorage.setItem(key,JSON.stringify(data));
	} else if ( step == 2 ) {
		var min_month = document.getElementById("min_month").value;			// Month of minimum temperature
		var t_min = document.getElementById("t2").value;				// Maximum temperature
		var key = "min_temp_key";

		const data = {
			min_month: min_month,
			t_min: t_min,
			}
	
		window.localStorage.setItem(key,JSON.stringify(data));
	} else {
		var num_res = document.getElementById("num_res").value;			// Number of reservoirs
		// loadReservoirs(num_res)
	}
	// Store updated values in localStorage
	
}

function calcTemp(curr_date) {
	// Load maximum temperature
	var key="max_temp_key"
	var records = window.localStorage.getItem(key);

	var struct = JSON.parse(records);
	var max_month = struct.max_month;
	var t_max = struct.t_max;

	// Load minimum temperature
	var key2 = "min_temp_key"
	var records2 = window.localStorage.getItem(key2);

	var struct = JSON.parse(records2);
	var t_min = struct.t_min;
	console.log(t_max,t_min);

	// Calculate temperature
	var temp, D_max, D_curr, DT_10;
	var temp_safety = 0.5;

	var d1 = new Date(max_month);			// Get month of max temperature
	var m1 = parseFloat(d1.getMonth())+parseFloat(1);	
	D_max = m1 + parseFloat(d1.getDate())	

	var d2 = new Date(curr_date);
	var m2 = parseFloat(d2.getMonth())+parseFloat(1);
	D_curr = m2 + parseFloat(d2.getDate())
	
	temp = t_min + (t_min + t_max)/2 * ( 1 + Math.sin(Math.PI/2 + 2*Math.PI/365*(D_curr - D_max)));
	// d_temp = (t_max - t_min) * (Math.PI/365) * Math.cos(Math.PI/2 + 2*Math.PI/365*(D_curr - D_max));
	DT_10 = (t_min + t_max)/2 * ( Math.sin(Math.PI/2 + 2*Math.PI/365*(D_curr + 10 - D_max)) - Math.sin(Math.PI/2 + 2*Math.PI/365*(D_curr - D_max))) + temp_safety;

	return DT_10
}