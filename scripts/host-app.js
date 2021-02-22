const app = Vue.createApp({
  data() {
    return {
      user: username,
      code: roomCode,
      join: false,
      chatboxShow: true,
      tabTwo: false
    }
  },

  methods: {
    joinRoom() {
      this.join = true;
      getConnected(this.connected)
    },
    
    toggleChat() {
      this.chatboxShow = !this.chatboxShow;
      $("#chat-toggle").blur();
      $("#chat-input").focus()
    },

    clearBuzzers() {
      acceptingBuzzes = true;
      for (openConn of openConnections) {
        openConn.send("@$UNLOCKED FROM BUZZ");
        openConn.send(`@$CHAT<div class="chat-message"><hr></div>`)
        console.log("sent unlock");
      };
      $("#frame-cover").hide();
      $(".chat-messages").append(`<div class="chat-message"><hr></div>`);
      $(".chat-messages").scrollTop(1E8);
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
      document.getElementById("hsquizbowl").src = document.getElementById("hsquizbowl").src;
      document.getElementById("hsquizbowl-2").src = document.getElementById("hsquizbowl-2").src;
    },

    switchTab() {
      this.tabTwo = !this.tabTwo
    }

  }
})

app.mount("#app")