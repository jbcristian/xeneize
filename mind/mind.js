/*
function ADSR(attackDuration, decayDuration, sustainVolume, releaseDuration, exponent) {
    this.AttackDuration = attackDuration;
    this.DecayDuration = decayDuration;
    this.SustainVolume = sustainVolume;
    this.ReleaseDuration = releaseDuration;
    this.Exponent = exponent || 0;
}*/


//other options to get the JSON
function getFile(elm){
    new Response(elm.files[0]).json().then(json =>{
        logPreset(json);//will se this later...
        console.log(json);
    }, err => {
        //not json
    })
}
/*
function readTextFile(file, callback){
    let rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function(){
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}
readTextFile("real_daw.JSON", function(text){
    var data = JSON.parse(text);
    console.log(data);
})*/

let session;
document.onload = fetch("mind_base.JSON").then(response => response.json()).then(json => logPreset(json));
//fetch("real_daw.JSON").then(response => response.json()).then(json => logPreset(json));

function logPreset(preset){
    session = preset;
    //trackNodes = [];
    tracksChains = [];
    trackAnalysers = [];
    trackSynths = [];
    //reload all screen
    if(document.getElementsByClassName("track").length>0){
        let ts = document.getElementsByClassName("track");//console.log(ts.length)
        for(let i = ts.length; i > 0; i--){
            ts.item(i-1).remove();
        }
    }
    try{
        for(let t in session.tracks){//console.log(session.tracks[i]);
            drawTrack(session.tracks[t],session.tracks);
        }
        //setTracks();//session.tracks
        //setMaster();
        //setMasterAnalyser();
        //setTrackAnalyser();
    }
    catch(e){console.log(e);}
}

