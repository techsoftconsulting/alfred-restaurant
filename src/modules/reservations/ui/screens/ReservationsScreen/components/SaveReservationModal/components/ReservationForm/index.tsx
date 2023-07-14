import { Form } from '@main-components/Form/Form';
import { Box } from '@main-components/Base/Box';
import { email, required } from '@shared/domain/form/validate';
import SaveButton from '@main-components/Form/components/SaveButton';
import AppIcon from '@main-components/Base/AppIcon';
import React, { useEffect, useState } from 'react';
import UuidUtils from '@utils/misc/uuid-utils';
import useNotify from '@shared/domain/hooks/use-notify';
import useFindRestaurantMalls from '@modules/user/application/malls/use-find-restaurant-malls';
import SelectInput from '@main-components/Form/inputs/SelectInput';
import useFindRestaurantAreas from '@modules/tables/application/use-find-restaurant-areas';
import useGetIdentity from '@modules/auth/application/use-get-identity';
import useCreateReservation from '@modules/reservations/application/use-create-reservation';
import useUpdateReservation from '@modules/reservations/application/use-update-reservation';
import Reservation from '@modules/reservations/domain/models/reservation';
import useFindClients from '@modules/clients/application/use-find-clients';
import DateInput from '@main-components/Form/inputs/DateInput';
import TimeInput from '@main-components/Form/inputs/TimeInput';
import TextInput from '@main-components/Form/inputs/TextInput';
import useRepository from '@shared/domain/hooks/use-repository';
import RestaurantMallRepository from '@modules/user/domain/repositories/restaurant-mall-repository';
import RestaurantAreaRepository from '@modules/tables/domain/repositories/restaurant-area-repository';
import DateTimeUtils from '@utils/misc/datetime-utils';
import useGetRestaurantById from '@modules/user/application/use-get-restaurant-by-id';
import Text from '@main-components/Typography/Text';
import PhoneTextInput from '@main-components/Form/inputs/PhoneTextInput';
import { useForm } from '@shared/domain/form/useForm';
import useGetClient from '@modules/clients/application/use-get-client';
import { ProgressBar } from '@main-components/Base/ProgressBar';
import CheckboxInput from '@main-components/Form/inputs/CheckboxInput';

interface ReservationFormProps {
    id?: string;
    defaultValues?: any;
    onSave: any;
    item?: Reservation;
}


export default function ReservationForm(props: ReservationFormProps) {
    return (
        <Form
            defaultValues={props.defaultValues}
            toolbar={
                <FormToolbar
                    item={props.item}
                    id={props.id}
                    onSave={props.onSave}
                />
            }
        >
            <Box mb={'l'}>
                <Text
                    bold
                    variant={'body1'}
                >Datos de la reserva</Text>
            </Box>

            <Box
                flexDirection={'row'}
            >
                <Box
                    flex={0.5}
                    mr={'l'}
                >
                    <DateInput
                        label={'Fecha'}
                        required
                        validate={required()}
                        source={'date'}
                    />


                </Box>

                <Box flex={0.5}>
                    <TimeInput
                        label={'Hora'}
                        required
                        validate={required()}
                        source={'hour'}
                    />
                </Box>
            </Box>

            <Box
                flexDirection={'row'}
                gap={'m'}
            >


                <Box flex={0.5}>
                    <TextInput
                        source={'numberOfPeople'}
                        required
                        validate={[required()]}
                        label={'Número de personas'}
                    />
                </Box>
                <Box
                    flex={0.5}
                >
                    <MyMallsSelectInput
                        source={'mallId'}
                        required
                        validate={[required()]}
                        label={'Plaza'}
                    />
                </Box>

                <Box flex={0.5}>
                    <SelectedTableInput
                        label={'Mesa'}
                        source={'tableId'}
                        required
                        validate={[required()]}
                    />
                </Box>
            </Box>

            <Box flexDirection={'row'}>
                <Box flex={0.5}>
                    <CheckboxInput
                        source={'clientEnabled'}
                        title={'Asociar cliente'}
                    />
                </Box>
            </Box>


            <ClientInputController />

            <ClientFieldsController />


        </Form>
    );
}

