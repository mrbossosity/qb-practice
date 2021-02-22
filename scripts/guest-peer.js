const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get("user"), myID = urlParams.get("id"), roomCode = urlParams.get("room");

const peer = new Peer(myID, {
  secure: true,
  host: "connect-peer-server.herokuapp.com",
  port: 443
})

console.log(peer);

var lockout = false;
var hostName = "?";
var hostConnection;

function getConnected() {
  hostConnection = peer.connect(roomCode, {
    metadata: { "username": username }
  });

  hostConnection.on("open", () => {
    hostConnection.on("data", (data) => {
      if (typeof data === "object") {
        $(".supreme-container").css("visibility", "visible")
        $("#host-name").html(data.user);
      }
      if (data == "@$LOCKED OUT FROM BUZZ") {
        lockout = true
      }
      if (data == "@$UNLOCKED FROM BUZZ") {
        lockout = false;
        clearBuzz();
      }
      if ((/\@\$CHAT/).test(data)) {
        var str = data;
        let msg = str.substr(6);
        $(".chat-messages").append(msg);
        $(".chat-messages").scrollTop(1E8);
      }
    })
  
    hostConnection.on("close", () => {
      alert("Host ended the meeting!");
      window.history.back()
    });
    hostConnection.on("error", () => {
      alert("Host ended the meeting!");
      window.history.back()
    })
  })
}

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

window.addEventListener('beforeunload', function (e) {
  e.preventDefault();
  e.returnValue = '';
});

window.onunload = function() {
  for (openConn of openMediaConnections) {
    openConn.close()
  }
  peer.destroy()
}