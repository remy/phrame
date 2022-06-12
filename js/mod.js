let wakeLock = null;

// Function that attempts to request a screen wake lock.
async function requestWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => {
      console.log('Screen Wake Lock was released');
    });
    console.log('Screen Wake Lock is active');
  } catch (err) {
    console.error(`${err.name}, ${err.message}`);
  }
}

function fullScreenCheck() {
  if (document.fullscreenElement) return;
  return document.documentElement.requestFullscreen();
}

function render(url) {
  const f = document.body;
  const i = new Image();
  i.onload = async () => {
    let { type } = screen.orientation;
    const currentType = type;

    const portrait = type.startsWith('portrait');

    if (i.width < i.height && !type) {
      type = 'portrait';
    } else if (i.width > i.height && type) {
      type = 'landscape';
    }

    if (type !== currentType) {
      console.log('rotating screen');
      try {
        await screen.orientation.lock(type);
      } catch (e) {
        alert(e.message);
      }
    }

    document.body.classList.add('frame');
    document.body.append(i);
  };
  i.src = url;
}

async function main() {
  const input = document.querySelector('#file');
  const start = document.querySelector('#launch');

  let url = null;

  start.addEventListener('click', async () => {
    try {
      await fullScreenCheck();
    } catch (err) {
      console.log(err);
      alert('failed to fullscreen', err);
    }

    try {
      console.log('requesting wakeLock');
      await requestWakeLock();
    } catch (e) {
      alert(e.message);
    }
    console.log('wakeLock complete');

    try {
      render(url);
    } catch (e) {
      console.log(e);
      alert(e.message);
    }
  });

  input.addEventListener('change', async (e) => {
    const fileReader = new FileReader();
    fileReader.onloadend = function (e) {
      const blob = new Blob([e.target.result], {
        type: 'image/png',
      });
      url = URL.createObjectURL(blob);
      input.parentNode.hidden = true;
      start.hidden = false;
    };
    fileReader.readAsArrayBuffer(e.target.files[0]);
  });
}

main().catch((err) => console.log(err));
