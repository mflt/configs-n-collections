import { fromMarkdown } from 'mdast-util-from-markdown'
import { toMarkdown } from 'mdast-util-to-markdown'
import { mdxToMarkdown } from 'mdast-util-mdx'
import { headingRange, type TestFunction } from 'mdast-util-heading-range'
// import { frontmatter } from 'micromark-extension-frontmatter'
import { frontmatterToMarkdown } from 'mdast-util-frontmatter'
import type { Heading } from 'mdast'
// import { visit } from 'mdast-util-traverse'
// import { normalizeHeadings } from 'mdast-normalize-headings'
import type { GcCollectionfromDoc_Config, DefaultEnvLiterals } from './types'


export async function parseCollectiontoSections < 
  CollectionLabels extends GcCollectionfromDoc_Config<string[]>['namespace']['validCollectionLabels'],
> (
  collectionLabels: Set<string>, // @TODO
  config: GcCollectionfromDoc_Config<CollectionLabels>
) {
  try {
    await parseRawMdDocstoSections<CollectionLabels>(collectionLabels, config)
    return 0
  } catch (err) {
    throw err
  }
}

interface SectionLabelAndText {
  label: string
  text: string
}

async function parseRawMdDocstoSections < 
  CollectionLabels extends GcCollectionfromDoc_Config<string[]>['namespace']['validCollectionLabels'],
> (
  collectionLabels: Set<string>, // @TODO
  config: GcCollectionfromDoc_Config<CollectionLabels>
) {
  const sectionLabelerMatchPattern =
    config.googleDrive.parsing.sectionLabelerMatchPattern
  const sectionsLabelsAndTexts: SectionLabelAndText[] = []

  await Promise.all(
    collectionLabels.values().map(async (collectionLabel) => {
      let mdDocTree: ReturnType<typeof fromMarkdown> | undefined
      try {
        mdDocTree = fromMarkdown(
          await Bun.file(
            config.repo.prepared.folderPath + '/' +
            config.repo.prepared.cachedRawMdDocPrefix +
            collectionLabel + '.md'
          ).text()
        )
      } catch (err) {
        throw Error('Error while loading prepared doc of ' + collectionLabel + ': ' + err)
      }
      // console.log('Children:', mdDocTree?.children?.length)
      // console.log('Child: \n', mdDocTree?.children?.[0])
      headingRange(
        mdDocTree,
        (value, heading) =>
          captureSectionLabelsfromHeading<CollectionLabels>(
            value, heading, sectionsLabelsAndTexts,
            config
          ),
        () => undefined
      )
      if (sectionsLabelsAndTexts.length > 0) {
        sectionsLabelsAndTexts.map(({ label, text: titleText }, idx) => {
          const pattern = '.*' + sectionLabelerMatchPattern[0] +
            label + sectionLabelerMatchPattern[1] + '.*'
          headingRange(mdDocTree, new RegExp(pattern, 'i'), (start, nodes, end) => {
            // console.log('Child: \n', label, JSON.stringify(nodes));
            (async function () {
              try {
                await Bun.write(
                  config.repo.prepared.sectionsOutputPath +
                    `/${collectionLabel}/` +
                    // + `section.${platform}.`
                    idx.toLocaleString('en-US', {
                      minimumIntegerDigits: 2,
                      useGrouping: false
                    }) +
                    `_${label}.mdx`
                  ,
                  toMarkdown({
                    type: 'root',
                    children: [
                      { type: 'yaml', value: `title: ${titleText}` },
                      ...nodes
                    ]
                  },
                  {
                    extensions: [
                      frontmatterToMarkdown(['yaml']),
                      mdxToMarkdown()
                    ]
                  })
                )
              } catch (err) {
                throw Error('Failed: unable to write section file of: ' + collectionLabel + '/' + label)
              }
            })()
          // mdTree?.children?.map( child => {
          //   if (child?.type == 'heading' && child.depth == 2) {
          //     console.log('Child: \n', child)
          //   }
          })
        })
      }
    }))
}

function captureSectionLabelsfromHeading < 
  CollectionLabels extends GcCollectionfromDoc_Config<string[]>['namespace']['validCollectionLabels'],
> (
  textValue: string,
  heading: Heading,
  sectionsLabelsAndTexts: SectionLabelAndText[],
  config: GcCollectionfromDoc_Config<CollectionLabels>
) {
  const sectionLabelerMatchPattern = config.googleDrive.parsing.sectionLabelerMatchPattern
  const sectionLabeler = textValue.match(
    `${sectionLabelerMatchPattern[0]}.*${sectionLabelerMatchPattern[1]}`
  ) //  "\\|\\|.*\\|\\|")
  if (sectionLabeler != null) {
    sectionsLabelsAndTexts.push({
      label: sectionLabeler[0]
        ?.replace(sectionLabelerMatchPattern[0], '').replace(sectionLabelerMatchPattern[1], ''),
      text: sectionLabeler.input?.replace(sectionLabeler[0], '')?.trim() || ''
    })
    // sectionsTestStrings.push(sectionLabeler[0])
    // console.log('Captured', sectionLabeler[0], '\nHeading label:', sectionHeadingTextProps.label, 'text:', sectionHeadingTextProps.text)
    // return true
  }
  return false
}
