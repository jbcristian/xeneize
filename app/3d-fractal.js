const noteColor = [
		document.getElementById('notemark-r'),
		document.getElementById('notemark-g'),
		document.getElementById('notemark-b'),
		document.getElementById('notemark-d')
	];

let mm = 8;
document.getElementById('modpoint').addEventListener('input', function () {
        mm = this.value;
    });

function updateCompass(){
	let noteObj = [
		{mark:noteColor[0],note:datapitch[0],octave:1},
		{mark:noteColor[1],note:datapitch[1],octave:1},
		{mark:noteColor[2],note:datapitch[2],octave:1},
		{mark:noteColor[3],note:datapitch[3],octave:1},
	];

	noteObj.sort(function(a, b){return a.note - b.note}); 

	let n1 = 1;
	let n2 = noteObj[1].note/noteObj[0].note;
	let n3 = noteObj[2].note/noteObj[0].note;
	let n4 = noteObj[3].note/noteObj[0].note;

	function getClosedOctave() {
        let set = [n1,n2,n3,n4];
		
        for (let c = 0; c < set.length; c++) {
            if (set[c] > 2) {
                while (set[c] > 2) {
                    set[c] /= 2;
                }
            }
            else if (set[c] < 1) {
                while (set[c] < 1) {
                    set[c] *= 2;
                }
            }
			noteObj[c].octave = set[c];
        }
        return set;
    }

	getClosedOctave();
	noteObj[0].mark.style.top = "50px";
	noteObj[1].mark.style.top = "60px";
	noteObj[2].mark.style.top = "70px";
	noteObj[3].mark.style.top = "80px";

	noteObj[0].mark.style.transformOrigin = "0px 0px 0";
	noteObj[1].mark.style.transformOrigin = "0px -10px 0";
	noteObj[2].mark.style.transformOrigin = "0px -20px 0";
	noteObj[3].mark.style.transformOrigin = "0px -30px 0";

	noteObj[0].mark.style.transform = "rotate(" + ( Math.log2(noteObj[0].octave) *360) + "deg)";
	noteObj[1].mark.style.transform = "rotate(" + ( Math.log2(noteObj[1].octave) *360) + "deg)";
	noteObj[2].mark.style.transform = "rotate(" + ( Math.log2(noteObj[2].octave) *360) + "deg)";
	noteObj[3].mark.style.transform = "rotate(" + ( Math.log2(noteObj[3].octave) *360) + "deg)";
}

function GetTrueOne(rname){
    var options = document.getElementsByName(rname);
    var t;
    for (t=0; t < options.length ; t++){
        if(options[t].checked==true){
            return t;
        }
    }
}

var sliders=document.querySelectorAll('input[type="range"');
for(let i = 0;i<sliders.length; i++){
	var valc = document.createElement('div');
	valc.className ="rangeValue";
	valc.innerHTML = sliders[i].value;
	sliders[i].oninput = ()=>{updateSlider(sliders[i])};
	sliders[i].previousElementSibling.insertAdjacentElement("afterend", valc);
}

function updateSlider(s){
	s.previousElementSibling.innerHTML = s.value;
}

function toggleOptions(el){
	var cosa = el.nextElementSibling;
	if(cosa.style.display=="block"){
		cosa.style.display = "none";
	}else{
		cosa.style.display= "block";
	}
}

let gl = null;

function getShader(gl, id) {
	var script = document.getElementById(id);
	if(!script) {
		return null;
	}
	var src = "";
	var k = script.firstChild;
	while(k) {
		if(k.nodeType == 3) {
			src += k.textContent;
		}
		k = k.nextSibling;
	}
	var shader;
	if(script.id == "fshader") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if(script.id == "vshader") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}
	gl.shaderSource(shader, src);
	gl.compileShader(shader);
	if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}
	return shader;
}

var program;
var vbo;
function initProgram() {
	var fragmentShader = getShader(gl, "fshader");
	var vertexShader = getShader(gl, "vshader");

	program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		alert("Unable to initialize the shader program");
	}

    var ext_color_buffer_float = gl.getExtension("EXT_color_buffer_float");
	gl.useProgram(program);

	var quad = [
		-1.0, -1.0, 0.0,
		-1.0,  1.0, 0.0,
		 1.0, -1.0, 0.0,
		 1.0,  1.0, 0.0
	];

	vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quad), gl.STATIC_DRAW);

	program.positionAttrib = gl.getAttribLocation(program, "position");
	gl.enableVertexAttribArray(program.positionAttrib);
	gl.vertexAttribPointer(program.positionAttrib, 3, gl.FLOAT, false, 0, 0);

	program.resolutionUniform = gl.getUniformLocation(program, "g_resolution");

	program.u_Time = gl.getUniformLocation(program, "u_Time");
	program.camUpUniform = gl.getUniformLocation(program, "g_camUp");
	program.camRightUniform = gl.getUniformLocation(program, "g_camRight");
	program.camForwardUniform = gl.getUniformLocation(program, "g_camForward");
	program.eyeUniform = gl.getUniformLocation(program, "g_eye");
	program.light0PositionUniform = gl.getUniformLocation(program, "g_light0Position");
	program.light0ColorUniform = gl.getUniformLocation(program, "g_light0Color");

	program.lightNote = gl.getUniformLocation(program, "lightNote");
	program.medium = gl.getUniformLocation(program, "medium");

	program.normalSmooth = gl.getUniformLocation(program, "normalSmooth");

	program.antiAlias = gl.getUniformLocation(program, "antiAlias");

	program.clipNear = gl.getUniformLocation(program, "clipNear");
	program.clipFar = gl.getUniformLocation(program, "clipFar");
	program.focalLength = gl.getUniformLocation(program, "focalLength");
	program.rmSteps = gl.getUniformLocation(program, "rmSteps");
	program.surfThres = gl.getUniformLocation(program, "surfThres");

	program.iter = gl.getUniformLocation(program, "iter");

	program.addX = gl.getUniformLocation(program, "addX");
	program.addY = gl.getUniformLocation(program, "addY");
	program.addZ = gl.getUniformLocation(program, "addZ");
	program.addC = gl.getUniformLocation(program, "addC");

	program.repeatFractal = gl.getUniformLocation(program, "repeatFractal");
	program.repeatDistance = gl.getUniformLocation(program, "repeatDistance");

	program.colorOpt = gl.getUniformLocation(program, "colorOpt");
	program.mainLightInt = gl.getUniformLocation(program, "mainLightInt");
	program.clickLightInt = gl.getUniformLocation(program, "clickLightInt");
	program.clickLightSize = gl.getUniformLocation(program, "clickLightSize");
	program.solidColor = gl.getUniformLocation(program, "solidColor");

	program.aoswitch = gl.getUniformLocation(program, "aoswitch");
}

