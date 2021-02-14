confirm("Join the room?")

const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get("user"), myID = urlParams.get("id"), roomCode = urlParams.get("room");

const peer = new Peer(myID, {
  secure: true,
  host: "connect-peer-server.herokuapp.com",
  port: 443
})

console.log(peer);

var myStream = "N/A", audioTracks, videoTracks;
async function getMyStream(peer) {
  myStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      sampleSize: 16,
      sampleRate: {min: 22050, ideal: 32000, max: 48000}
    }, 
    video: {
      width: {max: 640},
      height: {max: 480},
      frameRate: {min: 10, max: 15},
      facingMode: 'user'
    }
  });
  var vid = document.getElementById("myStream");
  vid.srcObject = myStream;
  vid.onloadedmetadata = (e) => {
      vid.play()
  };

  audioTracks = myStream.getAudioTracks();
  videoTracks = myStream.getVideoTracks();
}


async function makeCall(id, name) {
  if (myStream == "N/A") {
    console.log("getting stream"); 
    await getMyStream();
  };
  var call = peer.call(id, myStream, {
    metadata: { "username": username }
  });

  var vidEl = `<div class="vid-container"><div username="${name}"><video class="video-stream" id="${id}" autoplay></video></div></div>`;
  $(".vids-container").append(vidEl);
  call.on("stream", (stream) => {
    var vid = document.getElementById(id);
    vid.srcObject = stream;
    vid.onloadedmetadata = (e) => {
        vid.play()
    }
  })
}

makeCall(roomCode);

var lockout = false;
var hostConnection, hostName = "?";
peer.on("connection", (conn) => {
  conn.on("open", () => {
    console.log("Connected to host!");
    hostConnection = conn;
    
    conn.on("data", (data) => {
      console.log(data);
      if (typeof data === "object") {
        $("#host-name").html(data.user);
        $(`#${roomCode}`).parent().attr("username", data.user)
      }
      if (Array.isArray(data)) {
        let newPeer = data[0];
        let name = data[1];
        makeCall(newPeer, name);
      } 
      if (data == "LOCKED OUT FROM BUZZ") {
        lockout = true
      }
      if (data == "UNLOCKED FROM BUZZ") {
        lockout = false;
        clearBuzz();
      }
      if ((/\@\$CHAT/).test(data)) {
        var str = data;
        let msg = str.substr(6);
        $(".chat-messages").append(msg);
        $(".chat-messages").scrollTop(1E8);
      }
      if ((/\@\$REMOVE/).test(data)) {
        var str = data;
        let idToRemove = str.substr(8);
        $(`#${idToRemove}`).parent().parent().remove()
      }
    })
  })
})

function answerCall(call) {
  call.answer(myStream);
  let vidEl = `<div class="vid-container"><div username="${call.metadata.username}"><video class="video-stream" id="${call.peer}"></video><div></div>`;
  $(".vids-container").append(vidEl);
  call.on("stream", (stream) => {
    var vid = document.getElementById(call.peer);
    vid.srcObject = stream;
    vid.onloadedmetadata = (e) => {
        vid.play()
    }
  })
}

peer.on("call", (call) => {
  let name = call.metadata.username;
  console.log(name + " is calling!")
  answerCall(call)
})

function buzzAnimation() {
  $(".buzz-inner-button").css({
      "transform": "rotate(-55deg)",
      "border": "7px solid rgb(30,5,5)",
  });
  $(".buzz-inner-light").css("background-color", "lime")

  let timer = setTimeout(function() {
      $(".buzz-inner-button").css({
          "transform": "rotate(-55deg) translate(0, -4px)",
          "border": "6px solid maroon" 
      });
  }, 100)  
}

function clearBuzz() {
  $(".buzz-inner-light").css("background-color", "gray")
}