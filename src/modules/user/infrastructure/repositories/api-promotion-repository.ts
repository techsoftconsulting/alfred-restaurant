import PromotionRepository from '@modules/user/domain/repositories/promotion-repository';
import Promotion from '@modules/user/domain/models/promotion';
import PromotionMapper from '@modules/user/infrastructure/mappers/promotion-mapper';
import { getLoggedInUserSession } from '@modules/auth/infrastructure/providers/app-auth-provider';
import APIRepository from '@shared/infrastructure/api/api-repository';

const COLLECTION_NAME = 'promotion';

export default class ApiPromotionRepository extends APIRepository implements PromotionRepository {

    async findAll(filters?: any): Promise<Promotion[]> {
        const restaurantId = (await getLoggedInUserSession())?.restaurantId;
        if (!restaurantId) return Promise.resolve([]);

        const defaultFilters = [
            {
                field: 'status',
                operator: '==',
                value: 'ACTIVE'
            },
            {
                field: 'storeId',
                operator: '==',
                value: restaurantId
            }
        ];

        if (filters?.mallId) {
            defaultFilters.push({
                field: 'mallsIds',
                operator: 'array-contains',
                value: filters.mallId
            });
        }

        if (filters?.availability) {
            if (filters.availability !== 'ALL') {
                defaultFilters.push({
                    field: 'available',
                    operator: '==',
                    value: filters.availability == 'AVAILABLE'
                });
            }
        }

        const docs: any = await this.findByCriteriaRequest(COLLECTION_NAME, defaultFilters, undefined, undefined, true);

        return PromotionMapper.toDomainFromArray(docs);
    }

    remove(id: string): Promise<void> {
        return this.deleteById(COLLECTION_NAME, id, true);
    }

    async save(item: Promotion): Promise<void> {
        const dto = PromotionMapper.toPersistence(item);

        return this.create(COLLECTION_NAME, dto, true);
    }

    async find(id: string): Promise<Promotion | null> {
        const doc: any = await this.get(`${COLLECTION_NAME}/${id}`, true);

        if (!doc) return null;
        return PromotionMapper.toDomain(doc);
    }
}