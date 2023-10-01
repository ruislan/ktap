import prisma from '@prisma/client';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import steam from '../src/lib/steam.js';
import { parseArgs } from "node:util";
import { AchievementTypes } from '../src/models/achievement.js';

const db = new prisma.PrismaClient({ log: ['error', 'warn'] });
await db.$connect();

const passwordHash = await bcrypt.hash('123123', 10);

const users = [
    {
        id: 1, name: 'admin', email: 'admin@ktap.com', phone: '123456789', password: passwordHash, isActivated: true, gender: 'MAN',
        avatar: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=admin&size=256',
        bio: 'I am the admin', birthday: new Date(), createdAt: new Date(), updatedAt: new Date(),
        isAdmin: true,
        balance: 1000,
    },
    {
        id: 2, name: 'user1', email: 'user1@ktap.com', phone: '123456789', password: passwordHash, isActivated: true, gender: 'MAN',
        avatar: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=user1&size=256',
        bio: 'I am user2 and I am rich', birthday: new Date(), createdAt: new Date(), updatedAt: new Date(),
        balance: 1000,
    },
    {
        id: 3, name: 'user2', email: 'user2@ktap.com', phone: '123456789', password: passwordHash, isActivated: true, gender: 'MAN',
        avatar: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=user2&size=256',
        bio: 'I am user3 and I am rich', birthday: new Date(), createdAt: new Date(), updatedAt: new Date(),
        balance: 0,
    }
];

// 添加组织
const organizations = [
    { id: 1, name: "早哈哈独立开发者", summary: '没啥说的，就是强', logo: 'https://avatars.st.dl.eccdnx.com/5f4b7a6439548f5513fc72968dae2217309e3d54_full.jpg', site: 'https://store.steampowered.com/publisher/valve/', type: 'individual', userId: 1 },
    { id: 2, name: "玩哈哈游戏工作室", summary: '没啥说的，就是强', logo: 'https://avatars.st.dl.eccdnx.com/5f4b7a6439548f5513fc72968dae2217309e3d54_full.jpg', site: 'https://store.steampowered.com/publisher/valve/', type: 'studio', userId: 2 },
    { id: 3, name: "富哈哈游戏公司", summary: '没啥说的，就是强', logo: 'https://avatars.st.dl.eccdnx.com/5f4b7a6439548f5513fc72968dae2217309e3d54_full.jpg', site: 'https://store.steampowered.com/publisher/valve/', type: 'company', userId: 3 },
    { id: 4, name: "多哈哈游戏发行公司", summary: '没啥说的，就是强', logo: 'https://avatars.st.dl.eccdnx.com/5f4b7a6439548f5513fc72968dae2217309e3d54_full.jpg', site: 'https://store.steampowered.com/publisher/valve/', type: 'company', userId: 1 },
];

// App应用
const apps = [
    {
        id: 1, name: '封神榜之风云再起',
        slogan: '令你热血沸腾的游戏',
        summary: '非常好玩，非常非常非常好玩，下它，玩它。', score: 4.6,
        downloadUrl: 'https://apps.apple.com/cn/app/id639516529?ct=Tap54031', releasedAt: new Date(), legalText: '版权所有，翻版必究', isVisible: true,
        description: `
            <h2>非常新鲜的玩法</h2>
            <p>《一念逍遥》是一款水墨画风修仙放置游戏，让你随时随地踏入仙途，轻松体验修仙日常。在这里你将扮演一位寻仙问道的人魔后裔，一方面通过努力修炼，摆脱肉体桎梏，渡劫逆袭成仙；一方面御剑寻山访水，结交天下道友，揭开身世之谜。</p>
            <p>游戏围绕“修仙”设计了许多内容，并通过挂机的玩法，让你轻松实现修仙梦。</p>
            <p>开局先选修炼方向，崇尚极致武道选炼体，追求天地五行则选修法。确定修炼方向后，就算正式踏上长生路了。
            自此，你跟着师父一起，习神通集古宝，御灵兽种灵植。去各大秘境历练，挑战上古妖兽，切磋同门兄弟。仙丹灵器自己炼，一日筑基成功，三日突破元婴！
            待到合适之时，便可下山闯荡。
            或做个自由散人，巧遇福地机缘，逍遥天下；或自立山头，与好友开宗立派，称霸天下。</p>
            <h2>非常新鲜的玩法</h2>
            <img src="https://cdn.cloudflare.steamstatic.com/steam/apps/289070/ss_cf53258cb8c4d283e52cf8dce3edf8656f83adc6.600x338.jpg?t=1643315625"></img>
            <p>开局先选修炼方向，崇尚极致武道选炼体，追求天地五行则选修法。确定修炼方向后，就算正式踏上长生路了。
            自此，你跟着师父一起，习神通集古宝，御灵兽种灵植。去各大秘境历练，挑战上古妖兽，切磋同门兄弟。仙丹灵器自己炼，一日筑基成功，三日突破元婴！
            待到合适之时，便可下山闯荡。
            或做个自由散人，巧遇福地机缘，逍遥天下；或自立山头，与好友开宗立派，称霸天下。</p>
            <h2>非常新鲜的玩法</h2>
            <img src="https://cdn.cloudflare.steamstatic.com/steam/apps/289070/ss_cf53258cb8c4d283e52cf8dce3edf8656f83adc6.600x338.jpg?t=1643315625"></img>
            <p>开局先选修炼方向，崇尚极致武道选炼体，追求天地五行则选修法。确定修炼方向后，就算正式踏上长生路了。
            自此，你跟着师父一起，习神通集古宝，御灵兽种灵植。去各大秘境历练，挑战上古妖兽，切磋同门兄弟。仙丹灵器自己炼，一日筑基成功，三日突破元婴！
            待到合适之时，便可下山闯荡。
            或做个自由散人，巧遇福地机缘，逍遥天下；或自立山头，与好友开宗立派，称霸天下。</p>
        `,
    },
    {
        id: 2, name: '罪恶都市3',
        slogan: '来尽情解谜推理',
        summary: '非常好玩，非常非常非常好玩，下它，玩它。', score: 3.7,
        downloadUrl: 'https://apps.apple.com/cn/app/id639516529?ct=Tap54031', releasedAt: new Date(), legalText: '版权所有，翻版必究', isVisible: true,
        description: `
            <h2>非常新鲜的玩法</h2>
            <p>《一念逍遥》是一款水墨画风修仙放置游戏，让你随时随地踏入仙途，轻松体验修仙日常。在这里你将扮演一位寻仙问道的人魔后裔，一方面通过努力修炼，摆脱肉体桎梏，渡劫逆袭成仙；一方面御剑寻山访水，结交天下道友，揭开身世之谜。</p>
            <p>游戏围绕“修仙”设计了许多内容，并通过挂机的玩法，让你轻松实现修仙梦。</p>
            <p>开局先选修炼方向，崇尚极致武道选炼体，追求天地五行则选修法。确定修炼方向后，就算正式踏上长生路了。
            自此，你跟着师父一起，习神通集古宝，御灵兽种灵植。去各大秘境历练，挑战上古妖兽，切磋同门兄弟。仙丹灵器自己炼，一日筑基成功，三日突破元婴！
            待到合适之时，便可下山闯荡。
            或做个自由散人，巧遇福地机缘，逍遥天下；或自立山头，与好友开宗立派，称霸天下。</p>
            <h2>非常新鲜的玩法</h2>
            <img src="https://cdn.cloudflare.steamstatic.com/steam/apps/289070/ss_cf53258cb8c4d283e52cf8dce3edf8656f83adc6.600x338.jpg?t=1643315625"></img>
            <p>开局先选修炼方向，崇尚极致武道选炼体，追求天地五行则选修法。确定修炼方向后，就算正式踏上长生路了。
            自此，你跟着师父一起，习神通集古宝，御灵兽种灵植。去各大秘境历练，挑战上古妖兽，切磋同门兄弟。仙丹灵器自己炼，一日筑基成功，三日突破元婴！
            待到合适之时，便可下山闯荡。
            或做个自由散人，巧遇福地机缘，逍遥天下；或自立山头，与好友开宗立派，称霸天下。</p>
            <h2>非常新鲜的玩法</h2>
            <img src="https://cdn.cloudflare.steamstatic.com/steam/apps/289070/ss_cf53258cb8c4d283e52cf8dce3edf8656f83adc6.600x338.jpg?t=1643315625"></img>
            <p>开局先选修炼方向，崇尚极致武道选炼体，追求天地五行则选修法。确定修炼方向后，就算正式踏上长生路了。
            自此，你跟着师父一起，习神通集古宝，御灵兽种灵植。去各大秘境历练，挑战上古妖兽，切磋同门兄弟。仙丹灵器自己炼，一日筑基成功，三日突破元婴！
            待到合适之时，便可下山闯荡。
            或做个自由散人，巧遇福地机缘，逍遥天下；或自立山头，与好友开宗立派，称霸天下。</p>
        `,
    },
    {
        id: 3, name: '无敌小可爱Zoo',
        slogan: '游戏都能这么可爱',
        summary: '非常好玩，非常非常非常好玩，下它，玩它。', score: 2.2,
        downloadUrl: 'https://apps.apple.com/cn/app/id639516529?ct=Tap54031', releasedAt: new Date(), legalText: '版权所有，翻版必究', isVisible: true,
        description: `
            <h2>非常新鲜的玩法</h2>
            <p>《一念逍遥》是一款水墨画风修仙放置游戏，让你随时随地踏入仙途，轻松体验修仙日常。在这里你将扮演一位寻仙问道的人魔后裔，一方面通过努力修炼，摆脱肉体桎梏，渡劫逆袭成仙；一方面御剑寻山访水，结交天下道友，揭开身世之谜。</p>
            <p>游戏围绕“修仙”设计了许多内容，并通过挂机的玩法，让你轻松实现修仙梦。</p>
            <p>开局先选修炼方向，崇尚极致武道选炼体，追求天地五行则选修法。确定修炼方向后，就算正式踏上长生路了。
            自此，你跟着师父一起，习神通集古宝，御灵兽种灵植。去各大秘境历练，挑战上古妖兽，切磋同门兄弟。仙丹灵器自己炼，一日筑基成功，三日突破元婴！
            待到合适之时，便可下山闯荡。
            或做个自由散人，巧遇福地机缘，逍遥天下；或自立山头，与好友开宗立派，称霸天下。</p>
            <h2>非常新鲜的玩法</h2>
            <img src="https://cdn.cloudflare.steamstatic.com/steam/apps/289070/ss_cf53258cb8c4d283e52cf8dce3edf8656f83adc6.600x338.jpg?t=1643315625"></img>
            <p>开局先选修炼方向，崇尚极致武道选炼体，追求天地五行则选修法。确定修炼方向后，就算正式踏上长生路了。
            自此，你跟着师父一起，习神通集古宝，御灵兽种灵植。去各大秘境历练，挑战上古妖兽，切磋同门兄弟。仙丹灵器自己炼，一日筑基成功，三日突破元婴！
            待到合适之时，便可下山闯荡。
            或做个自由散人，巧遇福地机缘，逍遥天下；或自立山头，与好友开宗立派，称霸天下。</p>
            <h2>非常新鲜的玩法</h2>
            <img src="https://cdn.cloudflare.steamstatic.com/steam/apps/289070/ss_cf53258cb8c4d283e52cf8dce3edf8656f83adc6.600x338.jpg?t=1643315625"></img>
            <p>开局先选修炼方向，崇尚极致武道选炼体，追求天地五行则选修法。确定修炼方向后，就算正式踏上长生路了。
            自此，你跟着师父一起，习神通集古宝，御灵兽种灵植。去各大秘境历练，挑战上古妖兽，切磋同门兄弟。仙丹灵器自己炼，一日筑基成功，三日突破元婴！
            待到合适之时，便可下山闯荡。
            或做个自由散人，巧遇福地机缘，逍遥天下；或自立山头，与好友开宗立派，称霸天下。</p>
        `,
    },
    {
        id: 4, name: '大明神',
        slogan: '神的世界人的战争',
        summary: '《文明VI》提供了多种新方式让您与世界互动、在地图上扩张城市、发展文明，以及对抗历史上的伟大领袖，以建立起经得起时间考验的强盛文明。共有20位史上著名的领袖任君挑选，包括秦始皇。', score: 1.5,
        downloadUrl: 'https://apps.apple.com/cn/app/id639516529?ct=Tap54031', releasedAt: new Date(), legalText: '版权所有，翻版必究', isVisible: true,
        description: `
            <h2>非常新鲜的玩法</h2>
            <p>《一念逍遥》是一款水墨画风修仙放置游戏，让你随时随地踏入仙途，轻松体验修仙日常。在这里你将扮演一位寻仙问道的人魔后裔，一方面通过努力修炼，摆脱肉体桎梏，渡劫逆袭成仙；一方面御剑寻山访水，结交天下道友，揭开身世之谜。</p>
            <p>游戏围绕“修仙”设计了许多内容，并通过挂机的玩法，让你轻松实现修仙梦。</p>
            <p>开局先选修炼方向，崇尚极致武道选炼体，追求天地五行则选修法。确定修炼方向后，就算正式踏上长生路了。
            自此，你跟着师父一起，习神通集古宝，御灵兽种灵植。去各大秘境历练，挑战上古妖兽，切磋同门兄弟。仙丹灵器自己炼，一日筑基成功，三日突破元婴！
            待到合适之时，便可下山闯荡。
            或做个自由散人，巧遇福地机缘，逍遥天下；或自立山头，与好友开宗立派，称霸天下。</p>
            <h2>非常新鲜的玩法</h2>
            <img src="https://cdn.cloudflare.steamstatic.com/steam/apps/289070/ss_cf53258cb8c4d283e52cf8dce3edf8656f83adc6.600x338.jpg?t=1643315625"></img>
            <p>开局先选修炼方向，崇尚极致武道选炼体，追求天地五行则选修法。确定修炼方向后，就算正式踏上长生路了。
            自此，你跟着师父一起，习神通集古宝，御灵兽种灵植。去各大秘境历练，挑战上古妖兽，切磋同门兄弟。仙丹灵器自己炼，一日筑基成功，三日突破元婴！
            待到合适之时，便可下山闯荡。
            或做个自由散人，巧遇福地机缘，逍遥天下；或自立山头，与好友开宗立派，称霸天下。</p>
            <h2>非常新鲜的玩法</h2>
            <img src="https://cdn.cloudflare.steamstatic.com/steam/apps/289070/ss_cf53258cb8c4d283e52cf8dce3edf8656f83adc6.600x338.jpg?t=1643315625"></img>
            <p>开局先选修炼方向，崇尚极致武道选炼体，追求天地五行则选修法。确定修炼方向后，就算正式踏上长生路了。
            自此，你跟着师父一起，习神通集古宝，御灵兽种灵植。去各大秘境历练，挑战上古妖兽，切磋同门兄弟。仙丹灵器自己炼，一日筑基成功，三日突破元婴！
            待到合适之时，便可下山闯荡。
            或做个自由散人，巧遇福地机缘，逍遥天下；或自立山头，与好友开宗立派，称霸天下。</p>
        `,
    },
    {
        id: 5, name: '天龙世界',
        slogan: '八部众风云再起',
        summary: '非常好玩，非常非常非常好玩，下它，玩它。', score: 4.9,
        downloadUrl: 'https://apps.apple.com/cn/app/id639516529?ct=Tap54031', releasedAt: new Date(), legalText: '版权所有，翻版必究', isVisible: true,
        description: `
            <h2>非常新鲜的玩法</h2>
            <p>《一念逍遥》是一款水墨画风修仙放置游戏，让你随时随地踏入仙途，轻松体验修仙日常。在这里你将扮演一位寻仙问道的人魔后裔，一方面通过努力修炼，摆脱肉体桎梏，渡劫逆袭成仙；一方面御剑寻山访水，结交天下道友，揭开身世之谜。</p>
            <p>游戏围绕“修仙”设计了许多内容，并通过挂机的玩法，让你轻松实现修仙梦。</p>
            <p>开局先选修炼方向，崇尚极致武道选炼体，追求天地五行则选修法。确定修炼方向后，就算正式踏上长生路了。
            自此，你跟着师父一起，习神通集古宝，御灵兽种灵植。去各大秘境历练，挑战上古妖兽，切磋同门兄弟。仙丹灵器自己炼，一日筑基成功，三日突破元婴！
            待到合适之时，便可下山闯荡。
            或做个自由散人，巧遇福地机缘，逍遥天下；或自立山头，与好友开宗立派，称霸天下。</p>
            <h2>非常新鲜的玩法</h2>
            <img src="https://cdn.cloudflare.steamstatic.com/steam/apps/289070/ss_cf53258cb8c4d283e52cf8dce3edf8656f83adc6.600x338.jpg?t=1643315625"></img>
            <p>开局先选修炼方向，崇尚极致武道选炼体，追求天地五行则选修法。确定修炼方向后，就算正式踏上长生路了。
            自此，你跟着师父一起，习神通集古宝，御灵兽种灵植。去各大秘境历练，挑战上古妖兽，切磋同门兄弟。仙丹灵器自己炼，一日筑基成功，三日突破元婴！
            待到合适之时，便可下山闯荡。
            或做个自由散人，巧遇福地机缘，逍遥天下；或自立山头，与好友开宗立派，称霸天下。</p>
            <h2>非常新鲜的玩法</h2>
            <img src="https://cdn.cloudflare.steamstatic.com/steam/apps/289070/ss_cf53258cb8c4d283e52cf8dce3edf8656f83adc6.600x338.jpg?t=1643315625"></img>
            <p>开局先选修炼方向，崇尚极致武道选炼体，追求天地五行则选修法。确定修炼方向后，就算正式踏上长生路了。
            自此，你跟着师父一起，习神通集古宝，御灵兽种灵植。去各大秘境历练，挑战上古妖兽，切磋同门兄弟。仙丹灵器自己炼，一日筑基成功，三日突破元婴！
            待到合适之时，便可下山闯荡。
            或做个自由散人，巧遇福地机缘，逍遥天下；或自立山头，与好友开宗立派，称霸天下。</p>
        `,
    }
];

