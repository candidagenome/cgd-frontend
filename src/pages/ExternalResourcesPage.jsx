import React from 'react';
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
            <li><strong>Assembly 22:</strong> Phased diploid assembly (Muzzy et al., 2013)</li>
            <li><strong>Assembly 21:</strong> Chromosomal-level haploid reference (van het Hoog et al., 2007)</li>
            <li><strong>Assembly 19:</strong> Diploid contig assembly (Jones et al., 2004; Tzung et al., 2001)</li>
          </ul>

          <p><strong>Candida albicans WO-1 genome project</strong><br />
          Sequenced at the Broad Institute (FGI)</p>

          <p><strong>Candida dubliniensis CD36 genome project</strong><br />
          Deposited at NCBI by the Sanger Institute</p>

          <p><strong>Candida glabrata ATCC 2001</strong><br />
          Genolevures Consortium; updated assembly (Xu et al., 2020)</p>

          <p><strong>Candida guilliermondii genome project</strong><br />
          Broad Institute (FGI)</p>

          <p><strong>Candida lusitaniae genome project</strong><br />
          Broad Institute; updated FDA assembly (Sichtig et al., 2019)</p>

          <p><strong>Candida parapsilosis CDC317 genome project</strong><br />
          Sanger Institute</p>

          <p><strong>Candida tropicalis MYA-3404 genome project</strong><br />
          Broad Institute; updated assembly (Guin et al., 2020)</p>
        </div>

        <div className="info-section" id="comparisons">
          <h2>Candida Species Comparisons</h2>

          <p><strong>Butler et al. (2009)</strong><br />
          Comparative genomics across eight Candida species (phylogeny, gene families, synteny, SNPs, etc.)</p>

          <p><strong>CGD Public Wiki</strong><br />
          Papers, strain data, and comparative topics (codon usage, filamentation, mitochondria)</p>
        </div>

        <div className="info-section" id="comparative">
          <h2>Fungal Comparative Genomics</h2>

          <ul>
            <li>Ensembl Fungi</li>
            <li>JGI MycoCosm</li>
            <li>FungiDB</li>
          </ul>
        </div>

        <div className="info-section" id="lab">
          <h2>Laboratory Resources</h2>

          <ul>
            <li>Fungal Genetics Stock Center</li>
            <li>Candida strain collections (FGSC)</li>
            <li>EUCAST antifungal methods</li>
            <li>Clinical and Laboratory Standards Institute</li>
            <li>Developmental Studies Hybridoma Bank</li>
          </ul>
        </div>

        <div className="info-section" id="tools">
          <h2>Analysis Tools</h2>

          <ul>
            <li>PathoYeastract (Monteiro et al., 2017)</li>
            <li>FungiFun2 (Priebe et al., 2015)</li>
            <li>FungiFun3 (Garcia Lopez et al., 2024)</li>
            <li>C. albicans MLST (Bougnoux et al., 2003)</li>
            <li>Bioinformatics tools (DTU)</li>
            <li>MAPPER (Marinescu et al., 2005)</li>
            <li>Fungal Genomes BLAST (SGD)</li>
          </ul>
        </div>

        <div className="info-section" id="medical">
          <h2>Medical Mycology Resources</h2>

          <p>Candidiasis information at MedlinePlus</p>
        </div>

        <div className="info-section" id="fungaldb">
          <h2>Other Fungal Genome Databases</h2>

          <ul>
            <li>Saccharomyces Genome Database</li>
            <li>Cryptococcus neoformans genome project</li>
            <li>Aspergillus Genome resources</li>
            <li>Aspergillus nidulans genome project</li>
            <li>Magnaporthe genomics</li>
            <li>Schizosaccharomyces pombe PomBase</li>
            <li>Neurospora resources</li>
            <li>Fungal Genetics Stock Center</li>
          </ul>
        </div>

        <div className="info-section" id="other">
          <h2>Other Resources</h2>

          <ul>
            <li>GenBank (NCBI)</li>
            <li>EMBL-EBI</li>
            <li>DDBJ</li>
            <li>GenePalette</li>
            <li>AlphaFold Protein Structure Database</li>
            <li>Gene Ontology</li>
            <li>KEGG</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default ExternalResourcesPage;
