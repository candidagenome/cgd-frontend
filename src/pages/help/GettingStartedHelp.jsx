import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

const GettingStartedHelp = () => {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>Getting Started with CGD</h1>
        <hr />

        <blockquote>
          <p>
            This page presents answers to some basic questions that new users might ask about CGD.
            An overview of information about the CGD website can be found on the{' '}
            <Link to="/help">Help Resources</Link> page.
          </p>
        </blockquote>

        <div className="info-section">
          <h2>Contents:</h2>
          <ul>
            <li><a href="#I">What types of information does CGD contain?</a></li>
            <li><a href="#II">How is CGD organized?</a></li>
            <li><a href="#III">How do I find information about a gene or protein of interest in CGD?</a></li>
            <li><a href="#IV">How do I find groups of genes or proteins that share a function, role, or location?</a></li>
            <li><a href="#XIII">How can CGD help me interpret the results of large-scale experiments?</a></li>
            <li><a href="#VI">How can CGD help me design experiments using <em>Candida</em> genes?</a></li>
            <li><a href="#VIII">What services does CGD provide?</a></li>
            <li><a href="#IX">How can I download data in bulk for use in a spreadsheet or other form?</a></li>
            <li><a href="#X">How can CGD help me participate in the <em>Candida</em> research community?</a></li>
            <li><a href="#XI">How can I find out what's new in CGD?</a></li>
            <li><a href="#XII">How can I get more help?</a></li>
          </ul>
        </div>

        <hr style={{ width: '75%', margin: '20px auto' }} />

        <div className="info-section" id="I">
          <h3><strong>What types of information does CGD contain?</strong></h3>
          <p>
            CGD is an organized collection of genetic and molecular biological information about{' '}
            <em>Candida albicans</em>, a yeast that is an opportunistic pathogen of humans, and about
            other <em>Candida</em>-related species, such as <em>Candida glabrata</em>. It contains
            information about genes and proteins; descriptions and classifications of their biological
            roles, molecular functions, and subcellular localizations; gene, protein, and chromosome
            sequence information; tools for analysis and comparison of sequences; and links to
            literature information. The <Link to="/">CGD Home</Link> page is the main entry point for the database.
          </p>
          <p>
            CGD is aimed at scientists; collected information for the non-scientist about{' '}
            <em>Candida albicans</em> and other yeasts can be found at the{' '}
            <a href="http://www.yeastgenome.org/VL-yeast.html" target="_blank" rel="noopener noreferrer">
              Yeast Virtual Library
            </a>. CGD curators cannot answer medical or health-related questions.
          </p>
        </div>

        <div className="info-section" id="II">
          <h3><strong>How is CGD organized?</strong></h3>
          <p>
            An overview of the content and organization of CGD is presented in the{' '}
            <Link to="/sitemap">sitemap</Link>.
          </p>
          <p>
            The basic unit of CGD is the Locus Page (for an example, see{' '}
            <Link to="/locus/rim101"><em>RIM101</em></Link>). Each CGD gene or open reading frame has
            an individual Locus Page. Genetic loci that are not tied to a DNA sequence also have Locus
            Pages. All information relevant to a particular locus is either presented on or linked to
            the Locus Page. Tools for analysis and comparison of the locus are also accessible from the
            Locus Page.
          </p>
          <p>
            Locus pages are accessible by using the <Link to="/search">Search Options</Link> form or by
            using the "Quick Search" box at the top of any CGD Locus or tool page. In addition, gene or
            protein names appearing anywhere in CGD are hyperlinked to the corresponding Locus Page.
          </p>
          <p>
            Many other CGD pages, including tools, documentation, data submission forms, and others, are
            accessible from the <Link to="/">CGD Home</Link> page.
          </p>
        </div>

        <div className="info-section" id="III">
          <h3><strong>How do I find information about a gene or protein of interest in CGD?</strong></h3>
          <p>
            If you know the genetic or systematic name of the gene you are interested in, entering it in
            either the Quick Search box at the top of most CGD pages or in the{' '}
            <Link to="/search">Search Options</Link> form will bring you to that Locus Page (or to a
            list of genes, if the same name has been used for two or more).
          </p>
          <p>
            Sometimes you may need to investigate genes or proteins without knowing their names. You can
            search for a class of similarly named genes using the wildcard character (e.g., searching for
            'sap*' brings up SAP1, SAP2, SAP3...). Or, you can search with the name of a protein (e.g.,
            actin) or protein complex (e.g., cytochrome <em>c</em> oxidase), or a{' '}
            <a href="http://www.geneontology.org/" target="_blank" rel="noopener noreferrer">
              Gene Ontology
            </a>{' '}
            term (see <a href="#IV">next section</a>) to bring up lists of the Locus Pages where this
            text occurs. Each gene name in the hit list resulting from the search is hyperlinked to the
            corresponding Locus Page.
          </p>
          <p>
            The Locus Page is the central clearinghouse for all information specific to that gene and
            tools for its analysis, including:
          </p>
          <ul>
            <li>gene name, synonyms, and systematic name</li>
            <li>
              <a href="http://www.geneontology.org/" target="_blank" rel="noopener noreferrer">
                Gene Ontology (GO)
              </a>{' '}
              annotations
            </li>
            <li>descriptions of the gene and gene product</li>
            <li>phenotype of mutations in the gene</li>
            <li>chromosomal and contig coordinates</li>
            <li>interactive graphical chromosome map and browsing tool</li>
            <li>tools for retrieval and analysis of the gene and protein sequences</li>
            <li>a curated collection of literature</li>
          </ul>
        </div>

        <div className="info-section" id="IV">
          <h3><strong>How do I find groups of genes or proteins that share a function, role, or location?</strong></h3>
          <p>
            Gene products in CGD are classified according to the{' '}
            <a href="http://www.geneontology.org/" target="_blank" rel="noopener noreferrer">
              Gene Ontology (GO)
            </a>{' '}
            system of classification. Gene products are assigned GO terms that describe their molecular
            functions and subcellular locations, and the biological processes in which they are involved.
            The terms may be searched to find the set of proteins that have been annotated to a particular
            term. A detailed explanation of the GO system and how to use and search it is presented in a{' '}
            <a href="http://www.yeastgenome.org/help/gotutorial.html" target="_blank" rel="noopener noreferrer">
              GO tutorial
            </a>{' '}
            provided by the <em>Saccharomyces</em> Genome Database.
          </p>
        </div>

        <div className="info-section" id="XIII">
          <h3><strong>How can CGD help me interpret the results of large-scale experiments?</strong></h3>
          <p>
            Lists of open reading frames and their characteristics are essential for keeping track of the
            results of any large-scale experiment. A variety of different tab-delimited text files
            containing data collected by CGD, listed on the <Link to="/download">Data Download</Link> index
            page, are freely available for downloading.
          </p>
          <p>
            Interpreting the results of functional genomics experiments that identify large groups of genes
            with something in common (e.g., transcriptional coregulation, similar null phenotypes, etc.)
            presents a special challenge in integrating what is known about each gene to find the
            significance of the trends observed. Two tools at CGD facilitate such analysis. The{' '}
            <a href="/cgi-bin/GO/goTermMapper" target="_blank" rel="noopener noreferrer">GO Slim Term Mapper</a>{' '}
            takes a list of genes and displays how many are annotated to each of the parent GO Slim terms,
            allowing visualization of the distribution of the input gene set over broad biological processes,
            biochemical functions, or subcellular localizations. The{' '}
            <a href="/cgi-bin/GO/goTermFinder" target="_blank" rel="noopener noreferrer">GO Term Finder</a> tool
            also takes a list of genes as input, and identifies GO terms shared among members of the group.
            The difference between the two tools is that the GO Slim Term Mapper maps genes to broad parent
            GO terms, while the Term Finder identifies specific, granular terms shared by the group. The SGD{' '}
            <a href="http://www.yeastgenome.org/help/gotutorial.html" target="_blank" rel="noopener noreferrer">
              GO tutorial
            </a>{' '}
            provides details on the use of these tools.
          </p>
        </div>

        <div className="info-section" id="VI">
          <h3><strong>How can CGD help me design experiments using <em>Candida</em> genes?</strong></h3>
          <p>
            The <a href="/cgi-bin/seqTools" target="_blank" rel="noopener noreferrer">Gene/Sequence Resources</a>{' '}
            page presents a versatile array of tools allowing retrieval and analysis of any portion of the
            genome, or analysis of your own input sequence. Sequences may be retrieved from a specific region
            of the genome, given a genetic or systematic name, and may include sequence upstream and/or
            downstream of the region if desired. Alternatively, chromosomal coordinates may be specified to
            retrieve part or all of a chromosome. Finally, the user may start with his/her own input sequence.
            Once a sequence is retrieved or entered, tools allow its analysis in multiple different ways,
            including translation, restriction mapping, BLAST and FASTA analysis, and primer design. The user
            may select a desired format (GCG, FASTA, etc.) for the output of many of the tools. The{' '}
            <a href="/cgi-bin/compute/web-primer/" target="_blank" rel="noopener noreferrer">
              oligonucleotide primer design
            </a>{' '}
            and <Link to="/blast">BLAST analysis</Link> tools are also available as direct links from the
            toolbar at the top of many CGD pages.
          </p>
          <p>
            Additional tools and resources that facilitate sequence analysis and cloning may be accessed from
            the <Link to="/search">Search Options</Link> index page. They include an assortment of search tools,
            including the{' '}
            <a href="/cgi-bin/PATMATCH/nph-patmatch" target="_blank" rel="noopener noreferrer">Pattern Matching</a>{' '}
            tool, which finds short sequences or sequence patterns in nucleotide or protein sequences.
          </p>
        </div>

        <div className="info-section" id="VIII">
          <h3><strong>What services does CGD provide?</strong></h3>
          <p>
            By consensus of the research community, CGD serves as the official arbiter of <em>C. albicans</em>{' '}
            genetic nomenclature and maintains a{' '}
            <a href="/cgi-bin/registry/geneRegistry" target="_blank" rel="noopener noreferrer">gene name registry</a>{' '}
            for new proposed gene names. CGD also maintains a web site for{' '}
            <Link to="/community-news"><em>Candida</em> Community News</Link> and a list of upcoming{' '}
            <Link to="/meetings">conferences</Link>.
          </p>
        </div>

        <div className="info-section" id="IX">
          <h3><strong>How can I download data in bulk for use in a spreadsheet or other form?</strong></h3>
          <p>
            All of CGD's data are freely available to the public for{' '}
            <Link to="/download">download</Link>. The <Link to="/contact">CGD curators</Link> are available
            to assist researchers by creating custom files containing particular data of interest.
          </p>
        </div>

        <div className="info-section" id="X">
          <h3><strong>How can CGD help me participate in the <em>Candida</em> research community?</strong></h3>
          <p>
            Several different kinds of information for the <em>Candida</em> research community are available
            through CGD. You can{' '}
            <a href="/cgi-bin/colleague/colleagueSearch" target="_blank" rel="noopener noreferrer">
              add your contact information
            </a>{' '}
            to CGD's directory of colleagues, which can be <Link to="/search">searched</Link> by last name.
            You can also search or browse a list of{' '}
            <a href="/cache/Labs.html" target="_blank" rel="noopener noreferrer"><em>Candida</em> labs</a>.
            CGD also maintains a list of upcoming <Link to="/meetings">conferences</Link>.
          </p>
        </div>

        <div className="info-section" id="XI">
          <h3><strong>How can I find out what's new in CGD?</strong></h3>
          <p>
            Current information about CGD is displayed on the <Link to="/">CGD Home</Link> page. Additional
            community information is found on the <Link to="/community-news"><em>Candida</em> Community News</Link>{' '}
            page.
          </p>
        </div>

        <div className="info-section" id="XII">
          <h3><strong>How can I get more help?</strong></h3>
          <p>
            All CGD help resources are listed on the <Link to="/help">Help Resources</Link> page. The 'Help'
            button in the upper right corner of each tool and Locus page is linked directly to help
            documentation for that particular page.
          </p>
          <p>
            For more general questions, the <Link to="/faq">Frequently Asked Questions</Link> page is a good
            place to start. It includes common questions from CGD users.
          </p>
          <p>
            The <em>Saccharomyces</em> Genome Database (SGD){' '}
            <a href="http://www.yeastgenome.org/help/glossary.html" target="_blank" rel="noopener noreferrer">
              Glossary
            </a>{' '}
            page lists definitions of genetic, bioinformatic, and other terms used in CGD and in CGD.
          </p>
          <p>
            A tutorial, provided by SGD, is available to illustrate the use of the{' '}
            <a href="http://www.yeastgenome.org/help/gotutorial.html" target="_blank" rel="noopener noreferrer">
              GO tools
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GettingStartedHelp;
