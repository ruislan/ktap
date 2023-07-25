import React from 'react';
import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { Earth } from '../../components/icons';

function ContactItem({ href, title, target, icon, }) {
    const [css, theme] = useStyletron();
    const contractItemStyle = css({
        display: 'block',
        textDecoration: 'none',
        position: 'relative',
        transition: 'all 125ms ease-in-out',
        padding: theme.sizing.scale0,
        color: 'rgba(245, 245, 245, 0.6)',
        ':hover': {
            color: 'rgba(245, 245, 245, 1)',
            transform: 'translateY(-1px)',
        },
    });
    return (
        <a href={href} title={title} target={target} className={contractItemStyle}> {icon}</a>
    );
}

function OrganizationContact({ data }) {
    return (
        <Block backgroundColor='backgroundSecondary' marginBottom='scale800' padding='scale600' overrides={{
            Block: {
                style: ({ $theme }) => ({
                    borderRadius: $theme.borders.radius300,
                })
            }
        }}>

            <Block display='flex' gridGap='scale100'>
                {data?.site && <ContactItem href={data.site} title='官网' icon={<Earth width='32px' />} target='_blank' />}
            </Block>
        </Block>
    );
}

export default OrganizationContact;