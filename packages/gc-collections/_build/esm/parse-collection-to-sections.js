import { fromMarkdown } from 'mdast-util-from-markdown';
import { toMarkdown } from 'mdast-util-to-markdown';
import { mdxToMarkdown } from 'mdast-util-mdx';
import { headingRange } from 'mdast-util-heading-range';
// import { frontmatter } from 'micromark-extension-frontmatter'
import { frontmatterToMarkdown } from 'mdast-util-frontmatter';
export async function parseCollectiontoSections(collectionLabels, // @TODO
config) {
    try {
        await parseRawMdDocstoSections(collectionLabels, config);
        return 0;
    }
    catch (err) {
        throw err;
    }
}
async function parseRawMdDocstoSections(collectionLabels, // @TODO
config) {
    const sectionLabelerMatchPattern = config.googleDrive.parsing.sectionLabelerMatchPattern;
    const sectionsLabelsAndTexts = [];
    await Promise.all(collectionLabels.values().map(async (collectionLabel) => {
        let mdDocTree;
        try {
            mdDocTree = fromMarkdown(await Bun.file(config.repo.prepared.folderPath + '/' +
                config.repo.prepared.cachedRawMdDocPrefix +
                collectionLabel + '.md').text());
        }
        catch (err) {
            throw Error('Error while loading prepared doc of ' + collectionLabel + ': ' + err);
        }
        // console.log('Children:', mdDocTree?.children?.length)
        // console.log('Child: \n', mdDocTree?.children?.[0])
        headingRange(mdDocTree, (value, heading) => captureSectionLabelsfromHeading(value, heading, sectionsLabelsAndTexts, config), () => undefined);
        if (sectionsLabelsAndTexts.length > 0) {
            sectionsLabelsAndTexts.map(({ label, text: titleText }, idx) => {
                const pattern = '.*' + sectionLabelerMatchPattern[0] +
                    label + sectionLabelerMatchPattern[1] + '.*';
                headingRange(mdDocTree, new RegExp(pattern, 'i'), (start, nodes, end) => {
                    // console.log('Child: \n', label, JSON.stringify(nodes));
                    (async function () {
                        try {
                            await Bun.write(config.repo.prepared.sectionsOutputPath +
                                `/${collectionLabel}/` +
                                // + `section.${platform}.`
                                idx.toLocaleString('en-US', {
                                    minimumIntegerDigits: 2,
                                    useGrouping: false
                                }) +
                                `_${label}.mdx`, toMarkdown({
                                type: 'root',
                                children: [
                                    { type: 'yaml', value: `title: ${titleText}` },
                                    ...nodes
                                ]
                            }, {
                                extensions: [
                                    frontmatterToMarkdown(['yaml']),
                                    mdxToMarkdown()
                                ]
                            }));
                        }
                        catch (err) {
                            throw Error('Failed: unable to write section file of: ' + collectionLabel + '/' + label);
                        }
                    })();
                    // mdTree?.children?.map( child => {
                    //   if (child?.type == 'heading' && child.depth == 2) {
                    //     console.log('Child: \n', child)
                    //   }
                });
            });
        }
    }));
}
function captureSectionLabelsfromHeading(textValue, heading, sectionsLabelsAndTexts, config) {
    const sectionLabelerMatchPattern = config.googleDrive.parsing.sectionLabelerMatchPattern;
    const sectionLabeler = textValue.match(`${sectionLabelerMatchPattern[0]}.*${sectionLabelerMatchPattern[1]}`); //  "\\|\\|.*\\|\\|")
    if (sectionLabeler != null) {
        sectionsLabelsAndTexts.push({
            label: sectionLabeler[0]
                ?.replace(sectionLabelerMatchPattern[0], '').replace(sectionLabelerMatchPattern[1], ''),
            text: sectionLabeler.input?.replace(sectionLabeler[0], '')?.trim() || ''
        });
        // sectionsTestStrings.push(sectionLabeler[0])
        // console.log('Captured', sectionLabeler[0], '\nHeading label:', sectionHeadingTextProps.label, 'text:', sectionHeadingTextProps.text)
        // return true
    }
    return false;
}
