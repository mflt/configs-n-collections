import type { GcCollectionfromDoc_Config, DefaultEnvLiterals } from './types';
export declare function retrieveCollectionfromDoc<CollectionLabels extends GcCollectionfromDoc_Config<string[]>['namespace']['validCollectionLabels'], Envs extends string = DefaultEnvLiterals>(collectionLabels: Set<string>, // @TODO
env: Envs, config: GcCollectionfromDoc_Config<CollectionLabels, Envs>): Promise<number>;
