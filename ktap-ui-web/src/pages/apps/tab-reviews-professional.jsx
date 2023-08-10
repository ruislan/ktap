import React from 'react';
import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { LabelLarge, LabelMedium, ParagraphMedium, } from 'baseui/typography';

function TabReviewsProfessional({ app }) {
    const [css, theme] = useStyletron();
    return (
        <>{app.proReviews?.length > 0 &&
            <Block paddingTop='scale600' paddingBottom='scale600'>
                <Block paddingTop='scale300' paddingBottom='scale300' font='font300'>
                    <LabelLarge>权威评测</LabelLarge>
                </Block>
                <Block display='flex' height='100%' overflow='auto' paddingBottom='scale100'>
                    {app.proReviews.map(({ name, summary, score, url }, index) => {
                        return (
                            <a key={index} href={url} target='_blank' className={css({
                                display: 'flex',
                                flexDirection: 'column',
                                marginTop: theme.sizing.scale300,
                                marginRight: theme.sizing.scale600,
                                marginBottom: theme.sizing.scale300,
                                textDecoration: 'none',
                                color: 'inherit',
                                minWidth: '66%',
                                maxWidth: '66%',
                                position: 'relative',
                                padding: theme.sizing.scale600,
                                backgroundColor: theme.colors.backgroundSecondary,
                                borderRadius: theme.borders.radius200,
                                ':last-child': {
                                    marginRight: '0',
                                }
                            })}>
                                <ParagraphMedium marginTop='0' flex='1'>{summary}</ParagraphMedium>
                                <Block display='flex' justifyContent='space-between' alignItems='baseline'>
                                    <LabelMedium>{name}</LabelMedium>
                                    <Block>{score}</Block>
                                </Block>
                            </a>
                        );
                    })}
                </Block>
            </Block>
        }
        </>
    );
}
export default TabReviewsProfessional;