/*	BRC Calculator
	BRC author: Sathaa Sathasivan
	Javascript & MATLAB implementation by Ram Singh
	v.1.0: 7 Sep 2021 - Implemented code with basic computational functions.
	v.1.1: 26 Dec 2021 - Implemented feedback text display to html.
	v.1.2: 27 Dec 2021 - Implemented coloured status feedback.
	v.1.3: 28 Dec 2021 - Implemented time to nitrification.
	Updatesn by Inuri Gunasekara
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

	if(page=="index.html") {
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
			if (key == "sp_key") {
				var records = '{"avg_vol":"70","ret_t":"65","cl_i":1.5,"cl_o":"1.1","nh_o":0.35,"pH":"7.6","temp_i":"21","temp_o":20,"nano3_o":"0.009","alk":"60"}';
			} else if (key == "oa_key") {
					var records = '{"avg_vol":"70","ret_t":"65","cl_i":1.5,"cl_o":"1.1","nh_o":0.35,"pH":"7.6","temp_i":"21","temp_o":20,"nano3_o":"0.009","alk":"60","y_cl_res":1.45,"y_cl_dose":"0.22"}';
			} else if (key == "sa_key") {
					var records = '{"cl_t":"2.2","nh_t":"0.55","cl_disinf":"Yes","des_temp":"25","alk":"40","ph":"7.8"}';
			}

			var struct = JSON.parse(records);

			for (var x in struct){
				if(document.getElementById(x).tagName.toLowerCase() === 'input') {
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

function validateInputs() {
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
		cells[i].childNodes[0].style.background = "white";
	}

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

	// Set flag 
	var flag = 0;
	// date
	if(!date) {
		flag = 1;
		errorMessage(0,1);
	} 
	// Average volume
	if(avg_vol < 0.1 || avg_vol > 150) {
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
	if(cl_o < 0.5 || cl_o > 5) {
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

// Display relevant error message
function errorMessage(errorID, flag) {
	
	displayText = {
		1:"Invalid Input",
		2:"Decay Status Not Valid"
	};
	// Highlight cell with error
	document.getElementsByClassName("cell-input")[errorID].childNodes[0].style.background = "#ffb3b3";

	// Create error div to display error
	const errorDiv = document.createElement("div");
	errorDiv.className = "error-div";
	const newContent = document.createTextNode(displayText[flag]);
	errorDiv.appendChild(newContent);
	errorDiv.style.textAlign = 'center';
	errorDiv.style.color = 'red';
	const prevDiv = document.getElementsByClassName("content");
	document.body.insertBefore(errorDiv,prevDiv[0]);
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

// Calculates the current status of reservoir and predicted state
function BRC_calc_sp_old()
{
	// INPUT
	// Acquire following input variables from localStorage:
	// Data Entry variables
	
	var key = "data_key";
	var records = JSON.parse(window.localStorage.getItem(key));
	
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
	var p_m1, p_m2, y_nh_r, y_nh_i, nh_i, y_ni_i_curr, status_ni_i_curr;
	var y_ni_r_curr, status_ni_r_curr, pre_buf, y_dec_curr, status_dec_curr;
	var y_ni_i_pre, status_ni_i_pre, pre_in, y_ni_r_pre, status_ni_r_pre, y_dec_pre, status_dec_pre, t2n;
	
	var d = new Date();			// Get current date
	var m = parseFloat(d.getMonth())+parseFloat(1);		// Get current month index
	
	// Define temp buffers
	var buff1, buff2, buff3, var1, var2, var3, var4, bit;
	
	// Monthly variable 1:
	if (m > 8)
		p_m1 = 1;
	else {
		if (m > 2)
			p_m1 = -0.5;
		else
			p_m1 = 1;
	}
	// Monthly variable 2:
	if (p_m1 == 1)
		p_m2 = 0.95;
	else
		p_m2 = 1.05;
	
	// Convert to floating-point value:
	temp_o = parseFloat(temp_o);
	nh_o = parseFloat(nh_o);
	cl_i = parseFloat(cl_i);
	
	// DATA ENTRY OUTPUT:
	nh_i = parseFloat(nh_o)+parseFloat((cl_i-cl_o)*0.072);				// Total inlet ammonia
	
	// Current status - Inlet nitrification
	y_ni_i_curr = cl_i-((0.00000774*Math.pow(temp_i,5)-parseFloat(0.0008*Math.pow(temp_i,4))+parseFloat(0.0309*Math.pow(temp_i,3))-parseFloat(0.5579*Math.pow(temp_i,2))+parseFloat(4.8468*temp_i)-15.425)/1.16)*(nh_i-cl_i/71*14)/(parseFloat(0.18)+parseFloat(nh_i)-cl_i/71*14);
	if (y_ni_i_curr >= 0.41)
		status_ni_i_curr = "GREEN";
	else if (y_ni_i_curr >= 0.21)
		status_ni_i_curr = "ORANGE";
	else
		status_ni_i_curr = "RED";

	// Current status - Nitrification within reservoir:
	y_ni_r_curr = cl_o-((0.00000774*Math.pow(temp_o,5)-parseFloat(0.0008*Math.pow(temp_o,4))+parseFloat(0.0309*Math.pow(temp_o,3))-parseFloat(0.5579*Math.pow(temp_o,2))+parseFloat(4.8468*temp_o)-15.425)/1.16)*(nh_o-cl_o/5.07)/(parseFloat(0.18)+parseFloat(nh_o)-cl_o/5.07);	
	if (y_ni_r_curr >= 0.41)
		status_ni_r_curr = 'GREEN';
	else if (y_ni_r_curr >= 0.21)
		status_ni_r_curr = 'ORANGE';
	else
		status_ni_r_curr = 'RED';
	
	pre_buf = (parseFloat(Math.pow(10,-3.113))+(Math.pow(10,5.1-parseFloat(pH))))*(81.98/(5.46-parseFloat(cl_o/nh_o)))*(parseFloat(0.003)+parseFloat(0.0002*cl_o))*(parseFloat(3.9)+parseFloat(0.0029*alk))*Math.exp(-3560*(1/293-1/298));	// Prediction buffer

	// Current status - Decay within reservoir:
	y_dec_curr = 2.5-((cl_i/cl_o-1)/ret_t)/(pre_buf*Math.pow(1.04,(temp_o-20)));
	if (y_dec_curr >= 0.41)
		status_dec_curr = 'GREEN';
	else if (y_dec_curr >= 0.21)
		status_dec_curr = 'ORANGE';
	else
		status_dec_curr = 'RED';

	// Predicted inlet nitrification:
	buff1 = parseFloat(temp_o)+parseFloat(p_m1);
	y_ni_i_pre = cl_i*p_m2-((0.00000774*Math.pow(buff1,5)-parseFloat(0.0008*Math.pow(buff1,4))+parseFloat(0.0309*Math.pow(buff1,3))-parseFloat(0.5579*Math.pow(buff1,2))+parseFloat(4.8468*(buff1))-15.425)/1.16)*((parseFloat(nh_o)+parseFloat(0.13*(cl_i*p_m2-cl_o)))-(cl_i*p_m2)/5)/(parseFloat(((parseFloat(nh_o)+parseFloat(0.13*(cl_i*p_m2-cl_o)))-(cl_i*p_m2)/5))+parseFloat(0.18));
	if (y_ni_i_pre >= 0.41)
		status_ni_i_pre = 'GREEN';
	else if (y_ni_i_pre >= 0.21)
		status_ni_i_pre = 'ORANGE';
	else
		status_ni_i_pre = 'RED';
	
	pre_in = (cl_i/cl_o-1)/ret_t;					// Predicted inlet variable
	
	// Predicted nitrification within reservoir:
	buff2 = parseFloat(273.0)+parseFloat(temp_o);
	buff3 = parseFloat(273.0)+parseFloat(temp_o)+parseFloat(p_m1);
	y_ni_r_pre = (cl_i*p_m2/(parseFloat(1)+parseFloat(ret_t*(pre_in*Math.exp(6750*(1/buff2-1/buff3))*(1.05)))))-(((0.00000774*Math.pow(buff1,5)-parseFloat(0.0008*Math.pow(buff1,4))+parseFloat(0.0309*Math.pow(buff1,3))-0.5579*Math.pow(buff1,2)+parseFloat(4.8468*buff1)-15.425)/1.16)*((nh_o-(cl_o-(cl_i*p_m2/(parseFloat(1)+parseFloat(ret_t*(pre_in*Math.exp(6750*(1/buff2-1/buff3))*(1.05))))))*0.13)-(cl_i*p_m2/(parseFloat(1)+parseFloat(ret_t*(pre_in*Math.exp(6750*(1/buff2-1/buff3))*(1.05)))))/5)/(((nh_o-(cl_o-(cl_i*p_m2/(parseFloat(1)+parseFloat(ret_t*(pre_in*Math.exp(6750*(1/buff2-1/buff3))*(1.05))))))*0.13)-(cl_i*p_m2/(parseFloat(1)+parseFloat(ret_t*(pre_in*Math.exp(6750*(1/buff2-1/buff3))*(1.05)))))/5)+parseFloat(0.18)));
	if (y_ni_r_pre >= 0.41)
		status_ni_r_pre = 'GREEN';
	else if (y_ni_r_pre >= 0.21)
		status_ni_r_pre = 'ORANGE';
	else
    	status_ni_r_pre = 'RED';
		
	// Predicted decay within reservoir:
	y_dec_pre = 2.5-(cl_i-cl_o)/cl_o/ret_t/pre_buf*Math.pow(1.04,parseFloat(temp_o-20)+parseFloat(p_m1));
	if (y_dec_pre >= 0.41)
		status_dec_pre = 'GREEN';
	else if (y_dec_pre >= 0.21)
		status_dec_pre = 'ORANGE';
	else
    	status_dec_pre = 'RED';
	
	// Time to nitrification:
	var mul5 = [0.0,5.0,10.0,15.0,20.0,25.0,30.0];

	var1 = (cl_i*Math.pow(p_m2,mul5[2]/10)/
	(1+ret_t*(pre_in*Math.exp(6750*(1/(273+temp_o)-1/(273+temp_o+mul5[2]/10*p_m1)))*Math.pow(1.05,mul5[2]/10))))
    -(((0.00000774*Math.pow(temp_o+mul5[2]/10*p_m1,5) - 0.0008*Math.pow(temp_o+mul5[2]/10*p_m1,4) + 0.0309*Math.pow(temp_o+mul5[2]/10*p_m1,3) - 
	0.5579*Math.pow(temp_o+mul5[2]/10*p_m1,2) + 4.8468*(temp_o+mul5[2]/10*p_m1) - 15.425)/1.16)*((nh_o-(cl_o-(cl_i*Math.pow(p_m2,mul5[2]/10)/
	(1+ret_t*(pre_in*Math.exp(6750*(1/(273+temp_o)-1/(273+temp_o+mul5[2]/10*p_m2)))*Math.pow(1.05,mul5[2]/10)))))*0.13)-(cl_i*Math.pow(p_m2,mul5[2]/10)/
	(1+ret_t*(pre_in*Math.exp(6750*(1/(273+temp_o)-1/(273+temp_o+mul5[2]/10*p_m1)))*Math.pow(1.05,mul5[2]/10))))/5)/(((nh_o-(cl_o-(cl_i*Math.pow(p_m2,mul5[2]/10)/
    (1+ret_t*(pre_in*Math.exp(6750*(1/(273+temp_o)-1/(273+temp_o+mul5[2]/10*p_m1)))*Math.pow(1.05,mul5[2]/10)))))*0.13)-(cl_i*Math.pow(p_m2,mul5[2]/10)/
    (1+ret_t*(pre_in*Math.exp(6750*(1/(273+temp_o)-1/(273+temp_o+mul5[2]/10*p_m1)))*Math.pow(1.05,mul5[2]/10))))/5)+0.18));
	
	var2 = (cl_i*Math.pow(p_m2,mul5[3]/10)/
	(1+ret_t*(pre_in*Math.exp(6750*(1/(273+temp_o)-1/(273+temp_o+mul5[3]/10*p_m1)))*Math.pow(1.05,mul5[3]/10))))
    -(((0.00000774*Math.pow(temp_o+mul5[3]/10*p_m1,5) - 0.0008*Math.pow(temp_o+mul5[3]/10*p_m1,4) + 0.0309*Math.pow(temp_o+mul5[3]/10*p_m1,3) - 
	0.5579*Math.pow(temp_o+mul5[3]/10*p_m1,2) + 4.8468*(temp_o+mul5[3]/10*p_m1) - 15.425)/1.16)*((nh_o-(cl_o-(cl_i*Math.pow(p_m2,mul5[3]/10)/
	(1+ret_t*(pre_in*Math.exp(6750*(1/(273+temp_o)-1/(273+temp_o+mul5[3]/10*p_m2)))*Math.pow(1.05,mul5[3]/10)))))*0.13)-(cl_i*Math.pow(p_m2,mul5[3]/10)/
	(1+ret_t*(pre_in*Math.exp(6750*(1/(273+temp_o)-1/(273+temp_o+mul5[3]/10*p_m1)))*Math.pow(1.05,mul5[3]/10))))/5)/(((nh_o-(cl_o-(cl_i*Math.pow(p_m2,mul5[3]/10)/
    (1+ret_t*(pre_in*Math.exp(6750*(1/(273+temp_o)-1/(273+temp_o+mul5[3]/10*p_m1)))*Math.pow(1.05,mul5[3]/10)))))*0.13)-(cl_i*Math.pow(p_m2,mul5[3]/10)/
    (1+ret_t*(pre_in*Math.exp(6750*(1/(273+temp_o)-1/(273+temp_o+mul5[3]/10*p_m1)))*Math.pow(1.05,mul5[3]/10))))/5)+0.18));
	
	var3 = (cl_i*Math.pow(p_m2,mul5[4]/10)/
	(1+ret_t*(pre_in*Math.exp(6750*(1/(273+temp_o)-1/(273+temp_o+mul5[4]/10*p_m1)))*Math.pow(1.05,mul5[4]/10))))
    -(((0.00000774*Math.pow(temp_o+mul5[4]/10*p_m1,5) - 0.0008*Math.pow(temp_o+mul5[4]/10*p_m1,4) + 0.0309*Math.pow(temp_o+mul5[4]/10*p_m1,3) - 
	0.5579*Math.pow(temp_o+mul5[4]/10*p_m1,2) + 4.8468*(temp_o+mul5[4]/10*p_m1) - 15.425)/1.16)*((nh_o-(cl_o-(cl_i*Math.pow(p_m2,mul5[4]/10)/
	(1+ret_t*(pre_in*Math.exp(6750*(1/(273+temp_o)-1/(273+temp_o+mul5[4]/10*p_m2)))*Math.pow(1.05,mul5[4]/10)))))*0.13)-(cl_i*Math.pow(p_m2,mul5[4]/10)/
	(1+ret_t*(pre_in*Math.exp(6750*(1/(273+temp_o)-1/(273+temp_o+mul5[4]/10*p_m1)))*Math.pow(1.05,mul5[4]/10))))/5)/(((nh_o-(cl_o-(cl_i*Math.pow(p_m2,mul5[4]/10)/
    (1+ret_t*(pre_in*Math.exp(6750*(1/(273+temp_o)-1/(273+temp_o+mul5[4]/10*p_m1)))*Math.pow(1.05,mul5[4]/10)))))*0.13)-(cl_i*Math.pow(p_m2,mul5[4]/10)/
    (1+ret_t*(pre_in*Math.exp(6750*(1/(273+temp_o)-1/(273+temp_o+mul5[4]/10*p_m1)))*Math.pow(1.05,mul5[4]/10))))/5)+0.18));
	
	var4 = (cl_i*Math.pow(p_m2,mul5[5]/10)/
	(1+ret_t*(pre_in*Math.exp(6750*(1/(273+temp_o)-1/(273+temp_o+mul5[5]/10*p_m1)))*Math.pow(1.05,mul5[5]/10))))
    -(((0.00000774*Math.pow(temp_o+mul5[5]/10*p_m1,5) - 0.0008*Math.pow(temp_o+mul5[5]/10*p_m1,4) + 0.0309*Math.pow(temp_o+mul5[5]/10*p_m1,3) - 
	0.5579*Math.pow(temp_o+mul5[5]/10*p_m1,2) + 4.8468*(temp_o+mul5[5]/10*p_m1) - 15.425)/1.16)*((nh_o-(cl_o-(cl_i*Math.pow(p_m2,mul5[5]/10)/
	(1+ret_t*(pre_in*Math.exp(6750*(1/(273+temp_o)-1/(273+temp_o+mul5[5]/10*p_m2)))*Math.pow(1.05,mul5[5]/10)))))*0.13)-(cl_i*Math.pow(p_m2,mul5[5]/10)/
	(1+ret_t*(pre_in*Math.exp(6750*(1/(273+temp_o)-1/(273+temp_o+mul5[5]/10*p_m1)))*Math.pow(1.05,mul5[5]/10))))/5)/(((nh_o-(cl_o-(cl_i*Math.pow(p_m2,mul5[5]/10)/
    (1+ret_t*(pre_in*Math.exp(6750*(1/(273+temp_o)-1/(273+temp_o+mul5[5]/10*p_m1)))*Math.pow(1.05,mul5[5]/10)))))*0.13)-(cl_i*Math.pow(p_m2,mul5[5]/10)/
    (1+ret_t*(pre_in*Math.exp(6750*(1/(273+temp_o)-1/(273+temp_o+mul5[5]/10*p_m1)))*Math.pow(1.05,mul5[5]/10))))/5)+0.18));
	
	if (var1 < 0.05) {
		bit = 1;			// Redundant variable
	}
	else if (var2 < 0.05) {
		bit = 1;
	}
	else if (var3 < 0.05) {
		bit = 1;
		t2n = 5;			// Time to nitrification (days)
	}
	else if (var4 < 0.05) {
		bit = 1;
		t2n = 10;			// Time to nitrification (days)
	}
	else {
		bit = 0;
		t2n = 15;			// Time to nitrification (days)
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

	// Find Season
	var DT_10 = 1;
	var alpha = 0.95;				// Adjustment factor for increase or decrease
	var season = "Summer";

	if(m > 3 && m < 8) {
		DT_10 = -0.5;
		alpha = 1.05;
		season = "Winter";
	}

    // Convert to floating-point value:
	temp_o = parseFloat(temp_o);
	temp_i = parseFloat(temp_i);
	nh_o = parseFloat(nh_o);
	cl_i = parseFloat(cl_i);
	
	// DATA ENTRY OUTPUT:
	nh_i = parseFloat(nh_o)+parseFloat((cl_i-cl_o)*0.07);				// Total inlet ammonia
	
    // N_iT1 =N_oT1 + (Cl_iT1-Cl_oT1)*0.07; %Total Ammonia in inlet
    // fprintf('Total Amonia in inlet N_iT1 = %f or %.2f (rounded)\n',N_iT1,N_iT1);

    k_rt_T1=(cl_i/cl_o - 1)/ret_t;

    // Chemical decay rate at reservoir
    // k_cT1 = (10^(-3.113)+10^(5.1-pH))*(81.98/(5.46-cl_o/nh_o))*(0.003+0.0002*cl_o)*(3.9+0.0029*alk)*exp(-3560*(1/(273+temp_o)-1/298));
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
	status_ni_i_curr = NitrificationDecision(Res_decision_oT1);
    status_ni_r_curr = NitrificationDecision(Res_decision_iT1);
    status_dec_curr = DecayDecision(Res_k_rtT1);;

    // Reservoir status in 10 days
    d = 10;

    DT = DT_10/10*d;

    Cl_iT2 = (alpha)*cl_i;              // Total chlorine at inlet
	
    // k_rt_T2 = k_rt_T1 * 1.08^DT;  
    k_rt_T2 = k_rt_T1 * Math.pow(1.08,DT);  

    Cl_oT2 = Cl_iT2/(1 + ret_t * k_rt_T2);            // Total chlorine at outlet
	
    N_oT2 = nh_o + 0.07*(cl_o - Cl_oT2);               // Total ammonia at outlet
	
    T_o2 = temp_o + DT /10 * d;                            // Future outlet temparate in 10 days

    T_i2 = temp_i + DT / 10 * d;                              // Future inlet temparate in 10 days
	
    N_iT2 = nh_i + 0.07*(cl_i-Cl_iT2);                  // Total ammonia in inlet

    // Chemical decay rate at T2 
    
    // k_cT2 = k_cT1 * 1.04^DT;
    k_cT2 = k_cT1 * Math.pow(1.04,DT);

    FN_oT2 = N_oT2 - Cl_oT2/5.07;
    if(FN_oT2 < 0) {
        FN_oT2 = 0;
    }
	
    FN_iT2 = N_iT2 - Cl_iT2/5.07; 
    if (FN_iT2<0) {
        FN_iT2 = 0;
    }

    Um_Kd_oT2 = Um_Kd(T_o2);

    Um_Kd_iT2 = Um_Kd(T_i2);

	BRC_oT2 = BRC_T(Um_Kd(T_o2), FN_oT2);

	BRC_iT2 = Um_Kd(T_i2)*(FN_iT2/(0.18 + FN_iT2));  
	
    Res_decision_oT2 = Cl_oT2 - BRC_oT2;

    // Nitrification risk in inlet 
    Res_decision_iT2 = Cl_iT2 - BRC_iT2;

    Res_k_rtT2 = k_rt_T2/k_cT2; // now

    // Reservoir status in given number of days (d)  
    status_ni_i_pre = NitrificationDecision(Res_decision_oT2);
    status_ni_r_pre = NitrificationDecision(Res_decision_iT2);
    status_dec_pre = DecayDecision(Res_k_rtT2);

	// Time to Nitrification
	y = 0.4;
	d = 1;

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
	des_cl2n_2 = y_cl_res/nh_o;													// Resulting chlorine
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

	// Option analysis: Partial breakpoint
	var des_cl2n_3 = document.getElementById("des_cl2n_3").value;	// Desired Cl/N
	
	// Option analysis: Partial breakpoint
	y_cl_im_pb = des_cl2n_3*nh_o+nano3_o/2*5;									// Chlorine immediately
	y_cl_dose_pb = y_cl_im_pb-cl_o;												// Chlorine dose
	y_cl_nd3 = parseFloat(cl_o)+parseFloat((y_cl_dose_pb-nano3_o*5)*Math.exp(-cl_i/cl_o/ret_t*24))-0.5*nh_o;	// Chlorine next day
	
	// Return output variables to HTML:
	document.getElementById('y_cl_im_pb').innerHTML = y_cl_im_pb.toFixed(2);
	document.getElementById('y_cl_dose_pb').innerHTML = y_cl_dose_pb.toFixed(2);
	document.getElementById('y_cl_nd3').innerHTML = y_cl_nd3.toFixed(2);
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
	var cl_disinf = document.getElementById("cl_disinf").value;
	var des_temp = document.getElementById("des_temp").value;
	var alk = document.getElementById("alk").value;					// Alkalinity (mg/L as CaCO3)
	var ph = document.getElementById("ph").value;						// Bromide (mg/L)

	// Define output variables
	var y_cln, y_c_dec_20;
	
	// DATA ENTRY OUTPUT:
	y_cln = cl_t/nh_t;							// Chlorine-to-ammonia ratio (<4.8)
	y_c_dec_20 = (Math.pow(10,-3.113)+Math.pow(10,5.1-ph))*(81.98/(5.46-y_cln))*(0.003+0.0002*cl_t)*(3.9+0.0029*alk)*Math.exp(-3560*(1/293-1/298));	// Chloramine decay at 20 deg Cel (h^-1)
	y_c_dec_25 = (Math.pow(10,-3.113)+Math.pow(10,5.1-ph))*(81.98/(5.46-y_cln))*(0.003+0.0002*cl_t)*(3.9+0.0029*alk)*Math.exp(-3560*(1/298-1/298));	// Chloramine decay at 25 deg Cel (h^-1)

	// Return output variables to HTML:
	document.getElementById('y_cln').innerHTML = y_cln.toFixed(2);
	document.getElementById('y_c_dec_20').innerHTML = y_c_dec_20.toFixed(4);
	document.getElementById('y_c_dec_25').innerHTML = y_c_dec_25.toFixed(4);

	// Store updated inputs and calculations in localStorage
	var key="sa_key";

	const systemAnalysis = {
		cl_t: cl_t,
		nh_t: nh_t,
		cl_disinf: cl_disinf,
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

	// Remove error div
	var elem = document.getElementsByClassName("error-div");
	if (elem[0] != null) {
		elem[0].innerHTML = '';
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
}

function BRC_reset_sa() 
{
	document.getElementById("cl_t").value = '2.2';				
	document.getElementById("nh_t").value = '0.55';	
	document.getElementById("cl_disinf").value = 'Yes';
	document.getElementById("des_temp").value = '25';
	document.getElementById("alk").value = '40';					
	document.getElementById("ph").value = '7.8';						
	document.getElementById('y_cln').innerHTML = '';
	document.getElementById('y_c_dec_20').innerHTML = '';
	document.getElementById('y_c_dec_25').innerHTML = '';

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