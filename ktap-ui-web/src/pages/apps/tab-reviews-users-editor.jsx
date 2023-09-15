import React from 'react';
import Compressor from 'compressorjs';
import { useNavigate } from 'react-router-dom';

import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { LabelLarge, LabelMedium, LabelSmall, LabelXSmall, ParagraphMedium, ParagraphSmall } from 'baseui/typography';
import { Button } from 'baseui/button';
import { Checkbox } from 'baseui/checkbox';
import { Textarea } from 'baseui/textarea';
import { Skeleton } from 'baseui/skeleton';
import { StarRating } from 'baseui/rating';

import { Icon, Photograph } from '@ktap/components/icons';
import { DateTime, IMAGE_UPLOAD_SIZE_LIMIT, MOBILE_BREAKPOINT } from '@ktap/libs/utils';
import { useAuth } from '@ktap/hooks/use-auth';
import useScoreRemark from '@ktap/hooks/use-score-remark';
import ImageBoxGallery from '@ktap/components/image-box-gallery';
import ImageBox from '@ktap/components/image-box';
import RouterLink from '@ktap/components/router-link';

function TabReviewsUsersEditor({ app }) {
    const [, theme] = useStyletron();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [draftReview, setDraftReview] = React.useState({ score: 4, content: '', allowComment: true, files: [] });
    const { remark } = useScoreRemark({ score: draftReview?.score });
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const draftReviewFileInput = React.useRef(null);
    const draftReviewFilesLimit = 3;
    const [isLoading, setIsLoading] = React.useState(false);
    const [myReview, setMyReview] = React.useState({});

    React.useEffect(() => {
        const fetchMyReview = async () => {
            if (isAuthenticated()) {
                try {
                    setIsLoading(true);
                    const res = await fetch(`/api/apps/${app.id}/reviews/by-me`);
                    if (res.ok) {
                        const json = await res.json();
                        setMyReview(json.data);
                    }
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchMyReview();
    }, [app?.id, isAuthenticated]);

    const handleSubmitReview = async () => {
        try {
            setIsSubmitting(true);
            const form = new FormData();
            for (const file of draftReview.files) {
                if (file.size > IMAGE_UPLOAD_SIZE_LIMIT) {
                    const compressedFile = await new Promise((resolve, reject) =>
                        new Compressor(file, {
                            quality: 0.7,
                            success(result) {
                                resolve(result);
                            },
                            error(err) {
                                reject(err);
                            }
                        })
                    );
                    form.append('file', compressedFile, compressedFile.name);
                } else {
                    form.append('file', file);
                }
            }
            form.append('score', draftReview.score);
            form.append('content', draftReview.content);
            form.append('allowComment', draftReview.allowComment);
            const res = await fetch(`/api/apps/${app.id}/reviews`, { method: 'POST', body: form });
            if (res.ok) {
                const json = await res.json();
                setMyReview(json.data);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {isAuthenticated() ?
                (isLoading ?
                    <Block marginTop='scale600' marginBottom='scale600'><Skeleton animation height='320px' width='100%' /></Block> :
                    <Block backgroundColor='backgroundSecondary' padding='scale600' marginTop='scale300' marginBottom='scale600' overrides={{
                        Block: {
                            style: {
                                borderRadius: theme.borders.radius300
                            }
                        }
                    }}>
                        {myReview?.id ?
                            <>
                                <LabelLarge paddingBottom='scale300'>您为 《{app.name}》 撰写的评测</LabelLarge>
                                <StarRating value={myReview.score} size='16' readOnly />
                                <LabelSmall color='primary500' marginTop='scale300'>发布于：{DateTime.formatCN(myReview.createdAt)}</LabelSmall>
                                <ParagraphMedium>{myReview.content}</ParagraphMedium>
                                <ImageBoxGallery id='my-ibg' images={myReview.images} />
                                <Block paddingTop='scale300' overrides={{
                                    Block: {
                                        style: {
                                            borderStyle: 'solid',
                                            borderColor: theme.borders.border200.borderColor,
                                            borderTopWidth: '1px',
                                            borderBottomWidth: '0',
                                            borderLeftWidth: '0',
                                            borderRightWidth: '0',
                                        }
                                    }
                                }}>
                                    <Block display='flex' justifyContent='space-between' alignItems='center'>
                                        <Block>
                                            <Button
                                                onClick={() => navigate(`/reviews/${myReview.id}`)}
                                                kind='secondary'
                                                size='mini'
                                            >
                                                查看您的评测
                                            </Button>
                                        </Block>
                                    </Block>
                                </Block>
                            </> :
                            <>
                                <LabelLarge paddingBottom='scale300'>为 《{app.name}》 撰写评测</LabelLarge>
                                <ParagraphSmall color='primary300' marginTop='scale300' marginBottom='scale600'>
                                    请注意保持礼貌并遵守 <RouterLink href='/rules' target='_blank' kind='underline'><b>规则手册</b></RouterLink>
                                </ParagraphSmall>
                                <Block display='flex' alignItems='center' paddingBottom='scale600'>
                                    <LabelMedium marginRight='scale600'>打分</LabelMedium>
                                    <Block marginTop='scale0' marginRight='scale600'>
                                        <StarRating value={draftReview?.score} onChange={({ value }) => setDraftReview(prev => { return { ...prev, score: value }; })} />
                                    </Block>
                                    <LabelSmall color='primary400'>{remark}</LabelSmall>
                                </Block>
                                <Block marginBottom='scale300'>
                                    <LabelXSmall color='primary400' marginBottom='scale300' marginRight='scale100' overrides={{ Block: { style: { textAlign: 'right' } } }}>{draftReview.content.length > 0 ? `${draftReview.content.length} / 8000` : ''}</LabelXSmall>
                                    <Textarea rows='5' maxLength='8000' value={draftReview.content} onChange={e => setDraftReview(prev => { return { ...prev, content: e.target.value }; })} />
                                </Block>
                                {/* 图片预览区域 */}
                                {draftReview?.files?.length > 0 && (
                                    <Block display='flex' alignItems='baseline' paddingLeft='scale100' paddingRight='scale100' paddingTop='scale300' paddingBottom='scale300'>
                                        {draftReview.files.map((file, index) => (
                                            <Block key={index} maxWidth='100px' marginRight='scale300'>
                                                <ImageBox src={file.src} isDeletable onClickDelete={() => setDraftReview(prev => {
                                                    return { ...prev, files: prev.files.filter((_, i) => i !== index) };
                                                })} />
                                            </Block>
                                        ))}
                                    </Block>
                                )}
                                {/* 底部操作条  */}
                                <Block display='flex' justifyContent='space-between'>
                                    <Block display='flex' alignItems='center' marginTop='0' marginBottom='0' marginRight='scale300'>
                                        <Block display='flex' alignItems='center' paddingLeft='scale100' paddingRight='scale100'
                                            onClick={() => draftReview.files.length < draftReviewFilesLimit ? draftReviewFileInput.current.click() : null}
                                            overrides={{
                                                Block: {
                                                    style: ({ $theme }) => ({
                                                        cursor: 'pointer',
                                                        color: $theme.colors.primary100,
                                                    })
                                                }
                                            }}
                                        >
                                            <input type='file' accept='image/*' hidden multiple ref={draftReviewFileInput} onChange={(e) => {
                                                const newFiles = [...e.target.files].map(file => {
                                                    file.src = URL.createObjectURL(file);
                                                    return file;
                                                });
                                                const seats = draftReviewFilesLimit - draftReview.files.length;
                                                setDraftReview(prev => {
                                                    return { ...prev, files: [...prev.files, ...newFiles].slice(0, seats) };
                                                });
                                            }} />
                                            <Icon $size='lg'><Photograph /></Icon>
                                            <LabelSmall color='inherit' marginLeft='scale0'>
                                                <LabelSmall overrides={{
                                                    Block: {
                                                        style: {
                                                            [MOBILE_BREAKPOINT]: { display: 'none' }
                                                        }
                                                    }
                                                }}>配图({draftReview.files.length}/{draftReviewFilesLimit})</LabelSmall>
                                            </LabelSmall>
                                        </Block>
                                    </Block>
                                    <Block display='flex' alignItems='center'>
                                        <Block marginTop='0' marginBottom='0' marginRight='scale300'>
                                            <Checkbox labelPlacement='right'
                                                checked={draftReview.allowComment}
                                                onChange={e => setDraftReview(prev => { return { ...prev, allowComment: e.target.checked } })}
                                                overrides={{
                                                    Root: {
                                                        style: ({ $theme }) => ({
                                                            paddingLeft: $theme.sizing.scale500,
                                                            paddingRight: $theme.sizing.scale500,
                                                            paddingTop: $theme.sizing.scale400,
                                                            paddingBottom: $theme.sizing.scale400,
                                                        })
                                                    },
                                                    Checkmark: {
                                                        style: ({ $theme }) => ({
                                                            width: $theme.sizing.scale600,
                                                            height: $theme.sizing.scale600,
                                                        })
                                                    },
                                                    Label: {
                                                        style: ({ $theme }) => ({
                                                            fontSize: $theme.sizing.scale550,
                                                            paddingLeft: $theme.sizing.scale100,
                                                            lineHeight: $theme.sizing.scale700,
                                                            color: $theme.colors.primary100,
                                                        })
                                                    }
                                                }}>
                                                允许回复
                                            </Checkbox>
                                        </Block>

                                        <Button kind='secondary' size='compact'
                                            onClick={() => handleSubmitReview()}
                                            isLoading={isSubmitting}
                                            disabled={draftReview?.content?.length < 1}
                                            overrides={{
                                                BaseButton: {
                                                    style: ({ $theme }) => ({
                                                        paddingLeft: $theme.sizing.scale700,
                                                        paddingRight: $theme.sizing.scale700,
                                                    })
                                                }
                                            }}>
                                            发布
                                        </Button>
                                    </Block>
                                </Block>
                            </>
                        }

                    </Block>)
                :
                <Block backgroundColor='backgroundSecondary' padding='scale600' marginTop='scale300' marginBottom='scale600' overrides={{
                    Block: {
                        style: {
                            borderRadius: theme.borders.radius300
                        }
                    }
                }}>
                    <LabelLarge paddingBottom='scale300'>我要写评测</LabelLarge>
                    <ParagraphMedium color='primary100' marginTop='scale200' marginBottom='scale200'>或表达你的观点，有理有据；或抒发你的情感，跌宕起伏；或留下你的谏言，鞭辟入里。</ParagraphMedium>
                    <Button kind='secondary' size='compact' onClick={() => { navigate(`/login?from=/apps/${app.id}?tab=2`) }} overrides={{
                        BaseButton: {
                            style: ({ $theme }) => ({
                                width: '7rem',
                                marginTop: $theme.sizing.scale600,
                                marginBottom: $theme.sizing.scale600,
                                [MOBILE_BREAKPOINT]: {
                                    width: '100%',
                                }
                            })
                        }
                    }}>
                        登录
                    </Button>
                    <ParagraphMedium color='primary100' marginTop='scale200' marginBottom='scale200'>这游戏的未来，将由你来书写。</ParagraphMedium>
                </Block>
            }
        </>
    );
}
export default TabReviewsUsersEditor;