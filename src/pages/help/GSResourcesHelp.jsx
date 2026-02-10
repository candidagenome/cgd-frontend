import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

const GSResourcesHelp = () => {
  return (
    <div className="info-page">
      <h1 className="info-page-title">CGD Help: Gene/Sequence Resources</h1>

      <hr className="info-divider" />

      <div className="info-content-block">
        <h2>Contents</h2>
        <ul>
          <li><a href="#description">Description</a></li>
          <li>
            <strong>Using Gene/Sequence Resources</strong>
            <ul>
              <li><a href="#query">Sequence Query Options</a></li>
              <li><a href="#results">Choose Result to View</a></li>
            </ul>
          </li>
          <li><a href="#coords">Finding Chromosomal Coordinates</a></li>
          <li><a href="#accessing">Accessing Gene/Sequence Resources</a></li>
          <li><a href="#links">Other Relevant Links</a></li>
        </ul>
      </div>

      <hr className="info-divider" />

      <section id="description">
        <h2>Description</h2>
        <p>
          Gene/Sequence Resources (GSR) serves as a central point for accessing much of the
          information available at CGD for a 1) a named DNA sequence, 2) a specified chromosomal
          region or list of regions, or 3) a raw DNA or protein sequence. This information includes
          biological information, table/map displays, and sequence analysis and retrieval options.
          Once you have specified a sequence name or region(s), GSR will present only those options
          which are available for obtaining information about your entry.
        </p>
        <p>
          CGD's Gene/Sequence Resources tool and <Link to="/batch-download">Batch Download</Link>{' '}
          tool both allow you to retrieve sequences in batch for a list of regions. The difference
          between the batch options of these two tools is that GSR retrieves the entire nucleotide
          sequence between the coordinates specified in a list, while Batch Download retrieves only
          the sequences of the features (protein-coding and RNA genes, centromeres, etc.) that are
          annotated within the specified regions.
        </p>
        <p>
          Whenever possible, selecting one of the available options for your entered sequence name
          or region takes you directly to the results for your entered sequence. In other cases, it
          takes you directly to the resource with the sequence already pre-pasted (e.g., BLAST,
          Restriction Analysis). When a list of sequence regions is entered, you will be presented
          with a link allowing you to download a file containing the sequences.
        </p>
      </section>

      <section id="query">
        <h2>Using Gene/Sequence Resources</h2>

        <h3>Pick a Sequence Query Option</h3>
        <p className="info-note">
          <strong>Note:</strong> Only ONE of the options listed below may be filled out at a time
          in order for the submission to be processed.
        </p>
        <p>
          If at any time you decide you would like to <strong>change your selection</strong>, you
          may use the "Reset Form" button found at the bottom of the page to erase your entries.
        </p>
        <p>
          All of the options retrieve the Watson strand (with ascending chromosomal coordinates)
          of the specified gene or region. To retrieve the Crick strand, click the "Use the reverse
          complement" checkbox for that option.
        </p>

        <ul>
          <li>
            <strong>Option 1. Enter a named DNA sequence</strong>
            <p>
              With this input option, you can enter a gene name (e.g., ACT1), ORF name (e.g.,
              orf19.5007), or a CGDID (e.g., CAL0001571). After you've entered the sequence name,
              click the "Submit form" button. Note that you can also enter the first few characters
              of a named DNA sequence followed by the wildcard character (*). Submit the query.
              Queries that match multiple names will return a list of sequences from which you can
              then select a single sequence.
            </p>
            <p>
              You may also retrieve information about <strong>flanking sequences</strong> upstream
              and/or downstream of the entered gene/sequence name. To do this, type the length of
              the flanking region you would like to retrieve in the boxes (upstream and/or
              downstream) below where you entered the sequence name. Note: negative numbers are not
              accepted in these boxes. If you would like to retrieve part of an ORF you should use
              the chromosomal coordinates in retrieval option 2.
            </p>
            <p>
              Select "<strong>Submit form</strong>" to bring up the list of further options
              available for viewing and retrieving information about the named sequence you entered.
            </p>
          </li>

          <li>
            <strong>Option 2a. Pick a chromosome or contig</strong>
            <p>
              This entry option allows you to specify a region by choosing the chromosome number or
              contig name from the pull-down menu and entering <a href="#coords">coordinates</a>, if
              desired. To use this option, simply select a chromosome or contig using the pull-down
              menu, and then enter the left and right chromosomal basepair coordinates in the boxes
              provided below. If no coordinates are entered, the first 100,000 bp of the chromosome
              or contig will be retrieved.
            </p>
            <p>
              This option will retrieve the Watson strand, regardless of the order in which the
              coordinates are entered. If you would like to retrieve or manipulate the reverse
              complement of the sequence, check the "Use the Reverse Complement" box.
            </p>
            <p>
              Select "<strong>Submit form</strong>" to bring up the list of further options
              available for viewing and retrieving information about the sequence you selected.
            </p>
            <p>
              Note that the entire sequences of the chromosomes and contigs are also available for
              download from CGD's{' '}
              <Link to="/download">Sequence Download</Link>{' '}
              directory.
            </p>
          </li>

          <li>
            <strong>Option 2b. Upload a file of chromosome (or contig) regions</strong>
            <p>
              If you would like to retrieve DNA sequences from multiple regions, create a file with
              the tab- or space-separated columns:
            </p>
            <ol>
              <li>chromosome/contig name</li>
              <li>start coordinate</li>
              <li>stop coordinate</li>
            </ol>
            <p>For example:</p>
            <pre className="info-code-block">
{`Ca21chr3_C_albicans_SC5314   1356  20455
Ca21chr4_C_albicans_SC5314  11331  18001
Ca21chr6_C_albicans_SC5314   9856  100010

Contig19-10109     4600    24000
Contig19-10216  200310  220546`}
            </pre>
            <p>
              Sequence coordinates (columns 2 and 3) are optional in this file; if no coordinates
              are present, the first 100,000 nucleotides of the chromosome or contig will be
              retrieved.
            </p>
            <p>
              Use the "Browse" button to locate the file on your computer and click the Submit
              button to upload it. The resulting page presents a link allowing you to download a
              compressed file in FASTA format containing the sequences you requested.
            </p>
          </li>

          <li>
            <strong>Option 3. Type or paste a raw DNA or protein sequence</strong>
            <p>
              This entry option allows you to enter a raw DNA or protein sequence for which you
              would like to retrieve information. First, use the pull-down menu to select the type
              of sequence you would like to enter, DNA or protein. Next, position the cursor in the
              entry box and either type or paste in a sequence.
            </p>
            <p>
              Note that the sequence entered must be provided in <strong>RAW format</strong>,
              without comments (numbers are okay).
            </p>
            <p>
              Select "<strong>Submit form</strong>" to bring up the list of further options
              available for viewing and retrieving information about the named sequence you entered.
            </p>
          </li>
        </ul>
      </section>

      <section id="results">
        <h3>Choose Result to View</h3>
        <p>
          After you submit either 1) a named sequence 2) a chromosomal region or list of regions,
          or 3) a raw DNA or protein sequence, a page is returned that lists all available
          information, displays, analyses, and sequence retrieval options available for the
          sequence. You will choose one of these options. Descriptions for each option are below.{' '}
          <span className="info-note">
            Please note that some of them may not be available for your selected entry, depending
            on the type of sequence you have entered.
          </span>
        </p>
        <p>
          If you decide you would like to change your original selection, hit the button [
          <strong>Change Selection or Coordinates</strong>]. This will bring back the Gene/Sequence
          Resources entry page with your information still filled in. You can then modify and
          re-submit the form.
        </p>

        <h4>a. Biology/Literature</h4>
        <ul>
          <li>
            <strong>Locus info</strong>: This link takes you to the Locus Summary page
            corresponding to the gene or ORF whose name you originally entered, which provides
            information curated from the literature about that gene and its encoded product.
            [<Link to="/help/locus">CGD Help: Locus</Link>]
            <br />
            <em>Availability</em>: This option is available when a gene or ORF name is entered on
            the Gene/Sequence Resources entry page.
          </li>

          <li>
            <strong>Literature Summaries</strong>: This link takes you to the Literature Guide for
            an entered gene or ORF. The Literature Guide is a categorization of journal articles
            about a specific gene or ORF into various biological topics.
            [<Link to="/help/literature-topics">CGD Help: Literature Topics</Link>]
            <br />
            <em>Availability</em>: This option is available when a gene or ORF name is entered on
            the Gene/Sequence Resources entry page.
          </li>
        </ul>

        <h4>b. Display Maps/Tables</h4>
        <ul>
          <li>
            <strong>Genome Browser</strong>: This links to a graphical representation of the genetic
            features of a region of chromosomal DNA around the selected gene or ORF, from which
            the entire chromosome or contig may be navigated.
            [<Link to="/help/jbrowse">CGD Help: JBrowse</Link>]
            <br />
            <em>Availability</em>: This option is available when a gene, ORF, or chromosomal
            region is entered.
          </li>

          <li>
            <strong>Flanking Features Table</strong>: This option links to a table listing the
            sequence features in the same region as the query gene. The name and aliases for each
            feature, the chromosomal coordinates, and feature descriptions are given in the Feature
            Table. Multiple data download options are available. For more information see the
            [<Link to="/help/batch-download">CGD Help: Batch Download</Link>]
            <br />
            <em>Availability</em>: This option is available when a gene, ORF, or chromosomal
            region is entered.
          </li>
        </ul>

        <h4>c. Sequence Analysis</h4>
        <ul>
          <li>
            <strong>BLAST Search</strong>: This links to a CGD BLAST form in which the query
            sequence is already pasted. One can then select the desired dataset and search options,
            and then submit the search form.
            [<Link to="/help/blast">CGD Help: BLAST Searches</Link>]
            <br />
            <em>Availability</em>: This option is available when a gene name, ORF, chromosomal
            region, raw DNA sequence, or raw protein sequence is entered on the Gene/Sequence
            Resources page.
          </li>

          <li>
            <strong>Genome Restriction Map</strong>: This links to the CGD Restriction Analysis
            feature, with the sequence you entered already pasted in. You may then select all or a
            specified set of restriction enzymes with which to generate the Restriction Map.
            [<Link to="/help/restriction-map">CGD Help: Candida Genome Restriction Analysis</Link>]
            <br />
            <em>Availability</em>: This option is available when a gene name, ORF, chromosomal
            region, or raw DNA sequence is entered on the Gene/Sequence Resources page.
          </li>

          <li>
            <strong>Design Primers</strong>: This links to the Web Primer program, with the
            selected DNA sequence already pasted in. This tool locates primers for PCR or
            sequencing of an entered sequence based on specified parameters.
            [<Link to="/help/webprimer">CGD Help: Design Primers</Link>]
            <br />
            <em>Availability</em>: This option is available when a gene name, ORF, chromosomal
            region, or raw DNA sequence is entered on the Gene/Sequence Resources page.
          </li>
        </ul>

        <h4>d. Sequence Retrieval</h4>
        <ul>
          <li>
            <strong>DNA of Region</strong>: Selecting either GCG, FASTA, NoHeader or Decorated
            FASTA brings back the DNA of the selected sequence, including any intron/adjustment/gap
            regions, in whichever of the 4 output formats you select.
            <p>
              The <strong>Decorated FASTA</strong> format is generated by GBrowse and shows
              sequence features by using various color schemes. The following sequence features
              are highlighted with the associated decorations as described below:
            </p>
            <ul>
              <li>Exons of Protein-coding genes: Red font</li>
              <li>Exons of Non-coding genes: Blue font</li>
              <li>5' UTR introns: Underline</li>
              <li>Telomeres and Centromere: Tan background color</li>
              <li>Transposons and Repeats: Grey background color</li>
              <li>SNPs: Bold</li>
            </ul>
            <em>Availability</em>: This option is available when a gene or ORF name or chromosomal
            region is entered on the Gene/Sequence Resources page.
          </li>

          <li>
            <strong>
              Exon(s) only Sequence of selected gene/ORF (without introns/adjustments/gaps)
            </strong>
            : Selecting either GCG, FASTA, NoHeader or Numbered Sequence brings back the DNA of the
            selected sequence, without intron/adjustments/gaps, in whichever of the 4 output formats
            you select.
            <br />
            The <strong>Numbered Sequence</strong> format shows the position of nucleotides within
            the sequence and also includes 200 bp upstream and downstream flanking regions. The core
            portion of the sequence (excluding the flanking regions) is separated by spaces into
            sets of 3 nucleotide bases. The sequence position counting for the flanking and the core
            sequence regions is done separately.
            <br />
            <em>Availability</em>: This option is available when a gene name or ORF is entered on
            the Gene/Sequence Resources entry page.
          </li>

          <li>
            <strong>Protein Translation of ORF</strong>: Selecting either GCG, FASTA, or NoHeader
            brings back the protein translation of the selected gene or ORF sequence (using the
            first reading frame) in whichever of the 3 output formats you select.
            <br />
            <em>Availability</em>: This option is available when a gene or ORF name is entered on
            the Gene/Sequence Resources entry page.
          </li>
        </ul>
      </section>

      <section id="coords">
        <h2>Finding Chromosomal Coordinates</h2>
        <ul>
          <li>
            Chromosomal coordinates for ORFs are found on the Locus pages in the Sequence
            Coordinates section on the left side. The boundaries for introns (if present) and exons
            are listed here.
          </li>
          <li>
            BLASTn reports at CGD generate DNA alignments between similar <em>Candida</em> DNA
            sequences. If you would like to retrieve the sequence of the 'subject' gene, you can
            copy the chromosomal coordinates of the subject sequence from the top of the alignment
            and paste these numbers into the GSR tool. (Remember to note the chromosome!) You can
            also go to the Locus Summary page of the 'subject' gene and get the coordinates there.
          </li>
          <li>
            The Chromosomal Features Table contains a list of sequence features (ORFs, RNA-coding
            genes, centromeres, etc.) and their chromosomal coordinates for a region. For more
            information see the [<Link to="/help/dna-features">CGD Help: Chromosomal Features Table</Link>]
          </li>
        </ul>
      </section>

      <section id="accessing">
        <h2>Accessing Gene/Sequence Resources</h2>
        <p>Links to Gene/Sequence Resources are located in:</p>
        <ul>
          <li>the toolbar at the top of most CGD pages;</li>
          <li>
            the left-hand navigation bar on the CGD home page and on the pages listing CGD
            resources
          </li>
          <li>
            the list on the <Link to="/search">Search Options index page</Link>
          </li>
        </ul>
      </section>

      <section id="links">
        <h2>Other Relevant Links</h2>
        <ul>
          <li><Link to="/search">Search CGD</Link></li>
        </ul>
        <p>
          <strong>Go to <Link to="/seq-tools">Gene/Sequence Resources</Link></strong>
        </p>
      </section>

      <hr className="info-divider" />
    </div>
  );
};

export default GSResourcesHelp;
