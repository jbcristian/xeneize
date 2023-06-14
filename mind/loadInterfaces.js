window.onload = function(){
/*
    const savePresetButton = document.getElementById('save-preset');
    savePresetButton.addEventListener('click', function(){
        let jsn = JSON.stringify(session);
        let blob = new Blob([jsn]);
        let url = URL.createObjectURL(blob);
        savePresetButton.href = url;
        savePresetButton.download = "preset.JSON";
        console.log(blob);
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
    });*/

    //let interfacesSelect = document.getElementById('interfaces');
    /*function getFile(elm){
        new Response(elm.files[0]).json().then(json =>{
            console.log(json);
        }, err => {
            //not json
        })
    }*/
    //style1
    load_i();
}
function load_i(){
    document.getElementById('interface-window').innerHTML = '<iframe src="simple-piano.html" width="500" height="300"></iframe>'
}