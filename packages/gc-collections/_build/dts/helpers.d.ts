import type { GcCollectionfromDoc_Config } from './types';
export declare function setPathsStrings(config: GcCollectionfromDoc_Config): {
    repo: {
        googleApis: {
            tokenJsonPath: string;
            clientConfigurationJsonPath: string;
        };
        prepared: {
            folderPath: string;
            sectionsOutputPath: string;
        };
    };
    namespace: {
        validCollectionLabels: ["default"];
    };
    googleDrive: {
        parsing: {
            "sectionLabelerMatchPattern": [string, string];
        };
        sources: {
            [Env: string]: {
                default: string;
            };
        };
    };
    googleScript: {
        "scriptId": string;
        "functionName": string;
    };
};
