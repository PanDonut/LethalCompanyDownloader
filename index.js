import size from "window-size"
import chalk from "chalk";
import Downloader from "nodejs-file-downloader";
import promptSync from 'prompt-sync'; 
import path from "path"
import { fileURLToPath } from 'url';
import axios from "axios";
import * as fs from "fs";
import { createExtractorFromFile } from "node-unrar-js"
import os from "os";
import { exec } from "child_process";
import { playAudioFile } from "audic";
import settingsbase from "./settings.js";
import proc from "node:process"

var orange = true;
proc.on('beforeExit', (code) => {
  const settings = fs.readFile(`${process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']}/AppData/Local/Packages/Microsoft.WindowsTerminal_8wekyb3d8bbwe/LocalState/settings.json`, (err,data) => {
    if (err) throw err
    var dataO = JSON.parse(data);
    dataO.profiles.list = settingsbase(true);
    fs.writeFile(`${process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']}/AppData/Local/Packages/Microsoft.WindowsTerminal_8wekyb3d8bbwe/LocalState/settings.json`, JSON.stringify(dataO), {}, () => { proc.exit() })
  })
});
proc.on('exit', (code) => {
  const settings = fs.readFile(`${process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']}/AppData/Local/Packages/Microsoft.WindowsTerminal_8wekyb3d8bbwe/LocalState/settings.json`, (err,data) => {
    if (err) throw err
    var dataO = JSON.parse(data);
    dataO.profiles.list = settingsbase(true);
    fs.writeFile(`${process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']}/AppData/Local/Packages/Microsoft.WindowsTerminal_8wekyb3d8bbwe/LocalState/settings.json`, JSON.stringify(dataO), {}, () => { proc.exit() })
  })
});
proc.on('disconnect', (code) => {
  const settings = fs.readFile(`${process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']}/AppData/Local/Packages/Microsoft.WindowsTerminal_8wekyb3d8bbwe/LocalState/settings.json`, (err,data) => {
    if (err) throw err
    var dataO = JSON.parse(data);
    dataO.profiles.list = settingsbase(true);
    fs.writeFile(`${process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']}/AppData/Local/Packages/Microsoft.WindowsTerminal_8wekyb3d8bbwe/LocalState/settings.json`, JSON.stringify(dataO), {}, () => { proc.exit() })
  })
});

const prompt = promptSync({sigint: true});

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

let currentState = "";

let lastProgress = 0;

let fileName = "";

let loader;
let timeout;

async function Log(string) {
    console.clear();
    if (currentState != "") {
      if (orange == false) {
        console.log(chalk.hex("#4AF626").bold(">" + currentState.toUpperCase() + "\n \n"));
      } else {
        console.log(chalk.hex("#e86100").bold(">" + currentState.toUpperCase() + "\n \n"));
      }
    }
    if (orange == false) {
      console.log(chalk.hex("#4AF626").bold(string));
    } else {
      console.log(chalk.hex("#e86100").bold(string));
    }
}

function Loader(string = "") {
  loader = setInterval(() => {
    currentState = "  |"
    Log(string)
    timeout = setTimeout(() => {
      currentState = "  /"
      Log(string)
      timeout = setTimeout(() => {
        currentState = "  -"
        Log(string)
        timeout = setTimeout(() => {
          currentState = "  \\"
          Log(string)
          timeout = setTimeout(() => {
            currentState = "  |"
            Log(string)
            timeout = setTimeout(() => {
              currentState = "  /"
              Log(string)
              timeout = setTimeout(() => {
                currentState = "  -"
                Log(string)
                timeout = setTimeout(() => {
                  currentState = "  \\"
                  Log(string)
                }, 200)
              }, 200)
            }, 200)
          }, 200)
        }, 200)
      }, 200)
    }, 200)
  }, 1600)
}

async function extractRarArchive(file, destination) {
  try {
    const extractor = await createExtractorFromFile({
      filepath: file,
      targetPath: destination,
      password: "M4CKD0GE"
    });

    [...extractor.extract().files];
  } catch (err) {
    currentState = "err"
    Log(`\n\n\n   ${err}`)
  }
}