var g_eye;
var g_camUp;
var g_camRight;
var g_camForward;
var g_light0Position = [0, 4, 0];
var g_light0Color = [1.0, 1.0, 1.0, 1.0];
var horizontalAngle = 0.0;
var verticalAngle = 0.0;

function initCamera() {
	horizontalAngle = 0.0;
	verticalAngle = 0.0;
	g_eye = [0, 0,-6];
	g_camUp = [0, 1, 0];
	g_camRight = [0, 0, 1];
	g_camForward = vec3.create();
	vec3.cross(g_camForward, g_camRight, g_camUp);
	vec3.normalize(g_camForward, g_camForward);
}

var mouseSpeedX = null;
var mouseSpeedY = null;

function handleMouseMove(event) {
	if(document.getElementById("pan-mouse").checked){
		let speed = document.getElementById("mouse-speed").value;
		var mouseX = event.clientX;
		var mouseY = event.clientY;
		var rect = document.getElementById("glcanvas").getBoundingClientRect();
		var dx = mouseX - (rect.left + rect.width / 2);
		var dy = mouseY - (rect.top + rect.height / 2);
		mouseSpeedX = dx * 0.00005 * speed ;
		mouseSpeedY = dy * 0.00005 * speed ;
	}
	else{
		mouseSpeedX = null;
		mouseSpeedY = null;
	}
	
}

var currentKeys = {};
function handleKeyDown(event) {
	currentKeys[event.keyCode] = true;
}
function handleKeyUp(event) {
	currentKeys[event.keyCode] = false;
	if(event.keyCode==16){
		toggleChecked("key-wasd");
	}
	if(event.keyCode==17){
		toggleChecked("pan-mouse");
	}
}

function toggleChecked(ch){
	let tt = document.getElementById(ch).checked;
	if(tt){
		document.getElementById(ch).checked = false;
	}
	else if(!tt){
		document.getElementById(ch).checked = true;
	}
}

function handleInput() {
	if(document.getElementById("key-wasd").checked){
		var moveSpeed = 0.05 * document.getElementById("key-speed").value;
		if(currentKeys[38]) { // Forward
			g_eye[0] += g_camForward[0] * moveSpeed;
			g_eye[1] += g_camForward[1] * moveSpeed;
			g_eye[2] += g_camForward[2] * moveSpeed;
		} else if(currentKeys[40]) { // Backward
			g_eye[0] -= g_camForward[0] * moveSpeed;
			g_eye[1] -= g_camForward[1] * moveSpeed;
			g_eye[2] -= g_camForward[2] * moveSpeed;
		}
		if(currentKeys[39]) { // Right
			g_eye[0] += g_camRight[0] * moveSpeed;
			g_eye[1] += g_camRight[1] * moveSpeed;
			g_eye[2] += g_camRight[2] * moveSpeed;
		} else if(currentKeys[37]) { // Left
			g_eye[0] -= g_camRight[0] * moveSpeed;
			g_eye[1] -= g_camRight[1] * moveSpeed;
			g_eye[2] -= g_camRight[2] * moveSpeed;
		}
	}
}

function setCamera() {
	horizontalAngle += mouseSpeedX;
	verticalAngle += mouseSpeedY;

	if(horizontalAngle > 2.0 * Math.PI)
		horizontalAngle -= 2.0 * Math.PI;
	else if(horizontalAngle < 0.0)
		horizontalAngle += 2.0 * Math.PI;

	if(verticalAngle > 2.0 * Math.PI)
		verticalAngle -= 2.0 * Math.PI;
	else if(verticalAngle < 0.0)
		verticalAngle += 2.0 * Math.PI;

	var sintheta = Math.sin(horizontalAngle);
	var costheta = Math.cos(horizontalAngle);
	var sinphi = Math.sin(verticalAngle);
	var cosphi = Math.cos(verticalAngle);
	g_camForward = [cosphi * sintheta, -sinphi, cosphi * costheta];
	g_camRight = [costheta, 0.0, -sintheta];
	vec3.cross(g_camUp, g_camForward, g_camRight);
	vec3.normalize(g_camUp, g_camUp);
}

