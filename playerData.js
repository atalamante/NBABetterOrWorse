import fetch from "node-fetch";
import * as cheerio from "cheerio";
import connectToDatabase from "./database.js";

const playerArray = [];
const link = "https://www.basketball-reference.com";
var database = null;

class Player {
    constructor(name, fromYr, toYr, games, minutes, points, rebounds, assists, steals, blocks, fieldGoal, threePoint, freeThrow, winShare, winShare48, link) {
        this.name = name;
        this.fromYr = fromYr;
        this.toYr = toYr;
        this.games = games;
        this.minutes = minutes;
        this.points = points;
        this.rebounds = rebounds;
        this.assists = assists;
        this.steals = steals;
        this.blocks = blocks;
        this.fieldGoal = fieldGoal;
        this.threePoint = threePoint;
        this.freeThrow = freeThrow;
        this.winShare = winShare;
        this.winShare48 = winShare48;
        this.link = link;
    }
}

const getPlayerData = async () => {
    const response = await fetch("https://www.basketball-reference.com/awards/nba_75th_anniversary.html");
    const body = await response.text();
    
    const $ = cheerio.load(body);

    const table = $("table");

    table.find("tr").each((i, row) => {
        let currRow = [];
        const playerCell = $(row).find("th");
        const playerName = playerCell.find("a").text();
        const playerLink = playerCell.find("a").attr("href");
        if (playerLink != null) {
            currRow.push(playerName);
            $(row).find("td").each((j, cell) => {
                currRow.push($(cell).text());
            });
            currRow.push(playerLink)
            console.log(currRow);
            const [name, fromYr, toYr, games, minutes, points, rebounds, assists, steals, blocks, fieldGoal, threePoint, freeThrow, winShare, winShare48, playerLinkBR] = currRow;
            playerArray.push(new Player(name, fromYr, toYr, games, minutes, points, rebounds, assists, steals, blocks, fieldGoal, threePoint, freeThrow, winShare, winShare48, playerLinkBR));
            // playerArray.push(currRow);
        }
    });
    console.log(playerArray);
}

async function getPlayerAwards() {
    let count = 0;
    const dbCollection = database.collection('players');
    for (const player of playerArray) {
        const response = await fetch(link + player.link);
        const body = await response.text();
        const $ = cheerio.load(body);
        const listItems = $("#bling li");
        const results = listItems.map((i, item) => {
            return $(item).text().trim();
        }).get();
        player['accolades'] = results;
        console.log(player);
        await dbCollection.insertOne(player);
        console.log("Data inserted!");
        count += 1;
        if (count >= 10) {
            await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000));
            count = 0;
        }
    }   
}

async function main() {
    database = await connectToDatabase();
}

main();

await getPlayerData();
getPlayerAwards();