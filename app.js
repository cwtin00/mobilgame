console.log(firebase);

const countdownScreen = document.getElementById("countdownScreen");
const countdownText = document.getElementById("countdownText");

let currentPhase = "";
let phaseLocked = false;
let gamePhaseListenerActive = false;


const vampireTeam = document.getElementById("vampireTeam");

const nightScreen = document.getElementById("nightScreen");
const nightTitle = document.getElementById("nightTitle");
const nightSubtitle = document.getElementById("nightSubtitle");
const nightTimer = document.getElementById("nightTimer");

const voteScreen = document.getElementById("voteScreen");
const votePlayers = document.getElementById("votePlayers");
const voteTimer = document.getElementById("voteTimer");
const voteResult = document.getElementById("voteResult");

const winScreen = document.getElementById("winScreen");
const winTitle = document.getElementById("winTitle");
const restartGameBtn = document.getElementById("restartGameBtn");

const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");

const playerNameInput = document.getElementById("playerName");
const roomCodeInput = document.getElementById("roomCodeInput");

const lobby = document.getElementById("lobby");
const roomCodeText = document.getElementById("roomCodeText");
const playerList = document.getElementById("playerList");

const leaveBtn = document.getElementById("leaveBtn");

const sendBtn = document.getElementById("sendBtn");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

const roleScreen = document.getElementById("roleScreen");
const roleTitle = document.getElementById("roleTitle");
const roleDescription = document.getElementById("roleDescription");
const continueBtn = document.getElementById("continueBtn");

const startGameBtn = document.getElementById("startGameBtn");

const confirmLeave =
document.getElementById("confirmLeave");

const cancelLeaveBtn =
document.getElementById("cancelLeaveBtn");

const confirmLeaveBtn =
document.getElementById("confirmLeaveBtn");

const gameScreen = document.getElementById("gameScreen");
const phaseText = document.getElementById("phaseText");
const alivePlayers = document.getElementById("alivePlayers");
const gameMessages = document.getElementById("gameMessages");
const gameChatInput = document.getElementById("gameChatInput");
const gameSendBtn = document.getElementById("gameSendBtn");

let currentRoom = null;
let currentPlayerName = null;
let currentPlayerKey = null;
let currentRole = null;
let roleShown = false;
let isHost = false;

let countdownRunning = false;
let doctorPhaseRunning = false;
let vampirePhaseRunning = false;
let votingRunning = false;

let doctorInterval = null;
let vampireInterval = null;
let voteInterval = null;

function clearAllGameTimers(){

    if(doctorInterval){
        clearInterval(doctorInterval);
        doctorInterval = null;
    }

    if(vampireInterval){
        clearInterval(vampireInterval);
        vampireInterval = null;
    }

    if(voteInterval){
        clearInterval(voteInterval);
        voteInterval = null;
    }

    doctorPhaseRunning = false;
    vampirePhaseRunning = false;
    votingRunning = false;
}


let phaseListenerStarted = false;
let readyListenerStarted = false;
let votesListenerStarted = false;

function generateRoomCode() {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
}

createRoomBtn.addEventListener("click", () => {

    const playerName = playerNameInput.value.trim();

    if (playerName === "") {

        showToast("⚠ İsim gir");

        return;

    }

    currentPlayerName = playerName;

    const roomCode = generateRoomCode();

    firebase.database().ref("rooms/" + roomCode).set({
        gameStarted: false,
        phase: "lobby",
        countdown: false,
        votes: null,
        protectedPlayer: null,
        killedPlayer: null,
        winner: null,
        players: {
            host: {
                name: playerName,
                dead: false,
                role: null,
                ready: false
            }
        }
    });

    currentPlayerKey = "host";
    isHost = true;

    openLobby(roomCode);
});

const bgMusic =
document.getElementById("bgMusic");

const countSound =
document.getElementById("countSound");

const healSound =
document.getElementById("healSound");

const killSound =
document.getElementById("killSound");

const deathSound =
document.getElementById("deathSound");

const tickSound =
document.getElementById("tickSound");

const winSound =
document.getElementById("winSound");

const vampireWakeSound =
document.getElementById("vampireWakeSound");

