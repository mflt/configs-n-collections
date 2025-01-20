import stringify from 'fast-safe-stringify';
// import { GoogleAuth } from 'google-auth-library'
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import * as prompt from '@clack/prompts';
import color from 'picocolors';
const _googleScriptApi = google.script('v1');
// If modifying these scopes, delete token.json.
const _googleApisScopes = [
    'https://www.googleapis.com/auth/script.projects',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/script.external_request'
];
// WARNING: First of all download client secrets json to [secrets] from
// https://console.cloud.google.com/apis/credentials/oauthclient
export async function retrieveCollectionfromDoc(collectionLabels, // @TODO
env, config) {
    try {
        const authClient = await authorizedAuthClient(config);
        google.options({ auth: authClient });
        await retrieveRawMdDocsAndSave(collectionLabels, env, config);
        return 0;
    }
    catch (err) {
        // presumably the throwing point had already logged itself
        throw err;
    }
}
async function retrieveRawMdDocsAndSave(collectionLabels, // assumed to come to this point as a valid collectionLabels collection
env, config
// @TODO type
) {
    const codeTag = 'Retrieving raw md';
    let erratStep = '';
    await Promise.all(collectionLabels.values().map(async (collectionLabel) => {
        try {
            erratStep = 'running remote Google Script: ';
            // @TODO test config part applicable at this point
            const gaxiosResponse = await _googleScriptApi.scripts?.run?.({
                scriptId: config.googleScript.scriptId,
                requestBody: {
                    function: config.googleScript.functionName,
                    parameters: [
                        config.googleDrive.sources[env][collectionLabel]
                    ]
                    // devMode: true
                    // sessionState: "my_sessionState"
                }
            });
            if (gaxiosResponse?.statusText !== 'OK') {
                throw new Error('Google Script executed, but returned an error.'); // @TODO what err
            }
            else {
                // The structure of the result will depend upon what the Apps Script
                // function returns. Here, the function returns an Apps Script Object
                // with String keys and values, and so the result is treated as a
                // Node.js object (folderSet).
                const mdDocRaw = gaxiosResponse?.data?.response?.result;
                if (!mdDocRaw || Object.keys(mdDocRaw).length == 0) {
                    throw new Error('No content returned! ' + collectionLabel);
                }
                else {
                    erratStep = 'writing content of ' + collectionLabel + ': ';
                    await Bun.write(config.repo.prepared.folderPath + '/' +
                        config.repo.prepared.cachedRawMdDocPrefix +
                        collectionLabel + '.md', mdDocRaw);
                    // parseMdRawtoParts(mdRaw as unknown as string)
                    // console.log(mdRaw)
                    // Object.keys(folderSet).forEach(function(id) {
                    //   console.log('\t%s (%s)', folderSet[id], id);
                    // });
                }
            }
        }
        catch (err) {
            prompt.log.error(codeTag + ': ' + erratStep + '\n' +
                color.bgYellow(color.black((err?.message || ''))));
            throw err;
        }
    }));
}
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
//  Load or request or authorization to call APIs.
async function authorizedAuthClient(config) {
    let googleApisAuthClient = await loadSavedGoogleCredentialsIfExists(config);
    if (googleApisAuthClient != null) {
        // @TODO test if seems usable
        return googleApisAuthClient;
    }
    // Lets try to authenticate
    try {
        // Are client secrets available? Otherwise it will throw
        await testifClientSecretsExists(config);
        // Let's try with the given secrets
        prompt.log.warn(`${color.bgYellowBright(color.black('Likely now you\'ll be redirected to a google service to download one.'))}`);
        prompt.log.message(`${color.bgYellowBright(color.red('SECURITY WARNING:'))}` + `${color.reset(color.bold(' Give your consent carefully, you are blessing your/our script with medium risk rights, like:\n'))}` +
            `altering and deliting any Google Drive file, manipulating your Google Apps scripts, etc.\n` +
            `Taking a look at the involved Google Apps Scripts would be a good security practice (those are simple enough).`);
        const confirmtoProceed = await prompt.confirm({
            message: 'I\'ll check my browser (note we made Cancel the default below, hit Left Arrow first to proceed)',
            active: 'Proceed', inactive: 'Cancel', initialValue: false,
        });
        if (!confirmtoProceed || prompt.isCancel(confirmtoProceed)) {
            prompt.cancel('Fix the missing token file issue, and please try again');
            throw new Error();
        }
        const resultfromAuthenticate = authenticate({
            scopes: _googleApisScopes,
            keyfilePath: config.repo.googleApis.clientConfigurationJsonPath
        });
        // as unknown as Awaited<ReturnType<typeof loadSavedGoogleCredentialsIfExist>>
        const resultfromAuthenticateOrCancel = await Promise.race([
            resultfromAuthenticate,
            prompt.select({
                message: 'In case the browser action was not resultful, hit Enter to cancel',
                options: [
                    { value: true, label: 'Cancel' },
                ],
            })
        ]);
        if (resultfromAuthenticateOrCancel === true || prompt.isCancel(resultfromAuthenticateOrCancel)) {
            prompt.cancel('Authentication canceled. Fix the missing token file issue, and please try again');
            process.exit(0); // @TODO
        }
        googleApisAuthClient = resultfromAuthenticateOrCancel;
        prompt.log.success(`We got results from browser:\n` +
            `${stringify(googleApisAuthClient)}`);
    }
    catch (err) {
        throw new Error('Could not authenticate with Google Apis.\n' + err);
    }
    if (googleApisAuthClient?.credentials != null) {
        try {
            await saveGoogleCredentials(googleApisAuthClient, config);
            // assumed to communicate its throw errors to the user
        }
        catch (err) {
            throw err;
        }
        return googleApisAuthClient;
    }
    else {
        throw new Error('Google Apis Auth client creation failed, no credentials');
    }
}
async function testifClientSecretsExists(// errors are thrown and now end in overall failure
config) {
    try {
        const _clientSecrets = await Bun.file(config.repo.googleApis.clientConfigurationJsonPath // @TODO test if usable
        ).json();
        return true;
    }
    catch (err) {
        prompt.log.error(`Google Apis Client Secret/Id (aka configuration) file does not exist or is not a proper json.\n` +
            `a) Check if the file exists. Per the root configuration (root.config.toml) it's supposed to be located at:\n` +
            `${color.bgWhite(color.black(config.repo.googleApis.clientConfigurationJsonPath))}\n` +
            `b) Retrieve the 'client configuration' file from your developers' console.\n` +
            `${color.bgBlack(color.blueBright('Follow the below link (choose Desktop app as caller type):'))}\n` +
            `https://developers.google.com/identity/oauth2/web/guides/get-google-api-clientid \n` +
            `and save at the above location, which in our terms is [secrets].\n` +
            `Note, Google provides it under the name 'credentials.json' but calls it "client configuration" (so do we).`);
        throw err;
    }
}
async function loadSavedGoogleCredentialsIfExists(// does not throw and can go further and acquire the missing file automatically
config) {
    try {
        const tokenCredentials = await Bun.file(config.repo.googleApis.tokenJsonPath // @TODO test if usable
        ).json();
        return google.auth.fromJSON(tokenCredentials);
    }
    catch (err) {
        prompt.log.warn('Unable to load Google Apis Token credentials file (which is normally autogenerated)\n' +
            `from the location defined in the root configuration (root.config.toml), currently:\n` +
            `${color.bgWhite(color.black(config.repo.googleApis.tokenJsonPath))}\n` +
            `${err}`);
        return null;
    }
}
async function saveGoogleCredentials(authClient, config) {
    const _credentials = await Bun.file(config.repo.googleApis.clientConfigurationJsonPath).json(); // @TODO type
    const apiCredentials = _credentials.installed || _credentials.web;
    const pyl = stringify({
        type: 'authorized_user',
        client_id: apiCredentials.client_id,
        client_secret: apiCredentials.client_secret,
        refresh_token: authClient.credentials.refresh_token
    });
    try {
        await Bun.write(config.repo.googleApis.tokenJsonPath, pyl);
    }
    catch (err) {
        prompt.log.error('Could not save the Google Apis Token credentials file to project/[secrets]'); // @TODO location from toml ref
        throw err;
    }
}
