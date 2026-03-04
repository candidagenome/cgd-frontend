
import React from 'react';

const WhatIsGOPage = () => {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>What Is GO?</h1>
        <hr />

        {/* Overview */}
        <section className="info-section">
          <h2>Overview of GO</h2>

          <p>
            The Gene Ontology (GO) is a structured vocabulary that seeks to standardize biological
            knowledge so it can be shared between branches of science. It is managed and maintained
            by the{' '}
            <a href="https://geneontology.org/" target="_blank" rel="noreferrer">
              GO Consortium
            </a>
            .
          </p>

          <p>
            GO “terms” are applied to features, which are primarily genes that encode gene products,
            both computationally and by biocurators trained to extract these terms during annotation
            of primary literature. Once applied to a given feature in a given organism, the
            computational use of homology can transfer that knowledge widely among organisms. The
            relevance of a possible relationship made visible by GO is up to the researcher applying
            the tools.
          </p>

          <p>
            Note that terms can be applied to <em>single</em> proteins/RNAs or to <em>complexes</em>{' '}
            of proteins and/or RNAs.
          </p>

          <p>
            A pyramidal structure determines the ontology, with the broadest terms at the top and
            the most specific terms at the bottom. Within this structure, every term (other than
            the topmost and bottommost elements on the pyramid) has both “parent” (above it) and
            “children” (below it) terms. For example, the term “lipid binding” might have the parent
            term “binding” and the child terms of all the various lipids that could be bound, e.g.,
            “sphingolipid binding,” “phospholipid binding,” etc.
          </p>
        </section>

        {/* Three Aspects */}
        <section className="info-section">
          <h2>Three Aspects Within the GO Ontology</h2>

          <ul>
            <li>
              <strong>Molecular Function:</strong> Functions refer to the actual physical/molecular{' '}
              <em>activity</em> of a gene product, as in binding to something, catalyzing a
              reaction, transporting something, acting as a structural molecule, etc. This category
              is the most direct and specific, thus requiring the most stringent evidence.
            </li>
            <li>
              <strong>Biological Process:</strong> Processes are the intertwined biological programs
              accomplished by multiple molecular activities. They’re related to pathways, though not
              directly synonymous. This category is somewhat less stringent, in that a role in a
              process can be indicated in numerous ways and some will be indirect.
            </li>
            <li>
              <strong>Cellular Component:</strong> The cellular localization where a molecular
              function takes place. This again is a direct and specific category requiring
              stringent evidence.
            </li>
          </ul>

          {/* Example place to add an image */}
          {/* <img src="/images/go-ontology.png" alt="Gene Ontology overview" className="info-image" /> */}
        </section>

        {/* Evidence Codes */}
        <section className="info-section">
          <h2>Evidence Codes</h2>

          <p>
            When viewing a specific GO annotation at a database, the annotation will include (1) the
            category of term (i.e., Molecular Function, Biological Process, or Cellular Component);
            (2) the reference from which the annotation derives; and (3) the evidence code. The
            point of the evidence code is to allow the researcher to make their own decision on the
            quality and/or usefulness of the annotation. The full{' '}
            <a
              href="https://geneontology.org/docs/guide-go-evidence-codes/"
              target="_blank"
              rel="noreferrer"
            >
              guide to evidence codes
            </a>{' '}
            is available at the GO Consortium.
          </p>

          <p>There are several categories of evidence codes:</p>
          <ul>
            <li>Experimental Evidence, with separate codes for high-throughput assays</li>
            <li>Phylogenetically-inferred annotations</li>
            <li>Computational analysis evidence codes</li>
            <li>Author Statements</li>
          </ul>

          <p>Within CGD, the codes seen most often are the following:</p>
          <ul>
            <li>
              <strong>IDA</strong> = inferred from direct assay (manual assertion)
              <br />
              This is the “gold standard” of peer-reviewed experimental evidence.
            </li>
            <li>
              <strong>IMP</strong> = inferred from mutant phenotype (manual assertion)
              <br />
              This evidence is inferred from a phenotype, thus typically less direct.
            </li>
            <li>
              <strong>IGI</strong> = inferred from genetic interaction (manual assertion)
              <br />
              This evidence can be more or less direct, depending on the experiments conducted.
            </li>
            <li>
              <strong>ISS</strong> = inferred from sequence similarity (manual assertion)
              <br />
              These inferences are typically drawn from papers and reviewed by curators.
            </li>
            <li>
              <strong>IEA</strong> = inferred from electronic annotation (computational assertion)
              <br />
              These inferences are exclusively computational, thus only the algorithms are reviewed,
              not the individual annotations.
            </li>
          </ul>
        </section>

        {/* GO Slim Mapping */}
        <section className="info-section">
          <h2>GO Slim Mapping</h2>

          <p>
            The concept of “slims” was created to assist researchers in making sense of too much
            data. The idea is to narrow the data by grouping (or “slimming”) a large number of child
            terms into a smaller number of parent terms. By this means, the data begin to make more
            sense to the eye. This tool is especially useful for making sense of results from
            RNA-Seq experiments.
          </p>

          <p>
            For example, genes annotated to any of the categories in the table below might all be
            mapped to the same GO slim term of “lipid transport,” which is a parent term to all of
            them.
          </p>

          <ul>
            <li>polymyxin transport</li>
            <li>lipid transport across blood-brain barrier</li>
            <li>glycolipid transport</li>
            <li>lipopolysaccharide transport</li>
            <li>regulation of lipid transport</li>
            <li>acylglycerol transport</li>
            <li>bile acid and bile salt transport</li>
            <li>phospholipid transport</li>
            <li>intracellular lipid transport</li>
            <li>isoprenoid transport</li>
            <li>ceramide transport</li>
          </ul>

          <p>CGD makes GO slim mapping easy with the GO Slim Mapper tool.</p>
        </section>
      </div>
    </div>
  );
};

export default WhatIsGOPage;
