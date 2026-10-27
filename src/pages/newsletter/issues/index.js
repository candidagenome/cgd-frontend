import Spring2026 from './Spring2026';
import Fall2026 from './Fall2026';
import Winter2024 from './Winter2024';
import Spring2024 from './Spring2024';
import Summer2024 from './Summer2024';
import Fall2024 from './Fall2024';
import Winter2025 from './Winter2025';
import Spring2025 from './Spring2025';
import Summer2025 from './Summer2025';
import Fall2025 from './Fall2025';
import Winter2026 from './Winter2026';
import Summer2026 from './Summer2026';

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
    id: 'summer-2026',
    title: 'Summer 2026',
    articles: [
      { id: 'proposal-naming-of-uncharacterized-orthologs', title: 'Proposal: Naming of Uncharacterized Orthologs' },
      { id: 'species-addition-candida-tropicalis-as-the-sixth-pathogenic-candida-species-in-cgd', title: 'Species Addition: Candida tropicalis as the Sixth Pathogenic Candida species in CGD' },
      { id: 'tool-release-virulence-factor-browser', title: 'Tool Release: Virulence Factor Browser' },
      { id: 'feature-releases-five-additional-new-features', title: 'Feature Releases: Five Additional New Features' },
      { id: 'research-spotlight', title: 'Research Spotlight: Repurposing a fungal exporter to import cyanine to kill Candida: an innovative way to fight drug resistance' },
    ],
    Component: Summer2026,
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
  {
    id: 'winter-2026',
    title: 'Winter 2026',
    articles: [
      { id: 'jon-binkley-s-retirement', title: 'Jon Binkley’s Retirement' },
      { id: 'gsa-meetings-in-2026', title: 'GSA Meetings in 2026' },
      { id: 'fungal-pathogen-genomics-course', title: 'Fungal Pathogen Genomics Course' },
      { id: 'research-spotlight', title: 'Research Spotlight: A small Candida glabrata protein promotes hyphal growth in C. albicans during mixed-species invasive candidiasis' },
      { id: 'upcoming-meetings', title: 'Upcoming Meetings' },
    ],
    Component: Winter2026,
  },
  {
    id: 'fall-2025',
    title: 'Fall 2025',
    articles: [
      { id: 'introducing-a-public-wiki-for-candida', title: 'Introducing a Public Wiki for Candida' },
      { id: 'candida-and-candidiasis-2025', title: 'Candida and Candidiasis 2025' },
      { id: 'research-spotlight', title: 'Research Spotlight: Candida albicans Ssy1 is the extracellular sensor of gut microbiota-derived peptidoglycan fragments mediating invasive hyphal growth in the host' },
      { id: 'upcoming-meetings', title: 'Upcoming Meetings' },
    ],
    Component: Fall2025,
  },
  {
    id: 'summer-2025',
    title: 'Summer 2025',
    articles: [
      { id: 'new-assemblies-of-candida-auris', title: 'New assemblies of Candida auris' },
      { id: 'upgrade-to-cgd-performance', title: 'Upgrade to CGD Performance' },
      { id: 'research-spotlight', title: 'Research Spotlight: Regulation of meiotic gene expression is functional in the human fungal pathogen Candida glabrata' },
      { id: 'upcoming-meetings', title: 'Upcoming Meetings' },
    ],
    Component: Summer2025,
  },
  {
    id: 'spring-2025',
    title: 'Spring 2025',
    articles: [
      { id: 'grant-renewal', title: 'Grant Renewal' },
      { id: 'new-cgd-publication-in-genetics', title: 'New CGD Publication in Genetics' },
      { id: 'new-release-of-the-candida-albicans-peptideatlas-proteomics-resource', title: 'New Release of the Candida albicans PeptideAtlas Proteomics Resource' },
      { id: 'research-spotlight', title: 'Research Spotlight: The putative error prone polymerase REV1 mediates DNA damage and drug resistance in Candida albicans' },
      { id: 'upcoming-meetings', title: 'Upcoming Meetings' },
    ],
    Component: Spring2025,
  },
  {
    id: 'winter-2025',
    title: 'Winter 2025',
    articles: [
      { id: 'new-assemblies-of-candida-auris', title: 'New assemblies of Candida auris' },
      { id: 'cgd-manuscript-in-genetics', title: 'CGD Manuscript in Genetics' },
      { id: 'research-spotlight', title: 'Research Spotlight: The putative error prone polymerase REV1 mediates DNA damage and drug resistance in Candida albicans' },
      { id: 'upcoming-meetings', title: 'Upcoming Meetings' },
    ],
    Component: Winter2025,
  },
  {
    id: 'fall-2024',
    title: 'Fall 2024',
    articles: [
      { id: 'new-taxonomy-in-candida', title: 'New Taxonomy in Candida' },
      { id: 'expression-datasets', title: 'Expression Datasets' },
      { id: 'research-spotlight', title: 'Research Spotlight: Infectious Synergism between Candida albicans and Staphylococcus aureus' },
      { id: 'upcoming-meetings', title: 'Upcoming Meetings' },
    ],
    Component: Fall2024,
  },
  {
    id: 'summer-2024',
    title: 'Summer 2024',
    articles: [
      { id: 'grant-renewal-application', title: 'Grant Renewal Application' },
      { id: 'new-literature-topics-for-candida-diseases', title: 'New Literature Topics for Candida Diseases' },
      { id: 'recent-expression-datasets', title: 'Recent Expression Datasets' },
      { id: 'research-spotlight', title: 'Research Spotlight: Identification of an active RNAi pathway in Candida albicans' },
      { id: 'upcoming-meetings', title: 'Upcoming Meetings' },
    ],
    Component: Summer2024,
  },
  {
    id: 'spring-2024',
    title: 'Spring 2024',
    articles: [
      { id: 'fill-out-our-questionnaire', title: 'Fill Out Our Questionnaire!' },
      { id: 'upgrades-to-our-protein-pages', title: 'Upgrades to our Protein Pages' },
      { id: 'expression-datasets-now-available-for-all-species', title: 'Expression Datasets Now Available for All Species' },
      { id: 'research-spotlight', title: 'Research Spotlight: Transcriptomic meta-analysis to identify potential antifungal targets in Candida albicans' },
      { id: 'upcoming-meetings', title: 'Upcoming Meetings' },
    ],
    Component: Spring2024,
  },
  {
    id: 'winter-2024',
    title: 'Winter 2024',
    articles: [
      { id: 'upcoming-grant-renewal-spells-new-opportunity', title: 'Upcoming Grant Renewal Spells New Opportunity' },
      { id: 'new-expression-datasets-at-cgd', title: 'New Expression Datasets at CGD' },
      { id: 'fungal-pathogen-genomics-course-2024', title: 'Fungal Pathogen Genomics Course 2024' },
      { id: 'research-spotlight', title: 'Research Spotlight: Two Studies Delve into Why SC5314 Is Unique' },
      { id: 'upcoming-meetings', title: 'Upcoming Meetings' },
    ],
    Component: Winter2024,
  },
];

export const getIssue = (id) => NEWSLETTER_ISSUES.find(issue => issue.id === id);
