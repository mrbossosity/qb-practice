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
      // sampleSize: 16,
      // sampleRate: {ideal: 32000, max: 44000},
      echoCancellation: true,
      noiseSuppression: true
    }, 
    video: {
      width: {max: 640},
      height: {max: 480},
      frameRate: {ideal: 10, max: 15},
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
  var vidEl = `<div class="vid-container"><div username="${call.metadata.username}"><video class="video-stream" id="${call.peer}"></video></div></div>`;
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
  var peerID = call.peer;
  var conn = peer.connect(peerID);
  console.log(call.metadata.username + " joined the call!");
  conn.on("open", () => {
    console.log(`opened connection with ${peerID}`);
    conn.send({ "user": username });
    openConnections.forEach(openConn => {
      console.log("sent new peer ID");
      openConn.send([peerID, call.metadata.username]);
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

  // On disconnect
  conn.on("close", () => {
    console.log("conn closed");
    let streamToKill = document.getElementById(`${peerID}`).srcObject;
    streamToKill.getTracks().forEach(track => track.stop());
    $(`#${peerID}`).parent().parent().remove();
    conn.close();

    for (var x = 0; x < openConnections.length; x++) {
      if (openConnections[x].peer == peerID) {
        openConnections.splice(x, 1)
      }
    };
    for (openConn of openConnections) {
      openConn.send(`@$REMOVE${peerID}`)
      console.log("told conn to delete video");
    }
  });

  conn.on("error", () => {
    console.log("conn error");
    let streamToKill = document.getElementById(`${peerID}`).srcObject;
    streamToKill.getTracks().forEach(track => track.stop());
    $(`#${peerID}`).parent().parent().remove();

    for (var x = 0; x < openConnections.length; x++) {
      if (openConnections[x].peer == peerID) {
        openConnections.splice(x, 1)
      }
    }
    for (openConn of openConnections) {
      openConn.send(`@$REMOVE${peerID}`);
      console.log("told conn to delete video");
    }
  })
}

peer.on("call", (call) => {
  answerCall(call);
  makeConnection(call);
  call.on("close", () => {
    call.close()
  })
})