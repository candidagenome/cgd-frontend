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
            <li><a href="#genomes"><em>Candida</em> Genomes</a></li>
            <li><a href="#candida"><em>Candida</em> Resources</a></li>
            <li><a href="#tools">Analysis Tools</a></li>
            <li><a href="#research">Research Tools</a></li>
            <li><a href="#medical">Medical Mycology Resources</a></li>
            <li><a href="#fungal">Other Fungal Information</a></li>
            <li><a href="#other">Other Resources</a></li>
            <li><a href="#papers">CGD Papers</a></li>
          </ul>
        </nav>

        <div className="info-section" id="genomes">
          <h2><em>Candida</em> Genomes</h2>

          <p><strong><em>Candida albicans</em> strain SC5314 genome sequence</strong></p>
          <p>
            <strong>Assembly 19:</strong> The <em>C. albicans</em> strain SC5314 genome sequence and diploid contig-level assembly by the <a href="http://www-sequence.stanford.edu/group/candida/" target="_blank" rel="noopener noreferrer">Stanford Genome Technology Center</a> was published in Jones et al. (2004). <a href="http://www.pnas.org/cgi/content/full/101/19/7329" target="_blank" rel="noopener noreferrer">View the A19 paper</a> and download the <a href="http://genome-www.stanford.edu/candida-pnas2004-supplement/" target="_blank" rel="noopener noreferrer">A19 supplementary information and sequence files</a> or the original <Link to="/download/sequence/C_albicans_SC3514/Assembly19/SC3514_traces/">A19 sequence trace files</Link>. (The construction of the sequencing library and sequencing methods are described in <a href="http://www.pubmedcentral.nih.gov/articlerender.fcgi?tool=pubmed&pubmedid=11248064" target="_blank" rel="noopener noreferrer">Tzung et al. (2001)</a>.)
          </p>
          <p>
            <strong>Assembly 21:</strong> The haploid chromosomal-level Assembly 21 reference sequence is described in <a href="http://genomebiology.com/2007/8/4/R52" target="_blank" rel="noopener noreferrer">van het Hoog et al. (2007)</a>.
          </p>

          <p>
            <a href="http://www.broad.mit.edu/annotation/genome/candida_albicans/Home.html" target="_blank" rel="noopener noreferrer"><em>Candida albicans</em> strain WO-1</a> genome project<br />
            <small>The genome of <em>C. albicans</em> strain WO-1, sequenced at the Broad Institute as part of the <a href="http://www.broad.mit.edu/annotation/fgi/" target="_blank" rel="noopener noreferrer">Fungal Genome Initiative</a> (FGI).</small>
          </p>

          <p>
            <a href="http://www.sanger.ac.uk/Projects/C_albicans/" target="_blank" rel="noopener noreferrer"><em>Candida albicans</em> strain 1161</a> genome project<br />
            <small>Home page for <em>C. albicans</em> strain 1161 sequencing at the <a href="http://www.sanger.ac.uk/" target="_blank" rel="noopener noreferrer">Sanger Institute</a>.</small>
          </p>

          <p>
            <a href="http://www.sanger.ac.uk/sequencing/Candida/dubliniensis/" target="_blank" rel="noopener noreferrer"><em>Candida dubliniensis</em></a> genome project<br />
            <small>Home page for <em>C. dubliniensis</em> sequencing at the <a href="http://www.sanger.ac.uk/" target="_blank" rel="noopener noreferrer">Sanger Institute</a>.</small>
          </p>

          <p>
            <a href="http://cbi.labri.u-bordeaux.fr/Genolevures/elt/CAGL" target="_blank" rel="noopener noreferrer"><em>Candida glabrata</em></a> genome project<br />
            <small>A sequencing project of the <a href="http://cbi.labri.fr/Genolevures/about.php#consortium" target="_blank" rel="noopener noreferrer">Genolevures Consortium</a>.</small>
          </p>

          <p>
            <a href="http://www.broad.mit.edu/annotation/genome/candida_guilliermondii/Home.html" target="_blank" rel="noopener noreferrer"><em>Candida guilliermondii</em></a> genome project<br />
            <small>The <em>C. guilliermondii</em> genome, sequenced at the Broad Institute as part of the <a href="http://www.broad.mit.edu/annotation/fgi/" target="_blank" rel="noopener noreferrer">Fungal Genome Initiative</a> (FGI).</small>
          </p>

          <p>
            <a href="http://www.broad.mit.edu/annotation/genome/candida_lusitaniae/Home.html" target="_blank" rel="noopener noreferrer"><em>Candida lusitaniae</em></a> genome project<br />
            <small>The <em>C. lusitaniae</em> genome, sequenced at the Broad Institute as part of the <a href="http://www.broad.mit.edu/annotation/fgi/" target="_blank" rel="noopener noreferrer">Fungal Genome Initiative</a> (FGI).</small>
          </p>

          <p>
            <a href="http://www.sanger.ac.uk/sequencing/Candida/parapsilosis/" target="_blank" rel="noopener noreferrer"><em>Candida parapsilosis</em></a> genome project<br />
            <small>Home page for <em>C. parapsilosis</em> sequencing at the <a href="http://www.sanger.ac.uk/" target="_blank" rel="noopener noreferrer">Sanger Institute</a>.</small>
          </p>

          <p>
            <a href="http://www.broad.mit.edu/annotation/genome/candida_tropicalis/Home.html" target="_blank" rel="noopener noreferrer"><em>Candida tropicalis</em></a> genome project<br />
            <small>The <em>C. tropicalis</em> genome, sequenced at the Broad Institute as part of the <a href="http://www.broad.mit.edu/annotation/fgi/" target="_blank" rel="noopener noreferrer">Fungal Genome Initiative</a> (FGI).</small>
          </p>

          <p>
            <strong><em>Candida</em> Genome Comparisons</strong><br />
            <small>Supplementary data from Butler et al. (2009) for eight <em>Candida</em> genomes. Includes genome characteristics (size, telomeres, centromeres, retrotransposons and repeats, CUG usage, SNPs, etc.), phylogeny, gene families and function (pathogenesis-associated gene families, cell wall, stress response, mating and meiosis, etc.), cross-species comparisons (alignments, synteny). Data are available for download as <a href="http://www.ncbi.nlm.nih.gov/pmc/articles/PMC2834264/?tool=pubmed" target="_blank" rel="noopener noreferrer">supplementary material</a> associated with the paper, and from the <a href="http://www.broadinstitute.org/annotation/genome/candida_group/MultiDownloads.html" target="_blank" rel="noopener noreferrer">Broad Institute website</a>.</small>
          </p>
        </div>

        <div className="info-section" id="candida">
          <h2><em>Candida</em> Resources</h2>

          <p>
            <a href="http://candida.bri.nrc.ca/candida/index.cfm" target="_blank" rel="noopener noreferrer"><em>Candida albicans</em> pages at the NRC-BRI</a><br />
            <small>Genomic information and tools from the Biotechnology Research Institute (National Research Council, Canada). View Assembly 21 of the <em>C. albicans</em> genome sequence and search the annotation of Assembly 19 generated by the Annotation Working Group, described in the publication by <a href="http://genetics.plosjournals.org/perlserv/?request=get-document&doi=10.1371/journal.pgen.0010001" target="_blank" rel="noopener noreferrer">Braun et al., 2005</a>.</small>
          </p>

          <p>
            <a href="http://genodb.pasteur.fr/cgi-bin/WebObjects/CandidaDB" target="_blank" rel="noopener noreferrer">CandidaDB</a><br />
            <small>Genomic database for <em>C. albicans</em> and related species, part of the Galar Fungail Consortium project. The previous version of <a href="http://genolist.pasteur.fr/CandidaDB/" target="_blank" rel="noopener noreferrer">CandidaDB</a> is described in the publication by <a href="http://nar.oxfordjournals.org/cgi/content/full/33/suppl_1/D353" target="_blank" rel="noopener noreferrer">d'Enfert et al., 2005</a>.</small>
          </p>

          <p>
            <a href="http://albicansmap.ahc.umn.edu/" target="_blank" rel="noopener noreferrer">Institute for <em>Candida</em> experimentation at the University of Minnesota</a><br />
            <small>Database containing physical map data and other molecular biology information.</small>
          </p>

          <p>
            <a href="http://pubmlst.org/" target="_blank" rel="noopener noreferrer">Multi Locus Sequence Typing (MLST)</a><br />
            <small>Multi Locus Sequence Typing (MLST) schemes and isolate databases for <a href="http://pubmlst.org/calbicans" target="_blank" rel="noopener noreferrer"><em>C. albicans</em></a>, <a href="http://pubmlst.org/cglabrata" target="_blank" rel="noopener noreferrer"><em>C. glabrata</em></a>, <a href="http://pubmlst.org/ckrusei" target="_blank" rel="noopener noreferrer"><em>C. krusei</em></a>, and <a href="http://pubmlst.org/ctropicalis" target="_blank" rel="noopener noreferrer"><em>C. tropicalis</em></a> are available from <a href="http://pubmlst.org/" target="_blank" rel="noopener noreferrer">PubMLST.org</a>. The website offers tools for strain typing and epidemiology, as well as extensive, manually curated isolate databases. Sequence data is accepted on the basis of individual sanger sequences as well as whole genome level. The old databases (not curated anymore) are still available. All data have been migrated to PubMLST.org in 2016.</small>
          </p>
        </div>

        <div className="info-section" id="tools">
          <h2>Analysis Tools</h2>

          <p>
            <a href="http://www.pathoyeastract.org" target="_blank" rel="noopener noreferrer">PathoYeastract</a><br />
            <small>PathoYeastract (Pathogenic Yeast Search for Transcriptional Regulators And Consensus Tracking) is a curated repository of all known regulatory associations between transcription factors (TF) and target genes in pathogenic <em>Candida</em> species, based on hundreds of bibliographic references. Currently, it includes <em>C. albicans</em> and <em>C. glabrata</em>, but addition of six more <em>Candida</em> species is under way. Described in <a href="https://www.ncbi.nlm.nih.gov/pubmed/27625390" target="_blank" rel="noopener noreferrer">Monteiro et al., 2017</a>.</small>
          </p>

          <p>
            <a href="https://elbe.hki-jena.de/fungifun/fungifun.php" target="_blank" rel="noopener noreferrer">FungiFun2</a><br />
            <small>Online resource that assigns functional annotations to lists of fungal genes or proteins based on different classification methods (Gene Ontology, Functional Catalog, KEGG) and performs an enrichment analysis to identify significantly enriched pathways or processes, described in <a href="https://www.ncbi.nlm.nih.gov/pubmed/25294921" target="_blank" rel="noopener noreferrer">Priebe et al., 2015</a>.</small>
          </p>

          <p>
            <a href="http://calbicans.mlst.net/" target="_blank" rel="noopener noreferrer"><em>C. albicans</em> Multilocus Sequence Typing (MLST)</a><br />
            <small>Tools for strain typing and epidemiology, hosted at Imperial College London, and described in <a href="http://www.pubmedcentral.gov/articlerender.fcgi?tool=pubmed&pubmedid=14605179" target="_blank" rel="noopener noreferrer">M.-E. Bougnoux et al. (2003)</a>.</small>
          </p>

          <p>
            <a href="http://www.cbs.dtu.dk/biotools/" target="_blank" rel="noopener noreferrer">Bioinformatics</a> and <a href="http://www.cbs.dtu.dk/services/" target="_blank" rel="noopener noreferrer">Sequence Analysis Tools</a><br />
            <small>Tools on the web site of the Center for Biological Sequence Analysis at the Technical University of Denmark. Gene-finding, RNA splicing, protein modification, protein sorting predictions, and more.</small>
          </p>

          <p>
            <a href="http://rsat.scmbb.ulb.ac.be/rsat/" target="_blank" rel="noopener noreferrer">Regulatory Sequence Analysis (RSA) Tools</a><br />
            <small>Tools for analysis of nucleotide sequence patterns in Assembly 19.</small>
          </p>

          <p>
            <a href="http://mapper.chip.org/" target="_blank" rel="noopener noreferrer">Multi-genome Analysis of Positions and Patterns of Elements of Regulation (MAPPER)</a><br />
            <small>Tools for prediction of transcription factor binding sites.</small>
          </p>

          <p>
            <a href="https://www.yeastgenome.org/blast-fungal" target="_blank" rel="noopener noreferrer">Fungal Genomes BLAST at SGD</a><br />
            <small>BLAST search for sequence similarity within fungal genomes, provided by the <em>Saccharomyces</em> Genome Database.</small>
          </p>

          <p>
            <a href="http://www.ncbi.nlm.nih.gov/sutils/genom_table.cgi" target="_blank" rel="noopener noreferrer">Microbial Genomes BLAST at NCBI</a><br />
            <small>BLAST search for sequence similarity within microbial genomes.</small>
          </p>
        </div>

        <div className="info-section" id="research">
          <h2>Research Tools</h2>

          <p>
            <a href="http://www.fgsc.net/candida/FGSCcandidaresources.htm" target="_blank" rel="noopener noreferrer"><em>Candida</em> strains at the Fungal Genetics Stock Center</a><br />
            <small>Request strains from several different mutant collections</small>
          </p>

          <p>
            <a href="http://dshb.biology.uiowa.edu" target="_blank" rel="noopener noreferrer">Developmental Studies Hybridoma Bank</a><br />
            <small>Collection of hybridomas and their antibodies that in the future will include DSHB-Microbe, a collection of antibodies against <em>C. albicans</em> antigens and those of other microbial pathogens.</small>
          </p>
        </div>

        <div className="info-section" id="medical">
          <h2>Medical Mycology Resources</h2>

          <p>
            <a href="http://www.nlm.nih.gov/medlineplus/candidiasis.html" target="_blank" rel="noopener noreferrer">Candidiasis Information at Medline Plus</a><br />
            <small>Medical information about candidiasis.</small>
          </p>
        </div>

        <div className="info-section" id="fungal">
          <h2>Other Fungal Information</h2>

          <p>
            <a href="http://www.yeastgenome.org/" target="_blank" rel="noopener noreferrer"><em>Saccharomyces</em> Genome Database</a><br />
            <small>Genome, gene, and protein information for the model yeast <em>Saccharomyces cerevisiae</em>.</small>
          </p>

          <p>
            <a href="http://cbi.labri.u-bordeaux.fr/Genolevures/elt/DEHA" target="_blank" rel="noopener noreferrer"><em>Debaryomyces hansenii</em></a> genome project<br />
            <small>A sequencing project of the <a href="http://cbi.labri.fr/Genolevures/about.php#consortium" target="_blank" rel="noopener noreferrer">Genolevures Consortium</a>.</small>
          </p>

          <p>
            <a href="http://www.broad.mit.edu/annotation/genome/lodderomyces_elongisporus/Home.html" target="_blank" rel="noopener noreferrer"><em>Lodderomyces elongisporus</em></a> Database<br />
            <small>The <em>Lodderomyces elongisporus</em> genome, sequenced at the Broad Institute as part of the <a href="http://www.broad.mit.edu/annotation/fgi/" target="_blank" rel="noopener noreferrer">Fungal Genome Initiative</a> (FGI).</small>
          </p>

          <p>
            <a href="http://sequence-www.stanford.edu/group/C.neoformans/index.html" target="_blank" rel="noopener noreferrer"><em>Cryptococcus neoformans</em></a> genome project<br />
            <small>Home page of the genome sequencing effort for the fungal pathogen <em>C. neoformans</em> at the <a href="http://med.stanford.edu/sgtc/" target="_blank" rel="noopener noreferrer">Stanford Genome Technology Center</a>.</small>
          </p>

          <p>
            <a href="http://www.aspergillusgenome.org/" target="_blank" rel="noopener noreferrer"><em>Aspergillus</em> Genome Database</a><br />
            <small>Genome, gene, and protein information for <em>Aspergillus nidulans</em>.</small>
          </p>

          <p>
            <a href="http://www.aspergillus.man.ac.uk/indexhome.htm?homepagenew/mainindex.htm~main" target="_blank" rel="noopener noreferrer">The Aspergillus Website</a><br />
            <small>Database with genomic information on the fungal pathogen <em>Aspergillus fumigatus</em> and clinical information on aspergillosis.</small>
          </p>

          <p>
            <a href="http://www.broad.mit.edu/annotation/fungi/aspergillus/" target="_blank" rel="noopener noreferrer"><em>Aspergillus nidulans</em> Database</a><br />
            <small>Home page for the <em>A. nidulans</em> genome project at the Broad Institute, part of the <a href="http://www.broad.mit.edu/annotation/fgi/" target="_blank" rel="noopener noreferrer">Fungal Genome Initiative</a> (FGI).</small>
          </p>

          <p>
            <a href="http://agd.unibas.ch/" target="_blank" rel="noopener noreferrer"><em>Ashbya</em> Genome Database</a><br />
            <small>Genome information for <em>Ashbya gossypii</em>, a hemiascomycete plant pathogen with a small genome that exhibits remarkable synteny with the <em>S. cerevisiae</em> genome.</small>
          </p>

          <p>
            <a href="http://www.broad.mit.edu/annotation/fungi/magnaporthe/" target="_blank" rel="noopener noreferrer"><em>Magnaporthe grisea</em> Database</a><br />
            <small>Home page for the <em>M. grisea</em> genome project at the Broad Institute, part of the <a href="http://www.broad.mit.edu/annotation/fgi/" target="_blank" rel="noopener noreferrer">Fungal Genome Initiative</a> (FGI).</small>
          </p>

          <p>
            <a href="http://www.sanger.ac.uk/Projects/S_pombe/" target="_blank" rel="noopener noreferrer"><em>Schizosaccharomyces pombe</em></a> genome project<br />
            <small>Complete sequence and annotation of the <em>S. pombe</em> ("fission yeast") genome at the <a href="http://www.sanger.ac.uk" target="_blank" rel="noopener noreferrer">Sanger Institute</a>.</small>
          </p>

          <p>
            <a href="http://www.broad.mit.edu/annotation/fungi/neurospora/" target="_blank" rel="noopener noreferrer"><em>Neurospora crassa</em> Database</a><br />
            <small>Home page for the <em>N. crassa</em> genome project at the Broad Institute, part of the <a href="http://www.broad.mit.edu/annotation/fgi/" target="_blank" rel="noopener noreferrer">Fungal Genome Initiative</a> (FGI).</small>
          </p>

          <p>
            <a href="http://www.fgsc.net/" target="_blank" rel="noopener noreferrer">Fungal Genetics Stock Center</a><br />
            <small>General fungal information, focusing on filamentous fungi; has links to many fungal genome projects.</small>
          </p>
        </div>

        <div className="info-section" id="other">
          <h2>Other Resources</h2>

          <p>
            <a href="http://www.ncbi.nlm.nih.gov/Genbank/GenbankSearch.html" target="_blank" rel="noopener noreferrer">GenBank</a><br />
            <small>Sequence repository at the <a href="http://www.ncbi.nlm.nih.gov/" target="_blank" rel="noopener noreferrer">NCBI</a>, Bethesda, Maryland, USA.</small>
          </p>

          <p>
            <a href="http://www.ebi.ac.uk/embl/index.html" target="_blank" rel="noopener noreferrer">EMBL</a><br />
            <small>Sequence repository at the <a href="http://www.ebi.ac.uk/" target="_blank" rel="noopener noreferrer">EBI</a>, Hinxton Hall, Cambridge, UK.</small>
          </p>

          <p>
            <a href="http://www.nig.ac.jp" target="_blank" rel="noopener noreferrer">DDBJ</a><br />
            <small>Sequence repository at Mishima, Japan.</small>
          </p>

          <p>
            <a href="http://www.genepalette.org/index.html" target="_blank" rel="noopener noreferrer">GenePalette</a><br />
            <small>Software application, freely available to academic users, for visualizing annotated features and other sequence elements in GenBank sequences.</small>
          </p>

          <p>
            <a href="http://www.predictprotein.org/" target="_blank" rel="noopener noreferrer">PredictProtein</a><br />
            <small>Program for protein structure prediction, from the Protein Design Group at <a href="http://www.ebi.ac.uk/embl/index.html" target="_blank" rel="noopener noreferrer">EMBL</a>.</small>
          </p>

          <p>
            <a href="http://www.geneontology.org" target="_blank" rel="noopener noreferrer">Gene Ontology</a><br />
            <small>Gene Ontology (GO) Consortium home page.</small>
          </p>

          <p>
            <a href="http://www.genome.ad.jp/kegg/" target="_blank" rel="noopener noreferrer">KEGG</a><br />
            <small>Metabolic reactions and pathways from Kyoto University, Kyoto, Japan.</small>
          </p>

          <p>
            <strong>Nucleic Acids Research Database Issues</strong><br />
            <small>
              Articles about genomic and biological databases. Papers about CGD were published in the{' '}
              <a href="http://nar.oxfordjournals.org/content/vol38/suppl_1/index.dtl" target="_blank" rel="noopener noreferrer">2010</a>,{' '}
              <a href="http://nar.oxfordjournals.org/cgi/content/full/35/suppl_1/D452" target="_blank" rel="noopener noreferrer">2007</a>, and{' '}
              <a href="http://nar.oxfordjournals.org/cgi/content/full/33/suppl_1/D358" target="_blank" rel="noopener noreferrer">2005</a> Database Issues.
            </small>
          </p>
          <p>
            <small>
              Go to NAR Database Issue for:{' '}
              <a href="http://nar.oxfordjournals.org/content/vol38/suppl_1/index.dtl" target="_blank" rel="noopener noreferrer">2010</a> |{' '}
              <a href="http://nar.oxfordjournals.org/content/vol37/suppl_1/index.dtl" target="_blank" rel="noopener noreferrer">2009</a> |{' '}
              <a href="http://nar.oxfordjournals.org/content/vol36/suppl_1/index.dtl" target="_blank" rel="noopener noreferrer">2008</a> |{' '}
              <a href="http://nar.oxfordjournals.org/content/vol35/suppl_1/index.dtl/" target="_blank" rel="noopener noreferrer">2007</a> |{' '}
              <a href="http://nar.oxfordjournals.org/content/vol34/suppl_1/" target="_blank" rel="noopener noreferrer">2006</a> |{' '}
              <a href="http://nar.oxfordjournals.org/content/vol33/suppl_1/" target="_blank" rel="noopener noreferrer">2005</a> |{' '}
              <a href="http://nar.oupjournals.org/content/vol32/suppl_1/" target="_blank" rel="noopener noreferrer">2004</a> |{' '}
              <a href="http://nar.oupjournals.org/content/vol31/issue1/" target="_blank" rel="noopener noreferrer">2003</a> |{' '}
              <a href="http://nar.oupjournals.org/content/vol30/issue1/" target="_blank" rel="noopener noreferrer">2002</a> |{' '}
              <a href="http://nar.oupjournals.org/content/vol29/issue1/" target="_blank" rel="noopener noreferrer">2001</a> |{' '}
              <a href="http://nar.oupjournals.org/content/vol28/issue1/" target="_blank" rel="noopener noreferrer">2000</a> |{' '}
              <a href="http://nar.oupjournals.org/content/vol27/issue1/" target="_blank" rel="noopener noreferrer">1999</a> |{' '}
              <a href="http://nar.oupjournals.org/content/vol26/issue1/" target="_blank" rel="noopener noreferrer">1998</a>
            </small>
          </p>
        </div>

        <div className="info-section" id="papers">
          <h2>CGD Papers</h2>

          <ul className="reference-list">
            <li>
              <small>Skrzypek MS, Arnaud MB, Costanzo MC, Inglis DO, Shah P, Binkley G, Miyasato SR, Sherlock G.</small><br />
              <a href="http://nar.oxfordjournals.org/cgi/content/full/gkp836v1?ijkey=OoP594WLS87oKsQ&keytype=ref" target="_blank" rel="noopener noreferrer">New tools at the <em>Candida</em> Genome Database: biochemical pathways and full-text literature search.</a><br />
              <small>Nucleic Acids Res. 2010 Jan;38(Database issue):D428-32.</small>
            </li>
            <li>
              <small>Arnaud MB, Costanzo MC, Shah P, Skrzypek MS, Sherlock G.</small><br />
              <a href="http://linkinghub.elsevier.com/retrieve/pii/S0966-842X(09)00111-5" target="_blank" rel="noopener noreferrer">Gene Ontology and the annotation of pathogen genomes: the case of <em>Candida albicans</em>.</a><br />
              <small>Trends Microbiol. 2009 Jul 3.</small>
            </li>
            <li>
              <small>Butler G, Rasmussen MD, Lin MF, Santos MA, Sakthikumar S, Munro CA, Rheinbay E, Grabherr M, Forche A, Reedy JL, Agrafioti I, Arnaud MB, Bates S, Brown AJ, Brunke S, Costanzo MC, Fitzpatrick DA, de Groot PW, Harris D, Hoyer LL, Hube B, Klis FM, Kodira C, Lennard N, Logue ME, Martin R, Neiman AM, Nikolaou E, Quail MA, Quinn J, Santos MC, Schmitzberger FF, Sherlock G, Shah P, Silverstein KA, Skrzypek MS, Soll D, Staggs R, Stansfield I, Stumpf MP, Sudbery PE, Srikantha T, Zeng Q, Berman J, Berriman M, Heitman J, Gow NA, Lorenz MC, Birren BW, Kellis M, Cuomo CA.</small><br />
              <a href="http://dx.doi.org/10.1038/nature08064" target="_blank" rel="noopener noreferrer">Evolution of pathogenicity and sexual reproduction in eight <em>Candida</em> genomes.</a><br />
              <small>Nature 459(7247):657-62.</small>
            </li>
            <li>
              <small>Arnaud MB, Costanzo MC, Skrzypek MS, Shah P, Binkley G, Lane C, Miyasato SR, Sherlock G.</small><br />
              <a href="http://nar.oxfordjournals.org/cgi/content/full/35/suppl_1/D452" target="_blank" rel="noopener noreferrer">Sequence resources at the <em>Candida</em> Genome Database.</a><br />
              <small>Nucleic Acids Res. 2007 Jan; 35(Database issue):D452-6.</small>
            </li>
            <li>
              <small>Costanzo MC, Arnaud MB, Skrzypek MS, Binkley G, Lane C, Miyasato SR, Sherlock G.</small><br />
              The <em>Candida</em> Genome Database: Facilitating research on <em>Candida albicans</em> molecular biology.<br />
              <small>FEMS Yeast Res. 2006 Aug;6(5):671-84. <Link to="/contact">Available on request.</Link></small>
            </li>
            <li>
              <small>Arnaud MB, Costanzo MC, Skrzypek MS, Binkley G, Lane C, Miyasato SR, Sherlock G.</small><br />
              <a href="http://nar.oxfordjournals.org/cgi/content/full/33/suppl_1/D358" target="_blank" rel="noopener noreferrer">The <em>Candida</em> Genome Database (CGD), a community resource for <em>Candida albicans</em> gene and protein information.</a><br />
              <small>Nucleic Acids Res. 2005 Jan 1;33(Database issue):D358-63.</small>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExternalResourcesPage;
