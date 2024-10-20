import PropTypes from 'prop-types';

import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { LabelSmall } from 'baseui/typography';

import SideBox from '@ktap/components/side-box';
import { QQ, WeChat, Steam, BiliBili, Twitch, YouTube, Discord, Facebook, Instagram, Twitter, Earth, Icon, ZhiHu, WeiBo, Reddit, Skype } from '@ktap/components/icons';

function getIcon(id) {
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
        case 'zhihu': return <ZhiHu />;
        case 'weibo': return <WeiBo />;
        case 'reddit': return <Reddit />;
        case 'skype': return <Skype />;
        default: return <Earth />;
    }
}

function ContactItem({ icon, name, href, isBlank = true }) {
    const [css, theme] = useStyletron();
    const contractItemStyle = css({
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        color: 'inherit',
        marginBottom: theme.sizing.scale0,
        borderRadius: theme.borders.radius200,
        padding: theme.sizing.scale300,
        backgroundColor: 'rgba(109, 109, 109, 0.1)',
        cursor: 'pointer',
        ':hover': {
            backgroundColor: 'rgba(109, 109, 109, 0.3)',
        },
        ':last-child': {
            marginBottom: 0,
        }
    });
    return href ? (
        <a href={href || '#'} target={isBlank ? '_blank' : '_top'} className={contractItemStyle} rel='noreferrer'>
            <Icon $size='lg'>{icon}</Icon>
            <LabelSmall marginLeft='scale100' overflow='hidden' whiteSpace='nowrap' textOverflow='ellipsis'>{name}</LabelSmall>
        </a>
    ) : (
        <div className={contractItemStyle}>
            <Icon $size='lg'>{icon}</Icon>
            <LabelSmall marginLeft='scale100' overflow='hidden' whiteSpace='nowrap' textOverflow='ellipsis'>{name}</LabelSmall>
        </div>
    );
}

function SideContact({ socialLinks }) {
    return (
        <SideBox title='联系我们'>
            <Block display='flex' flexDirection='column' paddingLeft='scale300' paddingRight='scale300' paddingBottom='scale600'>
                {socialLinks && socialLinks.map((socialLink, index) => <ContactItem key={index} icon={getIcon(socialLink.brand)} name={socialLink.name} href={socialLink.url} />)}
            </Block>
        </SideBox>
    );
}


SideContact.propTypes = {
    socialLinks: PropTypes.array,
};

ContactItem.propTypes = {
    icon: PropTypes.object,
    name: PropTypes.string,
    href: PropTypes.string,
    isBlank: PropTypes.bool,
};

export default SideContact;