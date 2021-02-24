const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get("user"), roomCode = urlParams.get("room");

const peer = new Peer(roomCode, {
  secure: true,
  host: "connect-peer-server.herokuapp.com",
  port: 443
})

console.log(peer);

var openConnections = [];
var acceptingBuzzes = true;

function getConnected() {
  peer.on("connection", (conn) => {
    var peerID = conn.peer;
    conn.on("open", () => {
      conn.send({ "user": username });
      openConnections.push(conn);
      let joinMsg = `<div class="chat-message"><i>${conn.metadata.username} joined the room!</i></div>`;
      for (openConn of openConnections) {
        openConn.send(`@$CHAT${joinMsg}`);
      };
      $(".chat-messages").append(joinMsg);
      $(".chat-messages").scrollTop(1E8);
    })

    // Fielding buzzes
    conn.on("data", (data) => {
      if (Array.isArray(data) && acceptingBuzzes == true) {
        acceptingBuzzes = false;
        for (openConn of openConnections) {
          if (openConn.peer == peerID) {
            openConn.send("@$YOU BUZZED");
          } else {
            openConn.send("@$LOCKED OUT FROM BUZZ");
          }
          openConn.send(`@$CHAT<div class="chat-message"><i>${conn.metadata.username} buzzed!</i></div>`);
          console.log("sent lockout");
        };

        $("#team-1-buzzer").trigger('play').prop('currentTime', 0);
        $("#frame-cover").show();
        $("#who-buzzed").html(`${conn.metadata.username}`);
        $(".chat-messages").append(`<div class="chat-message"><i>${conn.metadata.username} buzzed!</i></div>`);
        $(".chat-messages").scrollTop(1E8);
        
      } 

      // Fielding chat msgs
      if (!Array.isArray(data)) {
        let msg = `<div class="chat-message">${conn.metadata.username}: ${data}</div>`;
        for (openConn of openConnections) {
          openConn.send(`@$CHAT${msg}`);
        };
        $(".chat-messages").append(msg);
        $(".chat-messages").scrollTop(1E8);
      }
    })

    // On disconnect
    conn.on("close", () => {
      console.log("conn closed");
      for (var x = 0; x < openConnections.length; x++) {
        let openConn = openConnections[x];
        if (openConn.peer == peerID) {
          openConn.close();
          openConnections.splice(x, 1)
        }
      };
      let closeMsg = `<div class="chat-message"><i>${conn.metadata.username} disconnected!</i></div>`;
      for (openConn of openConnections) {
        openConn.send(`@$CHAT${closeMsg}`);
      };
      $(".chat-messages").append(closeMsg);
      $(".chat-messages").scrollTop(1E8);
    });

    conn.on("error", () => {
      console.log("conn error");
      for (var x = 0; x < openConnections.length; x++) {
        let openConn = openConnections[x];
        if (openConn.peer == peerID) {
          openConn.close();
          openConnections.splice(x, 1)
        }
      };
      let closeMsg = `<div class="chat-message"><i>${conn.metadata.username} disconnected!</i></div>`;
      for (openConn of openConnections) {
        openConn.send(`@$CHAT${closeMsg}`);
      };
      $(".chat-messages").append(closeMsg);
      $(".chat-messages").scrollTop(1E8);
    })
  })
}

window.addEventListener('beforeunload', function (e) {
  e.preventDefault();
  e.returnValue = '';
});

window.onunload = function() {
  for (openData of openConnections) {
    openData.close()
  };
  peer.destroy()
}