import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Outlet } from 'react-router-dom';

import { Block } from 'baseui/block';
// import { MOBILE_BREAKPOINT } from '../constants';
import Header from './header';
import Footer from './footer';
import NotWork from './not-work';

export default function Layout() {
    return (
        <Block display='flex' flexDirection='column' color='contentPrimary' backgroundColor='backgroundPrimary'
            maxWidth='100vw' minHeight='100vh'
            overrides={{
                Block: {
                    style: {
                        contain: 'paint',
                        overflowWrap: 'break-word',
                    }
                }
            }}>
            <Header />
            <Block display='flex' justifyContent='center' flex='1' margin='0' padding='0' maxWidth='100%'>
                <ErrorBoundary fallback={<NotWork />}>
                    <Outlet />
                </ErrorBoundary>
            </Block>
            <Footer />
        </Block>
    );
}