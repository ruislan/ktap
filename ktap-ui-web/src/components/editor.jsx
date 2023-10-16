import React from 'react';

import { useStyletron } from 'baseui';
import { StatefulPopover } from 'baseui/popover';
import { Block } from 'baseui/block';
import { Input } from 'baseui/input';
import { Button } from 'baseui/button';
import { Check } from 'baseui/icon';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import Image from '@tiptap/extension-image'
import ListItem from '@tiptap/extension-list-item';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';

import { BlockQuote, Bold, BulletList, Heading1, Heading2, Heading3, Italic, OrderedList, Strike, TextColor, Underline as UnderlineIcon, Image as ImageIcon } from './icons';
import '../assets/css/editor.css';

function EditorButton({ disabled, onClick, isActive, children }) {
    const [css, theme] = useStyletron();
    return (
        <button onClick={onClick} disabled={disabled}
            className={css({
                borderRadius: theme.sizing.scale300, outline: 'none', appearance: 'none', boxShadow: 'none', cursor: 'pointer',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                border: 'unset', margin: 0,
                padding: theme.sizing.scale100, width: theme.sizing.scale900, height: theme.sizing.scale900,
                color: isActive ? theme.colors.contentPrimary : theme.colors.contentSecondary,
                backgroundColor: isActive ? theme.colors.backgroundTertiary : 'transparent',
                ':hover': {
                    backgroundColor: theme.colors.backgroundTertiary,
                },
            })}>
            {children}
        </button>
    );
}

