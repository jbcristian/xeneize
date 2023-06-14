let canvas = document.getElementById('cvs'),
        ctx = canvas.getContext('2d'),
        guiFreq = document.getElementById('guiFreq'),
        guiRat = document.getElementById('guiRat'),
        guiStr = document.getElementById('guiStr'),
        guiLen = document.getElementById('guiLen');

    let strings = [], pitches = [];

    let cred = "#692c4d"; let cgrn = "#2c694d";

    let segments; let spiralSides; let spiralPad; let rs; let scale;

    function switchBase(ns) {
        let set = [];
        let b = ns[0];
        for (let i = 0; i < ns.length; i++) {
            set[i] = ns[i] / b;
        }
        return set;
    }

    function playHarmonicSequence(id) {
        let closed = getClosedOctave();
        let searchFor = inputRead('searchFor');
        let harmonicsList = [];
        (function(){
            for(x of searchFor){
                let v = closed[id-1]*x;
                harmonicsList.push(v);
            }
        })();
        let tol = document.getElementById('searchForTolerance').value;
        let sequenceList = [];
        for (let i = 0; i < closed.length; i++) {
            for (let h = 0; h < harmonicsList.length; h++) {
                if (Math.abs(closed[i] - harmonicsList[h]) <= tol) {
                    sequenceList.push(i);
                }
            }
        }
        stopSounds();
        playOrder(sequenceList);
        document.getElementById('sequence').value = sequenceList;
    }

    function getClosedOctave() { //former getFirstOctave
        let set = [...pitches];

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
        }
        return set;
    }

    function resetScale() { //this is for not thinking better at the begining.... strings and pitches are global, so when you change the amount of segments the scale gets broken
        for (let i = 0; i < strings.length; i++) {
            strings.pop();
            pitches.pop();
        }
    }

    function sequenceArpeggio(s){
        let d = inputRead('sequence');
        let dh = document.getElementById('sequence');
        let so = document.getElementById('sorder');
        switch(s){
            case "Up":
                d.sort(function(a, b){return b - a});
                dh.value = d;
                break;
            case "Down":
                d.sort(function(a, b){return a - b});
                dh.value = d;
                break;
            case "Converge":
                dh.value = converge(d.sort(function(a, b){return  a - b}));
                break;
            case "Diverge":
                dh.value = converge(d.sort(function(a, b){return  b - a}));
                break;
            case "Random":
                dh.value = random(d);
                break;
        }
        function converge(c){
            let nd = [];
            let h = c;
            let i = c.length;
            while(i>0){
                nd.push(h.pop());
                i--;
                if(i>0){
                    nd.push(h.shift());
                    i--;
                }
            }
            return nd;
        }

        function diverge(c){
            let k = converge(c);
            let n = [];
            for(let i =0;i<k.length;i++){
                n[i] = k.pop();
            }
            return n;
        }

        function random(c){
            let a = c.length;
            let n = [];
            for(let i=0;i<a;i++){
                let r = Math.random();
                if(r>=.5){
                    n.push(c.pop());
                }
                if(r<.5) {
                    n.push(c.shift());
                }
            }
            return n;
        }
    }

    function autoSettingsHF(s){
        let d = document.getElementById('searchFor');
        switch(s){
            case "Min":
                d.value = "1, 1.166, 1.5";
                break;
            case "Maj":
                d.value = "1, 1.25, 1.5";
                break;
            case "Dim":
                d.value = "1, 1.18920, 1.41421, 1.68179";
                break;
            case "Aug":
                d.value = "1,1.25992,1.58740";
                break;
            case "12EDO":
                d.value = "1.05946,1.12246,1.18920,1.25992,1.33483,1.41421,1.49830,1.58740,1.68179,1.78179,1.88774,2";
                break;
        }
    }

    function drawSpiralRect() {
        let points = [];

        ctx.clearRect(00, 00, 512, 512);

        segments = parseFloat(document.getElementById('segments').value);

        rs = parseFloat(document.getElementById('radius').value); //control size/zoom
        spiralSides = parseFloat(document.getElementById('sides').value);
        spiralPad = parseFloat(document.getElementById('spiralPad').value);

        if (document.querySelector(".string")) {
            let q = document.querySelectorAll(".string");
            for (let i = 0; i < q.length; i++) {
                q[i].remove();
            }
        }
        if (document.querySelector(".mark")) {
            let q = document.querySelectorAll(".mark");
            for (let i = 0; i < q.length; i++) {
                q[i].remove();
            }
        }
        if (document.querySelector(".mark12")) {
            let q = document.querySelectorAll(".mark12");
            for (let i = 0; i < q.length; i++) {
                q[i].remove();
            }
        }

        let radius = 0;
        let angle = 0;
        //ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = spiralSides == Math.round(spiralSides) ? cgrn : cred;
        ctx.moveTo(canvas.width / 2, canvas.height / 2);
        for (let n = 0; n <= segments; n++) {

            angle += (Math.PI * 2) / spiralSides;
            let x = canvas.width / 2 + radius * Math.cos(angle);
            let y = canvas.height / 2 + radius * Math.sin(angle);
            ctx.lineTo(x, y);//not really necesary to draw since at the end i was using divs... and deleting the drawing

            points[n] = [x - 256, y - 256];
            radius += rs;
            radius *= spiralPad;
            if (n > 0) {// n-1 dont exists at n=0
                let x1, x2, y1, y2;
                x1 = points[n - 1][0];
                x2 = points[n][0];
                y1 = points[n - 1][1];
                y2 = points[n][1];
                let dist = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
                strings[n - 1] = dist;
                //strings[n-1] = strings[n-1]/fString;
                createDiv(x, y, n, dist, angle + (Math.PI) / spiralSides);// the strings are created and hidden if they overflow, but they are all there
            }
        }
        //ctx.stroke();
        //ctx.closePath();
        drawRest(points);

        let fString = strings[0]; //

        for (let n = 0; n < strings.length; n++) {
            pitches[n] = (fString / strings[n]) * 1760 * 2; //this is to control the highest available pitch/ without the later multiplication
            if (document.getElementById(n + 1)) { //null check,,, +1 because ids starts from 1, setted when creating the div
                document.getElementById(n + 1).onmouseenter = function () {
                    if(document.getElementById('playWithMouse').checked){
                        //PlayNote(0, gNA, pitches[n], .5);
                        playTone(pitches[n] * 1., n + 1, 0);//it used to multiply the pitch here, *1 reminds it, just in case
                    }
                    light(n + 1);
                };
                document.getElementById(n + 1).onclick = function () {
                    playHarmonicSequence(n + 1);
                };
            }
        }
        scale = [];
        let largest = ((pitches[0]) / (pitches[segments - 1]));//the highest pitch ratio, that is the lowest numbered string id, 1
        for (let n = strings.length - 1; n >= 0; n--) {
            scale[n] = ((pitches[n]) / (pitches[segments - 1]));//
            createRulerMark(scale[n], largest,n + 1);
        }

        for(let n = 1;n<=largest; n*=2){
            createRuler12(largest/n, largest, n);
        }
        saveScala();
        //console.log(pitches)//final scale in hertz
    }

    function drawRest(points) {
        //if(Math.round(spiralSides)==spiralSides){
        //ctx.clearRect(00,00,512,512);
        ctx.beginPath();
        ctx.lineWidth = 1;
        let spiralSides = Math.round(parseFloat(document.getElementById('sides').value));
        let es = parseFloat(document.getElementById('sides').value) == spiralSides ? 2 : 1;
        ctx.strokeStyle = es == 2 ? cgrn : cred;
        for (let i = 0; i < segments - Math.floor(spiralSides); i++) {
            ctx.moveTo(points[i][0] + 256, points[i][1] + 256);
            ctx.lineTo(points[i + spiralSides][0] * es + 256, points[i + spiralSides][1] * es + 256);
            ctx.stroke();
        } ctx.closePath();
        //}
    }

    function createRulerMark(d, t,n) {
        let spiralSides = Math.round(parseFloat(document.getElementById('sides').value));
        let es = parseFloat(document.getElementById('sides').value) == spiralSides ? "#2c694d" : "#692c4d";
        let cent = Math.log2(d) * 1200;
        let centt = Math.log2(t) * 1200;
        let left = 10 + (((cent - 1) / (centt - 1)) * 512);
        let mark = document.createElement("div");
        mark.className = "mark";
        mark.id="m"+n;
        mark.style.position = "absolute";
        mark.style.left = left + "px";
        mark.style.width = "5px";
        mark.style.height = "10px";
        mark.style.backgroundColor = "none";
        mark.style.borderLeft = "1px solid";
        mark.style.borderLeftColor = es;
        document.getElementById("scaleGUI").appendChild(mark);
    }

    function createRuler12(d, t,n) {
        let cent = Math.log2(d) * 1200;
        let centt = Math.log2(t) * 1200;
        let left = 10 + (((cent - 1) / (centt - 1)) * 512);
        let mark = document.createElement("div");
        mark.className = "mark12";
        mark.id="e"+n;
        mark.style.position = "absolute";
        mark.style.top = "15px";
        mark.style.left = left + "px";
        mark.style.width = "5px";
        mark.style.height = "20px";
        mark.style.backgroundColor = "none";
        mark.style.borderLeft = "1px solid";
        mark.style.borderLeftColor = "#960";
        document.getElementById("scaleGUI").appendChild(mark);
    }

    function createDiv(x, y, n, d, a) {
        let spiralSides = Math.round(parseFloat(document.getElementById('sides').value));
        let es = parseFloat(document.getElementById('sides').value) == spiralSides ? "#2c694d" : "#692c4d";
        let box = document.createElement("div");
        box.className = "string";
        box.id = n;
        box.style.position = "absolute";
        box.style.transformOrigin = "0% 0% 0";
        box.style.transform = "rotate(" + a + "rad)"
        box.style.left = x + "px";
        box.style.top = y + "px";
        box.style.height = d + "px";
        box.style.width = "12px";
        box.style.backgroundColor = "none";
        box.style.borderLeft = "2px solid";
        box.style.borderLeftColor = es;
        box.style.borderBottomLeftRadius = "20px";
        box.style.borderTopLeftRadius = "20px";
        document.getElementById("sweb").appendChild(box);
    }

    function updateHighestPitch(){
        let pmult = parseFloat(document.getElementById('pmult').value);
        document.getElementById('highest-pitch-ui').innerText = (Math.round(1760 * 2*pmult*100)/100) + " Hz";
    }


    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    //let oscList = [];
    const masterVol = audioContext.createGain();
    masterVol.connect(audioContext.destination);
    masterVol.gain.value = 0.2;

    const volumeCtrl = document.querySelector("#volume-ctrl");
    volumeCtrl.addEventListener('input', function () {
        masterVol.gain.value = this.value;
    });

    let kmAttackTime = 0.05; let kmSustainLevel = 3.; let kmReleaseTime = 0.5; let kmNoteLength = 0.5;

    const kmAttackCtrl = document.querySelector('#km-attack-ctrl');
    const kmReleaseCtrl = document.querySelector('#km-release-ctrl');
    const kmNoteLengthCtrl = document.querySelector('#km-note-length-ctrl');

    kmAttackCtrl.addEventListener('input', function () {
        kmAttackTime = Number(this.value);
    });

    kmReleaseCtrl.addEventListener('input', function () {
        kmReleaseTime = Number(this.value);
    });

    kmNoteLengthCtrl.addEventListener('input', function () {
        kmNoteLength = Number(this.value);
    });

    let kmVibratoSpeed = 0; let kmVibratoAmount = 0;
    const kmVibratoAmountCtrl = document.querySelector('#km-vibrato-amount-ctrl');
    const kmVibratoSpeedCtrl = document.querySelector('#km-vibrato-speed-ctrl');

    kmVibratoAmountCtrl.addEventListener('input', function () {
        kmVibratoAmount = this.value;
    });

    kmVibratoSpeedCtrl.addEventListener('input', function () {
        kmVibratoSpeed = this.value;
    });

    const kmDelayAmountCtrl = document.querySelector('#km-delay-amount-ctrl');
    const kmDelayTimeCtrl = document.querySelector('#km-delay-time-ctrl');
    const kmFeedbackCtrl = document.querySelector('#km-feedback-ctrl');

    kmDelayAmountCtrl.addEventListener('input', function () {
        kmDelayAmountGain.gain.value = this.value;
    });

    kmDelayTimeCtrl.addEventListener('input', function () {
        kmDelay.delayTime.value = this.value;
    });

    kmFeedbackCtrl.addEventListener('input', function () {
        kmFeedback.gain.value = this.value;
    });

    const kmDelay = audioContext.createDelay();
    const kmFeedback = audioContext.createGain();
    const kmDelayAmountGain = audioContext.createGain();

    kmDelayAmountGain.connect(kmDelay);
    kmDelay.connect(kmFeedback);
    kmFeedback.connect(kmDelay);
    kmDelay.connect(masterVol);

    kmDelay.delayTime.value = .1;
    kmDelayAmountGain.gain.value = 0.5;
    kmFeedback.gain.value = 0.2;


    //////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////

    let sAttackTime = 0.1; let sSustainLevel = 2.; let sReleaseTime = 0.5; let sNoteLength = .6;

    const sAttackCtrl = document.querySelector('#s-attack-ctrl');
    const sReleaseCtrl = document.querySelector('#s-release-ctrl');
    const sNoteLengthCtrl = document.querySelector('#s-note-length-ctrl');

    sAttackCtrl.addEventListener('input', function () {
        sAttackTime = Number(this.value);
    });

    sReleaseCtrl.addEventListener('input', function () {
        sReleaseTime = Number(this.value);
    });

    sNoteLengthCtrl.addEventListener('input', function () {
        sNoteLength = Number(this.value);
    });

    let sVibratoSpeed = 0; let sVibratoAmount = 0;
    const sVibratoAmountCtrl = document.querySelector('#s-vibrato-amount-ctrl');
    const sVibratoSpeedCtrl = document.querySelector('#s-vibrato-speed-ctrl');

    sVibratoAmountCtrl.addEventListener('input', function () {
        sVibratoAmount = this.value;
    });

    sVibratoSpeedCtrl.addEventListener('input', function () {
        sVibratoSpeed = this.value;
    });

    const sDelayAmountCtrl = document.querySelector('#s-delay-amount-ctrl');
    const sDelayTimeCtrl = document.querySelector('#s-delay-time-ctrl');
    const sFeedbackCtrl = document.querySelector('#s-feedback-ctrl');

    sDelayAmountCtrl.addEventListener('input', function () {
        sDelayAmountGain.gain.value = this.value;
    });

    sDelayTimeCtrl.addEventListener('input', function () {
        sDelay.delayTime.value = this.value;
    });

    sFeedbackCtrl.addEventListener('input', function () {
        sFeedback.gain.value = this.value;
    });

    const sDelay = audioContext.createDelay();
    const sFeedback = audioContext.createGain();
    const sDelayAmountGain = audioContext.createGain();

    sDelayAmountGain.connect(sDelay);
    sDelay.connect(sFeedback);
    sFeedback.connect(sDelay);
    sDelay.connect(masterVol);

    sDelay.delayTime.value = .3;
    sDelayAmountGain.gain.value = 0.5;
    sFeedback.gain.value = 0.3;

    //////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////


    function playTone(freq, id, ins) {
        let pmult = parseFloat(document.getElementById('pmult').value);
        let sus, nl, att;
        let viba, vibs;
        let del;
        let inst;
    
        switch(ins){
            case 0:
                sus = kmSustainLevel;
                nl = kmNoteLength;
                att = kmAttackTime;
                rel = kmReleaseTime;
                viba = kmVibratoAmount;
                vibs = kmVibratoSpeed;
                del = kmDelayAmountGain;
                inst = 'waveform';
            break;
            case 1:
                sus = sSustainLevel;
                nl = sNoteLength;
                att = sAttackTime;
                rel = sReleaseTime;
                viba = sVibratoAmount;
                vibs = sVibratoSpeed;
                del = sDelayAmountGain;
                inst = 's-waveform';
            break;

        }

        switch(GetTrueOne(inst)){
            case 0:
                var osc = audioContext.createOscillator();
                osc.type = "sine";
                osc.frequency.value = freq * pmult;
                break;
            case 1:
                var osc = audioContext.createOscillator();
                osc.type = "square";
                osc.frequency.value = freq * pmult;
                break;
            case 2:
                var osc = audioContext.createOscillator();
                osc.type = "triangle";
                osc.frequency.value = freq * pmult;
                break;
            case 3:
                var osc = audioContext.createOscillator();
                osc.type = "sawtooth";
                osc.frequency.value = freq * pmult;
                break;
            case 4:
                var osc = gSS.CreateOscillator(freq*pmult);
                break;
            case 5:
                var osc = gNA.CreateOscillator(freq*pmult);
                break;
             case 6:
                var osc = createWebTimbre().CreateOscillator(freq*pmult);
                break;
        }

        let noteGain = audioContext.createGain();

        noteGain.gain.setValueAtTime(0, 0);
        noteGain.gain.linearRampToValueAtTime(sus, audioContext.currentTime + nl * att);
        noteGain.gain.setValueAtTime(sus, audioContext.currentTime + nl - nl * rel);
        noteGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + nl);

        lfoGain = audioContext.createGain();
        lfoGain.gain.setValueAtTime(viba, 0);
        lfoGain.connect(osc.frequency)

        lfo = audioContext.createOscillator();
        lfo.frequency.setValueAtTime(vibs, 0);
        lfo.start(0);
        lfo.stop(audioContext.currentTime + nl);
        lfo.connect(lfoGain);

        osc.start(0);
        osc.stop(audioContext.currentTime + nl);
        osc.connect(noteGain);

        noteGain.gain.value *= .1;
        //noteGain.connect(distortion).connect(masterVol);
        noteGain.connect(del);
        noteGain.connect(masterVol);
        
        guiStr.innerHTML = "N: " + (parseFloat(id) - 1);
        guiLen.innerHTML = "L: " + strings[id - 1];
        guiFreq.innerHTML = "F: " + freq * pmult + "Hz";
        guiRat.innerHTML = "R: " + scale[id - 1];

        if (id) { light(id); }
        if ("m"+(id)) { light("m"+(id)); }
    }

    function light(id) {
        document.getElementById(id).style.borderLeftColor = "#fff";
        setTimeout(reset, 100);
        function reset() {
            document.getElementById(id).style.borderLeftColor = getColor();
        }
    }

    function getColor() {
        let spiralSides = Math.round(parseFloat(document.getElementById('sides').value));
        let es = parseFloat(document.getElementById('sides').value) == spiralSides ? "#2c694d" : "#692c4d";
        return es;
    }

    function inputRead(r) {
        let inputNumbers = document.getElementById(r).value;
        inputNumbers = inputNumbers.split(",");
        return inputNumbers;
    }

    function GetTrueOne(rname){
        let options = document.getElementsByName(rname);
        let t;
        for (t=0; t < options.length ; t++){
            if(options[t].checked==true){
                return t;
            }
        }
    }

    let timer;
    function playOrder(s) {
        let notes = pitches;
        let cnote = 0;
        let speed = document.getElementById('seqSpeed').value;
        timer = setInterval(play, 1000-(99 * speed));
        let seq = s || inputRead("sequence");

        function play() {
            let x = seq[cnote % seq.length];
            playTone(notes[x], parseFloat(x) + 1, 1);
            cnote++;
        }
    }
    function stopSounds() {
        window.clearInterval(timer);
    }

    /*const distortion = audioContext.createWaveShaper();
    function makeDistortionCurve(amount) {
        let k = typeof amount === 'number' ? amount : 50,
            n_samples = 44100,
            curve = new Float32Array(n_samples),
            deg = Math.PI / 180,
            i = 0,
            x;
        for (; i < n_samples; ++i) {
            x = i * 2 / n_samples - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        return curve;
    };

    distortion.curve = makeDistortionCurve(0);
    distortion.oversample = '4x';

    const distortAmountControl = document.querySelector('#distort');
    distortAmountControl.addEventListener('input', function () {
        distortion.curve = makeDistortionCurve(this.value);
    });*/

    function playKeyboard(event) {
        let x = event.key;
        let sh = parseFloat(document.getElementById('noteShift').value);
        if (sh > document.getElementById('segments').value - 37) { //37 is to not go out of range searching notes,
            sh = document.getElementById('segments').value - 37;
        }
        if(document.getElementById('playWithKeyb').checked){
            switch (x) {
                case "0": playTone(pitches[0 + sh], 1 + sh,0); break;
                case "9": playTone(pitches[1 + sh], 2 + sh,0); break;
                case "8": playTone(pitches[2 + sh], 3 + sh,0); break;
                case "7": playTone(pitches[3 + sh], 4 + sh,0); break;
                case "6": playTone(pitches[4 + sh], 5 + sh,0); break;
                case "5": playTone(pitches[5 + sh], 6 + sh,0); break;
                case "4": playTone(pitches[6 + sh], 7 + sh,0); break;
                case "3": playTone(pitches[7 + sh], 8 + sh,0); break;
                case "2": playTone(pitches[8 + sh], 9 + sh,0); break;
                case "1": playTone(pitches[9 + sh], 10 + sh,0); break;
                case "P": playTone(pitches[10 + sh], 11 + sh,0); break;
                case "O": playTone(pitches[11 + sh], 12 + sh,0); break;
                case "I": playTone(pitches[12 + sh], 13 + sh,0); break;
                case "U": playTone(pitches[13 + sh], 14 + sh,0); break;
                case "Y": playTone(pitches[14 + sh], 15 + sh,0); break;
                case "T": playTone(pitches[15 + sh], 16 + sh,0); break;
                case "R": playTone(pitches[16 + sh], 17 + sh,0); break;
                case "E": playTone(pitches[17 + sh], 18 + sh,0); break;
                case "W": playTone(pitches[18 + sh], 19 + sh,0); break;
                case "Q": playTone(pitches[19 + sh], 20 + sh,0); break;
                case "L": playTone(pitches[20 + sh], 21 + sh,0); break;
                case "K": playTone(pitches[21 + sh], 22 + sh,0); break;
                case "J": playTone(pitches[22 + sh], 23 + sh,0); break;
                case "H": playTone(pitches[23 + sh], 24 + sh,0); break;
                case "G": playTone(pitches[24 + sh], 25 + sh,0); break;
                case "F": playTone(pitches[25 + sh], 26 + sh,0); break;
                case "D": playTone(pitches[26 + sh], 27 + sh,0); break;
                case "S": playTone(pitches[27 + sh], 28 + sh,0); break;
                case "A": playTone(pitches[28 + sh], 29 + sh,0); break;
                case "M": playTone(pitches[29 + sh], 30 + sh,0); break;
                case "N": playTone(pitches[30 + sh], 31 + sh,0); break;
                case "B": playTone(pitches[31 + sh], 32 + sh,0); break;
                case "V": playTone(pitches[32 + sh], 33 + sh,0); break;
                case "C": playTone(pitches[33 + sh], 34 + sh,0); break;
                case "X": playTone(pitches[34 + sh], 35 + sh,0); break;
                case "Z": playTone(pitches[35 + sh], 36 + sh,0); break;
            }
        }
        
    }

    let gNA = new PeriodicWaveInstrument(
        WaveTableGeneratorFromHarmonics([
            //amp  freq mult    bandw
            [1, 1, 20],
            [0.5, 8, 15],
            [0.25, 16, 15],
            [0.0125, 32, 15],
            [0.006125, 48, 15]
        ], 1, 8192), 0.2
    );

    function createWebTimbre(){
        let gTT = new PeriodicWaveInstrument(
            WaveTableGeneratorFromHarmonics(
                //amplitude  freq multiplier    bandwidth
                getWebHarmonics()
            , 1, 8192), 0.2
        );
        function getWebHarmonics(){
            let harms = [];
            for(let i=1;i<=segments;i++){
                harms.push([(1/i), scale[segments-i],1 ]);
            }
            return harms;
        }
        return gTT;
    }

    let gSS = new PeriodicWaveInstrument(
        CreateWaveTablesFromFormants([
            [500, 0.005, 1],
            [900, 0.0013, 1],
            [2100, 0.0005, 1],
            [3700, 0.00033, 1],
            [4700, 0.00025, 1]
        ], 64, 1, 50, 1, 16384), 0.1);

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
                    harm[1], bandwidthScale, harm[0], harm[2]);
            }
            return GenerateWaveWithRandomPhases(ampls);
        };
    }

    function PeriodicWaveInstrument(waveGenerator, volume) {
        //this.ADSR = adsr;
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

    function saveScala(){
        function getScale(){
            var string = "";
            //alert(scale.length)
            for(let i=scale.length;i>0;i--){
                string+="\n"+Math.floor(scale[i-1]*100000)+"/100000";
            }
            return string;
        }
        let name = "Spiral-"+spiralSides+"-"+segments+"-"+spiralPad;
        let sca = `! `+name+`.scl
! SpiralTuner 1.1
!
 `+name+`
 `+segments+`
!
`+getScale();+`
`;
                let s = sca;
        let blob = new Blob([s]);
        let url = URL.createObjectURL(blob);
        let link = document.getElementById('saveScaleA');
        link.href = url;
        link.download = name+".scl";
    }
