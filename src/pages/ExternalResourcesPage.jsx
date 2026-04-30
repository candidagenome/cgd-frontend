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
            <li><a href="#comparative">Resources for Fungal Comparative Genomics</a></li>
            <li><a href="#lab">Resources for Laboratory Research</a></li>
            <li><a href="#tools">Analysis Tools</a></li>
            <li><a href="#medical">Medical Mycology Resources</a></li>
            <li><a href="#fungaldb">Other Fungal Genome Databases</a></li>
            <li><a href="#other">Other Resources</a></li>
          </ul>
        </nav>

        <div className="info-section" id="refgen">
          <h2>Candida Reference Genomes</h2>

          <p><strong>Candida albicans SC5314 genome projects</strong></p>
          <ul>
            <li>
              <strong>Assembly 22:</strong> The phased diploid Assembly 22 is described in 
              <a href="https://doi.org/10.1128/genomeA.00590-13" target="_blank" rel="noopener noreferrer">Muzzy et al., 2013</a>.
            </li>
            <li>
              <strong>Assembly 21:</strong> The haploid chromosomal-level Assembly 21 reference sequence is described in 
              <a href="https://genomebiology.biomedcentral.com/articles/10.1186/gb-2007-8-4-r52" target="_blank" rel="noopener noreferrer">van het Hoog et al., 2007</a>.
            </li>
            <li>
              <strong>Assembly 19:</strong> The C. albicans strain SC5314 genome sequence and diploid contig-level assembly was published in 
              <a href="https://www.pnas.org/doi/10.1073/pnas.0401648101" target="_blank" rel="noopener noreferrer">Jones et al., 2004</a>. 
              Sequencing methods are described in 
              <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC302673/" target="_blank" rel="noopener noreferrer">Tzung et al., 2001</a>.
            </li>
          </ul>

          <p>
            <a href="https://www.broadinstitute.org/" target="_blank" rel="noopener noreferrer">Candida albicans WO-1 genome project</a><br />
            <small>The genome of C. albicans strain WO-1 was sequenced at the Broad Institute as part of the Fungal Genome Initiative (FGI).</small>
          </p>

          <p>
            <a href="https://www.sanger.ac.uk/" target="_blank" rel="noopener noreferrer">Candida dubliniensis CD36 genome project</a><br />
            <small>Deposited at NCBI by the Sanger Institute.</small>
          </p>

          <p>
            <a href="http://genolevures.org" target="_blank" rel="noopener noreferrer">Candida glabrata ATCC 2001 genome project</a><br />
            <small>Original sequencing by the Genolevures Consortium; updated assembly published by 
            <a href="https://doi.org/10.1093/nar/gkaa1034" target="_blank" rel="noopener noreferrer">Xu et al., 2020</a>.</small>
          </p>

          <p>
            <a href="https://www.broadinstitute.org/" target="_blank" rel="noopener noreferrer">Candida guilliermondii genome project</a><br />
            <small>Sequenced at the Broad Institute as part of the Fungal Genome Initiative (FGI).</small>
          </p>

          <p>
            <a href="https://www.broadinstitute.org/" target="_blank" rel="noopener noreferrer">Candida lusitaniae genome project</a><br />
            <small>Originally sequenced at Broad; updated assembly by FDA published in 
            <a href="https://doi.org/10.1128/genomeA.00234-19" target="_blank" rel="noopener noreferrer">Sichtig et al., 2019</a>.</small>
          </p>

          <p>
            <a href="https://www.sanger.ac.uk/" target="_blank" rel="noopener noreferrer">Candida parapsilosis CDC317 genome project</a><br />
            <small>Deposited at NCBI by the Sanger Institute.</small>
          </p>

          <p>
            <a href="https://www.broadinstitute.org/" target="_blank" rel="noopener noreferrer">Candida tropicalis MYA-3404 genome project</a><br />
            <small>Sequenced at Broad; updated assembly published in 
            <a href="https://doi.org/10.1186/s12864-020-06891-7" target="_blank" rel="noopener noreferrer">Guin et al., 2020</a>.</small>
          </p>
        </div>

        <div className="info-section" id="comparisons">
          <h2>Candida Species Comparisons</h2>

          <p>
            <a href="https://doi.org/10.1038/nature08064" target="_blank" rel="noopener noreferrer">Butler et al. (2009)</a> — 
            Supplementary data for eight Candida genomes including genome characteristics, phylogeny, gene families, and synteny.
          </p>

          <p>
            <a href="https://www.candidagenome.org/" target="_blank" rel="noopener noreferrer">CGD Public Wiki</a> — 
            Contains Candida papers, strain information, and comparisons by topic.
          </p>
        </div>

        <div className="info-section" id="comparative">
          <h2>Resources for Fungal Comparative Genomics</h2>
          <ul>
            <li><a href="https://fungi.ensembl.org" target="_blank" rel="noopener noreferrer">Ensembl Fungi</a> — genome browsers and comparative genomics</li>
            <li><a href="https://mycocosm.jgi.doe.gov" target="_blank" rel="noopener noreferrer">JGI MycoCosm</a> — fungal genomics portal</li>
            <li><a href="https://fungidb.org" target="_blank" rel="noopener noreferrer">FungiDB</a> — integrated genomic data</li>
          </ul>
        </div>

        <div className="info-section" id="lab">
          <h2>Resources for Laboratory Research</h2>
          <ul>
            <li><a href="https://www.fgsc.net" target="_blank" rel="noopener noreferrer">Fungal Genetics Stock Center</a> — strain repository</li>
            <li><a href="https://www.fgsc.net" target="_blank" rel="noopener noreferrer">Candida collections at FGSC</a> — mutant collections</li>
            <li><a href="https://www.eucast.org" target="_blank" rel="noopener noreferrer">EUCAST</a> — antifungal methodology</li>
            <li><a href="https://clsi.org" target="_blank" rel="noopener noreferrer">Clinical and Laboratory Standards Institute</a></li>
            <li><a href="https://dshb.biology.uiowa.edu" target="_blank" rel="noopener noreferrer">Developmental Studies Hybridoma Bank</a></li>
          </ul>
        </div>

        <div className="info-section" id="tools">
          <h2>Analysis Tools</h2>
          <ul>
            <li><a href="http://www.pathoyeastract.org" target="_blank" rel="noopener noreferrer">PathoYeastract</a> — TF regulatory associations (Monteiro et al., 2017)</li>
            <li><a href="https://elbe.hki-jena.de/fungifun" target="_blank" rel="noopener noreferrer">FungiFun2</a> — functional enrichment (Priebe et al., 2015)</li>
            <li>FungiFun3 — differential expression tools (Garcia Lopez et al., 2024)</li>
            <li><a href="https://pubmlst.org" target="_blank" rel="noopener noreferrer">C. albicans MLST</a> — strain typing (Bougnoux et al., 2003)</li>
            <li><a href="https://www.cbs.dtu.dk/services/" target="_blank" rel="noopener noreferrer">DTU Bioinformatics Tools</a></li>
            <li><a href="http://mapper.chip.org" target="_blank" rel="noopener noreferrer">MAPPER</a></li>
            <li><a href="https://www.yeastgenome.org/blast-fungal" target="_blank" rel="noopener noreferrer">Fungal Genomes BLAST</a></li>
          </ul>
        </div>

        <div className="info-section" id="medical">
          <h2>Medical Mycology Resources</h2>
          <p>
            <a href="https://medlineplus.gov/candidiasis.html" target="_blank" rel="noopener noreferrer">Candidiasis Information at MedlinePlus</a> — medical overview
          </p>
        </div>

        <div className="info-section" id="fungaldb">
          <h2>Other Fungal Genome Databases</h2>
          <ul>
            <li><a href="https://www.yeastgenome.org" target="_blank" rel="noopener noreferrer">Saccharomyces Genome Database</a></li>
            <li><a href="https://www.broadinstitute.org" target="_blank" rel="noopener noreferrer">Cryptococcus neoformans genome project</a></li>
            <li><a href="https://www.aspergillusgenome.org" target="_blank" rel="noopener noreferrer">Aspergillus Genome Database</a></li>
            <li><a href="https://fungidb.org" target="_blank" rel="noopener noreferrer">Schizosaccharomyces pombe PomBase</a></li>
            <li><a href="https://www.fgsc.net" target="_blank" rel="noopener noreferrer">Fungal Genetics Stock Center</a></li>
          </ul>
        </div>

        <div className="info-section" id="other">
          <h2>Other Resources</h2>
          <ul>
            <li><a href="https://www.ncbi.nlm.nih.gov/genbank/" target="_blank" rel="noopener noreferrer">GenBank</a></li>
            <li><a href="https://www.ebi.ac.uk" target="_blank" rel="noopener noreferrer">EMBL-EBI</a></li>
            <li><a href="https://www.ddbj.nig.ac.jp" target="_blank" rel="noopener noreferrer">DDBJ</a></li>
            <li><a href="http://www.genepalette.org" target="_blank" rel="noopener noreferrer">GenePalette</a></li>
            <li><a href="https://alphafold.ebi.ac.uk" target="_blank" rel="noopener noreferrer">AlphaFold Protein Structure Database</a></li>
            <li><a href="http://geneontology.org" target="_blank" rel="noopener noreferrer">Gene Ontology</a></li>
            <li><a href="https://www.genome.jp/kegg/" target="_blank" rel="noopener noreferrer">KEGG</a></li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default ExternalResourcesPage;
