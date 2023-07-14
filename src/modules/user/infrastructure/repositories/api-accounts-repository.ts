import AccountUser from '@modules/user/domain/models/account-user';
import AccountsRepository from '@modules/user/domain/repositories/accounts-repository';
import { getLoggedInUserSession } from '@modules/auth/infrastructure/providers/app-auth-provider';
import AccountMapper from '../mappers/account-mapper';
import APIRepository from '@shared/infrastructure/api/api-repository';

const COLLECTION_NAME = 'accounts';

export default class ApiAccountsRepository extends APIRepository implements AccountsRepository {


    async findAll(): Promise<AccountUser[]> {
        const restaurantId = (await getLoggedInUserSession())?.restaurantId;
        if (!restaurantId) return Promise.resolve([]);


        const docs: any = await this.findByCriteriaRequest(COLLECTION_NAME, [
            {
                field: 'restaurantId',
                operator: '==',
                value: restaurantId
            },
            {
                field: 'status',
                operator: '==',
                value: 'ACTIVE'
            }
        ], undefined, undefined, true);


        return AccountMapper.toDomainFromArray(docs);
    }

    async remove(id: string): Promise<void> {
        return this.deleteById(COLLECTION_NAME, id, true);
    }

    async save(user: AccountUser): Promise<void> {
        const dto = AccountMapper.toPersistence(user);

        const foundUser = await this.findByEmail(user.email);
        const restaurantId = (await getLoggedInUserSession())?.restaurantId;
        if (!restaurantId) {
            throw new Error('NOT_LOGGED');
        }

        if (foundUser) {

            if (foundUser.id !== user.id) {
                throw new Error('USER_ALREADY_EXISTS');
            }

            if (user.hasCredentials) {
                return this.create(COLLECTION_NAME, {
                    ...dto, credentials: {
                        email: user.credentials?.email,
                        password: user.credentials?.password
                    }
                }, true);

            }

            return this.create(COLLECTION_NAME, { ...dto }, true);
        }

        if (!user.credentials) {
            throw new Error('INVALID_DATA');
        }

        try {
            return this.create(COLLECTION_NAME, {
                ...dto,
                credentials: user.credentials,
                restaurantId: restaurantId
            }, true);
        } catch (e) {
            throw  new Error(e);
        }

    }

    async find(id: string): Promise<AccountUser | null> {
        const doc: any = await this.get(`${COLLECTION_NAME}/${id}`, true);

        if (!doc) return null;

        return AccountMapper.toDomain(doc);
    }

    async findByEmail(email: string): Promise<AccountUser | null> {
        const docs: any = await this.findByCriteriaRequest(COLLECTION_NAME, [
            {
                field: 'status',
                operator: '==',
                value: 'ACTIVE'
            },
            {
                field: 'email',
                operator: '==',
                value: email
            }
        ], undefined, undefined, true);

        if (docs.length == 0) return null;

        return AccountMapper.toDomain(docs[0]);
    }

    private async updateUserCredentials(user: AccountUser) {

        throw new Error('Not implemented yet');
        /*  await fetchJson(getApiUrl('updateUser'), {
              method: 'POST',
              body: JSON.stringify({
                  id: user.id,
                  credentials: user.credentials
              })
          });*/
    }
}