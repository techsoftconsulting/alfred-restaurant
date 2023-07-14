import RestaurantAreaRepository from '@modules/tables/domain/repositories/restaurant-area-repository';
import PaginationOptions from '@shared/domain/models/pagination-options';
import RestaurantArea from '@modules/tables/domain/models/restaurant-area';
import SortOptions from '@shared/domain/models/sort-options';
import AreaMapper from '@modules/tables/infrastructure/mappers/area-mapper';
import { getLoggedInUserSession } from '@modules/auth/infrastructure/providers/app-auth-provider';
import APIRepository from '@shared/infrastructure/api/api-repository';

const COLLECTION_NAME = 'area';

export default class ApiRestaurantAreaRepository extends APIRepository implements RestaurantAreaRepository {

    async findAreas(filter?: any, pagination?: PaginationOptions, sort?: SortOptions): Promise<RestaurantArea[]> {
        const restaurantId = (await getLoggedInUserSession())?.restaurantId;
        if (!restaurantId) return Promise.resolve([]);

        const docs: any = await this.findByCriteriaRequest(COLLECTION_NAME, [{
            field: 'restaurantId',
            operator: '==',
            value: restaurantId
        }], pagination, undefined, true);

        if (docs.length == 0) {
            return [];
        }

        return AreaMapper.toDomainFromArray(docs);
    }

    async updateArea(item: RestaurantArea): Promise<any> {
        const data = AreaMapper.toPersistence(item);
        await this.updateById(COLLECTION_NAME, item.id, data, true);
    }

    async deleteArea(id: string): Promise<any> {
        await this.deleteById(COLLECTION_NAME, id, true);
    }

    async createArea(item: RestaurantArea): Promise<any> {
        const data = AreaMapper.toPersistence(item);
        await this.create(COLLECTION_NAME, data, true);
    }
}