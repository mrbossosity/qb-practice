const app = Vue.createApp({
  data() {
    return {
      user: username,
      host: hostName,
      code: roomCode,
      chatboxShow: false,
      buzzerShow: true,
      muted: false,
      vidOff: false
    }
  },

  methods: {
    toggleChat() {
      this.chatboxShow = !this.chatboxShow;
      this.buzzerShow = !this.buzzerShow
    },

    buzz() {
      console.log(lockout);
      if (lockout == false) {
        let bzz = ["BZZ"]
        hostConnection.send(bzz);
        $("#team-1-buzzer").trigger('play').prop('currentTime', 0);
        buzzAnimation()
      }
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

    sendChat() {
      let msg = $("#chat-input").val();
      hostConnection.send(msg);
      $("#chat-input").val("").focus()
    },
  }
})

app.mount("#app")