joinRoomBtn.addEventListener("click", () => {
    const playerName = playerNameInput.value.trim();
    const roomCode = roomCodeInput.value.trim().toUpperCase();

if (playerName === "" || roomCode === "") {

    showToast("⚠ Tüm bilgileri doldur");

    return;

}
    currentPlayerName = playerName;

    firebase.database().ref("rooms/" + roomCode).once("value", (roomSnapshot) => {
if (!roomSnapshot.exists()) {

    showToast("❌ Böyle bir oda bulunamadı");

    return;

}

        const roomData = roomSnapshot.val();

if (roomData.gameStarted) {

    showToast("🎮 Oyun başladı");

    return;

}

        const playersRef = firebase.database().ref("rooms/" + roomCode + "/players");

        playersRef.once("value", (snapshot) => {
            const data = snapshot.val();

            if (data) {
                const alreadyExists = Object.values(data).some(
                    player => player.name.toLowerCase() === playerName.toLowerCase()
                );

if (alreadyExists) {

    showToast("⚠ Bu isim zaten odada kullanılıyor");

    return;

}
            }

            const newPlayerRef = playersRef.push();
            currentPlayerKey = newPlayerRef.key;

            newPlayerRef.set({
                name: playerName,
                dead: false,
                role: null,
                ready: false
            });

            openLobby(roomCode);
        });
    });
});

function showToast(message){

    const toast =
    document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(window.toastTimeout);

    window.toastTimeout =
    setTimeout(()=>{

        toast.classList.remove("show");

    },2500);

}

function openLobby(roomCode) {

    currentRoom = roomCode;

    lobby.classList.remove("hidden");
    roomCodeText.textContent = roomCode;

    firebase.database()
    .ref("rooms/" + roomCode + "/players")
    .on("value", (snapshot) => {

        playerList.innerHTML = "";

        const data = snapshot.val();

        if (data) {

            Object.entries(data).forEach(([key, player]) => {

                const li =
                document.createElement("li");

                li.classList.add("player-item");

                const nameSpan =
                document.createElement("span");

                nameSpan.textContent =
                player.name;

                li.appendChild(nameSpan);

                if (
                    isHost &&
                    player.name !== currentPlayerName
                ) {

                    const kickBtn =
                    document.createElement("button");

                    kickBtn.textContent = "❌";

                    kickBtn.classList.add("kick-btn");

                    kickBtn.addEventListener("click", () => {

                        firebase.database()
                        .ref(
                            "rooms/" +
                            currentRoom +
                            "/players/" +
                            key
                        )
                        .remove();

                    });

                    li.appendChild(kickBtn);

                }

                playerList.appendChild(li);

            });

        }

    });

    firebase.database()
    .ref(
        "rooms/" +
        roomCode +
        "/players/" +
        currentPlayerKey
    )
.on("value", (snapshot) => {

    if (!snapshot.exists()) {

        showToast("⚠ Oda sahibi seni odadan çıkarttı");

        setTimeout(()=>{

            location.reload();

        },1500);

        return;

    }

        const data = snapshot.val();

        if (data && data.role && !roleShown) {

            roleShown = true;

            currentRole = data.role;

            roleScreen.classList.remove("hidden");

            nightScreen.classList.add("hidden");
            voteScreen.classList.add("hidden");

            roleTitle.textContent = data.role;

            if (data.role === "Vampir") {

                roleTitle.style.color =
                "#ff1e1e";

                roleDescription.textContent =
                "Gece köylülere saldır.";

                setTimeout(() => {

                    loadVampireTeam();

                }, 400);

            }

            else if (data.role === "Doktor") {

                roleTitle.style.color =
                "#00d26a";

                roleDescription.textContent =
                "Bir kişiyi koru.";

                vampireTeam.innerHTML = "";

            }

            else {

                roleTitle.style.color =
                "white";

                roleDescription.textContent =
                "Vampiri bul.";

                vampireTeam.innerHTML = "";

            }

        }

    });

    firebase.database()
    .ref("rooms/" + roomCode + "/countdown")
    .on("value", (snapshot) => {

        const started = snapshot.val();

        if (
            started &&
            !countdownRunning
        ) {

            runCountdown();

        }

    });

    firebase.database()
    .ref("rooms/" + roomCode + "/winner")
    .on("value", (snapshot) => {

        const winner = snapshot.val();

        if (!winner) return;

        voteScreen.classList.add("hidden");
        nightScreen.classList.add("hidden");
        roleScreen.classList.add("hidden");
        countdownScreen.classList.add("hidden");

        winScreen.classList.remove("hidden");
        winSound.currentTime = 0;

        winSound.play();

        winTitle.textContent =
        winner;

    });

    firebase.database()
    .ref("rooms/" + roomCode + "/nightResult")
    .on("value",(snapshot)=>{

        const result = snapshot.val();

        if(!result) return;

        nightSubtitle.textContent =
        result;
        if(
    result.includes("öldürüldü") ||
    result.includes("ASILDI")
){

    deathSound.currentTime = 0;

    deathSound.play();

}

    });

    loadChat();

    firebase.database()
.ref("rooms/" + roomCode + "/voteResultText")
.on("value",(snapshot)=>{

    const result = snapshot.val();

    if(!result) return;

    voteResult.innerHTML = `
        <h2 style="
            color:#ff2b2b;
            margin-top:20px;
        ">
            ${escapeHTML(result)}
        </h2>
    `;

});

    listenGamePhase();

}

