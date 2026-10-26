import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';
import './PathogenicYeastComparison.css';

// Sections converted from the CGD Public Wiki
const SECTIONS = [
  {
    to: '/pathogenic-yeast-comparison/seminal-papers',
    title: 'Seminal Candida Papers',
    description: 'Key papers on cell biology, transformation/response and virulence for each species',
  },
  {
    to: '/strains',
    title: 'Strain Information',
    description: 'Commonly used laboratory and clinical strains of each species, with genotypes and references',
  },
  {
    to: '/pathogenic-yeast-comparison/protocols',
    title: 'Protocols and Methods',
    description: 'Species identification and protocols for working with each species',
  },
  {
    to: '/pathogenic-yeast-comparison/species-comparisons',
    title: 'Species Comparisons by Topic',
    description: 'Ploidy, CUG codon usage, mitochondrial genomes, filamentous growth, biofilms, '
      + 'pathogenicity, mating, drug resistance, respiratory metabolism and virulence factors',
  },
  {
    to: '/pathogenic-yeast-comparison/datasets',
    title: 'Datasets Available in CGD',
    description: 'Published genome-wide datasets for each species that can be viewed in JBrowse',
  },
  {
    to: '/pathogenic-yeast-comparison/newsletters',
    title: 'CGD Newsletter Archive',
    description: 'Past issues of the CGD newsletter',
  },
];

function PathogenicYeastComparisonPage() {
  return (
    <div className="info-page pyc-page">
      <div className="info-page-content">
        <h1>Pathogenic Yeast Comparison</h1>
        <hr />

        <figure className="pyc-figure">
          <img src="/images/pyc/512px-candida-fungus-colony-grown-on-agar-media.jpg" alt="512px-Candida fungus colony grown on agar media" />
        </figure>

        <div className="info-section">
          <p>
            A curated collection of resources comparing the pathogenic yeasts in CGD: seminal papers,
            laboratory strains, protocols, comparisons of biology across species, and published
            datasets.
          </p>
          <ul className="pyc-section-list">
            {SECTIONS.map(s => (
              <li key={s.to}>
                <Link to={s.to}>{s.title}</Link>
                <span> &ndash; {s.description}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="info-section">
          <h2 id="current-taxonomy">Current Taxonomy</h2>
        <p>The genus <em>Candida</em> was originally formed as a heterogeneous grouping of opportunistic pathogenic budding yeasts that lacked sexual reproduction (<a href="https://pubmed.ncbi.nlm.nih.gov/38895705/" target="_blank" rel="noopener noreferrer">Groenewald et al., 2023</a>). Further genomic study has revealed evolutionary distances between these species that argues for taxonomic revision within the budding yeast subphylum Saccharomycotina (<a href="https://pubmed.ncbi.nlm.nih.gov/33148650/" target="_blank" rel="noopener noreferrer">Shen et al., 2020</a>, <a href="https://pubmed.ncbi.nlm.nih.gov/39161632/" target="_blank" rel="noopener noreferrer">Liu et al., 2024</a>, <a href="https://pubmed.ncbi.nlm.nih.gov/36632423/" target="_blank" rel="noopener noreferrer">Kidd et al., 2023</a>). Interestingly, it appears pathogenicity within humans has evolved multiple times in this subphylum (<a href="https://pubmed.ncbi.nlm.nih.gov/35508719/" target="_blank" rel="noopener noreferrer">Rokas, 2022</a>)</p>
        <p>NCBI has recently announced <a href="https://ncbiinsights.ncbi.nlm.nih.gov/2024/08/29/ncbi-taxonomy-updates-to-yeasts/" target="_blank" rel="noopener noreferrer">adoption of new taxonomy</a> that affects the Candida community.</p>
        <p>The specific name changes are as follows:</p>
        <ul>
          <li>
            <em>Clavispora lusitaniae</em> (syn. <em>Candida lusitaniae</em> )
          </li>
          <li>
            <em>Pichia kudriavzevii</em>  (syn. <em>Candida krusei</em> )
          </li>
          <li>
            <em>Meyerozyma guilliermondii</em>  (syn. <em>Candida guilliermondii</em> )
          </li>
          <li>
            <em>Nakaseomyces glabratus</em> (syn. <em>Candida glabrata</em> )
          </li>
          <li>
            <em>Candidozyma auris</em>  (syn. <em>Candida auris</em> )
          </li>
        </ul>
        </div>
      </div>
    </div>
  );
}

export default PathogenicYeastComparisonPage;
