import { Link, useNavigate } from 'react-router-dom';

import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { HeadingXSmall, LabelXSmall, MonoLabelMedium, ParagraphSmall } from 'baseui/typography';

import { DateTime, MOBILE_BREAKPOINT } from '@ktap/libs/utils';

export default function NewsItem({ news }) {
    const [css, theme] = useStyletron();
    const navigate = useNavigate();

    return (
        <Link to={`/news/${news.id}`}
            className={css({
                [MOBILE_BREAKPOINT]: {
                    flexDirection: 'column',
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                },
                display: 'flex',
                justifyContent: 'space-between',
                backgroundColor: theme.colors.backgroundSecondary,
                marginTop: theme.sizing.scale300,
                marginBottom: theme.sizing.scale300,
                textDecoration: 'none',
                borderRadius: theme.borders.radius300,
                boxShadow: '2px 2px 12px 2px rgb(0 0 0 / 0%)',
                transition: 'box-shadow .24s ease-in-out',
                ':first-child': {
                    marginTop: 0,
                },
                ':hover': {
                    boxShadow: '2px 2px 12px 2px rgb(0 0 0 / 50%)',
                    backgroundColor: 'rgba(109, 109, 109, 0.3)',
                }
            })}
        >
            <Block display='flex' flexDirection='column' overflow='hidden' padding='scale500'>
                <HeadingXSmall overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap' marginTop='0' marginBottom='scale100'>{news.title}</HeadingXSmall>
                <LabelXSmall marginTop='scale100' color='primary300'>日期：{DateTime.formatCN(news.updatedAt)}</LabelXSmall>
                <ParagraphSmall display='-webkit-box' color='primary100' overflow='hidden' overrides={{
                    Block: {
                        style: {
                            '-webkit-box-orient': 'vertical',
                            '-webkit-line-clamp': news.app ? 4 : 6,
                        }
                    }
                }}>{news.summary}</ParagraphSmall>

                {news.app &&
                    <Block display='flex' alignItems='center'>
                        <Block display='flex' alignItems='center'
                            onClick={(e) => {
                                e.preventDefault();
                                navigate(`/apps/${news.app.id}`);
                            }}
                            overrides={{
                                Block: {
                                    style: {
                                        marginLeft: '-4px',
                                        padding: theme.sizing.scale100,
                                        ':hover': {
                                            backgroundColor: 'rgba(109, 109, 109, 0.3)',
                                            borderRadius: theme.borders.radius200
                                        }
                                    }
                                }
                            }}>
                            <img src={news.app.logo} width='18px' height='18px' className={css({
                                borderRadius: theme.borders.radius100,
                            })} />
                            <MonoLabelMedium marginLeft='scale300' marginRight='scale0' color='primary200'>{news.app.name}</MonoLabelMedium>
                        </Block>
                    </Block>
                }
            </Block>
            <Block padding='scale500' width='350px' minWidth='350px'
                overrides={{
                    Block: {
                        style: {
                            [MOBILE_BREAKPOINT]: {
                                width: '100%',
                                padding: '0',
                                gridArea: '1 / 1',
                            }
                        }
                    }
                }}
            >
                <img src={news.head} width='100%' height='100%' className={css({
                    borderRadius: theme.borders.radius300,
                    [MOBILE_BREAKPOINT]: {
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0,
                    }
                })} />
            </Block>
        </Link>
    );
}