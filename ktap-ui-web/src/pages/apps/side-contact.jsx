import React from 'react';

import { Block } from 'baseui/block';
import SideBox from '../../components/side-box';
import { LabelSmall } from 'baseui/typography';
import { useStyletron } from 'baseui';
import { SocialLinks } from '../../constants';

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
        <a href={href || '#'} target={isBlank ? '_blank' : '_top'} className={contractItemStyle}>
            <Block width='20px' height='20px' minWidth='20px'>{icon}</Block>
            <LabelSmall marginLeft='scale100' overflow='hidden' whiteSpace='nowrap' textOverflow='ellipsis'>{name}</LabelSmall>
        </a>
    ) : (
        <div className={contractItemStyle}>
            <Block width='20px' height='20px' minWidth='20px'>{icon}</Block>
            <LabelSmall marginLeft='scale100' overflow='hidden' whiteSpace='nowrap' textOverflow='ellipsis'>{name}</LabelSmall>
        </div>
    );
}

function SideContact({ socialLinks }) {

    return (
        <SideBox title='联系我们'>
            <Block display='flex' flexDirection='column' paddingLeft='scale300' paddingRight='scale300' paddingBottom='scale600'>
                {socialLinks && socialLinks.map((socialLink, index) => <ContactItem key={index} icon={SocialLinks.getIcon(socialLink.brand)} name={socialLink.name} href={socialLink.url} />)}
            </Block>
        </SideBox>
    );
}

export default SideContact;