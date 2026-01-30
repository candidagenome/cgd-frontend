import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

const LiteratureTopicsHelp = () => {
  return (
    <div className="info-page">
      <h1 className="info-page-title">CGD Help: Literature Guide</h1>

      <hr className="info-divider" />

      <div className="info-content-block">
        <h2>Contents</h2>
        <ul>
          <li><a href="#description">Description</a></li>
          <li><a href="#organization">Organization of the Literature Guide</a>
            <ul>
              <li><a href="#summary">Literature Curation Summary</a></li>
              <li><a href="#navigation">Literature Topics Navigation: Left Hand Column</a></li>
              <li><a href="#specific">Specific Topic Pages</a></li>
            </ul>
          </li>
          <li><a href="#PubMedSearch">PubMed Search</a></li>
          <li><a href="#topics">The Literature Topics</a>
            <ul>
              <li><a href="#topics2">Topic Descriptions</a></li>
              <li><a href="#groupings">Topic Groupings</a></li>
            </ul>
          </li>
          <li><a href="#go">Go to a Literature Guide page</a></li>
        </ul>
      </div>

      <hr className="info-divider" />

      <section id="description">
        <h2>Description</h2>
        <p>
          The Literature Guide categorizes literature into different topics, helping you sift
          through the papers about a given gene to find the particular information that you need.
          CGD performs a search through all{' '}
          <a
            href="http://www.ncbi.nlm.nih.gov:80/entrez/query.fcgi?db=PubMed"
            target="_blank"
            rel="noopener noreferrer"
          >
            PubMed
          </a>{' '}
          literature for all papers mentioning that locus and any aliases. (See{' '}
          <a href="#PubMedSearch">PubMed Search</a> for more details on how that search is
          performed). CGD curators read the abstracts of those papers, review the full text when
          available, and assign the papers to one or more <a href="#topics">Topics</a> that
          describe the kind of biological information contained in the abstracts. Please note,
          however, that since sometimes only abstracts are read, the Literature Topics are not
          necessarily a complete description of the information contained in the papers.
        </p>
      </section>

      <section id="organization">
        <h2>Organization of the Literature Guide</h2>
        <ul>
          <li id="summary">
            <strong>Literature Curation Summary</strong> - The Literature Curation Summary is the
            starting page to access the Literature Topics. All the papers associated with a given
            gene are listed on this page, and the topics addressed by them are available in the{' '}
            <a href="#navigation">left hand column</a>.
            <p>
              Other literature resources are also accessible from this page, including links to
              PubMed to search for references that mention the locus.
            </p>
            <p>
              Literature curation is an ongoing project at CGD. For some loci, we have not yet
              reviewed all of the literature. The Literature Curation Summary will give the
              curation status, with the numbers of both curated and uncurated references, and the
              date of last curation.
            </p>
          </li>

          <li id="navigation">
            <strong>Literature Topics Navigation: Left Hand Column</strong> - The left hand column
            of all of Literature Guide pages lists the various categories of biological
            information that were found for that locus in the PubMed abstracts. Many of these{' '}
            <a href="#topics">topics</a> are described in detail below. A topic will be missing
            from the list of Literature Topics if no abstract has made reference to that kind of
            information for the given locus. This column functions as a navigation bar between the
            individual topics and additional information including the Literature Curation
            Summary. Your location within the Literature Topics is indicated within the left hand
            column by an arrow pointing to the topic name, which will now show as red text rather
            than as a hyperlink.
          </li>

          <li id="specific">
            <strong>Specific Topic Pages</strong> - Clicking on the name of a specific topic
            listed in the left hand column will give you a list, on the right hand side of the
            page, of all the references annotated to that topic for the given locus. For each
            reference there will be links to additional information for the reference, including,
            when available, the CGD Papers page, the PubMed citation, a link to the full text on
            the publisher's site, and web supplements.
          </li>
        </ul>
      </section>

      <section id="PubMedSearch">
        <h2>PubMed Search</h2>
        <p>
          We search PubMed for papers associated with <em>Candida</em> keywords, including species
          and gene names. We then screen and curate these papers for CGD. Please{' '}
          <Link to="/suggestion">let us know</Link> if you think our search has missed a paper.
        </p>
      </section>

      <section id="topics">
        <h2>The Literature Topics</h2>

        <h3 id="topics2">Topic Descriptions:</h3>
        <p>A paper is filed under one or more of the following topics if it contains information about:</p>

        <ul>
          <li>
            <strong>Adherence</strong>
            <br />
            factors affecting adherence, either <em>in vivo</em> or <em>in vitro</em>.
          </li>

          <li>
            <strong>Alias</strong>
            <br />
            assignment of a particular gene name, whether it's the CGD standard name or another name (alias).
          </li>

          <li>
            <strong>Animal Model</strong>
            <br />
            studies of infections in animal model systems.
          </li>

          <li>
            <strong>Biofilms</strong>
            <br />
            involvement in biofilm formation or maintenance.
          </li>

          <li>
            <strong>Cell Growth and Metabolism</strong>
            <br />
            information pertaining to aspects of growth and growth phases, division, DNA replication,
            and metabolic pathways or processes. In particular, this topic can be used for studies of
            growth and metabolism that are not specific for any particular gene.
          </li>

          <li>
            <strong>Cell wall properties/components</strong>
            <br />
            information about cell wall and involvement of cell wall in virulence.
          </li>

          <li>
            <strong>Cellular Location</strong>
            <br />
            where in the cell the protein does what it does; information on the transport of the
            protein and regulation of its compartmentalization is also listed under this topic.
          </li>

          <li>
            <strong>Clinical Data</strong>
            <br />
            clinical studies in humans.
          </li>

          <li>
            <strong>Comparative genomic hybridization</strong>
            <br />
            involves DNA-DNA hybridization to assay for chromosomal rearrangements or SNP detection.
          </li>

          <li>
            <strong>Computational analysis</strong>
            <br />
            analysis that utilizes bioinformatics/computational methods (i.e. a "dry" set of
            experiments that may be based on previously determined wet lab results).
          </li>

          <li>
            <strong>Cross-species Expression</strong>
            <br />
            any experiment in which a gene from another species is expressed in a <em>Candida</em>{' '}
            cell, or vice-versa; this category also includes experiments addressing cross-species
            complementation.
          </li>

          <li>
            <strong>Disease Gene Related</strong>
            <br />
            homology between the <em>Candida</em> gene and a human gene that is disease-related.
          </li>

          <li>
            <strong>DNA/RNA Sequence Features</strong>
            <br />
            overall DNA sequence and DNA sequence features (promoters, exons, introns, etc.) and RNA
            sequence features (splice sites, poly-A sites, etc).
          </li>

          <li>
            <strong>Epidemiological data</strong>
            <br />
            studies about frequency and dissemination of <em>Candida</em>-caused diseases in host
            populations.
          </li>

          <li>
            <strong>Evolution</strong>
            <br />
            studies that discuss <em>Candida</em> evolution in general, as well as evolutionary
            studies of specific <em>Candida</em> genes. (Note that studies of related genes in other
            species or organisms may warrant assignment of the topic "Fungal Related Genes/Proteins"
            or "Non-Fungal Related Genes/Proteins").
          </li>

          <li>
            <strong>Function/ Process</strong>
            <br />
            the role the gene product plays in the cell, and the molecular function of the gene product.
          </li>

          <li>
            <strong>Fungal Related Genes/ Proteins</strong>
            <br />
            fungal homologs (both functional and sequence homologs) as well as members of a fungal
            gene or protein family.
          </li>

          <li>
            <strong>Genetic Interactions</strong>
            <br />
            interactions between loci identified by genetic means, including suppression,
            complementation, synthetic lethality, etc; this topic does not include cross-species
            complementation experiments, as these are covered by the category "cross-species expression".
          </li>

          <li>
            <strong>Genomic co-immunoprecipitation study</strong>
            <br />
            involves large-scale co-immunoprecipitation of proteins cross-linked to DNA or RNA in
            order to characterize protein-DNA or protein-RNA interactions using genomic techniques
            (for example ChIP on Chip experiments).
          </li>

          <li>
            <strong>Genomic expression study</strong>
            <br />
            includes microarray/chip/serial analysis of gene expression (SAGE) or other genome-wide
            techniques to assay gene expression on a genomic scale.
          </li>

          <li>
            <strong>Host response</strong>
            <br />
            studies of host processes induced by interaction with <em>Candida</em>.
          </li>

          <li>
            <strong>Industrial Applications</strong>
            <br />
            use of <em>Candida</em> in industrial processes.
          </li>

          <li>
            <strong>Large-scale genetic interaction</strong>
            <br />
            includes large-scale screens for genetic interactions including Synthetic Genetic
            Analysis (SGA), Diploid-based Synthetic Lethality Analysis on Microarrays (dSLAM), and
            other types of genetic interaction screens that use genomic techniques.
          </li>

          <li>
            <strong>Large-scale phenotype analysis</strong>
            <br />
            involves any large-scale phenotype analysis that utilizes genomic techniques or a
            systematic analysis of a collection of genes, e.g. genes on a single chromosome or genes
            expressed preferentially in specific cells.
          </li>

          <li>
            <strong>Large-scale protein detection</strong>
            <br />
            includes two-dimensional polyacrylamide gel electrophoresis (2-D PAGE), mass spectrometry,
            immunodetection schemes and other studies that measure or examine protein levels on a
            large-scale; includes identification, detection, and expression of proteins.
          </li>

          <li>
            <strong>Large-scale protein interaction</strong>
            <br />
            includes large-scale two hybrid, phage display and other large-scale protein-protein
            interaction experiments.
          </li>

          <li>
            <strong>Large-scale protein localization</strong>
            <br />
            involves methods for determining the subcellular distribution of a large number of proteins.
          </li>

          <li>
            <strong>Large-scale protein modification</strong>
            <br />
            includes large-scale identification of various types of protein modifications, such as
            phosphorylation.
          </li>

          <li>
            <strong>List of all Curated References</strong>
            <br />
            list of all references annotated to any topic for this gene.
          </li>

          <li>
            <strong>Mapping</strong>
            <br />
            physical or genetic mapping results.
          </li>

          <li>
            <strong>Mating</strong>
            <br />
            involved in mating and parasexual cycle.
          </li>

          <li>
            <strong>Mutants/ Phenotypes</strong>
            <br />
            mutations, including deletions, of the gene and resulting phenotypes.
          </li>

          <li>
            <strong>Non-Fungal Related Genes/ Proteins</strong>
            <br />
            homologs, both functional and structural, from organisms other than fungi, as well as
            identification of members of a gene or protein family that are homologous to the fungal gene.
          </li>

          <li>
            <strong>Nucleic acid-Nucleic acid interactions</strong>
            <br />
            associations between DNA and/or RNA species.
          </li>

          <li>
            <strong>Other Features</strong>
            <br />
            items that appear to be significant, but which do not fit underneath a standard topic.
          </li>

          <li>
            <strong>Other genomic analysis</strong>
            <br />
            other large-scale analyses not described by the other large-scale genomics topics, for
            example, genomic/chromosomal sequencing, small molecule protein-binding assays, using
            microarray technology to identify replication origins or ribosome abundance, etc.
          </li>

          <li>
            <strong>Phenotypic Switching</strong>
            <br />
            factors that affect phenotype switching, for example between white and opaque phase.
          </li>

          <li>
            <strong>Post-Translational Modifications</strong>
            <br />
            how the protein is modified following translation, including regulatory and non-regulatory
            modifications, such as phosphorylation, attachment of sugars, etc.
          </li>

          <li>
            <strong>Protein Domains/ Motifs</strong>
            <br />
            identified domains and sequence motifs.
          </li>

          <li>
            <strong>Protein Physical Properties</strong>
            <br />
            the molecular weight or amino acid composition of the real or hypothetical protein
            product; also characterization of enzyme kinetics.
          </li>

          <li>
            <strong>Protein Processing</strong>
            <br />
            posttranslational maturation of proteins.
          </li>

          <li>
            <strong>Protein/Nucleic Acid Structure</strong>
            <br />
            the structure of the gene product, including known structural location of specific
            residues and structural predictions.
          </li>

          <li>
            <strong>Protein-Nucleic Acid Interactions</strong>
            <br />
            any association between a protein and DNA or RNA including direct binding or associating
            with other DNA- or RNA-binding proteins; this topic also includes information on binding
            sites; for genes that do not code for proteins, for instance tRNAs, ribosomal RNAs, etc.,
            this topic includes interactions of those RNAs with proteins.
          </li>

          <li>
            <strong>Protein-Protein Interactions</strong>
            <br />
            physical interactions that have been demonstrated between proteins by methods such as
            two-hybrid analysis, cross-linking studies, coimmunoprecipitation, etc., or when the
            paper cites evidence for indirect or direct interactions.
          </li>

          <li>
            <strong>Regulation (Other)</strong>
            <br />
            regulation that is not included under one of the other topics.
          </li>

          <li>
            <strong>Regulation (Unspecified)</strong>
            <br />
            observed regulation, when the type of regulation is not described.
          </li>

          <li>
            <strong>Regulation of Activity</strong>
            <br />
            includes regulation of enzymatic activity.
          </li>

          <li>
            <strong>Regulation of Protein Degradation</strong>
            <br />
            controlled degradation of a protein as a regulatory mechanism.
          </li>

          <li>
            <strong>Regulation of RNA Degradation</strong>
            <br />
            controlled degradation of an RNA as a regulatory mechanism.
          </li>

          <li>
            <strong>Regulatory Role</strong>
            <br />
            regulation <strong>by</strong> the gene product, as opposed to regulation{' '}
            <strong>of</strong> the gene product; this topic is assigned when the gene product itself
            acts as a regulator.
          </li>

          <li>
            <strong>Related Species</strong>
            <br />
            literature pertaining to specified <em>Candida</em> species.
          </li>

          <li>
            <strong>Reviews</strong>
            <br />
            literature reviews that refer to the gene.
          </li>

          <li>
            <strong>RNA Levels and Processing</strong>
            <br />
            the RNA prior to translation (levels of RNA in the cell, stability, structure, splicing, etc.).
          </li>

          <li>
            <strong>Sensitivity/response to drugs/other treatments</strong>
            <br />
            effects of drugs on expression of the gene or activity of the gene product, genes or
            proteins responsible for drug resistance; mutations that lead to changes in drug susceptibility.
          </li>

          <li>
            <strong>Signal Transduction</strong>
            <br />
            involvement of the gene product in a signal transduction pathway.
          </li>

          <li>
            <strong>Strains/ Constructs</strong>
            <br />
            mutant strains and constructs developed for experimentation on the locus of interest.
          </li>

          <li>
            <strong>Strain/species typing/detection</strong>
            <br />
            methods of detecting and differentiating between <em>Candida</em> species and/or strains.
          </li>

          <li>
            <strong>Substrates/ Ligands/ Cofactors</strong>
            <br />
            substrates or ligands of the protein, including cofactors that regulate the protein's activity.
          </li>

          <li>
            <strong>Techniques and Reagents</strong>
            <br />
            novel techniques used in studying the gene as well as any reagents other than constructs
            that might help in experimentation, including antibodies, chemical inhibitors, and
            purified protein.
          </li>

          <li>
            <strong>Transcriptional Regulation</strong>
            <br />
            regulation of mRNA transcription.
          </li>

          <li>
            <strong>Translational Regulation</strong>
            <br />
            regulation of the translation of the mRNA into protein.
          </li>

          <li>
            <strong>Variant Alleles</strong>
            <br />
            information about sequence variation among alleles of the locus.
          </li>

          <li>
            <strong>Virulence</strong>
            <br />
            role of the gene product in infection of the host.
          </li>
        </ul>

        <h3 id="groupings">Topic Groupings:</h3>
        <p>
          To assist you in finding the topic in which you are most interested, we have grouped the
          Literature Topics (and the Literature Curation Summary) into groups of related topics.
          Here are the groupings:
        </p>

        <div className="info-two-column-layout">
          <div className="info-column">
            <table className="info-table">
              <thead>
                <tr>
                  <th className="info-table-header">Curated Literature</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><li>Alias</li></td></tr>
                <tr><td><li>Reviews</li></td></tr>
                <tr><td><li>List of all Curated References</li></td></tr>
              </tbody>
            </table>

            <table className="info-table">
              <thead>
                <tr>
                  <th className="info-table-header">Gene Product Information</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><li>Nucleic acid-Nucleic acid Interactions</li></td></tr>
                <tr><td><li>Post-Translational Modifications</li></td></tr>
                <tr><td><li>Protein Domains/Motifs</li></td></tr>
                <tr><td><li>Protein Physical Properties</li></td></tr>
                <tr><td><li>Protein Processing</li></td></tr>
                <tr><td><li>Protein-Nucleic Acid Interactions</li></td></tr>
                <tr><td><li>Protein-Protein Interactions</li></td></tr>
                <tr><td><li>Protein/Nucleic Acid Structure</li></td></tr>
                <tr><td><li>Substrates/ Ligands/ Cofactors</li></td></tr>
              </tbody>
            </table>

            <table className="info-table">
              <thead>
                <tr>
                  <th className="info-table-header">Genetics/Cell Biology</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><li>Cell Growth and Metabolism</li></td></tr>
                <tr><td><li>Cellular Location</li></td></tr>
                <tr><td><li>Function/Process</li></td></tr>
                <tr><td><li>Genetic Interactions</li></td></tr>
                <tr><td><li>Mutants/Phenotypes</li></td></tr>
                <tr><td><li>Regulatory Role</li></td></tr>
                <tr><td><li>Signal Transduction</li></td></tr>
              </tbody>
            </table>

            <table className="info-table">
              <thead>
                <tr>
                  <th className="info-table-header">Genome-wide Analysis</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><li>Comparative genomic hybridization</li></td></tr>
                <tr><td><li>Computational analysis</li></td></tr>
                <tr><td><li>Genomic co-immunoprecipitation study</li></td></tr>
                <tr><td><li>Genomic expression study</li></td></tr>
                <tr><td><li>Large-scale genetic interaction</li></td></tr>
                <tr><td><li>Large-scale phenotype analysis</li></td></tr>
                <tr><td><li>Other genomic analysis</li></td></tr>
              </tbody>
            </table>

            <table className="info-table">
              <thead>
                <tr>
                  <th className="info-table-header">Life Cycle</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><li>Biofilms</li></td></tr>
                <tr><td><li>Chlamydospore formation</li></td></tr>
                <tr><td><li>Filamentous Growth</li></td></tr>
                <tr><td><li>Mating</li></td></tr>
                <tr><td><li>Phenotypic Switching</li></td></tr>
              </tbody>
            </table>

            <table className="info-table">
              <thead>
                <tr>
                  <th className="info-table-header">Nucleic Acid Information</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><li>DNA/RNA Sequence Features</li></td></tr>
                <tr><td><li>Mapping</li></td></tr>
                <tr><td><li>RNA Levels and Processing</li></td></tr>
                <tr><td><li>Variant Alleles</li></td></tr>
              </tbody>
            </table>

            <table className="info-table">
              <thead>
                <tr>
                  <th className="info-table-header">Other Topics</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><li>Evolution</li></td></tr>
                <tr><td><li>Industrial Applications</li></td></tr>
              </tbody>
            </table>
          </div>

          <div className="info-column">
            <table className="info-table">
              <thead>
                <tr>
                  <th className="info-table-header">Proteome-wide Analysis</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><li>Large-scale protein detection</li></td></tr>
                <tr><td><li>Large-scale protein interaction</li></td></tr>
                <tr><td><li>Large-scale protein localization</li></td></tr>
                <tr><td><li>Large-scale protein modification</li></td></tr>
                <tr><td><li>Other large-scale proteomic analysis</li></td></tr>
              </tbody>
            </table>

            <table className="info-table">
              <thead>
                <tr>
                  <th className="info-table-header">Regulation</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><li>Regulation (Other)</li></td></tr>
                <tr><td><li>Regulation (Unspecified)</li></td></tr>
                <tr><td><li>Regulation of Activity</li></td></tr>
                <tr><td><li>Regulation of Protein Degradation</li></td></tr>
                <tr><td><li>Regulation of RNA Degradation</li></td></tr>
                <tr><td><li>Transcriptional Regulation</li></td></tr>
                <tr><td><li>Translational Regulation</li></td></tr>
              </tbody>
            </table>

            <table className="info-table">
              <thead>
                <tr>
                  <th className="info-table-header">Related Genes/Proteins</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><li>Cross-species Expression</li></td></tr>
                <tr><td><li>Disease Gene Related</li></td></tr>
                <tr><td><li>Fungal Related Genes/Proteins</li></td></tr>
                <tr><td><li>Non-Fungal Related Genes/Proteins</li></td></tr>
              </tbody>
            </table>

            <table className="info-table">
              <thead>
                <tr>
                  <th className="info-table-header">Related Species</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><li><em>Candida albicans</em></li></td></tr>
                <tr><td><li><em>Candida auris</em></li></td></tr>
                <tr><td><li><em>Candida dubliniensis</em></li></td></tr>
                <tr><td><li><em>Candida glabrata (Torulopsis glabrata)</em></li></td></tr>
                <tr><td><li><em>Candida guilliermondii (Pichia guilliermondii)</em></li></td></tr>
                <tr><td><li><em>Candida krusei (Issatchenkia orientalis)</em></li></td></tr>
                <tr><td><li><em>Candida lusitaniae (Clavispora lusitaniae)</em></li></td></tr>
                <tr><td><li><em>Candida parapsilosis</em></li></td></tr>
                <tr><td><li><em>Candida tropicalis</em></li></td></tr>
                <tr><td><li><em>Debaryomyces hansenii (Candida famata)</em></li></td></tr>
                <tr><td><li><em>Lodderomyces elongisporus</em></li></td></tr>
                <tr><td><li>Other <em>Candida</em></li></td></tr>
              </tbody>
            </table>

            <table className="info-table">
              <thead>
                <tr>
                  <th className="info-table-header">Research Aids</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><li>Other Features</li></td></tr>
                <tr><td><li>Strain/species typing/detection</li></td></tr>
                <tr><td><li>Strains/Constructs</li></td></tr>
                <tr><td><li>Techniques and Reagents</li></td></tr>
              </tbody>
            </table>

            <table className="info-table">
              <thead>
                <tr>
                  <th className="info-table-header">Virulence Related Information</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><li>Adherence</li></td></tr>
                <tr><td><li>Animal Model</li></td></tr>
                <tr><td><li>Cell wall properties/components</li></td></tr>
                <tr><td><li>Clinical Data</li></td></tr>
                <tr><td><li>Epidemiological data</li></td></tr>
                <tr><td><li>Host response</li></td></tr>
                <tr><td><li>Phospholipases</li></td></tr>
                <tr><td><li>Proteases</li></td></tr>
                <tr><td><li>Sensitivity/response to drugs/other treatments</li></td></tr>
                <tr><td><li>Virulence</li></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="go">
        <h2>Go to a Literature Guide page:</h2>
        <p>
          <strong>
            Go to the Literature Guide <Link to="/search">Search</Link>
          </strong>{' '}
          page. Selecting 'Literature Guide' from the pulldown menu for the Category Search and
          typing the name of a locus (gene or ORF) into the 'Item name:' box will bring you to the
          Literature Curation Summary page for the chosen locus.
        </p>
      </section>

      <hr className="info-divider" />
    </div>
  );
};

export default LiteratureTopicsHelp;