// UI //
function drawTrack(track){//tracks
    
    let uiTrack = document.createElement('div');
    uiTrack.className = "track";
    uiTrack.id = "track"+track.position;
    uiTrack.innerHTML = '<div class="title trackTitle">'+track.type+' ID [ '+track.id+' ]</div>';
    document.getElementById('daw-tracks').appendChild(uiTrack);

    let uiGlobal = document.createElement('div');
    uiGlobal.className ="track-global";
    uiTrack.appendChild(uiGlobal);

    drawCompleteSlider("Volume: ", uiGlobal, track,"volume", 0, 1, 0.01, "slider",track.id);
    drawCompleteSlider("Pan: ", uiGlobal, track,"pan", -1,1,0.01, "slider",track.id);
    drawVUmeter(uiGlobal,track);

    //if(track.type="MASTER"){setMasterAnalyser()}
    if(track.instrument){//master doest have instrument nor deletable
        drawDeleteTrack(uiTrack,track);//tracks

        let uiInst = document.createElement('div');
        uiInst.className = "synth-instrument";
        uiTrack.appendChild(uiInst);

        let uiTitle = document.createElement('div');
        uiTitle.className = "title";
        uiTitle.innerText = "SYNTH";
        uiInst.appendChild(uiTitle);

        let uiEnv = document.createElement('div');
        uiEnv.className = "envelope";
        uiInst.appendChild(uiEnv);

        let uiEnvtitle = document.createElement('div');
        uiEnvtitle.className = "title";
        uiEnvtitle.innerText = "Envelope: ";
        uiEnv.appendChild(uiEnvtitle);

        drawCompleteSlider("Attack: ", uiEnv, track.instrument.envelope,"a", 0, 1, .1, "envelope slider",track.id);
        drawCompleteSlider("Decay: ", uiEnv, track.instrument.envelope,"d", 0, 1, .1, "envelope slider",track.id);
        drawCompleteSlider("Sustain: ", uiEnv, track.instrument.envelope,"s", 0, 1, .1, "envelope slider",track.id);
        drawCompleteSlider("Release: ", uiEnv, track.instrument.envelope,"r", 0, 1, .1, "envelope slider",track.id);
        drawCompleteSlider("Note(ms): ", uiEnv, track.instrument.envelope,"l", 0, 1, .1, "envelope slider",track.id);

        let uiSynthType = document.createElement('div');
        uiSynthType.className = "synth-type";
        uiInst.appendChild(uiSynthType);

        let uiTypeSel = document.createElement('div');
        uiTypeSel.style.padding = "5px";

        drawRadioSet("Type: ", ['Waveform','Harmonics Wavetable ','Formants Wavetable'], uiTypeSel, track.instrument,"type","radioset");

        let uibuts = uiTypeSel.getElementsByClassName("radioTest");
        for(i in uibuts){
            uibuts.item(i).oninput = ()=>{ setTypeUI(); }
        }

        function setTypeUI(){
            uitype1.style.display = "none";
            uitype2.style.display = "none";
            uitype3.style.display = "none";
            switch(track.instrument.type){
                case 0:uitype1.style.display = "block";break;
                case 1:uitype3.style.display = "block";break;
                case 2:uitype2.style.display = "block";break;
                default: break;
            }
        }

        uiSynthType.appendChild(uiTypeSel);

        let uitype1 = document.createElement('div');
        uitype1.style.padding = "10px";
        uitype1.style.backgroundColor = "rgba(0,0,0,1.0)";
        uiSynthType.appendChild(uitype1);

        drawRadioSet("Waveform", ['Sine','Square','Triangle','Sawtooth'], uitype1, track.instrument.generator.simple, "waveform","radioset");

        let uitype2 = document.createElement('div');
        uitype2.style.padding = '10px';
        uitype2.style.backgroundColor = "rgba(0,0,0,1.0)";
        uiSynthType.appendChild(uitype2);

        //fix min max
        let uit2l1 = document.createElement('div');
        uitype2.appendChild(uit2l1);
        drawNumber("Harmonics: ", track.instrument.generator.formants, "harmonics", 0, 128,1,"synth-number", uit2l1);
        drawNumber("Attenuator: ", track.instrument.generator.formants, "attenuator", 0.01, 3,0.01,"synth-number", uit2l1);
        drawNumber("Bandwidth: ", track.instrument.generator.formants, "bandwidth", 0, 100,1,"synth-number", uit2l1);
        drawNumber("Scale: ", track.instrument.generator.formants, "bwscale", 0, 100,0.1,"synth-number", uit2l1);

        let uit2l2 = document.createElement('div');
        //uit2l2.style.position = "relative";
        uit2l2.innerHTML = '<div class="title" style="position:relative;"><span>Frequency</span><span>Exp</span><span>Coef</span></div>';

        let uidelform = document.createElement('BUTTON');
        uidelform.className = "synth-button";
        uidelform.innerText = "Add Formant";
        uit2l2.firstChild.appendChild(uidelform);

        uidelform.onclick = ()=>{
            if(!track.instrument.generator.formants.list){track.instrument.generator.formants.list = [];};//why ?
            try{
                let newf = NewFormant();
                track.instrument.generator.formants.list.push(newf);
            }catch(e){
                console.log(e);
            }
            let list = track.instrument.generator.formants.list;
            let formd = document.createElement('div');
            uit2l2.appendChild(formd);
            drawFormant(list,list.length-1,"formant", formd,track.instrument.generator.formants);
        }
        uitype2.appendChild(uit2l2);

        if(track.instrument.generator.formants.list.length>0){
            let list = track.instrument.generator.formants.list;
            for(i in list){
                let formd = document.createElement('div');
                uit2l2.appendChild(formd);
                drawFormant(list,i,"formant", formd,track.instrument.generator.formants);
            }
        }

        uitype2.onclick = ()=>{
            if(trackSynths){
                let t = trackSynths.find(getTrackNode);
                function getTrackNode(t){
                    if(t[2]==track.id){
                        return t
                    };
                }
                t[1] = setFormantsSynth(track);
            }
        }

        let uitype3 = document.createElement('div');
        uitype3.style.padding = '10px';
        uitype3.style.backgroundColor = "rgba(0,0,0,1.0)";
        uiSynthType.appendChild(uitype3);

        //fix min max
        let uit3l1 = document.createElement('div');
        uitype3.appendChild(uit3l1);
        drawNumber("Bandwidth Scale: ", track.instrument.generator.harmonics, "value", 0, 4,0.01,"synth-number", uit3l1);

        let uit3l2 = document.createElement('div');

        uit3l2.innerHTML = '<div class="title" style="position:relative;"><span>Amp</span><span>Freq</span><span>Bandwidth</span></div>';

        let uidelh = document.createElement('BUTTON');
        uidelh.className = "synth-button";
        uidelh.innerText = "Add Harmonic";
        uit3l2.firstChild.appendChild(uidelh);

        uidelh.onclick = ()=>{
            if(!track.instrument.generator.harmonics.list){track.instrument.generator.harmonics.list = [];};//why ?
            try{
                let newf = NewHarmonic();;           
                track.instrument.generator.harmonics.list.push(newf);
            }catch(e){
                console.log(e);
            }
            let list = track.instrument.generator.harmonics.list;
            let formd = document.createElement('div');
            uit3l2.appendChild(formd);
            drawHarmonic(list,list.length-1,"harmonic", formd,track.instrument.generator.harmonics);
        }
        uitype3.appendChild(uit3l2);

        if(track.instrument.generator.harmonics.list.length>0){
            let list = track.instrument.generator.harmonics.list;
            for(i in list){
                let formd = document.createElement('div');
                uit3l2.appendChild(formd);
                drawHarmonic(list,i,"harmonic", formd,track.instrument.generator.harmonics);
            }
        }

        uitype3.onclick = ()=>{
            if(trackSynths){
                let t = trackSynths.find(getTrackNode);
                function getTrackNode(t){
                    if(t[2]==track.id){
                        return t
                    };
                }
                //console.log(t)
                t[0] = setHarmonicSynth(track);
                //t[1] = setFormantsSynth(track);
            }
        }

        setTypeUI();
    }

    //EFFECTS UI
    let uiEffects = document.createElement('div');
    uiEffects.className = "synth-effect";
    uiTrack.appendChild(uiEffects);

    let uiTitle = document.createElement('div');
    uiTitle.className = "title titlebig";
    uiTitle.innerText = "EFFECTS";
    uiEffects.appendChild(uiTitle);

    let uiaddfx = document.createElement('div');
    uiaddfx.className = "addfxsection";
    uiTitle.appendChild(uiaddfx);

    let uifxsel = document.createElement('select');
    let uioptdelay = document.createElement("option");
    uioptdelay.text = "Delay";
    let uioptgain = document.createElement("option");
    uioptgain.text = "Gain";
    let uioptdist = document.createElement("option");
    uioptdist.text = "Distortion";

    uifxsel.add(uioptdelay);
    uifxsel.add(uioptgain);
    uifxsel.add(uioptdist);

    uiaddfx.appendChild(uifxsel);

    let uiaddfxbutton = document.createElement('div');
    uiaddfxbutton.innerText = "Add Effect";
    uiaddfxbutton.className = "button-B";
    uiaddfxbutton.onclick = ()=>{
        if(!track.effects){track.effects = [];};//why ?
        try{
            let newfx;
            switch(uifxsel.selectedIndex){
                case 0: newfx = new EffectDelay();  break;
                case 1: newfx = new EffectGain();   break;
                case 2: newfx = new EffectDistortion(); break;
                default:    break;
            }
            track.effects.push(newfx);
            resetPositions(track.effects);
        }catch(e){
            console.log(e);
        }
        drawEffects(uiEffects, track.effects,track);
    }
    
    uiaddfx.appendChild(uiaddfxbutton);
    if(track.effects){drawEffects(uiEffects, track.effects,track)}

    if(sessionCtx){
        initTrack(track);
    }
}

