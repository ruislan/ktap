import { LabelXSmall } from 'baseui/typography';

function Buzzword({ onClick, children }) {
    return (
        <LabelXSmall onClick={onClick} color='primary200' overrides={{
            Block: {
                style: ({ $theme }) => ({
                    padding: $theme.sizing.scale300,
                    backgroundColor: $theme.colors.backgroundTertiary,
                    borderRadius: $theme.borders.radius200,
                    margin: $theme.sizing.scale100,
                    cursor: 'pointer',
                    ':hover': {
                        backgroundColor: 'rgb(71, 71, 71)',
                    }
                })
            }
        }}>{children}</LabelXSmall>
    );
}

export default Buzzword;






