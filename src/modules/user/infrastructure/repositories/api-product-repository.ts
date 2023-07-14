import ProductRepository from '@modules/user/domain/repositories/product-repository';
import Product from '@modules/user/domain/models/product';
import ProductMapper from '@modules/user/infrastructure/mappers/product-mapper';
import { getLoggedInUserSession } from '@modules/auth/infrastructure/providers/app-auth-provider';
import APIRepository from '@shared/infrastructure/api/api-repository';

const COLLECTION_NAME = 'product';

export default class ApiProductRepository extends APIRepository implements ProductRepository {

    async findAll(filters?: any): Promise<Product[]> {
        const restaurantId = (await getLoggedInUserSession())?.restaurantId;
        if (!restaurantId) return Promise.resolve([]);

        const defaultFilters = [
            {
                field: 'status',
                operator: '==',
                value: 'ACTIVE'
            },
            {
                field: 'restaurantId',
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

        return ProductMapper.toDomainFromArray(docs);
    }

    remove(id: string): Promise<void> {
        return this.deleteById(COLLECTION_NAME, id, true);
    }

    async save(item: Product): Promise<void> {
        const dto = ProductMapper.toPersistence(item);
        return this.create(COLLECTION_NAME, dto, true);
    }

    async find(id: string): Promise<Product | null> {

        const doc: any = await this.get(`${COLLECTION_NAME}/${id}`, true);

        if (!doc) return null;

        return ProductMapper.toDomain(doc);
    }
}