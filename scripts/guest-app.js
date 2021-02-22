const app = Vue.createApp({
  data() {
    return {
      user: username,
      host: hostName,
      code: roomCode,
      join: false,
      connected: false,
      chatboxShow: true
    }
  },

  methods: {
    joinRoom() {
      this.join = true;
      getConnected()
    },

    toggleChat() {
      this.chatboxShow = !this.chatboxShow;
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

    sendChat() {
      let msg = $("#chat-input").val();
      hostConnection.send(msg);
      $("#chat-input").val("").focus()
    },
  }
})

app.mount("#app")