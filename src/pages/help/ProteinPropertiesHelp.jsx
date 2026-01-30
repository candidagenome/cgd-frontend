import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

function ProteinPropertiesHelp() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>CGD Help: Protein Physicochemical Properties</h1>
        <hr />

        <div className="info-section">
          <h2>Contents</h2>
          <ul>
            <li><a href="#descrip">Page Description and Navigation</a></li>
            <li>
              <a href="#organization">Organization of the Properties Table</a>
              <ul>
                <li><a href="#amino">Amino Acid Composition</a></li>
                <li><a href="#atoms">Atomic Composition</a></li>
                <li><a href="#ext">Extinction Coefficients at 280 nm</a></li>
                <li><a href="#prop">Bulk Protein Properties</a></li>
                <li><a href="#codon">Codon Usage Statistics</a></li>
              </ul>
            </li>
            <li><a href="#related">Related CGD Help Documents</a></li>
          </ul>
        </div>

        <hr />

        <div className="info-section">
          <h2 id="descrip">Page Description and Navigation</h2>
          <p>
            The CGD Protein Physicochemical Properties Page displays a number of properties and statistics
            calculated directly from the predicted ORF translation, assuming no post-translational processing
            or modification.{' '}
            <strong>
              This is an unrealistic assumption for most proteins, and users requiring accurate values for
              these properties should consult the literature for experimentally derived values.
            </strong>{' '}
            Nevertheless, the values may serve as a helpful snapshot, giving the user a general idea of the
            physicochemical nature of the subject protein.
          </p>
          <p>
            Property values are calculated locally, making use of several methods from{' '}
            <a
              href="http://us.expasy.org/tools/protparam-doc.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              ExPASy's ProtParam tool
            </a>
            . Codon usage statistics are also computed locally, using the{' '}
            <a href="http://codonw.sourceforge.net/" target="_blank" rel="noopener noreferrer">
              CodonW
            </a>{' '}
            program.
          </p>
          <p>
            The top of the page provides a site-wide quick search, links to the major CGD informational
            resources, and a bar with links to popular tools, such as a local BLAST search. Beneath this is a
            series of tabs linking to other locus-specific information pages, including{' '}
            <Link to="/help/locus">Locus Summary</Link>,{' '}
            <Link to="/help/literature-topics">Literature</Link>,{' '}
            <a href="http://www.yeastgenome.org/help/GO.html" target="_blank" rel="noopener noreferrer">
              Gene Ontology
            </a>
            , and <Link to="/help/phenotype">Phenotype</Link>.
          </p>
        </div>

        <div className="info-section">
          <h2 id="organization">Organization of the Properties Table</h2>

          <h3 id="amino">Amino Acid Composition</h3>
          <p>
            The number and compositional percentage (100 x Number<sub>AA</sub>/protein length) of each
            standard amino acid (AA).
          </p>

          <h3 id="atoms">Atomic Composition</h3>
          <p>
            The total number of C, H, N, O and S atoms, as well as the chemical formula for the full-length
            protein.
          </p>

          <h3 id="ext">Extinction Coefficients at 280 nm</h3>
          <p>
            Estimated using the method of{' '}
            <a href="http://www.ncbi.nlm.nih.gov/pubmed/8563639" target="_blank" rel="noopener noreferrer">
              Pace et al.
            </a>
            , which calculates the sum of (Number<sub>AA</sub> x Extinction Coefficient<sub>AA</sub>) for
            three amino acids that absorb at 280 nm: tyrosine, tryptophan, and the dimeric amino acid cystine
            (two cysteine [Cys] residues covalently joined through a disulfide bond). Two extinction
            coefficients are displayed:
          </p>
          <ol>
            <li>For the fully reduced protein (no cystines present).</li>
            <li>For the fully oxidized protein (all Cys residues exist as half-cystines).</li>
          </ol>
          <p>
            The absorbance of the protein at 280 nm (A<sub>280</sub>, or OD280) is calculated by dividing the
            extinction coefficient by the molecular weight of the protein.
          </p>

          <h3 id="prop">Bulk Protein Properties</h3>
          <ul>
            <li>
              <strong>Average Hydropathy.</strong> Values greater than zero indicate a relatively hydrophobic
              protein, negative values indicate a relatively hydrophilic protein. Calculated as the sum of{' '}
              <a href="http://www.ncbi.nlm.nih.gov/pubmed/7108955" target="_blank" rel="noopener noreferrer">
                Kyte and Doolittle
              </a>{' '}
              hydropathy values for all amino acids in the protein, divided by the protein length.
            </li>
            <li>
              <strong>Aromaticity Score.</strong> The compositional fraction in the protein of aromatic amino
              acids (phenylalanine, tyrosine, and tryptophan), calculated as in{' '}
              <a href="http://www.ncbi.nlm.nih.gov/pubmed/8065933" target="_blank" rel="noopener noreferrer">
                Lobry and Gautier
              </a>
              .
            </li>
            <li>
              <strong>Aliphatic Index.</strong> The relative volume of the protein occupied by aliphatic side
              chains. Positively correlated with thermostability of globular proteins. Calculated using the
              method of{' '}
              <a href="http://www.ncbi.nlm.nih.gov/pubmed/7462208" target="_blank" rel="noopener noreferrer">
                Ikai
              </a>{' '}
              as the sum of (Molar %<sub>AA</sub> x Volume<sub>AA</sub>) for alanine, leucine, isoleucine and
              valine (where Volume<sub>AA</sub> is the relative value compared to alanine).
            </li>
            <li>
              <strong>Instability Index.</strong> Values greater than 40 indicate that the protein may be
              unstable <em>in vitro</em>. Calculated using the method of{' '}
              <a href="http://www.ncbi.nlm.nih.gov/pubmed/2075190" target="_blank" rel="noopener noreferrer">
                Guruprasad et al.
              </a>
              , which assigns a weighted instability value to each dipeptide in the protein. These values
              were derived from an analysis that found a significant difference in the occurrence of certain
              dipeptides between stable and unstable proteins.
            </li>
          </ul>

          <h3 id="codon">Codon Usage Statistics</h3>
          <p>
            The codon usage indices below tend to correlate with gene expression levels. Very low index
            values may indicate an incorrect gene model. See the{' '}
            <a href="http://codonw.sourceforge.net/Indices.html" target="_blank" rel="noopener noreferrer">
              CodonW Indices
            </a>{' '}
            note for more information.
          </p>
          <ul>
            <li>
              <strong>Codon Bias Index (CBI).</strong> The relative abundance in the gene of codons that
              occur most frequently in the organism. The baseline codon usage is computed using the set of
              verified coding genes in organisms with well-characterized gene sets (such as{' '}
              <em>Candida albicans</em>); in organisms without well-characterized gene sets, the baseline
              codon usage is calculated with a set of predicted protein-coding genes containing all of the
              verified ORFs plus the ORFs with orthologs in <em>Candida albicans</em>.
            </li>
            <li>
              <strong>Codon Adaptation Index (CAI).</strong> The relative abundance in the gene of codons
              that occur most frequently in a set of highly expressed genes.
            </li>
            <li>
              <strong>Frequency of Optimal Codons (FOP).</strong> The ratio of optimal codons (determined
              from a set of highly expressed genes) to synonymous codons.
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2 id="related">Related CGD Help Documents</h2>
          <ul>
            <li>
              <Link to="/help/locus">Locus Summary Help Page</Link>
            </li>
            <li>
              <Link to="/help/protein-page">Protein Information Help Page</Link>
            </li>
            <li>
              <Link to="/help/protein-motifs">Protein Domain/Motif Help Page</Link>
            </li>
            <li>
              <Link to="/help/pdb-homolog">PDB Homologs Help Page</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ProteinPropertiesHelp;