// 开发商与App关联
const appDeveloperRef = [
    { appId: 1, organizationId: 1 },
    { appId: 2, organizationId: 2 },
    { appId: 4, organizationId: 1 },
    { appId: 5, organizationId: 2 },
];

// 发行商与App关联
const appPublisherRef = [
    { appId: 1, organizationId: 4 },
    { appId: 2, organizationId: 4 },
    { appId: 3, organizationId: 4 },
    { appId: 4, organizationId: 4 },
    { appId: 5, organizationId: 4 },
];

// 标签
const tags = [
    { id: 1, name: '动作', category: 'genre', },
    { id: 2, name: '角色扮演', category: 'genre', },
    { id: 3, name: '成就', category: 'feature', },
    { id: 4, name: '单人', category: 'feature', },
    { id: 5, name: '多人', category: 'feature', },
    { id: 6, name: '多人在线游戏', category: 'feature', },
    { id: 7, name: '合作', category: 'feature', },
    { id: 8, name: '竞技', category: 'feature', },
    { id: 9, name: '跨平台', category: 'feature', },
    { id: 10, name: '云存储', category: 'feature', },
    { id: 11, name: '支持手柄', category: 'feature', },
    { id: 12, name: '2023最佳游戏', category: 'normal', },
    { id: 13, name: '手感不错', category: 'normal', },
    { id: 14, name: '画面很强', category: 'normal', },
    { id: 15, name: '玩得停不下来', category: 'normal', },
];

const appGenreRef = [
    { appId: 1, tagId: 1 },
    { appId: 1, tagId: 2 },
    { appId: 2, tagId: 1 },
    { appId: 2, tagId: 2 },
    { appId: 3, tagId: 1 },
    { appId: 3, tagId: 2 },
    { appId: 4, tagId: 1 },
    { appId: 5, tagId: 2 },
];
const appFeatureRef = [
    { appId: 1, tagId: 3 },
    { appId: 1, tagId: 4 },
    { appId: 2, tagId: 3 },
    { appId: 2, tagId: 4 },
    { appId: 3, tagId: 3 },
    { appId: 3, tagId: 4 },
    { appId: 4, tagId: 3 },
    { appId: 5, tagId: 4 },
];

// 用户给APP的标签关联
const appUserTagRef = [
    { appId: 1, tagId: 12, userId: 1 },
    { appId: 1, tagId: 13, userId: 1 },
    { appId: 1, tagId: 14, userId: 1 },
    { appId: 1, tagId: 15, userId: 1 },
    { appId: 2, tagId: 12, userId: 1 },
    { appId: 2, tagId: 13, userId: 1 },
    { appId: 2, tagId: 14, userId: 1 },
    { appId: 2, tagId: 15, userId: 1 },
    { appId: 3, tagId: 13, userId: 1 },
    { appId: 3, tagId: 14, userId: 1 },
    { appId: 3, tagId: 15, userId: 1 },
    { appId: 4, tagId: 14, userId: 1 },
    { appId: 4, tagId: 15, userId: 1 },
    { appId: 5, tagId: 15, userId: 1 },
];

