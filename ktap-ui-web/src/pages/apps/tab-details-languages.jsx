import { Block } from 'baseui/block';
import { LabelLarge, LabelSmall } from 'baseui/typography';

export default function TabDetailsLanguages({ app }) {
    const { text, audio } = app?.languages || { text: '', audio: '' };

    return (
        <Block marginTop='scale600' marginBottom='scale600' font='font300'>
            <Block marginTop='scale300' marginBottom='scale600'>
                <LabelLarge>支持语言</LabelLarge>
            </Block>
            <Block marginTop='scale300' display='flex' flexDirection='column' gridGap='scale0'>
                <LabelSmall color='primary200' overrides={{
                    Block: {
                        style: {
                            letterSpacing: '0.5px',
                            lineHeight: '20px',
                        }
                    }
                }}>文本: {text.length === 0 ? '不支持' : text.split(',').join(', ')}</LabelSmall>
                <LabelSmall color='primary200' overrides={{
                    Block: {
                        style: {
                            letterSpacing: '0.5px',
                            lineHeight: '20px',
                        }
                    }
                }}>音频: {audio.length === 0 ? '不支持' : audio.split(',').join(', ')}</LabelSmall>
            </Block>
        </Block>
    );
}