// Type definitions for feathers-rethinkdb 0.5
// Project: http://feathersjs.com/
// Definitions by: David Evans Farinha <https://github.com/davidfarinha>
// Definitions: https://github.com/feathersjs-ecosystem/feathers-rethinkdb
// TypeScript Version: 2.3

// TODO: Move 'FeathersCommonXXXX' types to new/separate @types/feathersjs__common library.

import { Service as FeathersService, PaginationOptions, Application, Params as FeathersFindParams } from '@feathersjs/feathers';
import * as rethinkdbdash from 'rethinkdbdash';
import { RTable, RObject, TableCreateResult, RStream, ChangeFeed, ChangeState, RBoolean, RTableSlice, r } from 'rethinkdb';

/**
 * Creates a feathers-rethinkdb application. This is a top-level function exported by this module.
 */
declare function feathersRethinkDb(options?: feathersRethinkDb.Options): feathersRethinkDb.Service<any>;

declare namespace feathersRethinkDb {
  /**
   * Options for creating a feathers-rethinkdb application.
   * @see {@link https://github.com/feathersjs-ecosystem/feathers-rethinkdb#serviceoptions}
   */
  interface Options {
    /**
     * The rethinkdbdash instance, already initialized with a configuration object.
     * @see {@link https://github.com/neumino/rethinkdbdash#importing-the-driver} 
     */
    Model: rethinkdbdash.ReqlClient;
    /**
     * The name of the table.
     */
    name: string;
    /**
     * Should listen to table changefeeds and send according real-time events on the adapter.
     * @see {@link https://docs.feathersjs.com/api/events.html}
     */
    watch?: boolean;
    /**
     * Specify an alternate rethink database for the service to use. Must be on the same server/connection used by rethinkdbdash.
     * It will be auto created if you call init() on the service and it does not yet exist.
     */
    db?: any;
    /**
     * The name of the id field property. Needs to be set as the primary key when creating the table.
     */
    id?: string;
    /**
     * A list of custom service events sent by this service
     */
    events?: any[];
    /**
     * A pagination object containing a default and max page size
     */
    paginate?: PaginationOptions;
  }   
  /**
   * Feathers common filter type 
   * @see {@link https://github.com/feathersjs-ecosystem/feathers-rethinkdb#querying}
   * @see {@link https://github.com/feathersjs/commons/blob/a5987962283b35663b2cd3eafb502fcd9b6fbaf9/lib/filter-query.js#L46}
   */
  type FeathersCommonFilter = Partial<{
    /**
     * Sorts based on the object you provide. It can contain a list of properties by which to sort mapped to the order (1 ascending, -1 descending).
     */
    $sort: {} | any[] | string,
    /**
     * Returns only the number of results you specify.
     * With pagination enabled, to just get the number of available records set $limit to 0. This will only run a (fast) counting query against
     * the database and return a page object with the total and an empty data array.
     */
    $limit: number,
    /**
     * Skips the specified number of results
     */
    $skip: number,
    /**
     * Allows to pick which fields to include in the result. This will work for any service method.
     */
    $select: string[]
  }>
  /**
   * Query object representing the common filter criteria mixed with a custom query 
   * @see {@link https://github.com/feathersjs-ecosystem/feathers-rethinkdb#querying}
   */
  type Query = FeathersCommonQuery & Partial<{
    /**
     * Matches if the property is an array that contains the given entry.
     */
    $contains: FilterExpressionValueType,
    /**
     * Return all matches for a property using the RethinkDB match syntax.
     * @see {@link https://www.rethinkdb.com/api/javascript/match/}
     */
    $search: FilterExpressionValueType,
  }> & Partial<{
    [index:string]: FilterExpressionValueType | any
  }>
  /**
   * Query object representing the common filter criteria mixed with a custom query
   * @see {@link https://docs.feathersjs.com/api/databases/querying.html}
   */
  type FeathersCommonQuery = Partial<{
    /**
     * Find all records where the property matches any of the given values.
     */
    $in: any[],
    /**
     * Find all records where the property doesn't match any of the given values.
     */
    $nin: any[],
    /**
     * Find all records where the value is less to a given value.
     */
    $lt: FilterExpressionValueType,
    /**
     * Find all records where the value is less and equal to a given value.
     */
    $lte: FilterExpressionValueType,
    /**
     * Find all records where the value is more than a given value.
     */
    $gt: FilterExpressionValueType,
    /**
     * Find all records where the value is more and equal to a given value.
     */
    $gte: FilterExpressionValueType,
    /**
     * Find all records that do not equal the given property value.
     */
    $ne: FilterExpressionValueType,
    /**
     * Find all records that match any of the given criteria.
     */
    $or: FilterExpressionValueType,
    /**
     * Find all records that match all the given criteria.
     */
    $and: FilterExpressionValueType
  }> ;
  interface Service<T = {}> extends FeathersService<T> {
    type: 'rethinkdb';
    /**
     * The name of the id field property. Needs to be set as the primary key when creating the table. Set from options object passed in (see Options).
     * @default "id"
     */
    id: string;
    /**
     * The RethinkDB Table object matching name field in options object passed in (see Options).
     */
    table: RTable<T>;
    /**
     * Options object passed in (see Options).
     * @see {@link https://docs.feathersjs.com/api/events.html}
     */
    options: Options;
    /**
     * A list of custom service events sent by this service.
     */
    events: any[];
    /**
     * Pagination object containing a default and max page size. Set from options object passed in (see Options).
     */
    paginate: PaginationOptions;
    /**
     * Should listen to table changefeeds and send according real-time events on the adapter. Set from options object passed in (see Options).
     * @default true
     * @see {@link https://docs.feathersjs.com/api/events.html}
     */
    watch: boolean;
    /**
     * Extends a feathersjs base service with the feathers-rethinkdb service.
     * @param obj A base feathersjs service
     */
    extend(obj: FeathersService<T>): Service<T>;
    /**
     * Builds and returns a RethinkDB predicate with the custom query.
     */
    createFilter(query: Query): (doc: {}) => r.FilterPredicate<T>;
    /**
     * Returns a RethinkDB query with the common filter criteria (without pagination) applied.
     * @see {@link https://github.com/feathersjs-ecosystem/feathers-rethinkdb#adaptercreatequeryquery}
     * @see {@link https://docs.feathersjs.com/api/databases/querying.html}
     */
    createQuery(originalQuery: FeathersCommonFilter | Query): RTableSlice<T>;
    /**
     * Subscribes and hooks up rethinkdb changefeeds to fire feathersjs hooks.
     * @see {@link https://github.com/feathersjs-ecosystem/feathers-rethinkdb#changefeeds}
     */
    watchChangefeeds(app: rethinkdbdash.ReqlClient): RStream<ChangeFeed<T> | ChangeState>;
    /**
     * Sets up this module to call watchChangefeeds() after rethinkdb has initialized.
     */
    setup(app: Application): void;
  }
  interface FindParams extends FeathersFindParams {
    query?: feathersRethinkDb.Query;
  }
}

/**
 * Supported feathers-rethink filter field value types.
 */
type FilterExpressionValueType = number | string | Date;

/**
 * @feathersjs/feathers augmentations
 */
declare module '@feathersjs/feathers' {
  interface Application<ServiceTypes = any> {
    use(path: string, service: Partial<feathersRethinkDb.Service> | Application<ServiceTypes>, options?: any): this;
    service<L extends keyof ServiceTypes>(location: L): feathersRethinkDb.Service<ServiceTypes[L]>;
    service(location: string): feathersRethinkDb.Service<any>;
  }
  interface ServiceAddons<T> {
    init(opts?: feathersRethinkDb.Options): Promise<RObject<TableCreateResult>>;
  }
  // todo: figure out what to do: These methods don't actually need to be implemented, so they can be undefined at runtime. Yet making them optional gets cumbersome in strict mode.
  interface ServiceMethods<T> {
    find(params?: feathersRethinkDb.FindParams): Promise<T[] | Paginated<T>>;
  }
}

export = feathersRethinkDb;