// 媒体资源（形象图片/主宣传图/小宣传图/屏幕截图/宣传视频等等)
// 媒体用途：头图（Head）、宣传横图（Landscape）、宣传竖图（Portrait）、画廊（Gallery)、品牌商标（Logo）
const appMedia = [
    {
        id: 1, appId: 1,
        image: 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg',
        thumbnail: 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg',
        usage: 'head'
    },
    {
        id: 2, appId: 1,
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/ss_b1a1cb7959d6a0e6fcb2d06ebf97a66c9055cef3.600x338.jpg?t=1618856444',
        thumbnail: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/ss_b1a1cb7959d6a0e6fcb2d06ebf97a66c9055cef3.600x338.jpg?t=1618856444',
        usage: 'landscape'
    },
    {
        id: 3, appId: 1, video: 'https://media.st.dl.eccdnx.com/steam/apps/256888216/movie_max_vp9.webm?t=1653420851',
        image: 'https://media.st.dl.eccdnx.com/steam/apps/256857791/movie.293x165.jpg?t=1635429726',
        thumbnail: 'https://media.st.dl.eccdnx.com/steam/apps/256857791/movie.184x123.jpg?t=1635429726',
        usage: 'gallery', type: 'video',
    },
    {
        id: 4, appId: 1,
        image: 'https://media.st.dl.eccdnx.com/steam/apps/1178830/ss_8012f15b18bbf952ba38826426f37d745a6a2dd0.600x338.jpg?t=1674881156',
        thumbnail: 'https://media.st.dl.eccdnx.com/steam/apps/1178830/ss_8012f15b18bbf952ba38826426f37d745a6a2dd0.600x338.jpg?t=1674881156',
        usage: 'gallery'
    },
    {
        id: 5, appId: 1,
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/ss_b1a1cb7959d6a0e6fcb2d06ebf97a66c9055cef3.600x338.jpg?t=1618856444',
        thumbnail: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/ss_b1a1cb7959d6a0e6fcb2d06ebf97a66c9055cef3.600x338.jpg?t=1618856444',
        usage: 'gallery'
    },
    {
        id: 6, appId: 1,
        image: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_e80a907c2c43337e53316c71555c3c3035a1343e.600x338.jpg?t=1646817776',
        thumbnail: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_e80a907c2c43337e53316c71555c3c3035a1343e.600x338.jpg?t=1646817776',
        usage: 'gallery'
    },
    {
        id: 7, appId: 1,
        image: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_3e556415d1bda00d749b2166ced264bec76f06ee.600x338.jpg?t=1646817776',
        thumbnail: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_3e556415d1bda00d749b2166ced264bec76f06ee.600x338.jpg?t=1646817776',
        usage: 'gallery'
    },
    {
        id: 8, appId: 1,
        image: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_ae44317e3bd07b7690b4d62cc5d0d1df30367a91.600x338.jpg?t=1646817776',
        thumbnail: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_ae44317e3bd07b7690b4d62cc5d0d1df30367a91.600x338.jpg?t=1646817776',
        usage: 'gallery'
    },
    {
        id: 9, appId: 1,
        image: 'https://cdn2.unrealengine.com/egs-en-genshin-impact-2-5-thumb-1200x1600-1200x1600-2762bd19b910.jpg',
        thumbnail: 'https://cdn2.unrealengine.com/egs-en-genshin-impact-2-5-thumb-1200x1600-1200x1600-2762bd19b910.jpg',
        usage: 'portrait'
    },
    {
        id: 10, appId: 1,
        image: 'https://cdn2.unrealengine.com/cva-epic-epic-logo-400x400-400x400-00831d8070e0.jpg?h=270&resize=1&w=480',
        thumbnail: 'https://cdn2.unrealengine.com/cva-epic-epic-logo-400x400-400x400-00831d8070e0.jpg?h=270&resize=1&w=480',
        usage: 'logo'
    },

    {
        id: 11, appId: 2,
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1085660/header_schinese.jpg?t=1653420922',
        thumbnail: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1085660/header_schinese.jpg?t=1653420922',
        usage: 'head'
    },
    {
        id: 12, appId: 2,
        image: 'https://media.st.dl.eccdnx.com/steam/apps/703080/capsule_616x353.jpg?t=1671462024',
        thumbnail: 'https://media.st.dl.eccdnx.com/steam/apps/703080/capsule_616x353.jpg?t=1671462024',
        usage: 'landscape'
    },
    {
        id: 13, appId: 2, video: 'https://media.st.dl.eccdnx.com/steam/apps/256888216/movie_max_vp9.webm?t=1653420851',
        image: 'https://media.st.dl.eccdnx.com/steam/apps/431960/ss_c63a5b855bf66be02b7d1c167987f7cf2a38870a.600x338.jpg',
        thumbnail: 'https://media.st.dl.eccdnx.com/steam/apps/431960/ss_c63a5b855bf66be02b7d1c167987f7cf2a38870a.600x338.jpg',
        usage: 'gallery', type: 'video',
    },
    {
        id: 14, appId: 2,
        image: 'https://media.st.dl.eccdnx.com/steam/apps/431960/ss_572ad47666c599730be5ce5698ae91a34bcc91f3.600x338.jpg',
        thumbnail: 'https://media.st.dl.eccdnx.com/steam/apps/431960/ss_572ad47666c599730be5ce5698ae91a34bcc91f3.600x338.jpg',
        usage: 'gallery'
    },
    {
        id: 15, appId: 2,
        image: 'https://media.st.dl.eccdnx.com/steam/apps/431960/ss_39ed0a9730b67a930acb8ceed221cc968bee7731.600x338.jpg',
        thumbnail: 'https://media.st.dl.eccdnx.com/steam/apps/431960/ss_39ed0a9730b67a930acb8ceed221cc968bee7731.600x338.jpg',
        usage: 'gallery'
    },
    {
        id: 16, appId: 2,
        image: 'https://media.st.dl.eccdnx.com/steam/apps/431960/ss_c63a5b855bf66be02b7d1c167987f7cf2a38870a.600x338.jpg',
        thumbnail: 'https://media.st.dl.eccdnx.com/steam/apps/431960/ss_c63a5b855bf66be02b7d1c167987f7cf2a38870a.600x338.jpg',
        usage: 'gallery'
    },
    {
        id: 17, appId: 2,
        image: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_3e556415d1bda00d749b2166ced264bec76f06ee.600x338.jpg?t=1646817776',
        thumbnail: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_3e556415d1bda00d749b2166ced264bec76f06ee.600x338.jpg?t=1646817776',
        usage: 'gallery'
    },
    {
        id: 18, appId: 2,
        image: 'https://media.st.dl.eccdnx.com/steam/apps/431960/ss_c63a5b855bf66be02b7d1c167987f7cf2a38870a.600x338.jpg',
        thumbnail: 'https://media.st.dl.eccdnx.com/steam/apps/431960/ss_c63a5b855bf66be02b7d1c167987f7cf2a38870a.600x338.jpg',
        usage: 'gallery'
    },
    {
        id: 19, appId: 2,
        image: 'https://cdn2.unrealengine.com/egs-en-genshin-impact-2-5-thumb-1200x1600-1200x1600-2762bd19b910.jpg',
        thumbnail: 'https://cdn2.unrealengine.com/egs-en-genshin-impact-2-5-thumb-1200x1600-1200x1600-2762bd19b910.jpg',
        usage: 'portrait'
    },
    {
        id: 20, appId: 2,
        image: 'https://cdn2.unrealengine.com/cva-epic-epic-logo-400x400-400x400-00831d8070e0.jpg?h=270&resize=1&w=480',
        thumbnail: 'https://cdn2.unrealengine.com/cva-epic-epic-logo-400x400-400x400-00831d8070e0.jpg?h=270&resize=1&w=480',
        usage: 'logo'
    },

    {
        id: 21, appId: 3,
        image: 'https://media.st.dl.eccdnx.com/steam/apps/1172470/header.jpg?t=1670431796',
        thumbnail: 'https://media.st.dl.eccdnx.com/steam/apps/1172470/header.jpg?t=1670431796',
        usage: 'head'
    },
    {
        id: 22, appId: 3,
        image: 'https://media.st.dl.eccdnx.com/steam/apps/1203220/capsule_616x353_schinese.jpg?t=1673247151',
        thumbnail: 'https://media.st.dl.eccdnx.com/steam/apps/1203220/capsule_616x353_schinese.jpg?t=1673247151',
        usage: 'landscape'
    },
    {
        id: 23, appId: 3, video: 'https://media.st.dl.eccdnx.com/steam/apps/256888216/movie_max_vp9.webm?t=1653420851',
        image: 'https://media.st.dl.eccdnx.com/steam/apps/648800/ss_ef26440dc87e4d571139f5c64a22035d86723442.600x338.jpg',
        thumbnail: 'https://media.st.dl.eccdnx.com/steam/apps/648800/ss_ef26440dc87e4d571139f5c64a22035d86723442.600x338.jpg',
        usage: 'gallery', type: 'video',
    },
    {
        id: 24, appId: 3,
        image: 'https://media.st.dl.eccdnx.com/steam/apps/648800/ss_c22b2ff5ba5609f74e61b5feaa5b7a1d7fd1dbd3.600x338.jpg',
        thumbnail: 'https://media.st.dl.eccdnx.com/steam/apps/648800/ss_c22b2ff5ba5609f74e61b5feaa5b7a1d7fd1dbd3.600x338.jpg',
        usage: 'gallery'
    },
    {
        id: 25, appId: 3,
        image: 'https://media.st.dl.eccdnx.com/steam/apps/648800/ss_56914c026da8c8411974bd0e2e8cb81a0331ba99.600x338.jpg',
        thumbnail: 'https://media.st.dl.eccdnx.com/steam/apps/648800/ss_56914c026da8c8411974bd0e2e8cb81a0331ba99.600x338.jpg',
        usage: 'gallery'
    },
    {
        id: 26, appId: 3,
        image: 'https://media.st.dl.eccdnx.com/steam/apps/703080/ss_6a247086e998d16983a109f2ab9567b16ddd6ec1.600x338.jpg',
        thumbnail: 'https://media.st.dl.eccdnx.com/steam/apps/703080/ss_6a247086e998d16983a109f2ab9567b16ddd6ec1.600x338.jpg',
        usage: 'gallery'
    },
    {
        id: 27, appId: 3,
        image: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_3e556415d1bda00d749b2166ced264bec76f06ee.600x338.jpg?t=1646817776',
        thumbnail: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_3e556415d1bda00d749b2166ced264bec76f06ee.600x338.jpg?t=1646817776',
        usage: 'gallery'
    },
    {
        id: 28, appId: 3,
        image: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_ae44317e3bd07b7690b4d62cc5d0d1df30367a91.600x338.jpg?t=1646817776',
        thumbnail: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_ae44317e3bd07b7690b4d62cc5d0d1df30367a91.600x338.jpg?t=1646817776',
        usage: 'gallery'
    },
    {
        id: 29, appId: 3,
        image: 'https://cdn2.unrealengine.com/egs-en-genshin-impact-2-5-thumb-1200x1600-1200x1600-2762bd19b910.jpg',
        thumbnail: 'https://cdn2.unrealengine.com/egs-en-genshin-impact-2-5-thumb-1200x1600-1200x1600-2762bd19b910.jpg',
        usage: 'portrait'
    },
    {
        id: 30, appId: 3,
        image: 'https://cdn2.unrealengine.com/cva-epic-epic-logo-400x400-400x400-00831d8070e0.jpg?h=270&resize=1&w=480',
        thumbnail: 'https://cdn2.unrealengine.com/cva-epic-epic-logo-400x400-400x400-00831d8070e0.jpg?h=270&resize=1&w=480',
        usage: 'logo'
    },

    {
        id: 31, appId: 4,
        image: 'https://media.st.dl.eccdnx.com/steam/apps/1938010/header.jpg?t=1676305498',
        thumbnail: 'https://media.st.dl.eccdnx.com/steam/apps/1938010/header.jpg?t=1676305498',
        usage: 'head'
    },
    {
        id: 32, appId: 4,
        image: 'https://media.st.dl.eccdnx.com/steam/apps/1816570/capsule_616x353_schinese.jpg?t=1673444641',
        thumbnail: 'https://media.st.dl.eccdnx.com/steam/apps/1816570/capsule_616x353_schinese.jpg?t=1673444641',
        usage: 'landscape'
    },
    {
        id: 33, appId: 4, video: 'https://media.st.dl.eccdnx.com/steam/apps/256888216/movie_max_vp9.webm?t=1653420851',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/ss_b1a1cb7959d6a0e6fcb2d06ebf97a66c9055cef3.600x338.jpg?t=1618856444',
        thumbnail: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/ss_b1a1cb7959d6a0e6fcb2d06ebf97a66c9055cef3.600x338.jpg?t=1618856444',
        usage: 'gallery', type: 'video',
    },
    {
        id: 34, appId: 4, video: 'https://media.st.dl.eccdnx.com/steam/apps/256857791/movie480_vp9.webm?t=1635429726',
        image: 'https://media.st.dl.eccdnx.com/steam/apps/256857791/movie.293x165.jpg?t=1635429726',
        thumbnail: 'https://media.st.dl.eccdnx.com/steam/apps/256857791/movie.184x123.jpg?t=1635429726',
        usage: 'gallery', type: 'video',
    },
    {
        id: 35, appId: 4,
        image: 'https://media.st.dl.eccdnx.com/steam/apps/1178830/ss_8012f15b18bbf952ba38826426f37d745a6a2dd0.600x338.jpg?t=1674881156',
        thumbnail: 'https://media.st.dl.eccdnx.com/steam/apps/1178830/ss_8012f15b18bbf952ba38826426f37d745a6a2dd0.600x338.jpg?t=1674881156',
        usage: 'gallery'
    },
    {
        id: 36, appId: 4,
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/ss_b1a1cb7959d6a0e6fcb2d06ebf97a66c9055cef3.600x338.jpg?t=1618856444',
        thumbnail: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/ss_b1a1cb7959d6a0e6fcb2d06ebf97a66c9055cef3.600x338.jpg?t=1618856444',
        usage: 'gallery'
    },
    {
        id: 37, appId: 4,
        image: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_e80a907c2c43337e53316c71555c3c3035a1343e.600x338.jpg?t=1646817776',
        thumbnail: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_e80a907c2c43337e53316c71555c3c3035a1343e.600x338.jpg?t=1646817776',
        usage: 'gallery'
    },
    {
        id: 38, appId: 4,
        image: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_3e556415d1bda00d749b2166ced264bec76f06ee.600x338.jpg?t=1646817776',
        thumbnail: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_3e556415d1bda00d749b2166ced264bec76f06ee.600x338.jpg?t=1646817776',
        usage: 'gallery'
    },
    {
        id: 39, appId: 4,
        image: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_ae44317e3bd07b7690b4d62cc5d0d1df30367a91.600x338.jpg?t=1646817776',
        thumbnail: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_ae44317e3bd07b7690b4d62cc5d0d1df30367a91.600x338.jpg?t=1646817776',
        usage: 'gallery'
    },
    {
        id: 40, appId: 4,
        image: 'https://cdn2.unrealengine.com/egs-en-genshin-impact-2-5-thumb-1200x1600-1200x1600-2762bd19b910.jpg',
        thumbnail: 'https://cdn2.unrealengine.com/egs-en-genshin-impact-2-5-thumb-1200x1600-1200x1600-2762bd19b910.jpg',
        usage: 'portrait'
    },
    {
        id: 41, appId: 4,
        image: 'https://cdn2.unrealengine.com/cva-epic-epic-logo-400x400-400x400-00831d8070e0.jpg?h=270&resize=1&w=480',
        thumbnail: 'https://cdn2.unrealengine.com/cva-epic-epic-logo-400x400-400x400-00831d8070e0.jpg?h=270&resize=1&w=480',
        usage: 'logo'
    },

    {
        id: 42, appId: 5,
        image: 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg',
        thumbnail: 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg',
        usage: 'head'
    },
    {
        id: 43, appId: 5,
        image: 'https://media.st.dl.eccdnx.com/steam/apps/916440/capsule_616x353.jpg?t=1673374244',
        thumbnail: 'https://media.st.dl.eccdnx.com/steam/apps/916440/capsule_616x353.jpg?t=1673374244',
        usage: 'landscape'
    },
    {
        id: 44, appId: 5, video: 'https://media.st.dl.eccdnx.com/steam/apps/256888216/movie_max_vp9.webm?t=1653420851',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/ss_b1a1cb7959d6a0e6fcb2d06ebf97a66c9055cef3.600x338.jpg?t=1618856444',
        thumbnail: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/ss_b1a1cb7959d6a0e6fcb2d06ebf97a66c9055cef3.600x338.jpg?t=1618856444',
        usage: 'gallery', type: 'video',
    },
    {
        id: 45, appId: 5,
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/ss_b1a1cb7959d6a0e6fcb2d06ebf97a66c9055cef3.600x338.jpg?t=1618856444',
        thumbnail: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/ss_b1a1cb7959d6a0e6fcb2d06ebf97a66c9055cef3.600x338.jpg?t=1618856444',
        usage: 'gallery'
    },
    {
        id: 46, appId: 5,
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/ss_b1a1cb7959d6a0e6fcb2d06ebf97a66c9055cef3.600x338.jpg?t=1618856444',
        thumbnail: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/ss_b1a1cb7959d6a0e6fcb2d06ebf97a66c9055cef3.600x338.jpg?t=1618856444',
        usage: 'gallery'
    },
    {
        id: 47, appId: 5,
        image: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_e80a907c2c43337e53316c71555c3c3035a1343e.600x338.jpg?t=1646817776',
        thumbnail: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_e80a907c2c43337e53316c71555c3c3035a1343e.600x338.jpg?t=1646817776',
        usage: 'gallery'
    },
    {
        id: 48, appId: 5,
        image: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_3e556415d1bda00d749b2166ced264bec76f06ee.600x338.jpg?t=1646817776',
        thumbnail: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_3e556415d1bda00d749b2166ced264bec76f06ee.600x338.jpg?t=1646817776',
        usage: 'gallery'
    },
    {
        id: 49, appId: 5,
        image: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_ae44317e3bd07b7690b4d62cc5d0d1df30367a91.600x338.jpg?t=1646817776',
        thumbnail: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_ae44317e3bd07b7690b4d62cc5d0d1df30367a91.600x338.jpg?t=1646817776',
        usage: 'gallery'
    },
    {
        id: 50, appId: 5,
        image: 'https://cdn2.unrealengine.com/egs-en-genshin-impact-2-5-thumb-1200x1600-1200x1600-2762bd19b910.jpg',
        thumbnail: 'https://cdn2.unrealengine.com/egs-en-genshin-impact-2-5-thumb-1200x1600-1200x1600-2762bd19b910.jpg',
        usage: 'portrait'
    },
    {
        id: 51, appId: 5,
        image: 'https://cdn2.unrealengine.com/cva-epic-epic-logo-400x400-400x400-00831d8070e0.jpg?h=270&resize=1&w=480',
        thumbnail: 'https://cdn2.unrealengine.com/cva-epic-epic-logo-400x400-400x400-00831d8070e0.jpg?h=270&resize=1&w=480',
        usage: 'logo'
    },
];

