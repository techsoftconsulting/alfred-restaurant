import AppDrawer from '@main-components/Base/AppDrawer';
import AppDrawerContent from '@main-components/Base/AppDrawer/components/AppDrawerContent';
import { useTheme } from '@shared/ui/theme/AppTheme';
import { Icon, MenuIcon, TableIcon } from '@main-components/Base/Icon';
import useGetIdentity from '@modules/auth/application/use-get-identity';
import useGetRestaurantById from '@modules/user/application/use-get-restaurant-by-id';
import * as React from 'react';
import { permissionsConstantsDescriptions } from '@modules/auth/infrastructure/providers/permissions';

export const DRAWER_WIDTH = 320;
export const FOOTER_HEIGHT = 65;


const MENU_MAP = {
    'TABLES': {
        route: 'tables',
        component: (
                <AppDrawer.Screen
                        name={'tables'}
                        options={{
                            drawerIcon: (props: any) => (
                                    <TableIcon size={30} />
                            ),
                            title: 'Mesas disponibles',
                            headerTitle: '',
                            headerShown: false
                        }}
                />
        )
    },
    'RESERVATIONS': {
        route: 'reservations',
        component: (
                <AppDrawer.Screen
                        name={'reservations'}
                        options={{
                            drawerIcon: (props: any) => (
                                    <Icon
                                            name={'calendar'}
                                            type={'font-awesome'}
                                            color={props.color ?? 'white'}
                                            numberSize={20}
                                    />
                            ),
                            title: 'Reservas realizadas',
                            headerTitle: '',
                            headerShown: false
                        }}
                />
        )
    },
    'SETTINGS': {
        route: 'settings',
        component: (
                <AppDrawer.Screen
                        name={'settings'}
                        options={{
                            drawerIcon: (props: any) => (
                                    <Icon
                                            name={'cog'}
                                            type={'font-awesome'}
                                            color={props.color ?? 'white'}
                                            numberSize={20}
                                    />
                            ),
                            title: 'Ajustes',
                            headerTitle: '',
                            headerShown: false
                        }}
                />
        )
    },
    'CLIENTS': {
        route: 'clients',
        component: (
                <AppDrawer.Screen
                        name={'clients'}
                        options={{
                            drawerIcon: (props: any) => (
                                    <Icon
                                            name={'user'}
                                            type={'feather'}
                                            color={props.color ?? 'white'}
                                            numberSize={20}
                                    />
                            ),
                            title: 'Clientes',
                            headerTitle: '',
                            headerShown: false
                        }}
                />
        )
    },
    'USERS': {
        route: 'users',
        component: (
                <AppDrawer.Screen
                        name={'users'}
                        options={{
                            drawerIcon: (props: any) => (
                                    <Icon
                                            name={'users'}
                                            type={'font-awesome-5'}
                                            color={props.color ?? 'white'}
                                            numberSize={20}
                                    />
                            ),
                            title: 'Usuarios',
                            headerTitle: '',
                            headerShown: false
                        }}
                />
        )
    },
    'MENU': {
        route: 'menu',
        component: (
                <AppDrawer.Screen
                        name={'menu'}
                        options={{
                            drawerIcon: (props: any) => (
                                    <MenuIcon size={30} />
                            ),
                            title: 'Menú',
                            headerTitle: '',
                            headerShown: false
                        }}
                />
        )
    },
    'PROMOTIONS': {
        route: 'promotions',
        component: (
                <AppDrawer.Screen
                        name={'promotions'}
                        options={{
                            drawerIcon: (props: any) => (
                                    <Icon
                                            name={'ios-megaphone-outline'}
                                            type={'ionicon'}
                                            color={props.color ?? 'white'}
                                            numberSize={20}
                                    />
                            ),
                            title: 'Promociones',
                            headerTitle: '',
                            headerShown: false
                        }}
                />
        )
    },
    'ACCOUNT': {
        route: 'account',
        component: (
                <AppDrawer.Screen
                        name={'account'}
                        options={{
                            drawerIcon: (props: any) => (
                                    <Icon
                                            name={'user-cog'}
                                            type={'font-awesome-5'}
                                            color={props.color ?? 'white'}
                                            numberSize={20}
                                    />
                            ),
                            title: 'Cuenta',
                            headerTitle: '',
                            headerShown: false
                        }}
                />
        )
    }
};

export function useGetUserMenu() {
    const { identity, loading } = useGetIdentity();

    if (loading) {
        return {
            loaded: false,
            menu: []
        };
    }

    const role = permissionsConstantsDescriptions.find(role => role.id == identity?.type);

    return {
        loaded: !loading,
        menu: role ? role.menu : []
    };
}

export function useMenuRoute() {
    return {
        get(key: string) {
            return MENU_MAP[key]?.route as string;
        }
    };
}


export default function Layout() {
    const theme = useTheme();

    const { identity } = useGetIdentity();
    const { data: restaurant } = useGetRestaurantById(identity?.restaurantId, { enabled: !!identity });

    const { loaded, menu } = useGetUserMenu();

    const mappedMenu = Object.keys(MENU_MAP ?? {}).filter(menuKey => menu.includes(menuKey)).map(menu => {
        return MENU_MAP[menu].component;
    });

    return (
            <AppDrawer
                    drawerContent={(props) => {
                        return (
                                <AppDrawerContent
                                        {...props}
                                        name={restaurant?.name}
                                        logoUrl={restaurant?.logoUrl}
                                />
                        );
                    }}
                    screenOptions={{
                        headerShown: false,
                        drawerStyle: {
                            maxWidth: DRAWER_WIDTH,
                            position: 'fixed',
                            left: 0,
                            backgroundColor: theme.colors.primaryMain
                        },
                        sceneContainerStyle: {
                            left: DRAWER_WIDTH,
                            width: `calc(100% - ${DRAWER_WIDTH}px)`
                        },
                        drawerType: 'permanent'
                    }}
            >
                <AppDrawer.Screen
                        name={'index'}
                        options={{
                            headerTitle: '',
                            headerShown: false
                        }}
                />
                {mappedMenu}
            </AppDrawer>
    );
}

