import React from 'react';
import { Link } from 'react-router-dom';
import './InfoPages.css';

// Citation component for consistent display
const Citation = ({ text, pmid }) => (
  <div className="citation-item">
    <p dangerouslySetInnerHTML={{ __html: text || '' }} />
    {pmid && (
      <div className="citation-links">
        <a
          href={`/reference/${pmid}`}
          target="infowin"
          title="CGD Reference"
        >
          <img src="/images/refsml.gif" alt="CGD" />
        </a>
        <a
          href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}`}
          target="infowin"
          rel="noopener noreferrer"
          title="PubMed"
        >
          <img src="/images/pubmedrefsml.gif" alt="PubMed" />
        </a>
      </div>
    )}
  </div>
);

// Strain component for consistent display
const StrainEntry = ({ name, genotype, notes, citations }) => (
  <div className="strain-entry" id={name}>
    <h3>{name}</h3>
    {genotype && (
      <p>
        <strong>Genotype:</strong>{' '}
        <span dangerouslySetInnerHTML={{ __html: genotype }} />
      </p>
    )}
    {notes && (
      <p>
        <strong>Notes:</strong>{' '}
        <span dangerouslySetInnerHTML={{ __html: notes }} />
      </p>
    )}
    {citations &&
      citations.map((cit, idx) => (
        <Citation key={idx} text={cit.text} pmid={cit.pmid} />
      ))}
    <p className="back-to-top">
      <a href="#top_of_list">Back to top</a>
    </p>
  </div>
);

function StrainsPage() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>
          <em>Candida</em> Strains
        </h1>

        <p>
          These lists and lineage diagrams have been compiled by CGD curators to serve as a brief
          reference to some of the more commonly used laboratory strains of various{' '}
          <em>Candida</em> species, rather than a comprehensive resource. The strain names on each
          species list below link to short summary descriptions, notes and citations. If you would
          like to suggest additions, corrections, or updates to this list, please{' '}
          <Link to="/contact">send a message to CGD curators</Link> with details.
        </p>

        <hr />

        {/* Table of Contents */}
        <section className="info-section" id="top_of_list">
          <h2>Strain information for:</h2>
          <ul className="strain-species-list">
            <li>
              <a href="#albicans">
                <em>C. albicans</em>
              </a>
            </li>
            <li>
              <a href="#glabrata">
                <em>C. glabrata</em>
              </a>
            </li>
            <li>
              <a href="#parapsilosis">
                <em>C. parapsilosis</em>
              </a>
            </li>
            <li>
              <a href="#tropicalis">
                <em>C. tropicalis</em>
              </a>
            </li>
          </ul>
        </section>

        <hr />

        {/* C. albicans Section */}
        <section className="info-section strain-section" id="albicans">
          <h2>
            <em>C. albicans</em> Laboratory Strains
          </h2>

          {/* Lineage Diagram */}
          <div className="lineage-diagram">
            <img
              src="/images/Calb_lineage.gif"
              alt="C. albicans lineage diagram"
              style={{ maxWidth: '100%', border: '2px solid #ccc' }}
            />
          </div>

          <h3>
            <em>C. albicans</em> laboratory strain descriptions and references
          </h3>
          <ul className="strain-list">
            <li>
              <a href="#SC5314">SC5314</a>
            </li>
            <li>
              <a href="#CAF2-1">CAF2-1</a>
            </li>
            <li>
              <a href="#CAI4">CAI4</a>
            </li>
            <li>
              <a href="#CAI8">CAI8</a>
            </li>
            <li>
              <a href="#P37005">P37005</a>
            </li>
            <li>
              <a href="#Red3/6">Red3/6</a>
            </li>
            <li>
              <a href="#RM1000">RM1000</a>
            </li>
            <li>
              <a href="#BWP17">BWP17</a>
            </li>
            <li>
              <a href="#SN87">SN87</a>
            </li>
            <li>
              <a href="#SN95">SN95</a>
            </li>
            <li>
              <a href="#SN152">SN152</a>
            </li>
            <li>
              <a href="#WO-1">WO-1</a>
            </li>
            <li>
              <a href="#WUM5A">WUM5A</a>
            </li>
          </ul>

          <hr />

          {/* SC5314 */}
          <StrainEntry
            name="SC5314"
            genotype="Wild-type"
            notes={`Wild-type strain used in the systematic sequencing project, the reference sequence stored in CGD. The original strain background from which most of the common laboratory strains are derived. This strain is virulent in a mouse model of systemic infection and is frequently used as a wild-type control.<br/><br/>In their 2004 Genome Biology paper on <em>C. albicans</em> genome sequence, Frank Odds, Al Brown and Neil Gow explain the origins of SC5314: "Strain SC5314 was used in the 1980s by scientists at the E.R. Squibb company (now Bristol-Myers Squibb) for their pioneering studies of <em>C. albicans</em> molecular biology..."`}
            citations={[
              {
                text: `Odds FC, Brown AJ, Gow NA. <em>Candida albicans</em> genome sequence: a platform for genomics in the absence of genetics. Genome Biol. 2004; 5(7): 230.`,
                pmid: '15239821',
              },
              {
                text: `Fonzi WA, Irwin MY. Isogenic strain construction and gene mapping in <em>Candida albicans</em>. Genetics. 1993 Jul;134(3):717-28.`,
                pmid: '8349105',
              },
            ]}
          />

          <hr />

          {/* CAF2-1 */}
          <StrainEntry
            name="CAF2-1"
            genotype="<em>URA3/ura3</em>::imm434 <em>IRO1/iro1</em>::imm434"
            notes="URA3 heterozygous strain derived from the SC5314 strain. The 3-prime end of one copy of the IRO1 gene that resides adjacent to URA3 was inadvertently deleted during the construction of this strain. This strain is virulent in a mouse model of systemic infection and is frequently used as a wild-type control."
            citations={[
              {
                text: `Fonzi WA, Irwin MY. Isogenic strain construction and gene mapping in <em>Candida albicans</em>. Genetics. 1993 Jul;134(3):717-28.`,
                pmid: '8349105',
              },
            ]}
          />

          <hr />

          {/* CAI4 */}
          <StrainEntry
            name="CAI4"
            genotype="<em>ura3</em>::imm434/<em>ura3</em>::imm434 <em>iro1/iro1</em>::imm434"
            notes="Isogenic to the SC5314 strain. Uridine auxotroph constructed by deletion of the second copy of URA3. The second copy of IRO1 was inadvertently deleted upon strain construction. As a result, the strain and its descendants have no functional copy of IRO1. This strain is avirulent in a mouse model of systemic infection unless complemented with URA3."
            citations={[
              {
                text: `Fonzi WA, Irwin MY. Isogenic strain construction and gene mapping in <em>Candida albicans</em>. Genetics. 1993 Jul;134(3):717-28.`,
                pmid: '8349105',
              },
              {
                text: `Garcia MG, O'Connor JE, Garcia LL, Martinez SI, Herrero E, del Castillo Agudo L. Isolation of a <em>Candida albicans</em> gene, tightly linked to URA3, coding for a putative transcription factor that suppresses a <em>Saccharomyces cerevisiae</em> aft1 mutation. Yeast. 2001 Mar 15;18(4):301-11.`,
                pmid: '11223939',
              },
            ]}
          />

          <hr />

          {/* CAI8 */}
          <StrainEntry
            name="CAI8"
            genotype="<em>ura3</em>::imm434/<em>ura3</em>::imm434 <em>iro1/iro1</em>::imm434 <em>ade2</em>::hisG/<em>ade2</em>::hisG"
            notes="Isogenic to the SC5314 strain. Derived from the CAF2-1 strain by deletion of URA3 and both copies of ADE2 using the URA-blaster method."
            citations={[
              {
                text: `Fonzi WA, Irwin MY. Isogenic strain construction and gene mapping in <em>Candida albicans</em>. Genetics. 1993 Jul;134(3):717-28.`,
                pmid: '8349105',
              },
            ]}
          />

          <hr />

          {/* P37005 */}
          <StrainEntry
            name="P37005"
            genotype="<em>MTLa/MTLa</em>"
            notes="Wild-type clinical isolate. Naturally homozygous for the MTLa mating type locus."
            citations={[
              {
                text: `Lockhart SR, Pujol C, Daniels KJ, Miller MG, Johnson AD, Pfaller MA, Soll DR. In <em>Candida albicans</em>, white-opaque switchers are homozygous for mating type. Genetics. 2002 Oct;162(2):737-45.`,
                pmid: '12399384',
              },
            ]}
          />

          <hr />

          {/* Red3/6 */}
          <StrainEntry
            name="Red3/6"
            genotype="<em>ade2/ade2</em>"
            notes="Isogenic to the WO-1 strain. Adenine auxotroph derived from the WO-1 strain by chemical mutagenesis using MNNG."
            citations={[
              {
                text: `Srikantha T, Chandrasekhar A, Soll DR. Functional analysis of the promoter of the phase-specific WH11 gene of <em>Candida albicans</em>. Mol Cell Biol. 1995 Mar;15(3):1797-805.`,
                pmid: '7862169',
              },
            ]}
          />

          <hr />

          {/* RM1000 */}
          <StrainEntry
            name="RM1000"
            genotype="<em>ura3</em>::imm434/<em>ura3</em>::imm434 <em>iro1/iro1</em>::imm434 <em>his1</em>::hisG/<em>his1</em>::hisG"
            notes="Isogenic to the SC5314 strain. Derived from the CAI4 strain by deletion of the HIS1 gene using the URA-blaster method. The standard RM1000 strain was found to have a heterozygous deletion on chromosome 5. RM1000#2 is an isolate that has been shown to have wild-type copies of chromosome 5."
            citations={[
              {
                text: `Negredo A, Monteoliva L, Gil C, Pla J, Nombela C. Cloning, analysis and one-step disruption of the ARG5,6 gene of <em>Candida albicans</em>. Microbiology. 1997 Feb;143 ( Pt 2):297-302.`,
                pmid: '9043106',
              },
            ]}
          />

          <hr />

          {/* BWP17 */}
          <StrainEntry
            name="BWP17"
            genotype="<em>ura3</em>::imm434/<em>ura3</em>::imm434 <em>iro1/iro1</em>::imm434 <em>his1</em>::hisG/<em>his1</em>::hisG <em>arg4</em>::hisG/<em>arg4</em>::hisG"
            notes="Isogenic to the SC5314 strain. Derived from the RM1000 strain by deletion of the ARG4 gene."
            citations={[
              {
                text: `Wilson RB, Davis D, Mitchell AP. Rapid hypothesis testing with <em>Candida albicans</em> through gene disruption with short homology regions. J Bacteriol. 1999 Mar;181(6):1868-74.`,
                pmid: '10074081',
              },
            ]}
          />

          <hr />

          {/* SN87 */}
          <StrainEntry
            name="SN87"
            genotype="<em>ura3</em>::imm434/<em>ura3</em>::imm434 <em>iro1/iro1</em>::imm434 <em>his1</em>::hisG/<em>his1</em>::hisG <em>leu2</em>::caSAT1/<em>leu2</em>::caSAT1"
            notes="Derived from RM1000 by deletion of LEU2."
            citations={[
              {
                text: `Noble SM, Johnson AD. Strains and strategies for large-scale gene deletion studies of the diploid human fungal pathogen <em>Candida albicans</em>. Eukaryot Cell. 2005 Feb;4(2):298-309.`,
                pmid: '15701792',
              },
            ]}
          />

          <hr />

          {/* SN95 */}
          <StrainEntry
            name="SN95"
            genotype="<em>arg4/arg4</em> <em>his1/his1</em> <em>URA3/ura3::imm434</em> <em>IRO1/iro1::imm434</em>"
            notes="Derived from SN76 by deletion of one copy of ARG4."
            citations={[
              {
                text: `Noble SM, Johnson AD. Strains and strategies for large-scale gene deletion studies of the diploid human fungal pathogen <em>Candida albicans</em>. Eukaryot Cell. 2005 Feb;4(2):298-309.`,
                pmid: '15701792',
              },
            ]}
          />

          <hr />

          {/* SN152 */}
          <StrainEntry
            name="SN152"
            genotype="<em>arg4/arg4</em> <em>leu2/leu2</em> <em>his1/his1</em> <em>URA3/ura3::imm434</em> <em>IRO1/iro1::imm434</em>"
            notes="Derived from SN95 by deletion of LEU2."
            citations={[
              {
                text: `Noble SM, Johnson AD. Strains and strategies for large-scale gene deletion studies of the diploid human fungal pathogen <em>Candida albicans</em>. Eukaryot Cell. 2005 Feb;4(2):298-309.`,
                pmid: '15701792',
              },
            ]}
          />

          <hr />

          {/* WO-1 */}
          <StrainEntry
            name="WO-1"
            genotype="<em>MTLalpha/MTLalpha</em>"
            notes="Clinical isolate. Naturally homozygous for the MTLalpha mating type locus. Genome sequence available at CGD."
            citations={[
              {
                text: `Slutsky B, Staebell M, Anderson J, Risen L, Pfaller M, Soll DR. 'White-opaque transition': a second high-frequency switching system in <em>Candida albicans</em>. J Bacteriol. 1987 Jan;169(1):189-97.`,
                pmid: '3539914',
              },
            ]}
          />

          <hr />

          {/* WUM5A */}
          <StrainEntry
            name="WUM5A"
            genotype="Wild-type clinical isolate"
            notes="Used in early molecular studies of Candida albicans."
            citations={[]}
          />
        </section>

        <hr />

        {/* C. glabrata Section */}
        <section className="info-section strain-section" id="glabrata">
          <h2>
            <em>C. glabrata</em> Laboratory Strains
          </h2>

          {/* Lineage Diagram */}
          <div className="lineage-diagram">
            <img
              src="/images/Cgla_lineage.gif"
              alt="C. glabrata lineage diagram"
              style={{ maxWidth: '100%', border: '2px solid #ccc' }}
            />
          </div>

          <p>
            See the{' '}
            <a href="/Strains.shtml#glabrata">
              full <em>C. glabrata</em> strain list
            </a>{' '}
            at the legacy page for complete strain information.
          </p>
        </section>

        <hr />

        {/* C. parapsilosis Section */}
        <section className="info-section strain-section" id="parapsilosis">
          <h2>
            <em>C. parapsilosis</em> Laboratory Strains
          </h2>

          {/* Lineage Diagram */}
          <div className="lineage-diagram">
            <img
              src="/images/Cpar_lineage.gif"
              alt="C. parapsilosis lineage diagram"
              style={{ maxWidth: '100%', border: '2px solid #ccc' }}
            />
          </div>

          <p>
            See the{' '}
            <a href="/Strains.shtml#parapsilosis">
              full <em>C. parapsilosis</em> strain list
            </a>{' '}
            at the legacy page for complete strain information.
          </p>
        </section>

        <hr />

        {/* C. tropicalis Section */}
        <section className="info-section strain-section" id="tropicalis">
          <h2>
            <em>C. tropicalis</em> Laboratory Strains
          </h2>

          {/* Lineage Diagram */}
          <div className="lineage-diagram">
            <img
              src="/images/Ctro_lineage.gif"
              alt="C. tropicalis lineage diagram"
              style={{ maxWidth: '100%', border: '2px solid #ccc' }}
            />
          </div>

          <p>
            See the{' '}
            <a href="/Strains.shtml#tropicalis">
              full <em>C. tropicalis</em> strain list
            </a>{' '}
            at the legacy page for complete strain information.
          </p>
        </section>
      </div>
    </div>
  );
}

export default StrainsPage;
