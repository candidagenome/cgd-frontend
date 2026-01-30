import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

const BiochemPathwaysHelp = () => {
  return (
    <div className="info-page">
      <h1 className="info-page-title">CGD Help: <em>Candida</em> Biochemical Pathways</h1>

      <hr className="info-divider" />

      <div className="info-content-block">
        <h2>Contents:</h2>
        <ul>
          <li><a href="#description">Description</a></li>
          <li><a href="#curation">Pathway Prediction and Curation</a></li>
          <li><a href="#query">Main Query Page</a>
            <ul>
              <li><a href="#box">Query box</a></li>
              <li><a href="#browse">Browse ontology</a></li>
              <li><a href="#list">Choose from a list of... (pathways, etc.)</a></li>
              <li><a href="#omics">Cellular Overview Diagram/Omics Viewer</a></li>
              <li><a href="#summary">Links to summary information</a></li>
              <li><a href="#tables">Comparative Analysis (Summary Tables)</a></li>
            </ul>
          </li>
          <li><a href="#adv">Advanced Query Form</a></li>
          <li><a href="#view">Viewing <em>Candida</em> Biochemical Pathways Pages</a>
            <ul>
              <li><a href="#pwy">Pathways</a></li>
              <li><a href="#rxn">Reactions</a></li>
              <li><a href="#enzy">Enzymes</a></li>
              <li><a href="#comp">Compounds</a></li>
            </ul>
          </li>
          <li><a href="#exp">Using the Expression Viewer</a></li>
        </ul>
      </div>

      <hr className="info-divider" />

      <section id="description">
        <h2>Description</h2>
        <p>
          The{' '}
          <a
            href="http://pathway.candidagenome.org//server.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            <em>Candida</em> Biochemical Pathways
          </a>{' '}
          were created using the{' '}
          <a
            href="http://bioinformatics.ai.sri.com/ptools/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pathway Tools
          </a>{' '}
          software, which is developed and maintained by Peter Karp and his colleagues at the{' '}
          <a
            href="http://bioinformatics.ai.sri.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Bioinformatics Research Group
          </a>{' '}
          at SRI International. While Pathway Tools supports curation of additional types of data,
          including general gene product information, small molecule transport reactions, enzyme
          kinetics, and some (prokaryotic-focused) gene regulatory information, CGD is using the
          software to create and curate biochemical pathways only. Therefore, some features of the
          Pathway Tools software will not be fully functional in CGD, and not all types of data
          will be curated.
        </p>
      </section>

      <section id="curation">
        <h2>Pathway prediction and curation</h2>
        <p>
          Initially, the CGD biochemical pathways were automatically generated using PathoLogic, a
          pathway prediction program built into the Pathway Tools. PathoLogic used information
          about the function of individual <em>Candida</em> gene products from CGD in conjunction
          with SRI's reference database of biochemical reaction and pathway information,{' '}
          <a href="http://metacyc.org/" target="_blank" rel="noopener noreferrer">
            MetaCyc
          </a>
          , to create a set of predicted <em>Candida albicans</em> pathways. The starting set of{' '}
          <em>Candida albicans</em> enzymes that was input into the PathoLogic software was
          generated using the Gene Ontology curation from CGD. PathoLogic then compared the list
          of enzyme names against SRI's MetaCyc pathway database. For the purpose of generation of
          pathways for CGD, the software was also configured to consult the set of pathways
          curated at the <em>Saccharomyces</em> Genome database in addition to the pathways
          contained in MetaCyc pathway, such that curated <em>S. cerevisiae</em> pathways that are
          not included in MetaCyc were used as an additional basis for comparison. If{' '}
          <em>Candida albicans</em> contains one or more enzymes that participate in a pathway
          that exists in MetaCyc or SGD, the software predicted that a similar pathway exists in{' '}
          <em>Candida albicans</em>. Many of the pathways that were predicted have candidate{' '}
          <em>Candida albicans</em> enzyme assignments for a subset, but not all, of the reactions
          that comprise the pathway. The Pathway Hole Filler program that is built into Pathway
          Tools was used to identify genes encoding candidate enzymes for the other reactions (the
          "pathway holes"). To do so, the Pathway Hole Filler was configured to use sequence-based
          information only (not other possible data types, see{' '}
          <a
            href="http://www.biomedcentral.com/1471-2105/5/76"
            target="_blank"
            rel="noopener noreferrer"
          >
            Green et al. 2004
          </a>
          ); it made comparisons between GenBank sequences associated with each of the "pathway
          hole" enzymes and the ORF sequences from CGD, to assign candidate{' '}
          <em>Candida albicans</em> genes to these activities where possible.
        </p>
        <p>
          The automatically generated pathway predictions are being manually reviewed and curated
          at CGD. Because the software intentionally overpredicts pathways (i.e., errs on the side
          of inclusion), the pathway set that was initially predicted contained a number of
          spurious and redundant pathways. Curators conducted an initial review of the pathway
          list to identify relevant literature for most of the pathways, and to remove most of the
          spurious predictions. When necessary, new <em>Candida</em> pathways have been added.
          Subsequently, each pathway is subject to more intensive review by CGD curators; any
          necessary updates are made to the pathway structure or reactions; links to any
          corresponding pathway(s) in SGD are formed; and literature relevant to the pathway in{' '}
          <em>Candida albicans</em> and other <em>Candida</em> is reviewed, summarized on the
          pathway page, and added to the pathway reference list. In many cases, a pathway may not
          be characterized directly in <em>Candida</em>, as indicated in the text of the summary
          on the pathway page.
        </p>
        <p>
          Pathway curation at CGD is an ongoing process, and the pathway predictions contained in
          the database may be incomplete or incorrect. If you see any errors, please{' '}
          <Link to="/suggestion">contact us</Link>.
        </p>
      </section>

      <section id="query">
        <h2>Main query page</h2>
        <p>
          The{' '}
          <a href="http://pathway.candidagenome.org/" target="_blank" rel="noopener noreferrer">
            main query page
          </a>{' '}
          is organized into several sections that allow you to search the <em>Candida</em>{' '}
          Biochemical Pathways dataset in different ways. The only dataset that is available is
          for the <em>Candida albicans</em> strain SC5314, which is the reference strain at CGD.
        </p>

        <div className="info-subsection">
          <h3 id="box">Query box</h3>
          <ul>
            <li>
              The query box performs a keyword search of the information available in the
              biochemical pathways dataset at CGD. Use this option to search for a protein name, a
              pathway, a reaction, or a compound. (RNA searches are currently inoperable. Gene
              searches retrieve CGD Locus Summary Pages.) The keyword can be text or an E.C.#. The
              search will automatically add a wildcard character to the beginning and end of your
              keyword. It does not support Boolean searches. The search is specific for the{' '}
              <em>Candida</em> Biochemical Pathways dataset and will not search the rest of the
              database at CGD.
            </li>
            <li>
              If there is only one match to the keyword, the match will be displayed immediately.
              If there is more than one match, all the results will be listed.
            </li>
          </ul>

          <h3 id="browse">Browse Ontology</h3>
          <ul>
            <li>
              The pathways, E.C. numbered reactions, and compounds in the Pathway Tools are
              organized into hierarchies to show the relationship between items in each of these
              classes. (CGD is not using the Pathway Tools gene hierarchies for curation, so
              selecting the "Genes" ontology will yield a noninformative result; most of the gene
              products involved in biochemical pathways will be listed under the categories
              "unclassified" or "ORFs.")
            </li>
            <li>
              Selecting one of these ontologies and clicking "Submit" will display the categories
              of the ontology. You can browse the ontology by clicking on the name of any category
              or by using the +/- options to expand or collapse regions of the hierarchy. Each
              class will display the parents of that category as well as all children of that
              category.
            </li>
            <li>
              The items listed are hyperlinks to the pathway, reaction, or compound page.
            </li>
          </ul>

          <h3 id="list">Choose from a list of all...</h3>
          <ul>
            <li>
              This option displays an alphabetical list of all the pathways, proteins, or
              compounds present in the database.
            </li>
            <li>
              The items on the list are hyperlinks. If you click on a pathway name, for example,
              you will be directed to the pathway page.
            </li>
          </ul>

          <h3 id="omics">Cellular Overview Diagram/Omics viewer</h3>
          <ul>
            <li>
              The Overview Diagram displays all the biochemical pathways and reactions that have
              been created in the CGD dataset.
              <ul>
                <li>
                  All shapes represent metabolic compounds of different classes. A legend is also
                  available on the right side of the overview diagram.
                  <ul>
                    <li>Triangle: amino acid</li>
                    <li>Square: carbohydrate and derivatives</li>
                    <li>Diamond: proteins and modified proteins</li>
                    <li>Vertical ellipse: purines</li>
                    <li>Horizontal ellipse: pyrimidines</li>
                    <li>T: tRNA (not curated in Pathway Tools at CGD)</li>
                    <li>Circle: all other compounds</li>
                    <li>Filled in shape: phosphorylated compound</li>
                  </ul>
                </li>
                <li>
                  Blue lines represent reactions that have been associated with a gene product.
                  Reactions that have not been associated with a gene product are grayed out.
                </li>
                <li>
                  The gray lines between metabolic compounds indicate where the same compound is
                  present in a different reaction. For the sake of clarity, the gray lines are not
                  exhaustive.
                </li>
                <li>
                  The TCA cycle is shown near the center, with catabolic pathways on the right
                  hand side and biosynthetic pathways on the left hand side. The flow of the
                  pathway is from the top of the page to the bottom. On the far right side,
                  reactions that are not part of currently curated pathways are listed.
                </li>
                <li>
                  If you mouse over a compound, the name of the compound and the pathway it is in
                  will appear on the bottom of your browser window. This will only work for
                  Javascript-enabled browsers.
                </li>
                <li>
                  If you click on a compound, the pathway containing that compound will be
                  displayed.
                </li>
              </ul>
            </li>
            <li>
              The Omics Viewer is a feature of the Pathway Tools that allows you to superimpose
              expression data onto the metabolic Overview Diagram. With this feature, you are able
              to import a data file and display the absolute expression levels of metabolic
              enzymes, compare the expression of metabolic enzymes under different conditions, or
              create an animation of how expression levels change over time. The Pathway Tools
              provides a{' '}
              <a
                href="http://pathway.candidagenome.org//ov-expr.shtml"
                target="_blank"
                rel="noopener noreferrer"
              >
                help document
              </a>{' '}
              that includes information about file formats, analysis options, and interpreting
              results.
            </li>
          </ul>

          <h3 id="summary">Links to summary information</h3>
          <ul>
            <li>
              The PathoLogic Pathway Analysis page contains links to two web pages, the Pathway
              Report and the Pathway Holes Report. The Pathway Report provides a visual overview
              of the basis for prediction of each pathway in current dataset. The Pathway Holes
              Report lists all reactions that lie within predicted pathways and which were not
              associated with a gene product at the time the pathway predictions were made. The
              report lists reactions that were subsequently assigned to a gene product by the
              "Pathway Hole Filler" software within Pathway Tools, and it separately lists those
              reactions that were not assigned to any candidate gene and therefore remain
              associated with no gene product.
            </li>
          </ul>

          <h3 id="tables">Comparative Analysis</h3>
          <ul>
            <li>
              Because CGD only contains pathway data for <em>Candida</em>, no inter-species
              comparisons are available. However, this tool supports generation of various tables
              summarizing data from the pathway dataset. Please note that the pathway dataset is
              not completely representative of the genome itself, not all types of data that are
              presented in these tables have been curated in the dataset, and some types of data
              are not applicable.
            </li>
            <li>
              Please also note that there are buttons labeled "Cross-species Comparison" (found on
              some of the pathway-related web pages), but that these functions are not operational
              because CGD only contains a single pathway dataset.
            </li>
          </ul>
        </div>
      </section>

      <section id="adv">
        <h2>Advanced Query Form</h2>
        <p>
          The Advanced Query form allows you to retrieve specific types of information from the{' '}
          <em>Candida</em> Biochemical Pathways. The data structure of the <em>Candida</em>{' '}
          Biochemical Pathways is shared with EcoCyc and other datasets created using the Pathway
          Tools. The Pathway Tools web site provides a detailed{' '}
          <a href="http://biocyc.org/webQueryDoc.html" target="_blank" rel="noopener noreferrer">
            help document
          </a>{' '}
          for the Advanced Query.
        </p>
      </section>

      <section id="view">
        <h2>Viewing <em>Candida</em> Biochemical Pathways Pages</h2>
        <p>
          Many items on the pathway diagrams are hyperlinks to detail pages; these links are
          underlined or they appear as colored text.
        </p>
        <ul>
          <li>
            Each <span style={{ color: 'blue' }}>blue reaction line</span> will direct you to the{' '}
            <a href="#rxn">reaction page</a>. Clicking on the E.C. number also takes you to the
            reaction page.
          </li>
          <li>
            Each <span style={{ color: 'gold' }}>gold enzyme name</span> will direct you to the{' '}
            <a href="#enzy">enzyme page</a>.
          </li>
          <li>
            Each <span style={{ color: 'purple' }}>purple gene name</span> will direct you to the
            CGD Locus page.
          </li>
          <li>
            Each <span style={{ color: 'red' }}>red compound name</span> will direct you to the{' '}
            <a href="#comp">compound page</a>.
          </li>
        </ul>

        <div className="info-subsection">
          <h3 id="pwy">Pathways</h3>
          <ul>
            <li>Each pathway is shown on a single page.</li>
            <li>
              There are 5 levels of detail at which each pathway may be viewed. Use the "More
              detail" and "Less detail" buttons at the top of the page to browse the pathway
              detail. If the pathway contains many reactions, only intermediate compounds and
              reaction arrows are displayed initially. If the pathway contains only a few
              reactions, more detailed information, such as gene name and enzyme name, are shown
              as the default.
            </li>
            <li>
              At the most detailed level of view, the compound structure for each intermediate in
              the pathway, the compound structure for all cofactors in the reaction, the gene
              name, and the enzyme name are all displayed on the pathway diagram.
            </li>
            <li>
              Below the pathway diagram, several fields provide additional context for the
              pathway. The "Superclasses" field lists the pathway ontology assignments for the
              pathway. Any sub-pathways that make up the current pathway, or any pathway that
              contains the current pathway within it, are listed under "Subpathways" or
              "Superpathways," respectively.
            </li>
            <li>Any synonyms for the pathway are listed.</li>
            <li>
              The "Summary" contains additional, curated information about the pathway, with
              references. CGD curators are in the process of writing summaries for each pathway.
              Pathways in CGD that correspond to pathways in SGD may also display the SGD pathway
              summary. CGD thanks SGD for their permission to include this information on our
              pathway displays.
            </li>
            <li>
              The "Unification Links" section displays links to corresponding pathway(s) in other
              databases, SGD in particular.
            </li>
            <li>
              "If an enzyme name is shown in bold, there is experimental evidence for this
              enzymatic activity": Please note that CGD is not routinely using this feature. The
              evidence supporting the assignment of each enzyme activity is best assessed by
              visiting the CGD Locus page to peruse the Gene Ontology assignments, which each
              include a code that specifies the type of evidence used to make the annotation, and
              the reference from which the evidence was curated. Enzyme assignments made by the
              Pathway Hole Filler software are denoted upon mouseover of the gold enzyme name on
              the pathway diagram, by a note that says "Inferred computationally without human
              oversight [Green 04]."
            </li>
            <li>
              The "Pathway Evidence Glyph" displays an icon representing the current pathway,
              which is color-coded to represent the evidence used by the Pathway Tools software to
              predict that the pathway occurs in <em>Candida albicans</em>.
            </li>
            <li>
              At the bottom of the page, the reference list is displayed. Each of the entries is a
              hyperlink to the corresponding{' '}
              <a
                href="http://www.ncbi.nlm.nih.gov/sites/entrez/"
                target="_blank"
                rel="noopener noreferrer"
              >
                PubMed
              </a>{' '}
              record.
            </li>
          </ul>

          <h3 id="rxn">Reactions</h3>
          <ul>
            <li>
              Each reaction is displayed on its own page, with the E.C. number of the reaction at
              the top.
            </li>
            <li>
              The reaction page lists details about the chemical reaction, including the
              following:
              <ul>
                <li>E.C. category.</li>
                <li>Name of the enzyme that catalyzes the reaction.</li>
                <li>Gene name.</li>
                <li>Pathways that contain this reaction.</li>
                <li>
                  The compounds and cofactors involved in the reaction, with their chemical
                  structures.
                </li>
                <li>
                  The Unification Links section provides a hyperlink to the corresponding entry on
                  the ExPASy website.
                </li>
              </ul>
            </li>
            <li>
              <strong>Gene-reaction schematic:</strong>
              <ul>
                <li>
                  The gene-reaction schematic is a visual representation of the relationship among
                  a set of genes, enzymes, and reactions.
                </li>
                <li>
                  The blue boxes on the left hand side represent the reactions, the purple boxes
                  on the right hand side represent genes, and the gold circles in the middle
                  represent polypeptides or protein complexes. Depending on which page you are
                  viewing, the appropriate box or circle will be filled in. For example, when
                  viewing the schematic from a reaction page, the reaction box is highlighted.
                </li>
                <li>
                  Each of the boxes and circles is a hyperlink to the corresponding reaction page,
                  enzyme page, or CGD Locus page.
                </li>
                <li>
                  The lines represent the relationship between these objects. A line from the gene
                  to a circle indicates that the gene codes for that polypeptide. A line from a
                  circle to another circle indicates that the gene product is a subunit of that
                  complex. A line from the circle to the reaction indicates that the reaction is
                  catalyzed by that polypeptide or protein complex.
                </li>
              </ul>
            </li>
          </ul>

          <h3 id="enzy">Enzymes</h3>
          <ul>
            <li>
              The enzyme page lists the name of the enzyme, any synonyms or alternative enzyme
              names, the gene that codes for the polypeptide, the gene-reaction schematic
              (described above, under Reactions), the reaction(s) catalyzed by the enzyme, and the
              pathways that contain the current reaction.
            </li>
            <li>If the enzyme catalyzes multiple reactions, they will all be listed.</li>
          </ul>

          <h3 id="comp">Compounds</h3>
          <ul>
            <li>
              The compound page lists the common name of the chemical, any synonyms, the empirical
              formula, the molecular weight, the structure (if available), and the Smiles string
              for the chemical compound. (Smiles is an alternative nomenclature to describe
              chemical structures.)
            </li>
            <li>
              The Unification Links section provides hyperlinks to corresponding entries for the
              compound in other databases, including ChEBI, Ligand (at KEGG), and PubChem.
            </li>
            <li>
              Also listed are reactions in which the chemical compound is a reactant or a product,
              and the pathways that contain these reactions.
            </li>
          </ul>
        </div>
      </section>

      <section id="exp">
        <h2>Using the Expression Viewer</h2>
        <p>
          The Pathway Tools provides a{' '}
          <a
            href="http://pathway.candidagenome.org//ov-expr.shtml"
            target="_blank"
            rel="noopener noreferrer"
          >
            help document
          </a>{' '}
          that includes information about file formats, analysis options, and interpreting
          results.
        </p>
        <p>
          Since the <em>Candida</em> Biochemical Pathways dataset only contains genes that are
          involved in metabolic pathways, only these genes in the dataset will be taken into
          consideration. In addition, if a metabolic enzyme has not been associated with a
          reaction, the results will not be shown on the Overview Diagram. As a consequence, the
          statistics produced by the Pathway Tools may be skewed.
        </p>
      </section>

      <hr className="info-divider" />
    </div>
  );
};

export default BiochemPathwaysHelp;
