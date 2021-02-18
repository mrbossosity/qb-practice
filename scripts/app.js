function codeGen(length) {
  var digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  var id = '', x = 0;
  while (x < length) { 
      let digit = digits[Math.floor(Math.random() * digits.length)];
      id += digit;
      x ++
  }
  return id
}


const app = Vue.createApp({
  data() {
    return {
      welcomeModalShow: true,
      createModalShow: false,
      joinModalShow: false,
      username: "anon",
      roomCode: null,
      joinRoomCode: null,
    }
  },

  methods: {
    showCreateModal() {
      this.welcomeModalShow = false;
      this.createModalShow = true;
      this.roomCode = codeGen(6);
      if ($("#username").val() !== "") {
        this.username = $("#username").val()
      };
      let shareableLink = `https://mrbossosity.github.io/qb-practice/share.html?host=${this.username}&code=${this.roomCode}`;
      $("#link-hidden").val(shareableLink);
      new ClipboardJS("#copy-link")
    },

    showJoinModal() {
      this.welcomeModalShow = false;
      this.joinModalShow = true;
      if ($("#username").val() !== "") {
        this.username = $("#username").val()
      };
    },

    back() {
      this.createModalShow = false;
      this.joinModalShow = false;
      this.welcomeModalShow = true;
    },

    createRoom() {
      let user = encodeURIComponent(this.username);
      let room = encodeURIComponent(this.roomCode)
      window.location.href = `./host.html?user=${user}&room=${room}`
    },

    copyLink() {
      alert("Link copied to clipboard!")
    },

    joinRoom() {
      let user = encodeURIComponent(this.username);
      let room = encodeURIComponent(this.joinRoomCode);
      let id = encodeURIComponent(codeGen(12));
      if (room.length < 6) {
        alert("That's not a valid code!");
        return
      } 
      window.location.href = `./guest.html?user=${user}&id=${id}&room=${room}`
    }
  }
})

app.mount("#app")