async function DownloadGame(uri, data, ver) {
    var logger = "";
    var s = JSON.stringify(size).split("");
    s.splice(0,9);
    s.splice(s.indexOf(","), 100)
    const downloader = new Downloader({
      url: uri,
      directory: "./common",
      onProgress: function (percentage, chunk, remainingSize) {
        if (lastProgress != Math.floor(percentage) && Math.ceil(percentage) < 99) {
          lastProgress = Math.floor(percentage);
          Log(`[${ "■".repeat(Math.round((percentage / 100) * (parseInt(s.join("")) - 2)) / 1) }${" ".repeat(Math.abs((parseInt(s.join("")) - 2) - (Math.floor((percentage / 100) * (parseInt(s.join("")))) + 1)))}]
          \nRemaining: ${Math.ceil((remainingSize / 1024) / 1024)} mb`);
        }
      },
      onBeforeSave: (name) => {
        fileName = name;
      }
    });
  
    try {
      const filePathD = path.join(__dirname, "save.dat");
      const drive = await fs.readFileSync(filePathD);
      const del = fs.rm(`${drive}:\\Games\\Lethal Company`, {recursive: true, force: true},() => {})
      await downloader.download();
      currentState = "install"
      Log("\n\n\n   Extracting...\n   Please wait")
      await extractRarArchive(`./common/${fileName}`, `${drive}:/Games/Lethal Company`);   
      ExecuteCommand("mods", data, ver)
    } catch (error) {
      console.log(error);
    }
}


async function DownloadMod(name, uri) {
  currentState = name;
  var s = JSON.stringify(size).split("");
  s.splice(0,9);
  s.splice(s.indexOf(","), 100)
  const downloader = new Downloader({
    url: uri,
    directory: "./common/mods",
    onProgress: function (percentage, chunk, remainingSize) {
      if (lastProgress != Math.floor(percentage) && Math.ceil(percentage) < 99) {
        lastProgress = Math.floor(percentage);
        Log(`[${ "■".repeat(Math.round((percentage / 100) * (parseInt(s.join("")) - 2)) / 1) }${" ".repeat(Math.abs((parseInt(s.join("")) - 2) - (Math.floor((percentage / 100) * (parseInt(s.join("")))) + 1)))}]
        \nRemaining: ${Math.ceil((remainingSize / 1024) / 1024)} mb
        `);
      }
    },
    onBeforeSave: (name) => {
      fileName = name;
    }
  });

  try {
    await downloader.download();
    currentState = "install"
    Log("\n\n\n   Extracting...\n   Please wait")
    const filePath = path.join(__dirname, "save.dat");
    const drive = await fs.readFileSync(filePath);
    await extractRarArchive(`./common/mods/${fileName}`, `${drive}:/Games/Lethal Company`);
  } catch (error) {
    console.log(error);
  }
}

async function DownloadCrack(uri) {
  currentState = "crack";
  var s = JSON.stringify(size).split("");
  s.splice(0,9);
  s.splice(s.indexOf(","), 100)
  const downloader = new Downloader({
    url: uri,
    directory: "./common/crack",
    onProgress: function (percentage, chunk, remainingSize) {
      if (lastProgress != Math.floor(percentage) && Math.ceil(percentage) < 99) {
        lastProgress = Math.floor(percentage);
        Log(`[${ "■".repeat(Math.round((percentage / 100) * (parseInt(s.join("")) - 2)) / 1) }${" ".repeat(Math.abs((parseInt(s.join("")) - 2) - (Math.floor((percentage / 100) * (parseInt(s.join("")))) + 1)))}]
        \nRemaining: ${Math.ceil((remainingSize / 1024) / 1024)} mb
        `);
      }
    },
    onBeforeSave: (name) => {
      fileName = name;
    }
  });

  try {
    await downloader.download();
    currentState = "crack"
    Log("\n\n\n   Extracting...\n   Please wait")
    const filePath = path.join(__dirname, "save.dat");
    const drive = await fs.readFileSync(filePath);
    await extractRarArchive(`./common/crack/${fileName}`, `${drive}:/Games/Lethal Company`);
    const audioFilePath = path.join(__dirname, "assets/IcecreamTruckV2.wav");
    Log("\n\n\n   DONE\n   Now go keep The Company happy!")
    await playAudioFile(audioFilePath);
    Log("\n\n\n   HELP ME! PLEASE, HELP. I'M STUCK HERE! HELP! THEY WON'T LET ME OUT")
  } catch (error) {
    console.log(error);
  }
}

