import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

/**
 * Help page explaining the CRISPR Guide RNA Designer methodology and usage.
 * Written for researchers, not developers.
 */
function CrisprGuideFinderHelp() {
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
            for gene knockout, knockdown, or modification experiments. We recommend validating
            top candidates experimentally before proceeding with final experiments.
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
              <strong>Click &quot;Design Guides&quot;:</strong> The tool will find all
              potential guides and rank them by predicted quality
            </li>
          </ol>
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
          <p>
            When targeting a gene, you can choose which region to search for guides:
          </p>
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
                  Recommended for knockouts - early frameshift mutations are most
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
                  Most common CRISPR system. PAM is 3&apos; of the guide.
                  Works well in <em>Candida</em> species.
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
                  PAM is 5&apos; of the guide. Creates staggered cuts.
                  Good for HDR applications.
                </td>
              </tr>
            </tbody>
          </table>
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
                  Guides ranked by combined score (efficiency + specificity)
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
                  Watson strand, (-) indicates Crick strand.
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
                  Score reflecting off-target risk (0-100). Higher means fewer/weaker
                  off-targets. 100 = no off-targets detected.
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
                  Warning indicators for potential issues (see below)
                </td>
              </tr>
            </tbody>
          </table>

          <h3>Warning Flags</h3>
          <ul>
            <li>
              <strong>OT:N</strong> - Off-target count. Number of potential off-target
              sites found in the genome with 0-3 mismatches.
            </li>
            <li>
              <strong>Poly-T</strong> - Guide contains TTTT sequence, which can cause
              premature termination of RNA Pol III transcription.
            </li>
            <li>
              <strong>Low GC</strong> - GC content below 40%, which may reduce stability.
            </li>
            <li>
              <strong>High GC</strong> - GC content above 70%, which may cause secondary
              structures.
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2>Scoring Methodology</h2>

          <h3>Efficiency Score (0-100)</h3>
          <p>
            The efficiency score predicts the on-target cutting activity of the guide.
            It is based on sequence features associated with high activity in published
            studies:
          </p>
          <ul>
            <li>
              <strong>GC content:</strong> Optimal is 40-70%. Guides outside this range
              receive penalties.
            </li>
            <li>
              <strong>Position-specific nucleotides:</strong> Certain nucleotides at
              specific positions (especially positions 1, 3, and 20) affect efficiency.
              For example, G at position 20 (PAM-proximal) is favorable.
            </li>
            <li>
              <strong>Poly-T avoidance:</strong> TTTT sequences cause Pol III termination
              and receive a strong penalty.
            </li>
            <li>
              <strong>GG motif:</strong> GG at positions 19-20 is associated with
              higher activity.
            </li>
          </ul>
          <p>
            This scoring is based on a simplified version of the Rule Set 2 algorithm
            (Doench et al., 2016).
          </p>

          <h3>Specificity Score (0-100)</h3>
          <p>
            The specificity score reflects the risk of off-target cleavage. It is
            calculated based on off-target search results:
          </p>
          <ul>
            <li>
              <strong>100:</strong> No off-targets detected (highest specificity)
            </li>
            <li>
              <strong>Lower scores:</strong> Off-targets found, weighted by mismatch count
            </li>
          </ul>
          <p>
            Off-targets are weighted by their potential to be cleaved:
          </p>
          <table className="snapshot-table">
            <thead>
              <tr>
                <th>Mismatches</th>
                <th>Penalty</th>
                <th>Risk Level</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>0 (perfect match)</td>
                <td>50</td>
                <td style={{textAlign: 'left'}}>Very high - likely to cut</td>
              </tr>
              <tr>
                <td>1</td>
                <td>20</td>
                <td style={{textAlign: 'left'}}>High - may still cut efficiently</td>
              </tr>
              <tr>
                <td>2</td>
                <td>5</td>
                <td style={{textAlign: 'left'}}>Moderate - reduced cutting</td>
              </tr>
              <tr>
                <td>3</td>
                <td>1</td>
                <td style={{textAlign: 'left'}}>Low - unlikely to cut</td>
              </tr>
            </tbody>
          </table>
          <p>
            The final specificity score is: 100 / (1 + total_penalty/10)
          </p>

          <h3>Combined Score</h3>
          <p>
            The combined score is a weighted average of efficiency and specificity:
          </p>
          <div className="cite-example">
            <p>
              Combined = (Efficiency × 0.5) + (Specificity × 0.5)
            </p>
          </div>
          <p>
            Guides are ranked by combined score by default. You can sort by any
            individual score by clicking the column header.
          </p>
        </div>

        <div className="info-section">
          <h2>Off-Target Analysis</h2>
          <p>
            Off-target sites are identified using BLAST against the full genome sequence
            of the selected organism. The search parameters are optimized for short
            (20bp) guide sequences.
          </p>

          <h3>What is Searched</h3>
          <ul>
            <li>All coding sequences (ORFs) in the genome</li>
            <li>Sites with 0-3 mismatches to your guide</li>
            <li>Only sites with valid PAM sequences are reported</li>
          </ul>

          <h3>Diploid Genome Handling</h3>
          <p>
            <em>C. albicans</em> SC5314 is diploid with A and B allele chromosomes.
            When designing guides for diploid organisms, the tool automatically:
          </p>
          <ul>
            <li>
              Identifies allelic pairs (same position on A and B chromosomes)
            </li>
            <li>
              Excludes the on-target site and its allelic copy from off-target counts
            </li>
            <li>
              Reports true off-targets in other genes
            </li>
          </ul>
          <p>
            A guide with specificity 100 means no off-targets were found in other genes;
            the expected match on the homologous chromosome is not counted as an off-target.
          </p>

          <h3>Off-Target Details</h3>
          <p>
            Expand any guide row to see details of detected off-targets, including:
          </p>
          <ul>
            <li>Chromosome and position</li>
            <li>Number and position of mismatches</li>
            <li>Gene name if the off-target is within an ORF</li>
            <li>CFD score (Cutting Frequency Determination) for likelihood of cutting</li>
          </ul>
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
            driving sgRNA expression. Widely used and well-validated.
          </p>
          <ul>
            <li>Forward primer: 5&apos;-CACCG + guide-3&apos;</li>
            <li>Reverse primer: 5&apos;-AAAC + reverse_complement + C-3&apos;</li>
          </ul>

          <h3>Notes on Cloning</h3>
          <ul>
            <li>
              If your guide does not start with G, an extra G is added for efficient
              U6 transcription (the G overhang is part of the primer design).
            </li>
            <li>
              Check that your guide sequence does not contain BbsI sites (GAAGAC)
              which would interfere with cloning.
            </li>
            <li>
              For <em>Candida</em>-specific vectors (e.g., pV1093), contact CGD for
              updated primer designs.
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2>Expanded View Information</h2>
          <p>
            Click on any guide row to expand and see additional details:
          </p>

          <h3>Target Site</h3>
          <ul>
            <li>
              <strong>Full Target:</strong> The complete target sequence including
              guide and PAM (23bp for NGG)
            </li>
            <li>
              <strong>Genomic Position:</strong> Chromosome coordinates of the
              target site
            </li>
          </ul>

          <h3>Scores</h3>
          <ul>
            <li>Efficiency, Specificity, and Combined scores</li>
            <li>GC content percentage</li>
          </ul>

          <h3>Cloning Primers</h3>
          <ul>
            <li>Forward and reverse primers for pX330 cloning</li>
            <li>Ready to copy and order</li>
          </ul>
        </div>

        <div className="info-section">
          <h2>Downloading Results</h2>
          <p>
            Export your results in multiple formats:
          </p>
          <ul>
            <li>
              <strong>TSV:</strong> Tab-separated values, ideal for Excel or
              computational analysis
            </li>
            <li>
              <strong>CSV:</strong> Comma-separated values
            </li>
            <li>
              <strong>FASTA:</strong> Guide sequences in FASTA format for
              downstream analysis
            </li>
          </ul>
          <p>
            Downloads include all scored guides, primer sequences, and genomic
            coordinates when available.
          </p>
        </div>

        <div className="info-section">
          <h2>Limitations and Caveats</h2>
          <p>
            <strong>Please consider the following when using this tool:</strong>
          </p>
          <ul>
            <li>
              <strong>Computational predictions:</strong> Efficiency scores are
              predictions based on sequence features. Experimental validation
              is recommended for important guides.
            </li>
            <li>
              <strong>Off-target search scope:</strong> Off-target analysis is
              performed for the top 14 guides only (for performance reasons).
              Lower-ranked guides show efficiency scores but not validated
              specificity scores.
            </li>
            <li>
              <strong>PAM validation:</strong> Off-target sites are filtered
              to require valid PAM sequences, but PAM-adjacent sequences may
              affect cutting in practice.
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
            <li>
              <strong>Assembly version:</strong> Results are specific to the
              selected genome assembly. C. albicans SC5314 Assembly 22 is the
              current default.
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
            If off-target search is not available for your organism, the tool will
            still design guides and calculate efficiency scores.
          </p>
        </div>

        <div className="info-section">
          <h2>Tips for Successful CRISPR Experiments</h2>
          <ol>
            <li>
              <strong>Choose multiple guides:</strong> Design and validate 2-3 guides
              per target. This provides backup options and helps distinguish on-target
              from off-target effects.
            </li>
            <li>
              <strong>Prioritize specificity:</strong> For phenotype analysis, off-target
              effects can confound results. Choose guides with high specificity (100 or
              close to it).
            </li>
            <li>
              <strong>Consider GC content:</strong> Guides with 40-60% GC are generally
              most effective. Extreme GC content can cause stability or secondary
              structure issues.
            </li>
            <li>
              <strong>Avoid Poly-T:</strong> TTTT sequences cause Pol III termination.
              Guides flagged with Poly-T should be avoided.
            </li>
            <li>
              <strong>Check for SNPs:</strong> If working with a non-reference strain,
              verify that your target sequence matches the guide design.
            </li>
            <li>
              <strong>Validate experimentally:</strong> Use T7E1 assay or sequencing
              to confirm editing before proceeding with downstream experiments.
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
            <li>
              Min K, Ichikawa Y, Woolford CA, Mitchell AP (2016). Candida albicans
              Gene Deletion with a Transient CRISPR-Cas9 System.{' '}
              <em>mSphere</em> 1:e00130-16.
              <a
                href="https://doi.org/10.1128/mSphere.00130-16"
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
            Please <Link to="/contact">contact CGD</Link> with:
          </p>
          <ul>
            <li>Reports of bugs or unexpected behavior</li>
            <li>Suggestions for additional features</li>
            <li>Questions about the methodology</li>
            <li>Requests for additional organisms or CRISPR systems</li>
          </ul>
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
