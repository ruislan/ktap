import chalk from 'chalk';
import fs from 'fs';

const FILE_APP_LIST = 'appList';
const FILE_SKIP_LIST = 'skipList';
const FILE_GAME_LIST = 'gameList';
const FILE_FETCHED_GAME_LIST = 'fetchedGameList';

const sleep = async (seconds = 5) => {
    return new Promise(resolve => {
        let countDown = seconds;
        const timer = setInterval(() => {
            console.log(countDown);
            if (countDown === 0) {
                clearInterval(timer);
                resolve();
            }
            countDown -= 1;
        }, 1000);
    }); // 5s
}

const fetchAppList = async () => {
    console.log(chalk.green('获取Steam App List数据...'));
    const res = await fetch('https://api.steampowered.com/ISteamApps/GetAppList/v2');
    const json = await res.json();
    const appList = json['applist']['apps'].map(app => app.appid).join('\n');
    console.log(chalk.green('存储Steam App List数据...'));
    fs.writeFileSync(FILE_APP_LIST, appList, 'utf-8');
    console.log(chalk.green(`完成存储，查看文件${FILE_APP_LIST}`));
};

const fetchWithRetry = async (url, options, retryCount = 5) => {
    try {
        return await fetch(url, options);
    } catch (error) {
        if (retryCount === 0) {
            console.log(chalk.red(`获取链接${url}失败。`));
            throw new Error(error);
        }
        console.log(chalk.yellow(`获取链接${url}错误, 3秒后重试，剩余次数${retryCount}`));
        await sleep(3);
        return await fetchWithRetry(url, options, retryCount - 1);
    }
};

const main = async () => {
    // parse args
    const cmd = process.argv[2];
    if (cmd === 'apps') {
        await fetchAppList();
    } else {
        const buf = fs.readFileSync(FILE_APP_LIST, 'utf-8');
        const appList = buf.toString().split('\n');
        // read skip list
        const fetchedBuf = fs.readFileSync(FILE_FETCHED_GAME_LIST, 'utf-8');
        const skipBuf = fs.readFileSync(FILE_SKIP_LIST, 'utf-8');
        const skipSet = new Set([...skipBuf.toString().split('\n'), ...fetchedBuf.toString().split('\n')]);

        for (const appId of appList) {
            if (skipSet.has(appId)) continue;
            console.log(chalk.green(`开始获取游戏 ID：${appId}`));
            const res = await fetchWithRetry(`https://store.steampowered.com/api/appdetails?l=chinese&appids=${appId}`, { headers: { 'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8' }, timeout: 10000 });
            console.log(chalk.green(`获取游戏 ID： ${appId} 完成，开始写入...`));
            const json = await res.json();
            const app = json[appId];
            if (!app.success || app.data.type !== 'game' || app.data.release_date.coming_soon) {
                skipSet.add(appId);
                fs.appendFileSync(FILE_SKIP_LIST, appId + '\n', 'utf-8');
                console.log(chalk.green(`游戏 ID： ${appId} 获取失败或者非游戏或者还未发售，跳过`));
            } else {
                fs.appendFileSync(FILE_GAME_LIST, `${appId}|${Buffer.from(JSON.stringify(json)).toString('base64')} \n`, 'utf-8');
                fs.appendFileSync(FILE_FETCHED_GAME_LIST, appId + '\n', 'utf-8');
                console.log(chalk.green(`写入游戏 ${app.data.name} 完成`));
            }
            // sleep for the steam net rate limitation
            console.log(chalk.green('等待5秒，以防Steam的API频率限制：'));
            await sleep(5);
        }
    }
    process.exit(0);
};

main();