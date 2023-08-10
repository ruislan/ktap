import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Outlet, useLocation } from 'react-router-dom';

import { Block } from 'baseui/block';
import Header from './header';
import Footer from './footer';
import NotWork from './not-work';

export default function RootLayout() {
    const location = useLocation(); // Whenever the location changes, the error boundary state is reset.
    return (
        <Block display='flex' flexDirection='column' color='contentPrimary' backgroundColor='backgroundPrimary'
            maxWidth='100vw' minHeight='100vh'
            overrides={{
                Block: {
                    style: {
                        contain: 'paint',
                        overflowWrap: 'anywhere',
                    }
                }
            }}>
            <Header />
            <Block display='flex' justifyContent='center' flex='1' margin='0' padding='0' maxWidth='100%'>
                <ErrorBoundary key={location.pathname} fallback={<NotWork />}>
                    <Outlet />
                </ErrorBoundary>
            </Block>
            <Footer />
        </Block>
    );
}