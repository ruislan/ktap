import React from 'react';
import { useStyletron } from 'baseui';
import { useEditor, EditorContent } from '@tiptap/react';
import { StatefulPopover } from 'baseui/popover';
import { Block } from 'baseui/block';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import Image from '@tiptap/extension-image'
import ListItem from '@tiptap/extension-list-item';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import '../assets/css/editor.css';

// function SplitLine() {
//     const [css, theme] = useStyletron();
//     return (
//         <div className={css({
//             width: '1px', height: '16px', backgroundColor: theme.colors.backgroundTertiary,
//             marginLeft: theme.sizing.scale0, marginRight: theme.sizing.scale0,
//         })} />
//     );
// }

function EditorButton({ ref, disabled, onClick, isActive, children }) {
    const [css, theme] = useStyletron();
    return (
        <button ref={ref}
            onClick={onClick}
            disabled={disabled}
            className={css({
                borderRadius: '8px', outline: 'none', appearance: 'none', boxShadow: 'none', cursor: 'pointer',
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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M7 5h6a3.5 3.5 0 0 1 0 7h-6z"></path>
                    <path d="M13 12h1a3.5 3.5 0 0 1 0 7h-7v-7"></path>
                </svg>
            </EditorButton>
            <EditorButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M11 5l6 0"></path>
                    <path d="M7 19l6 0"></path>
                    <path d="M14 5l-4 14"></path>
                </svg>
            </EditorButton>
            <EditorButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M5 12l14 0"></path>
                    <path d="M16 6.5a4 2 0 0 0 -4 -1.5h-1a3.5 3.5 0 0 0 0 7h2a3.5 3.5 0 0 1 0 7h-1.5a4 2 0 0 1 -4 -1.5"></path>
                </svg>
            </EditorButton>
            <EditorButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                disabled={!editor.can().chain().focus().toggleUnderline().run()}
                isActive={editor.isActive('underline')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M7 5v5a5 5 0 0 0 10 0v-5"></path>
                    <path d="M5 19h14"></path>
                </svg>
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
                        borderRadius: '50%', outline: 'none', appearance: 'none', boxShadow: 'none', cursor: 'pointer',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'unset', margin: 0,
                        padding: theme.sizing.scale100, width: theme.sizing.scale900, height: theme.sizing.scale900,
                        backgroundColor: 'transparent', color: theme.colors.contentSecondary,
                        ':hover': {
                            backgroundColor: theme.colors.backgroundTertiary,
                        },
                    })}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke='currentColor' fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M9 15v-7a3 3 0 0 1 6 0v7"></path>
                        <path d="M9 11h6"></path>
                        <path d="M5 19h14" stroke={editor.getAttributes('textStyle').color}></path>
                    </svg>
                </button>
            </StatefulPopover>
            <EditorButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M19 18v-8l-2 2"></path>
                    <path d="M4 6v12"></path>
                    <path d="M12 6v12"></path>
                    <path d="M11 18h2"></path>
                    <path d="M3 18h2"></path>
                    <path d="M4 12h8"></path>
                    <path d="M3 6h2"></path>
                    <path d="M11 6h2"></path>
                </svg>
            </EditorButton>
            <EditorButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M17 12a2 2 0 1 1 4 0c0 .591 -.417 1.318 -.816 1.858l-3.184 4.143l4 0"></path>
                    <path d="M4 6v12"></path>
                    <path d="M12 6v12"></path>
                    <path d="M11 18h2"></path>
                    <path d="M3 18h2"></path>
                    <path d="M4 12h8"></path>
                    <path d="M3 6h2"></path>
                    <path d="M11 6h2"></path>
                </svg>
            </EditorButton>
            <EditorButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M19 14a2 2 0 1 0 -2 -2"></path>
                    <path d="M17 16a2 2 0 1 0 2 -2"></path>
                    <path d="M4 6v12"></path>
                    <path d="M12 6v12"></path>
                    <path d="M11 18h2"></path>
                    <path d="M3 18h2"></path>
                    <path d="M4 12h8"></path>
                    <path d="M3 6h2"></path>
                    <path d="M11 6h2"></path>
                </svg>
            </EditorButton>

            <EditorButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M9 6l11 0"></path>
                    <path d="M9 12l11 0"></path>
                    <path d="M9 18l11 0"></path>
                    <path d="M5 6l0 .01"></path>
                    <path d="M5 12l0 .01"></path>
                    <path d="M5 18l0 .01"></path>
                </svg>
            </EditorButton>
            <EditorButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M11 6h9"></path>
                    <path d="M11 12h9"></path>
                    <path d="M12 18h8"></path>
                    <path d="M4 16a2 2 0 1 1 4 0c0 .591 -.5 1 -1 1.5l-3 2.5h4"></path>
                    <path d="M6 10v-6l-2 2"></path>
                </svg>
            </EditorButton>
            <EditorButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M6 15h15"></path>
                    <path d="M21 19h-15"></path>
                    <path d="M15 11h6"></path>
                    <path d="M21 7h-6"></path>
                    <path d="M9 9h1a1 1 0 1 1 -1 1v-2.5a2 2 0 0 1 2 -2"></path>
                    <path d="M3 9h1a1 1 0 1 1 -1 1v-2.5a2 2 0 0 1 2 -2"></path>
                </svg>
            </EditorButton>
            <EditorButton
                onClick={() => {
                    const url = window.prompt('图片链接URL');

                    if (url) {
                        editor.chain().focus().setImage({ src: url }).run();
                    }
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M15 8h.01"></path>
                    <path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z"></path>
                    <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5"></path>
                    <path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3"></path>
                </svg>
            </EditorButton>
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


function Editor({ onCreate = () => { }, onUpdate = () => { }, }) {
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