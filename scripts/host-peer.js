const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get("user"), roomCode = urlParams.get("room");

const peer = new Peer(roomCode, {
  secure: true,
  host: "connect-peer-server.herokuapp.com",
  port: 443
})

console.log(peer);

var myStream, audioTracks, videoTracks;
async function getMyStream(peer) {
  myStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      sampleSize: 16,
      sampleRate: {min: 22050, ideal: 32000, max: 48000}
    }, 
    video: {
      width: {min: 240, ideal: 720, max: 720 },
      height: {min: 180, ideal: 540, max: 720},
      frameRate: {min: 12, ideal: 24, max: 30},
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

getMyStream();

var openConnections = [];
var acceptingBuzzes = true;

function answerCall(call) {
  call.answer(myStream);
  var vidEl = `<div class="vid-container"><div username="${call.metadata.username}"><video class="video-stream" id="${call.peer}" autoplay></video></div></div>`;
  $(".vids-container").append(vidEl);
  call.on("stream", (stream) => {
    var vid = document.getElementById(call.peer);
    vid.srcObject = stream;
    vid.onloadedmetadata = (e) => {
        vid.play()
    }
  })
}

function makeConnection(call) {
  var conn = peer.connect(call.peer);
  alert(call.metadata.username + " joined the call!");
  conn.on("open", () => {
    console.log(`opened connection with ${call.peer}`);
    conn.send({ "user": username});
    openConnections.forEach(openConn => {
      console.log("sent new peer ID");
      openConn.send([call.peer, call.metadata.username]);
    })
    openConnections.push(conn)
  })

  // Fielding buzzes
  conn.on("data", (data) => {
    if (Array.isArray(data) && acceptingBuzzes == true) {
      acceptingBuzzes = false;
      for (openConn of openConnections) {
        console.log("sent lockout");
        openConn.send("LOCKED OUT FROM BUZZ")
      };
      $("#frame-cover").show();
      $("#who-buzzed").html(`${call.metadata.username}`)
      $("#team-1-buzzer").trigger('play').prop('currentTime', 0);
    } else {
      // fielding chat msgs
      let msg = `<div class="chat-message">${call.metadata.username}: ${data}</div>`;
      for (openConn of openConnections) {
        openConn.send(`@$CHAT${msg}`);
      };
      $(".chat-messages").append(msg)
    }
  })
}

peer.on("call", (call) => {
  answerCall(call);
  makeConnection(call)
})