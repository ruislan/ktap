export const Pagination = {
    limit: {
        min: 1,
        mini: 5,
        small: 10,
        default: 20,
        large: 50,
    },
    parse(initSkip, initLimit, defaultLimit) {
        defaultLimit = defaultLimit || Pagination.limit.small;
        const skip = Math.max(0, Number(initSkip) || 0);
        const limit = Math.max(Pagination.limit.min, Math.min(Pagination.limit.large, (Number(initLimit) || defaultLimit)));
        return { skip, limit };
    },
};

export const Notification = {
    type: { system: 'system', following: 'following', reaction: 'reaction', },
    target: { App: 'App', User: 'User' },
    settings: {
        followingAppChanged: 'followingAppChanged', followingUserChanged: 'followingUserChanged',
        reactionReplied: 'reactionReplied', reactionThumbed: 'reactionThumbed', reactionGiftSent: 'reactionGiftSent',
    },
    action: {
        newsCreated: 'newsCreated',
        reviewCreated: 'reviewCreated', commentCreated: 'commentCreated',
        discussionCreated: 'discussionCreated', postCreated: 'postCreated',
        reviewThumbed: 'reviewThumbed', postThumbed: 'postThumbed',
        reviewGiftSent: 'reviewGiftSent', postGiftSent: 'postGiftSent',
    },
    getContent(action, type) {
        switch (action) {
            case Notification.action.newsCreated: return '发表了一篇新闻';
            case Notification.action.reviewCreated: return '发表了一篇评测';
            case Notification.action.commentCreated: return type === Notification.type.following ? '回复了一篇评测' : '你的评测有新的回复';
            case Notification.action.discussionCreated: return '发表了一篇讨论主题';
            case Notification.action.postCreated: return type === Notification.type.following ? '发表了一篇讨论回帖' : '你的讨论有新的回帖';
            case Notification.action.reviewThumbed: return type === Notification.type.following ? '点赞了一篇评测' : '你的评测有新的点赞';
            case Notification.action.postThumbed: return type === Notification.type.following ? '点赞了一篇讨论回帖' : '你的讨论回帖有新的点赞';
            case Notification.action.reviewGiftSent: return type === Notification.type.following ? '给一篇评测赠送了礼物' : '你的评测收到了新的礼物';
            case Notification.action.postGiftSent: return type === Notification.type.following ? '给一篇讨论回帖赠送了礼物' : '你的讨论回帖收到了新的礼物';
            default: return '';
        }
    }
};

export const Pages = {
    discover: 'discover',
};

export const Trading = {
    type: {
        buy: 'buy', // 购买/消费
        give: 'give', // 赠送
    }
};

export const AppMedia = {
    // 媒体用途：头图（Head）、宣传横图（Landscape）、宣传竖图（Portrait）、画廊（Gallery)、品牌商标（Logo）
    usage: {
        head: 'head',
        landscape: 'landscape',
        portrait: 'portrait',
        gallery: 'gallery',
        logo: 'logo',
    },
    type: {
        image: 'image',
        video: 'video'
    }
};

export const TagCategory = {
    normal: 'normal', // 普通标签，编辑或者用户使用的，什么类型都可以
    genre: 'genre', // 游戏类型（角色扮演，射击。。。）
    feature: 'feature', // 游戏功能（多人，单人，跨平台合作。。。）
};

export const SocialLinkBrands = {
    bilibili: { id: 'bilibili', name: '哔哩哔哩' },
    discord: { id: 'discord', name: 'Discord' },
    facebook: { id: 'facebook', name: 'Facebook' },
    instagram: { id: 'instagram', name: 'Instagram' },
    qq: { id: 'qq', name: 'QQ' },
    reddit: { id: 'reddit', name: 'Reddit' },
    site: { id: 'site', name: '官网' },
    skype: { id: 'skype', name: 'Skype' },
    steam: { id: 'steam', name: 'Steam' },
    twitch: { id: 'twitch', name: 'Twitch' },
    twitter: { id: 'twitter', name: 'Twitter' },
    youtube: { id: 'youtube', name: 'YouTube' },
    weibo: { id: 'weibo', name: '微博' },
    wechat: { id: 'wechat', name: '微信' },
    zhihu: { id: 'zhihu', name: '知乎' },
};

export const AppPlatform = {
    os: {
        windows: 'Windows',
        macos: 'Macos',
        linux: 'Linux',
        android: 'Android',
        ios: 'iOS',
    }
};

export const AppLanguages = {
    supported: [
        { id: '英语', name: 'English', },
        { id: '法语', name: 'Français', },
        { id: '意大利语', name: 'Italiano', },
        { id: '德语', name: 'Deutsch', },
        { id: '日语', name: '日本语', },
        { id: '韩语', name: '한글', },
        { id: '西班牙语', name: 'Español', },
        { id: '波兰语', name: 'Portugués', },
        { id: '俄语', name: 'русский язык', },
        { id: '瑞典语', name: 'Svenska', },
        { id: '荷兰语', name: 'Nederlands', },
        { id: '简体中文', name: '简体中文', },
        { id: '繁体中文', name: '繁体中文', },
    ]
}

export const Keys = {
    cookie: {
        token: 'token',
        userId: 'user_id',
    }
};