function ClientInputController() {
    const { setValue, watch } = useForm();
    const [selectedClientId, setSelectedClientId] = useState(null);
    const { data: client, loading, isRefetching } = useGetClient(selectedClientId ?? '', {
        enabled: !!selectedClientId
    });
    const isLoading = loading || isRefetching;
    const values = watch(['clientEnabled']);
    useEffect(() => {
        if (isLoading) return;
        if (!client) return;
        setValue('clientId', client.id);
        setValue('client', {
            id: client.id,
            firstName: client.firstName,
            lastName: client.lastName,
            allergies: client.allergies,
            phone: client.phone,
            email: client.email
        });
    }, [client?.id, isLoading]);


    return (
        <Box>
            <Box
                flexDirection={'row'}
                justifyContent={'flex-end'}
            >
                <Box
                    flex={0.5}
                >

                </Box>
                <Box
                    flex={0.5}
                >

                    {
                        !!values.clientEnabled && (
                            <ClientSelectInput
                                source={'clientId'}
                                required
                                onChange={(clientId) => {
                                    setSelectedClientId(clientId);
                                }}
                                placeholder={'Selecciona un cliente'}
                                helperText={'Rellena los datos de un cliente existente'}
                            />
                        )
                    }

                </Box>
            </Box>
            <Box
                opacity={isLoading ? 1 : 0}
                mb={'m'}
            >
                <ProgressBar
                    borderRadius={20}
                    progress={0}
                    indeterminate
                />
            </Box>

        </Box>

    );
}

function ClientFieldsController() {
    const { watch } = useForm();
    const values = watch(['clientEnabled']);
    if (!values.clientEnabled) return <Box />;

    return (
        <>
            <Box
                flexDirection={'row'}
            >
                <Box
                    flex={0.5}
                    mr={'l'}
                >
                    <TextInput
                        required
                        validate={required()}
                        label={'Nombre'}
                        source={'client.firstName'}
                    />


                </Box>

                <Box flex={0.5}>
                    <TextInput
                        required
                        validate={required()}
                        label={'Apellido'}
                        source={'client.lastName'}
                    />
                </Box>
            </Box>

            <TextInput
                label={'Alergias'}
                source={'client.allergies'}
            />
            <Box
                flexDirection={'row'}
                gap={'m'}
            >
                <Box flex={0.5}>
                    <TextInput
                        required
                        validate={[
                            required(),
                            email('Email inválido')
                        ]}
                        label={'Correo'}
                        source={'client.email'}
                    />
                </Box>

                <Box flex={0.5}>
                    <PhoneTextInput
                        required
                        validate={[
                            required()
                        ]}
                        label={'Número de contacto'}
                        source={'client.phone'}
                    />
                </Box>
            </Box>
        </>
    );
}


