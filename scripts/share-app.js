const urlParams = new URLSearchParams(window.location.search);
const hostName = urlParams.get("host"), roomCode = urlParams.get("code");

console.log(hostName, roomCode);

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
      host: hostName,
      username: "anon",
      joinRoomCode: roomCode
    }
  },

  methods: {
    joinRoom() {
      if ($("#username").val() !== "") {
        this.username = $("#username").val()
      };
      let user = encodeURIComponent(this.username);
      let room = encodeURIComponent(this.joinRoomCode);
      let id = encodeURIComponent(codeGen(12));
      window.location.href = `./guest.html?user=${user}&id=${id}&room=${room}`
    }
  }
})

app.mount("#app")