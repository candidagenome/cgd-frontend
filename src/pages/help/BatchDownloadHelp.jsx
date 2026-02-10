import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

const BatchDownloadHelp = () => {
  return (
    <div className="info-page">
      <h1 className="info-page-title">CGD Help: Batch Download</h1>

      <hr className="info-divider" />

      <div className="info-content-block">
        <h2>Contents</h2>
        <ul>
          <li><a href="#description">Description</a></li>
          <li><a href="#using">Using the Batch Download Tool</a></li>
        </ul>
      </div>

      <hr className="info-divider" />

      <section id="description">
        <h2>Description</h2>
        <p>
          This resource allows simultaneous retrieval of DNA and protein sequences, basic
          information, GO annotations, phenotype annotations, or orthologs and Best Hits for genes
          and other chromosomal features, starting with either a list of their names or a list of
          chromosomal/contig regions in which the features of interest are located.
        </p>
        <p>
          CGD's Batch Download tool and <Link to="/seq-tools">Gene/Sequence Resources</Link> tool
          both allow you to retrieve sequences in batch for a list of regions. The difference
          between the batch options of these two tools is that Batch Download retrieves only the
          sequences of the features (protein-coding and RNA genes, centromeres, etc.) that are
          annotated within the specified region(s), while Gene/Sequence Resources retrieves the
          entire nucleotide sequence between the coordinates specified in a list.
        </p>
        <p>
          The data that can be retrieved using this tool are also found in files available at our{' '}
          <Link to="/download">Download site</Link>.
        </p>
      </section>

      <section id="using">
        <h2>Using the Batch Download Tool</h2>
        <p>
          The Batch Download tool allows you to enter a list of gene identifiers or
          chromosomal/contig regions and select the types of data that you want to retrieve.
        </p>

        <h3>
          <span className="info-step-label">Step 1:</span> Your Input
        </h3>
        <p>Two options are available in Step 1.</p>
        <ol>
          <li>
            <strong>Option 1:</strong> You may enter Feature names (e.g., orf19.2203), Standard
            Gene names (e.g., ACT1), CGDIDs (e.g., CAL0001571), or a mix of all three types of
            identifier. These may be typed or pasted into the input box, or you may upload a text
            file of these names or identifiers. In both cases, the input should contain one name or
            identifier per line, separated by a return. Only genetic names that are the CGD
            Standard Names should be used, not Alias names. Note: only genes from one species at a
            time can be downloaded through Batch Download.
          </li>
          <li>
            <strong>Option 2:</strong> Enter sequence coordinates (chromosomal coordinates or
            contig coordinates, as appropriate) to retrieve all features between these coordinates.
            In this option you can either pick one chromosome/contig at a time or upload a file of
            chromosomal regions in the following format:
            <pre className="info-code-block">
              chromosome_number or contig_number[tab]start_coordinate[tab]stop_coordinate
            </pre>
            <p>
              If no coordinates are entered, all the features in the selected chromosome or contig
              will be retrieved.
            </p>
            <p>
              Note that this option will not retrieve data for features that are partially within
              and partially outside of the input coordinates.
            </p>
          </li>
        </ol>
        <p>
          <strong>
            The name of the strain must also be chosen (from the pull-down menu) as part of the
            input to the Batch Download tool.
          </strong>
        </p>

        <h3>
          <span className="info-step-label">Step 2:</span> Choosing a Data type
        </h3>
        <p>
          For a given set of Feature names/Standard names/CGDIDs, you can simultaneously retrieve
          data for multiple data types. Data are always output in{' '}
          <a
            href="http://www.ncbi.nlm.nih.gov/BLAST/fasta.shtml"
            target="_blank"
            rel="noopener noreferrer"
          >
            FASTA
          </a>{' '}
          format except when using the Chromosomal Coordinates option. The following types of data
          may be retrieved:
        </p>

        <ul>
          <li>
            <strong>Genomic DNA</strong> (DNA sequence of each feature, including introns)
          </li>
          <li>
            <strong>Genomic DNA plus flanking sequence</strong> - any desired length (in basepairs)
            of upstream and/or downstream flanking sequence for each feature
          </li>
          <li>
            <strong>Coding Sequence</strong> of each feature (exons only)
          </li>
          <li>
            <strong>ORF translation</strong> - retrieves the translation of the coding sequence
            (i.e., protein sequence) for each protein-coding gene. Note that non-coding DNA
            features such as centromeres are not translated in this option.
          </li>
          <li id="Feat">
            <strong>Chromosomal Coordinates</strong> - retrieves data on chromosomal features,
            similar to the 'chromosomal_feature.tab' file found on the{' '}
            <Link to="/download">CGD Download</Link> site. The columns in this file are as follows:
            <table className="info-data-table">
              <thead>
                <tr>
                  <th>Column</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    1) Feature name (mandatory); for <em>C. albicans</em> this is the primary orf19
                    name, if available
                  </td>
                </tr>
                <tr>
                  <td>2) Standard gene name (locus name)</td>
                </tr>
                <tr>
                  <td>3) Aliases (multiples separated by |)</td>
                </tr>
                <tr>
                  <td>4) Feature type</td>
                </tr>
                <tr>
                  <td>5) Chromosome</td>
                </tr>
                <tr>
                  <td>6) Start_coordinate</td>
                </tr>
                <tr>
                  <td>7) Stop_coordinate</td>
                </tr>
                <tr>
                  <td>8) Strand</td>
                </tr>
                <tr>
                  <td>9) Primary CGDID</td>
                </tr>
                <tr>
                  <td>10) Secondary CGDID (if any)</td>
                </tr>
                <tr>
                  <td>11) Description</td>
                </tr>
                <tr>
                  <td>12) Date Created</td>
                </tr>
                <tr>
                  <td>13) Sequence Coordinate Version Date (if any)</td>
                </tr>
                <tr>
                  <td>14-15) Blank</td>
                </tr>
                <tr>
                  <td>16) Date of gene name reservation (if any)</td>
                </tr>
                <tr>
                  <td>17) Has the reserved gene name become the standard name? (Y/N)</td>
                </tr>
                <tr>
                  <td>
                    18) Name of <em>S. cerevisiae</em> ortholog(s) (multiples separated by |);
                    please note that this file only contains the S. cerevisiae ortholog(s); all
                    orthologs and Best Hits, including inter-<em>Candida</em> mappings, are
                    contained in the Ortholog and Best Hit file (see below).
                  </td>
                </tr>
              </tbody>
            </table>
          </li>

          <li id="GO">
            <strong>Gene Ontology (GO) Annotations</strong> - retrieves GO annotations for
            features, in the format of the 'gene_association.cgd' file found on the{' '}
            <Link to="/download">CGD Download</Link> site. This is the standard file format for
            gene_association files of the Gene Ontology (GO) Consortium. A more complete
            description of the file format can be found at the{' '}
            <a
              href="http://www.geneontology.org/GO.annotation.shtml#file"
              target="_blank"
              rel="noopener noreferrer"
            >
              GO Consortium's website
            </a>
            . The columns in this file are as follows:
            <table className="info-data-table">
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1) DB</td>
                  <td>database contributing the file (always "CGD" for this file)</td>
                </tr>
                <tr>
                  <td>2) DB_Object_ID</td>
                  <td>CGDID</td>
                </tr>
                <tr>
                  <td>3) DB_Object_Symbol</td>
                  <td>see below</td>
                </tr>
                <tr>
                  <td>4) NOT (optional)</td>
                  <td>'NOT' qualifier for a GO annotation, when needed</td>
                </tr>
                <tr>
                  <td>5) GO ID</td>
                  <td>unique numeric identifier for the GO term</td>
                </tr>
                <tr>
                  <td>6) DB:Reference(|DB:Reference)</td>
                  <td>the reference associated with the GO annotation</td>
                </tr>
                <tr>
                  <td>7) Evidence</td>
                  <td>the evidence code for the GO annotation</td>
                </tr>
                <tr>
                  <td>8) With (or) From (optional)</td>
                  <td>any With or From qualifier for the GO annotation</td>
                </tr>
                <tr>
                  <td>9) Aspect</td>
                  <td>which ontology the GO term belongs in</td>
                </tr>
                <tr>
                  <td>10) DB_Object_Name(|Name) (optional)</td>
                  <td>a name for the gene product in words, e.g. 'acid phosphatase'</td>
                </tr>
                <tr>
                  <td>11) DB_Object_Synonym(|Synonym) (optional)</td>
                  <td>see below</td>
                </tr>
                <tr>
                  <td>12) DB_Object_Type</td>
                  <td>type of object annotated, e.g. gene, protein, etc.</td>
                </tr>
                <tr>
                  <td>13) taxon(|taxon)</td>
                  <td>taxonomic identifier of species encoding gene product</td>
                </tr>
                <tr>
                  <td>14) Date</td>
                  <td>date GO annotation was made</td>
                </tr>
                <tr>
                  <td>15) Assigned_by</td>
                  <td>source of the annotation (always "CGD" for this file)</td>
                </tr>
              </tbody>
            </table>
          </li>

          <li id="pheno">
            <strong>Phenotypes</strong> - retrieves phenotype data in the format of the
            'phenotype_data.tab' files found on the <Link to="/download">CGD Download</Link> site.
            The columns in this file are:
            <table className="info-data-table">
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Contents</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1) Feature name (mandatory)</td>
                  <td>Systematic name of the genomic feature</td>
                </tr>
                <tr>
                  <td>2) Feature type (mandatory)</td>
                  <td>Type of genomic feature, e.g., ORF</td>
                </tr>
                <tr>
                  <td>3) Gene (optional)</td>
                  <td>Gene name, if one exists</td>
                </tr>
                <tr>
                  <td>4) CGDID (mandatory)</td>
                  <td>The CGDID, unique database identifier, for the genomic feature</td>
                </tr>
                <tr>
                  <td>5) Reference (CGD_REF mandatory, PMID optional)</td>
                  <td>PMID: ####|CGD_REF: #### (separated by pipe)(one reference per row)</td>
                </tr>
                <tr>
                  <td>6) Experiment type (mandatory)</td>
                  <td>
                    Type of experiment used to detect the phenotype; additional comments may be in
                    parentheses
                  </td>
                </tr>
                <tr>
                  <td>7) Mutant type (mandatory)</td>
                  <td>
                    Classification of the effect that the mutation has on the gene product, e.g.,
                    "null", "conditional"
                  </td>
                </tr>
                <tr>
                  <td>8) Allele (optional)</td>
                  <td>
                    Name of the mutant allele; additional information such as the amino acid
                    affected may be in parentheses
                  </td>
                </tr>
                <tr>
                  <td>9) Strain background (mandatory)</td>
                  <td>Genetic background in which the phenotype was analyzed</td>
                </tr>
                <tr>
                  <td>10) Phenotype (mandatory)</td>
                  <td>
                    Observed feature of the mutant strain, and the direction of change relative to
                    wild type
                  </td>
                </tr>
                <tr>
                  <td>11) Chemical (optional)</td>
                  <td>
                    Name of any chemicals used in the phenotype assay; additional details such as
                    concentration may be in parentheses
                  </td>
                </tr>
                <tr>
                  <td>12) Condition (optional)</td>
                  <td>
                    Conditions under which the phenotype was assayed, e.g., type of growth medium
                  </td>
                </tr>
                <tr>
                  <td>13) Details (optional)</td>
                  <td>Additional information relevant to the phenotype</td>
                </tr>
                <tr>
                  <td>14) Reporter (optional)</td>
                  <td>
                    The protein(s) or RNA(s) used in an experiment to track a process
                  </td>
                </tr>
                <tr>
                  <td>15) Anatomical structure (optional)</td>
                  <td>
                    The Fungal Anatomy Ontology term that denotes the affected structure for an
                    anatomical phenotype
                  </td>
                </tr>
                <tr>
                  <td>16) Virulence model (optional)</td>
                  <td>The model system used to assess the virulence of a mutant</td>
                </tr>
              </tbody>
            </table>
          </li>

          <li id="ortho">
            <strong>Orthologs and Best hits</strong> - retrieves <em>Candida</em> and{' '}
            <em>S. cerevisiae</em> orthologs and best hits in a tab-delimited file format. See{' '}
            <Link to="/reference/CAL0142012">this description</Link>{' '}
            of the details on the method used to identify orthologs and best hits. The columns in
            this file are:
            <table className="info-data-table">
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Contents</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1) ORF (mandatory)</td>
                  <td>Systematic name of the CGD ORF</td>
                </tr>
                <tr>
                  <td>2) Gene (optional)</td>
                  <td>CGD standard gene name, if one exists</td>
                </tr>
                <tr>
                  <td>3) CGDID/SGDID (mandatory)</td>
                  <td>
                    CGDID or SGDID, unique database identifier, for the ortholog or best hit match
                  </td>
                </tr>
                <tr>
                  <td>4) Gene Name (mandatory)</td>
                  <td>Standard gene name or systematic name of the ortholog or best hit match</td>
                </tr>
                <tr>
                  <td>5) Ortholog or Best hit? (mandatory)</td>
                  <td>
                    Indication whether the gene is an ortholog or whether it is a best hit (lower
                    stringency match in cases where there is no match that meets the strict
                    orthology criteria)
                  </td>
                </tr>
              </tbody>
            </table>
          </li>
        </ul>

        <h3>Interpreting the results</h3>
        <p>
          If your input list of Feature/Gene names includes names that are Alias names, names that
          have been deleted or merged, or non-existing gene names, an error message will be
          displayed. From this intermediate page you can either go back, edit your list to exclude
          those names, and resubmit, or click 'Proceed' which will retrieve the data for your input
          list by excluding those invalid names.
        </p>
        <p>
          The different types of data that you requested are retrieved and stored in separate files
          that are listed in a table on the results page. Please note that data for all the types
          of information requested may not be available or may not be applicable for all the input
          Gene/Feature name(s). For example, the phenotype data type may not be available for all
          the features, while the data type 'ORF translation' is not applicable for DNA features
          like RNA genes. A Gene/Feature is not included in the file if there are no data for that
          feature. The number of features included in each file is shown in the table on the
          results page.
        </p>
        <p>
          The file name, which has the process ID appended to it, is descriptive of the type of
          data it contains, and the size of the file is displayed in the last column of the table.
          Clicking on the file name should download the file to the desktop of your local machine
          (depending on the browser).
        </p>
        <p>
          The file that contains your data will be available for 6 hours from the time it was
          requested.
        </p>

        <h3>
          Go to the <Link to="/batch-download">Batch Download Tool</Link>
        </h3>
      </section>

      <hr className="info-divider" />
    </div>
  );
};

export default BatchDownloadHelp;
