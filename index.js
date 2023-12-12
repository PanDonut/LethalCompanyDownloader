import size from "window-size"
import chalk from "chalk";
import Downloader from "nodejs-file-downloader";
import promptSync from 'prompt-sync'; 
import path from "path"
import { fileURLToPath } from 'url';
import {playAudioFile} from 'audic';
import axios from "axios";
import * as fs from "fs";
import { createExtractorFromFile } from 'node-unrar-js'

const prompt = promptSync({sigint: true});

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

let currentState = "";

let lastProgress = 0;

let fileName = "";

async function Log(string) {
    console.clear();
    if (currentState != "") {
      console.log(chalk.bold.green(">" + currentState.toUpperCase() + "\n \n"));
    }
    console.log(chalk.bold.green(string));
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

async function DownloadGame(uri) {
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

async function ExecuteCommand(command, data) {
  const cmd = command.toLowerCase();
  if (command.split("").length >= 3) {
    if ("download".includes(cmd)) {
      currentState = "download"
      Log(chalk.bold.green(`   Starting download...`));
      DownloadGame(data.data.uri);
    } else if ("mods".includes(cmd)) {
      currentState = "mods"
      Log(chalk.bold.green(`   Downloading mods...`));
      await data.data.mods.forEach(async element => {
        await DownloadMod(element.name, element.uri);
      });
    } else {
      const filePath = path.join(__dirname, "TerminalTypoError.wav");
      await playAudioFile(filePath);
      Log(chalk.bold.green("   [There was no action supplied with the word.]\n\n"))
      const wait = prompt(chalk.bold.green(`   `));
      ExecuteCommand(wait, data);
    }
  } else {
    const filePath = path.join(__dirname, "TerminalTypoError.wav");
    await playAudioFile(filePath);
    Log(chalk.bold.green("   [There was no action supplied with the word.]\n\n"))
    const wait = prompt(chalk.bold.green(`   `));
    ExecuteCommand(wait, data);
  }
}

async function Init() {
  currentState = "init"
  await Log("");
  await Log("   Initializing...\n   ");
  const filePath = path.join(__dirname, "save.dat");
  const read = fs.existsSync(filePath);
  if (read == false) {
    await Log(chalk.bold.green(`\n\n\n   What's your favourite drive letter? \n\n\n`));
    const command = prompt(chalk.bold.green(`   >`));
    if (command.split("").length == 1) {
      await Log(chalk.bold.green(`\n\n\n   Alright, the disk that will be used is: ${command.toUpperCase()}\n\n\n   >`));
      await fs.writeFileSync(filePath, command.toUpperCase());
      setTimeout(async () => {
        Init();
      }, 2500)   
    } else {
      await Log(chalk.bold.green(`\n\n\n   That's not a disk letter, dumbass\n\n\n   >`));
      setTimeout(() => {
        Init();
      }, 2000)
    }
  } else {
    axios.get("https://raw.githubusercontent.com/PanDonut/LethalCompanyDownloader/main/meta.json").then(async data => {
      currentState = ""
      await Log(chalk.bold.green(`\n\n\n   >DOWNLOAD\n   To download the game. \n\n\n   >CRACK\n   To re-crack the game. \n\n\n   >MODS\n   To re-download the mods. \n\n\n`));
      const command = prompt(chalk.bold.green(`   >`));
      ExecuteCommand(command, data);
    })
  }
}

Init();