function drawLFO(w,track){
    try{

    }catch(e){
        console.log(e);
    }
}

//w is where to add
function drawEffects(w,trackEffects,track){
    try{
        //clean and redraw all
        let els = w.querySelectorAll('.effect');
        for(let el = 0; el<els.length; el++){
            els[el].remove();
        }
        //console.log(track.id+" "+trackEffects.length);

        for(let fx in trackEffects){
            let uiFX = document.createElement('div');
            uiFX.className = "effect";
            uiFX.oninput = ()=>{
                console.log(track)
                setTrackEffects(track);
            }
            w.appendChild(uiFX);

            let uiName = document.createElement('div');
            uiName.className = "effectTitle";
            uiName.innerText = trackEffects[fx].type;
            uiFX.appendChild(uiName);

            drawDeleteFX(trackEffects,uiName,fx,uiFX,track);
            drawCheckbox(trackEffects[fx],uiName);
            drawArrowsFX(uiName,trackEffects[fx],trackEffects,track);

            switch(trackEffects[fx].type){
                case "DELAY":                    
                    drawCompleteSlider("Time: ", uiFX, trackEffects[fx].options,"delayTime", 0, 1, .01, "slider",track.id);
                    drawCompleteSlider("Feedback: ", uiFX, trackEffects[fx].options,"delayFeedback", 0, 1, .01, "slider",track.id);
                    drawCompleteSlider("Gain: ", uiFX, trackEffects[fx].options,"delayGain", 0, 1, .01, "slider",track.id);
                    break;
                case "GAIN":
                    drawCompleteSlider("Gain: ", uiFX, trackEffects[fx].options, "gainAmount", -1, +1, .01, "slider",track.id);
                    break;
                /*case "LFO": //lfo is a wave effect not a sound effect
                    drawCompleteSlider("Speed: ", uiFX, trackEffects[fx].options,"lfoSpeed", 0, 500, .1, "slider");
                    drawCompleteSlider("Amount: ", uiFX, trackEffects[fx].options,"lfoAmount", 0, 500, .1, "slider");
                    break;*/
                case "DISTORTION":
                    drawCompleteSlider("Amount: ", uiFX, trackEffects[fx].options,"distortionAmount", 0, 100, 1, "slider",track.id);
                    drawRadioSet("Oversample: ", ['4x','2x','none'], uiFX, trackEffects[fx].options,"oversample","radioset");
                    break;
                default:
                    break;
            }
        }
    }catch(e){
        console.log(e);
    }
    
}

function getObjectLength(o){
    let l=0;
    for(let i in o)l++;
    return l;
}

function swapEffects(fx,effects,dir){
    let effectIndex = effects.indexOf(fx);
    let fx2 = effects[effectIndex+dir];
    if(fx2){
        effects[effectIndex+dir] = fx;
        effects[effectIndex] = fx2;
    }else{

        console.log("nope, ");
    }
    console.log(effectIndex+", "+fx2);
}

function drawDeleteTrack(w,track){//tracks
    let nw = w.querySelector('.title');
    let uidelbutton = document.createElement('div');
    uidelbutton.className = "button-D";
    uidelbutton.innerText = "X";
    nw.appendChild(uidelbutton);
    //let tracks = [...session.tracks];

    uidelbutton.addEventListener('click',()=>{
        delete session.tracks[session.tracks.indexOf(track)];
        let test = session.tracks.filter(function(){return true;});
        session.tracks = [];
        //trackNodes = [];
        tracksChains = [];
 
        session.tracks = test; //seems to work
        resetPositions(session.tracks);
        //console.log(session.tracks)
        w.remove();
        setTracks();
    });
}

