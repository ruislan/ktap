import { BiliBili, Discord, Earth, Facebook, Instagram, QQ, Steam, Twitch, Twitter, WeChat, YouTube } from "./components/icons";
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.locale('zh-cn');
dayjs.extend(relativeTime);

export const MOBILE_BREAKPOINT_PX = 992;
export const MOBILE_BREAKPOINT = `@media only screen and (max-width: ${MOBILE_BREAKPOINT_PX}px)`;

export const LAYOUT_MAIN = '950px';
export const LAYOUT_LEFT = '616px';
export const LAYOUT_RIGHT = '334px';
export const LAYOUT_SETTINGS_LEFT = '256px';
export const LAYOUT_SETTINGS_RIGHT = '694px';
export const LAYOUT_ADMIN_LEFT = '256px';
export const LAYOUT_ADMIN_RIGHT = '880px';

export const IMAGE_UPLOAD_SIZE_LIMIT = 1024 * 1024 * 10; // 10MB

export const PAGE_LIMIT_NORMAL = 20;
export const PAGE_LIMIT_SMALL = 10;
export const PAGE_LIMIT_MINI = 5;

export const DateTime = {
    format(dateString) {
        return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss');
    },
    formatShort(dateString) {
        return dayjs(dateString).format('YYYY-MM-DD');
    },
    formatCNShort(dateString) {
        return dayjs(dateString).format('YYYY 年 M 月 D 日');
    },
    formatCN(dateString) {
        return dayjs(dateString).format('YYYY 年 M 月 D 日 HH:mm');
    },
    fromNow(dateString) {
        return dayjs(dateString).fromNow();
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
        { label: '官网', id: 'site' },
        { label: 'QQ', id: 'qq' },
        { label: '微信', id: 'wechat' },
        { label: '哔哩哔哩', id: 'bilibili' },
        { label: '微博', id: 'weibo' },
        { label: '知乎', id: 'zhihu' },
        { label: 'Discord', id: 'discord' },
        { label: 'YouTube', id: 'youtube' },
        { label: 'Twitch', id: 'twitch' },
        { label: 'Facebook', id: 'facebook' },
        { label: 'Instagram', id: 'instagram' },
        { label: 'Twitter', id: 'twitter' },
        { label: 'Steam', id: 'steam' },
    ],
    getDisplayLabel(id) {
        return this.options.find(item => item.id === id).label;
    },
    getIcon(id) {
        id = id ? id.toLowerCase() : '';
        switch (id) {
            case 'qq': return <QQ />;
            case 'wechat': return <WeChat />;
            case 'steam': return <Steam />;
            case 'bilibili': return <BiliBili />;
            case 'twitch': return <Twitch />;
            case 'youtube': return <YouTube />;
            case 'discord': return <Discord />;
            case 'facebook': return <Facebook />;
            case 'instagram': return <Instagram />;
            case 'twitter': return <Twitter />;
            default: return <Earth />;
        }
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
    authFail: '您输入的邮箱或密码不正确',
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
    }
};