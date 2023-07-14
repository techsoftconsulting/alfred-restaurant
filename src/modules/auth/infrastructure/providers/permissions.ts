import useGetIdentity from '@modules/auth/application/use-get-identity';


export const permissionsConstantsDescriptions = [
    {
        id: 'ADMIN', name: 'Administrador',
        menu: ['TABLES', 'RESERVATIONS', 'SETTINGS', 'CLIENTS', 'USERS', 'MENU', 'PROMOTIONS']
    },
    {
        id: 'ADM.RESERV',
        name: 'Adm.Reservaciones',
        menu: ['RESERVATIONS', 'ACCOUNT']
    },
    {
        id: 'ADM.PROMO',
        name: 'Adm.Promociones',
        menu: ['PROMOTIONS', 'ACCOUNT']
    },
    {
        id: 'HOST',
        name: 'Host',
        menu: ['RESERVATIONS', 'ACCOUNT']
    }
];


export const useCheckPermission = () => {
    const { identity, loading: loadingIdentity } = useGetIdentity();

    return {
        ready: !loadingIdentity,
        check: (constant: string) => {
            const userRole = identity?.type;
            if (!userRole) return false;

            const menu = permissionsConstantsDescriptions.find(r => r.id == userRole)?.menu;

            if (!menu) return false;

            return menu.includes(constant);
        }
    };
};