// 社交链接
const appSocialLinks = [
    { id: 1, appId: 1, brand: 'qq', name: '1群：fake123456', url: '' },
    { id: 2, appId: 1, brand: 'wechat', name: '公众号：123123', url: '' },
    { id: 3, appId: 2, brand: 'zhihu', name: '知乎：某某某号', url: '' },
    { id: 4, appId: 3, brand: 'qq', name: '1群：fake123456', url: '' },
    { id: 5, appId: 4, brand: 'wechat', name: '公众号：123123', url: '' },
    { id: 6, appId: 5, brand: 'zhihu', name: '知乎：某某某号', url: '' },
];

const appAwards = [
    { id: 1, appId: 1, image: 'https://media.st.dl.eccdnx.com/steam/apps/1245620/extras/BILIBILI_2022_MUST_PLAY_GAMES.png?t=1674441703' },
    { id: 2, appId: 1, image: 'https://media.st.dl.eccdnx.com/steam/apps/1245620/extras/ER_TGA2022_Awards_Widev3.png?t=1674441703' },
    { id: 3, appId: 1, image: 'https://media.st.dl.eccdnx.com/steam/apps/1245620/extras/ER_Steam_GamescomAward1.png?t=1674441703' },
    { id: 4, appId: 1, image: 'https://media.st.dl.eccdnx.com/steam/apps/1245620/extras/ER_Steam_Joystick_MostWanted_Award.png?t=1674441703' },
    { id: 5, appId: 1, image: 'https://media.st.dl.eccdnx.com/steam/apps/1245620/extras/ER_Steam_TGA_MostAnticipated_Award.png?t=1674441703' },

    { id: 6, appId: 2, image: 'https://media.st.dl.eccdnx.com/steam/apps/1245620/extras/BILIBILI_2022_MUST_PLAY_GAMES.png?t=1674441703' },
    { id: 7, appId: 2, image: 'https://media.st.dl.eccdnx.com/steam/apps/1245620/extras/ER_Steam_TGA_MostAnticipated_Award.png?t=1674441703' },

    { id: 8, appId: 3, image: 'https://media.st.dl.eccdnx.com/steam/apps/1245620/extras/BILIBILI_2022_MUST_PLAY_GAMES.png?t=1674441703' },

    { id: 9, appId: 4, image: 'https://media.st.dl.eccdnx.com/steam/apps/1245620/extras/BILIBILI_2022_MUST_PLAY_GAMES.png?t=1674441703' },
    { id: 10, appId: 4, image: 'https://media.st.dl.eccdnx.com/steam/apps/1245620/extras/ER_Steam_Joystick_MostWanted_Award.png?t=1674441703' },
    { id: 11, appId: 4, image: 'https://media.st.dl.eccdnx.com/steam/apps/1245620/extras/ER_Steam_TGA_MostAnticipated_Award.png?t=1674441703' },
];

const appLanguages = [
    { id: 1, appId: 1, text: '简体中文,繁体中文,English,日本语,한글', audio: '简体中文,繁体中文,English', caption: '简体中文,繁体中文,English' },
    { id: 2, appId: 2, text: '简体中文,繁体中文,English,日本语,한글', audio: '简体中文,繁体中文,English', caption: '简体中文,繁体中文' },
    { id: 3, appId: 3, text: '简体中文,繁体中文,English,日本语,한글', audio: '简体中文,繁体中文,English', caption: '简体中文' },
    { id: 4, appId: 4, text: '简体中文,繁体中文,English,日本语,한글', audio: '简体中文,English', caption: '' },
    { id: 5, appId: 5, text: '简体中文,繁体中文,English,日本语,한글', audio: '', caption: '' },
];