function drawDeleteFX(trackEffects,w,fx,ui,track){
    let uidelbutton = document.createElement('div');
    uidelbutton.className = "button-D";
    uidelbutton.innerText = "Delete";
    w.appendChild(uidelbutton);
    uidelbutton.addEventListener('click',()=>{
       
        delete trackEffects[fx]; //this trackEffects is a copy
        let test = trackEffects.filter(function(){return true;})
        track.effects = []; //and this track.effects, is the actual session.tracks[x].effects
        tracksEffects = [];

        track.effects = test;
        resetPositions(track.effects);
        ui.remove();
        setTracks();
        //console.log(track.effects);
    });
}

function resetPositions(arr){
    for(let n = 0; n<arr.length;n++){
        //console.log(arr[n]);
        if(arr[n]){ arr[n].position = n; }
    }
}

function generateRandomId(){
    let ids = [];
    for(let i in session.tracks){
        ids[i]=session.tracks[i].id;
    }
    let newID = Math.floor(Math.random()*1000);//0 - 1000
    let exists = ids.find(checkid);
    function checkid(id) {
        return id == newID;
      }
    if(!exists){
        return newID;
    }else{
        generateRandomId();
    }
}

function drawArrowsFX(w,f,effects,track){
    let uiarrowup = document.createElement('div');
    uiarrowup.className = "arrow";
    w.appendChild(uiarrowup);
    uiarrowup.innerText = '▲';

    let uiarrowdw = document.createElement('div');
    uiarrowdw.className = "arrow";
    uiarrowdw.innerText = '▼';
    w.appendChild(uiarrowdw);

    uiarrowdw.addEventListener('click',()=>{
        swapEffects(f,effects,1);
        drawEffects(w.parentElement.parentElement,effects,track)
        resetPositions(track.effects);
    });
    uiarrowup.addEventListener('click',()=>{
        swapEffects(f,effects,-1);
        drawEffects(w.parentElement.parentElement,effects,track)
        resetPositions(track.effects);
    });
}

function drawVUmeter(w,track){
    let metercontainer = document.createElement('div');
    metercontainer.className = "metercont"
    metercontainer.style.position = "relative";
    w.appendChild(metercontainer);

    let marks = document.createElement('div');
    marks.style.borderLeft = "1px solid #333";
    marks.style.position = "absolute";
    marks.style.right = "20px";
    marks.style.height = "5px";
    marks.style.width = "1px";
    metercontainer.appendChild(marks);

    let canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 5;
    metercontainer.appendChild(canvas);
    canvas.style.border = "1px solid #333";
    canvas.id = "meter"+track.id;
}

//s= name, w=where to append, v=value, mix,max,step,class style
function drawCompleteSlider(name,w,v,i,min,max,step,c,id){
    let full = document.createElement('div');
    full.className = c;
    w.appendChild(full);

    let title = document.createElement('div');
    title.innerText = name;
    full.appendChild(title);

    let slider = document.createElement('input');

    if(i == "volume" || i == "pan"){
        slider.id = i+""+id;
    }

    slider.type = "range";
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = v[i];
    full.appendChild(slider);

    var valc = document.createElement('div');
	valc.className ="rangeValue";
	valc.innerText = v[i];
	slider.oninput = ()=>{
        updateSliderText(slider);
        v[i]= parseFloat(slider.value);
    };
    full.appendChild(valc);
    function updateSliderText(name){
        name.nextElementSibling.innerText = name.value;
    }
}

//name " "gets empty,where,obj,val,min,max,step,classname,id?
function drawCompleteSliderII(name,w,v,i,min,max,step,c,id){
    let full = document.createElement('div');
    full.className = "slider";
    w.appendChild(full);

    let title = document.createElement('div');
    title.innerText = name;
    full.appendChild(title);

    let slider = document.createElement('input');
    ///if(i == "volume" || i == "pan"){
    //    slider.id = i+""+id;
    //}
    slider.type = "range";
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = v[i];
    full.appendChild(slider);

    var valc = document.createElement('div');
	valc.className ="rangeValue";
	valc.innerText = v[i];
	slider.oninput = ()=>{
        //updateSliderText(slider);
        slider.nextElementSibling.innerText = slider.value;
        v[i]= parseFloat(slider.value);
    };
    full.appendChild(valc);
    //function updateSliderText(name){
    //    name.nextElementSibling.innerText = name.value;
    //}
}

function drawRadioSet(s,labels,w,opts,opt,c){
    let full = document.createElement('div');
    full.className = c;
    w.appendChild(full);

    let title = document.createElement('div');
    title.innerText = s;
    full.appendChild(title);

    let form = document.createElement('form');
    full.appendChild(form);

    for(let r =0; r<labels.length; r++){
        let radio = document.createElement('input');
        radio.type = "radio";
        radio.name = "radioTest"
        radio.className = "radioTest"
        let radioLabel = document.createElement('label');
        radioLabel.innerText = " "+labels[r]+" ";
       
        form.appendChild(radio);
        form.appendChild(radioLabel);
        radio.onclick = ()=>{
            opts[opt] = GetTrueOne(form,"radioTest");
        };
        if(r==opts[opt]){
            radio.checked = true;
        }
    }
}

