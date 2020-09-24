const { app, BrowserWindow } = require('electron');
const path = require('path');
const workerpool = require('workerpool')
const fs = require('fs')
const os = require('os')
const s3 = require('./s3')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

let mainWindow;
let pool;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      worldSafeExecuteJavaScript: true,
      nodeIntegration: true,
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  return mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  mainWindow = createWindow();
  setTimeout(startUpload, 3000)
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createWindow();
    setTimeout(startUpload, 3000)
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.


function startDownload() {
  pool = workerpool.pool(__dirname + '/download.js', {
    maxWorkers: 16,
    workerType: 'thread'
  });
  const Bucket = 'bucket-zj';
  
  s3.listObjects({
    Bucket,
    Prefix: 'test',
  }, function(err, data) {
    if (err) console.log(err, err.stack);
    else downloadFiles(data);
  });
  
  const tmpdir = os.tmpdir();
  
  function downloadFiles(data) {
    const datetime = new Date().toISOString().slice(0, 19).replaceAll(':', '-');
    const dirname = path.join(tmpdir, 'eqs-' + datetime);
    fs.mkdirSync(dirname)
    //mainWindow.webContents.send('ping', dirname);
  
    // const interval = setInterval(function() {
    //   console.log(pool.stats());
    // }, 5000);
  
    const files = data.Contents.map(item => item.Key);
    files.forEach(file => downloadFile(file, dirname))
  }
  
  function downloadFile(file, folder) {
    pool.exec('download', [file, folder])
      .then(filepath => {
        const time = new Date().toISOString().slice(0, 19);
        const log = `[${time}] ${filepath}`;
        //mainWindow.webContents.send('ping', log);
      })
      .catch(err => {})
  }
}

function startUpload() {
  pool = workerpool.pool(__dirname + '/upload.js', {
    maxWorkers: 16,
    workerType: 'thread'
  });
  
  fs.readdir(path.join(__dirname, '../test'), (err, files) => {
    if (err) console.log(err, err.stack);
    else uploadFiles(files)
  });
}

function uploadFiles(files) {
  const datetime = new Date().toISOString().slice(0, 19).replaceAll(':', '-');
  const dirname = 'eqs-' + datetime;
  files.forEach(file => uploadFile(file, dirname))
}

function uploadFile(file, folder) {
  pool.exec('upload', [file, folder])
      .then(filepath => {
        const time = new Date().toISOString().slice(0, 19);
        const log = `[${time}] ${filepath}`;
        mainWindow.webContents.send('ping', log);
      })
      .catch(err => {})
}