function listenGamePhase(){

    if(gamePhaseListenerActive) return;

    gamePhaseListenerActive = true;

    firebase.database()
    .ref("rooms/" + currentRoom + "/phase")
    .on("value",(snapshot)=>{

        const phase = snapshot.val();

        if(!phase) return;

        if(currentPhase === phase){
            return;
        }

        currentPhase = phase;

        console.log("PHASE CHANGED:", phase);

        clearAllGameTimers();

        disableSelections();

        phaseLocked = false;

        if(phase === "doctor"){

            startDoctorPhase();

        }

        else if(phase === "vampire"){

            startVampirePhase();

        }

        else if(phase === "vote"){

            startVotingPhase();

        }

        else if(phase === "result"){

            voteScreen.classList.add("hidden");

            nightScreen.classList.remove("hidden");

        }

        else if(phase === "ended"){

            clearAllGameTimers();

        }

        else if(phase === "lobby"){

            resetScreensToLobby();

        }

    });

}

leaveBtn.addEventListener("click", () => {
    if (currentRoom && currentPlayerKey) {
        firebase.database()
        .ref("rooms/" + currentRoom + "/players/" + currentPlayerKey)
        .remove();
    }

    location.reload();
});

sendBtn.addEventListener("click", sendMessage);

chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
});

function sendMessage() {
    const message = chatInput.value.trim();

    if (message === "") return;

    firebase.database()
    .ref("rooms/" + currentRoom + "/chat")
    .push({
        player: currentPlayerName,
        text: message
    });

    chatInput.value = "";
}

