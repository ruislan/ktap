import * as cheerio from 'cheerio';
import { AppLanguages, AppMedia, AppPlatform, SocialLinkBrands, TagCategory } from '../constants.js';

const steam = {
    async parseGameDetailToPrismaData(json) {
        const steamAppId = Object.keys(json)[0];
        const steamApp = json[steamAppId].data;
        if (!steamApp) return null;
        // app & refs
        const newApp = {
            isVisible: false,
            name: steamApp.name,
            description: steamApp.detailed_description.replace('https://steamcommunity.com/linkfilter/?url=', ''),
            summary: steamApp.short_description,
            legalText: steamApp.legal_notice,
            downloadUrl: `https://store.steampowered.com/app/${steamApp.steam_appid}`,
        };
        newApp.slogan = (newApp.summary && newApp.summary.slice(0, 8)) || '';

        if (!steamApp.release_date.coming_soon) {
            const date = Date.parse(steamApp.release_date.date);
            if (date > 0) newApp.releasedAt = new Date(date);
            else {
                const yearIdx = steamApp.release_date.date.indexOf('年');
                const monthIdx = steamApp.release_date.date.indexOf('月');
                const dayIdx = steamApp.release_date.date.indexOf('日');
                const year = Number(steamApp.release_date.date.slice(0, yearIdx));
                const month = Number(steamApp.release_date.date.slice(yearIdx + 1, monthIdx));
                const day = Number(steamApp.release_date.date.slice(monthIdx + 1, dayIdx));
                newApp.releasedAt = new Date(year, month - 1, day); // "2019 年 11 月 15 日"
            }
        };

        newApp.socialLinks = { create: [{ brand: SocialLinkBrands.site.id, name: SocialLinkBrands.site.name, url: steamApp.website || newApp.downloadUrl }] };
        newApp.media = {
            create: [
                { type: AppMedia.type.image, image: steamApp.header_image, thumbnail: steamApp.header_image, usage: AppMedia.usage.head },
                { type: AppMedia.type.image, image: `https://media.st.dl.eccdnx.com/steam/apps/${steamApp.steam_appid}/capsule_616x353.jpg`, thumbnail: `https://media.st.dl.eccdnx.com/steam/apps/${steamApp.steam_appid}/capsule_616x353.jpg`, usage: AppMedia.usage.landscape },
                { type: AppMedia.type.image, image: `https://media.st.dl.eccdnx.com/steam/apps/${steamApp.steam_appid}/capsule_616x353.jpg`, thumbnail: `https://media.st.dl.eccdnx.com/steam/apps/${steamApp.steam_appid}/capsule_616x353.jpg`, usage: AppMedia.usage.portrait },
                { type: AppMedia.type.image, image: `https://media.st.dl.eccdnx.com/steam/apps/${steamApp.steam_appid}/capsule_616x353.jpg`, thumbnail: `https://media.st.dl.eccdnx.com/steam/apps/${steamApp.steam_appid}/capsule_616x353.jpg`, usage: AppMedia.usage.logo },
            ]
        };
        if (steamApp.movies) {
            for (const movie of steamApp.movies) {
                const video = movie.webm ? movie.webm.max : movie.mp4.max;
                newApp.media.create.push({ type: AppMedia.type.video, video, image: movie.thumbnail, thumbnail: movie.thumbnail, usage: AppMedia.usage.gallery });
            }
        }
        if (steamApp.screenshots) {
            for (const screenshot of steamApp.screenshots) {
                newApp.media.create.push({ type: AppMedia.type.image, image: screenshot.path_full, thumbnail: screenshot.path_thumbnail, usage: AppMedia.usage.gallery });
            }
        }
        if (steamApp.metacritic) {
            newApp.proReviews = {
                create: [
                    { name: 'metacritic', score: '' + steamApp.metacritic.score, url: steamApp.metacritic.url, summary: '' + steamApp.metacritic.score }
                ]
            };
        }

        // platforms
        newApp.platforms = { create: [] };
        const parseRequirement = (minimumHtml, recommendedHtml) => {
            const requirements = [];
            const minimum = minimumHtml ? cheerio.load(minimumHtml) : null;
            const recommended = recommendedHtml ? cheerio.load(recommendedHtml) : null;
            if (minimum) {
                minimum('ul li').each((i, el) => {
                    const text = minimum(el).text();
                    const [key, value] = text.split(':').map(t => t.trim());
                    if (['操作系统', '处理器', '内存', '显卡', 'DirectX', '网络', '存储空间', '附注事项', '备注'].includes(key)) requirements.push({ name: key, minimum: value });
                });
            }
            if (recommended) {
                recommended('ul li').each((i, el) => {
                    const text = recommended(el).text();
                    const [key, value] = text.split(':').map(t => t.trim());
                    const requirement = requirements.find(r => r.name === key);
                    if (requirement) requirement.recommended = value;
                });
            }

            return requirements;
        };
        if (steamApp.platforms.windows) {
            const requirements = parseRequirement(steamApp.pc_requirements.minimum, steamApp.pc_requirements.recommended);
            if (requirements.length > 0) newApp.platforms.create.push({ os: AppPlatform.os.windows, requirements: JSON.stringify(requirements) });
        }
        if (steamApp.platforms.mac) {
            const requirements = parseRequirement(steamApp.mac_requirements.minimum, steamApp.mac_requirements.recommended);
            if (requirements.length > 0) newApp.platforms.create.push({ os: AppPlatform.os.macos, requirements: JSON.stringify(requirements) });
        }
        if (steamApp.platforms.linux) {
            const requirements = parseRequirement(steamApp.linux_requirements.minimum, steamApp.linux_requirements.recommended);
            if (requirements.length > 0) newApp.platforms.create.push({ os: AppPlatform.os.linux, requirements: JSON.stringify(requirements) });
        }

        // languages
        if (steamApp.supported_languages) {
            const languages = steamApp.supported_languages.split(',');
            const text = [];
            const audio = [];
            for (const language of languages) {
                const sl = AppLanguages.supported.find(s => language.includes(s.id));
                if (sl) {
                    text.push(sl.name);
                    if (language.includes('*')) audio.push(sl.name);
                }
            }
            newApp.languages = { create: { text: text.join(','), audio: audio.join(',') } };
        }

        // organizations
        if (steamApp.developers) {
            newApp.developers = { create: [] };
            for (const developer of steamApp.developers) {
                newApp.developers.create.push({
                    organization: {
                        connectOrCreate: { where: { name: developer }, create: { name: developer } }
                    }
                });
            }
        }
        if (steamApp.publishers) {
            newApp.publishers = { create: [] };
            for (const publisher of steamApp.publishers) {
                newApp.publishers.create.push({
                    organization: {
                        connectOrCreate: { where: { name: publisher }, create: { name: publisher } }
                    }
                });
            }
        }

        // features
        if (steamApp.categories) {
            newApp.features = { create: [] };
            for (const category of steamApp.categories) {
                newApp.features.create.push({
                    tag: {
                        connectOrCreate: {
                            where: { name: category.description },
                            create: { name: category.description, category: TagCategory.feature },
                        },
                    }
                });
            }
        }

        // genres
        if (steamApp.genres) {
            newApp.genres = { create: [] };
            for (const genre of steamApp.genres) {
                newApp.genres.create.push({
                    tag: {
                        connectOrCreate: {
                            where: { name: genre.description },
                            create: { name: genre.description, category: TagCategory.genre },
                        }
                    }
                });
            }
        }
        return newApp;
    }

};


export default steam;
