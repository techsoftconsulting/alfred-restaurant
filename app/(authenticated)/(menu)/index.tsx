import { Box } from '@main-components/Base/Box';
import useNavigation from '@shared/domain/hooks/navigation/use-navigation';
import { useEffect } from 'react';
import { useGetUserMenu, useMenuRoute } from './_layout';

export default function InitialRoute() {
    const { navigate } = useNavigation();
    const { loaded, menu } = useGetUserMenu();
    const { get: getRoute } = useMenuRoute();

    useEffect(() => {
        if (!loaded) return;

        const firstItem = menu?.[0];

        if (!firstItem) return;

        const url = getRoute(firstItem);
        navigate(url);

    }, [loaded]);

    return (
            <Box> </Box>
    );
}