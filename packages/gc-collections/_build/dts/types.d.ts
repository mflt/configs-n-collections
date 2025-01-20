type Path = string;
export type DefaultEnvLiterals = 'prod' | 'test';
export type GcCollectionfromDoc_Config<CollectionLabels extends string[] = ['default'], // map-able
Envs extends string = DefaultEnvLiterals> = {
    "repo": {
        "googleApis": {
            "tokenJsonPath": Path;
            "clientConfigurationJsonPath": Path;
        };
        "prepared": {
            "folderPath": Path;
            "sectionsOutputPath": Path;
            "cachedRawMdDocPrefix": string;
        };
    };
    "namespace": {
        validCollectionLabels: CollectionLabels;
    };
    "googleDrive": {
        "parsing": {
            "sectionLabelerMatchPattern": [string, string];
        };
        "sources": {
            [Env: string]: {
                [CollectionLabel in CollectionLabels[number]]: string;
            };
        };
    };
    "googleScript": {
        "scriptId": string;
        "functionName": string;
    };
};
export {};
