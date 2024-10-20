import { Block } from 'baseui/block';
import { DisplayMedium, HeadingSmall, LabelMedium, ParagraphMedium, } from 'baseui/typography';

export default function About() {

    return (
        <Block display='flex' alignItems='center' flexDirection='column' maxWidth='664px' margin='48px auto' padding='scale600'>
            <DisplayMedium marginBottom='scale600'>关于我们</DisplayMedium>
            <LabelMedium color='primary300' display='flex' justifyContent='space-between' alignItems='center' marginBottom='scale600'>更新于 2023-01-01</LabelMedium>
            <ParagraphMedium color='primary100' marginBottom='scale600' alignSelf='flex-start'>
                KTap 想法诞生于2022年，是向Steam、Epic、TapTap、IGDB等站致敬的产物，同时我也有很多其他的想法会逐步的实现。
                本人是游戏爱好者，也希望大家能够有一个真诚、好玩、梗多、热闹、优雅和现代的游戏社区。
            </ParagraphMedium>
            <HeadingSmall marginBottom='scale300'>联系方式</HeadingSmall>
            <Block color='primary100' marginBottom='scale600' alignSelf='flex-start'>
                <ul>
                    <li>邮箱：z17520@126.com</li>
                </ul>
            </Block>
        </Block>
    );
}