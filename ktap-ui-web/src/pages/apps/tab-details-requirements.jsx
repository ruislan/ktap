import { Block } from 'baseui/block';
import { StatefulTabs, Tab } from 'baseui/tabs-motion';
import { LabelLarge, LabelSmall } from 'baseui/typography';

import { Android, Apple, Icon, Linux, Mac, Win } from '@ktap/components/icons';

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
                            case 'Windows': return <Icon $size='lg'><Win /></Icon>;
                            case 'Macos': return <Icon $size='lg'><Mac /></Icon>;
                            case 'Linux': return <Icon $size='lg'><Linux /></Icon>;
                            case 'iOS': return <Icon $size='lg'><Apple /></Icon>;
                            case 'Android': return <Icon $size='lg'><Android /></Icon>;
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