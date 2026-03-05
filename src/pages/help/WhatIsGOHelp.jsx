const WhatIsGOPage = () => {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>What Is GO?</h1>
        <hr />

        <div className="info-section">
          <h2>Overview of GO</h2>

          <p>
            The Gene Ontology (GO) is a structured vocabulary that seeks to
            standardize biological knowledge so it can be shared between
            branches of science. It is managed and maintained by the{" "}
            <a href="https://geneontology.org/" target="_blank" rel="noopener noreferrer">
              GO Consortium
            </a>.
          </p>

          <p>
            GO "terms" are applied to features, which are primarily genes that
            encode gene products. These annotations are assigned both
            computationally and by biocurators trained to extract these terms
            during annotation of primary literature. Once applied to a given
            feature in a given organism, the computational use of homology can
            transfer that knowledge widely among organisms. The relevance of a
            possible relationship made visible by GO is up to the researcher
            applying the tools.
          </p>

          <p>
            Note that terms can be applied to <em>single</em> proteins/RNAs or to{" "}
            <em>complexes</em> of proteins and/or RNAs.
          </p>

          <p>
            A pyramidal structure determines the ontology, with the broadest
            terms at the top and the most specific terms at the bottom. Within
            this structure, every term (other than the topmost and bottommost
            elements on the pyramid) has both "parent" (above it) and "children"
            (below it) terms.
          </p>

          <p>
            For example, the term <em>lipid binding</em> might have the parent
            term <em>binding</em> and child terms representing specific lipid
            types such as <em>sphingolipid binding</em> or{" "}
            <em>phospholipid binding</em>.
          </p>

          <img
  src="/images/go_annotations.png"
  alt="Example of GO annotations"
  className="go-image"
/>
        </div>

        <div className="info-section">
          <h2>Three Aspects Within the GO Ontology</h2>

          <ul>
            <li>
              <strong>Molecular Function:</strong> Functions refer to the actual
              physical or molecular <em>activity</em> of a gene product, such as
              binding to something, catalyzing a reaction, transporting a
              molecule, or acting as a structural component. This category is
              the most direct and specific, and therefore usually requires the
              most stringent experimental evidence.
            </li>

            <li>
              <strong>Biological Process:</strong> Processes represent larger
              biological programs accomplished by multiple molecular activities.
              They are related to pathways, though they are not exactly the same
              thing. Evidence for participation in a process may sometimes be
              indirect.
            </li>

            <li>
              <strong>Cellular Component:</strong> The cellular location where a
              molecular function takes place, such as a cellular structure,
              organelle, or complex. Like molecular function, this category
              typically requires strong experimental evidence.
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2>Evidence Codes</h2>

          <p>
            When viewing a specific GO annotation in a biological database, the
            annotation usually includes:
          </p>

          <ul>
            <li>The GO category (Molecular Function, Biological Process, or Cellular Component)</li>
            <li>The reference from which the annotation was derived</li>
            <li>The evidence code supporting the annotation</li>
          </ul>

          <p>
            Evidence codes allow researchers to evaluate the reliability and
            interpretation of an annotation. The full{" "}
            <a
              href="https://geneontology.org/docs/guide-go-evidence-codes/"
              target="_blank"
              rel="noopener noreferrer"
            >
              guide to evidence codes
            </a>{" "}
            is available from the GO Consortium.
          </p>

          <p>Several major categories of evidence codes exist, including:</p>

          <ul>
            <li>Experimental evidence (including high-throughput experiments)</li>
            <li>Phylogenetically inferred annotations</li>
            <li>Computational analysis evidence</li>
            <li>Author statements</li>
          </ul>

          <p>Within CGD, the codes most often encountered include:</p>

          <ul>
            <li>
              <strong>IDA</strong> – Inferred from Direct Assay. This is often
              considered the "gold standard" of peer-reviewed experimental
              evidence.
            </li>

            <li>
              <strong>IMP</strong> – Inferred from Mutant Phenotype. Evidence
              derived from observed phenotypic changes in mutants.
            </li>

            <li>
              <strong>IGI</strong> – Inferred from Genetic Interaction. Evidence
              derived from interactions between genes.
            </li>

            <li>
              <strong>ISS</strong> – Inferred from Sequence Similarity. These
              annotations are typically curated based on literature describing
              homologous genes.
            </li>

            <li>
              <strong>IEA</strong> – Inferred from Electronic Annotation.
              Generated computationally without manual review of individual
              annotations.
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2>GO Slim Mapping</h2>

          <p>
            GO Slims were developed to help researchers interpret large datasets
            more easily. The idea is to group many specific GO terms into a
            smaller set of broader parent terms, allowing the overall biological
            trends in a dataset to become clearer.
          </p>

          <p>
            This approach is especially useful when analyzing large experiments
            such as RNA-Seq studies.
          </p>

          <p>
            For example, genes annotated to any of the following detailed
            transport processes might all map to the broader GO slim category{" "}
            <em>lipid transport</em>:
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

          <p>
            CGD makes GO slim mapping easier through its GO Slim Mapper tool.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhatIsGOPage;