function drawNumber(tit,obj, val, min, max, step, classname, where){
    let full = document.createElement('div');
    full.className = classname;
    where.appendChild(full);

    let title = document.createElement('div');
    title.innerText = tit;
    full.appendChild(title);

    let input = document.createElement('input');
    input.type = "number";
    input.step = step;
    input.min = min; input.max = max;
    input.value = obj[val];

    input.oninput = ()=>{
        obj[val] = parseFloat(input.value);
    };
    full.appendChild(input);
}

function drawFormant(obj,val,className,where,pa){
    //for(o in obj[val]){
        drawCompleteSliderII(":", where, obj[val], 0, 1,10000,0.1," ");
        drawCompleteSliderII(":", where, obj[val], 1, 0.00001,0.01,0.00001," ");
        drawCompleteSliderII(":", where, obj[val], 2, 0.01,2,0.01," ");
    //}
    let uidelbutton = document.createElement('BUTTON');
    uidelbutton.innerText = "X";
    uidelbutton.className = "button-x";
    //uidelbutton.style.float = "right";
    where.appendChild(uidelbutton);

    uidelbutton.addEventListener('click',()=>{
        delete obj[val]; //this trackEffects is a copy
        let test = obj.filter(function(){return true;})
        pa.list = test;
        where.remove();
    });
}

function drawHarmonic(obj,val,className,where,pa){
    //for(o in obj[val]){
        drawCompleteSliderII(":", where, obj[val], 0, 0.0001,1,0.0001," ");
        drawCompleteSliderII(":", where, obj[val], 1, 1,128,0.01," ");
        drawCompleteSliderII(":", where, obj[val], 2, 0,120,1," ");
    //}
    let uidelbutton = document.createElement('BUTTON');
    uidelbutton.innerText = "X";
    uidelbutton.className = "button-x";
    //uidelbutton.style.float = "right";
    where.appendChild(uidelbutton);

    uidelbutton.addEventListener('click',()=>{
        delete obj[val]; //this trackEffects is a copy
        let test = obj.filter(function(){return true;})
        pa.list = test;
        where.remove();
    });
}

//variation
function GetTrueOne(parent,rname){
    let options = parent.getElementsByClassName(rname);
    let t;
    for (t=0; t < options.length ; t++){
        if(options[t].checked==true){
            return t;
        }
    }
}

function drawCheckbox(o,w){
    let uipower = document.createElement('input');
    uipower.type="checkbox";
    uipower.checked = o.power;
    uipower.oninput = ()=>{
        o.power = uipower.checked;
    }
    w.appendChild(uipower)
}

function Track(){
    this.type = "TRACK";
    this.id = generateRandomId();
    this.volume = 0.5;
    this.pan = 0;
    this.position = -1;
    this.instrument = {
        envelope:{
            a: 0.2, d:0.3, s:0.5, r:0.5, l:0.5
        },
        //waveform: "sine",
        type: 0,
        generator: {
            simple : {
                waveform : 0
            },
            harmonics : {
                value : 2,
                list : [
                    [1,0.5,20]
                ]
            },
            formants : {
                harmonics : 20,
                bandwidth : 5,
                bwscale :1,
                attenuator : 1,
                list : [
                    [1,0.005,1]
                ]
            }
        }
    };
}

function EffectDelay(){
    this.type = "DELAY";
    this.power = true;
    this.position = -1;
    this.options = {
        delayTime: 0.2,
        delayFeedback:0.3,
        delayGain:0.5
    }
}

function EffectLFO(){
    this.type = "LFO";
    this.power = true;
    this.position = -1;
    this.options = {
        lfoSpeed: 100,
        lfoAmount:.5
    }
}

function EffectDistortion(){
    this.type = "DISTORTION";
    this.power = true;
    this.position = -1;
    this.options = {
        distortionAmount: 0.2,
        oversample: 2
    }
}

function EffectGain(){
    this.type = "GAIN";
    this.power = true;
    this.position = -1;
    this.options = {
        gainAmount: 0
    }
}

function NewFormant(){
    return [1,0.005,1];
}

function NewHarmonic(){
    return [1,1,20];
}

//some buttons like ADD TRACK, are always there, so we wait for loading and use them,
//others like ADD FX, are generated and configured on the fly
window.onload = function(){
    const savePresetButton = document.getElementById('save-preset');
    savePresetButton.addEventListener('click', function(){
        let jsn = JSON.stringify(session);
        let blob = new Blob([jsn]);
        let url = URL.createObjectURL(blob);
        savePresetButton.href = url;
        savePresetButton.download = "preset.JSON";
        //console.log(blob);
    });

    const addTrackButton = document.getElementById('add-track');
    addTrackButton.addEventListener('click', ()=>{
        let newTrack = new Track();
        session.tracks.push(newTrack)
        let tracksLength = session.tracks.length-1;
        session.tracks[tracksLength].position = tracksLength;
        //session.tracks[tracksLength].id = generateRandomId();
        drawTrack(newTrack,session.tracks);
        //session.tracks["track"+(globalTrackCount-1)] = baseTrack;
    });

    //load_i();
}