function setUniforms() {
	gl.uniform1f(program.addX, document.getElementById('addX').value);
	gl.uniform1f(program.addY, document.getElementById('addY').value);
	gl.uniform1f(program.addZ, document.getElementById('addZ').value);

	gl.uniform1i(program.addC, document.getElementById('addC').checked);

	gl.uniform1f(program.repeatDistance, document.getElementById('repeatDistance').value);
	gl.uniform1i(program.repeatFractal, document.getElementById('repeatFractal').checked);

	gl.uniform1i(program.antiAlias, document.getElementById('antiAlias').checked);
	gl.uniform1i(program.iter, document.getElementById('iter').value);
	gl.uniform1f(program.normalSmooth, document.getElementById('normalSmooth').value);

	gl.uniform1f(program.clipNear, document.getElementById('clip-near').value);
	gl.uniform1f(program.clipFar, document.getElementById('clip-far').value);
	gl.uniform1f(program.focalLength, document.getElementById('focal-length').value);

	gl.uniform1i(program.rmSteps, document.getElementById('rm-steps').value);
	gl.uniform1f(program.surfThres, document.getElementById('surf-thres').value);

	gl.uniform2f(program.resolutionUniform, gl.viewportWidth, gl.viewportHeight);
	gl.uniform1f(program.u_Time, tTime);
	gl.uniform3f(program.camUpUniform, g_camUp[0], g_camUp[1], g_camUp[2]);
	gl.uniform3f(program.camRightUniform, g_camRight[0], g_camRight[1], g_camRight[2]);
	gl.uniform3f(program.camForwardUniform, g_camForward[0], g_camForward[1], g_camForward[2]);
	gl.uniform3f(program.eyeUniform, g_eye[0], g_eye[1], g_eye[2]);

	gl.uniform3f(program.light0PositionUniform, g_eye[0], g_eye[1], g_eye[2]);
	
	gl.uniform4f(program.light0ColorUniform, g_light0Color[0], g_light0Color[1], g_light0Color[2], g_light0Color[3]);

	gl.uniform1f(program.mainLightInt, document.getElementById('mainLightInt').value);
	gl.uniform1f(program.clickLightInt, document.getElementById('clickLightInt').value);
	gl.uniform1f(program.clickLightSize, document.getElementById('clickLightSize').value);

	gl.uniform3f(program.solidColor, document.getElementById('color-r').value,
									document.getElementById('color-g').value,
									document.getElementById('color-b').value);

	gl.uniform1i(program.colorOpt, GetTrueOne('colorOpt'));

	gl.uniform1i(program.aoswitch, document.getElementById('aoswitch').checked);
}

let datanull = [1000,1000,1000,0];
let datapitch = [0,0,0,0];
let lightposx = 1000.;
let lightposy = 0.;
let lightposz = 0.;

const uiOF = [document.getElementById('posx_o'),
			document.getElementById('posy_o'),
			document.getElementById('posz_o'),
			document.getElementById('posd_o'),

			document.getElementById('posx_f'),
			document.getElementById('posy_f'),
			document.getElementById('posz_f'),
			document.getElementById('posd_f')
];

function updateUIValues(){
		uiOF[0].innerHTML = "X: "+Math.floor(datanull[0]*10000)/10000;
		uiOF[1].innerHTML = "Y: "+Math.floor(datanull[1]*10000)/10000;
		uiOF[2].innerHTML = "Z: "+Math.floor(datanull[2]*10000)/10000;
        uiOF[3].innerHTML = "D: "+Math.floor(datanull[3]*10000)/10000;

		uiOF[4].innerHTML = "X: "+Math.floor( datapitch[0]*ff *10000)/10000;
		uiOF[5].innerHTML = "Y: "+Math.floor( datapitch[1]*ff *10000)/10000;
		uiOF[6].innerHTML = "Z: "+Math.floor( datapitch[2]*ff *10000)/10000;
        uiOF[7].innerHTML = "D: "+Math.floor( datapitch[3]*ff *10000)/10000;
}

let scaleMode = GetTrueOne('scaleMode');
document.getElementById('scaleMode').addEventListener('input', function(){
	scaleMode = GetTrueOne('scaleMode');
});

let ff = 100;
document.getElementById('pointMult').addEventListener('input', function(){
	ff = document.getElementById('pointMult').value;
});

function updateDataPitch(){
	let d0,d1,d2,d3;
	if(datanull[0]!=0){

		switch (scaleMode) {
			case 0:
				d0 = Math.abs(datanull[0]); d1 = Math.abs(datanull[1]); d2 = Math.abs(datanull[2]); d3 = Math.abs(datanull[3]);
				break;

			case 1:
				d0 = Math.pow(2,Math.abs(datanull[0]));
				d1 = Math.pow(2,Math.abs(datanull[1]));
				d2 = Math.pow(2,Math.abs(datanull[2]));
				d3 = Math.pow(2,Math.abs(datanull[3]));
				break;

			default:
				break;
		}
		datapitch[0] = (d0%mm);
		datapitch[1] = (d1%mm);
		datapitch[2] = (d2%mm);
		datapitch[3] = (d3%mm);
	}
	else{
		datapitch=[0,0,0,0];
	}
}

var wclick;
document.body.onkeydown = playKeyboard;

