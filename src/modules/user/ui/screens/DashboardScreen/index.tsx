import AppLayout from '@main-components/Layout/AppLayout/AppLayout.web';
import ScrollView from '@main-components/Utilities/ScrollView';
import { Box } from '@main-components/Base/Box';
import useFindRestaurantAreas from '@modules/tables/application/use-find-restaurant-areas';
import RestaurantArea from '@modules/tables/domain/models/restaurant-area';
import { Button } from '@main-components/Base/Button';
import RestaurantTable from '@modules/tables/domain/models/restaurant-table';
import { useTheme } from '@shared/ui/theme/AppTheme';
import Text from '@main-components/Typography/Text';
import TouchableOpacity from '@main-components/Utilities/TouchableOpacity';
import { Icon, TableIcon } from '@main-components/Base/Icon';
import NoItems from '@main-components/Secondary/NoItems';
import { AddButton } from '@modules/user/ui/screens/DashboardScreen/components/AddButton';
import SaveAreaModal from '@modules/user/ui/screens/DashboardScreen/components/SaveAreaModal';
import * as React from 'react';
import { useState } from 'react';
import SaveTableModal from '@modules/user/ui/screens/DashboardScreen/components/SaveTableModal';
import AreaOptionMenu from '@modules/user/ui/screens/DashboardScreen/components/AreaOptionMenu';
import { IconButton } from '@main-components/Base/IconButton';
import { useDeleteRestaurantArea } from '@modules/tables/application/use-delete-restaurant-area';
import useConfirm from '@shared/domain/hooks/use-confirm';
import { Skeleton } from '@main-components/Base/Skeleton';
import ObjectUtils from '@utils/misc/object-utils';
import useUpdateRestaurantArea from '@modules/tables/application/use-update-restaurant-area';
import useNotify from '@shared/domain/hooks/use-notify';

