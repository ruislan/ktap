import { Block } from 'baseui/block';
import { TrashBin } from './icons';

function ImageBox({ src, isDeletable = false, onClickDelete, }) {
    return (
        <Block>
            {isDeletable &&
                <Block onClick={onClickDelete}
                    overrides={{
                        Block: {
                            style: ({ $theme }) => ({
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'absolute',
                                width: $theme.sizing.scale650,
                                height: $theme.sizing.scale650,
                                backgroundColor: $theme.colors.backgroundTertiary,
                                cursor: 'pointer',
                                opacity: 0.6,
                                display: 'flex',
                                ':hover': {
                                    opacity: 1,
                                }
                            })
                        }
                    }}>
                    <TrashBin width='16px' height='16px' />
                </Block>
            }
            <img width='100%' src={src}></img>
        </Block>
    );
}

export default ImageBox;






