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
            <li><a href="#genomes"><em>Candida</em> Reference Genomes</a></li>
            <li><a href="#candida"><em>Candida</em> Species Comparisons</a></li>
            <li><a href="#comparative-genomics">Resources for Fungal Comparative Genomics</a></li>
            <li><a href="#laboratory">Resources for Laboratory Research</a></li>
            <li><a href="#tools">Analysis Tools</a></li>
            <li><a href="#medical">Medical Mycology Resources</a></li>
            <li><a href="#fungal">Other Fungal Genome Databases</a></li>
            <li><a href="#other">Other Resources</a></li>
          </ul>
        </nav>

        <div className="info-section" id="genomes">
          <h2><em>Candida</em> Reference Genomes</h2>

          <ul>
            <li>
              <a href="https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_000182965.3/" target="_blank" rel="noopener noreferrer">
                <em>Candida albicans</em> SC5314
              </a>{' '}
              genome projects
              <ul>
                <li>
                  <strong>Assembly 22:</strong> The{' '}
                  <a href="https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_000182965.3/" target="_blank" rel="noopener noreferrer">
                    phased diploid Assembly 22
                  </a>{' '}
                  is described in{' '}
                  <a href="https://pubmed.ncbi.nlm.nih.gov/24025428/" target="_blank" rel="noopener noreferrer">
                    Muzzy et al., 2013
                  </a>.
                </li>
                <li>
                  <strong>Assembly 21:</strong> The haploid chromosomal-level Assembly 21 reference sequence is described in{' '}
                  <a href="https://pubmed.ncbi.nlm.nih.gov/17419877/" target="_blank" rel="noopener noreferrer">
                    van het Hoog et al., 2007
                  </a>.
                </li>
                <li>
                  <strong>Assembly 19:</strong> The <em>C. albicans</em> strain SC5314 genome sequence and diploid contig-level assembly by the Stanford Genome Technology Center was published in{' '}
                  <a href="https://pubmed.ncbi.nlm.nih.gov/15123810/" target="_blank" rel="noopener noreferrer">
                    Jones et al., 2004
                  </a>. The construction of the sequencing library and sequencing methods are described in{' '}
                  <a href="https://pubmed.ncbi.nlm.nih.gov/11248064/" target="_blank" rel="noopener noreferrer">
                    Tzung et al., 2001
                  </a>.
                </li>
              </ul>
            </li>

            <li>
              <a href="https://www.ncbi.nlm.nih.gov/datasets/genome/GCA_000149445.2/" target="_blank" rel="noopener noreferrer">
                <em>Candida albicans</em> WO-1
              </a>{' '}
              genome project<br />
              The genome of <em>C. albicans</em> strain WO-1 was sequenced at the Broad Institute as part of the{' '}
              <a href="https://www.broadinstitute.org/fungal-genome-initiative" target="_blank" rel="noopener noreferrer">
                Fungal Genome Initiative
              </a>{' '}
              (FGI).
            </li>

            <li>
              <a href="https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_000026945.1/" target="_blank" rel="noopener noreferrer">
                <em>Candida dubliniensis</em> CD36
              </a>{' '}
              genome project<br />
              Deposited at NCBI by the{' '}
              <a href="http://www.sanger.ac.uk/" target="_blank" rel="noopener noreferrer">
                Sanger Institute
              </a>.
            </li>

            <li>
              <a href="https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_010111755.1/" target="_blank" rel="noopener noreferrer">
                <em>Candida glabrata</em> ATCC 2001 (<em>Nakaseomyces glabratus</em>)
              </a>{' '}
              genome project<br />
              Original sequencing was performed by the Genolevures Consortium. A more recent assembly was published by{' '}
              <a href="https://pubmed.ncbi.nlm.nih.gov/32068314/" target="_blank" rel="noopener noreferrer">
                Xu et al., 2020
              </a>{' '}
              and deposited at NCBI.
            </li>

            <li>
              <a href="https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_000149425.1/" target="_blank" rel="noopener noreferrer">
                <em>Candida guilliermondii</em> (<em>Meyerozyma guilliermondii</em>)
              </a>{' '}
              genome project<br />
              The <em>C. guilliermondii</em> genome was sequenced at the Broad Institute as part of the{' '}
              <a href="https://www.broadinstitute.org/fungal-genome-initiative" target="_blank" rel="noopener noreferrer">
                Fungal Genome Initiative
              </a>{' '}
              (FGI).
            </li>

            <li>
              <a href="https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_014636115.1/" target="_blank" rel="noopener noreferrer">
                <em>Candida lusitaniae</em> (<em>Clavispora lusitaniae</em>)
              </a>{' '}
              genome project<br />
              The <em>C. lusitaniae</em> genome was originally sequenced at the Broad Institute as part of the{' '}
              <a href="https://www.broadinstitute.org/fungal-genome-initiative" target="_blank" rel="noopener noreferrer">
                Fungal Genome Initiative
              </a>{' '}
              (FGI). A more recent sequencing and assembly was performed by the US Food and Drug Administration, published in{' '}
              <a href="https://pubmed.ncbi.nlm.nih.gov/31346170/" target="_blank" rel="noopener noreferrer">
                Sichtig et al., 2019
              </a>.
            </li>

            <li>
              <a href="https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_000182765.1/" target="_blank" rel="noopener noreferrer">
                <em>Candida parapsilosis</em> CDC317
              </a>{' '}
              genome project<br />
              Deposited at NCBI by the{' '}
              <a href="http://www.sanger.ac.uk/" target="_blank" rel="noopener noreferrer">
                Sanger Institute
              </a>.
            </li>

            <li>
              <a href="https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_000006335.3/" target="_blank" rel="noopener noreferrer">
                <em>Candida tropicalis</em> MYA-3404
              </a>{' '}
              genome project<br />
              The <em>C. tropicalis</em> genome was sequenced at the Broad Institute as part of the{' '}
              <a href="https://www.broadinstitute.org/fungal-genome-initiative" target="_blank" rel="noopener noreferrer">
                Fungal Genome Initiative
              </a>{' '}
              (FGI). A more recent sequencing and assembly was performed by{' '}
              <a href="https://pubmed.ncbi.nlm.nih.gov/32469306/" target="_blank" rel="noopener noreferrer">
                Guin et al., 2020
              </a>.
            </li>
          </ul>
        </div>

        <div className="info-section" id="candida">
          <h2><em>Candida</em> Species Comparisons</h2>

          <ul>
            <li>
              <a href="https://pubmed.ncbi.nlm.nih.gov/19465905/" target="_blank" rel="noopener noreferrer">
                Butler et al. (2009)
              </a>
              —Supplementary data for eight <em>Candida</em> genomes includes genome characteristics
              (size, telomeres, centromeres, retrotransposons and repeats, CUG usage, SNPs, etc.),
              phylogeny, gene families and function (pathogenesis-associated gene families, cell wall,
              stress response, mating and meiosis, etc.), cross-species comparisons (alignments, synteny).
              Data are available for download as supplementary material associated with the paper.
            </li>

            <li>
              <a href="http://publicwiki.candidagenome.org/index.php?title=Main_Page" target="_blank" rel="noopener noreferrer">
                CGD Public Wiki
              </a>
              —Contains seminal <em>Candida</em> papers, strain information, and species comparisons by
              topic such as codon usage, filamentation style, mitochondrial genomes, and more.
            </li>
          </ul>
        </div>

        <div className="info-section" id="comparative-genomics">
          <h2>Resources for Fungal Comparative Genomics</h2>

          <ul>
            <li>
              <a href="https://fungi.ensembl.org" target="_blank" rel="noopener noreferrer">
                Ensembl Fungi
              </a>
              —genome browsers and comparative genomics for fungal species.
            </li>

            <li>
              <a href="https://mycocosm.jgi.doe.gov" target="_blank" rel="noopener noreferrer">
                JGI MycoCosm
              </a>
              —fungal genomics portal with genome sequences and comparative tools.
            </li>

            <li>
              <a href="https://fungidb.org" target="_blank" rel="noopener noreferrer">
                FungiDB
              </a>
              —integrated genomic and functional genomic data for fungi (may require a subscription for access).
            </li>
          </ul>
        </div>

        <div className="info-section" id="laboratory">
          <h2>Resources for Laboratory Research</h2>

          <ul>
            <li>
              <a href="https://www.fgsc.net/" target="_blank" rel="noopener noreferrer">
                Fungal Genetics Stock Center
              </a>
              —strain and plasmid repository.
            </li>

            <li>
              <a href="http://www.fgsc.net/candida/FGSCcandidaresources.htm" target="_blank" rel="noopener noreferrer">
                <em>Candida</em> collections at the Fungal Genetics Stock Center
              </a>
              —Request strains from several different mutant collections.
            </li>

            <li>
              <a href="https://www.eucast.org/" target="_blank" rel="noopener noreferrer">
                EUCAST
              </a>
              —antifungal methodology.
            </li>

            <li>
              <a href="https://clsi.org/" target="_blank" rel="noopener noreferrer">
                Clinical and Laboratory Standards Institute
              </a>
              —antifungal methodology.
            </li>

            <li>
              <a href="http://dshb.biology.uiowa.edu/" target="_blank" rel="noopener noreferrer">
                Developmental Studies Hybridoma Bank
              </a>
              —Collection of hybridomas and their antibodies that in the future will include DSHB-Microbe,
              a collection of antibodies against <em>C. albicans</em> antigens and those of other microbial pathogens.
            </li>
          </ul>
        </div>

        <div className="info-section" id="tools">
          <h2>Analysis Tools</h2>

          <ul>
            <li>
              <a href="https://yeastract-plus.org/pathoyeastract/" target="_blank" rel="noopener noreferrer">
                PathoYeastract
              </a>
              —Pathogenic Yeast Search for Transcriptional Regulators And Consensus Tracking is a curated
              repository of all known regulatory associations between transcription factors (TF) and target genes
              in pathogenic <em>Candida</em> species, based on hundreds of bibliographic references. Includes{' '}
              <em>C. albicans</em>, <em>C. glabrata</em>, <em>C. auris</em>, <em>C. parapsilosis</em>, and{' '}
              <em>C. tropicalis</em>. Described in{' '}
              <a href="https://www.ncbi.nlm.nih.gov/pubmed/27625390" target="_blank" rel="noopener noreferrer">
                Monteiro et al., 2017
              </a>.
            </li>

            <li>
              <a href="https://bio.tools/fungifun" target="_blank" rel="noopener noreferrer">
                FungiFun2
              </a>
              —Online resource that assigns functional annotations to lists of fungal genes or proteins based on
              different classification methods (Gene Ontology, Functional Catalog, KEGG) and performs an enrichment
              analysis to identify significantly enriched pathways or processes. Described in{' '}
              <a href="https://www.ncbi.nlm.nih.gov/pubmed/25294921" target="_blank" rel="noopener noreferrer">
                Priebe et al., 2015
              </a>.
            </li>

            <li>
              <a href="https://fungifun3.hki-jena.de/" target="_blank" rel="noopener noreferrer">
                FungiFun3
              </a>
              —Rewritten tools for analysis of differential gene expression. Described in{' '}
              <a href="https://pubmed.ncbi.nlm.nih.gov/39576688/" target="_blank" rel="noopener noreferrer">
                Garcia Lopez et al., 2024
              </a>.
            </li>

            <li>
              <a href="http://calbicans.mlst.net/" target="_blank" rel="noopener noreferrer">
                <em>C. albicans</em> Multilocus Sequence Typing (MLST)
              </a>
              —Tools for strain typing and epidemiology, hosted at Imperial College London, and described in{' '}
              <a href="https://pubmed.ncbi.nlm.nih.gov/11923347/" target="_blank" rel="noopener noreferrer">
                M.-E. Bougnoux et al., 2003
              </a>.
            </li>

            <li>
              <a href="https://services.healthtech.dtu.dk/" target="_blank" rel="noopener noreferrer">
                Bioinformatics Analysis Tools
              </a>
              —Extensive set of tools listed at the Department of Health Technology of the Technical University of Denmark.
              Gene-finding and splice sites, genomic epidemiology, immunological features, post-translational modifications,
              protein structure and sorting predictions, numerous datasets, and more.
            </li>

            <li>
              <a href="https://neuinfo.org/data/record/nlx_144509-1/RRID:SCR_003077/resolver/pdf&i=rrid:scr_003077" target="_blank" rel="noopener noreferrer">
                Multi-genome Analysis of Positions and Patterns of Elements of Regulation (MAPPER)
              </a>
              —Tools for prediction of transcription factor binding sites in human, mouse, and fly. Original reference is{' '}
              <a href="https://pubmed.ncbi.nlm.nih.gov/15799782/" target="_blank" rel="noopener noreferrer">
                Marinescu et al., 2005
              </a>
              , most recent updates published by the{' '}
              <a href="https://neuinfo.org/" target="_blank" rel="noopener noreferrer">
                Neuroscience Information Framework
              </a>.
            </li>

            <li>
              <a href="https://www.yeastgenome.org/blast-fungal" target="_blank" rel="noopener noreferrer">
                Fungal Genomes BLAST at SGD
              </a>
              —BLAST search for sequence similarity within fungal genomes, provided by the <em>Saccharomyces</em> Genome Database.
            </li>
          </ul>
        </div>

        <div className="info-section" id="medical">
          <h2>Medical Mycology Resources</h2>

          <ul>
            <li>
              <a href="http://www.nlm.nih.gov/medlineplus/candidiasis.html" target="_blank" rel="noopener noreferrer">
                Candidiasis Information at Medline Plus
              </a>
              <br />
              Medical information about candidiasis.
            </li>
          </ul>
        </div>

        <div className="info-section" id="fungal">
          <h2>Other Fungal Genome Databases</h2>

          <ul>
            <li>
              <a href="http://www.yeastgenome.org/" target="_blank" rel="noopener noreferrer">
                <em>Saccharomyces</em> Genome Database
              </a>
              —Genome, gene, and protein information for the model yeast <em>Saccharomyces cerevisiae</em>.
            </li>

            <li>
              <a href="https://www.broadinstitute.org/fungal-genome-initiative/cryptococcus-neoformans-serotype-genome-project" target="_blank" rel="noopener noreferrer">
                <em>Cryptococcus neoformans</em> genome project
              </a>
              —Genome sequencing efforts for the fungal pathogen <em>C. neoformans</em> at the Broad Institute{' '}
              <a href="https://www.broadinstitute.org/fungal-genome-initiative" target="_blank" rel="noopener noreferrer">
                Fungal Genome Initiative
              </a>.
            </li>

            <li>
              <a href="https://www.aspergillus.org.uk/" target="_blank" rel="noopener noreferrer">
                The Aspergillus Website
              </a>
              —Database with genomic information on the fungal pathogen <em>Aspergillus fumigatus</em> and clinical information on aspergillosis.
            </li>

            <li>
              <a href="http://www.broad.mit.edu/annotation/fungi/aspergillus/" target="_blank" rel="noopener noreferrer">
                <em>Aspergillus nidulans</em> genome project
              </a>
              —Home page for the <em>A. nidulans</em> genome project at the Broad Institute, part of the{' '}
              <a href="https://www.broadinstitute.org/fungal-genome-initiative" target="_blank" rel="noopener noreferrer">
                Fungal Genome Initiative
              </a>.
            </li>

            <li>
              <a href="https://www.broadinstitute.org/scientific-community/science/projects/fungal-genome-initiative/magnaporthe-comparative-genomics-proj" target="_blank" rel="noopener noreferrer">
                <em>Magnaporthe</em> comparative genomics
              </a>
              —Home page for the <em>M. grisea</em> genome project at the Broad Institute,{' '}
              <a href="https://www.broadinstitute.org/fungal-genome-initiative" target="_blank" rel="noopener noreferrer">
                Fungal Genome Initiative
              </a>.
            </li>

            <li>
              <a href="https://www.pombase.org/" target="_blank" rel="noopener noreferrer">
                <em>Schizosaccharomyces pombe</em> PomBase
              </a>
              —Comprehensive, curated, connected genomic, genetic and molecular data for <em>Schizosaccharomyces pombe</em>.
            </li>

            <li>
              <a href="https://neurospora.org/resources/" target="_blank" rel="noopener noreferrer">
                <em>Neurospora</em> Resources
              </a>
              —An information resource for the <em>Neurospora</em> community.
            </li>

            <li>
              <a href="http://www.fgsc.net/" target="_blank" rel="noopener noreferrer">
                Fungal Genetics Stock Center
              </a>
              —General fungal information, focusing on filamentous fungi; has links to many fungal genome projects.
            </li>
          </ul>
        </div>

        <div className="info-section" id="other">
          <h2>Other Resources</h2>

          <ul>
            <li>
              <a href="https://www.ncbi.nlm.nih.gov/genbank/submit/" target="_blank" rel="noopener noreferrer">
                GenBank
              </a>
              —Sequence repository at the{' '}
              <a href="http://www.ncbi.nlm.nih.gov/" target="_blank" rel="noopener noreferrer">
                NCBI
              </a>
              , Bethesda, Maryland, USA.
            </li>

            <li>
              <a href="https://www.ebi.ac.uk/" target="_blank" rel="noopener noreferrer">
                EMBL-EBI
              </a>
              —Sequence repository and numerous analytics tools at the European Bioinformatics Institute (EBI), Hinxton Hall, Cambridge, UK.
            </li>

            <li>
              <a href="https://www.ddbj.nig.ac.jp/index-e.html" target="_blank" rel="noopener noreferrer">
                DDBJ
              </a>
              —Sequence repository at Mishima, Japan.
            </li>

            <li>
              <a href="http://www.genepalette.org/index.html" target="_blank" rel="noopener noreferrer">
                GenePalette
              </a>
              —Software application, freely available to academic users, for visualizing annotated features and other sequence elements in GenBank sequences.
            </li>

            <li>
              <a href="https://alphafold.ebi.ac.uk/" target="_blank" rel="noopener noreferrer">
                AlphaFold Protein Structure Database
              </a>
              —Program for protein structure prediction, from the Protein Design Group at{' '}
              <a href="https://www.ebi.ac.uk/" target="_blank" rel="noopener noreferrer">
                EMBL-EBI
              </a>.
            </li>

            <li>
              <a href="http://www.geneontology.org/" target="_blank" rel="noopener noreferrer">
                Gene Ontology
              </a>
              —Gene Ontology (GO) Consortium home page.
            </li>

            <li>
              <a href="http://www.genome.ad.jp/kegg/" target="_blank" rel="noopener noreferrer">
                KEGG
              </a>
              —Metabolic reactions and pathways from Kyoto University, Kyoto, Japan.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExternalResourcesPage;