function render(canvas) {
	canvas.onmousemove = readPixel;
	canvas.onmousedown = evPlay;

    let cw = canvas.width;
    let ch = canvas.height;
	gl.clear(gl.COLOR_BUFFER_BIT);

	handleInput();
	setCamera();
	setUniforms();
    //DRAW TO FLOAT 32 TEXTURE, BETTER RESOLUTION FOR THE SCALE
	var x, y;
	function readPixel(e){
		e = e || window.event;
        e.preventDefault();
		
		x = Clamp(0,512,(e.clientX - canvas.offsetLeft-274));
		y = 512-Clamp(0,512,(e.clientY - canvas.offsetTop-18));

		var texOut = gl.createTexture();
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texOut);
		//gl.texStorage2D(gl.TEXTURE_2D, 2, gl.RGBA32F, canvas.width, canvas.height);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, cw, ch, 0, gl.RGBA, gl.FLOAT, null);

		var fbOut = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbOut);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texOut, 0);

		gl.uniform1i(program.medium, false);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		//gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.readBuffer(gl.COLOR_ATTACHMENT0);
		datanull = new Float32Array(1*1*4);
		gl.readPixels(x,y,1,1,gl.RGBA,gl.FLOAT,datanull);

		updateDataPitch();
		updateUIValues();
		updateCompass();
	}
	
	function evPlay(e){
		e = e || window.event;
		wclick = e.button;
        e.preventDefault();
		canvas.onmouseup = exitDrag;
		canvas.onmousemove = bDrag;
		
		x = Clamp(0,512,(e.clientX - canvas.offsetLeft-274));
		y = 512-Clamp(0,512,(e.clientY - canvas.offsetTop-18));
		playt(x,y);		
	}

	function bDrag(e){
		e = e || window.event;
		e.preventDefault();

		x = Clamp(0,512,(e.clientX - canvas.offsetLeft-274));
		y = 512-Clamp(0,512,(e.clientY - canvas.offsetTop-18));
		playt(x,y);
    }

	function exitDrag(){
		canvas.onmouseup = null;
        canvas.onmousemove = readPixel;
	}
	
	function playt(x,y){

		var texOut = gl.createTexture();
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texOut);
		//gl.texStorage2D(gl.TEXTURE_2D, 2, gl.RGBA32F, canvas.width, canvas.height);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, cw, ch, 0, gl.RGBA, gl.FLOAT, null);

		var fbOut = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbOut);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texOut, 0);

		gl.uniform1i(program.medium, false);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		//gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.readBuffer(gl.COLOR_ATTACHMENT0);
		datanull = new Float32Array(1*1*4);
		gl.readPixels(x,y,1,1,gl.RGBA,gl.FLOAT,datanull);
		
        if(datanull[0]==0){
            datanull[0]=1000.;//LIGHT GOES AWAY
            datanull[1]=1000.;
            datanull[2]=1000.;
            //and plays nothing, because wev clicked beyond clipping 
        }else{
            lightposx = datanull[0];
            lightposy = datanull[1];
            lightposz = datanull[2];

            currentPitches[0]=datapitch[0]*ff;
            currentPitches[1]=datapitch[1]*ff;
            currentPitches[2]=datapitch[2]*ff;
            currentPitches[3]=datapitch[3]*ff;

            let toPlay = wclick==0?playclick0:playclick1;
            for(p = 0; p<4;p++){
                if(toPlay[p]){
                    playTone(currentPitches[p],wclick);
                }
            }              
            updateDataPitch();
            updateUIValues();
            updateCompass();
        }
	}

	//DRAW TO SCREEN
	gl.uniform1i(program.medium, true);
	gl.uniform3f(program.lightNote, lightposx,lightposy,lightposz)

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

let playclick0 = [false,false,false,false];
let playclick1 = [false,false,false,false];
function updatePlayClicks(){
	playclick0 = [document.getElementById('lc_playx').checked,
					document.getElementById('lc_playy').checked,
					document.getElementById('lc_playz').checked,
					document.getElementById('lc_playd').checked];

	playclick1 = [document.getElementById('mc_playx').checked,
					document.getElementById('mc_playy').checked,
					document.getElementById('mc_playz').checked,
					document.getElementById('mc_playd').checked];
}
updatePlayClicks();
const currentPitches = [];

function lightUI(w){
	let ui;
	switch (w) {
		case "x":
			ui = document.getElementById('playing_x');
			ui.style.backgroundColor = "red";
			setTimeout(lightoffUI, 100, ui);
			break;
		case "y":
			ui = document.getElementById('playing_y');
			ui.style.backgroundColor = "green";
			setTimeout(lightoffUI, 100, ui);
			break;
		case "z":
			ui = document.getElementById('playing_z');
			ui.style.backgroundColor = "blue";
			setTimeout(lightoffUI, 100, ui);
			break;
		case "d":
			ui = document.getElementById('playing_d');
			ui.style.backgroundColor = "gray";
			setTimeout(lightoffUI, 100, ui);
			break;
	
		default:
			break;
	}
	function lightoffUI(u){
		u.style.backgroundColor = "transparent";
	}
}

var tTime = 0;
function tick(canvas) {
	requestAnimFrame(tick);
	if(document.getElementById('renderONOFF').checked){
		render(canvas);
	//tTime += .005;
	}
}

function start() {
	var canvas = document.getElementById("glcanvas");
	if(!window.WebGLRenderingContext) {
		alert("NO WEBGL")
	}
	try { gl = canvas.getContext("webgl2"); } 
	catch(e) { }

	if(gl){
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;

		initProgram();
		initCamera();

		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clearColor(0.3, 0.3, 0.3, 1);
		
		document.onmousemove = handleMouseMove;
		document.onkeydown = handleKeyDown;
		document.onkeyup = handleKeyUp;

		tick(canvas);
	}
}

