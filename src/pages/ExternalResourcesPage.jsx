import React from 'react';
import { Link } from 'react-router-dom';
import './InfoPages.css';

const ExternalResourcesPage = () => {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>External Resources</h1>
        <hr />

        <nav className="info-section">
          <ul>
            <li><a href="#refgen">Candida Reference Genomes</a></li>
            <li><a href="#comparisons">Candida Species Comparisons</a></li>
            <li><a href="#comparative">Fungal Comparative Genomics</a></li>
            <li><a href="#lab">Laboratory Resources</a></li>
            <li><a href="#tools">Analysis Tools</a></li>
            <li><a href="#medical">Medical Mycology</a></li>
            <li><a href="#fungaldb">Fungal Databases</a></li>
            <li><a href="#other">Other Resources</a></li>
          </ul>
        </nav>

        <div className="info-section" id="refgen">
          <h2>Candida Reference Genomes</h2>

          <p><strong>Candida albicans SC5314 genome projects</strong></p>
          <ul>
            <li><strong>Assembly 22:</strong> <a href="https://doi.org/10.1128/genomeA.00590-13" target="_blank" rel="noopener noreferrer">Muzzy et al., 2013</a></li>
            <li><strong>Assembly 21:</strong> <a href="https://genomebiology.biomedcentral.com/articles/10.1186/gb-2007-8-4-r52" target="_blank" rel="noopener noreferrer">van het Hoog et al., 2007</a></li>
            <li><strong>Assembly 19:</strong> <a href="https://www.pnas.org/doi/10.1073/pnas.0401648101" target="_blank" rel="noopener noreferrer">Jones et al., 2004</a>; <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC302673/" target="_blank" rel="noopener noreferrer">Tzung et al., 2001</a></li>
          </ul>

          <p>
            <a href="https://www.broadinstitute.org/" target="_blank" rel="noopener noreferrer"><em>Candida albicans</em> WO-1 genome project</a><br />
            <small>Broad Institute (FGI)</small>
          </p>

          <p>
            <a href="https://www.sanger.ac.uk/" target="_blank" rel="noopener noreferrer"><em>Candida dubliniensis</em> CD36 genome project</a><br />
            <small>Sanger Institute (NCBI deposit)</small>
          </p>

          <p>
            <a href="http://genolevures.org" target="_blank" rel="noopener noreferrer"><em>Candida glabrata</em> genome project</a><br />
            <small>Genolevures Consortium; updated <a href="https://www.ncbi.nlm.nih.gov/" target="_blank" rel="noopener noreferrer">NCBI</a> assembly (Xu et al., 2020)</small>
          </p>

          <p>
            <a href="https://www.broadinstitute.org/" target="_blank" rel="noopener noreferrer"><em>Candida guilliermondii</em> genome project</a>
          </p>

          <p>
            <a href="https://www.broadinstitute.org/" target="_blank" rel="noopener noreferrer"><em>Candida lusitaniae</em> genome project</a><br />
            <small>Updated: <a href="https://doi.org/10.1128/genomeA.00234-19" target="_blank" rel="noopener noreferrer">Sichtig et al., 2019</a></small>
          </p>

          <p>
            <a href="https://www.sanger.ac.uk/" target="_blank" rel="noopener noreferrer"><em>Candida parapsilosis</em> CDC317 genome project</a>
          </p>

          <p>
            <a href="https://www.broadinstitute.org/" target="_blank" rel="noopener noreferrer"><em>Candida tropicalis</em> MYA-3404 genome project</a><br />
            <small>Updated: <a href="https://doi.org/10.1186/s12864-020-06891-7" target="_blank" rel="noopener noreferrer">Guin et al., 2020</a></small>
          </p>
        </div>

        <div className="info-section" id="comparisons">
          <h2>Candida Species Comparisons</h2>

          <p>
            <a href="https://doi.org/10.1038/nature08064" target="_blank" rel="noopener noreferrer">Butler et al. (2009)</a><br />
            <small>Comparative genomics across Candida species</small>
          </p>

          <p>
            <a href="https://www.candidagenome.org/" target="_blank" rel="noopener noreferrer">CGD Public Wiki</a>
          </p>
        </div>

        <div className="info-section" id="comparative">
          <h2>Fungal Comparative Genomics</h2>
          <ul>
            <li><a href="https://fungi.ensembl.org" target="_blank" rel="noopener noreferrer">Ensembl Fungi</a></li>
            <li><a href="https://mycocosm.jgi.doe.gov" target="_blank" rel="noopener noreferrer">JGI MycoCosm</a></li>
            <li><a href="https://fungidb.org" target="_blank" rel="noopener noreferrer">FungiDB</a></li>
          </ul>
        </div>

        <div className="info-section" id="lab">
          <h2>Laboratory Resources</h2>
          <ul>
            <li><a href="https://www.fgsc.net" target="_blank" rel="noopener noreferrer">Fungal Genetics Stock Center</a></li>
            <li><a href="https://www.fgsc.net" target="_blank" rel="noopener noreferrer">Candida collections (FGSC)</a></li>
            <li><a href="https://www.eucast.org" target="_blank" rel="noopener noreferrer">EUCAST</a></li>
            <li><a href="https://clsi.org" target="_blank" rel="noopener noreferrer">Clinical and Laboratory Standards Institute</a></li>
            <li><a href="https://dshb.biology.uiowa.edu" target="_blank" rel="noopener noreferrer">Developmental Studies Hybridoma Bank</a></li>
          </ul>
        </div>

        <div className="info-section" id="tools">
          <h2>Analysis Tools</h2>
          <ul>
            <li><a href="http://www.pathoyeastract.org" target="_blank" rel="noopener noreferrer">PathoYeastract</a></li>
            <li><a href="https://elbe.hki-jena.de/fungifun" target="_blank" rel="noopener noreferrer">FungiFun2</a></li>
            <li><a href="https://fungifun3.example.org" target="_blank" rel="noopener noreferrer">FungiFun3</a></li>
            <li><a href="https://pubmlst.org" target="_blank" rel="noopener noreferrer">C. albicans MLST</a></li>
            <li><a href="https://www.cbs.dtu.dk/services/" target="_blank" rel="noopener noreferrer">DTU Bioinformatics Tools</a></li>
            <li><a href="http://mapper.chip.org" target="_blank" rel="noopener noreferrer">MAPPER</a></li>
            <li><a href="https://www.yeastgenome.org/blast-fungal" target="_blank" rel="noopener noreferrer">Fungal Genomes BLAST</a></li>
          </ul>
        </div>

        <div className="info-section" id="medical">
          <h2>Medical Mycology Resources</h2>
          <p>
            <a href="https://medlineplus.gov/candidiasis.html" target="_blank" rel="noopener noreferrer">Candidiasis (MedlinePlus)</a>
          </p>
        </div>

        <div className="info-section" id="fungaldb">
          <h2>Other Fungal Genome Databases</h2>
          <ul>
            <li><a href="https://www.yeastgenome.org" target="_blank" rel="noopener noreferrer">Saccharomyces Genome Database</a></li>
            <li><a href="https://www.broadinstitute.org" target="_blank" rel="noopener noreferrer">Cryptococcus neoformans project</a></li>
            <li><a href="https://www.aspergillusgenome.org" target="_blank" rel="noopener noreferrer">Aspergillus Genome DB</a></li>
            <li><a href="https://fungidb.org" target="_blank" rel="noopener noreferrer">PomBase</a></li>
          </ul>
        </div>

        <div className="info-section" id="other">
          <h2>Other Resources</h2>
          <ul>
            <li><a href="https://www.ncbi.nlm.nih.gov/genbank/" target="_blank" rel="noopener noreferrer">GenBank</a></li>
            <li><a href="https://www.ebi.ac.uk" target="_blank" rel="noopener noreferrer">EMBL-EBI</a></li>
            <li><a href="https://www.ddbj.nig.ac.jp" target="_blank" rel="noopener noreferrer">DDBJ</a></li>
            <li><a href="http://www.genepalette.org" target="_blank" rel="noopener noreferrer">GenePalette</a></li>
            <li><a href="https://alphafold.ebi.ac.uk" target="_blank" rel="noopener noreferrer">AlphaFold</a></li>
            <li><a href="http://geneontology.org" target="_blank" rel="noopener noreferrer">Gene Ontology</a></li>
            <li><a href="https://www.genome.jp/kegg/" target="_blank" rel="noopener noreferrer">KEGG</a></li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default ExternalResourcesPage;
