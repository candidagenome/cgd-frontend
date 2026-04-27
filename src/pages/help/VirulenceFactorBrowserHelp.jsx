import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

/**
 * Help page explaining the Virulence Factor Browser methodology and limitations.
 * Written for researchers, not developers.
 */
function VirulenceFactorBrowserHelp() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>About the Virulence Factor Browser</h1>
        <hr />

        <div className="info-section">
          <h2>Overview</h2>
          <p>
            The Virulence Factor Browser is a tool for exploring <em>Candida</em> genes
            that have evidence linking them to virulence, pathogenesis, or host interaction.
            It aggregates data from multiple sources—including phenotype annotations,
            GO terms, and curated literature—to help researchers identify and prioritize
            genes of interest for virulence studies.
          </p>
          <p>
            This tool is designed to be a starting point for hypothesis generation,
            not a definitive list of all virulence factors. We encourage users to
            explore the underlying evidence and consult primary literature.
          </p>
        </div>

        <div className="info-section">
          <h2>How Genes Are Selected</h2>
          <p>
            Genes are included in the Virulence Factor Browser if they match one or more
            of the following criteria:
          </p>

          <h3>Virulence Categories</h3>
          <table className="snapshot-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Selection Criteria</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Adhesins</strong></td>
                <td style={{textAlign: 'left'}}>
                  GO annotations for cell adhesion or adhesion to host; gene names
                  matching adhesin families (ALS, HWP, EPA, etc.)
                </td>
              </tr>
              <tr>
                <td><strong>Secreted Enzymes</strong></td>
                <td style={{textAlign: 'left'}}>
                  GO annotations for protease, lipase, or phospholipase activity;
                  gene names matching secreted enzyme families (SAP, LIP, PLC, etc.)
                </td>
              </tr>
              <tr>
                <td><strong>Morphogenesis</strong></td>
                <td style={{textAlign: 'left'}}>
                  GO annotations for invasive filamentous growth; phenotypes related
                  to hyphal formation or morphological switching
                </td>
              </tr>
              <tr>
                <td><strong>Host Interaction</strong></td>
                <td style={{textAlign: 'left'}}>
                  GO annotations for interaction with host, symbiont development,
                  or host cell entry
                </td>
              </tr>
              <tr>
                <td><strong>Biofilm Formation</strong></td>
                <td style={{textAlign: 'left'}}>
                  GO annotations for biofilm formation or biofilm matrix;
                  phenotypes related to biofilm development
                </td>
              </tr>
              <tr>
                <td><strong>Immune Evasion</strong></td>
                <td style={{textAlign: 'left'}}>
                  GO annotations for evasion or perturbation of host immune response
                </td>
              </tr>
              <tr>
                <td><strong>Drug Resistance</strong></td>
                <td style={{textAlign: 'left'}}>
                  GO annotations for response to drugs or antibiotics;
                  phenotypes related to antifungal resistance
                </td>
              </tr>
            </tbody>
          </table>

          <h3>Additional Selection Methods</h3>
          <ul>
            <li>
              <strong>Phenotype annotations:</strong> Genes with phenotypes mentioning
              virulence, pathogenesis, host killing, infection, or colonization.
              Note: Phenotypes with a "Normal" qualifier (indicating no phenotypic
              effect) are excluded from selection and scoring.
            </li>
            <li>
              <strong>Literature topics:</strong> Genes associated with disease-related
              literature in CGD
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2>Understanding Confidence Scores</h2>
          <p>
            Each gene is assigned a confidence score (0–20) and tier (High, Medium, Low)
            based on the quality and directness of the evidence linking it to virulence.
          </p>
          <p>
            <strong>Important:</strong> The confidence score reflects the strength of
            {' '}<em>virulence-specific evidence</em>, not overall clinical importance or
            how well-studied a gene is. For example, drug resistance genes like ERG11
            may have lower confidence scores because drug resistance is considered
            indirect virulence evidence, even though these genes are clinically important
            therapeutic targets.
          </p>

          <h3>Confidence Tiers</h3>
          <table className="snapshot-table">
            <thead>
              <tr>
                <th>Tier</th>
                <th>Score Range</th>
                <th>Interpretation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>High</strong></td>
                <td>10–20</td>
                <td style={{textAlign: 'left'}}>
                  Strong, direct evidence from virulence phenotypes
                  or host interaction studies
                </td>
              </tr>
              <tr>
                <td><strong>Medium</strong></td>
                <td>5–9</td>
                <td style={{textAlign: 'left'}}>
                  Moderate evidence from phenotype data
                  or well-supported GO annotations
                </td>
              </tr>
              <tr>
                <td><strong>Low</strong></td>
                <td>0–4</td>
                <td style={{textAlign: 'left'}}>
                  Indirect or limited evidence; may be based primarily on
                  sequence similarity, gene family membership, or keyword matches
                </td>
              </tr>
            </tbody>
          </table>

          <h3>What Contributes to Higher Scores</h3>
          <ul>
            <li>Virulence phenotypes (non-normal qualifier) (+5 points)</li>
            <li>Direct virulence or pathogenesis phenotypes (+4 points)</li>
            <li>Host interaction phenotypes (+3 points)</li>
            <li>GO annotations for host interaction with manual evidence (IDA, IMP, etc.) (+4 points)</li>
            <li>GO annotations for host interaction with computational evidence (IEA) (+3 points)</li>
            <li>Other GO annotations with manual evidence (+2 points)</li>
            <li>Disease-related literature association (+2 points)</li>
          </ul>

          <h3>Note on Drug Resistance Genes</h3>
          <p>
            Genes in the Drug Resistance category (ERG11, CDR1, FKS1, etc.) may have
            lower confidence scores because drug resistance/susceptibility phenotypes
            are classified as indirect virulence evidence. This reflects the biological
            distinction that drug resistance affects treatment outcomes rather than
            directly causing disease. However, these genes are often clinically important
            and well-studied. Users interested in antifungal targets should filter by
            the "Drug Resistance" category rather than relying solely on confidence scores.
          </p>

          <h3>Housekeeping Gene Adjustment</h3>
          <p>
            Genes identified as likely housekeeping or essential genes receive a
            score penalty (−3 points). This adjustment reflects that while these
            genes may be required for virulence, they are also required for basic
            cellular function and may not be virulence-specific targets.
          </p>
          <p>
            Housekeeping genes are identified by:
          </p>
          <ul>
            <li>GO annotations for core cellular processes (translation, DNA replication, etc.)</li>
            <li>High conservation across all five <em>Candida</em> species in CGD</li>
          </ul>
        </div>

        <div className="info-section">
          <h2>Evidence Types</h2>
          <p>
            Evidence is classified into tiers based on how directly it demonstrates
            a role in virulence:
          </p>

          <table className="snapshot-table">
            <thead>
              <tr>
                <th>Evidence Tier</th>
                <th>Examples</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Tier 1: Direct Virulence</strong></td>
                <td style={{textAlign: 'left'}}>
                  Virulence assays, pathogenesis studies, host killing,
                  infection models, colonization defects
                </td>
              </tr>
              <tr>
                <td><strong>Tier 2: Host Interaction</strong></td>
                <td style={{textAlign: 'left'}}>
                  Phagocytosis, macrophage survival, epithelial/endothelial
                  cell interaction, <em>Galleria</em> or mouse model studies
                </td>
              </tr>
              <tr>
                <td><strong>Tier 3: Stress Response</strong></td>
                <td style={{textAlign: 'left'}}>
                  Oxidative stress response, heat shock, antifungal drug response
                </td>
              </tr>
              <tr>
                <td><strong>Tier 4: Indirect</strong></td>
                <td style={{textAlign: 'left'}}>
                  Drug resistance/susceptibility phenotypes, general stress sensitivity
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="info-section">
          <h2>Data Sources</h2>
          <p>
            The Virulence Factor Browser integrates data from multiple sources
            curated by CGD:
          </p>
          <ul>
            <li>
              <strong>Phenotype annotations:</strong> Manually curated from primary
              literature by CGD curators. Only phenotypes with non-normal qualifiers
              are included.
            </li>
            <li>
              <strong>GO annotations:</strong> Gene Ontology annotations from CGD
              curation (manual evidence: IDA, IMP, IGI, etc.) and computational
              pipelines (IEA). Manual evidence is weighted more heavily in scoring.
              Evidence codes are displayed in the evidence panel.
            </li>
            <li>
              <strong>Literature associations:</strong> References linked to genes
              in CGD, including disease-related topic tags
            </li>
            <li>
              <strong>Ortholog data:</strong> Cross-species relationships from the
              Candida Gene Order Browser (CGOB)
            </li>
            <li>
              <strong>Gene descriptions:</strong> Curated headlines and summaries
              from CGD locus pages
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2>Ortholog Information</h2>
          <p>
            For each gene, the browser shows orthologs across other <em>Candida</em> species
            in CGD. Orthologs are determined using CGOB (Candida Gene Order Browser)
            homology data.
          </p>
          <p>
            Species are displayed in order of clinical relevance:
          </p>
          <ol>
            <li><em>C. auris</em> — emerging multidrug-resistant pathogen</li>
            <li><em>C. glabrata</em> — common clinical isolate with increasing resistance</li>
            <li><em>C. albicans</em> — most common <em>Candida</em> pathogen</li>
            <li><em>C. tropicalis</em>, <em>C. parapsilosis</em>, <em>C. dubliniensis</em></li>
          </ol>
          <p>
            Click "View" to explore ortholog relationships in the{' '}
            <Link to="/synteny-browser">Synteny Browser</Link>.
          </p>
        </div>

        <div className="info-section">
          <h2>Limitations and Caveats</h2>
          <p>
            <strong>Please consider the following when using this tool:</strong>
          </p>
          <ul>
            <li>
              <strong>Not exhaustive:</strong> This browser captures genes with
              existing evidence in CGD. Novel or poorly characterized virulence
              factors may not be included.
            </li>
            <li>
              <strong>Evidence quality varies:</strong> Some genes have extensive
              experimental validation while others are included based on sequence
              similarity or computational predictions. Always check the confidence
              tier and underlying evidence.
            </li>
            <li>
              <strong>Species-specific effects:</strong> Virulence mechanisms may
              differ between <em>Candida</em> species. A gene important for virulence
              in <em>C. albicans</em> may have different roles in other species.
            </li>
            <li>
              <strong>Context-dependent:</strong> Virulence is influenced by host
              factors, infection site, and experimental conditions. A gene's role
              may vary depending on context.
            </li>
            <li>
              <strong>Housekeeping genes:</strong> Some essential genes appear in
              the browser because deletion affects virulence. However, these genes
              are required for basic cellular function and may not be ideal
              therapeutic targets.
            </li>
            <li>
              <strong>Automated summaries:</strong> Gene summaries are generated
              algorithmically based on available evidence. They should be verified
              against primary literature for critical applications.
            </li>
            <li>
              <strong>Ongoing curation:</strong> CGD continuously updates its data.
              The virulence factor list will evolve as new literature is curated.
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2>How to Use This Tool</h2>
          <ol>
            <li>
              <strong>Filter by category:</strong> Focus on specific virulence
              mechanisms (adhesins, biofilm, etc.)
            </li>
            <li>
              <strong>Filter by organism:</strong> View genes from specific{' '}
              <em>Candida</em> species
            </li>
            <li>
              <strong>Sort by confidence:</strong> Prioritize genes with stronger
              evidence
            </li>
            <li>
              <strong>Review evidence:</strong> Click on a gene to see the specific
              evidence (phenotypes, GO terms, literature) supporting its inclusion
            </li>
            <li>
              <strong>Explore orthologs:</strong> Compare virulence factors across
              species using the ortholog column and synteny browser
            </li>
            <li>
              <strong>Export data:</strong> Download results for further analysis
            </li>
          </ol>
        </div>

        <div className="info-section">
          <h2>Feedback</h2>
          <p>
            This is a preview release of the Virulence Factor Browser. We welcome
            your feedback to help improve this tool.
          </p>
          <p>
            Please <Link to="/contact">contact CGD</Link> with:
          </p>
          <ul>
            <li>Suggestions for additional genes or categories</li>
            <li>Reports of incorrect or missing information</li>
            <li>Ideas for new features or improvements</li>
            <li>Questions about the methodology</li>
          </ul>
        </div>

        <div className="info-section">
          <h2>Citation</h2>
          <p>
            If you use the Virulence Factor Browser in your research, please cite CGD:
          </p>
          <div className="cite-example">
            <p>
              Lew-Smith J, Binkley J, Sherlock G (2025). The Candida Genome Database:
              annotation and visualization updates.{' '}
              <a
                href="https://academic.oup.com/genetics/article/229/3/iyae195/7924788"
                target="_blank"
                rel="noopener noreferrer"
              >
                Genetics, Volume 229, Issue 3, March 2025
              </a>
            </p>
          </div>
        </div>

        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
          <Link to="/virulence-factor-browser" style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#1976d2',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px'
          }}>
            ← Back to Virulence Factor Browser
          </Link>
        </div>
      </div>
    </div>
  );
}

export default VirulenceFactorBrowserHelp;