async function ExecuteCommand(command, data, ver) {
  const cmd = command.toLowerCase();
  if (command.split("").length >= 3) {
    if ("download".includes(cmd)) {
      currentState = "download"      
      Log(chalk.hex("#4AF626").bold(`\n\n   Choose the version you want to download\n\n\n${(Object.entries(data.data).map(item => { return `   ${item[0]}\n\n`})).toString().replace(",","")} \n\n\n`));
      const wait = prompt(chalk.hex("#4AF626").bold(`   >`));
      if (data.data[wait]) {
        Log(chalk.hex("#4AF626").bold(`   Starting download...`));
        DownloadGame(data.data[wait].uri, data, wait);
      } else {
        currentState = "";
        ExecuteCommand("err", data);
      }
    } else if ("mods".includes(cmd)) {
      currentState = "mods"
      if (ver) {
        Log(chalk.hex("#4AF626").bold(`   Downloading mods...`));
        var bar = new Promise(async (resolve, reject) => {
          await data.data[ver].mods.forEach(async (element, index, array) => {
            await DownloadMod(element.name, element.uri);
            if (index === array.length -1) resolve();
          });
        });
        bar.then(async () => {
          DownloadCrack(data.data[ver].crack)
        }); 
      } else {
        Log(chalk.hex("#4AF626").bold(`\n\n   Choose the version you want to mod\n\n\n${(Object.entries(data.data).map(item => { return `   ${item[0]}\n\n`})).toString().replace(",","")} \n\n\n`));
        const wait = prompt(chalk.hex("#4AF626").bold(`   >`));
        if (data.data[wait]) {
          Log(chalk.hex("#4AF626").bold(`   Downloading mods...`));
          var bar = new Promise(async (resolve, reject) => {
            await data.data[wait].mods.forEach(async (element, index, array) => {
              await DownloadMod(element.name, element.uri);
              if (index === array.length -1) resolve();
            });
          });
          bar.then(async () => {
            DownloadCrack(data.data[wait].crack)
          }); 
        } else {
          currentState = "";
          ExecuteCommand("err", data);
        }
      }         
    } else if ("crack".includes(cmd)) {
      currentState = "crack"
      Log(chalk.hex("#4AF626").bold(`   Downloading crack...`));

      if (ver) {
        await DownloadCrack(data.data[ver].crack);   
      } else {
        Log(chalk.hex("#4AF626").bold(`\n\n   Choose the version you want to mod\n\n\n${(Object.entries(data.data).map(item => { return `   ${item[0]}\n\n`})).toString().replace(",","")} \n\n\n`));
        const wait = prompt(chalk.hex("#4AF626").bold(`   >`));
        if (data.data[wait]) {
          await DownloadCrack(data.data[wait].crack);   
        } else {
          currentState = "";
          ExecuteCommand("err", data);
        }
      }  
    } else if ("help".includes(cmd)) {
      Init()
    } else if ("init".includes(cmd)) {
      Init()
    } else if ("start".includes(cmd)) {
      Init()
    } else {
      Log(chalk.hex("#4AF626").bold("\n\n   [There was no action supplied with the word.]\n\n"))
      const filePath = path.join(__dirname, "assets/TerminalTypoError.wav");
      await playAudioFile(filePath);
      const wait = prompt(chalk.hex("#4AF626").bold(`   `));
      ExecuteCommand(wait, data);
    }
  } else {
    Log(chalk.hex("#4AF626").bold("\n\n   [There was no action supplied with the word.]\n\n"))
    const filePath = path.join(__dirname, "assets/TerminalTypoError.wav");
      await playAudioFile(filePath);
    const wait = prompt(chalk.hex("#4AF626").bold(`   `));
    ExecuteCommand(wait, data);
  }
}