// 应用支持的操作系统平台
const appPlatforms = [
    {
        id: 1, appId: 1, os: 'Windows', requirements: JSON.stringify(
            [
                { name: '操作系统', minimum: 'Win 10/Win 11', recommended: 'Win 10/Win 11' },
                { name: '处理器', minimum: 'Inter i3', recommended: 'Inter i5' },
                { name: '内存', minimum: '8GB', recommended: '16GB' },
                { name: '显卡', minimum: 'Nvidia GT 1660', recommended: 'Nvidia GT 1080 Ti' },
                { name: 'DirectX 版本', minimum: '9.0', recommended: '11' },
                { name: '存储空间', minimum: '2GB', recommended: '6GB' },
            ]
        )
    },
    {
        id: 2, appId: 1, os: 'Macos', requirements: JSON.stringify(
            [
                { name: '操作系统', minimum: 'Ventura', recommended: 'Ventura' },
                { name: '处理器', minimum: 'Inter i3/M1', recommended: 'Inter i5/M1 Pro' },
                { name: '内存', minimum: '8GB', recommended: '16GB' },
                { name: '显卡', minimum: 'Nvidia GT 1660', recommended: 'Nvidia GT 1080 Ti' },
                { name: '存储空间', minimum: '2GB', recommended: '6GB' },
            ]
        )
    },
    {
        id: 3, appId: 2, os: 'Windows', requirements: JSON.stringify(
            [
                { name: '操作系统', minimum: 'Win 10/Win 11', recommended: 'Win 10/Win 11' },
                { name: '处理器', minimum: 'Inter i3', recommended: 'Inter i5' },
                { name: '内存', minimum: '8GB', recommended: '16GB' },
                { name: '显卡', minimum: 'Nvidia GT 1660', recommended: 'Nvidia GT 1080 Ti' },
                { name: 'DirectX 版本', minimum: '9.0', recommended: '11' },
                { name: '存储空间', minimum: '2GB', recommended: '6GB' },
            ]
        )
    },
    {
        id: 4, appId: 3, os: 'Windows', requirements: JSON.stringify(
            [
                { name: '操作系统', minimum: 'Win 10/Win 11', recommended: 'Win 10/Win 11' },
                { name: '处理器', minimum: 'Inter i3', recommended: 'Inter i5' },
                { name: '内存', minimum: '8GB', recommended: '16GB' },
                { name: '显卡', minimum: 'Nvidia GT 1660', recommended: 'Nvidia GT 1080 Ti' },
                { name: 'DirectX 版本', minimum: '9.0', recommended: '11' },
                { name: '存储空间', minimum: '2GB', recommended: '6GB' },
            ]
        )
    },
    {
        id: 5, appId: 4, os: 'Windows', requirements: JSON.stringify(
            [
                { name: '操作系统', minimum: 'Win 10/Win 11', recommended: 'Win 10/Win 11' },
                { name: '处理器', minimum: 'Inter i3', recommended: 'Inter i5' },
                { name: '内存', minimum: '8GB', recommended: '16GB' },
                { name: '显卡', minimum: 'Nvidia GT 1660', recommended: 'Nvidia GT 1080 Ti' },
                { name: 'DirectX 版本', minimum: '9.0', recommended: '11' },
                { name: '存储空间', minimum: '2GB', recommended: '6GB' },
            ]
        )
    },
    {
        id: 6, appId: 5, os: 'Windows', requirements: JSON.stringify(
            [
                { name: '操作系统', minimum: 'Win 10/Win 11', recommended: 'Win 10/Win 11' },
                { name: '处理器', minimum: 'Inter i3', recommended: 'Inter i5' },
                { name: '内存', minimum: '8GB', recommended: '16GB' },
                { name: '显卡', minimum: 'Nvidia GT 1660', recommended: 'Nvidia GT 1080 Ti' },
                { name: 'DirectX 版本', minimum: '9.0', recommended: '11' },
                { name: '存储空间', minimum: '2GB', recommended: '6GB' },
            ]
        )
    },
];

const hotSearchList = [
    { id: 1, content: '圆圆神', hitCount: 100 },
    { id: 2, content: '赛博朋克', hitCount: 78 },
    { id: 3, content: '埃登法圈', hitCount: 103 },
    { id: 4, content: '烈焰战神', hitCount: 56 },
    { id: 5, content: '星球争霸', hitCount: 49 },
];