function loadChat() {
    firebase.database()
    .ref("rooms/" + currentRoom + "/chat")
    .on("value", (snapshot) => {
        chatMessages.innerHTML = "";

        const data = snapshot.val();

        if (data) {
            Object.values(data).forEach(msg => {
                const div = document.createElement("div");
                div.classList.add("chat-message");

                div.innerHTML = `
                    <span>${escapeHTML(msg.player)}:</span>
                    ${escapeHTML(msg.text)}
                `;

                chatMessages.appendChild(div);
            });
        }

        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

startGameBtn.addEventListener("click", () => {
    bgMusic.pause();

bgMusic.currentTime = 0;

    if (!isHost) {

        showToast("⚠ Sadece oda sahibi oyunu başlatabilir");

        return;

    }

    startCountdown();

});

function startCountdown() {

    bgMusic.pause();

    bgMusic.currentTime = 0;

    countdownRunning = false;
    doctorPhaseRunning = false;
    vampirePhaseRunning = false;
    votingRunning = false;

    readyListenerStarted = false;
    votesListenerStarted = false;

    firebase.database()
    .ref("rooms/" + currentRoom)
    .update({

        countdown:true,
        gameStarted:true,

        phase:"countdown",

        votes:null,
        protectedPlayer:null,
        killedPlayer:null,

        nightResult:null,
        winner:null

    });

}

function runCountdown() {
    countdownRunning = true;

    countdownScreen.classList.remove("hidden");

    let count = 3;
    countdownText.textContent = count;
    countSound.currentTime = 0;

    countSound.play();

    const interval = setInterval(() => {
        count--;
        countdownText.textContent = count;

        if (count <= 0) {
            clearInterval(interval);

            countdownText.textContent = "BAŞLA";

            setTimeout(() => {
                countdownScreen.classList.add("hidden");
                    countSound.pause();

                    countSound.currentTime = 0;

                if (isHost) {
                    giveRoles();
                }
            }, 1000);
        }
    }, 1000);
}

function giveRoles() {
    firebase.database()
    .ref("rooms/" + currentRoom + "/players")
    .once("value", (snapshot) => {
        const data = snapshot.val();

        if (!data) return;

        const keys = Object.keys(data);

        let vampireCount = 1;

        if (keys.length >= 8) {
            vampireCount = 2;
        }

        const shuffled = keys.sort(() => Math.random() - 0.5);
        const vampireKeys = shuffled.slice(0, vampireCount);
        const doctorKey = shuffled[vampireCount];

        keys.forEach(key => {
            let role = "Köylü";

            if (vampireKeys.includes(key)) {
                role = "Vampir";
            }
            else if (key === doctorKey) {
                role = "Doktor";
            }

            firebase.database()
            .ref("rooms/" + currentRoom + "/players/" + key)
            .update({
                role: role,
                dead: false,
                ready: false
            });
        });

        firebase.database()
        .ref("rooms/" + currentRoom)
        .update({
            phase: "roles",
            countdown: false,
            votes: null,
            protectedPlayer: null,
            killedPlayer: null,
            winner: null
        });

        waitAllPlayersReadyThenStart();
    });
}

continueBtn.addEventListener("click",()=>{

    vampireTeam.innerHTML = "";

    roleScreen.classList.add("hidden");

    lobby.classList.add("hidden");

    document.querySelector(".container")
    .classList.add("hidden");

    gameScreen.classList.remove("hidden");

    loadGamePlayers();

    loadGameChat();

    firebase.database()
    .ref("rooms/" + currentRoom + "/players/" + currentPlayerKey)
    .update({
        ready:true
    });

    if(isHost){
        waitAllPlayersReadyThenStart();
    }

});
function waitAllPlayersReadyThenStart() {
    if (!isHost || readyListenerStarted) return;

    readyListenerStarted = true;

    const playersRef = firebase.database().ref("rooms/" + currentRoom + "/players");

    playersRef.on("value", (snapshot) => {
        const players = snapshot.val();

        if (!players) return;

        const list = Object.values(players);

        const everyoneHasRole = list.every(player => player.role);
        const everyoneReady = list.every(player => player.ready === true);

        if (everyoneHasRole && everyoneReady) {
            playersRef.off();

            readyListenerStarted = false;

            firebase.database()
            .ref("rooms/" + currentRoom)
            .update({
                phase: "vampire"
            });
        }
    });
}

function loadGamePlayers() {
    firebase.database()
    .ref("rooms/" + currentRoom + "/players")
    .on("value", (snapshot) => {
        alivePlayers.innerHTML = "";

        const data = snapshot.val();

        if (data) {
            Object.entries(data).forEach(([key, player]) => {
                const div = document.createElement("div");

                div.classList.add("alive-player");

                if (player.dead) {
                    div.classList.add("dead-player");
                }

                div.dataset.key = key;
                div.dataset.role = player.role || "";
                div.dataset.name = player.name;

                div.textContent = player.name + (player.dead ? " - Ölü" : "");

                alivePlayers.appendChild(div);
            });
        }
    });
}

gameSendBtn.addEventListener("click", sendGameMessage);

gameChatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendGameMessage();
    }
});

function sendGameMessage() {
    const text = gameChatInput.value.trim();

    if (text === "") return;

firebase.database()
.ref("rooms/" + currentRoom + "/players/" + currentPlayerKey)
.once("value", (snapshot) => {

    const me = snapshot.val();

    if (me && me.dead) {

        showToast("💀 Ölüler mesaj yazamaz");

        return;

    }

        firebase.database()
        .ref("rooms/" + currentRoom + "/gameChat")
        .push({
            player: currentPlayerName,
            text: text
        });

        gameChatInput.value = "";
    });
}

function loadGameChat() {
    firebase.database()
    .ref("rooms/" + currentRoom + "/gameChat")
    .on("value", (snapshot) => {
        gameMessages.innerHTML = "";

        const data = snapshot.val();

        if (data) {
            Object.values(data).forEach(msg => {
                const div = document.createElement("div");
                div.classList.add("game-message");

                div.innerHTML = `
                    <span>${escapeHTML(msg.player)}:</span>
                    ${escapeHTML(msg.text)}
                `;

                gameMessages.appendChild(div);
            });
        }

        gameMessages.scrollTop = gameMessages.scrollHeight;
    });
}

