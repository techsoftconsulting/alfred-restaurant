import React, { useEffect } from 'react';
import { Slot, useRouter, useSearchParams, useSegments } from 'expo-router';
import useIsLoggedIn from '@modules/auth/application/use-is-logged-in';
import { useLoadAssets } from '@shared/domain/navigation/use-load-assets';
import useRestoreSession from '@modules/auth/application/use-restore-session';
import useStartFirebase from '@shared/infrastructure/firebase/use-start-firebase';
import { Box } from '@main-components/Base/Box';
import useGetIdentity from '@modules/auth/application/use-get-identity';
import Text from '@main-components/Typography/Text';
import { FOOTER_HEIGHT } from './(authenticated)/(menu)/_layout';
import AppProvider from '@shared/infrastructure/providers/app-provider';
import theme from '@shared/ui/theme/AppTheme';
import AppUtilsProvider from '@shared/infrastructure/providers/app-utils-provider';
import AppDataProvider from '@shared/infrastructure/providers/app-data-provider';
import AppServiceProvider from '@shared/infrastructure/providers/app-service-provider';
import AppAuthProvider from '@modules/auth/infrastructure/providers/app-auth-provider';
import Head from 'expo-router/head';
import NotificationController from '@main-components/Utilities/NotificationController';
import ConfirmController from '@main-components/Utilities/ConfirmModalController/ConfirmModalController';
import useNavigation from '@shared/domain/hooks/navigation/use-navigation';

export default function Layout() {

    return (
            <>
                <Head>
                    <link
                            href={`${__DEV__ ? '../public/' : ''}general.min.css`}
                            rel='stylesheet'
                    />
                    <link
                            href={`${__DEV__ ? '../public/' : ''}ReactCrop.css`}
                            rel='stylesheet'
                    />
                </Head>
                <AppProvider
                        theme={theme}
                        utilsProvider={AppUtilsProvider}
                        dataProvider={AppDataProvider}
                        serviceProvider={AppServiceProvider}
                        authProvider={new AppAuthProvider()}
                >
                    <>
                        <AuthController>
                            <Slot
                                    screenOptions={{
                                        title: ''
                                    }}
                            />
                        </AuthController>

                        <NotificationController />
                        <ConfirmController />
                    </>
                </AppProvider>
            </>
    );
}

function AuthController({ children }) {
    useStartFirebase();
    const { loading: checkingUserAuthenticated, isLoggedIn, userId } = useIsLoggedIn();
    const { identity: user, loading: loadingIdentity } = useGetIdentity();
    const { loaded: assetsLoaded } = useLoadAssets();
    const { loading: restoringSession } = useRestoreSession();
    const router = useRouter();
    const segments = useSegments();
    const isSessionReady =
            !checkingUserAuthenticated && !restoringSession;
    const isReady = assetsLoaded && isSessionReady;
    const inAuthGroup = segments?.some(s => s === '(unauthenticated)');

    const params = useSearchParams();

    const loggedRestaurantId = user?.restaurantId;

    const { reset } = useNavigation();


    useEffect(() => {

        if (!isReady) return;

        if (!isLoggedIn) {
            if (!params.id) {
                reset({
                    routes: [
                        {
                            name: '(unauthenticated)/login'
                        }
                    ]
                });
                return;
            }

            reset({
                routes: [
                    {
                        name: `(unauthenticated)/${params.id}/login`
                    }
                ]
            });
            return;
        }

        if (inAuthGroup) {
            router.push(`/`);
        }

    }, [isReady, isLoggedIn, inAuthGroup, loggedRestaurantId, params.id]);

    if (!isReady) return <Box></Box>;

    return (
            <>
                {children}
                {
                        isLoggedIn && (
                                <Footer />
                        )
                }
            </>
    );

}

function Footer() {
    return (
            <Box
                    bg={'primaryMain'}
                    height={FOOTER_HEIGHT}
                    borderTopLeftRadius={20}
                    borderTopRightRadius={20}
                    flexDirection={'row'}
                    alignItems={'center'}
                    paddingHorizontal={'l'}
                    justifyContent={'space-between'}
            >
                <Box>
                    <Text color={'white'}>Políticas de privacidad</Text>
                </Box>
                <Box>
                    <Text
                            bold
                            color={'white'}
                    >Powered By Alfred©</Text>
                </Box>
            </Box>
    );
}
