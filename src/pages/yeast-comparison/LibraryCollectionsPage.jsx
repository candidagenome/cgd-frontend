import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';
import './PathogenicYeastComparison.css';

const EXT = { target: '_blank', rel: 'noopener noreferrer' };

const PubMed = ({ pmid, children }) => (
  <a href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`} {...EXT}>{children}</a>
);

const Email = ({ address }) => <a href={`mailto:${address}`}>{address}</a>;

// One library collection: name, contents, typical use, references, how to obtain
const Collection = ({ id, name, contents, uses, references, obtain }) => (
  <div className="strain-entry library-entry" id={id}>
    <h3>{name}</h3>
    <p><strong>Contents:</strong> {contents}</p>
    <p><strong>Used for:</strong> {uses}</p>
    <p><strong>References:</strong> {references}</p>
    <p><strong>How to obtain:</strong> {obtain}</p>
    <p className="back-to-top">
      <a href="#top">Back to top</a>
    </p>
  </div>
);

const FGSC = (
  <>
    <a href="https://fgsc.net/candida/FGSCcandidaresources.htm" {...EXT}>
      Fungal Genetics Stock Center (FGSC)
    </a>
    , Kansas State University. Plates are listed on the FGSC <em>Candida</em> resources page and
    requested through the{' '}
    <a href="https://www.fgsc.net/contact_form.php" {...EXT}>FGSC request form</a>; questions
    to <Email address="questions@fgsc.net" />. FGSC charges a per-plate fee (see the FGSC site for
    current pricing). For-profit users should contact the original depositor.
  </>
);

function LibraryCollectionsPage() {
  return (
    <div className="info-page pyc-page">
      <div className="info-page-content" id="top">
        <p className="pyc-breadcrumb">
          <Link to="/pathogenic-yeast-comparison">Pathogenic Yeast Comparison</Link>
        </p>
        <h1>Library Collections</h1>
        <hr />

        <p>
          Genome-scale collections of mutant strains and clones for the pathogenic yeasts in CGD,
          with what each collection is used for and how to obtain it. Distribution terms, prices and
          contacts change over time, so please confirm details with the distributor or laboratory
          before ordering. To suggest additions or corrections,{' '}
          <Link to="/contact">contact CGD curators</Link>. See also{' '}
          <Link to="/strains">Strain Information</Link> and{' '}
          <Link to="/pathogenic-yeast-comparison/protocols">Protocols and Methods</Link>.
        </p>

        <ul className="pyc-toc">
          <li><a href="#distributed">Collections available from a distributor or stock center</a></li>
          <li><a href="#from-labs">Collections available from the originating laboratory</a></li>
          <li><a href="#tools">Genome-wide mutagenesis tools</a></li>
        </ul>

        <section className="info-section" id="distributed">
          <h2>Collections available from a distributor or stock center</h2>

          <Collection
            id="grace"
            name={<>GRACE conditional expression library (<em>C. albicans</em>)</>}
            contents={
              <>
                Gene Replacement And Conditional Expression strains: one allele of each gene is
                deleted and the other is placed under a tetracycline-repressible promoter. The
                original Merck library is distributed as 2,357 strains in a 25-plate set; the
                GRACEv2 (866 strains) and GRACEv3 (1,240 strains) expansions extend coverage to
                about 71% of the genome.
              </>
            }
            uses="Identifying essential genes and antifungal drug targets, and conditional (repressible) phenotypes of individual genes."
            references={
              <>
                <PubMed pmid="14507372">Roemer et al., 2003</PubMed> (original library);{' '}
                <PubMed pmid="34764269">Fu et al., 2021</PubMed> (GRACEv2);{' '}
                <PubMed pmid="41105619">Fu et al., 2025</PubMed> (GRACEv3)
              </>
            }
            obtain={
              <>
                Distributed by the Leah Cowen laboratory, University of Toronto. Use of the library
                requires a fully executed MTA with Merck Sharp &amp; Dohme LLC: contact Lorraine
                Hernandez (<Email address="lorraine_hernandez@merck.com" />) with full contact
                information for the requesting PI and the institutional office that handles MTAs,
                and a brief statement of the proposed use; a Merck representative then contacts
                the Cowen laboratory to arrange distribution. Prices (plus tax and shipping where
                applicable): original library US$2,350; GRACEv2 (866 strains) US$850; GRACEv3
                (1,240 strains) US$1,000. See the{' '}
                <Link to="/community-news">Community News</Link> page for the full announcement.
              </>
            }
          />

          <hr />
          <Collection
            id="dbc"
            name={<>Merck double-barcoded (DBC) heterozygous deletion library (<em>C. albicans</em>)</>}
            contents={
              <>
                Heterozygous deletion mutants carrying up- and downstream barcodes, replicated from
                the original library of 5,470 strains and supplied in 59 96-well plates.
              </>
            }
            uses="Pooled, barcode-based haploinsufficiency profiling (the Genome-Wide Fitness Test) to identify the mode of action and targets of antifungal compounds."
            references={
              <>
                <PubMed pmid="17604452">Xu et al., 2007</PubMed>;{' '}
                <PubMed pmid="28040776">Chaillot et al., 2017</PubMed>
              </>
            }
            obtain={
              <>
                As with the GRACE library, use requires an MTA with Merck Sharp &amp; Dohme LLC:
                contact Lorraine Hernandez (<Email address="lorraine_hernandez@merck.com" />) with
                full contact information for the requesting PI and the institutional office that
                handles MTAs, and a brief statement of the proposed use. Merck then arranges
                distribution. Earlier distribution through the National Research Council of Canada
                is described on the <Link to="/community-news">Community News</Link> page.
              </>
            }
          />

          <hr />
          <Collection
            id="noble-johnson"
            name={<>Noble &amp; Johnson homozygous deletion collection (<em>C. albicans</em>)</>}
            contents="About 3,000 homozygous deletion strains covering 674 genes, constructed in the SN152 background with non-URA3 markers."
            uses="Systematic screens for infectivity in a mouse model and for morphogenesis and proliferation phenotypes."
            references={<PubMed pmid="20543849">Noble et al., 2010</PubMed>}
            obtain={FGSC}
          />

          <hr />
          <Collection
            id="homann"
            name={<>Homann transcriptional regulator deletion collection (<em>C. albicans</em>)</>}
            contents="Homozygous deletion strains for 165 transcriptional regulators, in most cases with two independently derived isolates per gene (4 plates)."
            uses="Phenotypic profiling of the regulatory network across many growth, stress and drug conditions."
            references={<PubMed pmid="20041210">Homann et al., 2009</PubMed>}
            obtain={FGSC}
          />

          <hr />
          <Collection
            id="mitchell"
            name={<>Mitchell laboratory knockout sets and protein kinase set (<em>C. albicans</em>)</>}
            contents="Homozygous insertion mutant sets for transcription factors, cell wall proteins and other genes, and a 2-plate protein kinase mutant set."
            uses="Screens for cell wall regulation, stress responses, biofilm formation and virulence."
            references={<PubMed pmid="20140194">Blankenship et al., 2010</PubMed>}
            obtain={FGSC}
          />

          <hr />
          <Collection
            id="sanglard-tf"
            name={<>Sanglard Zn2-Cys6 transcription factor mutants (<em>C. albicans</em>)</>}
            contents="Barcoded mutants of 77 Zn2-Cys6 transcription factors, part of the transcription factor mutant plates held at FGSC."
            uses="Pooled in vivo screens of kidney colonization in mice and drug-response studies."
            references={<PubMed pmid="22073120">Vandeputte et al., 2011</PubMed>}
            obtain={FGSC}
          />
        </section>

        <section className="info-section" id="from-labs">
          <h2>Collections available from the originating laboratory</h2>
          <p>
            These collections are not held by a public stock center. Requests should be directed
            to the laboratory that built them.
          </p>

          <Collection
            id="orfeome"
            name={<><em>C. albicans</em> ORFeome and Gateway expression vectors</>}
            contents="Gateway entry clones for more than 5,200 open reading frames, plus a set of 49 destination vectors for expression from different promoters with HA, GFP or TAP tags. Collections of barcoded overexpression plasmids and strains are being built from the ORFeome."
            uses="Building overexpression, tagged-protein and two-hybrid strain collections."
            references={<PubMed pmid="29982705">Legrand et al., 2018</PubMed>}
            obtain={
              <>
                Contact the{' '}
                <a href="https://research.pasteur.fr/en/team/fungal-biology-and-pathogenicity/" {...EXT}>
                  Fungal Biology and Pathogenicity Unit
                </a>{' '}
                (Christophe d'Enfert), Institut Pasteur, which developed the ORFeome with the
                Munro group at the University of Aberdeen.
              </>
            }
          />

          <hr />
          <Collection
            id="overexpression"
            name={<>Overexpression collections (<em>C. albicans</em>)</>}
            contents="Barcoded overexpression strains under tetracycline-inducible (P_TET) and PCK1 promoters, covering kinases, phosphatases and transcription factors, later expanded to about 2,500 genes."
            uses="Gain-of-function screens, including pooled fitness and gut colonization screens."
            references={
              <>
                <PubMed pmid="23049891">Chauvel et al., 2012</PubMed>;{' '}
                <PubMed pmid="29998470">Znaidi et al., 2018</PubMed>;{' '}
                <PubMed pmid="36587858">Chauvel et al., 2023</PubMed>
              </>
            }
            obtain={
              <>
                Christophe d'Enfert, Institut Pasteur (<Email address="christophe.denfert@pasteur.fr" />).
                These plates were not deposited at FGSC.
              </>
            }
          />

          <hr />
          <Collection
            id="oh-transposon"
            name={<>Tagged heterozygous transposon mutant collection (<em>C. albicans</em>)</>}
            contents="3,633 tagged heterozygous transposon insertion mutants."
            uses="Pooled haploinsufficiency profiling for gene annotation and drug target discovery."
            references={<PubMed pmid="20949076">Oh et al., 2010</PubMed>}
            obtain="Contact the corresponding authors of the paper."
          />

          <hr />
          <Collection
            id="glabrata-deletion"
            name={<><em>C. glabrata</em> (<em>Nakaseomyces glabratus</em>) deletion collection</>}
            contents="1,601 individually barcoded deletion strains covering 619 genes (about 12% of the genome), in an ATCC 2001-derived background."
            uses="Phenotypic screens for stress, antifungal drug tolerance and biofilm formation."
            references={<PubMed pmid="24945925">Schwarzmüller et al., 2014</PubMed>}
            obtain={
              <>
                Karl Kuchler, Medical University of Vienna (<Email address="karl.kuchler@meduniwien.ac.at" />).
              </>
            }
          />

          <hr />
          <Collection
            id="parapsilosis-knockout"
            name={<><em>C. parapsilosis</em> knockout collection</>}
            contents="200 barcoded homozygous deletion strains for 100 genes (two independent deletions each), mostly transcription factors and protein kinases, in the CLIB214 background."
            uses="Phenotyping in more than 40 conditions and comparison with the corresponding C. albicans mutants."
            references={<PubMed pmid="25233198">Holland et al., 2014</PubMed>}
            obtain={<>Geraldine Butler, University College Dublin (<Email address="gbutler@ucd.ie" />).</>}
          />

          <hr />
          <Collection
            id="dubliniensis-tf"
            name={<><em>C. dubliniensis</em> transcription regulator mutants</>}
            contents="44 homozygous null mutants of transcription regulators associated with filamentation."
            uses="Comparing the regulation of filamentation between C. dubliniensis and C. albicans."
            references={<PubMed pmid="40673384">Meza-Davalos et al., 2025</PubMed>}
            obtain={<>Eugenio Mancera, CINVESTAV Irapuato (<Email address="eugenio.mancera@cinvestav.mx" />).</>}
          />

          <hr />
          <Collection
            id="tropicalis-tf"
            name={<><em>C. tropicalis</em> transcription factor overexpression library</>}
            contents="Overexpression strains for 156 transcription factors."
            uses="Screening for regulators of filamentation."
            references={<PubMed pmid="26466925">Zhang et al., 2016</PubMed>}
            obtain="Contact the corresponding authors of the paper."
          />
        </section>

        <section className="info-section" id="tools">
          <h2>Genome-wide mutagenesis tools</h2>
          <p>
            No arrayed mutant collection has yet been published for <em>C. auris</em>{' '}
            (<em>Candidozyma auris</em>). The following systems are used to build pooled or
            custom mutant libraries:
          </p>
          <ul>
            <li>
              <em>C. auris</em>: Agrobacterium-mediated insertional mutagenesis and a transient
              Cas9 system (<PubMed pmid="34893621">Santana and O'Meara, 2021</PubMed>); plasmids
              deposited at Addgene according to the paper.
            </li>
            <li>
              <em>C. albicans</em>: CRISPR-Cas9 gene drive platform for double-deletion libraries
              (<PubMed pmid="29062088">Shapiro et al., 2018</PubMed>); plasmids deposited at
              Addgene according to the paper.
            </li>
            <li>
              <em>C. albicans</em>: transposon mutagenesis in stable haploid strains using Hermes
              (<PubMed pmid="30377286">Segal et al., 2018</PubMed>) or piggyBac
              (<PubMed pmid="30374049">Gao et al., 2018</PubMed>).
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default LibraryCollectionsPage;