const news = [
    {
        id: 1, appId: 1, title: '第三人称观赏模式 / 兔年DLC皮肤 / 卡通渲染 现已推出！',
        head: 'https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/419f497e106cc6de2d954e7331884f0180d45e38.jpg',
        banner: 'https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans/36381617/e10b4c9dd0e55c8bfb1445a4ceec6b9c916e2bb8.png',
        summary: '在2月20日，全新的 Albion East 服务器将正式开始封闭测试！这将提供一个独特的、前所未有的机会，从头体验一个完全未受任何玩家影响的游戏版本，并提供加速的游戏进程，以及在正式上线后仍会保留的奖励。 封测游戏特色： 一个原始的、未被任何玩家触及的阿尔比恩世界供您探索 极大地提升了获取声望的速度 自动获得尊享特权与2000学习点数，降低资源的重量...',
        content: `
        <h2>
        各位玩家好！今日为大家带来《光明记忆：无限》2023春节版本。新增“第三人称观赏模式”。游戏设置 - 图像 - 观赏模式 即可打开。“观赏模式”适用于移动以及射击，使用部分技能时会临时切换至第一人称。
        </h2>
        <br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/419f497e106cc6de2d954e7331884f0180d45e38.jpg"><br><br>
        <h3>  本次还为舒雅新增两套DLC皮肤“赛博兔 / 学院兔”，并增加了卡通渲染功能，在游戏中按“Home键”可切换主角的卡通渲染效果。</h3><br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/d199a14b6da3f87fbdd887d42cbab53d822b3945.jpg"><br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/04dcb7b0c1a227cd783e2722f61f9123910b6855.jpg"><br><br>
        <h3>【增加内容】：</h3>
        1.新增 第三人称视角切换。<br>（仅适用于玩家的移动及射击，使用技能时将临时过渡回第一人称视角）<br>
        2.新增 DLC“学院兔 - 舒雅”角色皮肤。<br>
        3.新增 DLC“赛博兔 - 舒雅”角色皮肤。<br>
        4.新增“角色卡通渲染”（游戏中按Home键切换）。<br>5.替换“汽车驾驶室内”、"主菜单”老虎玩偶为兔子。<br><br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/2c73d8aaecec8fd7230925f1379d93b690ba432f.png">
        <br><br>
        <h3>【优化内容】：</h3>
        1.对游戏中NPC模型重新制作LOD，提升游戏帧率。<br>
        2.优化“六臂天王”金钟罩技能特效，玩家被金钟罩盖到内部，闪电特效会导致游戏帧率下降的问题得到缓解。<br>
        3.优化“巨灵天王 - 二形态”释放的火焰特效对GPU产生的性能消耗。<br>
        4.优化“自动步枪”武器检视动作，让手臂动作更为自然。<br>
        5.优化“危机四伏”潜行任务结束后“动态模糊”参数设置不正确的问题。<br>
        6.优化“主菜单 - 皮肤”选项排序，新推出的DLC皮肤会靠前显示。<br>
        7.优化“主菜单 - 皮肤”展示界面中舒雅左手臂的位置，优化手臂太靠近身体内侧的问题。<br>
        8.优化“主菜单 - 皮肤”展示界面的灯光亮度和色调。<br><br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/6c26ddf0b5fc8a521486a91b91e0ecce9db8d76e.jpg">
        <br><br>
        <h3>【修复内容】：</h3>
        1.修复当设置“隐藏准心”后按下“武器检视”，玩家将永远无法开火或拾取道具的问题。<br>
        2.修复“攀爬”时仍然可以使用武器开火的问题。
        <br><br>
        `,
    },
    {
        id: 2, appId: 2, title: '第三人称观赏模式 / 兔年DLC皮肤 / 卡通渲染 现已推出！',
        head: 'https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/d199a14b6da3f87fbdd887d42cbab53d822b3945.jpg',
        banner: 'https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans/36381617/e10b4c9dd0e55c8bfb1445a4ceec6b9c916e2bb8.png',
        summary: '在2月20日，全新的 Albion East 服务器将正式开始封闭测试！这将提供一个独特的、前所未有的机会，从头体验一个完全未受任何玩家影响的游戏版本，并提供加速的游戏进程，以及在正式上线后仍会保留的奖励。 封测游戏特色： 一个原始的、未被任何玩家触及的阿尔比恩世界供您探索 极大地提升了获取声望的速度 自动获得尊享特权与2000学习点数，降低资源的重量...',
        content: `
        <h2>
        各位玩家好！今日为大家带来《光明记忆：无限》2023春节版本。新增“第三人称观赏模式”。游戏设置 - 图像 - 观赏模式 即可打开。“观赏模式”适用于移动以及射击，使用部分技能时会临时切换至第一人称。
        </h2>
        <br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/419f497e106cc6de2d954e7331884f0180d45e38.jpg"><br><br>
        <h3>  本次还为舒雅新增两套DLC皮肤“赛博兔 / 学院兔”，并增加了卡通渲染功能，在游戏中按“Home键”可切换主角的卡通渲染效果。</h3><br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/d199a14b6da3f87fbdd887d42cbab53d822b3945.jpg"><br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/04dcb7b0c1a227cd783e2722f61f9123910b6855.jpg"><br><br>
        <h3>【增加内容】：</h3>
        1.新增 第三人称视角切换。<br>（仅适用于玩家的移动及射击，使用技能时将临时过渡回第一人称视角）<br>
        2.新增 DLC“学院兔 - 舒雅”角色皮肤。<br>
        3.新增 DLC“赛博兔 - 舒雅”角色皮肤。<br>
        4.新增“角色卡通渲染”（游戏中按Home键切换）。<br>5.替换“汽车驾驶室内”、"主菜单”老虎玩偶为兔子。<br><br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/2c73d8aaecec8fd7230925f1379d93b690ba432f.png">
        <br><br>
        <h3>【优化内容】：</h3>
        1.对游戏中NPC模型重新制作LOD，提升游戏帧率。<br>
        2.优化“六臂天王”金钟罩技能特效，玩家被金钟罩盖到内部，闪电特效会导致游戏帧率下降的问题得到缓解。<br>
        3.优化“巨灵天王 - 二形态”释放的火焰特效对GPU产生的性能消耗。<br>
        4.优化“自动步枪”武器检视动作，让手臂动作更为自然。<br>
        5.优化“危机四伏”潜行任务结束后“动态模糊”参数设置不正确的问题。<br>
        6.优化“主菜单 - 皮肤”选项排序，新推出的DLC皮肤会靠前显示。<br>
        7.优化“主菜单 - 皮肤”展示界面中舒雅左手臂的位置，优化手臂太靠近身体内侧的问题。<br>
        8.优化“主菜单 - 皮肤”展示界面的灯光亮度和色调。<br><br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/6c26ddf0b5fc8a521486a91b91e0ecce9db8d76e.jpg">
        <br><br>
        <h3>【修复内容】：</h3>
        1.修复当设置“隐藏准心”后按下“武器检视”，玩家将永远无法开火或拾取道具的问题。<br>
        2.修复“攀爬”时仍然可以使用武器开火的问题。
        <br><br>
        `,
    },
    {
        id: 3, appId: 3, title: '第三人称观赏模式 / 兔年DLC皮肤 / 卡通渲染 现已推出！',
        head: 'https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/04dcb7b0c1a227cd783e2722f61f9123910b6855.jpg',
        banner: 'https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans/36381617/e10b4c9dd0e55c8bfb1445a4ceec6b9c916e2bb8.png',
        summary: '在2月20日，全新的 Albion East 服务器将正式开始封闭测试！这将提供一个独特的、前所未有的机会，从头体验一个完全未受任何玩家影响的游戏版本，并提供加速的游戏进程，以及在正式上线后仍会保留的奖励。 封测游戏特色： 一个原始的、未被任何玩家触及的阿尔比恩世界供您探索 极大地提升了获取声望的速度 自动获得尊享特权与2000学习点数，降低资源的重量...',
        content: `
        <h2>
        各位玩家好！今日为大家带来《光明记忆：无限》2023春节版本。新增“第三人称观赏模式”。游戏设置 - 图像 - 观赏模式 即可打开。“观赏模式”适用于移动以及射击，使用部分技能时会临时切换至第一人称。
        </h2>
        <br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/419f497e106cc6de2d954e7331884f0180d45e38.jpg"><br><br>
        <h3>  本次还为舒雅新增两套DLC皮肤“赛博兔 / 学院兔”，并增加了卡通渲染功能，在游戏中按“Home键”可切换主角的卡通渲染效果。</h3><br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/d199a14b6da3f87fbdd887d42cbab53d822b3945.jpg"><br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/04dcb7b0c1a227cd783e2722f61f9123910b6855.jpg"><br><br>
        <h3>【增加内容】：</h3>
        1.新增 第三人称视角切换。<br>（仅适用于玩家的移动及射击，使用技能时将临时过渡回第一人称视角）<br>
        2.新增 DLC“学院兔 - 舒雅”角色皮肤。<br>
        3.新增 DLC“赛博兔 - 舒雅”角色皮肤。<br>
        4.新增“角色卡通渲染”（游戏中按Home键切换）。<br>5.替换“汽车驾驶室内”、"主菜单”老虎玩偶为兔子。<br><br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/2c73d8aaecec8fd7230925f1379d93b690ba432f.png">
        <br><br>
        <h3>【优化内容】：</h3>
        1.对游戏中NPC模型重新制作LOD，提升游戏帧率。<br>
        2.优化“六臂天王”金钟罩技能特效，玩家被金钟罩盖到内部，闪电特效会导致游戏帧率下降的问题得到缓解。<br>
        3.优化“巨灵天王 - 二形态”释放的火焰特效对GPU产生的性能消耗。<br>
        4.优化“自动步枪”武器检视动作，让手臂动作更为自然。<br>
        5.优化“危机四伏”潜行任务结束后“动态模糊”参数设置不正确的问题。<br>
        6.优化“主菜单 - 皮肤”选项排序，新推出的DLC皮肤会靠前显示。<br>
        7.优化“主菜单 - 皮肤”展示界面中舒雅左手臂的位置，优化手臂太靠近身体内侧的问题。<br>
        8.优化“主菜单 - 皮肤”展示界面的灯光亮度和色调。<br><br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/6c26ddf0b5fc8a521486a91b91e0ecce9db8d76e.jpg">
        <br><br>
        <h3>【修复内容】：</h3>
        1.修复当设置“隐藏准心”后按下“武器检视”，玩家将永远无法开火或拾取道具的问题。<br>
        2.修复“攀爬”时仍然可以使用武器开火的问题。
        <br><br>
        `,
    },
    {
        id: 4, appId: 4, title: '第三人称观赏模式 / 兔年DLC皮肤 / 卡通渲染 现已推出！',
        head: 'https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/2c73d8aaecec8fd7230925f1379d93b690ba432f.png',
        banner: 'https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans/36381617/e10b4c9dd0e55c8bfb1445a4ceec6b9c916e2bb8.png',
        summary: '在2月20日，全新的 Albion East 服务器将正式开始封闭测试！这将提供一个独特的、前所未有的机会，从头体验一个完全未受任何玩家影响的游戏版本，并提供加速的游戏进程，以及在正式上线后仍会保留的奖励。 封测游戏特色： 一个原始的、未被任何玩家触及的阿尔比恩世界供您探索 极大地提升了获取声望的速度 自动获得尊享特权与2000学习点数，降低资源的重量...',
        content: `
        <h2>
        各位玩家好！今日为大家带来《光明记忆：无限》2023春节版本。新增“第三人称观赏模式”。游戏设置 - 图像 - 观赏模式 即可打开。“观赏模式”适用于移动以及射击，使用部分技能时会临时切换至第一人称。
        </h2>
        <br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/419f497e106cc6de2d954e7331884f0180d45e38.jpg"><br><br>
        <h3>  本次还为舒雅新增两套DLC皮肤“赛博兔 / 学院兔”，并增加了卡通渲染功能，在游戏中按“Home键”可切换主角的卡通渲染效果。</h3><br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/d199a14b6da3f87fbdd887d42cbab53d822b3945.jpg"><br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/04dcb7b0c1a227cd783e2722f61f9123910b6855.jpg"><br><br>
        <h3>【增加内容】：</h3>
        1.新增 第三人称视角切换。<br>（仅适用于玩家的移动及射击，使用技能时将临时过渡回第一人称视角）<br>
        2.新增 DLC“学院兔 - 舒雅”角色皮肤。<br>
        3.新增 DLC“赛博兔 - 舒雅”角色皮肤。<br>
        4.新增“角色卡通渲染”（游戏中按Home键切换）。<br>5.替换“汽车驾驶室内”、"主菜单”老虎玩偶为兔子。<br><br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/2c73d8aaecec8fd7230925f1379d93b690ba432f.png">
        <br><br>
        <h3>【优化内容】：</h3>
        1.对游戏中NPC模型重新制作LOD，提升游戏帧率。<br>
        2.优化“六臂天王”金钟罩技能特效，玩家被金钟罩盖到内部，闪电特效会导致游戏帧率下降的问题得到缓解。<br>
        3.优化“巨灵天王 - 二形态”释放的火焰特效对GPU产生的性能消耗。<br>
        4.优化“自动步枪”武器检视动作，让手臂动作更为自然。<br>
        5.优化“危机四伏”潜行任务结束后“动态模糊”参数设置不正确的问题。<br>
        6.优化“主菜单 - 皮肤”选项排序，新推出的DLC皮肤会靠前显示。<br>
        7.优化“主菜单 - 皮肤”展示界面中舒雅左手臂的位置，优化手臂太靠近身体内侧的问题。<br>
        8.优化“主菜单 - 皮肤”展示界面的灯光亮度和色调。<br><br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/6c26ddf0b5fc8a521486a91b91e0ecce9db8d76e.jpg">
        <br><br>
        <h3>【修复内容】：</h3>
        1.修复当设置“隐藏准心”后按下“武器检视”，玩家将永远无法开火或拾取道具的问题。<br>
        2.修复“攀爬”时仍然可以使用武器开火的问题。
        <br><br>
        `,
    },
    {
        id: 5, appId: 5, title: '第三人称观赏模式 / 兔年DLC皮肤 / 卡通渲染 现已推出！',
        head: 'https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans/4649813/35be4f6d533db6e67ef6f06c5c83f899ae4f59de_400x225.jpg',
        banner: 'https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans/36381617/e10b4c9dd0e55c8bfb1445a4ceec6b9c916e2bb8.png',
        summary: '在2月20日，全新的 Albion East 服务器将正式开始封闭测试！这将提供一个独特的、前所未有的机会，从头体验一个完全未受任何玩家影响的游戏版本，并提供加速的游戏进程，以及在正式上线后仍会保留的奖励。 封测游戏特色： 一个原始的、未被任何玩家触及的阿尔比恩世界供您探索 极大地提升了获取声望的速度 自动获得尊享特权与2000学习点数，降低资源的重量...',
        content: `
        <h2>
        各位玩家好！今日为大家带来《光明记忆：无限》2023春节版本。新增“第三人称观赏模式”。游戏设置 - 图像 - 观赏模式 即可打开。“观赏模式”适用于移动以及射击，使用部分技能时会临时切换至第一人称。
        </h2>
        <br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/419f497e106cc6de2d954e7331884f0180d45e38.jpg"><br><br>
        <h3>  本次还为舒雅新增两套DLC皮肤“赛博兔 / 学院兔”，并增加了卡通渲染功能，在游戏中按“Home键”可切换主角的卡通渲染效果。</h3><br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/d199a14b6da3f87fbdd887d42cbab53d822b3945.jpg"><br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/04dcb7b0c1a227cd783e2722f61f9123910b6855.jpg"><br><br>
        <h3>【增加内容】：</h3>
        1.新增 第三人称视角切换。<br>（仅适用于玩家的移动及射击，使用技能时将临时过渡回第一人称视角）<br>
        2.新增 DLC“学院兔 - 舒雅”角色皮肤。<br>
        3.新增 DLC“赛博兔 - 舒雅”角色皮肤。<br>
        4.新增“角色卡通渲染”（游戏中按Home键切换）。<br>5.替换“汽车驾驶室内”、"主菜单”老虎玩偶为兔子。<br><br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/2c73d8aaecec8fd7230925f1379d93b690ba432f.png">
        <br><br>
        <h3>【优化内容】：</h3>
        1.对游戏中NPC模型重新制作LOD，提升游戏帧率。<br>
        2.优化“六臂天王”金钟罩技能特效，玩家被金钟罩盖到内部，闪电特效会导致游戏帧率下降的问题得到缓解。<br>
        3.优化“巨灵天王 - 二形态”释放的火焰特效对GPU产生的性能消耗。<br>
        4.优化“自动步枪”武器检视动作，让手臂动作更为自然。<br>
        5.优化“危机四伏”潜行任务结束后“动态模糊”参数设置不正确的问题。<br>
        6.优化“主菜单 - 皮肤”选项排序，新推出的DLC皮肤会靠前显示。<br>
        7.优化“主菜单 - 皮肤”展示界面中舒雅左手臂的位置，优化手臂太靠近身体内侧的问题。<br>
        8.优化“主菜单 - 皮肤”展示界面的灯光亮度和色调。<br><br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/6c26ddf0b5fc8a521486a91b91e0ecce9db8d76e.jpg">
        <br><br>
        <h3>【修复内容】：</h3>
        1.修复当设置“隐藏准心”后按下“武器检视”，玩家将永远无法开火或拾取道具的问题。<br>
        2.修复“攀爬”时仍然可以使用武器开火的问题。
        <br><br>
        `,
    },
    {
        id: 6, appId: 1, title: '第三人称观赏模式 / 兔年DLC皮肤 / 卡通渲染 现已推出！',
        head: 'https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans/32445805/08e7e382764edd333f834c8f8bc320f1bbd1d2b2_400x225.jpg',
        banner: 'https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans/36381617/e10b4c9dd0e55c8bfb1445a4ceec6b9c916e2bb8.png',
        summary: '在2月20日，全新的 Albion East 服务器将正式开始封闭测试！这将提供一个独特的、前所未有的机会，从头体验一个完全未受任何玩家影响的游戏版本，并提供加速的游戏进程，以及在正式上线后仍会保留的奖励。 封测游戏特色： 一个原始的、未被任何玩家触及的阿尔比恩世界供您探索 极大地提升了获取声望的速度 自动获得尊享特权与2000学习点数，降低资源的重量...',
        content: `
        <h2>
        各位玩家好！今日为大家带来《光明记忆：无限》2023春节版本。新增“第三人称观赏模式”。游戏设置 - 图像 - 观赏模式 即可打开。“观赏模式”适用于移动以及射击，使用部分技能时会临时切换至第一人称。
        </h2>
        <br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/419f497e106cc6de2d954e7331884f0180d45e38.jpg"><br><br>
        <h3>  本次还为舒雅新增两套DLC皮肤“赛博兔 / 学院兔”，并增加了卡通渲染功能，在游戏中按“Home键”可切换主角的卡通渲染效果。</h3><br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/d199a14b6da3f87fbdd887d42cbab53d822b3945.jpg"><br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/04dcb7b0c1a227cd783e2722f61f9123910b6855.jpg"><br><br>
        <h3>【增加内容】：</h3>
        1.新增 第三人称视角切换。<br>（仅适用于玩家的移动及射击，使用技能时将临时过渡回第一人称视角）<br>
        2.新增 DLC“学院兔 - 舒雅”角色皮肤。<br>
        3.新增 DLC“赛博兔 - 舒雅”角色皮肤。<br>
        4.新增“角色卡通渲染”（游戏中按Home键切换）。<br>5.替换“汽车驾驶室内”、"主菜单”老虎玩偶为兔子。<br><br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/2c73d8aaecec8fd7230925f1379d93b690ba432f.png">
        <br><br>
        <h3>【优化内容】：</h3>
        1.对游戏中NPC模型重新制作LOD，提升游戏帧率。<br>
        2.优化“六臂天王”金钟罩技能特效，玩家被金钟罩盖到内部，闪电特效会导致游戏帧率下降的问题得到缓解。<br>
        3.优化“巨灵天王 - 二形态”释放的火焰特效对GPU产生的性能消耗。<br>
        4.优化“自动步枪”武器检视动作，让手臂动作更为自然。<br>
        5.优化“危机四伏”潜行任务结束后“动态模糊”参数设置不正确的问题。<br>
        6.优化“主菜单 - 皮肤”选项排序，新推出的DLC皮肤会靠前显示。<br>
        7.优化“主菜单 - 皮肤”展示界面中舒雅左手臂的位置，优化手臂太靠近身体内侧的问题。<br>
        8.优化“主菜单 - 皮肤”展示界面的灯光亮度和色调。<br><br>
        <img src="https://media.st.dl.eccdnx.com/steamcommunity/public/images/clans//36381617/6c26ddf0b5fc8a521486a91b91e0ecce9db8d76e.jpg">
        <br><br>
        <h3>【修复内容】：</h3>
        1.修复当设置“隐藏准心”后按下“武器检视”，玩家将永远无法开火或拾取道具的问题。<br>
        2.修复“攀爬”时仍然可以使用武器开火的问题。
        <br><br>
        `,
    }
];