export default function DashboardScreen() {
    const { data: areas, ids, loading: loadingAreas } = useFindRestaurantAreas();

    const [showAreaModal, setShowAreaModal] = useState(false);
    const [showTableModal, setShowTableModal] = useState(false);
    const [editingArea, setEditingArea] = useState<any>(undefined);
    const [editingTable, setEditingTable] = useState<any>(undefined);
    const [selectedItem, setSelectedItem] = useState(null);
    const [defaultValues, setDefaultValues] = useState<any>(null);
    const { save: update, loading: updating } = useUpdateRestaurantArea();
    const notify = useNotify();
    const confirm = useConfirm();

    const isLoading = loadingAreas || updating;
    const isEmpty = ids?.length == 0 && !loadingAreas;


    return (
            <AppLayout
                    noPadding
                    loading={isLoading}
                    title={'Mesas disponibles'}
            >

                {
                        isEmpty && (
                                <EmptyResults
                                        onAdd={() => {
                                            setShowAreaModal(true);
                                        }}
                                />
                        )
                }

                <Box
                        borderTopWidth={selectedItem ? 1 : 0}
                        borderBottomWidth={selectedItem ? 1 : 0}
                        borderColor={selectedItem ? 'greyMedium' : undefined}
                        bg={selectedItem ? 'greyLightest' : 'white'}
                        mb={'m'}
                        p={'s'}
                        flexDirection={'row'}
                        justifyContent={'flex-end'}
                        alignItems={'center'}
                        gap={'m'}
                        height={90}
                >
                    {
                            selectedItem && (
                                    <>
                                        <Box
                                                borderRightWidth={1}
                                                borderRightColor={'greyMedium'}
                                                p={'m'}
                                                mr={'m'}
                                        >
                                            <Button
                                                    icon={() => (
                                                            <Icon
                                                                    name={'trash'}
                                                                    numberSize={16}
                                                                    type={'feather'}
                                                                    color={'dangerMain'}
                                                            />
                                                    )}
                                                    titleColor={'dangerMain'}
                                                    backgroundColor={'dangerLightest'}
                                                    onPress={async () => {
                                                        if (!editingArea) return;
                                                        if (!selectedItem) return;

                                                        confirm({
                                                            title: 'Eliminar mesa',
                                                            content: '¿Estás seguro que deseas eliminar esta mesa?',
                                                            options: {
                                                                cancelText: 'No, cancelar',
                                                                confirmText: 'Sí, eliminar'
                                                            },
                                                            onCancel() {
                                                                setSelectedItem(null);
                                                                setEditingArea(null);
                                                            },
                                                            async onConfirm() {
                                                                const item = areas?.[editingArea];
                                                                if (!item) return;

                                                                item.deleteTable(selectedItem);
                                                                await update(item.id, item);

                                                                setSelectedItem(null);
                                                                setEditingArea(null);

                                                                notify('Mesa eliminada exitosamente', 'success');
                                                            }
                                                        });

                                                    }}
                                                    title={'Eliminar mesa'}
                                            />
                                        </Box>


                                        <Button
                                                icon={() => (
                                                        <Icon
                                                                name={'eye'}
                                                                numberSize={16}
                                                                type={'feather'}
                                                                color={'black'}
                                                        />
                                                )}
                                                titleColor={'black'}
                                                backgroundColor={'greyLight'}
                                                onPress={() => {
                                                    setShowTableModal(true);
                                                    setEditingTable({
                                                        id: selectedItem,
                                                        areaId: editingArea
                                                    });
                                                    setSelectedItem(null);
                                                }}
                                                title={'Ver detalles'}
                                        />


                                        <Button
                                                icon={() => (
                                                        <Icon
                                                                name={'duplicate-outline'}
                                                                numberSize={16}
                                                                type={'ionicon'}
                                                                color={'white'}
                                                        />
                                                )}
                                                onPress={() => {
                                                    if (!editingArea) return;
                                                    if (!selectedItem) return;

                                                    const area = areas?.[editingArea];
                                                    if (!area) return;
                                                    const table = area.findTable(selectedItem);
                                                    if (!table) return;

                                                    const defaultData = ObjectUtils.omit(table.toPrimitives(), ['id', 'number']);
                                                    setDefaultValues(defaultData);
                                                    setShowTableModal(true);
                                                    setEditingTable({
                                                        areaId: editingArea
                                                    });
                                                    setSelectedItem(null);

                                                }}
                                                title={'Duplicar mesa'}
                                        />
                                    </>
                            )
                    }
                    {
                            !isEmpty && !selectedItem && (
                                    <AddButton />
                            )
                    }
                </Box>
                <ScrollView>

                    {
                        <Box
                                flex={1}
                                paddingLeft={'m'}
                        >
                            {
                                loadingAreas ? (
                                        <LoadingItemsSkeleton />
                                ) : (
                                        <>
                                            {
                                                ids?.map((id) => {
                                                    return (
                                                            <AreaItem
                                                                    selectedItem={selectedItem}
                                                                    key={id}
                                                                    item={areas[id]}
                                                                    onEditPress={() => {
                                                                        setEditingArea(id);
                                                                        setShowAreaModal(true);
                                                                    }}
                                                                    onEditTablePress={(tableId) => {
                                                                        setDefaultValues(null);

                                                                        if (selectedItem == tableId) {
                                                                            setSelectedItem(null);
                                                                            setEditingArea(null);
                                                                        } else {
                                                                            setEditingArea(id);
                                                                            setSelectedItem(tableId);
                                                                        }
                                                                    }}
                                                                    onAddTablePress={() => {
                                                                        setEditingArea(id);
                                                                        setShowTableModal(true);
                                                                    }}
                                                            />
                                                    );
                                                })
                                            }
                                        </>
                                )
                            }


                        </Box>
                    }
                </ScrollView>

                <SaveAreaModal
                        modal={{
                            visible: showAreaModal,
                            onDismiss() {
                                setDefaultValues(null);
                                setEditingArea(null);
                                setEditingTable(null);
                                setShowAreaModal(false);
                            }
                        }}
                        form={{
                            id: editingArea
                        }}
                />

                <SaveTableModal
                        modal={{
                            visible: showTableModal,
                            onDismiss() {
                                setDefaultValues(null);
                                setEditingArea(null);
                                setEditingTable(null);
                                setShowTableModal(false);
                            }
                        }}
                        form={{
                            defaultValues: defaultValues,
                            areaId: editingTable?.areaId ?? editingArea,
                            id: editingTable?.id
                        }}
                />

            </AppLayout>
    );
}