function startDoctorPhase(){

    if(doctorPhaseRunning) return;

    if(doctorInterval){
        clearInterval(doctorInterval);
        doctorInterval = null;
    }

    doctorPhaseRunning = true;
    vampirePhaseRunning = false;
    votingRunning = false;

    clearSelections();

    roleScreen.classList.add("hidden");
    voteScreen.classList.add("hidden");
    nightScreen.classList.remove("hidden");

    nightTitle.textContent = "GECE";
    nightSubtitle.textContent = "Doktor Koruyacağı Kişiyi Seçsin";

    let time = 10;
    nightTimer.textContent = time;

    setTimeout(()=>{

        firebase.database()
        .ref("rooms/" + currentRoom + "/players/" + currentPlayerKey)
        .once("value",(snapshot)=>{

            const me = snapshot.val();

            if(
                currentRole === "Doktor" &&
                me &&
                !me.dead
            ){
                enableDoctorSelection();
            }

        });

    },400);

    doctorInterval = setInterval(()=>{

        time--;

        if(time < 0){
            time = 0;
        }

        nightTimer.textContent = time;

        if(time <= 0){

            clearInterval(doctorInterval);
            doctorInterval = null;

            doctorPhaseRunning = false;

            disableSelections();

if(isHost){

    firebase.database()
    .ref("rooms/" + currentRoom)
    .update({
        phase:"result"
    });

    finishNight();

}

        }

    },1000);

}

function enableDoctorSelection() {
    document.querySelectorAll(".alive-player").forEach(playerDiv => {
        if (playerDiv.classList.contains("dead-player")) return;

        playerDiv.classList.add("selectable-player");

        playerDiv.onclick = () => {
            healSound.currentTime = 0;

            healSound.play();
            clearSelections();

            playerDiv.classList.add("selected-player");

            const selectedName = playerDiv.dataset.name;

            firebase.database()
            .ref("rooms/" + currentRoom)
            .update({
                protectedPlayer: selectedName
            });
        };
    });
}

function startVampirePhase(){

    if(vampirePhaseRunning) return;

    if(vampireInterval){
        clearInterval(vampireInterval);
        vampireInterval = null;
    }

    vampirePhaseRunning = true;
    doctorPhaseRunning = false;
    votingRunning = false;

    clearSelections();

    roleScreen.classList.add("hidden");
    voteScreen.classList.add("hidden");
    nightScreen.classList.remove("hidden");

    nightTitle.textContent = "GECE";
    nightSubtitle.textContent = "Vampir Öldüreceği Kişiyi Seçsin";
    if(currentRole === "Vampir"){

    vampireWakeSound.currentTime = 0;

    vampireWakeSound.play();

}

    let time = 10;
    nightTimer.textContent = time;

    setTimeout(()=>{
        if(currentRole === "Vampir"){
            enableVampireSelection();
        }
    },400);

    vampireInterval = setInterval(()=>{

        time--;

        if(time < 0){
            time = 0;
        }

        nightTimer.textContent = time;

        if(time <= 0){

            clearInterval(vampireInterval);
            vampireInterval = null;

            vampirePhaseRunning = false;

            disableSelections();

if(isHost){

    firebase.database()
    .ref("rooms/" + currentRoom)
    .update({
        phase:"doctor"
    });

}

        }

    },1000);

}

function enableVampireSelection(){

    firebase.database()
    .ref("rooms/" + currentRoom + "/players")
    .once("value",(snapshot)=>{

        const players = snapshot.val();

        document.querySelectorAll(".alive-player")
        .forEach(playerDiv=>{

            if(playerDiv.classList.contains("dead-player")){
                return;
            }

            const playerName =
            playerDiv.dataset.name;

            let selectedPlayer = null;

            Object.values(players).forEach(player=>{

                if(player.name === playerName){

                    selectedPlayer = player;

                }

            });

            if(!selectedPlayer){
                return;
            }

            // Ölü ise seçilemez
            if(selectedPlayer.dead){
                return;
            }

            // Vampir vampiri öldüremez
            if(selectedPlayer.role === "Vampir"){
                return;
            }

            playerDiv.classList.add(
                "selectable-player"
            );

            playerDiv.onclick = ()=>{
                killSound.currentTime = 0;

                killSound.play();
                // Tıklayınca tekrar firebase kontrolü
                firebase.database()
                .ref("rooms/" + currentRoom + "/players")
                .once("value",(snap)=>{

                    const latestPlayers = snap.val();

                    let latestPlayer = null;

                    Object.values(latestPlayers).forEach(p=>{

                        if(p.name === playerName){
                            latestPlayer = p;
                        }

                    });

                    if(!latestPlayer){
                        return;
                    }

                    // Bu sırada öldüyse engelle
                    if(latestPlayer.dead){
                        return;
                    }

                    clearSelections();

                    playerDiv.classList.add(
                        "selected-player"
                    );

                    firebase.database()
                    .ref("rooms/" + currentRoom)
                    .update({

                        killedPlayer:playerName

                    });

                });

            };

        });

    });

}

