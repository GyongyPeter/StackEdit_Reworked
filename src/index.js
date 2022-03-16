import Vue from 'vue';
import 'babel-polyfill';
import 'indexeddbshim/dist/indexeddbshim';
import * as OfflinePluginRuntime from 'offline-plugin/runtime';
import './extensions';
import './services/optional';
import './icons';
import App from './components/App';
import store from './store';
import localDbSvc from './services/localDbSvc';

if (!indexedDB) {
  throw new Error('Your browser is not supported. Please upgrade to the latest version.');
}

OfflinePluginRuntime.install({
  onUpdateReady: () => {
    // Tells to new SW to take control immediately
    OfflinePluginRuntime.applyUpdate();
  },
  onUpdated: async () => {
    if (!store.state.light) {
      await localDbSvc.sync();
      localStorage.updated = true;
      // Reload the webpage to load into the new version
      window.location.reload();
    }
  },
});

if (localStorage.updated) {
  store.dispatch('notification/info', 'StackEdit has just updated itself!');
  setTimeout(() => localStorage.removeItem('updated'), 2000);
}

if (!localStorage.installPrompted) {
  window.addEventListener('beforeinstallprompt', async (promptEvent) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    promptEvent.preventDefault();

    try {
      await store.dispatch('notification/confirm', 'Add StackEdit to your home screen?');
      promptEvent.prompt();
      await promptEvent.userChoice;
    } catch (err) {
      // Cancel
    }
    localStorage.installPrompted = true;
  });
}

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  render: h => h(App),
});


window.addEventListener('handleWhenDragDropped', function (e) {
  setTimeout(() => {

    const images = [
      { fileName: 'summerRoad.jpg', url: 'https://wallpapercave.com/wp/wp4573457.jpg' },
      { fileName: 'winterRoad.jpg', url: 'https://wallpaperaccess.com/full/3623082.jpg' },
      { fileName: 'springRoad.jpg', url: 'https://i.pinimg.com/originals/97/3d/49/973d4981c5d22e03853b9e3986cce09f.jpg' },
      { fileName: 'autumnRoad.jpg', url: 'https://wallpaperaccess.com/full/1730650.jpg' },
      { fileName: 'document.pdf', url: 'https://www.orimi.com/pdf-test.pdf' },
    ];

    const randomFileIdx = e.detail.randomFile;
    const callInProgress = function (i) {
      let eventWhenUploadIsInProgress = new CustomEvent('handleWhenUploadIsInProgress', {
        detail: {
          totalBytes: e.detail.fileSize,
          uploadedBytes: e.detail.fileSize * i / 100,
          isFailed: false,
          fileName: images[randomFileIdx].fileName,
          url: images[randomFileIdx].url,
        }
      });
  
      window.dispatchEvent(eventWhenUploadIsInProgress);

      setTimeout(() => {
        if (i <= 100) {
          i = i + 1;
          callInProgress(i)
        }
      }, 40)
    }

    callInProgress(1);
  }, 10)
}, false);

window.addEventListener('getUrlByFileName', function (e) {
  const images = [
    { fileName: 'summerRoad.jpg', url: 'https://wallpapercave.com/wp/wp4573457.jpg' },
    { fileName: 'winterRoad.jpg', url: 'https://wallpaperaccess.com/full/3623082.jpg' },
    { fileName: 'springRoad.jpg', url: 'https://i.pinimg.com/originals/97/3d/49/973d4981c5d22e03853b9e3986cce09f.jpg' },
    { fileName: 'autumnRoad.jpg', url: 'https://wallpaperaccess.com/full/1730650.jpg' },
    { fileName: 'document.pdf', url: 'https://www.orimi.com/pdf-test.pdf' },
  ];

  const fileName = e.detail.fileName;
  const image = images.find(image => image.fileName == fileName);

  let url;
  if (image) {
    url = image.url;
  }

  const getFileUrlEvent = new CustomEvent('getFileUrlEvent', {
    detail: {
      fileName: fileName,
      url: url
    }
  });

  window.dispatchEvent(getFileUrlEvent);
});