function FormToolbar(props) {
    const { save, loading } = useCreateReservation();
    const { save: update, loading: updating } = useUpdateReservation();
    const notify = useNotify();
    const { identity } = useGetIdentity();
    const { data: restaurant, loading: loadingRestaurant } = useGetRestaurantById(identity?.restaurantId ?? '', {
        enabled: !!identity?.restaurantId
    });
    const [saving, setSaving] = useState(false);
    const mallRepo = useRepository<RestaurantMallRepository>('RestaurantMallRepository');
    const areaRepo = useRepository<RestaurantAreaRepository>('RestaurantAreaRepository');


    return (
        <Box alignItems={'center'}>
            <SaveButton
                {...props}
                label='Guardar'
                titleColor={'white'}
                loading={loading || updating || saving}
                backgroundColor={'primaryMain'}
                uppercase={false}
                icon={() => {
                    return <AppIcon
                        name='save'
                        size={20}
                        color='white'
                    />;
                }}
                onSubmit={async (data) => {
                    setSaving(true);
                    if (!identity) return;
                    if (!restaurant) return;

                    const client = data.client;

                    // const client = await clientRepo.getClient(data.clientId);
                    const mall = await mallRepo.find(data.mallId);
                    const [areaId, tableId] = data.tableId?.split('*');

                    const area = (await areaRepo.findAreas()).find(el => el.id == areaId);
                    if (!area) return;

                    const table = area.findTable(tableId);
                    if (!table) return;
                    // if (!client) return;
                    if (!mall) return;


                    const clientEnabled = Boolean(data.clientEnabled);

                    if (!props.id) {

                        const item = Reservation.fromPrimitives({
                            id: UuidUtils.persistenceUuid(),
                            mall: {
                                id: mall.id,
                                name: mall.name
                            },
                            client: clientEnabled ? {
                                id: client.id ?? data.clientId ?? '',
                                firstName: client.firstName,
                                lastName: client.firstName,
                                allergies: client.allergies,
                                phone: client.phone,
                                email: client.email
                            } : undefined,
                            checkedIn: false,
                            table: {
                                id: table.id,
                                name: `Mesa ${table.number}`,
                                areaId: area.id
                            },
                            status: 'ACTIVE',
                            numberOfPeople: parseInt(data.numberOfPeople),
                            code: UuidUtils.code(8),
                            date: DateTimeUtils.format(data.date, 'YYYY-MM-DD'),
                            hour: data.hour,
                            restaurant: {
                                id: identity.restaurantId,
                                name: restaurant.name,
                                logoUrl: restaurant.logoUrl
                            }
                        });

                        await save(item);
                        props?.onSave?.();

                        notify('Reservación creada exitosamente', 'success');
                        return;
                    }

                    if (!props.item) return;

                    const item: Reservation = props.item;

                    item.updateInfo({
                        mall: {
                            id: mall.id,
                            name: mall.name
                        },
                        client: clientEnabled ? {
                            id: client.id ?? data.clientId ?? '',
                            firstName: client.firstName,
                            lastName: client.firstName,
                            allergies: client.allergies,
                            phone: client.phone,
                            email: client.email
                        } : undefined,
                        table: {
                            id: table.id,
                            name: `Mesa ${table.number}`,
                            areaId: area.id
                        },
                        status: 'ACTIVE',
                        numberOfPeople: parseInt(data.numberOfPeople),
                        date: DateTimeUtils.format(data.date, 'YYYY-MM-DD'),
                        hour: data.hour
                    });

                    if (!clientEnabled) {
                        item.removeClient();
                    }

                    await update(item.id, item);

                    props?.onSave?.();
                    setSaving(false);

                    notify('Reservación guardada exitosamente', 'success');
                }}
            />
        </Box>
    );
}


function MyMallsSelectInput(props: any) {
    const { data, loading } = useFindRestaurantMalls();

    return (
        <SelectInput
            {...props}
            choices={data?.map(e => {
                return {
                    id: e.id,
                    label: e.name,
                    name: e.name
                };
            })}
        />
    );
}

function ClientSelectInput(props: any) {
    const { data, ids, loading } = useFindClients();

    return (
        <SelectInput
            {...props}
            choices={ids?.map(el => {
                const client = data[el];
                return {
                    id: el,
                    name: `${client.email} - ${client.fullName}`
                };
            })}
        />
    );
}

function SelectedTableInput(props: any) {
    const { data: areas, ids, loading: loadingAreas } = useFindRestaurantAreas();

    const items = ids?.reduce((curr, el) => {
        const area = areas[el];
        const tables = area.tables;

        return [
            ...curr,
            ...tables.map(t => {
                return {
                    id: `${area.id}*${t.id}`,
                    name: `${area.name} - Mesa ${t.number}`
                };
            })
        ];
    }, []);

    return (
        <SelectInput
            {...props}
            choices={items}
        />
    );
}

