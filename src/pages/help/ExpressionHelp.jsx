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
            <li><a href="#expression-data">Expression Data Tab</a></li>
            <li><a href="#coexpression">Co-expression Tab</a></li>
            <li><a href="#heatmap">Understanding the Heatmap</a></li>
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
            <li><strong>Expression Data</strong> - Shows expression levels across experimental conditions</li>
            <li><strong>Co-expression</strong> - Identifies genes with similar expression patterns</li>
          </ul>
        </div>

        <div className="info-section">
          <h2 id="expression-data">Expression Data Tab</h2>
          <p>
            The Expression Data tab displays fold change values for your gene of interest across
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
            You can toggle between different visualization modes:
          </p>
          <ul>
            <li><strong>Bars</strong> - Traditional bar chart showing fold change magnitude</li>
            <li><strong>Heatmap</strong> - Color-coded strip showing expression patterns at a glance</li>
            <li><strong>Both</strong> - Combined view with heatmap strip above bar charts</li>
          </ul>

          <h3>Condition Categories</h3>
          <p>
            Experimental conditions are grouped into categories indicated by colored badges:
          </p>
          <ul>
            <li><strong style={{color: '#9e9e9e'}}>Control</strong> - Baseline/reference conditions</li>
            <li><strong style={{color: '#4caf50'}}>Basic Biology</strong> - Morphology, biofilm, cell type studies</li>
            <li><strong style={{color: '#f44336'}}>Antifungal/Immune</strong> - Drug treatment and immune response</li>
            <li><strong style={{color: '#ff9800'}}>Stress Response</strong> - Oxidative, nitrosative, and other stress conditions</li>
          </ul>
        </div>

        <div className="info-section">
          <h2 id="coexpression">Co-expression Tab</h2>
          <p>
            The Co-expression tab identifies genes with similar expression profiles to your gene
            of interest. Genes that show correlated expression patterns often share biological
            functions or are co-regulated by common transcription factors.
          </p>

          <h3>Controls</h3>
          <ul>
            <li>
              <strong>Organism</strong> - Select the organism/strain to analyze. Expression data
              is specific to each organism's genome assembly.
            </li>
            <li>
              <strong>Metric</strong> - Choose the correlation method:
              <ul>
                <li><strong>Pearson</strong> - Measures linear correlation (most common)</li>
                <li><strong>Spearman</strong> - Rank-based correlation (robust to outliers)</li>
                <li><strong>Cosine</strong> - Measures angle between expression vectors</li>
              </ul>
            </li>
            <li>
              <strong>Limit</strong> - Number of similar genes to display (10-100)
            </li>
          </ul>

          <h3>View Modes</h3>
          <ul>
            <li>
              <strong>Heatmap</strong> (default) - Visual comparison of expression patterns across
              the query gene and similar genes. Each row represents a gene, and each column
              represents an experimental condition.
            </li>
            <li>
              <strong>Table</strong> - Sortable table listing similar genes with correlation
              coefficients, p-values, and gene descriptions.
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2 id="heatmap">Understanding the Heatmap</h2>
          <p>
            The co-expression heatmap provides a visual overview of expression patterns across
            multiple genes and conditions.
          </p>

          <h3>Color Scale</h3>
          <ul>
            <li><strong style={{color: '#c07a7a'}}>Red/Pink</strong> - Upregulated (fold change &gt; 1)</li>
            <li><strong style={{color: '#5f7fa6'}}>Blue</strong> - Downregulated (fold change &lt; 1)</li>
            <li><strong style={{color: '#9e9e9e'}}>Grey</strong> - No significant change (~1x)</li>
            <li><strong style={{color: '#f5f5f5'}}>Light grey</strong> - No data available</li>
          </ul>
          <p>
            Color intensity indicates the magnitude of fold change - darker colors represent
            larger changes from control.
          </p>

          <h3>Category Bar</h3>
          <p>
            The colored bar at the top of the heatmap indicates the experimental category for
            each condition, using the same color scheme as the Expression Data tab.
          </p>

          <h3>Sorting Options</h3>
          <ul>
            <li>
              <strong>By Study</strong> - Groups conditions by their source publication
            </li>
            <li>
              <strong>By Fold Change</strong> - Orders conditions by the query gene's fold change
              magnitude (most extreme first)
            </li>
            <li>
              <strong>Clustered</strong> (default) - Groups similar conditions together based on
              average expression patterns across all displayed genes
            </li>
          </ul>

          <h3>Interactivity</h3>
          <p>
            Hover over any cell in the heatmap to see detailed information including the gene
            name, condition label, exact fold change value, and study name.
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
        </div>

        <div className="info-section">
          <h2 id="interpretation">Interpreting Results</h2>

          <h3>Co-expression Analysis</h3>
          <p>
            High correlation between genes suggests they may:
          </p>
          <ul>
            <li>Be involved in the same biological pathway or process</li>
            <li>Be co-regulated by common transcription factors</li>
            <li>Respond similarly to environmental conditions</li>
            <li>Have related cellular functions</li>
          </ul>

          <h3>Limitations</h3>
          <ul>
            <li>
              <strong>Correlation does not imply causation</strong> - Similar expression patterns
              do not necessarily indicate direct functional relationships.
            </li>
            <li>
              <strong>Condition-dependent</strong> - Co-expression relationships may only hold
              under specific experimental conditions.
            </li>
            <li>
              <strong>RNA vs. protein</strong> - mRNA expression levels do not always correlate
              with protein abundance or activity.
            </li>
          </ul>

          <h3>Tips for Analysis</h3>
          <ul>
            <li>
              Look for genes with high correlation (&gt;0.8) and low p-values (&lt;0.001) for
              the most confident co-expression relationships.
            </li>
            <li>
              Check if co-expressed genes share Gene Ontology (GO) annotations, which may
              indicate functional relationships.
            </li>
            <li>
              Consider the number of shared conditions - correlations based on more conditions
              are more reliable.
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2>Related Help Pages</h2>
          <ul>
            <li><Link to="/help/locus">Locus Page Help</Link></li>
            <li><Link to="/help/go-term-finder">GO Term Finder Help</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ExpressionHelp;
