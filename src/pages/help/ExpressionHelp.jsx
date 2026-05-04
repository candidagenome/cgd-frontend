import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

function ExpressionHelp() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>CGD Help: Expression Data</h1>
        <hr />

        <div className="info-section">
          <h2>Contents</h2>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#organism-selector">Organism Selector & Orthologs</a></li>
            <li><a href="#expression-data">Expression Data Sub-tab</a></li>
            <li><a href="#coexpression">Co-expression Sub-tab</a></li>
            <li><a href="#heatmap">Understanding the Heatmaps</a></li>
            <li><a href="#data-sources">Data Sources</a></li>
            <li><a href="#interpretation">Interpreting Results</a></li>
          </ul>
        </div>

        <hr />

        <div className="info-section">
          <h2 id="overview">Overview</h2>
          <p>
            The Expression tab on locus pages provides RNA-seq based gene expression data
            for <em>Candida</em> species. Expression data is displayed as fold changes relative
            to control conditions within each study, allowing comparison of gene expression
            across different experimental conditions.
          </p>
          <p>
            The Expression tab contains two sub-tabs:
          </p>
          <ul>
            <li><strong>Expression Data</strong> - Shows expression levels across experimental conditions for a single gene</li>
            <li><strong>Co-expression</strong> - Identifies genes with correlated expression patterns (similar genes analysis)</li>
          </ul>
        </div>

        <div className="info-section">
          <h2 id="organism-selector">Organism Selector & Orthologs</h2>
          <p>
            Both sub-tabs include an organism selector that allows you to view expression data
            for the current gene or its orthologs in different <em>Candida</em> species.
          </p>

          <h3>Switching Organisms</h3>
          <p>
            When you select a different organism:
          </p>
          <ul>
            <li>
              If viewing <em>C. albicans</em> HOG1 and you select <em>C. glabrata</em>, the page
              automatically displays data for the <em>C. glabrata</em> ortholog (e.g., CAGL0M11748g)
            </li>
            <li>The page header updates to show the ortholog gene name</li>
            <li>Both Expression Data and Co-expression sub-tabs stay synchronized to the selected organism</li>
          </ul>

          <h3>Ortholog Indicators</h3>
          <p>
            In the organism dropdown, species with ortholog data available are indicated. If no
            ortholog exists in a particular species, expression data may not be available for
            that organism.
          </p>
        </div>

        <div className="info-section">
          <h2 id="expression-data">Expression Data Sub-tab</h2>
          <p>
            The Expression Data sub-tab displays fold change values for your gene of interest across
            multiple experimental conditions from published RNA-seq studies.
          </p>

          <h3>Understanding Fold Change</h3>
          <p>
            Fold change represents the ratio of expression in a test condition compared to a control
            condition:
          </p>
          <ul>
            <li><strong>Fold change &gt; 1</strong> indicates upregulation (higher expression than control)</li>
            <li><strong>Fold change &lt; 1</strong> indicates downregulation (lower expression than control)</li>
            <li><strong>Fold change = 1</strong> indicates no change from control</li>
          </ul>

          <h3>View Options</h3>
          <p>
            Toggle between different visualization modes using the View buttons:
          </p>
          <ul>
            <li><strong>Bars</strong> - Bar charts showing fold change magnitude for each condition, organized by study</li>
            <li><strong>Heatmap</strong> - Compact color-coded strip showing all expression values at a glance</li>
            <li><strong>Both</strong> (default) - Combined view with heatmap strip above the detailed bar charts</li>
          </ul>

          <h3>Category Filter</h3>
          <p>
            Use the "Filter by category" dropdown to focus on specific types of experimental conditions:
          </p>
          <ul>
            <li><strong>Control</strong> - Baseline/reference conditions</li>
            <li><strong>Growth & Morphology</strong> - Growth conditions, morphological switching, biofilm, pH, cell types</li>
            <li><strong>Antifungal Response</strong> - Antifungal drugs, antimicrobial peptides, immune cell interactions</li>
            <li><strong>Stress Response</strong> - Oxidative stress, DNA damage, environmental stressors</li>
          </ul>

          <h3>Heatmap Strip Interactivity</h3>
          <p>
            In the heatmap strip view:
          </p>
          <ul>
            <li><strong>Hover</strong> over any cell to see the condition name, fold change value, and study</li>
            <li><strong>Click</strong> on a cell to scroll directly to that study's detailed view</li>
          </ul>

          <h3>Study Details</h3>
          <p>
            Each study section shows:
          </p>
          <ul>
            <li>Study name and category</li>
            <li>Maximum up/downregulation summary</li>
            <li>Link to PubMed (PMID) for the source publication</li>
            <li>Conditions sorted by fold change magnitude (most extreme first)</li>
            <li>"Show all conditions" toggle for studies with many conditions</li>
          </ul>
        </div>

        <div className="info-section">
          <h2 id="coexpression">Co-expression Sub-tab</h2>
          <p>
            The Co-expression sub-tab identifies genes with similar expression profiles to your gene
            of interest. Genes that show correlated expression patterns often share biological
            functions or are co-regulated by common transcription factors.
          </p>

          <h3>Controls</h3>
          <ul>
            <li>
              <strong>Organism</strong> - Select the organism/strain to analyze. This selector is
              synchronized with the Expression Data sub-tab, so switching organisms in one tab
              updates both tabs.
            </li>
            <li>
              <strong>Direction</strong> - Choose the correlation direction:
              <ul>
                <li><strong>Correlated</strong> (default) - Find genes with similar expression patterns (positive correlation)</li>
                <li><strong>Anticorrelated</strong> - Find genes with opposite expression patterns (negative correlation)</li>
              </ul>
            </li>
            <li>
              <strong>Cutoff |r|</strong> - Set the minimum absolute correlation threshold using the slider.
              Only genes with correlation values at or above this threshold will be displayed.
              <ul>
                <li>Default for Correlated: 0.80 (showing highly correlated genes)</li>
                <li>Default for Anticorrelated: 0.50 (anticorrelations tend to be weaker)</li>
              </ul>
              Adjust the slider to show more or fewer genes based on correlation strength.
            </li>
            <li>
              <strong>Limit</strong> - Maximum number of similar genes to display (10, 20, or 50)
            </li>
          </ul>

          <h3>Export and Analyze</h3>
          <p>
            The export toolbar provides options to work with your gene list:
          </p>
          <ul>
            <li>
              <strong>Copy Gene List</strong> - Copy gene names to clipboard for use in other applications
            </li>
            <li>
              <strong>Download CSV</strong> - Download the full results as a CSV file including gene names,
              descriptions, correlation values, p-values, and shared conditions
            </li>
            <li>
              <strong>GO Term Finder</strong> - Open the gene list in GO Term Finder to identify enriched
              Gene Ontology terms. The organism is automatically pre-selected.
            </li>
            <li>
              <strong>GO Slim Mapper</strong> - Open the gene list in GO Slim Mapper to map genes to
              broader GO Slim categories. The organism is automatically pre-selected.
            </li>
          </ul>

          <h3>View Modes</h3>
          <ul>
            <li>
              <strong>Heatmap</strong> (default) - Visual comparison of expression patterns showing
              the query gene at the top and similar genes below, sorted by correlation strength.
              Each row represents a gene, and each column represents an experimental condition.
            </li>
            <li>
              <strong>Table</strong> - Sortable, paginated table listing similar genes with:
              <ul>
                <li>Gene name (linked to locus page)</li>
                <li>Systematic name</li>
                <li>Description</li>
                <li>Correlation coefficient</li>
                <li>P-value</li>
                <li>Number of shared conditions</li>
              </ul>
            </li>
          </ul>

          <h3>Query Summary</h3>
          <p>
            Above the results, a compact summary bar shows the query gene name (with systematic name),
            selected organism, and number of conditions used in the analysis.
          </p>
        </div>

        <div className="info-section">
          <h2 id="heatmap">Understanding the Heatmaps</h2>
          <p>
            Both the Expression Data heatmap strip and the Co-expression heatmap use the same
            color scheme for consistency.
          </p>

          <h3>Color Scale</h3>
          <ul>
            <li><strong style={{color: '#C41E3A'}}>Crimson Red</strong> - Upregulated (fold change &gt; 1). Darker red indicates larger fold change.</li>
            <li><strong style={{color: '#5080B0'}}>Steel Blue</strong> - Downregulated (fold change &lt; 1). Darker blue indicates larger downregulation.</li>
            <li><strong style={{color: '#f7f7f7', backgroundColor: '#ddd', padding: '0 4px'}}>Near White</strong> - No significant change (~1x fold change)</li>
            <li><strong style={{color: '#666', backgroundColor: '#d0d0d0', padding: '0 4px'}}>Grey</strong> - No data available for this gene/condition combination</li>
          </ul>
          <p>
            Color intensity (opacity) indicates the magnitude of fold change. Changes of 2x or
            greater appear with full intensity, while smaller changes are more subtle.
          </p>

          <h3>Co-expression Heatmap Features</h3>
          <ul>
            <li>
              <strong>Query Gene Row</strong> - The query gene appears at the top with a highlighted
              background for easy reference
            </li>
            <li>
              <strong>Correlation Values</strong> - Each similar gene shows its correlation coefficient
              (r=) next to the gene name
            </li>
            <li>
              <strong>Category Bar</strong> - A colored bar at the top indicates the experimental
              category for each condition:
              <ul>
                <li><span style={{backgroundColor: '#9e9e9e', color: '#fff', padding: '1px 6px', borderRadius: '3px'}}>Control</span></li>
                <li><span style={{backgroundColor: '#4caf50', color: '#fff', padding: '1px 6px', borderRadius: '3px'}}>Growth & Morphology</span></li>
                <li><span style={{backgroundColor: '#f44336', color: '#fff', padding: '1px 6px', borderRadius: '3px'}}>Antifungal Response</span></li>
                <li><span style={{backgroundColor: '#ff9800', color: '#fff', padding: '1px 6px', borderRadius: '3px'}}>Stress Response</span></li>
              </ul>
            </li>
            <li>
              <strong>Hover Info Bar</strong> - A fixed info bar above the heatmap displays details
              for the currently hovered cell: gene name, condition, fold change, category, and study
            </li>
          </ul>

          <h3>Sorting Options (Co-expression Heatmap)</h3>
          <ul>
            <li>
              <strong>By Study</strong> - Groups conditions by their source publication, then
              alphabetically within each study
            </li>
            <li>
              <strong>By Fold Change</strong> - Orders conditions by the query gene's fold change
              magnitude, with most extreme changes first
            </li>
            <li>
              <strong>Clustered</strong> (default) - Groups similar conditions together based on
              average expression patterns across all displayed genes. Upregulated conditions
              appear first.
            </li>
          </ul>

          <h3>Study Filter</h3>
          <p>
            In the Co-expression heatmap, use the "Study" dropdown to focus on conditions from
            a specific study, or select "All studies" to view the complete dataset.
          </p>
        </div>

        <div className="info-section">
          <h2 id="data-sources">Data Sources</h2>
          <p>
            Expression data in CGD is derived from published RNA-seq studies. Each study
            includes multiple experimental conditions compared to appropriate controls.
          </p>

          <h3>Available Organisms</h3>
          <ul>
            <li><em>Candida albicans</em> SC5314</li>
            <li><em>Candida auris</em> B8441</li>
            <li><em>Candida glabrata</em> CBS138</li>
            <li><em>Candida dubliniensis</em> CD36</li>
            <li><em>Candida parapsilosis</em> CDC317</li>
          </ul>

          <h3>Data Processing</h3>
          <p>
            RNA-seq reads were aligned to reference genomes and quantified using standard
            bioinformatics pipelines. Expression values represent mean coverage across the
            gene body, and fold changes are calculated relative to control conditions within
            each study.
          </p>

          <h3>Correlation Caching</h3>
          <p>
            For efficient Co-expression queries, CGD pre-computes and caches pairwise correlations
            for all genes across all available conditions. This enables instant retrieval of
            co-expressed genes without requiring real-time computation.
          </p>
        </div>

        <div className="info-section">
          <h2 id="interpretation">Interpreting Results</h2>

          <h3>Expression Patterns</h3>
          <p>
            When analyzing a gene's expression profile:
          </p>
          <ul>
            <li>
              Look for <strong>consistent patterns</strong> across multiple studies - if a gene is
              upregulated under similar conditions in different experiments, this provides
              stronger evidence for condition-specific regulation
            </li>
            <li>
              Consider the <strong>biological context</strong> of each condition category to
              understand what processes may be regulating your gene
            </li>
            <li>
              Use the <strong>PubMed links</strong> to access the original publications for
              detailed experimental methods and additional context
            </li>
          </ul>

          <h3>Co-expression Analysis</h3>
          <p>
            <strong>Correlated genes</strong> (positive correlation) may:
          </p>
          <ul>
            <li>Be involved in the same biological pathway or process</li>
            <li>Be co-regulated by common transcription factors</li>
            <li>Respond similarly to environmental conditions</li>
            <li>Have related cellular functions</li>
          </ul>
          <p>
            <strong>Anticorrelated genes</strong> (negative correlation) may:
          </p>
          <ul>
            <li>Have opposing roles in regulatory pathways</li>
            <li>Be regulated by competing transcription factors</li>
            <li>Represent alternative cellular states or responses</li>
            <li>Be involved in feedback inhibition mechanisms</li>
          </ul>

          <h3>Correlation Method</h3>
          <p>
            CGD uses <strong>Pearson correlation</strong> to measure the linear relationship
            between gene expression profiles. Pearson correlation values range from -1 to +1:
          </p>
          <ul>
            <li><strong>r = +1</strong> - Perfect positive correlation (identical expression patterns)</li>
            <li><strong>r = 0</strong> - No linear relationship</li>
            <li><strong>r = -1</strong> - Perfect negative correlation (opposite expression patterns)</li>
          </ul>
          <p>
            Generally, correlations above 0.8 (or below -0.5 for anticorrelated genes) are
            considered strong and biologically meaningful.
          </p>

          <h3>Limitations</h3>
          <ul>
            <li>
              <strong>Correlation does not imply causation</strong> - Similar expression patterns
              do not necessarily indicate direct functional relationships.
            </li>
            <li>
              <strong>Condition-dependent</strong> - Co-expression relationships may only hold
              under specific experimental conditions included in the dataset.
            </li>
            <li>
              <strong>RNA vs. protein</strong> - mRNA expression levels do not always correlate
              with protein abundance or activity due to post-transcriptional regulation.
            </li>
            <li>
              <strong>Dataset bias</strong> - Results reflect the conditions represented in
              available RNA-seq studies, which may not cover all relevant biological contexts.
            </li>
          </ul>

          <h3>Tips for Analysis</h3>
          <ul>
            <li>
              For <strong>correlated genes</strong>, look for r &gt; 0.8 and low p-values (&lt;0.001)
              for the most confident co-expression relationships.
            </li>
            <li>
              For <strong>anticorrelated genes</strong>, use a lower threshold (e.g., |r| &gt; 0.3)
              as negative correlations tend to be weaker than positive ones.
            </li>
            <li>
              Use the <strong>GO Term Finder</strong> link to identify enriched biological processes
              among your co-expressed gene set.
            </li>
            <li>
              Consider the number of shared conditions - correlations based on more conditions
              are more reliable.
            </li>
            <li>
              Compare results across different organisms - conserved co-expression relationships
              are more likely to be biologically meaningful.
            </li>
            <li>
              Use the heatmap visualization to identify condition clusters where your gene
              of interest shows the most dramatic expression changes.
            </li>
            <li>
              <strong>Export the gene list</strong> to CSV for further analysis or to share
              with collaborators.
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2>Related Help Pages</h2>
          <ul>
            <li><Link to="/help/locus">Locus Page Help</Link></li>
            <li><Link to="/help/go-term-finder">GO Term Finder Help</Link></li>
            <li><Link to="/help/go-slim">GO Slim Mapper Help</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ExpressionHelp;