async function Init() {
  orange = true;
  const cpu = os.cpus()[0].model.replace(" CPU", "").split("");
  cpu.splice(cpu.indexOf("@") + 1, 100);
  const afilePath = path.join(__dirname, "assets/BootUp.wav");
  const settings = fs.readFile(`${process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']}/AppData/Local/Packages/Microsoft.WindowsTerminal_8wekyb3d8bbwe/LocalState/settings.json`, (err,data) => {
    if (err) throw err
    var dataO = JSON.parse(data);
    dataO.profiles.list = settingsbase(false);
    fs.writeFile(`${process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']}/AppData/Local/Packages/Microsoft.WindowsTerminal_8wekyb3d8bbwe/LocalState/settings.json`, JSON.stringify(dataO), {}, () => {})
  })
  setTimeout(() => {
    currentState = " _____________________________________________ "
    Log("")
  }, 0)
  setTimeout(() => {
    currentState = ` _____________________________________________ \n\n  CPU: ${cpu.join("").replace("@", "at ") + os.cpus()[0].speed}MHz`
    Log("")
  }, 300)
  setTimeout(() => {
    currentState = ` _____________________________________________ \n\n  CPU: ${cpu.join("").replace("@", "at ") + os.cpus()[0].speed}MHz\n  RAM: ${os.totalmem() / 1024}K OK`
    Log("")
  }, 600)
  setTimeout(() => {
    currentState = ` _____________________________________________ \n\n  CPU: ${cpu.join("").replace("@", "at ") + os.cpus()[0].speed}MHz\n  RAM: ${os.totalmem() / 1024}K OK\n  SYSTEMS: OK`
    Log("")
  }, 900)
  setTimeout(() => {
    currentState = ` _____________________________________________ \n\n  CPU: ${cpu.join("").replace("@", "at ") + os.cpus()[0].speed}MHz\n  RAM: ${os.totalmem() / 1024}K OK\n  SYSTEMS: OK\n\n  Booting...`
    Log("")
  }, 1200)
  setTimeout(() => {
    currentState = ` _____________________________________________ \n\n  CPU: ${cpu.join("").replace("@", "at ") + os.cpus()[0].speed}MHz\n  RAM: ${os.totalmem() / 1024}K OK\n  SYSTEMS: OK\n\n  Booting...\n\n\n\n  Loading system...`
    Log("")
  }, 1500)
  setTimeout(() => {
    currentState = ` _____________________________________________ \n\n  CPU: ${cpu.join("").replace("@", "at ") + os.cpus()[0].speed}MHz\n  RAM: ${os.totalmem() / 1024}K OK\n  SYSTEMS: OK\n\n  Booting...\n\n\n\n  Loading system...\n\n\n\n  Fetching data...`
    Log("")
  }, 1800)
  setTimeout(() => {
    currentState = ` _____________________________________________ \n\n  CPU: ${cpu.join("").replace("@", "at ") + os.cpus()[0].speed}MHz\n  RAM: ${os.totalmem() / 1024}K OK\n  SYSTEMS: OK\n\n  Booting...\n\n\n\n  Loading system...\n\n\n\n  Fetching data...\n\n\n\n  OK`
    Log("")
  }, 2100)
  setTimeout(() => {
    currentState = ` _____________________________________________ \n\n  CPU: ${cpu.join("").replace("@", "at ") + os.cpus()[0].speed}MHz\n  RAM: ${os.totalmem() / 1024}K OK\n  SYSTEMS: OK\n\n  Booting...\n\n\n\n  Loading system...\n\n\n\n  Fetching data...\n\n\n\n  OK\n _____________________________________________ `
    Log("")
  }, 2400)
  setTimeout(() => {
    Loader();
  }, 2700)
  await playAudioFile(afilePath);
  await Log("");
  const filePath = path.join(__dirname, "save.dat");
  const read = fs.existsSync(filePath);

  clearInterval(loader);
  clearTimeout(timeout);
  orange = false;
  currentState = "";
  await Log("");

  if (read == false) {
    await Log(chalk.hex("#4AF626").bold(`\n\n   What's your favourite drive letter? \n\n\n`));
    const command = prompt(chalk.hex("#4AF626").bold(`   >`));
    if (command.split("").length == 1) {
      await Log(chalk.hex("#4AF626").bold(`\n\n\n   Alright, the disk that will be used is: ${command.toUpperCase()}\n\n\n   >`));
      await fs.writeFileSync(filePath, command.toUpperCase());
      setTimeout(async () => {
        Init();
      }, 2500)   
    } else {
      const filePath = path.join(__dirname, "assets/TerminalTypoError.wav");
      await playAudioFile(filePath);
      Log(chalk.hex("#4AF626").bold("\n\n   [There was no action supplied with the word.]\n\n"))
      setTimeout(() => {
        Init();
      }, 2000)
    }
  } else {
    axios.get("https://raw.githubusercontent.com/PanDonut/LethalCompanyDownloader/main/meta.json").then(async data => {
      currentState = ""
      await Log(chalk.hex("#4AF626").bold(`\n\n\n   >DOWNLOAD\n   To download the game. \n\n\n   >CRACK\n   To re-crack the game. \n\n\n   >MODS\n   To re-download the mods. \n\n\n`));
      const command = prompt(chalk.hex("#4AF626").bold(`   >`));
      ExecuteCommand(command, data);
    })
  }
}

Init();