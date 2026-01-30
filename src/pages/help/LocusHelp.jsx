import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

function LocusHelp() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>CGD Help: Locus Page</h1>
        <hr />

        <div className="info-section">
          <h2>Contents</h2>
          <ul>
            <li><a href="#organization">Organization of the Locus page</a></li>
            <li><a href="#basic">Basic Information</a></li>
            <li><a href="#resources">Resources</a></li>
            <li><a href="#additional">Additional Information</a></li>
          </ul>
        </div>

        <hr />

        <div className="info-section">
          <h2 id="organization">Organization of the Locus Page</h2>
          <p>
            The CGD locus page is divided into three sections: <strong>BASIC INFORMATION</strong>,{' '}
            <strong>RESOURCES</strong>, and <strong>ADDITIONAL INFORMATION</strong>, as described below.
          </p>
        </div>

        <div className="info-section">
          <h3 id="basic">Basic Information</h3>
          <p>
            The <strong>Basic Information</strong> section lists any names and aliases (synonyms, including
            allele names) for a particular locus, and indicates whether a name is standard or reserved.
            Additional information about gene names in CGD (including explanation of the standard format,
            systematic name format, and other gene identifiers used) may be found on the{' '}
            <Link to="/nomenclature">Nomenclature page</Link>. The <strong>Basic Information</strong> Section
            also includes the following additional information:
          </p>

          <ul>
            <li>
              <strong>Feature Type:</strong> The Feature Type section indicates what sort of gene or other
              genetic element resides on this chromosomal sequence (e.g., ORF, tRNA, or CEN). Information
              about the changes to ORFs from one genome assembly to the next is no longer displayed in this
              section; this information has moved to the Locus History. ORFs and noncoding RNA genes are
              assigned the additional qualifiers, Verified, Uncharacterized, or Dubious. Features are
              labeled as Verified if there is experimental characterization that indicates that a functional
              gene product is produced (as defined by curated Gene Ontology terms with experimental evidence
              codes). Uncharacterized ORFs or RNA genes do not currently have curated experimental
              characterization. Dubious genes are unlikely to encode a product, as they appear
              indistinguishable from random non-coding sequence based on comparative analysis.
            </li>
            <li>
              <strong>Description:</strong> A concise summary of the biological role and molecular function
              of the gene, and any other particularly salient information. Genes without experimental
              characterization may have descriptions that discuss orthology to genes in other organisms.
            </li>
            <li>
              <strong>Ortholog(s) and Best Hits:</strong> This section provides ortholog and best hit
              mappings. Please note, regarding the issue of orthology and shared function: We use the
              standard evolutionary definition of orthology: genes descended from a common ancestral gene
              sequence. This definition does not require that the genes are functionally equivalent after
              the speciation event, although it will often be the case.
            </li>
            <li>
              <strong>
                <a
                  href="http://www.yeastgenome.org/help/gotutorial.html#What"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Gene Ontology
                </a>{' '}
                (GO) Annotations: Molecular Function, Biological Process, and Cellular Component:
              </strong>{' '}
              The GO annotations describe a gene's molecular functions, its role in biological processes, and
              its presence in cellular components or complexes. Each annotation links to a page showing all
              genes annotated to the term in CGD. The GO annotations use a controlled vocabulary that allow
              powerful searches within CGD and across other databases.
            </li>
            <li>
              <strong>Mutant Phenotype:</strong> The Phenotype field lists the mutant phenotype for the gene.
              The "Phenotype" tab and "Phenotype details and references" links display a page with additional
              information about the phenotypes, including references and additional notes.
            </li>
            <li>
              <strong>
                <Link to="/help/biochem-pathways">Pathways</Link>:
              </strong>{' '}
              The Pathways field lists any biochemical pathways in which the gene product is predicted to
              participate. Each pathway name is hyperlinked to the corresponding pathway diagram.
            </li>
            <li>
              <strong>Sequence Information:</strong> The Sequence Information field indicates the location of
              the gene in the genome. The coordinates of each exon and intron are listed, with the relative
              position of these regions with respect to the feature, and to the chromosome.
            </li>
            <li>
              <strong>Contig Location(s):</strong> The Contig Location field lists the name of the contig (in
              Contig19 nomenclature, from Assembly 19 of the genomic sequence) and the base pair coordinates
              within the contig at which each allele resides.
            </li>
            <li>
              <strong>External Links:</strong> This field provides links to other information sources for the
              gene, including UniProt/Swiss-Prot, Entrez Gene, Entrez RefSeq Nucleotide, and other databases.
            </li>
            <li>
              <strong>Primary CGDID:</strong> This is an identifier that has been assigned to the locus at CGD.
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h3 id="resources">Resources</h3>
          <p>
            The Resources section provides resources for analysis and additional information retrieval for a
            particular gene. The Resources section has the following information retrieval options:
          </p>

          <ul>
            <li>
              <strong>GBrowse Genome Browser:</strong> Allows you to view and navigate chromosome or contig
              sequences. GBrowse may be accessed using the GBrowse map thumbnail views or the links in the
              Sequence Information section.
            </li>
            <li>
              <strong>Literature:</strong>
              <ul>
                <li>
                  <strong>Literature Guide:</strong> retrieves CGD's{' '}
                  <Link to="/help/literature-topics">Literature Guide</Link> page, which organizes papers
                  about a gene by various topics.
                </li>
                <li>
                  <strong>Full-text lit. search, gene name(s):</strong> links to the Textpresso tool with the
                  search box pre-filled with the standard and systematic name of the gene.
                </li>
                <li>
                  <strong>PubMed Search:</strong> searches PubMed for papers that mention a locus (or its
                  aliases) as well as <em>Candida albicans</em>.
                </li>
                <li>
                  <strong>Search Google Scholar:</strong> searches{' '}
                  <a
                    href="http://scholar.google.com/schhp?hl=en&lr="
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google Scholar
                  </a>{' '}
                  for papers that mention a locus (or its aliases) as well as "<em>albicans</em>."
                </li>
                <li>
                  <strong>Search NCBI:</strong> searches{' '}
                  <a
                    href="http://www.ncbi.nlm.nih.gov/sites/gquery"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Entrez at NCBI
                  </a>{' '}
                  for papers that mention a locus (or its aliases) as well as "<em>albicans</em>."
                </li>
              </ul>
            </li>
            <li>
              <strong>Retrieve Sequences:</strong> Retrieves, for the gene in Assembly 21, or for each allele
              in Assembly 19, the Genomic DNA (with introns), the Exons-only Sequence, the Genomic DNA with 1
              kb of flanking sequence upstream and downstream of the gene, or the ORF translation. For more
              details about the sequence datasets, please see the{' '}
              <Link to="/help/sequence">Sequence Documentation</Link> page.
            </li>
            <li>
              <strong>Sequence Analysis Tools:</strong>
              <ul>
                <li>
                  <strong>BLAST options:</strong> Allow comparison of the genomic, coding, or ORF translation
                  sequence to various <em>C. albicans</em> sequence datasets. For more detailed instructions
                  for use of the BLAST tool, please see the <Link to="/help/blast">BLAST Search Help</Link>{' '}
                  page.
                </li>
                <li>
                  <strong>Design Primers:</strong> Recommends primers appropriate for either PCR or
                  sequencing of a given sequence, within configurable parameters. For more information about
                  this tool, please see the <Link to="/help/webprimer">Web Primer</Link> tool help page.
                </li>
                <li>
                  <strong>Restriction Fragment Map:</strong> Generates a restriction map of a specified DNA
                  sequence. For more information about this tool, please see the{' '}
                  <Link to="/help/restriction-map">Restriction Analysis</Link> tool help page.
                </li>
              </ul>
            </li>
            <li>
              <strong>Maps and Displays:</strong> The Flanking Features Table provides a tabular view of the
              other nearby features (ORFs, etc.) on the Assembly 21 chromosome, with brief descriptions of
              each neighboring feature and links to additional resources and information.
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h3 id="additional">Additional Information</h3>
          <p>
            The Additional Information section has links to pages and features in CGD that provide further
            information about a locus.
          </p>

          <ul>
            <li>
              <strong>Locus History link and the Locus History tab:</strong> retrieve notes about the locus,
              including information about ways in which the sequence or annotation has changed from one
              genome sequence assembly to the next. The Locus History may also alert the user to
              contradictory information in the literature or to potentially confusing gene names.
            </li>
            <li>
              <strong>Gene/Sequence Resources:</strong> tools for sequence display and analysis. For more
              detail, please see the <Link to="/help/gs-resources">Gene/Sequence Resource</Link> help
              document.
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h3>Locus Summary Notes</h3>
          <p>
            The Summary Paragraph section is displayed on some Locus Summary Pages. It contains a brief
            overview of published information regarding a locus, composed by CGD curators. Gene Summary
            Paragraphs contain references and may link to further information.
          </p>
        </div>

        <div className="info-section">
          <h3>References Cited on this Page</h3>
          <p>
            This section lists the references used to curate information displayed in the Standard Name,
            Alias, Description, Name Description, and the Summary Paragraph fields. Note that this section is
            not a comprehensive listing of publications relevant to this gene. To retrieve a list of all
            publications annotated to this gene, select the "Literature" tab at the top of the page.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LocusHelp;