function MenuBar({ editor }) {
    const [css, theme] = useStyletron();
    const [imageURL, setImageURL] = React.useState('');
    if (!editor) return null;
    return (
        <div className={css({
            display: 'flex', alignItems: 'center', gap: theme.sizing.scale100, flexWrap: 'wrap',
            paddingLeft: theme.sizing.scale100, paddingRight: theme.sizing.scale100,
            paddingTop: theme.sizing.scale200, paddingBottom: theme.sizing.scale200,
            borderBottom: '1px solid ' + theme.borders.border400.borderColor
        })}>
            <EditorButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
            >
                <Bold />
            </EditorButton>
            <EditorButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
            >
                <Italic />
            </EditorButton>
            <EditorButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
            >
                <Strike />
            </EditorButton>
            <EditorButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                disabled={!editor.can().chain().focus().toggleUnderline().run()}
                isActive={editor.isActive('underline')}
            >
                <UnderlineIcon />
            </EditorButton>
            <StatefulPopover
                content={({ close }) => (
                    <Block display='grid' gridTemplateColumns='1fr 1fr 1fr 1fr' gridGap='scale200' padding='scale300'>
                        {
                            ['', 'rgb(246,76,76)', 'rgb(255, 121, 77)', 'rgb(255, 184, 0)', 'rgb(61, 204, 73)', 'rgb(89, 145, 255)', 'rgb(204, 102, 255)', 'hsla(0,0%,100%,.6)'].map((color, index) =>
                                <div key={index} className={css({
                                    cursor: 'pointer', width: theme.sizing.scale850, height: theme.sizing.scale850,
                                    backgroundColor: color, borderRadius: theme.borders.radius200,
                                    border: '1px solid ' + theme.borders.border300.borderColor,
                                    position: 'relative'
                                })} onClick={() => {
                                    editor.chain().focus().setColor(color).run();
                                    close();
                                }}>
                                    {(!color || color === 'unset') && (
                                        <div className={css({
                                            width: '2px', backgroundColor: 'hsla(0,0%,100%,.7)', height: '100%',
                                            position: 'absolute', left: '50%', transform: 'rotate(45deg)',
                                        })}></div>
                                    )}
                                </div>
                            )
                        }
                    </Block>
                )}
                returnFocus
                autoFocus
            >
                <button
                    className={css({
                        borderRadius: theme.sizing.scale300, outline: 'none', appearance: 'none', boxShadow: 'none', cursor: 'pointer',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'unset', margin: 0,
                        padding: theme.sizing.scale100, width: theme.sizing.scale900, height: theme.sizing.scale900,
                        backgroundColor: 'transparent', color: theme.colors.contentSecondary,
                        ':hover': {
                            backgroundColor: theme.colors.backgroundTertiary,
                        },
                    })}>
                    <TextColor color={editor.getAttributes('textStyle').color} />
                </button>
            </StatefulPopover>
            <EditorButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
            >
                <Heading1 />
            </EditorButton>
            <EditorButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
            >
                <Heading2 />
            </EditorButton>
            <EditorButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
            >
                <Heading3 />
            </EditorButton>

            <EditorButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
            >
                <BulletList />
            </EditorButton>
            <EditorButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
            >
                <OrderedList />
            </EditorButton>
            <EditorButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
            >
                <BlockQuote />
            </EditorButton>
            <StatefulPopover
                content={({ close }) => (
                    <Block display='flex' gridGap='scale200' padding='scale300'>
                        <Input size='compact' onChange={e => setImageURL(e.target.value)} placeholder='http(s)://example.com/image.png' />
                        <Button size='compact' kind='primary' onClick={() => {
                            if (/https?:\/\//.test(imageURL)) editor.chain().focus().setImage({ src: imageURL }).run();
                            close();
                        }}>
                            <Check />
                        </Button>
                    </Block>
                )}
                returnFocus
                autoFocus
            >
                <button
                    className={css({
                        borderRadius: '8px', outline: 'none', appearance: 'none', boxShadow: 'none', cursor: 'pointer',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'unset', margin: 0,
                        padding: theme.sizing.scale100, width: theme.sizing.scale900, height: theme.sizing.scale900,
                        color: theme.colors.contentSecondary, backgroundColor: 'transparent',
                        ':hover': {
                            backgroundColor: theme.colors.backgroundTertiary,
                        },
                    })}>
                    <ImageIcon />
                </button>
            </StatefulPopover>
            {/* XXX 后面来处理引用 App 这需要扩展tiptap */}
            {/* <EditorButton onClick={() => {
                const appId = window.prompt('游戏ID');
                if (appId) {
                    // editor.chain().focus().set({ src: url }).run()
                }
            }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M9 3h-4a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2z" stroke-width="0" fill="currentColor"></path>
                    <path d="M9 13h-4a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2z" stroke-width="0" fill="currentColor"></path>
                    <path d="M19 13h-4a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2z" stroke-width="0" fill="currentColor"></path>
                    <path d="M17 3a1 1 0 0 1 .993 .883l.007 .117v2h2a1 1 0 0 1 .117 1.993l-.117 .007h-2v2a1 1 0 0 1 -1.993 .117l-.007 -.117v-2h-2a1 1 0 0 1 -.117 -1.993l.117 -.007h2v-2a1 1 0 0 1 1 -1z" strokeWidth="0" fill="currentColor"></path>
                </svg>
            </EditorButton> */}
        </div>
    )
}


function Editor({ initContent = '', onCreate = () => { }, onUpdate = () => { }, }) {
    const [css, theme] = useStyletron();
    const editor = useEditor({
        extensions: [
            Image, Underline,
            Color.configure({ types: [TextStyle.name, ListItem.name] }),
            TextStyle.configure({ types: [ListItem.name] }),
            StarterKit.configure({
                bulletList: { keepMarks: true, keepAttributes: false, },
                orderedList: { keepMarks: true, keepAttributes: false, },
                heading: { levels: [1, 2, 3,] },
            }),
        ],
        content: initContent,
        onCreate,
        onUpdate,
    });
    return (
        <div className={css({
            display: 'flex', flexDirection: 'column', padding: 0,
            border: '2px solid rgb(226, 226, 226)', borderRadius: theme.borders.radius300,
            color: theme.colors.contentPrimary, fontSize: theme.typography.ParagraphSmall.fontSize,
        })}>
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    )
}

export default Editor;