function Clamp(min,max,clamped){
    if(clamped<min){clamped=min;}
    if(clamped>max){clamped=max;}
    return clamped;
}

let ckey = null;
function playKeyboard(e) {
		e = e || window.event;
        e.preventDefault();
        if(e.repeat){return;}
		switch (e.key) {
			case "A": playTone(currentPitches[0]*.5,"key"); lightUI('x'); break; //key set 1
			case "S": playTone(currentPitches[1]*.5,"key"); lightUI('y'); break;
			case "D": playTone(currentPitches[2]*.5,"key"); lightUI('z'); break;
			case "F": playTone(currentPitches[3]*.5,"key"); lightUI('d'); break;
			case "Q": playTone(currentPitches[0],"key"); lightUI('x'); break;
			case "W": playTone(currentPitches[1],"key"); lightUI('y'); break;
			case "E": playTone(currentPitches[2],"key"); lightUI('z'); break;
			case "R": playTone(currentPitches[3],"key"); lightUI('d'); break;

			case "H": playTone(currentPitches[0]*.5,"key2"); lightUI('x'); break; //key set 2
			case "J": playTone(currentPitches[1]*.5,"key2"); lightUI('y'); break;
			case "K": playTone(currentPitches[2]*.5,"key2"); lightUI('z'); break;
			case "L": playTone(currentPitches[3]*.5,"key2"); lightUI('d'); break;
			case "Y": playTone(currentPitches[0],"key2"); lightUI('x'); break;
			case "U": playTone(currentPitches[1],"key2"); lightUI('y'); break;
			case "I": playTone(currentPitches[2],"key2"); lightUI('z'); break;
			case "O": playTone(currentPitches[3],"key2"); lightUI('d'); break;
		}		
}

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const masterVolume = audioContext.createGain();
masterVolume.connect(audioContext.destination);
masterVolume.gain.value = 0.8;

const volumeControl = document.getElementById('masterVol');
volumeControl.addEventListener('input', function(){
    masterVolume.gain.value = this.value;
});

let attackTime =0, sustainLevel=0, releaseTime=0, noteLength=0; panVal=0;

let osc ;
let sPan;

function get3dPanner(){
	let panner = audioContext.createPanner();
	//panner.panningModel = 'HRTF'; //here comes the crash in the YT video
	panner.distanceModel = 'linear';
	panner.refDistance = 1;
	panner.maxDistance = 100;
	panner.rolloffFactor = 1;
	panner.coneInnerAngle = 360;
	panner.coneOuterAngle = 0;
	panner.coneOuterGain = 0;
	return panner;
}

//DELAYS ARE PER INSTRUMENT
//PANNERS ARE PER NOTE
const i1Delay = audioContext.createDelay();
const i1Feedback = audioContext.createGain();
const i1DelayAmountGain = audioContext.createGain();

const i2Delay = audioContext.createDelay();
const i2Feedback = audioContext.createGain();
const i2DelayAmountGain = audioContext.createGain();

const i3Delay = audioContext.createDelay();
const i3Feedback = audioContext.createGain();
const i3DelayAmountGain = audioContext.createGain();

const i4Delay = audioContext.createDelay();
const i4Feedback = audioContext.createGain();
const i4DelayAmountGain = audioContext.createGain();

let sDelay;
let sFeedback;
let sDelayAmountGain;

let i1asrl, i2asrl, i3asrl, i4asrl;
function updateASRL(){
	i1asrl = [parseFloat(document.getElementById('fAttack').value),
				parseFloat(document.getElementById('fVolume').value),
				parseFloat(document.getElementById('fRelease').value),
				parseFloat(document.getElementById('fNLength').value),
				parseFloat(document.getElementById('fPan').value)];

	i3asrl = [parseFloat(document.getElementById('hAttack').value),
				parseFloat(document.getElementById('hVolume').value),
				parseFloat(document.getElementById('hRelease').value),
				parseFloat(document.getElementById('hNLength').value),
				parseFloat(document.getElementById('hPan').value)];

	i2asrl = [parseFloat(document.getElementById('gAttack').value),
				parseFloat(document.getElementById('gVolume').value),
				parseFloat(document.getElementById('gRelease').value),
				parseFloat(document.getElementById('gNLength').value),
				parseFloat(document.getElementById('gPan').value)];

	i4asrl = [parseFloat(document.getElementById('jAttack').value),
				parseFloat(document.getElementById('jVolume').value),
				parseFloat(document.getElementById('jRelease').value),
				parseFloat(document.getElementById('jNLength').value),
				parseFloat(document.getElementById('jPan').value)];
}
updateASRL();

//delay options
let i1delay, i2delay, i3delay, i4delay;
function updateDelay(){
	i1delay = [parseFloat(document.getElementById('fDelayTime').value),
				parseFloat(document.getElementById('fDelayFeedback').value),
				parseFloat(document.getElementById('fDelayAmount').value)];

	i3delay = [parseFloat(document.getElementById('hDelayTime').value),
				parseFloat(document.getElementById('hDelayFeedback').value),
				parseFloat(document.getElementById('hDelayAmount').value)];

	i2delay = [parseFloat(document.getElementById('gDelayTime').value),
				parseFloat(document.getElementById('gDelayFeedback').value),
				parseFloat(document.getElementById('gDelayAmount').value)];

	i4delay = [parseFloat(document.getElementById('jDelayTime').value),
				parseFloat(document.getElementById('jDelayFeedback').value),
				parseFloat(document.getElementById('jDelayAmount').value)];
}
updateDelay();