function setMasterAnalyser(){
    //let testCanvas = document.getElementById('meter0').getContext('2d');
    //drawToAnalyser(analyzerMaster, new Uint8Array(bufferLength),bufferLength,testCanvas);
}

function setTrackAnalyser(){
    drawToAnalyser(trackAnalysers[0][0], trackAnalysers[0][1],trackAnalysers[0][2],trackAnalysers[0][3]);
}

//AUDIO API///////////////////////////////////////////////////////////////////////////////////////////
//AUDIO API///////////////////////////////////////////////////////////////////////////////////////////
//AUDIO API///////////////////////////////////////////////////////////////////////////////////////////


window.AudioContext = window.AudioContext || window.webkitAudioContext;
const sessionCtx = new AudioContext();
/*
const master = sessionCtx.createGain();
master.gain.value=1;
const masterPan = sessionCtx.createStereoPanner();
masterPan.pan.value=0;

master.connect(masterPan);
masterPan.connect(sessionCtx.destination);*/

/*const analyzerMaster = sessionCtx.createAnalyser();
analyzerMaster.minDecibels = -50;
analyzerMaster.maxDecibels = 10;
analyzerMaster.smoothingTimeConstant = 0;

analyzerMaster.fftSize = 32;
master.connect(analyzerMaster);
const bufferLength = analyzerMaster.frequencyBinCount;*/
//const dataArray = new Uint8Array(bufferLength);


/*function setMaster(){//lazyassmf
    master.gain.value=session.tracks[0].volume;
    masterPan.pan.value=session.tracks[0].pan;
}*/

function drawToAnalyser(analyser,data,buffer,canvas) {
  let drawVisual = requestAnimationFrame(()=>{drawToAnalyser(analyser,data,buffer,canvas)});
  //console.log(analyser)
  //analyser.getByteFrequencyData(data);

  analyser.getFloatTimeDomainData(data);
  let sumSquares = 0.0;
  for(const amp of data){sumSquares+=amp*amp;}
  let val = Math.sqrt(sumSquares/data.length);

  canvas.fillStyle = 'rgb(94, 119, 106)';
  canvas.fillRect(0, 0, 100, 10);
  //let barWidth ;
  //let barHeight = 10;
  //let x = 0;
  //for(let i = 0; i < buffer; i++) {
    //barWidth = data[i]/2;
    canvas.fillStyle = 'rgba(0,0,0,1.0)';
    canvas.fillRect(0,0,val*100,10);
    //console.log(val)
  //}
};

//let trackNodes = [];
let trackAnalysers = [];
let trackSynths = [];
let tracksEffects = [];

let tracksChains = [];

function setTracks(){//tracks
    const tracks = session.tracks;
    //setTrackEffects(tracks[0]);
    for(let t = 0; t<tracks.length;t++){
        initTrack(tracks[t]);
        
        /*let trackAnalyser = sessionCtx.createAnalyser();
        trackAnalyser.fftSize = 1024;
        //trackAnalyser.minDecibels = -50;
        //trackAnalyser.maxDecibels = 10;
        //trackAnalyser.smoothingTimeConstant = 0;
        trackGain.connect(trackAnalyser);

        let canvas = document.getElementById('meter'+tracks[t].id).getContext('2d');
        //let bufferLength = trackAnalyser.frequencyBinCount;
        //trackAnalysers[t-1] = [trackAnalyser,new Uint8Array(bufferLength),bufferLength,canvas];
        
        trackAnalysers[t-1] = [trackAnalyser,new Float32Array(trackAnalyser.fftSize),trackAnalyser.fftSize,canvas]; 
        */
    }
}

function initTrack(track){
    //check 3d here probably
    const trackIn = sessionCtx.createGain();
    trackIn.gain.value = 1.0;

    const trackGain = sessionCtx.createGain();
    const trackPan = sessionCtx.createStereoPanner();

    

    trackGain.gain.value = track.volume;
    trackGain.connect(trackPan);
    document.getElementById('volume'+track.id).addEventListener('click', ()=>{
        trackGain.gain.value = track.volume;
    });

    trackPan.pan.value = track.pan;
    document.getElementById('pan'+track.id).addEventListener('click', ()=>{
        trackPan.pan.value = track.pan;
    });

    //test
    //trackIn.connect(trackGain);

    if(track.type=="TRACK"){
        //this can fail if master isnt init first, luckily it does
        trackPan.connect(tracksChains[0][0]);//master IN
        //CREATE INSTRUMENT
        const synthHarmonic = setHarmonicSynth(track);
        const synthFormant = setFormantsSynth(track);
        trackSynths.push([synthHarmonic,synthFormant,track.id]);
    }
    else if(track.type=="MASTER"){
        trackPan.connect(sessionCtx.destination);
    }
    //old
    //trackNodes.push([trackGain,track.id]);
    //new
    tracksChains.push([trackIn,trackGain,track.id]);

    setTrackEffects(track);
    //console.log(trackNodes);
}

