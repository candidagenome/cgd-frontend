import Spring2026 from './Spring2026';

/*
 * CGD Newsletter issues, newest first.
 *
 * To publish a new issue:
 *   1. Copy issues/Spring2026.jsx to a new file (e.g. Fall2026.jsx) and replace the
 *      content. Put each article in <section className="newsletter-article" id="...">;
 *      add "newsletter-spotlight" to the Research Spotlight section. Put the issue's
 *      images in public/images/newsletter/<issue-id>/.
 *   2. Import it here and add an entry at the TOP of NEWSLETTER_ISSUES. The articles
 *      list drives the "In this issue" box and the archive summary; each id must match
 *      a section id in the issue file.
 */
export const NEWSLETTER_ISSUES = [
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