let setSlots = [0,0,0,0];
function updateSlots(){
	setSlots[0]=GetTrueOne('lc_slot');
	setSlots[1]=GetTrueOne('mc_slot');
	setSlots[2]=GetTrueOne('ks1_slot');
	setSlots[3]=GetTrueOne('ks2_slot');
}
updateSlots();

let setInsts = [0,0,0,0];
function updateInsts(){
	setInsts[0]=GetTrueOne('ins1_sel');
	setInsts[1]=GetTrueOne('ins2_sel');
	setInsts[2]=GetTrueOne('ins3_sel');
	setInsts[3]=GetTrueOne('ins4_sel');
}
updateInsts();

function playTone(freq,inp) {

	let stereopan = document.getElementById('pan3d').checked;
    function setASRL(i){
            attackTime = i[0];
			sustainLevel = i[1];
			releaseTime = i[2];
			noteLength = i[3];
			panVal = i[4];
    }

	function setFX(i){
		sDelay.delayTime.value = i[0];
	    sFeedback.gain.value = i[1];
		sDelayAmountGain.gain.value = i[2];
		sDelayAmountGain.connect(sDelay);
		sDelay.connect(sFeedback);
		sFeedback.connect(sDelay);
		sDelay.connect(masterVolume);
		//pan is setted
		sPan.connect(sDelayAmountGain);
	}

	let wslot;
	switch (inp) {
		case 0: wslot = setSlots[0]; break;
		case 1: wslot = setSlots[1]; break;
		case "key": wslot = setSlots[2]; break;
		case "key2": wslot = setSlots[3]; break;
		default:break;
	}

	function setInst(w){
		switch (w) {
				case 0:
					osc = audioContext.createOscillator();
					osc.type = "sine";
					osc.frequency.value = freq;
					break;

				case 1:
					osc = audioContext.createOscillator();
					osc.type = "square";
					osc.frequency.value = freq;
					break;

				case 2:
					osc = audioContext.createOscillator();
					osc.type = "triangle";
					osc.frequency.value = freq;					
					break;

				case 3:
					osc = audioContext.createOscillator();
					osc.type = "sawtooth";
					osc.frequency.value = freq;
					break;

				case 4:
					switch (wslot) {
						case 0: osc = gFF.CreateOscillator(freq); break;
						case 2: osc = gHH.CreateOscillator(freq); break;
						case 1: osc = gGG.CreateOscillator(freq); break;
						case 3: osc = gJJ.CreateOscillator(freq); break;
						default: break;
					}
					break;

				default:
					break;
			}
	}

	let winst;
	switch (wslot) {
		case 0: 
            setASRL(i1asrl);
			sPan = stereopan?get3dPanner():audioContext.createStereoPanner();
			if(document.getElementById('i1fx').checked==true){
				sDelay = i1Delay;
				sFeedback = i1Feedback;
				sDelayAmountGain = i1DelayAmountGain;
				setFX(i1delay);
			}
			winst = setInsts[0];
			setInst(winst);
			break;

		case 2: 
			setASRL(i3asrl);
			sPan = stereopan?get3dPanner():audioContext.createStereoPanner();
			if(document.getElementById('i3fx').checked==true){
				sDelay = i3Delay;
				sFeedback = i3Feedback;
				sDelayAmountGain = i3DelayAmountGain;
				setFX(i3delay);
			}
			winst = setInsts[2];
			setInst(winst);
			break;

		case 1: 
			setASRL(i2asrl);
			sPan = stereopan?get3dPanner():audioContext.createStereoPanner();
			if(document.getElementById('i2fx').checked==true){
				sDelay = i2Delay;
				sFeedback = i2Feedback;
				sDelayAmountGain = i2DelayAmountGain;
				setFX(i2delay);
			}
			winst = setInsts[1];
			setInst(winst);
			break;

		case 3:
			setASRL(i4asrl);
			sPan = stereopan?get3dPanner():audioContext.createStereoPanner();
			if(document.getElementById('i4fx').checked==true){
				sDelay = i4Delay;
				sFeedback = i4Feedback;
				sDelayAmountGain = i4DelayAmountGain;
				setFX(i4delay);
			}
			winst = setInsts[3];
			setInst(winst);
			break;

		default:
			break;
	}

    let noteGain = audioContext.createGain();
    noteGain.gain.setValueAtTime(0, 0);
    noteGain.gain.linearRampToValueAtTime(sustainLevel, audioContext.currentTime + noteLength * attackTime);
    noteGain.gain.setValueAtTime(sustainLevel, audioContext.currentTime + noteLength - noteLength * releaseTime);
    noteGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + noteLength);    
    
    osc.start(0);
    osc.stop(audioContext.currentTime + noteLength);
    osc.connect(noteGain);
	if(stereopan){
		if(datanull[0]!=0){
			sPan.setPosition(datanull[0]-g_eye[0],datanull[1]-g_eye[1],datanull[2]-g_eye[2]);
		}/*else{
			sPan.setPosition(0,0,0);
		}*/
	}else{
		sPan.pan.value = panVal;
	}
	noteGain.connect(sPan);
	sPan.connect(masterVolume);
}

	let gGG;
	updateGG();
	function updateGG(){
		gGG = new PeriodicWaveInstrument(
        CreateWaveTablesFromFormants([
            [document.getElementById('g1freq').value, document.getElementById('g1exp').value, document.getElementById('g1coef').value],
			[document.getElementById('g2freq').value, document.getElementById('g2exp').value, document.getElementById('g2coef').value],
            [document.getElementById('g3freq').value, document.getElementById('g3exp').value, document.getElementById('g3coef').value],
			[document.getElementById('g4freq').value, document.getElementById('g4exp').value, document.getElementById('g4coef').value],
            [document.getElementById('g5freq').value, document.getElementById('g5exp').value, document.getElementById('g5coef').value]
        ], 
		document.getElementById('wtgg_numHarmonics').value, 
		document.getElementById('wtgg_attenuator').value,
		document.getElementById('wtgg_bandwith').value,
		document.getElementById('wtgg_bandwithScale').value,
		16384), 0.2);
	}

	var gFF;
	updateFF();
	function updateFF(){
		gFF = new PeriodicWaveInstrument(
        CreateWaveTablesFromFormants([
            [document.getElementById('f1freq').value, document.getElementById('f1exp').value, document.getElementById('f1coef').value],
			[document.getElementById('f2freq').value, document.getElementById('f2exp').value, document.getElementById('f2coef').value],
            [document.getElementById('f3freq').value, document.getElementById('f3exp').value, document.getElementById('f3coef').value],
			[document.getElementById('f4freq').value, document.getElementById('f4exp').value, document.getElementById('f4coef').value],
            [document.getElementById('f5freq').value, document.getElementById('f5exp').value, document.getElementById('f5coef').value]
        ], 
		Math.round(document.getElementById('wtff_numHarmonics').value-Math.round(datanull[3]*.2)), 
		document.getElementById('wtff_attenuator').value,
		document.getElementById('wtff_bandwith').value,
		document.getElementById('wtff_bandwithScale').value,
		16384), 0.2);
	}

	var gHH; //middle click default
	updateHH();
	function updateHH(){
			gHH = new PeriodicWaveInstrument(
			WaveTableGeneratorFromHarmonics([
				[document.getElementById('h1amp').value, document.getElementById('h1frm').value, document.getElementById('h1bw').value],
				[document.getElementById('h2amp').value, document.getElementById('h2frm').value, document.getElementById('h2bw').value],
				[document.getElementById('h3amp').value, document.getElementById('h3frm').value, document.getElementById('h3bw').value],
				[document.getElementById('h4amp').value, document.getElementById('h4frm').value, document.getElementById('h4bw').value],
				[document.getElementById('h5amp').value, document.getElementById('h5frm').value, document.getElementById('h5bw').value]
			], document.getElementById('wthh_numHarmonics').value, 8192), 0.2);
	}

	var gJJ;
	updateJJ();
	function updateJJ(){
		gJJ = new PeriodicWaveInstrument(
			WaveTableGeneratorFromHarmonics([
				//amp  freq mult    bandw
				[document.getElementById('j1amp').value, document.getElementById('j1frm').value, document.getElementById('j1bw').value],
				[document.getElementById('j2amp').value, document.getElementById('j2frm').value, document.getElementById('j2bw').value],
				[document.getElementById('j3amp').value, document.getElementById('j3frm').value, document.getElementById('j3bw').value],
				[document.getElementById('j4amp').value, document.getElementById('j4frm').value, document.getElementById('j4bw').value],
				[document.getElementById('j5amp').value, document.getElementById('j5frm').value, document.getElementById('j5bw').value]
			], document.getElementById('wtjj_numHarmonics').value, 8192), 0.2);
	}

    function CreateWaveTablesFromFormants(formants, numHarmonics, 
    harmonicAttenuationPower, bandwidth, bandwidthScale, tableSize) {
        return function (freq) {
            let ampls = new Float32Array(tableSize);
            for (let i = 1; i <= numHarmonics; i++) {
                let ifreq = i * freq;
                let amplitude = 0;
                for (let f = 0; f < formants.length; f++) {
                    let formant = formants[f];
                    let x = (ifreq - formant[0]) * formant[1];
                    amplitude += formant[2] * Math.exp(-x * x);
                }
                amplitude /= Math.pow(i, harmonicAttenuationPower);
                AddSineHarmonicGauss(ampls, freq / 4 / 16384,
                    i, bandwidthScale, amplitude, bandwidth);
            }
            return GenerateWaveWithRandomPhases(ampls);
        };
    }

    function WaveTableGeneratorFromHarmonics(harmonics, bandwidthScale, tableSize) {
        return function (freq) {
            let ampls = new Float32Array(tableSize);
            let len = harmonics.length;
            for (let i = 0; i < len; i++) {
                let harm = harmonics[i];
                AddSineHarmonicGauss(ampls, freq / 4 / 16384,
                    harm[1], bandwidthScale, harm[0], harm[2]);// harm[2]);
            }
            return GenerateWaveWithRandomPhases(ampls);
        };
    }

    function PeriodicWaveInstrument(waveGenerator, volume) {
        this.Volume = volume || 1;
        let waveNoteCache = [];
        this.CreateOscillator = function (freq) {
            if (!waveNoteCache[freq]) waveNoteCache[freq] = waveGenerator(freq);
            let osc = audioContext.createOscillator();
            let wave = waveNoteCache[freq];
            osc.frequency.value = 2 * 16384 / wave.length;
            osc.setPeriodicWave(wave);
            return osc;
        };
    }

    let gSineTable = function () {
        let tableLen = 32768;
        let table = new Float32Array(tableLen);
        let PI2_len = 2 * Math.PI / tableLen;
        for (let i = 0; i < tableLen; i++)
            table[i] = Math.sin(i * PI2_len);
        return table;
    }();

    function AddSineHarmonicGauss(dstAmpls, freqSampleRateRatio,
        harmFreqMultiplier, harmBandwidthScale, amplitude, bandwidthCents) {
        let bwi = (Math.pow(2, bandwidthCents / 1200 - 1) - 0.5) * freqSampleRateRatio;
        bwi *= Math.pow(harmFreqMultiplier, harmBandwidthScale);
        let rw = -freqSampleRateRatio * harmFreqMultiplier / bwi;
        let rdw = 1.0 / (dstAmpls.length * 2 * bwi);

        let startIndex = 0, endIndex = dstAmpls.length;

        let range = 2;
        if (rdw > 1) range = 3 * rdw;
        if (-range > rw) {
            startIndex = Math.round((-range - rw) / rdw);
            rw += startIndex * rdw;
        }
        if (rw < range) endIndex = startIndex + Math.max(10, Math.round((range - rw) / rdw));

        let ampl = amplitude / bwi;
        for (let i = startIndex; i < endIndex; i++) {
            dstAmpls[i] += ampl * Math.exp(-rw * rw);
            rw += rdw;
        }
    }
    let gSeed = 157898685;

    function GenerateWaveWithRandomPhases(ampls) {
        let len = ampls.length;
        let tableLen = gSineTable.length, tableMask = tableLen - 1;
        let real = new Float32Array(len);
        let imag = new Float32Array(len);
        let seed = gSeed;
        for (let i = 0; i < len; i++) {
            seed = (seed * 16807) & 0xFFFFFFFF;
            real[i] = ampls[i] * gSineTable[(seed + tableLen / 4) & tableMask];
            imag[i] = ampls[i] * gSineTable[seed & tableMask];
        }
        gSeed = seed;
        let result = audioContext.createPeriodicWave(real, imag, { disableNormalization: false });
        result.length = len;
        return result;
    }