function clearSelections() {
    document.querySelectorAll(".alive-player").forEach(playerDiv => {
        playerDiv.classList.remove("selected-player");
    });
}

function disableSelections() {
    document.querySelectorAll(".alive-player").forEach(playerDiv => {
        playerDiv.classList.remove("selectable-player");
        playerDiv.classList.remove("selected-player");
        playerDiv.onclick = null;
    });
}

function finishNight() {

    firebase.database()
    .ref("rooms/" + currentRoom)
    .once("value", (snapshot) => {

        const room = snapshot.val();

        const protectedPlayer =
        room.protectedPlayer;

        const killedPlayer =
        room.killedPlayer;

        let resultText = "";

        if (
            protectedPlayer &&
            killedPlayer &&
            protectedPlayer === killedPlayer
        ) {

            resultText =
            killedPlayer +
            " az kalsın öldürülüyordu fakat doktor korudu";

        }

        else if (killedPlayer) {

            resultText =
            killedPlayer + " öldürüldü";

            killPlayerByName(killedPlayer);

        }

        else {

            resultText =
            "Kimse ölmedi";

        }

        nightSubtitle.textContent =
        resultText;

        nightTitle.textContent =
        "GÜNDÜZ";

        nightTimer.textContent = "";

        firebase.database()
        .ref("rooms/" + currentRoom)
        .update({

            nightResult: resultText

        });

        setTimeout(() => {

            nightScreen.classList.add("hidden");

            checkWinCondition((gameEnded) => {

                if (gameEnded) return;

                if (isHost) {

                    firebase.database()
                    .ref("rooms/" + currentRoom)
                    .update({

                        phase: "vote"

                    });

                }

            });

        }, 5000);

    });

}

function startVotingPhase(){


    if(votingRunning) return;

    if(voteInterval){
        clearInterval(voteInterval);
        voteInterval = null;
    }

    votingRunning = true;
    doctorPhaseRunning = false;
    vampirePhaseRunning = false;
    votesListenerStarted = false;

    clearSelections();

    voteScreen.classList.remove("hidden");
    nightScreen.classList.add("hidden");
    voteResult.innerHTML = "";

    let time = 10;
    voteTimer.textContent = time;

    loadVotePlayers();

    voteInterval = setInterval(()=>{

        time--;

        if(time < 0){
            time = 0;
        }

        voteTimer.textContent = time;

        if(time <= 0){

            clearInterval(voteInterval);
            voteInterval = null;

            votingRunning = false;

            if(isHost){
                finishVoting();
            }

        }

    },1000);

}
function loadVotePlayers() {

    firebase.database()
    .ref("rooms/" + currentRoom + "/players")
    .once("value", (snapshot) => {

        votePlayers.innerHTML = "";

        const players = snapshot.val();

        Object.entries(players).forEach(([key, player]) => {

            if (player.dead) return;

            const div = document.createElement("div");

            div.classList.add("vote-player");

            div.innerHTML = `
                <strong>${escapeHTML(player.name)}</strong>
                <span id="vote-count-${key}">0 Oy</span>
            `;

            div.onclick = () => {
                tickSound.currentTime = 0;

                tickSound.play();

                firebase.database()
                .ref("rooms/" + currentRoom + "/players/" + currentPlayerKey)
                .once("value",(snapshot)=>{

                    const me = snapshot.val();

                    if(!me || me.dead){
                        return;
                    }

                    firebase.database()
                    .ref("rooms/" + currentRoom + "/votes/" + currentPlayerKey)
                    .set(player.name);

                    document.querySelectorAll(".vote-player")
                    .forEach(el => {

                        el.style.pointerEvents = "none";
                        el.style.opacity = "0.6";

                    });

                });

            };

            votePlayers.appendChild(div);

        });

        listenVotes();

    });

}

