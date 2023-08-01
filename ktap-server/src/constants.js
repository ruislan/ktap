export const errors = {
    forbidden(message = '') { return { code: 403, message } },
    notFound(message = '') { return { code: 404, message } },
    code: {
        validation: 400,
        authentication: 401,
        forbidden: 403,
    },
    message: {
        authenticationFailed: '认证失败',
        userIsLocked: '用户已经被锁定',
        userAgreeRequired: '需要同意 服务协议 和 隐私政策',
        userNameDuplicated: '昵称和别人冲突啦',
        userNameNotYet: '昵称不要换得太频繁啦，更换时间间隔为 30 天',
        userEmailDuplicated: '邮箱已经被使用了哟，如果您确定这是您的邮箱，那就尝试找回密码吧',
        userOldPasswordWrong: '旧密码错误，温馨提示：注意大小写和空格哟',
        userAvatarUploadFailed: '头像上传失败，请稍后再试，温馨提示：注意文件大小和格式，以及网络情况哟',
    }
};

export const USER_CHANGE_NAME_INTERVAL = 1000 * 60 * 60 * 24 * 30; // 30 days
export const REVIEW_IMAGE_COUNT_LIMIT = 3; // 3 images
export const REVIEW_CONTENT_LIMIT = 8000; // 8000个字

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
    site: { id: 'site', name: '官网' },
    qq: { id: 'qq', name: 'QQ' },
    wechat: { id: 'wechat', name: '微信' },
    bilibili: { id: 'bilibili', name: '哔哩哔哩' },
    weibo: { id: 'weibo', name: '微博' },
    zhihu: { id: 'zhihu', name: '知乎' },
    discord: { id: 'discord', name: 'Discord' },
    youtube: { id: 'youtube', name: 'YouTube' },
    twitch: { id: 'twitch', name: 'Twitch' },
    facebook: { id: 'facebook', name: 'Facebook' },
    instagram: { id: 'instagram', name: 'Instagram' },
    twitter: { id: 'twitter', name: 'Twitter' },
    steam: { id: 'steam', name: 'Steam' },
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

export const Gender = {
    MAN: 'MAN',
    WOMAN: 'WOMAN',
    GENDERLESS: 'GENDERLESS'
};

export const Keys = {
    cookie: {
        token: 'token',
    }
};
