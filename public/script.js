if(ROOMH_ID){
  console.log(ROOMH_ID);console.log("not null");
}

const socket = io("/");
const peer = new Peer(undefined, {
  secure: true,
  host: "spanion-video-chat-peer.herokuapp.com",
});
const peers = {};
const newVideoGrid = document.getElementById("newVideoGrid");
const hostVideoGrid = document.getElementById("hostVideoGrid");
const joinVideoGrid = document.getElementById("joinVideoGrid");
const conVideoGrid = document.getElementById("conVideoGrid");
const mediaConfig = {
  video: true,
  audio: true,
};

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
  navigator.mediaDevices
    .getUserMedia(mediaConfig)
    .then((stream) => {
      if(ROOMH_ID){
        const newVideo = document.createElement("video");
        newVideo.muted = true;
        newVideo.style.width = "20%";
        newVideo.style.top = "65%";
        newVideoStream(newVideo, stream, id);
      }else{
        const hostVideo = document.createElement("video");
        hostVideo.muted = true;
        hostVideo.style.width = "100%";
        hostVideo.style.height = "65vh";
        hostVideo.style.background = "#000";
        hostVideo.controls = true;
        hostVideoStream(hostVideo, stream, id);
      }
      peer.on("call", (call) => {
        call.answer(stream);
        const joinVideo = document.createElement("video");
        joinVideo.style.width = "100%";
        joinVideo.style.height = "100vh"
        joinVideo.controls = true;
        if(ROOMH_ID){
          call.on("stream", (userStream) => {
            const userId = call.peer;
            if(userId==ROOMH_ID){
              joinHostVideoStream(joinVideo, userStream,userId);
            }
          });
        }
      });
      if(ROOMH_ID==!id){
        socket.on("user-connected", (id) => {                
          connectToNewUser( id, stream);
        });
      }
    })
    .catch((err) => {
      document.write(err);
    });
});

socket.on("user-disconnected", (id) => {
  const video = document.getElementById(id);
  if (video) {
    video.parentElement.remove();
  }
  if (peers[id]) peers[id].close();
});

function connectToNewUser( id, stream) {
  const call = peer.call(id, stream);
  const conNewVideo = document.createElement("video");
  conNewVideo.style.width = "50%";
  conNewVideo.style.height = "30vh";
  conNewVideo.style.background = "#000";
  conNewVideo.style.border = "1px solid rgb(12, 36, 143)";
  conNewVideo.controls = true;
      call.on("stream", (userStream) => {
        conNewVideoStream(conNewVideo, userStream, id);
      });
  call.on("close", () => {
    conNewVideo.remove();
  });
  peers[id] = call;
}

if(ROOMH_ID){
  function newVideoStream(newVideo,stream ,id) {
    newVideo.srcObject = stream;
    newVideo.addEventListener("loadedmetadata", () => {
      newVideo.play();
    });
    newVideoGrid.append(newVideo)   
  }
}else{
  function hostVideoStream(hostVideo,stream ,id) {
    hostVideo.srcObject = stream;
    hostVideo.addEventListener("loadedmetadata", () => {
      hostVideo.play();
    });
    hostVideoGrid.append(hostVideo)    
  }
}

function joinHostVideoStream(joinVideo, stream) {
  joinVideo.srcObject = stream;
  joinVideo.addEventListener("loadedmetadata", () => {
    joinVideo.play();
  });
  joinVideoGrid.append(joinVideo)
}

function conNewVideoStream(conNewVideo, stream) {
  conNewVideo.srcObject = stream;
  conNewVideo.addEventListener("loadedmetadata", () => {
    conNewVideo.play();
  });
 conVideoGrid.append(conNewVideo)
}