function listenVotes() {
    if (votesListenerStarted) return;
    votesListenerStarted = true;

    firebase.database()
    .ref("rooms/" + currentRoom + "/votes")
    .on("value", (snapshot) => {
        const votes = snapshot.val();

        document.querySelectorAll(".vote-player span").forEach(span => {
            span.textContent = "0 Oy";
        });

        if (!votes) return;

        const countMap = {};

        Object.values(votes).forEach(name => {
            if (!countMap[name]) {
                countMap[name] = 0;
            }

            countMap[name]++;
        });

        firebase.database()
        .ref("rooms/" + currentRoom + "/players")
        .once("value", (playerSnap) => {
            const players = playerSnap.val();

            Object.entries(players).forEach(([key, player]) => {
                const count = countMap[player.name] || 0;

                const span = document.getElementById("vote-count-" + key);

                if (span) {
                    span.textContent = count + " Oy";
                }
            });
        });
    });
}

function finishVoting() {
    firebase.database()
    .ref("rooms/" + currentRoom + "/votes")
    .once("value", (snapshot) => {
        const votes = snapshot.val();

        if (!votes) {
            voteResult.innerHTML = `
                <h2 style="color:white;margin-top:20px;">
                    Kimse oy vermedi.
                </h2>
            `;

            setTimeout(() => {
                restartNight();
            }, 2500);

            return;
        }

        const countMap = {};

        Object.values(votes).forEach(name => {
            if (!countMap[name]) {
                countMap[name] = 0;
            }

            countMap[name]++;
        });

        let maxVotes = 0;
        let votedPlayer = null;

        Object.entries(countMap).forEach(([name, count]) => {
            if (count > maxVotes) {
                maxVotes = count;
                votedPlayer = name;
            }
        });

        let sameCount = 0;

        Object.values(countMap).forEach(count => {
            if (count === maxVotes) {
                sameCount++;
            }
        });

        const tied = sameCount > 1;

if (tied) {

    const resultText =
    "Oylar eşit çıktı. Kimse ölmedi.";

    firebase.database()
    .ref("rooms/" + currentRoom)
    .update({
        voteResultText: resultText
    });

}
else if (votedPlayer) {

    const resultText =
    votedPlayer + " ASILDI";

    firebase.database()
    .ref("rooms/" + currentRoom)
    .update({
        voteResultText: resultText
    });

    killPlayerByName(votedPlayer);
}

        setTimeout(() => {
            checkWinCondition((gameEnded) => {
                if (gameEnded) return;
                restartNight();
            });
        }, 2500);
    });
}

function restartNight() {
    voteResult.innerHTML = "";

    firebase.database()
    .ref("rooms/" + currentRoom)
    .update({
        votes: null,
        protectedPlayer: null,
        killedPlayer: null,
        phase: "vampire"
    });

    voteScreen.classList.add("hidden");
}

function killPlayerByName(name) {
    firebase.database()
    .ref("rooms/" + currentRoom + "/players")
    .once("value", (playerSnap) => {
        const players = playerSnap.val();

        Object.entries(players).forEach(([key, player]) => {
            if (player.name === name) {
                firebase.database()
                .ref("rooms/" + currentRoom + "/players/" + key)
                .update({
                    dead: true
                });
            }
        });
    });
}

function checkWinCondition(callback) {
    firebase.database()
    .ref("rooms/" + currentRoom + "/players")
    .once("value", (snapshot) => {
        const players = snapshot.val();

        let aliveVampires = 0;
        let aliveVillagers = 0;

        Object.values(players).forEach(player => {
            if (player.dead) return;

            if (player.role === "Vampir") {
                aliveVampires++;
            }
            else {
                aliveVillagers++;
            }
        });

        if (aliveVampires <= 0) {
            showWinScreen("KÖYLÜLER KAZANDI");
            callback(true);
            return;
        }

        if (aliveVampires >= aliveVillagers) {
            showWinScreen("VAMPİRLER KAZANDI");
            callback(true);
            return;
        }

        callback(false);
    });
}

function showWinScreen(text){

    clearAllGameTimers();

    if(isHost){

        firebase.database()
        .ref("rooms/" + currentRoom)
        .update({
            winner:text,
            phase:"ended"
        });

    }

}
restartGameBtn.addEventListener("click",()=>{

    

if(!isHost){

    showToast("⚠ Sadece oda sahibi yeniden başlatabilir");

    return;
}

    firebase.database()
    .ref("rooms/" + currentRoom + "/players")
    .once("value",(snapshot)=>{

        const players = snapshot.val();

        Object.entries(players).forEach(([key])=>{

            firebase.database()
            .ref("rooms/" + currentRoom + "/players/" + key)
            .update({
                dead:false,
                role:null,
                ready:false
            });

        });

        firebase.database()
        .ref("rooms/" + currentRoom)
        .update({
            countdown:false,
            gameStarted:false,
            phase:"lobby",
            votes:null,
            protectedPlayer:null,
            killedPlayer:null,
            nightResult:null,
            winner:null
        });

    });

});

