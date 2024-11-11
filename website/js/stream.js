const audioElement = document.querySelector("audio");
navigator.mediaDevices
  .getUserMedia({ audio: true })
  .then((stream) => {
    audioElement.srcObject = stream;
  })
  .catch((error) => {
    console.error("Error accessing the microphone", error);
  });

//   it captures audio iusing mic and echoes it back.
// echo mechanism: stores the captured audio in html audio tag and then play it immediately.
