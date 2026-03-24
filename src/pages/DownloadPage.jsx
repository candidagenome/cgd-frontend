import React from 'react';
import { Link } from 'react-router-dom';
import './InfoPages.css';

const DownloadPage = () => {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>Download Data</h1>
        <p style={{ textAlign: 'center', marginBottom: '20px' }}>
          <strong>Files are described in detail in their associated README documents.</strong>
        </p>
        <hr />

        <div className="info-section">
          <div className="help-item">
            <h3><strong>GO Annotations File</strong></h3>
            <p>
              The gene_association.cgd file contains the Gene Ontology (GO) curation from CGD. Please note that this file contains ALL of the CGD GO curation, whereas the gene_association file that is available on the GO consortium (GOC) web site, <a href="http://www.geneontology.org/" target="_blank" rel="noopener noreferrer">http://www.geneontology.org/</a>, has been filtered according to <a href="http://www.geneontology.org/GO.annotation.shtml" target="_blank" rel="noopener noreferrer">GOC guidelines</a>. The file contains curation for current ORFs only (i.e., ORFs that have been deleted from <em>C. albicans</em> Assembly 21 have been omitted from this file).
            </p>
            <div className="help-links">
              <a href="/download/go/gene_association.cgd.gz">Download the File</a>
              <a href="/download/go/gene_association_README.txt">View the README</a>
            </div>
          </div>

          <div className="help-item">
            <h3><strong>Chromosomal Feature File</strong></h3>
            <p>
              The chromosomal_feature file contains information such as names and aliases (synonyms), descriptions, and any <em>S. cerevisiae</em> orthologs for the chromosomal features (including protein-encoding and non-coding genes) in CGD. The information for each curated species in CGD is contained in a separate chromosomal_feature file.
            </p>
            <div className="help-links">
              <a href="/download/chromosomal_feature_files/">Go to the Chromosomal Feature File Directory</a>
              <a href="/download/chromosomal_feature_files/README">View the README</a>
            </div>
          </div>

          <div className="help-item">
            <h3><strong>Sequence Files</strong></h3>
            <p>
              Files containing chromosome, contig, ORF, protein, and intergenic sequences from <em>Candida</em> and <em>Candida</em>-related strains and species are available for download from this directory. For species for which older versions of the sequence and annotation are available (including <em>C. albicans</em> SC5314), both current sequence data and archived sequence data may be downloaded.
            </p>
            <div className="help-links">
              <a href="/download/sequence/">Go to the Sequence Download Directory</a>
              <a href="/download/sequence/README">View the README</a>
            </div>
          </div>

          <div className="help-item">
            <h3><strong>Phenotype data</strong></h3>
            <p>
              The phenotype_data.tab file contains the CGD phenotype curation, in a tab-delimited table format. The phenotype information for each curated species in CGD is contained in a separate file.
            </p>
            <div className="help-links">
              <a href="/download/phenotype/">Go to the Directory</a>
              <a href="/download/phenotype/README">View the README</a>
            </div>
          </div>

          <div className="help-item">
            <h3><strong>Datasets archived at CGD</strong></h3>
            <p>
              Access the large-scale datasets from the CGD web site.
            </p>
            <div className="help-links">
              <Link to="/download-datasets">View the index</Link>
              <a href="/download/systematic_results">Browse the Download Directory</a>
            </div>
          </div>

          <div className="help-item">
            <h3><strong>Analyses of <em>C. albicans</em> Assembly 21</strong></h3>
            <p>
              ORFs were mapped from Assemblies 20 and 19 to Assembly 21, and the Assembly 21 files were processed at CGD to identify and classify changes that occurred between assemblies, and to identify other issues, as described in detail on the <Link to="/help/sequence">Sequence documentation</Link> page. Files containing all of these analyses (ORF lists, sequences, and/or alignments) are available.
            </p>
            <div className="help-links">
              <a href="/download/Assembly21notes/">Go to the Directory</a>
              <a href="/download/Assembly21notes/README">View the README</a>
            </div>
          </div>

          <div className="help-item">
            <h3><strong>Analyses of <em>C. albicans</em> Assembly 20</strong></h3>
            <p>
              Assembly 20 files were processed at CGD to identify and classify changes that occurred between Assembly 19 and Assembly 20, and to identify other features in which users may be interested (e.g., introns/gaps/reading-frame adjustments), as described in detail on the <Link to="/help/sequence">Sequence documentation</Link> page. Files containing all of these analyses (ORF lists, sequences, and/or alignments) are available.
            </p>
            <div className="help-links">
              <a href="/download/Assembly20notes/">Go to the Directory</a>
              <a href="/download/Assembly20notes/README">View the README</a>
            </div>
          </div>

          <div className="help-item">
            <h3><strong><em>C. albicans</em> Assembly 19 Contig Diagrams</strong></h3>
            <p>
              These PDF files depict the assembly of Contig19's from Contig6's by the Stanford Genome Technology Center (SGTC). These files were originally made available from the <em>Candida</em> web server at the SGTC, and copies are archived here at CGD.
            </p>
            <div className="help-links">
              <a href="/download/Assembly19notes/A19graphs-pdf.tar.gz">Download the Files</a>
              <a href="/download/Assembly19notes/README">View the README</a>
            </div>
          </div>

          <div className="help-item">
            <h3><strong>Mappings to external resources</strong></h3>
            <p>
              These files contain mappings between CGD features and sequences from external resources, such as Uniprot/Swissprot, RefSeq and Entrez Gene databases.
            </p>
            <div className="help-links">
              <a href="/download/External_id_mappings">Download the Files</a>
              <a href="/download/External_id_mappings/README">View the README</a>
            </div>
          </div>

          <div className="help-item">
            <h3><strong>Mappings of Historic <em>C. albicans</em> Contigs and ORFs</strong></h3>
            <p>
              These files summarize the BLAST-based mapping of ORFs and contigs from older assemblies onto the Assembly 19 contigs and the Assembly 21 and Assembly 20 chromosomes.
            </p>
            <div className="help-links">
              <a href="/download/mapping_historic_assemblies/">Go to the Directory</a>
              <a href="/download/mapping_historic_assemblies/README">View the README</a>
            </div>
          </div>

          <div className="help-item">
            <h3><strong><em>C. albicans</em> Assembly 6 Aliases</strong></h3>
            <p>
              The orf19_orf6_mapping file provides a mapping between the orf6 names assigned during Assembly 6 of the genome sequence and the orf19 names assigned during Assembly 19.
            </p>
            <div className="help-links">
              <a href="/download/mapping_historic_assemblies/orf19_orf6_mapping.txt">Download the File</a>
              <a href="/download/mapping_historic_assemblies/orf19_orf6_mapping_README.txt">View the README</a>
            </div>
          </div>

          <div className="help-item">
            <h3><strong><em>C. albicans</em> Assembly 4 Aliases</strong></h3>
            <p>
              The orf4_orf19_mapping file provides a mapping between the identifiers from Assembly 4 of the genome sequence and the orf19 names assigned during Assembly 19.
            </p>
            <div className="help-links">
              <a href="/download/mapping_historic_assemblies/orf4_orf19_mapping.txt">Download the File</a>
              <a href="/download/mapping_historic_assemblies/orf4_orf19_mapping_README.txt">View the README</a>
            </div>
          </div>

          <div className="help-item">
            <h3><strong>GFF files</strong></h3>
            <p>
              This directory contains files with information about the features in CGD and features in historic versions of the genome assembly in <a href="http://www.sequenceontology.org/gff3.shtml" target="_blank" rel="noopener noreferrer">Generic Feature Format</a> (GFF), as displayed in the GBrowse Genome Browser in CGD.
            </p>
            <div className="help-links">
              <a href="/download/gff">Go to the Directory</a>
              <a href="/download/gff/README">View the README</a>
            </div>
          </div>

          <div className="help-item">
            <h3><strong>Orthologs and Best Hits</strong></h3>
            <p>
              The Orthologs directory contains the mappings between CGD genes and predicted orthologs among <em>Candida</em>-related species and in <em>S. cerevisiae</em> and <em>S. pombe</em>. The Orthologs directory also contains positional orthology mappings between <em>C. albicans</em> and <em>C. dubliniensis</em>, provided by John Gamble and Matthew Berriman at the Wellcome Trust Sanger Institute. The Best Hits directory contains mappings between <em>C. albicans</em> and <em>S. cerevisiae</em> at a level of similarity below that required by the strict criteria used to determine orthology.
            </p>
            <div className="help-links">
              <a href="/download/homology/orthologs/">Go to the Orthologs Directory</a>
              <a href="/download/homology/best_hits/">Go to the Best Hits Directory</a>
            </div>
          </div>

          <div className="help-item">
            <h3><strong>Pathway Files</strong></h3>
            <p>
              Download files with information about metabolic pathways from CGD.
            </p>
            <div className="help-links">
              <a href="/download/pathways/">Go to the Pathways Directory</a>
              <a href="/download/pathways/README">View the README</a>
            </div>
          </div>

          <div className="help-item">
            <h3><strong>Protein Domain Predictions</strong></h3>
            <p>
              Output of <a href="http://www.ebi.ac.uk/Tools/InterProScan/" target="_blank" rel="noopener noreferrer">IprScan</a> domain predictions for all CGD proteins.
            </p>
            <div className="help-links">
              <a href="/download/domains/">Go to the Domains Directory</a>
              <a href="/download/domains/README">View the README</a>
            </div>
          </div>

          <div className="help-item">
            <h3><strong>Codon Usage Table</strong></h3>
            <p>
              The C_albicans_codon_usage file contains a table of calculated codon usage frequencies.
            </p>
            <div className="help-links">
              <a href="/download/misc/C_albicans_codon_usage.tab">View the File and README</a>
            </div>
          </div>

          <div className="help-item">
            <h3><strong>Miscellaneous Annotation Files</strong></h3>
            <p>
              This directory contains files that were constructed by CGD in response to a specific request, but which may be useful to other members of the research community. The C_albicans_codon_usage.tab file contains a codon usage table (for Assembly 21). The CGD_GO_genespring_format.tab file contains Gene Ontology curation in a format for use with <a href="http://www.chem.agilent.com/scripts/pds.asp?lpage=27881" target="_blank" rel="noopener noreferrer">GeneSpring</a> software. The orf6_short_desc.txt and orf6_long_desc_plus_GO.txt files contain basic information about genes in CGD from Assemblies 6 and 19 (e.g., orf6 and orf19 names, description information, and GO terms).
            </p>
            <div className="help-links">
              <a href="/download/misc/">Go to the Directory</a>
              <a href="/download/misc/README">View the README</a>
            </div>
          </div>

          <div className="help-item">
            <h3><strong>Community-contributed Data Files</strong></h3>
            <p>
              Files contributed by members of the community. <a href="/download/community/UAU1_nondisruptable.txt">UAU1_nondisruptable.txt</a> (from Aaron Mitchell) is a list of <em>C. albicans</em> genes in which no UAU1 insertions were obtained among at least 12 independent transformants, suggesting that these genes may be essential (but conclusive demonstration of essentiality requires additional experimentation). The GSEA_Nantel_2012 directory contains files for running Gene Set Enrichment Analysis (GSEA) on <em>Candida albicans</em> data, provided to CGD by Andre Nantel.
            </p>
            <div className="help-links">
              <a href="/download/community/">Go to the Directory</a>
              <a href="/download/community/README">View the README</a>
            </div>
          </div>

          <div className="help-item">
            <h3><strong>GO Slim file</strong></h3>
            <p>
              The goslim_candida.obo file contains the subset of GO that is used with the <Link to="/go-slim-mapper">GO Slim Term Mapper</Link> tool. The file is best viewed with OBO_Edit, a tool available at the <a href="http://www.geneontology.org/GO.tools.shtml" target="_blank" rel="noopener noreferrer">Gene Ontology Consortium</a> website.
            </p>
            <div className="help-links">
              <a href="/download/go/go_slim/goslim_candida.obo">View the obo file</a>
            </div>
          </div>

          <div className="help-item">
            <h3><strong>Candida GO Slim Annotations File</strong></h3>
            <p>
              The GOslim_gene_association.cgd file contains GO Slim annotations for CGD genes, using the <a href="/download/go/go_slim/goslim_candida.obo">CGD GO Slim</a> instead of the entire <a href="http://wiki.geneontology.org/index.php/GO_FAQ" target="_blank" rel="noopener noreferrer">Gene Ontology</a>. A <a href="http://www.geneontology.org/GO.slims.shtml" target="_blank" rel="noopener noreferrer">GO Slim</a> is a small subset of terms from the Gene Ontology, which is intended to provide a general overview without all the fine-grained detail contained in the GO itself. For the actual CGD GO curation, please use the <a href="/download/go/gene_association_README.txt">gene_association.cgd</a> file.
            </p>
            <div className="help-links">
              <a href="/download/go/go_slim/GOslim_gene_association.cgd.gz">Download the File</a>
              <a href="/download/go/go_slim/GOslim_gene_association_README.txt">View the README</a>
            </div>
          </div>

          <div className="help-item">
            <h3><strong>Batch Download Tool</strong></h3>
            <p>
              Simultaneously retrieve multiple types of data for a list of gene or feature names.
            </p>
            <div className="help-links">
              <Link to="/batch-download">Go to the Batch Download Tool page</Link>
            </div>
          </div>

          <div className="help-item">
            <h3><strong>Browse Downloads</strong></h3>
            <p>
              Browse the Download directories on the CGD web site.
            </p>
            <div className="help-links">
              <a href="/download/">Go to the top-level directory</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