function resetScreensToLobby(){

    clearAllGameTimers();
    roleShown = false;
    gamePhaseListenerActive = false;
    winScreen.classList.add("hidden");
    gameScreen.classList.add("hidden");
    nightScreen.classList.add("hidden");
    voteScreen.classList.add("hidden");
    roleScreen.classList.add("hidden");
    countdownScreen.classList.add("hidden");

    document.querySelector(".container")
    .classList.remove("hidden");

    lobby.classList.remove("hidden");

    vampireTeam.innerHTML = "";
    voteResult.innerHTML = "";

    currentRole = null;

    countdownRunning = false;
    doctorPhaseRunning = false;
    vampirePhaseRunning = false;
    votingRunning = false;
    readyListenerStarted = false;
    votesListenerStarted = false;
}

function loadVampireTeam() {
    firebase.database()
    .ref("rooms/" + currentRoom + "/players")
    .once("value", (snapshot) => {
        const players = snapshot.val();

        let vampireNames = [];

        Object.values(players).forEach(player => {
            if (
                player.role === "Vampir" &&
                player.name !== currentPlayerName
            ) {
                vampireNames.push(player.name);
            }
        });

        if (vampireNames.length <= 0) {
            vampireTeam.innerHTML = `
                <p style="
                    margin-top:20px;
                    color:#ff1e1e;
                    font-weight:600;
                ">
                    Tek Vampirsin
                </p>
            `;
            return;
        }

        vampireTeam.innerHTML = `
            <div style="
                margin-top:20px;
                color:#ff1e1e;
                font-weight:600;
                line-height:1.8;
            ">
                Diğer Vampirler:<br>
                ${vampireNames.map(name => escapeHTML(name)).join("<br>")}
            </div>
        `;
    });
}

function escapeHTML(text) {
    return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

leaveGameBtn.addEventListener("click",()=>{

    confirmLeave.classList.remove("hidden");

});

/* CANCEL */

cancelLeaveBtn.addEventListener("click",()=>{

    confirmLeave.classList.add("hidden");

});

/* CONFIRM */

confirmLeaveBtn.addEventListener("click",()=>{

    firebase.database()
    .ref(
        "rooms/" +
        currentRoom +
        "/players/" +
        currentPlayerKey
    )
    .remove();

    showToast("✓ Oyundan çıkıldı");

    setTimeout(()=>{

        location.reload();

    },1200);

    

});

function playLobbyMusic(){

    if(
        currentPhase !== "vampire" &&
        currentPhase !== "doctor" &&
        currentPhase !== "vote"
    ){

        bgMusic.volume = 0.35;

        bgMusic.play()
        .catch(()=>{});

    }

}

/* SAYFA AÇILINCA */

window.addEventListener("load",()=>{

    setTimeout(()=>{

        playLobbyMusic();

    },200);

});

/* ANA MENÜYE DÖNÜNCE */

function resetScreensToLobby(){

    clearAllGameTimers();

    roleShown = false;
    gamePhaseListenerActive = false;

    winScreen.classList.add("hidden");
    gameScreen.classList.add("hidden");
    nightScreen.classList.add("hidden");
    voteScreen.classList.add("hidden");
    roleScreen.classList.add("hidden");
    countdownScreen.classList.add("hidden");

    document.querySelector(".container")
    .classList.remove("hidden");

    lobby.classList.remove("hidden");

    vampireTeam.innerHTML = "";
    voteResult.innerHTML = "";

    currentRole = null;

    countdownRunning = false;
    doctorPhaseRunning = false;
    vampirePhaseRunning = false;
    votingRunning = false;
    readyListenerStarted = false;
    votesListenerStarted = false;

    /* BG MUSIC */

    playLobbyMusic();

}

/* BUTTON SOUND */

document.querySelectorAll("button")
.forEach(btn=>{

    btn.addEventListener("click",()=>{

        tickSound.currentTime = 0;

        tickSound.play();

    });

});