const loadingItems = [...new Array(5)];

function LoadingItemsSkeleton() {
    return (
            <>
                {
                    loadingItems.map((e, key) => {
                        return (
                                <AreaItemLoading key={key} />
                        );
                    })
                }
            </>
    );
}

function AreaItemLoading() {
    const ITEM_SIZE = 200;

    return (
            <Box pr={'m'}>
                <Box marginVertical={'m'}>
                    <Skeleton
                            loading
                            height={50}
                            type={'rectangle'}
                    />
                </Box>
                <Box
                        gap={'m'}
                        style={{
                            gridTemplateColumns: `repeat(auto-fill, minmax(${ITEM_SIZE}px, ${ITEM_SIZE}px))`,
                            display: 'grid'
                        }}
                        marginVertical={'m'}
                >
                    {
                        loadingItems.map((e, key) => {
                            return (
                                    <Box key={key}>
                                        <Skeleton
                                                loading
                                                style={{
                                                    borderRadius: 10
                                                }}
                                                height={ITEM_SIZE}
                                                width={ITEM_SIZE}
                                                type={'rectangle'}
                                        />
                                    </Box>
                            );
                        })
                    }
                </Box>
            </Box>
    );
}

function EmptyResults({ onAdd }) {
    return (
            <Box
                    alignItems={'center'}
                    justifyContent={'center'}
                    flex={1}
            >
                <Box
                        alignItems={'center'}
                        justifyContent={'center'}
                >
                    <NoItems
                            icon={
                                <Icon
                                        name={'list'}
                                        type={'feather'}
                                        color={'greyMedium'}
                                        numberSize={80}
                                />
                            }
                            title={'Aquí estarán las secciones con sus mesas disponibles'}
                    />
                    <Button
                            icon={() => (
                                    <Icon
                                            name={'plus-circle-outline'}
                                            type={'material-community-icons'}
                                            numberSize={24}
                                            color={'white'}
                                    />
                            )}
                            onPress={onAdd}
                            title={'Agregar sección'}
                    />
                </Box>

            </Box>
    );
}

function AreaItem({
    item,
    selectedItem,
    onEditPress,
    onAddTablePress,
    onEditTablePress
}: { selectedItem: string; item: RestaurantArea, onEditPress: any; onAddTablePress: any; onEditTablePress: any }) {
    const theme = useTheme();

    const { delete: remove, loading: deleting } = useDeleteRestaurantArea();
    const confirm = useConfirm();

    return (
            <Box>
                <Box
                        borderBottomWidth={1}
                        pb={'m'}
                        mt={'m'}
                        borderColor={'greyLightest'}
                        mb={'m'}
                        flexDirection={'row'}
                        alignItems={'center'}
                        justifyContent={'space-between'}
                        paddingRight={'m'}
                >
                    <Text
                            variant={'heading3'}
                            bold
                    >{item.name}</Text>
                    <Box
                            flexDirection={'row'}
                            gap={'s'}
                    >
                        <Button
                                icon={() => (
                                        <Icon
                                                name={'edit'}
                                                type={'feather'}
                                                numberSize={24}
                                                color={'primaryMain'}
                                        />
                                )}
                                mode={'text'}
                                titleColor={'primaryMain'}
                                onPress={onEditPress}
                                title={'Actualizar'}
                        />

                        <Button
                                icon={() => (
                                        <Icon
                                                name={'plus-circle-outline'}
                                                type={'material-community-icons'}
                                                numberSize={24}
                                                color={'primaryMain'}
                                        />
                                )}
                                mode={'text'}
                                titleColor={'primaryMain'}
                                onPress={onAddTablePress}
                                title={'Agregar mesa'}
                        />

                        <AreaOptionMenu
                                renderTarget={({ onPress }) => {
                                    return (
                                            <IconButton
                                                    onPress={onPress}
                                                    iconType={'entypo'}
                                                    iconColor={'greyDark'}
                                                    iconName={'dots-three-vertical'}
                                            />
                                    );
                                }}
                                onItemPress={(id) => {
                                    confirm({
                                        title: 'Eliminar Sección',
                                        content: '¿Estas seguro que deseas eliminar esta Sección y todas las mesas?',
                                        options: {
                                            cancelText: 'No, cancelar',
                                            confirmText: 'Sí, eliminar'
                                        },
                                        async onConfirm() {
                                            await remove(item.id);
                                        }
                                    });
                                }}
                        />
                    </Box>
                </Box>
                <AreaTableList
                        selectedItem={selectedItem}
                        name={item.name}
                        tables={item.tables ?? []}
                        onEditTablePress={onEditTablePress}
                        onAddTablePress={onAddTablePress}
                />

            </Box>
    );
}

