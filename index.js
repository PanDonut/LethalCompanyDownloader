import size from "window-size"
import chalk from "chalk";
import Downloader from "nodejs-file-downloader";
import promptSync from 'prompt-sync'; 
import path from "path"
import { fileURLToPath } from 'url';
import {playAudioFile} from 'audic';

const prompt = promptSync({sigint: true});

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

let currentState = "";

async function Log(string) {
    console.clear();
    if (currentState != "") {
      console.log(chalk.bold.green(">" + currentState.toUpperCase() + "\n \n"));
    }
    console.log(chalk.bold.green(string));
}

async function DownloadGame() {
    var s = JSON.stringify(size).split("");
    s.splice(0,9);
    s.splice(s.indexOf(","), 100)
    const downloader = new Downloader({
      url: "http://212.183.159.230/200MB.zip",
      directory: "./common",
      onProgress: function (percentage, chunk, remainingSize) {
        Log(`[${ "■".repeat(Math.round((percentage / 100) * (parseInt(s.join("")) - 2)) / 2) }${" ".repeat((parseInt(s.join("")) - 2) - (Math.floor((percentage / 100) * (parseInt(s.join("")) - 2)) / 2))}]
        \nRemaining: ${Math.ceil((remainingSize / 1024) / 1024)} mb
        `);
      },
    });
  
    try {
      await downloader.download();
      Log("")
    } catch (error) {
      console.log(error);
    }
}

async function Init() {
  currentState = "init"
  await Log("");
  await Log("   Initializing...\n   ");
  const timeout = setTimeout(async () => {
    currentState = ""
    await Log(chalk.bold.green(`\n\n\n   >DOWNLOAD\n   To download the game. \n\n\n   >CRACK\n   To re-crack the game. \n\n\n   >MODS\n   To re-download the mods. \n\n\n`));
    const command = prompt(chalk.bold.green(`   >`));
    currentState = command;
    switch (command.toLowerCase()) {
      case "download":
        Log(chalk.bold.green(`   Starting download...`));
        DownloadGame();
        break;
    
      default:
        const filePath = path.join(__dirname, "TerminalTypoError.wav");
        await playAudioFile(filePath);
        Log(chalk.bold.green("   [There was no action supplied with the word.]\n\n"))
        const wait = prompt(chalk.bold.green(`   `));
        if (wait.toLowerCase() == "help" || wait.toLowerCase() == "init" || wait.toLowerCase() == "start") {
          Init();
        }
        break;
    }  
  }, 2000)
}

Init();