//WEBGL UTILS
/*
 * Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


/**
 * @fileoverview This file contains functions every webgl program will need
 * a version of one way or another.
 *
 * Instead of setting up a context manually it is recommended to
 * use. This will check for success or failure. On failure it
 * will attempt to present an approriate message to the user.
 *
 *       gl = WebGLUtils.setupWebGL(canvas);
 *
 * For animated WebGL apps use of setTimeout or setInterval are
 * discouraged. It is recommended you structure your rendering
 * loop like this.
 *
 *       function render() {
 *         window.requestAnimFrame(render, canvas);
 *
 *         // do rendering
 *         ...
 *       }
 *       render();
 *
 * This will call your rendering function up to the refresh rate
 * of your display but will stop rendering if your app is not
 * visible.
 */

 WebGLUtils = function() {

/**
 * Creates the HTLM for a failure message
 * @param {string} canvasContainerId id of container of th
 *        canvas.
 * @return {string} The html.
 */
var makeFailHTML = function(msg) {
  return '' +
    '<table style="background-color: #8CE; width: 100%; height: 100%;"><tr>' +
    '<td align="center">' +
    '<div style="display: table-cell; vertical-align: middle;">' +
    '<div style="">' + msg + '</div>' +
    '</div>' +
    '</td></tr></table>';
};

/**
 * Mesasge for getting a webgl browser
 * @type {string}
 */
var GET_A_WEBGL_BROWSER = '' +
  'This page requires a browser that supports WebGL.<br/>' +
  '<a href="http://get.webgl.org">Click here to upgrade your browser.</a>';

/**
 * Mesasge for need better hardware
 * @type {string}
 */
var OTHER_PROBLEM = '' +
  "It doesn't appear your computer can support WebGL.<br/>" +
  '<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>';

/**
 * Creates a webgl context. If creation fails it will
 * change the contents of the container of the <canvas>
 * tag to an error message with the correct links for WebGL.
 * @param {Element} canvas. The canvas element to create a
 *     context from.
 * @param {WebGLContextCreationAttirbutes} opt_attribs Any
 *     creation attributes you want to pass in.
 * @param {function:(msg)} opt_onError An function to call
 *     if there is an error during creation.
 * @return {WebGLRenderingContext} The created context.
 */
var setupWebGL = function(canvas, opt_attribs, opt_onError) {
  function handleCreationError(msg) {
    var container = canvas.parentNode;
    if (container) {
      var str = window.WebGLRenderingContext ?
           OTHER_PROBLEM :
           GET_A_WEBGL_BROWSER;
      if (msg) {
        str += "<br/><br/>Status: " + msg;
      }
      container.innerHTML = makeFailHTML(str);
    }
  };

  opt_onError = opt_onError || handleCreationError;

  if (canvas.addEventListener) {
    canvas.addEventListener("webglcontextcreationerror", function(event) {
          opt_onError(event.statusMessage);
        }, false);
  }
  var context = create3DContext(canvas, opt_attribs);
  if (!context) {
    if (!window.WebGLRenderingContext) {
      opt_onError("");
    }
  }
  return context;
};

/**
 * Creates a webgl context.
 * @param {!Canvas} canvas The canvas tag to get context
 *     from. If one is not passed in one will be created.
 * @return {!WebGLContext} The created context.
 */
var create3DContext = function(canvas, opt_attribs) {
  var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
  var context = null;
  for (var ii = 0; ii < names.length; ++ii) {
    try {
      context = canvas.getContext(names[ii], opt_attribs);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  return context;
}

return {
  create3DContext: create3DContext,
  setupWebGL: setupWebGL
};
}();

/**
 * Provides requestAnimationFrame in a cross browser way.
 */
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
           window.setTimeout(callback, 1000/60);
         };
})();