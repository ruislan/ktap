import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { LabelMedium } from 'baseui/typography';
import { MOBILE_BREAKPOINT } from '../../libs/utils';
import { Link } from 'react-router-dom';

function TextList({ title, dataList }) {
    const [css, theme] = useStyletron();
    return (
        <Block display='flex' marginBottom='scale1200' flexDirection='column'
            overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        [MOBILE_BREAKPOINT]: {
                            paddingLeft: $theme.sizing.scale300,
                            paddingRight: $theme.sizing.scale300,
                        }
                    })
                }
            }}
        >
            <Block marginBottom='scale600'>
                <LabelMedium display='flex' alignItems='center' height='28px'>{title}</LabelMedium>
            </Block>
            <Block display='grid' gridTemplateColumns='1fr 1fr 1fr 1fr' width='100%' height='100%' gridGap='scale300' overflow='auto'>
                {
                    dataList.map((data, index) => (
                        <Link key={index} to={data.link}
                            className={css({
                                display: 'flex',
                                padding: theme.sizing.scale400,
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: theme.borders.radius300,
                                textDecoration: 'none',
                                color: 'inherit',
                                backgroundColor: theme.colors.backgroundSecondary,
                                [MOBILE_BREAKPOINT]: {
                                    fontSize: '14px',
                                }
                            })}
                        >
                            {data.name}
                        </Link>
                    ))
                }
            </Block>
        </Block>
    );
}

export default TextList;