function setTrackEffects(track){
    let effects = [];
    for(f in track.effects){
        let fx = track.effects[f];
        if(fx.power==false){
            let gain = sessionCtx.createGain();
            gain.gain.value = 1;
            effects[f] = [gain,gain];
        }else{
            switch(fx.type){
                case "DELAY":
                    let delay = sessionCtx.createDelay();
                    let feedback = sessionCtx.createGain();
                    let amount = sessionCtx.createGain();
                    amount.connect(delay);
                    delay.connect(feedback);
                    feedback.connect(delay);
    
                    let output = sessionCtx.createGain();
    
                    amount.connect(output);
                    delay.connect(output);
                    
                    delay.delayTime.setValueAtTime(fx.options.delayTime, 0);
                    feedback.gain.setValueAtTime(fx.options.delayFeedback, 0);
                    amount.gain.setValueAtTime(fx.options.delayGain, 0);
    
                    effects[f]=[amount,output];
                    break;
    
                case "GAIN":
                    let gain = sessionCtx.createGain();
                    gain.gain.value += (fx.options.gainAmount);
                    effects[f] = [gain,gain];
                    break;
    
                case "DISTORTION":
                    const distortion = sessionCtx.createWaveShaper();
                    distortion.curve = makeDistortionCurve(fx.options.distortionAmount);
                    let os = '';
                    switch(fx.options.oversample){
                        case 0: os = '4x'; break;
                        case 1: os = '2x'; break;
                        case 2: os = 'none'; break;
                        default: os = 'none'; break;
                    }
                    distortion.oversample = os;
    
                    effects[f]=[distortion,distortion]
                    break;
                default:
                    //console.log(track.effects[f].type);
                    break;
            }
        }
        
    }
    //tracksEffects[track.position] = [];
    //tracksEffects[track.position] = effects;
    //console.log(tracksEffects[track.position]);
    //chainTrackEffects(track);

    let trackChain = tracksChains.find(getTrackChain);
    function getTrackChain(t){
        if(t[2]==track.id){
            return t
        };
    }

    /*function getTrackNode(t){
        if(t[1]==track.id||t[2]==track.id){//wht t2?
            return t
        };
    }*/
    trackChain[0].disconnect();

    if(effects[0]!=null){
        //noteGain.connect(effects[0][0]);
        //new
        trackChain[0].connect(effects[0][0]);
        for(let f = 0; f<effects.length;f++){
            if(f==effects.length-1){
                //old
                //effects[f][1].connect(lastNode[0]);
                //new
                effects[f][1].connect(trackChain[1]);
            }else{
                effects[f][1].connect(effects[f+1][0]);
            }
        }
    }else{
        //old
        //const noteGain = sessionCtx.createGain();
        //tracksEffects[track.position][0] = [noteGain,noteGain];
        //noteGain.connect(lastNode[0]);

        //new
        //not for the master

        trackChain[0].connect(trackChain[1]);

    }
}

function setHarmonicSynth(track){
    let harmonics = [];
    //console.log(track)
    for(let i = 0; i<track.instrument.generator.harmonics.list.length;i++){
        harmonics.push([
            track.instrument.generator.harmonics.list[i][0],
            track.instrument.generator.harmonics.list[i][1],
            track.instrument.generator.harmonics.list[i][2]
        ]);
    }
    let synth = new PeriodicWaveInstrument(WaveTableGeneratorFromHarmonics(harmonics, track.instrument.generator.harmonics.value, 8192), 0.2);
    return synth;
}

function setFormantsSynth(track){
    let formants = [];
    //console.log(track)
    for(let i = 0; i<track.instrument.generator.formants.list.length;i++){
        formants.push([
            track.instrument.generator.formants.list[i][0],
            track.instrument.generator.formants.list[i][1],
            track.instrument.generator.formants.list[i][2]
        ]);
    }
    let synth = new PeriodicWaveInstrument(
        CreateWaveTablesFromFormants(formants, 
		track.instrument.generator.formants.harmonics, 
		track.instrument.generator.formants.attenuator,
		track.instrument.generator.formants.bandwidth,
		track.instrument.generator.formants.bwscale,
		16384), 0.2);

    return synth;
}

//why outside
//let osc;

