const app = Vue.createApp({
  data() {
    return {
      user: username,
      code: roomCode,
      chatboxShow: false,
      vidsContainerShow: true,
      muted: false,
      vidOff: false
    }
  },

  methods: {
    toggleChat() {
      this.chatboxShow = !this.chatboxShow;
      this.vidsContainerShow = !this.vidsContainerShow;
      $("#chat-toggle").blur();
      $("#chat-input").focus()
    },

    mute() {
      if (!this.muted) {
        audioTracks.forEach(track => track.enabled = false);
        this.muted = true;
      } else {
        audioTracks.forEach(track => track.enabled = true);
        this.muted = false;
      }
    },

    hideVid() {
      if (!this.vidOff) {
        videoTracks.forEach(track => track.enabled = false);
        this.vidOff = true;
      } else {
        videoTracks.forEach(track => track.enabled = true);
        this.vidOff = false;
      }
    },

    clearBuzzers() {
      acceptingBuzzes = true;
      for (openConn of openConnections) {
        openConn.send("UNLOCKED FROM BUZZ");
        console.log("sent unlock");
      };
      $("#frame-cover").hide();
      console.log("cleared buzzers");
    },

    sendChat() {
      let msg = `<div class="chat-message">${this.user}: ${$("#chat-input").val()}</div>`;
      for (openConn of openConnections) {
        openConn.send(`@$CHAT${msg}`);
      };
      $(".chat-messages").append(msg);
      $(".chat-messages").scrollTop(1E8);
      $("#chat-input").val("").focus()
    },

    resetFrame() {
      document.getElementById("hsquizbowl").src = document.getElementById("hsquizbowl").src
    }

  }
})

app.mount("#app")