function AreaTableList({
    name,
    selectedItem,
    tables,
    onEditTablePress,
    onAddTablePress
}: { selectedItem?: string; name: string; tables: RestaurantTable[], onAddTablePress: any; onEditTablePress: any }) {
    const ITEM_SIZE = 200;
    const theme = useTheme();

    return (
            <>
                {
                        tables.length == 0 && (
                                <Box
                                        justifyContent={'center'}
                                        alignItems={'center'}
                                        flex={1}
                                >
                                    <NoItems
                                            icon={<Icon
                                                    name={'list'}
                                                    type={'feather'}
                                                    color={'greyMedium'}
                                                    numberSize={80}
                                            />}
                                            title={`Sin mesas disponibles en ${name}`}
                                    />
                                    <Button
                                            icon={() => {
                                                return (
                                                        <Icon
                                                                name={'plus-circle-outline'}
                                                                type={'material-community-icons'}
                                                                numberSize={24}
                                                        />
                                                );
                                            }}
                                            onPress={onAddTablePress}
                                            title={'Agregar mesa'}
                                    />
                                </Box>
                        )
                }

                <Box
                        gap={'m'}
                        style={{
                            gridTemplateColumns: `repeat(auto-fill, minmax(${ITEM_SIZE}px, ${ITEM_SIZE}px))`,
                            display: 'grid'
                        }}
                        marginVertical={'m'}
                >
                    {
                        tables.map(table => {
                            const isSelected = selectedItem == table.id;

                            return (
                                    <TouchableOpacity
                                            key={table.id}
                                            onPress={() => {
                                                onEditTablePress(table.id);
                                            }}
                                            style={{
                                                width: ITEM_SIZE,
                                                height: ITEM_SIZE,
                                                borderRadius: 10
                                            }}
                                    >
                                        <Box
                                                alignItems={'center'}
                                                justifyContent={'center'}
                                                style={{
                                                    borderWidth: isSelected ? 2 : 0,
                                                    borderColor: isSelected ? theme.colors.primaryMain : undefined,
                                                    width: ITEM_SIZE,
                                                    height: ITEM_SIZE,
                                                    borderRadius: 10,
                                                    backgroundImage: `linear-gradient(${theme.colors.contrastMain},${theme.colors.contrastLight}) `
                                                }}
                                        >
                                            <Box>
                                                <Box alignItems={'center'}>
                                                    <TableIcon size={80} />
                                                </Box>
                                                <Box mt={'m'}>
                                                    <Text
                                                            align={'center'}
                                                            bold
                                                            color={'white'}
                                                    >Mesa {table.number}</Text>
                                                </Box>
                                            </Box>

                                        </Box>
                                    </TouchableOpacity>
                            );
                        })
                    }
                </Box>
            </>
    );
}
