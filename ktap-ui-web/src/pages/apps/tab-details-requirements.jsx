import React from 'react';
import { Block } from 'baseui/block';
import { StatefulTabs, Tab } from 'baseui/tabs-motion';
import { LabelLarge, LabelSmall } from 'baseui/typography';
import { Android, Apple, Linux, Mac, Win } from '../../components/icons';

function RequirementItem({ name, content }) {
    return (
        <>
            <LabelSmall color='primary400' marginTop='scale600' marginBottom='scale100'>{name}</LabelSmall>
            <LabelSmall color='primary200' marginBottom='scale600'>{content}</LabelSmall>
        </>
    );
}

function TabDetailsRequirements({ app }) {
    return (
        <Block paddingTop='scale600' paddingBottom='scale600'>
            <LabelLarge paddingTop='scale300' paddingBottom='scale300'>系统需求</LabelLarge>
            <StatefulTabs>
                {app?.platforms && app.platforms.map((platform, index) => (
                    <Tab key={index} title={platform.os} artwork={() => {
                        switch (platform.os) {
                            case 'Windows': return <Win width='18px' height='18px' />;
                            case 'Macos': return <Mac width='18px' height='18px' />;
                            case 'Linux': return <Linux width='18px' height='18px' />;
                            case 'iOS': return <Apple width='18px' height='18px' />;
                            case 'Android': return <Android width='18px' height='18px' />;
                            default: return <></>;
                        }
                    }}>
                        <Block display='flex'>
                            <Block width='50%' paddingRight='scale100'>
                                <LabelSmall color='primary200' marginRight='scale200' marginBottom='scale100'>最小配置</LabelSmall>
                                {platform.requirements.map((requirement, j) => (
                                    <RequirementItem key={j} name={requirement.name} content={requirement.minimum} />
                                ))}
                            </Block>
                            <Block width='50%' paddingLeft='scale100'>
                                <LabelSmall color='primary200' marginRight='scale200' marginBottom='scale100'>推荐配置</LabelSmall>
                                {platform.requirements.map((requirement, j) => (
                                    <RequirementItem key={j} name={requirement.name} content={requirement.recommended} />
                                ))}
                            </Block>
                        </Block>
                    </Tab>
                ))}
            </StatefulTabs>
        </Block>
    );
}
export default TabDetailsRequirements;