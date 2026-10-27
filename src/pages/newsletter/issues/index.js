import Spring2026 from './Spring2026';
import Fall2026 from './Fall2026';

/*
 * CGD Newsletter issues, newest first.
 *
 * To publish a new issue from the curators' Word file:
 *   python3 scripts/newsletter_docx_to_issue.py "path/to/Winter 2027.docx"
 * This writes issues/<Name>.jsx, extracts the images to
 * public/images/newsletter/<issue-id>/ and adds the issue to this list in date order,
 * so old issues can be added in any order.
 * Review the generated page before committing.
 *
 * To write an issue by hand instead: copy an existing issue file, put each article
 * in <section className="newsletter-article" id="..."> (add "newsletter-spotlight"
 * for the Research Spotlight), then import it here and add an entry to
 * NEWSLETTER_ISSUES in date order (newest first). The articles list drives the
 * "In this issue" box and the archive summary; each id must match a section id
 * in the issue file.
 */
export const NEWSLETTER_ISSUES = [
  {
    id: 'fall-2026',
    title: 'Fall 2026',
    articles: [
      { id: 'naming-of-uncharacterized-orthologs', title: 'Naming of Uncharacterized Orthologs' },
      { id: 'expanded-set-of-drug-related-literature-topic-tags', title: 'Expanded Set of Drug-Related Literature Topic Tags' },
      { id: 'new-chip-seq-and-chec-seq-datasets', title: 'New ChIP-Seq and ChEC-Seq datasets' },
      { id: 'annotation-of-repetitive-elements', title: 'Annotation of Repetitive Elements' },
      { id: 'research-spotlight', title: 'Research Spotlight: Hac1-independent functions of Ire1 drive morphogenesis in Candida albicans through distinct transcriptional programs' },
    ],
    Component: Fall2026,
  },
  {
    id: 'spring-2026',
    title: 'Spring 2026',
    articles: [
      { id: 'cgd-is-getting-remodelled', title: 'CGD Is Getting Remodelled!' },
      {
        id: 'research-spotlight',
        title: 'Research Spotlight: Fungal extracellular vesicles mediate conserved '
          + 'cross-species communication and immunomodulation',
      },
    ],
    Component: Spring2026,
  },
];

export const getIssue = (id) => NEWSLETTER_ISSUES.find(issue => issue.id === id);
