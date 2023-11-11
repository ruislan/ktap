import * as dateFns from 'date-fns';
import zh from 'date-fns/locale/zh-CN';

export const MOBILE_BREAKPOINT_PX = 992;
export const MOBILE_BREAKPOINT = `@media only screen and (max-width: ${MOBILE_BREAKPOINT_PX}px)`;

export const LAYOUT_DEFAULT = '950px';
export const LAYOUT_DEFAULT_SIDE = '334px';
export const LAYOUT_DEFAULT_CONTENT = '616px';
export const LAYOUT_SETTINGS_SIDE = '256px';
export const LAYOUT_SETTINGS_CONTENT = '694px';
export const LAYOUT_ADMIN_SIDE = '256px';
export const LAYOUT_ADMIN_CONTENT = '880px';

export const IMAGE_UPLOAD_SIZE_LIMIT = 1024 * 1024 * 10; // 10MB

export const PAGE_LIMIT_NORMAL = 20;
export const PAGE_LIMIT_SMALL = 10;
export const PAGE_LIMIT_MINI = 5;

export const DateTime = {
    format(dateString) {
        return dateFns.format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
    },
    formatShort(dateString) {
        return dateFns.format(new Date(dateString), 'yyyy-MM-dd');
    },
    formatCNShort(dateString) {
        return dateFns.format(new Date(dateString), 'yyyy 年 M 月 d 日');
    },
    formatCN(dateString) {
        return dateFns.format(new Date(dateString), 'yyyy 年 M 月 d 日 HH:mm');
    },
    fromNow(dateString) {
        return dateFns.formatDistanceToNow(new Date(dateString), { locale: zh, addSuffix: true });
    }
};

export const Styles = {
    Button: {
        Act: {
            StartEnhancer: {
                style: ({ $theme }) => ({
                    marginRight: $theme.sizing.scale300,
                })
            }
        }
    },
    Accordion: {
        Panel: {
            Content: {
                style: {
                    paddingLeft: '4px',
                    paddingRight: '4px',
                }
            }
        }
    }
};

export const SocialLinks = {
    options: [
        { id: 'bilibili', label: '哔哩哔哩' },
        { id: 'discord', label: 'Discord' },
        { id: 'facebook', label: 'Facebook' },
        { id: 'instagram', label: 'Instagram' },
        { id: 'qq', label: 'QQ' },
        { id: 'reddit', label: 'Reddit' },
        { id: 'site', label: '官网' },
        { id: 'skype', label: 'Skype' },
        { id: 'steam', label: 'Steam' },
        { id: 'twitch', label: 'Twitch' },
        { id: 'twitter', label: 'Twitter' },
        { id: 'youtube', label: 'YouTube' },
        { id: 'weibo', label: '微博' },
        { id: 'wechat', label: '微信' },
        { id: 'zhihu', label: '知乎' },
    ],
    getDisplayLabel(id) {
        return this.options.find(item => item.id === id).label;
    },
};

export const Trading = {
    type: {
        ids: {
            buy: 'buy',
            give: 'give',
        },
        getDisplayLabel(id) {
            switch (id) {
                case this.ids.buy: return '消费';
                case this.ids.give: return '赠送';
                default: return '';
            }
        },
        getDirectionLabel(id) {
            switch (id) {
                case this.ids.buy: return '-';
                case this.ids.give: return '+';
                default: return '';
            }
        },
    },
    target: {
        ids: {
            User: 'User',
            Gift: 'Gift',
        },
        getContentLabel(id) {
            switch (id) {
                case this.ids.User:
                    return '用户/平台';
                case this.ids.Gift:
                    return '礼物';
                default: break;
            }
        },
    }
};

export const Organization = {
    type: {
        individual: 'individual',
        company: 'company',
        studio: 'studio',
        getDisplayLabel(id) {
            return this.options.find(item => item.id === id).label;
        },
        options: [
            { label: '公司', id: 'company' },
            { label: '工作室', id: 'studio' },
            { label: '个人', id: 'individual' },
        ]
    },
};

export const Tag = {
    category: {
        feature: 'feature',
        genre: 'genre',
        normal: 'normal',
        getDisplayLabel(id) {
            return this.options.find(item => item.id === id).label;
        },
        options: [
            { label: '特性', id: 'feature' },
            { label: '功能', id: 'genre' },
            { label: '标签', id: 'normal' },
        ]
    },
};

export const PageWidget = {
    target: {
        ids: {
            App: 'App',
            Review: 'Review',
            Tag: 'Tag'
        },
        getDisplayLabel(id) {
            return this.options.find(item => item.id === id).label;
        },
        options: [
            { label: '游戏', id: 'App' },
            { label: '评测', id: 'Review' },
            { label: '标签', id: 'Tag' },
        ]
    },
    style: {
        ids: {
            Standard: 'Standard',
            Two: 'Two',
        }
    },
    type: {
        ids: {
            Carousel: 'Carousel',
            CardList: 'CardList',
            TextList: 'TextList',
        },
        getDisplayLabel(id) {
            return this.options.find(item => item.id === id).label;
        },
        options: [
            { label: '旋转木马', id: 'Carousel-Standard' },
            { label: '卡片列表-四联布局', id: 'CardList-Standard' },
            { label: '卡片列表-左右布局', id: 'CardList-Two' },
            { label: '文本列表', id: 'TextList-Standard' },
        ]
    }
};

export const Messages = {
    authFail: '邮箱或密码不正确',
    noPermission: '你没有权限或者已经被管理员封禁',
    requireAgreePrivacy: '需要同意 服务协议 和 隐私政策',
    ok: '操作成功',
    unknownError: '未知错误',
    updated: '更新成功',
    reset: '重置成功',
};

export const AppMedia = {
    // 媒体用途：头图（Head）、宣传横图（Landscape）、宣传竖图（Portrait）、画廊（Gallery)、品牌商标（Logo）
    usage: {
        head: 'head',
        landscape: 'landscape',
        portrait: 'portrait',
        gallery: 'gallery',
        logo: 'logo',
    }
};

export const Gender = {
    options: [
        { id: 'MAN', label: '男' },
        { id: 'WOMAN', label: '女' },
        { id: 'GENDERLESS', label: '保密' },
    ]
};

export const Numbers = {
    abbreviate(num) {
        num = Number(num);
        if (isNaN(num) || num <= 0) return '0';
        if (num < 1000) return num;
        if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
        if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
        return (num / 1000000000).toFixed(1) + 'B';
    },
    computePercent(current, total) {
        return Math.round(current / total * 100).toFixed(2);
    }
};

export function runIfFn(fn, ...args) {
    if (typeof fn === 'function') return fn(...args);
}