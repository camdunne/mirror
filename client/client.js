import getUserMedia from 'getusermedia';
import Peer from 'simple-peer';
import keys from './keys.js';

let resultArr = [];

// azure
const makeblob = function (dataURL) {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
        var parts = dataURL.split(',');
        var contentType = parts[0].split(':')[1];
        var raw = decodeURIComponent(parts[1]);
        return new Blob([raw], { type: contentType });
    }
    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
}
// opens camera
getUserMedia({ video: true, audio: false }, function (err, stream) {
  if (err) return console.error(err)
  var peer = new Peer({
    initiator: location.hash === '#init',
    trickle: false,
    stream: stream
  })
  peer.on('error', function (err) { console.error(err)});
  peer.on('signal', function (data) {
    document.getElementById('yourId').value = JSON.stringify(data)
    console.log(JSON.stringify(data))
  })
  console.log(document.getElementById('connect'))
  const connect = document.getElementById('connect');
  if(connect){
    connect.addEventListener('click', function () {
      var otherId = JSON.parse(document.getElementById('otherId').value)
      console.log(otherId)
      peer.signal(otherId)
    })
  }
  const send = document.getElementById('send');
  if(send){
    send.addEventListener('click', function () {
      var yourMessage = document.getElementById('yourMessage').value
      peer.send(yourMessage)
    })
  }
  peer.on('data', function (data) {
    document.getElementById('messages').textContent += data + '\n'
  })

  peer.on('stream', function (stream) {
    var video = document.createElement('video')
    video.setAttribute("id", "video");
    document.body.appendChild(video)

    video.src = window.URL.createObjectURL(stream)
    video.play()
  })
})

var video, $output;
var scale = 0.25;
$output = $("#output");

const captureImage = function() {
  video = document.getElementById('video')
    var canvas = document.createElement("canvas");
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;
    canvas.getContext('2d')
          .drawImage(video, 0, 0, canvas.width, canvas.height);

    var img = document.createElement("img");
    img.src = canvas.toDataURL();
    // $output.prepend(img);
    // Request parameters.
    var settings = {
      "url": "https://eastus2.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=emotion",
      "method": "POST",
      "headers": {
        "ocp-apim-subscription-key": keys.subKey,
        "content-type": "application/octet-stream"

      },
      "processData": false,
      "data": makeblob(img.src)
    }

    $.ajax(settings).done(function (response) {
      resultArr.push(response[0])
      console.log(resultArr);
    });
};
//https://[location].api.cognitive.microsoft.com/face/v1.0/detect[?returnFaceId][&returnFaceLandmarks][&returnFaceAttributes]
setInterval(function(){
    if(document.getElementById('video') && location.hash === '#init'){
      captureImage()
    } else if(location.hash === '#init'){
      console.log("Loading video")
    }
  },1500);