const proReviews = [
    { id: 1, appId: 1, name: 'PC Gamer', summary: 'Some nice characters and stories nested in an astounding open world, undercut by jarring bugs at every turn.', score: '78 / 100', url: 'https://www.pcgamer.com/cyberpunk-2077-review/' },
    { id: 2, appId: 1, name: 'Game Informer', summary: 'Some nice characters and stories nested in an astounding open world, undercut by jarring bugs at every turn.', score: '78 / 100', url: 'https://www.pcgamer.com/cyberpunk-2077-review/' },
    { id: 3, appId: 1, name: 'IGN', summary: 'Some nice characters and stories nested in an astounding open world, undercut by jarring bugs at every turn.', score: '78 / 100', url: 'https://www.pcgamer.com/cyberpunk-2077-review/' },

    { id: 4, appId: 2, name: 'PC Gamer', summary: 'Some nice characters and stories nested in an astounding open world, undercut by jarring bugs at every turn.', score: '78 / 100', url: 'https://www.pcgamer.com/cyberpunk-2077-review/' },
    { id: 5, appId: 2, name: 'Game Informer', summary: 'Some nice characters and stories nested in an astounding open world, undercut by jarring bugs at every turn.', score: '78 / 100', url: 'https://www.pcgamer.com/cyberpunk-2077-review/' },
    { id: 6, appId: 2, name: 'IGN', summary: 'Some nice characters and stories nested in an astounding open world, undercut by jarring bugs at every turn.', score: '78 / 100', url: 'https://www.pcgamer.com/cyberpunk-2077-review/' },

    { id: 7, appId: 3, name: 'PC Gamer', summary: 'Some nice characters and stories nested in an astounding open world, undercut by jarring bugs at every turn.', score: '78 / 100', url: 'https://www.pcgamer.com/cyberpunk-2077-review/' },
    { id: 8, appId: 3, name: 'Game Informer', summary: 'Some nice characters and stories nested in an astounding open world, undercut by jarring bugs at every turn.', score: '78 / 100', url: 'https://www.pcgamer.com/cyberpunk-2077-review/' },

    { id: 9, appId: 4, name: 'PC Gamer', summary: 'Some nice characters and stories nested in an astounding open world, undercut by jarring bugs at every turn.', score: '78 / 100', url: 'https://www.pcgamer.com/cyberpunk-2077-review/' },
];

// 一个用户一个APP只能评价一次
const reviews = [
    { id: 1, content: '哎哟，不错哦1。', score: 4, appId: 1, userId: 1, },
    { id: 2, content: '哎哟，不错哦2。', score: 5, appId: 1, userId: 2, },

    { id: 3, content: '哎哟，不错哦1。', score: 5, appId: 2, userId: 1, },
    { id: 4, content: '哎哟，不错哦3。', score: 5, appId: 2, userId: 2, },

    { id: 5, content: '哎哟，不错哦1。', score: 4, appId: 3, userId: 1, },

    { id: 6, content: '哎哟，不错哦1。', score: 3, appId: 4, userId: 2, },
];

const reviewImages = [
    { id: 1, url: 'https://cdn.akamai.steamstatic.com/steam/apps/1293160/header.jpg?t=1677080057', reviewId: 1, },
    { id: 2, url: 'https://cdn.akamai.steamstatic.com/steam/apps/1293160/header.jpg?t=1677080057', reviewId: 1, },
    { id: 3, url: 'https://cdn.akamai.steamstatic.com/steam/apps/1293160/header.jpg?t=1677080057', reviewId: 1, },

    { id: 4, url: 'https://cdn.akamai.steamstatic.com/steam/apps/1293160/header.jpg?t=1677080057', reviewId: 2, },
    { id: 5, url: 'https://cdn.akamai.steamstatic.com/steam/apps/1293160/header.jpg?t=1677080057', reviewId: 2, },
    { id: 6, url: 'https://cdn.akamai.steamstatic.com/steam/apps/1293160/header.jpg?t=1677080057', reviewId: 2, },

    { id: 7, url: 'https://cdn.akamai.steamstatic.com/steam/apps/1293160/header.jpg?t=1677080057', reviewId: 3, },
    { id: 8, url: 'https://cdn.akamai.steamstatic.com/steam/apps/1293160/header.jpg?t=1677080057', reviewId: 3, },

    { id: 9, url: 'https://cdn.akamai.steamstatic.com/steam/apps/1293160/header.jpg?t=1677080057', reviewId: 4, },

    { id: 10, url: 'https://cdn.akamai.steamstatic.com/steam/apps/1293160/header.jpg?t=1677080057', reviewId: 5, },
];

// 一个用户一个Review可以回复多次
const reviewComments = [
    { id: 1, content: '我不允许还有人没有回复你。', reviewId: 1, userId: 1, },
    { id: 2, content: '我不允许还有人没有回复你。', reviewId: 1, userId: 2, },
    { id: 3, content: '我不允许还有人没有回复你。', reviewId: 1, userId: 1, },
    { id: 4, content: '我不允许还有人没有回复你。', reviewId: 1, userId: 2, },

    { id: 5, content: '我不允许还有人没有回复你。', reviewId: 2, userId: 1, },
    { id: 6, content: '我不允许还有人没有回复你。', reviewId: 2, userId: 2, },
    { id: 7, content: '我不允许还有人没有回复你。', reviewId: 2, userId: 1, },

    { id: 8, content: '我不允许还有人没有回复你。', reviewId: 3, userId: 1, },
    { id: 9, content: '我不允许还有人没有回复你。', reviewId: 3, userId: 2, },
];

// 流行语
const buzzwords = [
    '我想吃鱼了', '事情开始变得有趣了', '用真心就可以', '真诚永远都是必杀技', '只是平平无奇的评测罢了', '你触碰到了我的逆鳞', '优雅，真优雅呀',
    '你的评测被我驳回了，记住，这是通知，不是商量', 'NB', 'YYDS', '我看不懂，但是我大受震撼', '你成功地引起了我的注意', '俺也一样',
    'you can you up, no can no bb', '有钱一起赚，别自己吃独食', '泰酷辣',
].map((v, index) => {
    return { id: index + 1, content: v };
});

// 礼物
const gifts = [
    { id: 1, name: '极品好笑', description: '别的顶多是好笑，这可是极品好笑。', price: 200, url: '/public/img/gifts/lovesmile.png', },
    { id: 2, name: '僵住了', description: '虾人们，我整个一个僵住了呀。', price: 300, url: '/public/img/gifts/chameleon.png', },
    { id: 3, name: '心都给你', description: '你轻易的就俘获了我的心。', price: 100, url: '/public/img/gifts/heart.png', },
    { id: 4, name: '跳得很呐', description: '看起来你比袋鼠还能跳。', price: 200, url: '/public/img/gifts/kangaroo.png', },
    { id: 5, name: '南瓜', description: '照亮我内心的南瓜灯', price: 300, url: '/public/img/gifts/pumpkin.png', },
    { id: 6, name: '漂亮', description: '啥也不说了，漂亮就完事了', price: 500, url: '/public/img/gifts/beautiful.png', },
];

// 礼物与评测的多对多
const reviewGiftRefs = [
    { reviewId: 2, userId: 1, giftId: 1 },
    { reviewId: 2, userId: 1, giftId: 2 },
    { reviewId: 2, userId: 1, giftId: 3 },
    { reviewId: 2, userId: 1, giftId: 4 },

    { reviewId: 1, userId: 2, giftId: 1 },
    { reviewId: 1, userId: 2, giftId: 2 },
    { reviewId: 1, userId: 2, giftId: 3 },
    { reviewId: 1, userId: 2, giftId: 4 },
].map((v, index) => {
    v.id = index + 1;
    return v;
});

// 探索页面的组件
const discoverPageWidgets = [
    { page: 'discover', title: '编辑推荐', type: 'Carousel', target: 'App', targetIds: [1, 2, 3, 4].join(',') },
    { page: 'discover', title: '关注最多', type: 'CardList', target: 'App', targetIds: [1, 2, 3, 4, 5].join(',') },
    { page: 'discover', title: '精选分类', type: 'TextList', target: 'Tag', targetIds: [1, 2, 3, 4, 5, 7, 8, 9].join(',') },
    { page: 'discover', title: '新鲜上架', type: 'CardList', target: 'App', targetIds: [1, 2, 3, 4, 5].join(',') },
    { page: 'discover', title: '热评推荐', type: 'CardList', target: 'Review', targetIds: [1, 3, 5, 6].join(',') },
    { page: 'discover', title: '厂商赞助', type: 'CardList', style: 'Two', target: 'App', targetIds: [1, 2].join(',') },
    { page: 'discover', title: '随机推荐', type: 'CardList', target: 'App', targetIds: [1, 2, 3, 4, 5].join(',') },
].map((v, index) => {
    v.id = index + 1;
    return v;
});

// 讨论频道
const discussionChannels = [
    { appId: 1, name: '综合讨论', description: '各种话题都可以谁便说', icon: 'https://cdn.discordapp.com/icons/522681957373575168/653957c5315ff8cace5a50e675f29a5d.webp?size=80', },
    { appId: 1, name: '游戏攻略', description: '分享你的攻略', icon: 'https://cdn.discordapp.com/icons/522681957373575168/653957c5315ff8cace5a50e675f29a5d.webp?size=80', },
    { appId: 1, name: '问题反馈', description: '反馈你的问题', icon: 'https://cdn.discordapp.com/icons/522681957373575168/653957c5315ff8cace5a50e675f29a5d.webp?size=80', },
    { appId: 1, name: '无聊灌水', description: '灌水就是艺术', icon: 'https://cdn.discordapp.com/icons/522681957373575168/653957c5315ff8cace5a50e675f29a5d.webp?size=80', },

    { appId: 2, name: '综合讨论', description: '各种话题都可以谁便说', icon: 'https://cdn.discordapp.com/icons/522681957373575168/653957c5315ff8cace5a50e675f29a5d.webp?size=80', },
    { appId: 2, name: '游戏攻略', description: '分享你的攻略', icon: 'https://cdn.discordapp.com/icons/522681957373575168/653957c5315ff8cace5a50e675f29a5d.webp?size=80', },
    { appId: 2, name: '问题反馈', description: '反馈你的问题', icon: 'https://cdn.discordapp.com/icons/522681957373575168/653957c5315ff8cace5a50e675f29a5d.webp?size=80', },

    { appId: 3, name: '综合讨论', description: '各种话题都可以谁便说', icon: 'https://cdn.discordapp.com/icons/522681957373575168/653957c5315ff8cace5a50e675f29a5d.webp?size=80', },
    { appId: 3, name: '游戏攻略', description: '分享你的攻略', icon: 'https://cdn.discordapp.com/icons/522681957373575168/653957c5315ff8cace5a50e675f29a5d.webp?size=80', },


    { appId: 4, name: '无聊灌水', description: '灌水就是艺术', icon: 'https://cdn.discordapp.com/icons/522681957373575168/653957c5315ff8cace5a50e675f29a5d.webp?size=80', },
].map((v, index) => { v.id = index + 1; return v; });

