import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

function GOSlimHelp() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>CGD Help: GO Slim Mapper</h1>
        <hr />

        <div className="info-section">
          <h2>Contents</h2>
          <ul>
            <li><a href="#description">Background and Description</a></li>
            <li><a href="#query">Query Page</a></li>
            <li><a href="#results">Results</a></li>
            <li><a href="#example">Example</a></li>
          </ul>
        </div>

        <hr />

        <div className="info-section">
          <h2 id="description">Background and Description</h2>
          <p>
            The Gene Ontology (GO) project was established to provide a common language to describe aspects of a gene
            product's biology. A gene product's biology is represented by three ontologies:{' '}
            <a
              href="http://www.geneontology.org/GO.doc.shtml#ontologies"
              target="_blank"
              rel="noopener noreferrer"
            >
              molecular function, biological process and cellular component
            </a>
            . The use of a consistent vocabulary allows genes from different species to be compared based on their GO
            annotations. To provide the most detailed information available, gene products are annotated to the most
            granular GO term(s) possible. For example, if a gene product is localized to the <strong>perinuclear
            space</strong>, it will be annotated to that specific term only and not the parent term{' '}
            <strong>nucleus</strong>. In this example the term <strong>perinuclear space</strong> is a child of{' '}
            <strong>nucleus</strong>. Parent-children relationships also be viewed using{' '}
            <a
              href="http://www.geneontology.org/amigo/help-front.shtml"
              target="_blank"
              rel="noopener noreferrer"
            >
              AMIGO
            </a>
            .
          </p>
          <p>
            However, for many purposes, such as reporting the results of GO annotation of a genome, analyzing the
            results of microarray expression data, or cDNA collection, it is very useful to have a high level view of
            the three ontologies. For example, if you wanted to find all the genes in an expression cluster that were
            localized to the nucleus, it would be useful to be able to map the granular annotations such as{' '}
            <strong>perinuclear space</strong> to general terms like <strong>nucleus</strong>.
          </p>
          <p>
            Thus, GO Slim was created. GO Slim is a high level view of GO: a slice of the broad, high level terms such
            as <strong>DNA replication</strong>, <strong>transcription</strong>, and <strong>transport</strong>. There
            are several versions of GO Slims created for different genomes and the GO Slim terms are updated
            periodically. To view and/or download other GO Slims, go to the GO Slim{' '}
            <a href="ftp://ftp.geneontology.org/pub/go/GO_slims" target="_blank" rel="noopener noreferrer">
              ftp site
            </a>
            .
          </p>
          <p>
            The GO Slim Mapper tool at CGD uses the GO Slim terms picked by the CGD curators based on annotation
            statistics and biological significance. The <em>Candida</em> GO Slim may be downloaded from CGD's{' '}
            <Link to="/download">Download Data</Link> page.
          </p>
          <p>
            The GO Slim Mapper tool at CGD was created to allow you to map the granular annotations of the query set of
            genes to one or more high level, parent GO Slim terms. This is possible with GO because there are
            parent:child relationships recorded between granular terms and more general parent (ie. GO Slim) terms.
          </p>
          <p>
            For more information on GO in general, visit the{' '}
            <a href="http://www.geneontology.org" target="_blank" rel="noopener noreferrer">
              Gene Ontology
            </a>{' '}
            website or the{' '}
            <a href="http://www.yeastgenome.org/help/GO.html" target="_blank" rel="noopener noreferrer">
              GO help page
            </a>{' '}
            provided by the <em>Saccharomyces</em> Genome Database (SGD).
          </p>
        </div>

        <div className="info-section">
          <h2 id="query">Query Page</h2>
          <p>
            The <a href="/go-slim-mapper">query page</a> allows you to enter the list of gene names and select
            your GO Slim terms.
          </p>
          <ol>
            <li>
              <p><strong>Choose the strain:</strong></p>
              <p>Select a strain name from the pull-down menu.</p>
            </li>
            <li>
              <p><strong>Enter your gene(s):</strong></p>
              <p>
                You can either type the names of the genes in the input box or upload a file that contains the gene
                names. Note that the program requires more time to process a long list (greater than 100 genes) than a
                short list. Each query can only process gene names from a single species.
              </p>
            </li>
            <li>
              <p><strong>Choose your GO Slim terms:</strong></p>
              <p>
                Select one or more GO Slim terms from one of the three (biological process, molecular function, or
                cellular component) ontologies by checking the boxes. This tool is designed to search only one of the
                three ontologies at a given time in order to minimize the searching time.
              </p>
            </li>
            <li>
              <p>
                If you click the Search button after Step 3, the tool will map annotations made to your input list of
                genes by compiling data from the Manually curated, High-throughput, and Computational sets. You can go
                to optional Step 4 to filter by Annotation Method.
              </p>
            </li>
            <li>
              <p>
                An optional 4th step allows you to select any desired combination of annotation sets (Manually curated,
                High-throughput, and Computational) when using GO Slim Mapper to map annotations to your input set of
                genes.
              </p>
              <p>
                Note that the default sets of annotations used by GO Slim Mapper are analogous in CGD and in the{' '}
                <em>Aspergillus</em> Genome Database (
                <a href="http://www.aspergillusgenome.org" target="_blank" rel="noopener noreferrer">
                  AspGD
                </a>
                ), but different from the set used at SGD. In CGD and AspGD, all GO annotations (Manually curated,
                High-throughput, and Computational) are used as the default set, while in SGD Computational annotations
                are excluded from the default set. Computational annotations are included for CGD and AspGD because they
                augment the GO annotation coverage of the genomes, providing annotation for many uncharacterized genes.
                In contrast, in SGD the greater extent of characterization of <em>S. cerevisiae</em> genes means that
                computational annotations are frequently redundant with or less specific than experimentally-derived
                annotations, and dilute this higher-quality set.
              </p>
            </li>
          </ol>
        </div>

        <div className="info-section">
          <h2 id="results">Results</h2>
          <p>
            The results page displays the GO Slim term(s) to which your gene(s) granular annotations have been mapped.
            You could click on the locus name to see the details of the GO annotations for each of the gene /ORF names.
            Also listed is the frequency with which each GO Slim term is used to annotate (directly, or indirectly, via
            a parental relationship with a granular term) the genes in your list.
          </p>
          <p>
            You can also download the results into a tab-delimited (ie. Excel readable) file by clicking on the{' '}
            <strong>Download Results</strong> link.
          </p>
        </div>

        <div className="info-section">
          <h2 id="example">Example</h2>
          <p>
            Let's take an example from SGD. Consider a small group of 4 <em>S. cerevisiae</em> genes--{' '}
            <a
              href="http://www.yeastgenome.org/cgi-bin/locus.fpl?dbid=S0007268"
              target="_blank"
              rel="noopener noreferrer"
            >
              PHO1
            </a>
            ,{' '}
            <a
              href="http://www.yeastgenome.org/cgi-bin/locus.fpl?dbid=S0002264"
              target="_blank"
              rel="noopener noreferrer"
            >
              PHO2
            </a>
            ,{' '}
            <a
              href="http://www.yeastgenome.org/cgi-bin/locus.fpl?dbid=S0000296"
              target="_blank"
              rel="noopener noreferrer"
            >
              PHO3
            </a>{' '}
            and{' '}
            <a
              href="http://www.yeastgenome.org/cgi-bin/locus.fpl?dbid=S0001930"
              target="_blank"
              rel="noopener noreferrer"
            >
              PHO4
            </a>
            . The following are the granular molecular function annotations for these genes in SGD.
          </p>

          <table className="sitemap-table" style={{ marginBottom: '20px' }}>
            <thead>
              <tr>
                <th>Gene Name</th>
                <th>Molecular Function Annotation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <a
                    href="http://www.yeastgenome.org/cgi-bin/locus.fpl?dbid=S0007268"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    PHO1
                  </a>
                </td>
                <td>hydrogen-transporting two-sector ATPase</td>
              </tr>
              <tr>
                <td>
                  <a
                    href="http://www.yeastgenome.org/cgi-bin/locus.fpl?dbid=S0002264"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    PHO2
                  </a>
                </td>
                <td>transcription factor</td>
              </tr>
              <tr>
                <td>
                  <a
                    href="http://www.yeastgenome.org/cgi-bin/locus.fpl?dbid=S0000296"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    PHO3
                  </a>
                </td>
                <td>acid phosphatase</td>
              </tr>
              <tr>
                <td>
                  <a
                    href="http://www.yeastgenome.org/cgi-bin/locus.fpl?dbid=S0001930"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    PHO4
                  </a>
                </td>
                <td>transcription factor</td>
              </tr>
            </tbody>
          </table>

          <p>Searching for all the GO Slim function terms will map these annotations to the following:</p>

          <table className="sitemap-table" style={{ marginBottom: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#FFCC33' }}>
                <th>GO-Slim term</th>
                <th>Cluster frequency</th>
                <th>Genes annotated to the term</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Function</strong>: transcription regulator</td>
                <td>2 out of 4 genes, 50%</td>
                <td>
                  <a
                    href="http://www.yeastgenome.org/cgi-bin/locus.fpl?dbid=S0002264"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    PHO2
                  </a>
                  ,{' '}
                  <a
                    href="http://www.yeastgenome.org/cgi-bin/locus.fpl?dbid=S0001930"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    PHO4
                  </a>
                </td>
              </tr>
              <tr>
                <td><strong>Function</strong>: enzyme</td>
                <td>2 out of 4 genes, 50%</td>
                <td>
                  <a
                    href="http://www.yeastgenome.org/cgi-bin/locus.fpl?dbid=S0007268"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ATP6/PHO1
                  </a>
                  ,{' '}
                  <a
                    href="http://www.yeastgenome.org/cgi-bin/locus.fpl?dbid=S0000296"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    PHO3
                  </a>
                </td>
              </tr>
              <tr>
                <td><strong>Function</strong>: transporter</td>
                <td>1 out of 4 genes, 25%</td>
                <td>
                  <a
                    href="http://www.yeastgenome.org/cgi-bin/locus.fpl?dbid=S0007268"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ATP6/PHO1
                  </a>
                </td>
              </tr>
              <tr>
                <td><strong>Function</strong>: molecular_function unknown</td>
                <td>0 out of 4 genes, 0%</td>
                <td>none</td>
              </tr>
              <tr>
                <td><strong>Function</strong>: structural molecule</td>
                <td>0 out of 4 genes, 0%</td>
                <td>none</td>
              </tr>
            </tbody>
          </table>

          <p>From the two tables above the following conclusions can be drawn:</p>
          <ul>
            <li>
              The genes PHO1 and PHO3 function as enzymes, although their granular annotations are to the terms
              'hydrogen-transporting two-sector ATPase' and 'acid phosphatase' respectively.
            </li>
            <li>
              The genes PHO2 and PHO4 function as transcription regulators although their granular annotations are to
              the term 'transcription factor'
            </li>
            <li>
              The terms 'hydrogen-transporting two-sector ATPase' and 'acid phosphatase' are mapped to a parent term
              'enzyme', as shown below.
              <br />
              <strong>
                enzyme-&gt;hydrolase-&gt;hydrolase, acting on ester bonds-&gt;phosphoric monoester
                hydrolase-&gt;acid phosphatase.
              </strong>
              <br />
              <strong>
                enzyme-&gt;hydrolase-&gt;hydrolase acting on acid anhydrides-&gt;hydrolase, acting on acid
                anhydrides, catalyzing transmembrane movement of substances-&gt;hydrogen-transporting two-sector
                ATPase.
              </strong>
            </li>
            <li>
              This example also shows the existence of multiple parents for the same term. 'hydrogen-transporting
              two-sector ATPase' has two parents- 'enzyme' and 'transporter' as shown below.
              <br />
              <strong>
                enzyme-&gt;hydrolase-&gt;hydrolase acting on acid anhydrides-&gt;hydrolase, acting on acid
                anhydrides, catalyzing transmembrane movement of substances-&gt;hydrogen-transporting two-sector
                ATPase.
              </strong>
              <br />
              <strong>
                transporter-&gt;carrier-&gt;primary active transporter-&gt;P-P-bond hydrolysis-driven
                transporter-&gt;hydrogen-/sodium-translocating ATPase-&gt;hydrogen-transporting two-sector ATPase.
              </strong>
            </li>
            <li>
              There are no genes in the input set that have been annotated to the term 'structure molecule' or
              'molecular function unknown'.
            </li>
          </ul>
          <p>
            You can see the relationships mentioned above and much more using the{' '}
            <a
              href="http://amigo.geneontology.org/cgi-bin/amigo/go.cgi"
              target="_blank"
              rel="noopener noreferrer"
            >
              AmiGO browser
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default GOSlimHelp;
