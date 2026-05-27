import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

/**
 * Help page explaining the CRISPR Guide RNA Designer methodology and usage.
 * Written for researchers, not developers.
 */
function CrisprGuideFinderHelp() {
  const [showScoringDetails, setShowScoringDetails] = useState(false);
  const [showBenchmarkDetails, setShowBenchmarkDetails] = useState(false);

  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>About the CRISPR Guide RNA Designer</h1>
        <hr />

        <div className="info-section">
          <h2>Overview</h2>
          <p>
            The CRISPR Guide RNA Designer is a tool for designing single guide RNAs (sgRNAs)
            for CRISPR-Cas gene editing experiments in <em>Candida</em> species. It identifies
            potential guide sequences within your target gene or DNA sequence, predicts their
            on-target efficiency, searches for potential off-target sites across the genome,
            and generates cloning primers for common CRISPR vectors.
          </p>
          <p>
            This tool is designed to help researchers quickly identify high-quality guides
            for gene knockout, knockdown, or modification experiments. <strong>We recommend
            validating top candidates experimentally before proceeding with final experiments.</strong>
          </p>
        </div>

        <div className="info-section">
          <h2>Quick Start</h2>
          <ol>
            <li>
              <strong>Enter your target:</strong> Provide a gene name (e.g., HOG1, EFG1, ALS3)
              or paste a DNA sequence directly
            </li>
            <li>
              <strong>Select organism:</strong> Choose the <em>Candida</em> species you are
              working with
            </li>
            <li>
              <strong>Choose target region:</strong> For gene knockouts, the 5&apos; region
              (first 20% of CDS) is recommended
            </li>
            <li>
              <strong>Configure CRISPR system:</strong> Select your PAM sequence and
              guide length
            </li>
            <li>
              <strong>Enable off-target checking:</strong> Recommended for final guide
              selection (takes 1-2 minutes)
            </li>
            <li>
              <strong>Click &quot;Design Guides&quot;:</strong> The tool will find all
              potential guides and rank them by predicted quality
            </li>
          </ol>
        </div>

        <div className="info-section">
          <h2>How to Choose a Good Guide</h2>
          <p>
            When selecting guides for your experiment, prioritize guides that:
          </p>
          <ul>
            <li>
              <strong>Have high specificity</strong> — ideally 100 if off-target checking
              was performed. This means no off-targets were detected.
            </li>
            <li>
              <strong>Have reasonable efficiency</strong> — higher efficiency scores
              (50+) predict better cutting activity.
            </li>
            <li>
              <strong>Are in the 5&apos; region</strong> — for knockout experiments,
              early frameshifts are most effective.
            </li>
            <li>
              <strong>Have moderate GC content</strong> — 40–60% is optimal. Extreme
              GC can affect stability or cause secondary structures.
            </li>
            <li>
              <strong>Have no warning flags</strong> — avoid guides with Poly-T,
              off-targets in related genes, or other warnings.
            </li>
            <li>
              <strong>Are marked &quot;Recommended&quot;</strong> — these guides passed
              computational filters including verified specificity.
            </li>
          </ul>
          <p>
            <strong>Important:</strong> Always validate 2-3 guides experimentally before
            proceeding with final experiments.
          </p>
        </div>

        <div className="info-section">
          <h2>Understanding the Results</h2>

          <h3>Guide Table Columns</h3>
          <table className="snapshot-table">
            <thead>
              <tr>
                <th>Column</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Rank</strong></td>
                <td style={{textAlign: 'left'}}>
                  Guides are ranked by a combined penalty score. Lower penalty = better rank.
                  Top guides are marked with a ★ if they pass quality filters.
                </td>
              </tr>
              <tr>
                <td><strong>Guide Sequence</strong></td>
                <td style={{textAlign: 'left'}}>
                  The 20bp (or configured length) guide RNA sequence
                </td>
              </tr>
              <tr>
                <td><strong>PAM</strong></td>
                <td style={{textAlign: 'left'}}>
                  The PAM sequence adjacent to the guide
                </td>
              </tr>
              <tr>
                <td><strong>Position</strong></td>
                <td style={{textAlign: 'left'}}>
                  Position within the target sequence (1-based). (+) indicates
                  sense strand, (-) indicates antisense strand.
                </td>
              </tr>
              <tr>
                <td><strong>Efficiency</strong></td>
                <td style={{textAlign: 'left'}}>
                  Predicted on-target cutting efficiency (0-100). Higher is better.
                </td>
              </tr>
              <tr>
                <td><strong>Specificity</strong></td>
                <td style={{textAlign: 'left'}}>
                  Off-target risk score (0-100). 100 = no off-targets detected.
                  Shows &quot;—&quot; if off-target checking was not performed.
                </td>
              </tr>
              <tr>
                <td><strong>GC%</strong></td>
                <td style={{textAlign: 'left'}}>
                  GC content of the guide. Optimal range is 40-70%.
                </td>
              </tr>
              <tr>
                <td><strong>Flags</strong></td>
                <td style={{textAlign: 'left'}}>
                  Status indicators including &quot;Recommended&quot; or warning flags.
                </td>
              </tr>
            </tbody>
          </table>

          <h3>The &quot;Recommended&quot; Badge</h3>
          <p>
            A guide is marked <strong>Recommended</strong> when it passes the main quality filters:
          </p>
          <ul>
            <li>Off-target checking was performed and specificity is 100 (no off-targets)</li>
            <li>Efficiency score is at least 50</li>
            <li>No major warning flags</li>
          </ul>
          <p>
            <strong>Note:</strong> &quot;Recommended&quot; means the guide passed computational
            filters. It does not replace experimental validation.
          </p>

          <h3>Warning Flags</h3>
          <ul>
            <li>
              <strong>Not verified</strong> — Off-target checking was not performed.
              Specificity is unknown.
            </li>
            <li>
              <strong>OT:N</strong> — Off-target count. Number of potential off-target
              sites found with 0-3 mismatches.
            </li>
            <li>
              <strong>Related</strong> — Off-targets detected in paralog or ortholog genes.
              These may affect related biological pathways.
            </li>
            <li>
              <strong>T4</strong> — Guide contains TTTT (Poly-T), which can cause
              premature termination of RNA Pol III transcription.
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2>Off-Target Checking</h2>
          <p>
            Off-target analysis identifies potential unintended cut sites across the genome.
            This is critical for ensuring your guide is specific to your target gene.
          </p>

          <h3>When Off-Target Checking is Enabled</h3>
          <ul>
            <li>Off-target search is performed for the <strong>top-ranked guides</strong></li>
            <li>Specificity scores are calculated based on off-targets found</li>
            <li>Guides with no off-targets (specificity 100) are marked &quot;Recommended&quot;</li>
          </ul>

          <h3>When Off-Target Checking is Disabled or Unavailable</h3>
          <ul>
            <li>Specificity shows as &quot;—&quot; (not checked)</li>
            <li>Guides are ranked by efficiency and position only</li>
            <li>No guides are marked as &quot;Recommended&quot;</li>
          </ul>
          <p>
            <strong>Important:</strong> Specificity scores are only meaningful when off-target
            analysis has been performed. If specificity shows &quot;—&quot;, the guide has
            not been validated for off-targets.
          </p>

          <h3>Diploid Genome Handling</h3>
          <p>
            <em>C. albicans</em> SC5314 is diploid with A and B allele chromosomes.
            The tool automatically:
          </p>
          <ul>
            <li>Identifies allelic pairs (same position on A and B chromosomes)</li>
            <li>Excludes the on-target site and its allelic copy from off-target counts</li>
            <li>Reports only true off-targets in other genes</li>
          </ul>
        </div>

        <div className="info-section">
          <h2>Input Options</h2>

          <h3>Gene Name Input</h3>
          <p>
            Enter a standard gene name (e.g., HOG1), systematic name (e.g., C1_06980C_A),
            or CGD identifier (e.g., CAL0000182). The tool will look up the gene in the
            CGD database and retrieve its coding sequence.
          </p>

          <h3>DNA Sequence Input</h3>
          <p>
            Alternatively, paste any DNA sequence (up to 50kb) directly. The sequence can
            be in FASTA format or raw nucleotide sequence. Non-ACGT characters will be
            removed automatically.
          </p>

          <h3>Target Region</h3>
          <table className="snapshot-table">
            <thead>
              <tr>
                <th>Region</th>
                <th>Description</th>
                <th>Use Case</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>5&apos; Region</strong></td>
                <td style={{textAlign: 'left'}}>First 20% of coding sequence</td>
                <td style={{textAlign: 'left'}}>
                  Recommended for knockouts — early frameshift mutations are most
                  likely to abolish protein function
                </td>
              </tr>
              <tr>
                <td><strong>3&apos; Region</strong></td>
                <td style={{textAlign: 'left'}}>Last 20% of coding sequence</td>
                <td style={{textAlign: 'left'}}>
                  Useful for C-terminal tagging or when 5&apos; guides are poor
                </td>
              </tr>
              <tr>
                <td><strong>Full CDS</strong></td>
                <td style={{textAlign: 'left'}}>Entire coding sequence</td>
                <td style={{textAlign: 'left'}}>
                  When you need maximum guide options or are targeting
                  a specific domain
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="info-section">
          <h2>Supported CRISPR Systems</h2>

          <table className="snapshot-table">
            <thead>
              <tr>
                <th>PAM</th>
                <th>System</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>NGG</strong></td>
                <td>SpCas9</td>
                <td style={{textAlign: 'left'}}>
                  Most common CRISPR system. For SpCas9 systems, the PAM is located
                  immediately 3&apos; of the guide sequence. Works well in <em>Candida</em>.
                </td>
              </tr>
              <tr>
                <td><strong>NAG</strong></td>
                <td>SpCas9</td>
                <td style={{textAlign: 'left'}}>
                  Alternative SpCas9 PAM with lower efficiency. Use when
                  NGG sites are limited.
                </td>
              </tr>
              <tr>
                <td><strong>NNGRRT</strong></td>
                <td>SaCas9</td>
                <td style={{textAlign: 'left'}}>
                  Smaller Cas9 from <em>S. aureus</em>. Useful for delivery
                  in size-constrained systems.
                </td>
              </tr>
              <tr>
                <td><strong>TTTV</strong></td>
                <td>Cas12a (Cpf1)</td>
                <td style={{textAlign: 'left'}}>
                  For Cas12a/Cpf1 systems, the PAM is located 5&apos; of the
                  guide sequence. Creates staggered cuts; good for HDR.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="info-section">
          <h2>Limitations and Caveats</h2>
          <ul>
            <li>
              <strong>Computational predictions:</strong> Efficiency and specificity
              scores are predictions based on sequence features. Experimental validation
              is recommended for important guides.
            </li>
            <li>
              <strong>Off-target search scope:</strong> Off-target analysis is performed
              for top-ranked guides only (for performance reasons). Lower-ranked guides
              may show efficiency scores only; their specificity is not verified unless
              off-target checking was performed.
            </li>
            <li>
              <strong>Chromatin accessibility:</strong> This tool does not account
              for chromatin state, which can affect guide efficiency in vivo.
            </li>
            <li>
              <strong>Strain variation:</strong> Guide design is based on the
              reference genome. Your strain may have sequence polymorphisms
              affecting guide binding.
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2>Benchmark Summary</h2>
          <p>
            We validated CGD&apos;s guide rankings against two widely-used CRISPR design
            tools: <strong>CHOPCHOP</strong> and <strong>CRISPOR</strong>, comparing rankings
            across 20 <em>C. albicans</em> genes.
          </p>
          <p>
            <strong>Key result:</strong> In a benchmark of 20 genes, CGD recovered about
            50–56% of external tools&apos; strict top-10 guides. When CGD&apos;s top 20
            guides were considered, overlap increased to about 79%, suggesting that most
            differences are due to ranking order rather than missing candidate guides.
          </p>
          <p>
            Match rate measures overlap between tools, not biological correctness. Each
            tool uses different efficiency, specificity, filtering, and ranking criteria,
            so some differences are expected.
          </p>

          <button
            onClick={() => setShowBenchmarkDetails(!showBenchmarkDetails)}
            style={{
              background: 'none',
              border: '1px solid #1976d2',
              color: '#1976d2',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            {showBenchmarkDetails ? '▼ Hide detailed comparison' : '▶ Show detailed comparison'}
          </button>

          {showBenchmarkDetails && (
            <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <h4>Top 10 Guide Comparison (20 Genes)</h4>
              <table className="snapshot-table">
                <thead>
                  <tr>
                    <th>Comparison</th>
                    <th>Overlap</th>
                    <th>Match Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>CHOPCHOP top 10 in CGD top 10</td>
                    <td>78/140</td>
                    <td><strong>55.7%</strong></td>
                  </tr>
                  <tr>
                    <td>CHOPCHOP top 10 in CRISPOR top 10</td>
                    <td>76/140</td>
                    <td>54.3%</td>
                  </tr>
                  <tr>
                    <td>CRISPOR top 10 in CGD top 10</td>
                    <td>104/200</td>
                    <td>52.0%</td>
                  </tr>
                </tbody>
              </table>
              <p style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
                <em>Note: CHOPCHOP returned fewer than 10 guides for some genes,
                so CHOPCHOP-based comparisons use 140 possible guides instead of 200.</em>
              </p>

              <h4>Extended Comparison (Top 20)</h4>
              <table className="snapshot-table">
                <thead>
                  <tr>
                    <th>Comparison</th>
                    <th>Match Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>CHOPCHOP top 10 in CGD top 20</td>
                    <td><strong>78.6%</strong> (110/140)</td>
                  </tr>
                  <tr>
                    <td>CRISPOR top 10 in CGD top 20</td>
                    <td><strong>79.5%</strong> (159/200)</td>
                  </tr>
                </tbody>
              </table>
              <p style={{ marginTop: '10px' }}>
                Test genes: ALS1, ALS3, HWP1, ECE1, SAP1, SAP2, EFG1, CPH1,
                WOR1, BCR1, HOG1, RAS1, CDC42, CEK1, ACT1, TUB1, PHR1, CHT2, CDR1, ERG11.
              </p>
            </div>
          )}
        </div>

        <div className="info-section">
          <h2>Advanced: Scoring Methodology</h2>
          <p>
            This section provides technical details about how CGD calculates efficiency
            and ranks guides. Most users can skip this section.
          </p>

          <button
            onClick={() => setShowScoringDetails(!showScoringDetails)}
            style={{
              background: 'none',
              border: '1px solid #1976d2',
              color: '#1976d2',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            {showScoringDetails ? '▼ Hide scoring details' : '▶ Show scoring details'}
          </button>

          {showScoringDetails && (
            <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <h4>Efficiency Score (Doench 2016 Rule Set 2)</h4>
              <p>
                The efficiency score uses the <strong>Doench 2016 Rule Set 2 (Azimuth)</strong>
                algorithm, which is also supported by widely used CRISPR design tools such as
                CHOPCHOP and CRISPOR. This model analyzes a 30-nucleotide context around each guide:
              </p>
              <ul>
                <li>4 nucleotides upstream of the guide</li>
                <li>20 nucleotides of the guide sequence</li>
                <li>3 nucleotides of the PAM (NGG)</li>
                <li>3 nucleotides downstream of the PAM</li>
              </ul>
              <p>
                The model uses position-specific nucleotide and dinucleotide features trained
                on experimental data to predict cutting efficiency.
              </p>

              <h4>Specificity Score</h4>
              <p>
                The specificity score (0-100) reflects off-target risk. Off-targets are weighted
                by mismatch count:
              </p>
              <ul>
                <li>0 mismatches (perfect match): penalty 50 — very high risk</li>
                <li>1 mismatch: penalty 20 — high risk</li>
                <li>2 mismatches: penalty 5 — moderate risk</li>
                <li>3 mismatches: penalty 1 — low risk</li>
              </ul>
              <p>
                Final score: 100 / (1 + total_penalty/10). A score of 100 means no off-targets
                were detected.
              </p>

              <h4>CGD Guide Ranking Algorithm</h4>
              <p>
                Guides are ranked by a combined penalty score inspired by CHOPCHOP-style
                ranking, with CGD-specific adjustments for <em>Candida</em> gene knockout experiments:
              </p>
              <table className="snapshot-table">
                <thead>
                  <tr>
                    <th>Factor</th>
                    <th>Weight</th>
                    <th>Effect</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Off-targets</strong></td>
                    <td>Highest</td>
                    <td style={{textAlign: 'left'}}>
                      Perfect matches: +10,000; 1mm: +1,000; 2mm: +200; 3mm: +50
                    </td>
                  </tr>
                  <tr>
                    <td><strong>5&apos; Position</strong></td>
                    <td>High</td>
                    <td style={{textAlign: 'left'}}>
                      Early guides get bonus (up to -6,000 at gene start, decaying to
                      -2,000 at 50% position)
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Efficiency</strong></td>
                    <td>Moderate</td>
                    <td style={{textAlign: 'left'}}>
                      Higher efficiency reduces penalty
                    </td>
                  </tr>
                  <tr>
                    <td><strong>GC Content</strong></td>
                    <td>Low</td>
                    <td style={{textAlign: 'left'}}>
                      Penalty if outside 40-70% range
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="info-section">
          <h2>Cloning Primers</h2>
          <p>
            The tool generates ready-to-order oligonucleotides for cloning guides into
            common CRISPR vectors. Primers include appropriate overhangs for the selected
            cloning system.
          </p>

          <h3>pX330 (BbsI)</h3>
          <p>
            Addgene plasmid #42230. Human codon-optimized SpCas9 with U6 promoter
            driving sgRNA expression.
          </p>
          <ul>
            <li>Forward primer: 5&apos;-CACCG + guide-3&apos;</li>
            <li>Reverse primer: 5&apos;-AAAC + reverse_complement + C-3&apos;</li>
          </ul>

          <h3>Notes on Cloning</h3>
          <ul>
            <li>
              If your guide does not start with G, an extra G is added for efficient
              U6 transcription.
            </li>
            <li>
              Check that your guide sequence does not contain BbsI sites (GAAGAC).
            </li>
            <li>
              For <em>Candida</em>-specific vectors (e.g., pV1093), contact CGD for
              updated primer designs.
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2>Gene Annotations</h2>
          <p>
            When you search by gene name, the results page displays biological context
            from CGD to help you understand your target:
          </p>
          <ul>
            <li>
              <strong>Essential:</strong> Genes with housekeeping functions or high
              conservation. May be difficult to delete completely.
            </li>
            <li>
              <strong>Virulence categories:</strong> Adhesins, biofilm formation,
              morphogenesis, secreted enzymes, stress response.
            </li>
            <li>
              <strong>Phenotypes:</strong> Number of experimental phenotypes annotated
              in CGD.
            </li>
            <li>
              <strong>Orthologs:</strong> Conservation across other Candida species.
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2>Supported Organisms</h2>
          <p>
            The CRISPR Guide Designer supports all <em>Candida</em> species with
            sequenced genomes in CGD:
          </p>
          <ul>
            <li><em>Candida albicans</em> SC5314 (Assembly 22, 21, 19)</li>
            <li><em>Candida auris</em> B8441</li>
            <li><em>Candida glabrata</em> CBS138</li>
            <li><em>Candida dubliniensis</em> CD36</li>
            <li><em>Candida parapsilosis</em> CDC317</li>
          </ul>
          <p>
            Off-target search is available for organisms with indexed BLAST databases.
          </p>
        </div>

        <div className="info-section">
          <h2>Tips for Successful Experiments</h2>
          <ol>
            <li>
              <strong>Choose multiple guides:</strong> Design and validate 2-3 guides
              per target for backup and to distinguish on-target from off-target effects.
            </li>
            <li>
              <strong>Prioritize specificity:</strong> For phenotype analysis, choose
              guides with specificity 100 (no off-targets).
            </li>
            <li>
              <strong>Enable off-target checking:</strong> Guides without off-target
              validation should not be used for final experiments.
            </li>
            <li>
              <strong>Validate experimentally:</strong> Use T7E1 assay or sequencing
              to confirm editing before downstream experiments.
            </li>
          </ol>
        </div>

        <div className="info-section">
          <h2>References</h2>
          <ul>
            <li>
              Doench JG, Fusi N, Sullender M, et al. (2016). Optimized sgRNA design
              to maximize activity and minimize off-target effects of CRISPR-Cas9.{' '}
              <em>Nature Biotechnology</em> 34:184-191.
              <a
                href="https://doi.org/10.1038/nbt.3437"
                target="_blank"
                rel="noopener noreferrer"
                style={{marginLeft: '8px'}}
              >
                DOI
              </a>
            </li>
            <li>
              Labun K, Montague TG, Krause M, Torres Cleuren YN, Tjeldnes H,
              Valen E (2019). CHOPCHOP v3: expanding the CRISPR web toolbox beyond
              genome editing. <em>Nucleic Acids Research</em> 47:W171-W174.
              <a
                href="https://doi.org/10.1093/nar/gkz365"
                target="_blank"
                rel="noopener noreferrer"
                style={{marginLeft: '8px'}}
              >
                DOI
              </a>
            </li>
            <li>
              Vyas VK, Barrasa MI, Fink GR (2015). A Candida albicans CRISPR system
              permits genetic engineering of essential genes and gene families.{' '}
              <em>Science Advances</em> 1:e1500248.
              <a
                href="https://doi.org/10.1126/sciadv.1500248"
                target="_blank"
                rel="noopener noreferrer"
                style={{marginLeft: '8px'}}
              >
                DOI
              </a>
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2>Feedback</h2>
          <p>
            This is a preview release of the CRISPR Guide RNA Designer. We welcome
            your feedback to help improve this tool.
          </p>
          <p>
            Please <Link to="/contact">contact CGD</Link> with bug reports,
            feature suggestions, or questions.
          </p>
        </div>

        <div className="info-section">
          <h2>Citation</h2>
          <p>
            If you use the CRISPR Guide RNA Designer in your research, please cite CGD:
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
          <Link to="/crispr" style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#1976d2',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px'
          }}>
            ← Back to CRISPR Guide Designer
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CrisprGuideFinderHelp;