function playNote(freq,trackID,nl){
    let osc;
    //console.log(freq,trackID);
    //this should be outside
    let track = session.tracks.find(checkID);
    function checkID(t){
        return t.id==trackID;
    }
    //let lastNode = trackNodes.find(getTrackNode);
    /*function getTrackNode(t){
        if(t[1]==trackID||t[2]==trackID){//wht t2?
            return t
        };
    }*/
    let synths = trackSynths.find(chainById);

    switch(track.instrument.type){
        case 0: 
            switch(track.instrument.generator.simple.waveform){
                case 0:
                    osc = sessionCtx.createOscillator();
                    osc.type = "sine";
                    osc.frequency.value = freq;
                    break;
                case 1:
                    osc = sessionCtx.createOscillator();
                    osc.type = "square";
                    osc.frequency.value = freq;
                    break;
                case 2:
                    osc = sessionCtx.createOscillator();
                    osc.type = "triangle";
                    osc.frequency.value = freq;					
                    break;
                case 3:
                    osc = sessionCtx.createOscillator();
                    osc.type = "sawtooth";
                    osc.frequency.value = freq;
                    break;
            };
            break;
        case 1: osc = synths[0].CreateOscillator(freq); break;
        case 2: osc = synths[1].CreateOscillator(freq); break
    }

    let attack = track.instrument.envelope.a;
    let decay = track.instrument.envelope.d;
    let sustain = track.instrument.envelope.s;
    let release = track.instrument.envelope.r;
    let noteLength = nl*.001;// track.instrument.envelope.l//nl*.0005;//nl*.001;
    //console.log(nl)

    let oscs = [];//???WHY
    let noteGain = sessionCtx.createGain();
    noteGain.gain.setValueAtTime(0, 0);
    noteGain.gain.linearRampToValueAtTime(sustain, sessionCtx.currentTime + noteLength * attack);
    noteGain.gain.setValueAtTime(sustain, sessionCtx.currentTime + noteLength - noteLength * release);
    noteGain.gain.linearRampToValueAtTime(0, sessionCtx.currentTime + noteLength); 

    //let osc = sessionCtx.createOscillator();
	//osc.type = "triangle";
	//osc.frequency.value = freq;
    osc.connect(noteGain);

    oscs.push(osc);

    //let effects = tracksEffects[track.position];

    /*
    for(f in track.effects){
        let fx = track.effects[f];
        if(fx.power==false)continue;
        switch(fx.type){
            case "DELAY":
                let delay = sessionCtx.createDelay();
                let feedback = sessionCtx.createGain();
                let amount = sessionCtx.createGain();
                amount.connect(delay);
                delay.connect(feedback);
                feedback.connect(delay);

                let output = sessionCtx.createGain();

                amount.connect(output);
                delay.connect(output);
                
                delay.delayTime.setValueAtTime(fx.options.delayTime, 0);
                feedback.gain.setValueAtTime(fx.options.delayFeedback, 0);
                amount.gain.setValueAtTime(fx.options.delayGain, 0);

                effects[f]=[amount,output];
                break;

            case "GAIN":
                let gain = sessionCtx.createGain();
                gain.gain.value += (fx.options.gainAmount);
                effects[f] = [gain,gain];
                break;
            /*case "LFO":
                let lfoGain = sessionCtx.createGain();
                lfoGain.gain.setValueAtTime(fx.options.lfoAmount, 0);
                lfoGain.connect(osc.frequency);

                let lfo = sessionCtx.createOscillator();
                lfo.frequency.setValueAtTime(fx.options.lfoSpeed, 0);
                lfo.connect(lfoGain);
                oscs.push(lfo);
                break;//*

            case "DISTORTION":
                const distortion = sessionCtx.createWaveShaper();
                distortion.curve = makeDistortionCurve(fx.options.distortionAmount);
                let os = '';
                switch(fx.options.oversample){
                    case 0: os = '4x'; break;
                    case 1: os = '2x'; break;
                    case 2: os = 'none'; break;
                    default: os = 'none'; break;
                }
                distortion.oversample = os;

                effects[f]=[distortion,distortion]
                break;
            default:
                //console.log(track.effects[f].type);
                break;
        }
    }*/

    //wrong
    /*if(effects[0]!=null){
        //console.log(effects)
        noteGain.connect(effects[0][0]);
        for(let f = 0; f<effects.length;f++){
            if(f==effects.length-1){
                effects[f][1].connect(lastNode[0]);
            }else{
                effects[f][1].connect(effects[f+1][0]);
            }
        }
    }else{
        noteGain.connect(lastNode[0]);
    }*/

    let trackChain = tracksChains.find(chainById);
    function chainById(t){
        if(t[2]==trackID){
            return t
        }
    }
    //new
    noteGain.connect(trackChain[0]);

    for(o in oscs){
        oscs[o].start(0);
        oscs[o].stop(sessionCtx.currentTime + noteLength);
    }
}




//MATH

function makeDistortionCurve(amount) {
    var k = typeof amount === 'number' ? amount : 50,
      n_samples = 44100,
      curve = new Float32Array(n_samples),
      deg = Math.PI / 180,
      i = 0,
      x;
    for ( ; i < n_samples; ++i ) {
      x = i * 2 / n_samples - 1;
      curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
    }
    return curve;
};


function informTrackIDs(){
    let ids = [];
    for(let i in session.tracks){
        if(i==0)continue;//ignore master
        ids[i]=session.tracks[i].id;
    }
    return ids;
}
/*
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
}*/

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
        let osc = sessionCtx.createOscillator();
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
    let result = sessionCtx.createPeriodicWave(real, imag, { disableNormalization: false });
    result.length = len;
    return result;
}



