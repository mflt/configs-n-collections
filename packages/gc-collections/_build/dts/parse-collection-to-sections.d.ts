import type { GcCollectionfromDoc_Config } from './types';
export declare function parseCollectiontoSections<CollectionLabels extends GcCollectionfromDoc_Config<string[]>['namespace']['validCollectionLabels']>(collectionLabels: Set<string>, // @TODO
config: GcCollectionfromDoc_Config<CollectionLabels>): Promise<number>;
