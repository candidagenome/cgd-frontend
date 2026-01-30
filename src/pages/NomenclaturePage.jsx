import React from 'react';
import { Link } from 'react-router-dom';
import './InfoPages.css';

const NomenclaturePage = () => {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>Gene Nomenclature Guide</h1>
        <hr />

        <nav className="info-section">
          <ul>
            <li><a href="#gene">Format of gene names</a></li>
            <li><a href="#choosing">Choosing a gene name</a></li>
            <li><a href="#changing">Changing a standard gene name</a></li>
            <li><a href="#systematic">Format of <em>C. albicans</em> gene names</a></li>
            <li><a href="#Cglab">Format of <em>C. glabrata</em> gene names</a></li>
            <li><a href="#trna">Format of Standard tRNA Names</a></li>
            <li><a href="#table">Detailed format of gene, protein, and allele names</a></li>
          </ul>
        </nav>

        <div className="info-section" id="gene">
          <h2>Format of gene names</h2>
          <p>
            <em>Candida</em> gene names should follow the format established for <em>S. cerevisiae</em> gene names. This format is described in detail in a guide to <em>S. cerevisiae</em> nomenclature, published in Trends in Genetics (TIG) (<a href="http://www.yeastgenome.org/sgdpub/Saccharomyces_cerevisiae.pdf" target="_blank" rel="noopener noreferrer">download pdf file</a>). The gene name should consist of three letters (the gene symbol) followed by an integer (e.g. <em>ADE12</em>). Dominant alleles of the gene (most often wild-type) are denoted by all uppercase letters, while recessive alleles are denoted by all lowercase letters.
          </p>
          <p>
            The 3-letter gene symbol should stand for a description of a phenotype, gene product, or gene function. In addition, it is strongly preferable that a given gene symbol have only one associated description (i.e., all genes which use a given 3-letter symbol should have a related phenotype, gene product, or gene function, and that 3-letter symbols have the same meaning for <em>S. cerevisiae</em> and <em>Candida</em> genes). Where <em>Candida</em> and <em>S. cerevisiae</em> genes appear to be orthologous, it is preferable that they share the same gene name. Where <em>Candida</em> and <em>S. cerevisiae</em> genes are similar, but the function of these genes is not the same in both species, it is preferable that the genes do NOT share a name; rather, the gene name assigned should have some significance with respect to the function of the gene.
          </p>
          <p>
            There are some gene names with non-standard gene format that are currently in use in CGD. Many of these gene names are historical, and are well-recognized within the research community (e.g., <em>C. albicans</em> WH11; OP4; MTLA1; ADE5,7 or <em>C. glabrata</em> UPC2A; MT-II; MT-IIB). Some other genes acquired a non-standard name when the name was used in a publication describing a large-scale experiment (e.g., <em>C. albicans</em> FESUR1, CAM1-1).
          </p>
          <p>
            Going forward, it is preferable that newly named genes use standard format whenever possible. New, nonstandard gene names will be added to CGD as aliases, but not as Standard Names. (Exceptions may be made in cases where the <em>S. cerevisiae</em> ortholog has a nonstandard-format Standard Name in <a href="http://www.yeastgenome.org" target="_blank" rel="noopener noreferrer">SGD</a> for historical reasons.)
          </p>
          <p>
            Species prefixes (e.g., "Ca" or "Cg") used in front of a gene name is not part of the true gene name. The use of prefixes adds clarity to papers discussing genes from different species that share a name (e.g., Ca<em>URA3</em> vs. Sc<em>URA3</em>), but the gene names themselves do not include the prefix.
          </p>
        </div>

        <div className="info-section" id="choosing">
          <h2>Choosing a gene name</h2>
          <p>
            Before deciding on a gene name, search <a href="http://www.yeastgenome.org/search" target="_blank" rel="noopener noreferrer">SGD Gene Names</a> for any gene name beginning with the 3-letter symbol, by entering the 3-letter symbol followed by an asterisk, e.g. "ADE*", in the query box.
          </p>
        </div>

        <div className="info-section" id="changing">
          <h2>Changing a standard gene name</h2>
          <p>
            The first published name for a gene is typically used as its standard name; however, gene names may be changed if there is consensus among the groups who study the gene. CGD is happy to facilitate this process. To initiate a gene name change please contact the <Link to="/contact">CGD curators</Link>.
          </p>
          <p>
            At CGD, we curate gene names that have appeared in the published literature; we do not assign names for protein-coding genes, ourselves. CGD collects all published names for each gene; any names in addition to the standard gene name are present in the database as searchable gene aliases. Gene names or locus tags that appear only in GenBank may be used as aliases in CGD; they are not used as standard gene names unless they appear in the published literature.
          </p>
          <p>
            For <em>C. albicans</em>, CGD also includes the gene identifiers assigned during Assembly 4 and Assembly 6, as well as the IPF and CA identifiers from CandidaDB (<a href="http://nar.oxfordjournals.org/cgi/content/full/33/suppl_1/D353" target="_blank" rel="noopener noreferrer">d'Enfert et al., 2005</a>). Unpublished gene names that were assigned by CandidaDB based on homology, are included as aliases in CGD. The Suggested Names assigned by the Annotation Working Group are only adopted by CGD upon publication of these names in the scientific literature.
          </p>
          <p>
            CGD has implemented a gene name reservation system. Reservation of a gene name prior to publication allows other groups to begin using the name as soon as possible, and reduces the likelihood that a gene will acquire multiple distinct names that are used in the published literature. Please use the <Link to="/gene-registry">CGD Gene Registry</Link> to reserve new gene names.
          </p>
        </div>

        <div className="info-section" id="systematic">
          <h2>Format of <em>C. albicans</em> names</h2>
          <p>
            Systematic names introduced with Assembly 22 follow a new positionally based systematic nomenclature for chromosomal features. The new systematic name is based on the known chromosomal location and haplotype, and it consists of the chromosome (C1-C7 or CR), a unique number indicating the order of features along chromosomes, the strand (W for Watson or C for Crick) and the haplotype (A or B). For example, <Link to="/locus/C4_03570W_A">C4_03570W_A</Link> denotes a feature located on chromosome 4, Watson strand and haplotype A. Feature numbers start at the left end of the chromosome and increase by 10 to allow for adding new features in the intervening spaces as they are discovered.
          </p>
          <p>
            Systematic names used in previous assemblies were the "orf19.#" names (where "#" is an integer) assigned to open reading frames identified in Assembly 19 of the genome sequence. The Annotation Working Group has assigned orf19 identifiers to some open reading frames that were not part of the original assembly (described in <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1183520/" target="_blank" rel="noopener noreferrer">Braun et al., 2005</a>). New orfs have been assigned names of the format "orf19.#.n", where "orf19.#" corresponds to the identifier of the upstream orf19, and "n" is an integer. For example, <Link to="/locus/orf19.5006.1">orf19.5006.1</Link> is located on Contig19-10216 between orf19.5006 and orf19.5007.
          </p>
          <p>
            Please note that names of the format "orf19.#" are expressed in a slightly different format in the locus_tag field of the GenBank records that are associated with release of Assembly 19. The locus_tag "CaO19.#" is equivalent to the systematic name "orf19.#" (i.e., orf19.5197 and CaO19.5197 refer to the same ORF). In order to facilitate searching for alternative aliases, regardless of their format, the "CaO19.#" identifiers are included in CGD, in addition to the "orf19.#" names.
          </p>
          <p>
            <em>C. albicans</em> Assembly 20 and Assembly 21 continued to use the orf19 names and they persist in the literature. To facilitate seamless transition between the two nomenclature systems, the former orf19 systematic identifiers are fully searchable and prominently displayed on the Locus Summary pages. The mapping between all orf19 and Assembly 22 identifiers is also available for download <Link to="/download/chromosomal_feature_files/C_albicans_SC5314/ORF19_Assembly22_mapping.tab">here</Link>.
          </p>

          <h3>Format of systematic tRNA names</h3>
          <p>
            The format of <em>C. albicans</em> systematic tRNA names is identical to that of standard tRNA names, described <a href="#trna">below</a>.
          </p>

          <h3>IPF identifiers</h3>
          <p>
            <em>C. albicans</em> gene identifiers of the form "IPF#.n" have been assigned at <a href="http://genolist.pasteur.fr/CandidaDB/" target="_blank" rel="noopener noreferrer">CandidaDB</a>, where IPF stands for "Individual Protein File," "#" is an integer, and "n" is a version number or an informational tag (described in <a href="http://nar.oxfordjournals.org/cgi/content/full/33/suppl_1/D353" target="_blank" rel="noopener noreferrer">d'Enfert et al., 2005</a>). CGD currently includes the IPF names that were archived in the Annotation Working Group's annotation file as of February 22nd, 2005, some IPF names that CGD curators gathered from the published literature, as well as IPF names retrieved directly from CandidaDB. Where IPF identifiers have been assigned both to an orf and also to its allele, CGD includes both IPF identifiers as searchable aliases on the Locus page.
          </p>

          <h3>A cautionary note about suffixes appended to gene names</h3>
          <p>
            Please note that the numerical suffix has a different meaning in the context of orf19 and IPF names; the orf19 suffix denotes that the orf is distinct, whereas the IPF suffix serves either as a version numbering system or a tag that conveys information about sequence homology. For example, orf19.5006.1 is not the same as orf19.5006. In contrast, the IPF identifiers IPF22272 and IPF22272.1 refer to the same gene, and the ".1" suffix indicates that there has been no change made to this record since Assembly 5. A suffix of ".2" or ".3" appended to an IPF identifier indicates that there have been one or two changes, respectively, between Assembly 5 and Assembly 19. In the context of some gene names used at CandidaDB, suffixes serve as informational tags. Suffixes were assigned to indicate that the gene appears to be a 5' or 3' gene fragment, either with or without an adjacent 3' or 5' corresponding fragment the published Assembly 19, and to note whether the fragment is located at the end of a contig. For example, IPF13383.5eoc has similarity to the 5' end of a related gene, and this ORF is also located at the end of a contig. Please see <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1183520/" target="_blank" rel="noopener noreferrer">Braun et al., 2005</a>, and <a href="http://nar.oxfordjournals.org/cgi/content/full/33/suppl_1/D353" target="_blank" rel="noopener noreferrer">d'Enfert et al., 2005</a>, for additional explanation.
          </p>

          <h3>Aliases from Assemblies 4 and 6</h3>
          <p>
            CGD contains gene name aliases from earlier assemblies of the <em>C. albicans</em> genome sequence, Assemblies 4 and 6. The aliases from assembly 6 have the form "orf6.#" names (where "#" is an integer). The aliases from Assembly 4 have the form "Contig4-$$$$.####" (where $$$$ is a numerical identifier for the contig, and #### is a numerical identifier for the ORF within the contig). These aliases appear on the CGD Locus pages. In addition, the complete mappings may be downloaded in tab-delimited text file format from the <Link to="/download/">CGD Download site</Link>. The mapping between Assembly 4 identifiers and orf19 names is based on a mapping provided by Judy Berman, with some additional manual curation. The mapping between Assembly 6 identifiers and orf19 names was generated at CGD by BLAST-based comparison of orf19s to orf6s, as described in detail in the <Link to="/download/orf19_orf6_mapping_README.txt">README file</Link> in the Download directory.
          </p>
        </div>

        <div className="info-section" id="Cglab">
          <h2>Format of <em>C. glabrata</em> gene names</h2>
          <p>
            The format of <em>C. glabrata</em> standard gene names is similar to that of the <em>C. albicans</em> standard gene names.
          </p>
          <p>
            The format of the <em>C. glabrata</em> systematic gene names comes directly from the nomenclature used by the <a href="http://www.ebi.ac.uk/ena/data/view/Project:13831" target="_blank" rel="noopener noreferrer">sequencing project</a>, as described by <a href="http://www.nature.com/nature/journal/v430/n6995/abs/nature02579.html" target="_blank" rel="noopener noreferrer">Dujon et al. (2004)</a>:
          </p>
          <blockquote style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', margin: '15px 0' }}>
            "All annotated genetic elements were designated using a new nomenclature system (http://cbi.labri.fr/Genolevures). Briefly, elements are numbered serially along each sequence contig or scaffold from the left to right of each chromosome using 11 incremental steps (to limit errors and offer the possibility for subsequent insertion of newly recognized elements). The element nomenclature indicates the species (four letters), the project or strain number (one numeral), the chromosome (one letter) followed by the serial number (for example, CAGL0G08492g). The suffix identifies the type of element ('g' stands for any element whose RNA product may be translated by the genetic code; 'r' for elements whose RNA product is not translated; 's' for a cis-acting element; and 'v' for intergenes (intervening))."
          </blockquote>

          <h3>Format of systematic tRNA names</h3>
          <p>
            <em>C. glabrata</em> systematic tRNA names follow the sequencing project systematic naming conventions, described above.
          </p>
        </div>

        <div className="info-section" id="trna">
          <h2>Format of Standard tRNA Names</h2>
          <p>
            tRNAs annotated in the sequencing projects were confirmed by CGD using the program tRNAscan-SE. The eukaryotic model option was used for nuclear tRNAs, and the organeller model was used for mitochondrial tRNAs. Instances of disagreement between the original annotations and tRNAscan-SE were resolved by alignment with experimentally verified tRNAs from <em>S. cerevisiae</em>.
          </p>
          <p>
            CGD uses the following format for standard tRNA names: 't' + encoded amino acid [one-letter code] + (anticodon) + count. For example, tQ(CUG)2 for the second instance of tRNA-glutamine with anticodon 'CUG'. Mitochondrial tRNAs use the same format, but are appended by 'mt': for example, tH(GUG)4mt. The count for mitochondrial tRNAs is continued from those of nuclear-encoded tRNAs of the same coding type. To facilitate searching, an alias is provided with each 'U' replaced by 'T' in the anticodon.
          </p>
          <p>
            Please note that the count suffix is arbitrary, and independent among the different species in CGD. It is used simply to create a unique identifier for each tRNA gene of a given species, and no special relationship between two tRNAs with the same standard name from different species is implied. For example, the tH(GUG)1 tRNA gene in <em>C. albicans</em> and the tH(GUG)1 tRNA gene in <em>C. glabrata</em> are not necessarily expected to be more closely related to each other than to any other tH(GUG) in either genome.
          </p>
          <p>
            For species-specific, systematic tRNA names, please see the gene-naming section for the particular species, above.
          </p>
        </div>

        <div className="info-section" id="table">
          <h2>Detailed format of gene, allele, and protein names (<em>C. albicans</em> examples)</h2>
          <p>
            Many thanks to <a href="http://www.columbia.edu/cu/biology/faculty-data/aaron-mitchell/faculty.html" target="_blank" rel="noopener noreferrer">Aaron Mitchell</a> for providing this table of <em>C. albicans</em> gene nomenclature examples.
          </p>

          <table className="sitemap-table" style={{ marginTop: '20px' }}>
            <tbody>
              <tr>
                <td>Genetic locus</td>
                <td><em>ICG1</em></td>
              </tr>
              <tr>
                <td>Wild-type allele</td>
                <td><em>ICG1</em></td>
              </tr>
              <tr>
                <td>Recessive mutant allele</td>
                <td>
                  <em>icg1-1</em><br />
                  <em>icg1</em>&#916;5<br />
                  <em>icg1</em>&#916;::<em>hisG</em><br />
                  <em>icg1</em>&#916;::<em>hisG-URA3-hisG</em>
                </td>
              </tr>
              <tr>
                <td>Dominant mutant allele</td>
                <td><em>ICG1-7</em></td>
              </tr>
              <tr>
                <td>Variant wild-type allele</td>
                <td><em>ICG1-8</em></td>
              </tr>
              <tr>
                <td>Tagged wild-type allele</td>
                <td>
                  <em>ICG1-GFP</em><br />
                  <em>ICG1-HA</em>
                </td>
              </tr>
              <tr>
                <td>Wild-type genotype</td>
                <td>
                  <em>ICG1/ICG1</em><br />
                  <em>ICG1-8/ICG1-9</em>
                </td>
              </tr>
              <tr>
                <td>Heterozygous mutant genotype</td>
                <td>
                  <em>icg1</em>&#916;::<em>hisG-URA3-hisG/ICG1</em><br />
                  <em>icg1</em>&#916;::<em>hisG/ICG1</em>
                </td>
              </tr>
              <tr>
                <td>Homozygous mutant genotype</td>
                <td>
                  <em>icg1</em>&#916;::<em>hisG/icg1</em>&#916;::<em>hisG-URA3-hisG</em><br />
                  <em>icg1</em>&#916;::<em>hisG/icg1</em>&#916;::<em>hisG</em>
                </td>
              </tr>
              <tr>
                <td>Reintegrant of wild-type allele (on bacterial plasmid) at mutant locus</td>
                <td><em>icg1</em>&#916;::<em>hisG/icg1</em>&#916;::<em>hisG</em>::<em>ICG1</em></td>
              </tr>
              <tr>
                <td>Reintegrant of wild-type allele (on bacterial plasmid) at the <em>ARG4</em> locus</td>
                <td><em>icg1</em>&#916;::<em>hisG/icg1</em>&#916;::<em>hisG ARG4</em>::<em>ICG/ARG4</em></td>
              </tr>
              <tr>
                <td>Wild-type gene product</td>
                <td>
                  Icg1<br />
                  Icg1p
                </td>
              </tr>
              <tr>
                <td>Mutant gene product</td>
                <td>
                  Icg1-1<br />
                  Icg1-1p
                </td>
              </tr>
              <tr>
                <td>Tagged gene product</td>
                <td>
                  Icg1-GFP<br />
                  Icg1p-GFP<br />
                  Icg1-GFPp
                </td>
              </tr>
              <tr>
                <td>Wild-type phenotype</td>
                <td>Icg<sup>+</sup></td>
              </tr>
              <tr>
                <td>Mutant phenotype</td>
                <td>Icg<sup>-</sup></td>
              </tr>
              <tr>
                <td>Partially-defective phenotype (as sometimes seen for heterozygote)</td>
                <td>
                  Icg<sup>w</sup> (for weak)<br />
                  ICG<sup>w</sup><br />
                  Icg<sup>+/-</sup>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NomenclaturePage;