// 成就
const achievements = [
    { id: AchievementTypes.UserJoin, icon: '/public/img/achievements/a2.png', name: '初出茅庐', description: '用户首次登陆', message: '欢迎进入 KTap 的世界，嘿，我们又多了一个好兄弟/姐妹！', criteria: 1 },
    { id: AchievementTypes.FirstReview, icon: '/public/img/achievements/a3.png', name: '首露心声', description: '用户首次发表游戏评测', message: '你勇敢地表达了自己的游戏评测，呃，希望游戏厂商能够看到。', criteria: 1 },
    { id: AchievementTypes.TenReviews, icon: '/public/img/achievements/a4.png', name: '声声不息', description: '用户发表 10 篇游戏评测', message: '有点爱上发表游戏评测了吗？', criteria: 10 },
    { id: AchievementTypes.FirstDiscussion, icon: '/public/img/achievements/a5.png', name: '坐而论道', description: '用户首次发表讨论', message: '你成功地抛出了一个讨论主题，快，让大家都来讨论。', criteria: 1 },
    { id: AchievementTypes.TenDiscussions, icon: '/public/img/achievements/a6.png', name: '道道叨叨', description: '用户发表 10 次讨论', message: '有我在，你们就不会寂寞了。', criteria: 10 },
    { id: AchievementTypes.FirstSticky, icon: '/public/img/achievements/a7.png', name: '一朵小红花', description: '用户的讨论首次被置顶', message: '被表扬了？被表扬了！', criteria: 1 },
];

const userAchievements = [
    { userId: 1, achievementId: AchievementTypes.UserJoin, accumulation: 1, unlockedAt: new Date() },
    { userId: 1, achievementId: AchievementTypes.FirstReview, accumulation: 1, unlockedAt: new Date() },
    { userId: 1, achievementId: AchievementTypes.TenReviews, accumulation: 3 },
    { userId: 1, achievementId: AchievementTypes.FirstDiscussion, accumulation: 1, unlockedAt: new Date() },
    { userId: 1, achievementId: AchievementTypes.TenDiscussions, accumulation: 1 },
    { userId: 1, achievementId: AchievementTypes.FirstSticky, accumulation: 1, unlockedAt: new Date() },
];

// 基础数据初始化
async function baseInit() {
    console.log(`Start base seeding ...`);

    // 流行语
    console.log(`初始化流行语...`);
    for (const item of buzzwords) {
        const buzzword = await db.buzzword.upsert({ create: item, update: item, where: { id: item.id } });
        console.log(`Created buzzword id: ${buzzword.id}`);
    }
    // 礼物
    console.log(`初始化礼物...`);
    for (const item of gifts) {
        const gift = await db.gift.upsert({ create: item, update: item, where: { id: item.id } });
        console.log(`Created gift id: ${gift.id}`);
    }
    // 成就
    for (const item of achievements) {
        const achievement = await db.achievement.upsert({ create: item, update: item, where: { id: item.id } });
        console.log(`Created achievement id: ${achievement.id}`);
    }

    console.log(`base seeding finished.`);
}

async function initForSteam() {
    console.log(`Start seeding for steam ...`);
    console.log(`初始化用户...`);
    const user = await db.user.upsert({ create: users[0], update: users[0], where: { id: users[0].id } });
    console.log(`Created user with id: ${user.id}`);

    console.log(`开始初始化搜索页面组件...`);
    for (const item of discoverPageWidgets) {
        const pageWidget = await db.pageWidget.upsert({ create: item, update: item, where: { id: item.id } });
        console.log(`Created page widget: ${pageWidget.id}`);
    }

    console.log(`开始初始化Steam游戏...`);
    const steamGames = fs.readFileSync(path.join(path.resolve(), './prisma/gameList'), 'utf8').split('\n');
    for (const steamGame of steamGames) {
        const pair = steamGame.split('|');
        if (pair.length !== 2) return;
        const steamAppId = pair[0];
        const gameData = JSON.parse(Buffer.from(pair[1], 'base64').toString());
        if (gameData) {
            const newApp = await steam.parseGameDetailToPrismaData(gameData);
            newApp.isVisible = true; // set it visible
            newApp.discussionChannels = {
                create: [
                    { name: '综合讨论', description: '各种话题都可以谁便说' }
                ],
            };
            if (newApp) await db.app.create({ data: newApp });
            console.log(`已初始化游戏 [${steamAppId}] ${gameData[steamAppId].data.name}`);
        }
    }
    console.log(`Seeding finished.`);
}

async function initForDev() {
    // 开始初始化
    console.log(`Start seeding for Dev ...`);
    // 用户
    for (const item of users) {
        const user = await db.user.upsert({ create: item, update: item, where: { id: item.id } });
        console.log(`Created user with id: ${user.id}`);
    }
    // 组织
    for (const item of organizations) {
        const org = await db.organization.upsert({ create: item, update: item, where: { id: item.id } });
        console.log(`Created organization with id: ${org.id}`);
    }
    // 应用
    for (const item of apps) {
        const app = await db.app.upsert({ create: item, update: item, where: { id: item.id } });
        console.log(`Created app with id: ${app.id}`);
    }
    // 组织与应用的关系 开发商
    for (const item of appDeveloperRef) {
        const ref = await db.appDeveloperRef.upsert({ create: item, update: item, where: { appId_organizationId: { appId: item.appId, organizationId: item.organizationId } } });
        console.log(`Created app developer reference  [${ref.appId}] - [${ref.organizationId}]`);
    }
    // 组织与应用的关系 发行商
    for (const item of appPublisherRef) {
        const ref = await db.appPublisherRef.upsert({ create: item, update: item, where: { appId_organizationId: { appId: item.appId, organizationId: item.organizationId } } });
        console.log(`Created app publisher reference  [${ref.appId}] - [${ref.organizationId}]`);
    }
    // 标签
    for (const item of tags) {
        const tag = await db.tag.upsert({ create: item, update: item, where: { id: item.id } });
        console.log(`Created tag with id: ${tag.id}`);
    }
    // 标签与app的关系
    for (const item of appUserTagRef) {
        // item.count = Math.round(Math.random() * 100);
        const ref = await db.appUserTagRef.upsert({ create: item, update: item, where: { appId_userId_tagId: { userId: item.userId, appId: item.appId, tagId: item.tagId } } });
        console.log(`Created app tag reference [${ref.appId}] - [${ref.tagId}]`);
    }
    // 类型与app的关系
    for (const item of appGenreRef) {
        const ref = await db.appGenreRef.upsert({ create: item, update: item, where: { appId_tagId: { appId: item.appId, tagId: item.tagId } } });
        console.log(`Created app genre reference [${ref.appId}] - [${ref.tagId}]`);
    }
    // 功能与app的关系
    for (const item of appFeatureRef) {
        const ref = await db.appFeatureRef.upsert({ create: item, update: item, where: { appId_tagId: { appId: item.appId, tagId: item.tagId } } });
        console.log(`Created app feature reference [${ref.appId}] - [${ref.tagId}]`);
    }
    // 媒体资源
    for (const item of appMedia) {
        const medium = await db.appMedia.upsert({ create: item, update: item, where: { id: item.id } });
        console.log(`Created medium with id: ${medium.id}`);
    }
    // 社交链接
    for (const item of appSocialLinks) {
        const socialLink = await db.appSocialLink.upsert({ create: item, update: item, where: { id: item.id } });
        console.log(`Created app social link with id: ${socialLink.id}`);
    }
    // 支持的平台, 先删除再重新添加
    for (const item of apps) await db.appPlatform.deleteMany({ where: { appId: item.id } });
    for (const item of appPlatforms) {
        const appPlatform = await db.appPlatform.upsert({ create: item, update: item, where: { id: item.id } });
        console.log(`Created app platform with id: ${appPlatform.id}`);
    }
    // 支持的语言, 先删除再重新添加
    for (const item of apps) await db.appLanguages.deleteMany({ where: { appId: item.id } });
    for (const item of appLanguages) {
        const appLanguage = await db.appLanguages.upsert({ create: item, update: item, where: { id: item.id } });
        console.log(`Created app language with id: ${appLanguage.id}`);
    }
    // 游戏荣誉
    for (const item of appAwards) {
        const appAward = await db.appAward.upsert({ create: item, update: item, where: { id: item.id } });
        console.log(`Created app award with id: ${appAward.id}`);
    }
    // 搜索热词
    for (const item of hotSearchList) {
        const hotSearch = await db.hotSearch.upsert({ create: item, update: item, where: { id: item.id } });
        console.log(`Created search hot term with id: ${hotSearch.id}`);
    }
    // 新闻
    for (const item of news) {
        const newNews = await db.news.upsert({ create: item, update: item, where: { id: item.id } });
        console.log(`Created news with id: ${newNews.id}`);
    }
    // 专业评测
    for (const item of proReviews) {
        const proReview = await db.proReview.upsert({ create: item, update: item, where: { id: item.id } });
        console.log(`Created ProReview with id: ${proReview.id}`);
    }
    // 评测
    for (const item of reviews) {
        const review = await db.review.upsert({ create: item, update: item, where: { id: item.id } });
        console.log(`Created review with id: ${review.id}`);
    }
    // 评测图片
    for (const item of reviewImages) {
        const image = await db.reviewImage.upsert({ create: item, update: item, where: { id: item.id } });
        console.log(`Created review with id: ${image.id}`);
    }
    // 回复
    for (const item of reviewComments) {
        const reviewComment = await db.reviewComment.upsert({ create: item, update: item, where: { id: item.id } });
        console.log(`Created review comment with id: ${reviewComment.id}`);
    }
    // 礼物关系
    for (const item of reviewGiftRefs) {
        const reviewGiftRef = await db.reviewGiftRef.upsert({ create: item, update: item, where: { id: item.id } });
        console.log(`Created review gift relationship for review id: ${reviewGiftRef.reviewId}`);
    }
    // 探索页面组件
    for (const item of discoverPageWidgets) {
        const pageWidget = await db.pageWidget.upsert({ create: item, update: item, where: { id: item.id } });
        console.log(`Created page widget: ${pageWidget.id}`);
    }
    // 讨论频道
    for (const item of discussionChannels) {
        const channel = await db.discussionChannel.upsert({ create: item, update: item, where: { id: item.id } });
        console.log(`Created discussion channel: ${channel.id}`);
    }
    // 用户成就
    for (const item of userAchievements) {
        const ref = await db.userAchievementRef.upsert({ create: item, update: item, where: { userId_achievementId: { userId: item.userId, achievementId: item.achievementId } } });
        console.log(`Created user achievement ref user id: ${ref.userId}`);
    }
    console.log(`Seeding finished.`);
}

async function main() {
    const { values } = parseArgs({ options: { environment: { type: 'string', }, } });
    baseInit();
    switch (values.environment) {
        case "steam":
        case "production":
            initForSteam();
            break;
        default:
            initForDev();
            break;
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await db.$disconnect();
});
