import size from "window-size"
import chalk from "chalk";
import Downloader from "nodejs-file-downloader";
import promptSync from 'prompt-sync'; 
import path from "path"
import { fileURLToPath } from 'url';
import {playAudioFile} from 'audic';
import axios from "axios";
import * as fs from "fs";
import { createExtractorFromFile } from "node-unrar-js"
import os from "os";

var orange = true;

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

function Loader() {
  loader = setInterval(() => {
    currentState = "  |"
    Log("")
    timeout = setTimeout(() => {
      currentState = "  /"
      Log("")
      timeout = setTimeout(() => {
        currentState = "  -"
        Log("")
        timeout = setTimeout(() => {
          currentState = "  \ "
          Log("")
          timeout = setTimeout(() => {
            currentState = "  |"
            Log("")
            timeout = setTimeout(() => {
              currentState = "  /"
              Log("")
              timeout = setTimeout(() => {
                currentState = "  -"
                Log("")
                timeout = setTimeout(() => {
                  currentState = "  \ "
                  Log("")
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

async function DownloadGame(uri, data) {
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
      await extractRarArchive(`./common/${fileName}`, `${drive}:/Games/Lethal Company`);   
      ExecuteCommand("mods", data)
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
    await playAudioFile(audioFilePath);
  } catch (error) {
    console.log(error);
  }
}

async function ExecuteCommand(command, data) {
  const cmd = command.toLowerCase();
  if (command.split("").length >= 3) {
    if ("download".includes(cmd)) {
      currentState = "download"
      Log(chalk.hex("#4AF626").bold(`   Starting download...`));
      DownloadGame(data.data.uri, data);
    } else if ("mods".includes(cmd)) {
      currentState = "mods"
      Log(chalk.hex("#4AF626").bold(`   Downloading mods...`));
      var bar = new Promise(async (resolve, reject) => {
        await data.data.mods.forEach(async (element, index, array) => {
          await DownloadMod(element.name, element.uri);
          if (index === array.length -1) resolve();
        });
      });
      bar.then(async () => {
        DownloadCrack(data.data.crack)
      });      
    } else if ("crack".includes(cmd)) {
      currentState = "crack"
      Log(chalk.hex("#4AF626").bold(`   Downloading crack...`));
      await DownloadCrack(data.data.crack);   
    } else if ("help".includes(cmd)) {
      Init()
    } else if ("init".includes(cmd)) {
      Init()
    } else if ("start".includes(cmd)) {
      Init()
    } else {
      const filePath = path.join(__dirname, "assets/TerminalTypoError.wav");
      await playAudioFile(filePath);
      Log(chalk.hex("#4AF626").bold("\n\n   [There was no action supplied with the word.]\n\n"))
      const wait = prompt(chalk.hex("#4AF626").bold(`   `));
      ExecuteCommand(wait, data);
    }
  } else {
    const filePath = path.join(__dirname, "assets/TerminalTypoError.wav");
    await playAudioFile(filePath);
    Log(chalk.hex("#4AF626").bold("\n\n   [There was no action supplied with the word.]\n\n"))
    const wait = prompt(chalk.hex("#4AF626").bold(`   `));
    ExecuteCommand(wait, data);
  }
}

async function Init() {
  orange = true;
  const cpu = os.cpus()[0].model.replace(" CPU", "").split("");
  cpu.splice(cpu.indexOf("@") + 1, 100);
  const afilePath = path.join(__dirname, "assets/BootUp.wav");
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
    currentState = ``
    Log("")
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