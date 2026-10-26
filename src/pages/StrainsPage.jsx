import React from 'react';
import { Link } from 'react-router-dom';
import './InfoPages.css';
import './yeast-comparison/PathogenicYeastComparison.css';

// Citation component for consistent display
const Citation = ({ text, pmid }) => (
  <div className="citation-item">
    <p dangerouslySetInnerHTML={{ __html: text || '' }} />
    {pmid && (
      <div className="citation-links">
        <a
          href={`/reference/${pmid}`}
          target="infowin"
          rel="noopener noreferrer"
          title="CGD Reference"
        >
          CGD Reference
        </a>
        <a
          href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}`}
          target="infowin"
          rel="noopener noreferrer"
          title="PubMed"
        >
          PubMed
        </a>
      </div>
    )}
  </div>
);

// Strain component for consistent display
const StrainEntry = ({ id, name, genotype, notes, citations }) => (
  <div className="strain-entry" id={id || name}>
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

// Strain list converted from the CGD Public Wiki (Strain Information).
function StrainsPage() {
  return (
    <div className="info-page pyc-page">
      <div className="info-page-content" id="top_of_list">
        <p className="pyc-breadcrumb">
          <Link to="/pathogenic-yeast-comparison">Pathogenic Yeast Comparison</Link>
        </p>
        <h1>
          <em>Candida</em> Strains
        </h1>

        <p>
          This list has been compiled by CGD curators as a brief reference to commonly used
          laboratory and clinical strains of the <em>Candida</em> species in CGD, rather than a
          comprehensive resource. The strain names below link to short summary descriptions, notes,
          and citations. If you would like to suggest additions, corrections, or updates, please{' '}
          <Link to="/contact">send a message to CGD curators</Link> with details. For genome-scale
          mutant collections, see <Link to="/library-collections">Library Collections</Link>.
        </p>

        <ul className="pyc-toc">
          <li><a href="#candida-albicans-strains"><em>Candida albicans</em> Strains</a> (14 strains)</li>
          <li><a href="#candida-glabrata-nakaseomyces-glabratus-strains"><em>Candida glabrata</em> (<em>Nakaseomyces glabratus</em>) Strains</a> (9 strains)</li>
          <li><a href="#candida-parapsilosis-strains"><em>Candida parapsilosis</em> Strains</a> (6 strains)</li>
          <li><a href="#candida-auris-candidozyma-auris-strains"><em>Candida auris</em> (<em>Candidozyma auris</em>) Strains</a> (6 strains)</li>
          <li><a href="#candida-tropicalis-strains"><em>Candida tropicalis</em> Strains</a> (5 strains)</li>
          <li><a href="#candida-dubliniensis-strains"><em>Candida dubliniensis</em> Strains</a> (1 strain)</li>
        </ul>

        <hr />

        <section className="info-section strain-section" id="candida-albicans-strains">
          <h2><em>Candida albicans</em> Strains</h2>
          <ul className="strain-list">
            <li><a href="#sc5314">SC5314</a></li>
            <li><a href="#bwp17">BWP17</a></li>
            <li><a href="#caf2-1">CAF2-1</a></li>
            <li><a href="#cai4">CAI4</a></li>
            <li><a href="#cai8">CAI8</a></li>
            <li><a href="#p37005">P37005</a></li>
            <li><a href="#red3-6">Red3/6</a></li>
            <li><a href="#rm1000">RM1000</a></li>
            <li><a href="#sn87">SN87</a></li>
            <li><a href="#sn95">SN95</a></li>
            <li><a href="#sn152">SN152</a></li>
            <li><a href="#sn250">SN250</a></li>
            <li><a href="#wo-1">WO-1</a></li>
            <li><a href="#wum5a">WUM5A</a></li>
          </ul>

          <hr />
          <StrainEntry
            id="sc5314"
            name="SC5314"
            genotype={`wild type`}
            notes={`Wild-type strain used in the systematic sequencing project, the reference sequence stored in CGD. The original strain background from which most of the common laboratory strains are derived. This strain is virulent in a mouse model of systemic infection and is frequently used as a wild-type control. In their 2004 Genome Biology paper on C. albicans genome sequence, Frank Odds, Al Brown and Neil Gow explain the origins of SC5314: "Strain SC5314 was used in the 1980s by scientists at the E.R. Squibb company (now Bristol-Myers Squibb, see Note1) for their pioneering studies of C. albicans molecular biology. It was engineered by Fonzi and Irwin to provide the uridine autotrophic mutant that has been essential to most subsequent molecular genetic research into C. albicans. The strain is usually described merely as a 'clinical isolate', but it is worth setting on record that SC5314 was originally isolated from a patient with generalized Candida infection by Margarita Silva-Hutner (see Note 2) at the Department of Dermatology, Columbia College of Physicians and Surgeons (New York, USA). The original isolate number was 1775 and the strain is identical with strain NYOH#4657 in the New York State Department of Health collection. (This information was provided by Joan Fung-Tome at Bristol-Myers Squibb as a personal communication.) SC5314 belongs to the predominant clade of closely related C. albicans strains that represents almost 40% of all isolates worldwide, as determined by DNA fingerprinting and multi-locus sequence typing (A. Tavanti, A.D. Davidson, N.A.R.G., M.C.J. Maiden and F.C.O., unpublished observations)."<br/><br/>Note 1: The earliest publications that used SC5314 came in 1968 from Squibb Institute for Medical Research.<br/><br/>Note 2: The documentation of the work done by Margarita Silva-Hutner and her lab is preserved at <a href="http://www.columbia.edu/cu/lweb/archival/collections/ldpd_5541782/" target="_blank" rel="noopener noreferrer">Columbia University Archival Collections</a>.`}
            citations={[
              { text: `Odds et al., 2004. Genome Biol. 2004; 5(7): 230`, pmid: '15239821' },
              { text: `Fonzi and Irwin, 1993. 1993 Jul;134(3):717-28`, pmid: '8349105' },
              { text: `Aszalos et al., 1968. J Antibiot (Tokyo). 1968 Oct;21(10):611-5`, pmid: '5715671' },
              { text: `Maestrone and Semar, 1968. Naturwissenschaften. 1968 Feb;55(2):87-8`, pmid: '5703113' },
              { text: `Meyers et al., 1968. Appl Microbiol. 1968 Apr;16(4):603-8.`, pmid: '5647519' },
            ]}
          />

          <hr />
          <StrainEntry
            id="bwp17"
            name="BWP17"
            genotype={`ura3::imm434/ura3::imm434 iro1/iro1::imm434 his1::hisG/his1::hisG arg4/arg4`}
            notes={`Isogenic to the SC5314 strain. Uridine, histidine and arginine auxotroph derived from the RM1000 strain by deletion of the ARG4 gene. This strain has a heterozygous deletion on chromosome 5 that was inherited from the RM1000 parental strain.`}
            citations={[
              { text: `Wilson et al., 1999. J Bacteriol. 1999 Mar;181(6):1868-74.`, pmid: '10074081' },
            ]}
          />

          <hr />
          <StrainEntry
            id="caf2-1"
            name="CAF2-1"
            genotype={`URA3/ura3::imm434 IRO1/iro1::imm434`}
            notes={`URA3 heterozygous strain derived from the SC5314 strain. The 3-prime end of one copy of the IRO1 gene that resides adjacent to URA3 was inadvertently deleted during the construction of this strain. This strain is virulent in a mouse model of systemic infection and is frequently used as a wild-type control.`}
            citations={[
              { text: `Fonzi and Irwin, 1993. Genetics 1993 Jul;134(3):717-28.`, pmid: '8349105' },
            ]}
          />

          <hr />
          <StrainEntry
            id="cai4"
            name="CAI4"
            genotype={`ura3::imm434/ura3::imm434 iro1/iro1::imm434`}
            notes={`Isogenic to the SC5314 strain. Uridine auxotroph constructed by deletion of the second copy of URA3. The second copy of IRO1 was inadvertently deleted upon strain construction. As a result, the strain and its descendants have no functional copy of IRO1. This strain is avirulent in a mouse model of systemic infection unless complemented with URA3.`}
            citations={[
              { text: `Fonzi and Irwin, 1993. Genetics 1993 Jul;134(3):717-28`, pmid: '8349105' },
              { text: `Garcia et al., 2001. Yeast. 2001 Mar 15;18(4):301-11.`, pmid: '11223939' },
            ]}
          />

          <hr />
          <StrainEntry
            id="cai8"
            name="CAI8"
            genotype={`ura3::imm434/ura3::imm434 iro1/iro1::imm434 ade2::hisG/ade2::hisG`}
            notes={`Isogenic to the SC5314 strain. Derived from the CAF2-1 strain by deletion of URA3 and both copies of ADE2 using the URA-blaster method.`}
            citations={[
              { text: `Fonzi and Irwin, 1993. Genetics 1993 Jul;134(3):717-28.`, pmid: '8349105' },
            ]}
          />

          <hr />
          <StrainEntry
            id="p37005"
            name="P37005"
            genotype={`MTLa/MTLa`}
            notes={`Wild-type clinical isolate. Naturally homozygous for the MTLa mating type locus.`}
            citations={[
              { text: `Lockhart et al., 2002. Genetics. 2002 Oct;162(2):737-45.`, pmid: '12399384' },
            ]}
          />

          <hr />
          <StrainEntry
            id="red3-6"
            name="Red3/6"
            genotype={`ade2/ade2`}
            notes={`Isogenic to the WO-1 strain. Adenine auxotroph derived from the WO-1 strain by chemical mutagenesis using MNNG.`}
            citations={[
              { text: `Srikantha et al., 1995. Mol Cell Biol. 1995 Mar;15(3):1797-805.`, pmid: '7862169' },
            ]}
          />

          <hr />
          <StrainEntry
            id="rm1000"
            name="RM1000"
            genotype={`ura3::imm434/ura3::imm434 iro1/iro1::imm434 his1::hisG/his1::hisG`}
            notes={`Isogenic to the SC5314 strain. Derived from the CAI4 strain by deletion of the HIS1 gene using the URA-blaster method (see Fonzi and Irwin, 1993 for details of this method). The standard RM1000 strain was found to have a heterozygous deletion on chromosome 5. RM1000#2 is an isolate that has been shown to have wild-type copies of chromosome 5.`}
            citations={[
              { text: `Negredo et al., 1997. Microbiology. 1997 Feb;143 ( Pt 2):297-302.`, pmid: '9043106' },
            ]}
          />

          <hr />
          <StrainEntry
            id="sn87"
            name="SN87"
            genotype={`ura3::imm434::URA3/ura3::imm434 iro1::IRO1/iro1::imm434 his1::hisG/his1::hisG leu2/leu2`}
            notes={`Isogenic to the SC5314 strain. Histidine and leucine auxotroph derived from the RM1000#2 strain by deletion of the LEU2 gene. This strain is virulent in a mouse model of systemic infection.`}
            citations={[
              { text: `Noble and Johnson, 2005. Eukaryot Cell. 2005 Feb;4(2):298-309.`, pmid: '15701792' },
            ]}
          />

          <hr />
          <StrainEntry
            id="sn95"
            name="SN95"
            genotype={`ura3::imm434::URA3/ura3iro1IRO1/iro1his1his1arg4/arg4`}
            notes={`Isogenic to the SC5314 strain. Histidine and arginine auxotroph derived from the RM1000#2 strain by deletion of the ARG4 gene. This strain is virulent in a mouse model of systemic infection.`}
            citations={[
              { text: `Noble and Johnson, 2005. Eukaryot Cell. 2005 Feb;4(2):298-309.`, pmid: '15701792' },
            ]}
          />

          <hr />
          <StrainEntry
            id="sn152"
            name="SN152"
            genotype={`ura3/::imm434::URA3/ura3::imm434 iro1::IRO1/iro1::imm434 his1::hisG/his1::hisG leu2/leu2 arg4/arg4`}
            notes={`Isogenic to the SC5314 strain. Histidine, leucine and arginine auxotroph derived from the RM1000#2 strain by deletion of the LEU2 and ARG4 genes. This strain is virulent in a mouse model of systemic infection.`}
            citations={[
              { text: `Noble and Johnson, 2005. Eukaryot Cell. 2005 Feb;4(2):298-309.`, pmid: '15701792' },
            ]}
          />

          <hr />
          <StrainEntry
            id="sn250"
            name="SN250"
            genotype={`his1Δ/his1Δ, leu2Δ::C.dubliniensis HIS1 /leu2Δ::C.maltosa LEU2, arg4Δ /arg4Δ, URA3/ura3Δ::imm434, IRO1/iro1Δ::imm434`}
            notes={`Isogenic to the SC5314 strain. Derived from SN87 by integration of C. dubliniensis HIS1 and C. maltosa LEU2 at the disrupted leu2 loci and then deleted for arg4. Derived from SN87 and QMY23.`}
            citations={[
              { text: `Noble et al., 2010. Nat Genet. 2010 Jul;42(7):590-8`, pmid: '20543849' },
              { text: `Mitrovich et al., 2007. Genome Res. 2007 Apr;17(4):492-502.`, pmid: '17351132' },
            ]}
          />

          <hr />
          <StrainEntry
            id="wo-1"
            name="WO-1"
            genotype={`MTLalpha`}
            notes={`Wild-type clinical isolate that switches between white and opaque phenotypes at high frequency. The MTLa locus is absent in this strain (for more information see Lockhart et al., 2002). This strain has been sequenced by the Broad Institute (<a href="http://www.broadinstitute.org/annotation/genome/candida_group/GenomeDescriptions.html)" target="_blank" rel="noopener noreferrer">http://www.broadinstitute.org/annotation/genome/candida_group/GenomeDescriptions.html)</a>`}
            citations={[
              { text: `Slutsky et al., 1987. J Bacteriol. 1987 Jan;169(1):189-97`, pmid: '3539914' },
              { text: `Lockhart et al., 2002. Genetics. 2002 Oct;162(2):737-45.`, pmid: '12399384' },
            ]}
          />

          <hr />
          <StrainEntry
            id="wum5a"
            name="WUM5A"
            genotype={`MTLalpha/MTLalpha ura3-1Δ::FRT/ura3-2Δ::FRT`}
            notes={`Isogenic to the WO-1 strain. Uridine auxotroph constructed by deletion of both copies of URA3.`}
            citations={[
              { text: `Strauss et al. 2001. J Bacteriol. 2001 Jun;183(12):3761-9.`, pmid: '11371541' },
            ]}
          />
        </section>

        <section className="info-section strain-section" id="candida-glabrata-nakaseomyces-glabratus-strains">
          <h2><em>Candida glabrata</em> (<em>Nakaseomyces glabratus</em>) Strains</h2>
          <ul className="strain-list">
            <li><a href="#b">B</a></li>
            <li><a href="#bg2">BG2</a></li>
            <li><a href="#bg14">BG14</a></li>
            <li><a href="#bg462">BG462</a></li>
            <li><a href="#cbs138-atcc-2001">CBS138 (ATCC 2001)</a></li>
            <li><a href="#2001t">2001T</a></li>
            <li><a href="#2001ht">2001HT</a></li>
            <li><a href="#nccls84-atcc-90030">NCCLS84 (ATCC 90030)</a></li>
            <li><a href="#84u">84u</a></li>
          </ul>

          <hr />
          <StrainEntry
            id="b"
            name="B"
            genotype={`Wild type`}
            notes={`Clinical isolate from a case of vaginitis that did not respond to fluconazole or boric acid treatment; it is virulent in a murine model of vaginitis. This strain was called LF 547.92 in the original publication.`}
            citations={[
              { text: `Fidel et al., 1996. J Infect Dis. 1996 Feb;173(2):425-31.`, pmid: '8568305' },
            ]}
          />

          <hr />
          <StrainEntry
            id="bg2"
            name="BG2"
            genotype={`Wild type`}
            notes={`Clinical isolate from a case of vaginitis that did not respond to fluconazole or boric acid treatment; it is virulent in a murine model of vaginitis`}
            citations={[
              { text: `Cormack and Falkow, 1999. Genetics. 1999 Mar;151(3):979-87.`, pmid: '10049916' },
            ]}
          />

          <hr />
          <StrainEntry
            id="bg14"
            name="BG14"
            genotype={`<em>ura3-delta(-285 +932)::Tn903NeoR</em>`}
            notes={`A <em>ura3</em> derivative of the wild-type B2 clinical isolate.`}
            citations={[
              { text: `Cormack and Falkow, 1999. Genetics. 1999 Mar;151(3):979-87.`, pmid: '10049916' },
            ]}
          />

          <hr />
          <StrainEntry
            id="bg462"
            name="BG462"
            genotype={`<em>URA3</em>`}
            notes={`A derivative of the B2 clinical isolate with the <em>URA3</em> gene restored`}
            citations={[
              { text: `De Las Peñas, et al., 2003. Genes Dev. 2003 Sep 15;17(18):2245-58.`, pmid: '12952896' },
            ]}
          />

          <hr />
          <StrainEntry
            id="cbs138-atcc-2001"
            name="CBS138 (ATCC 2001)"
            genotype={`Wild type`}
            notes={`Type strain for the <em>Genolevures C. glabrata</em> sequencing project. This strain has also been called NRRL-Y-65 and IFO 0622.`}
            citations={[
              { text: `Dujon et al., 2004. Nature. 2004 Jul 1;430(6995):35-44`, pmid: '15229592' },
              { text: `Koszul, et al., 2003. FEBS Lett. 2003 Jan 16;534(1-3):39-48.`, pmid: '12527359' },
            ]}
          />

          <hr />
          <StrainEntry
            id="2001t"
            name="2001T"
            genotype={`<em>trp1</em>`}
            notes={`A <em>trp1</em> auxotrophic strain derived from the CBS138 (ATCC 2001) wild-type strain.`}
            citations={[
              { text: `Kitada et al., 1995. Gene. 1995 Nov 20;165(2):203-6.`, pmid: '8522176' },
            ]}
          />

          <hr />
          <StrainEntry
            id="2001ht"
            name="2001HT"
            genotype={`<em>his3 trp1::ScURA3</em>`}
            notes={`A <em>his3 trp1</em> auxotrophic strain derived from 200T, a derivative of the CBS138 (ATCC 2001) wild-type strain.`}
            citations={[
              { text: `Kitada et al., 1995. Gene. 1995 Nov 20;165(2):203-6.`, pmid: '8522176' },
            ]}
          />

          <hr />
          <StrainEntry
            id="nccls84-atcc-90030"
            name="NCCLS84 (ATCC 90030)"
            genotype={`Wild type`}
            notes={`Wild-type strain`}
            citations={[
              { text: `Espinel-Ingroff et al., 1992. J Clin Microbiol. 1992 Dec;30(12):3138-45`, pmid: '1452697' },
            ]}
          />

          <hr />
          <StrainEntry
            id="84u"
            name="84u"
            genotype={`<em>ura3</em>`}
            notes={`A <em>ura3</em> derivative of the wild-type NCCLS84 (ATCC90030) strain.`}
            citations={[
              { text: `Tsai et al., 2006. Antimicrob Agents Chemother. 2006 Apr;50(4):1384-92.`, pmid: '16569856' },
            ]}
          />
        </section>

        <section className="info-section strain-section" id="candida-parapsilosis-strains">
          <h2><em>Candida parapsilosis</em> Strains</h2>
          <ul className="strain-list">
            <li><a href="#atcc-22019">ATCC 22019</a></li>
            <li><a href="#cdc317">CDC317</a></li>
            <li><a href="#clib214-cbs-604-atcc-22019-nrrl-y-12969">CLIB214 (CBS 604; ATCC 22019; NRRL Y-12969)</a></li>
            <li><a href="#cpl2">CPL2</a></li>
            <li><a href="#ga1">GA1</a></li>
            <li><a href="#sr23-cbs7157">SR23 (CBS7157)</a></li>
          </ul>

          <hr />
          <StrainEntry
            id="atcc-22019"
            name="ATCC 22019"
            genotype={`heterozygous MET/met`}
            notes={`Application of parasexual genetic methods was used to determine that <em>C. parapsilosis</em> strain ATCC 22019 is is heterozygous MET/met`}
            citations={[
              { text: `Whelan and Kwon-Chung, 1988. J Med Vet Mycol 1988 Jun;26(3):163-71.`, pmid: '3171823' },
            ]}
          />

          <hr />
          <StrainEntry
            id="cdc317"
            name="CDC317"
            genotype={`Wild type`}
            notes={`Reference strain used for the <em>C. parapsilosis</em> sequencing project. This isolate came from the hands of a hospital worker, who was the source for an outbreak of infection in a Mississippi community hospital in 2001.`}
            citations={[
              { text: `Kuhn et al., 2004. Emerg Infect Dis. 2004 Jun;10(6):1074-81`, pmid: '15207060' },
              { text: `Clark et al., 2004. J Clin Microbiol. 2004 Oct;42(10):4468-72.`, pmid: '15472295' },
            ]}
          />

          <hr />
          <StrainEntry
            id="clib214-cbs-604-atcc-22019-nrrl-y-12969"
            name="CLIB214 (CBS 604; ATCC 22019; NRRL Y-12969)"
            genotype={`Wild type`}
            notes={`Type strain, originally isolated from a patient with diarrhea in Puerto Rico by Ashford (1928). This strain is dependent on oxidative metabolism for growth since it lacks a fermentative pathway.`}
            citations={[
              { text: `<a href="https://shop.elsevier.com/books/the-yeasts/kurtzman/978-0-444-52149-1" target="_blank" rel="noopener noreferrer">Kurtzman CP, Fell JW, Boekhout T (eds), 2011</a>. The yeasts: a taxonomic study. p. 987-1278, 5th ed. Elsevier, London, United Kingdom`, pmid: null },
              { text: `Logue et al., 2005. Eukaryot Cell 4(6):1009-17.`, pmid: '15947193' },
            ]}
          />

          <hr />
          <StrainEntry
            id="cpl2"
            name="CPL2"
            genotype={`<em>leu2Δ::FRT/leu2Δ::FRT, his1Δ::FRT/his1Δ::FRT, frt::CdHIS1</em>`}
            notes={`Leucine auxotroph laboratory strain`}
            citations={[
              { text: `Németh et al., 2021. Virulence. 2021 Dec;12(1):937-950.`, pmid: '33729086' },
            ]}
          />

          <hr />
          <StrainEntry
            id="ga1"
            name="GA1"
            genotype={`Wild type`}
            notes={`Wild-type clinical isolate. The SAT1 flipper method and the <em>Candida albicans IMH3</em> gene have been used as dominant-selectable markers to construct gene knockouts in this strain.`}
            citations={[
              { text: `Gácser et al., 2005. FEMS Microbiol Lett. 2005 Apr 1;245(1):117-21`, pmid: '15796988' },
              { text: `Gácser et al., 2007. J Clin Invest. 2007 Oct;117(10):3049-58.`, pmid: '17853941' },
            ]}
          />

          <hr />
          <StrainEntry
            id="sr23-cbs7157"
            name="SR23 (CBS7157)"
            genotype={`<em>ade- lys-</em>`}
            notes={`An adenine and lysine auxotroph isolated from a contaminated culture of <em>Saccharomyces cerevisiae</em> as a yeast with peculiar physiological features and carrying a linear mitochondrial DNA`}
            citations={[
              { text: `Kovac et al., 1984. Mol Gen Genet 197:420-424`, pmid: '6098800' },
              { text: `Nosek et al., 2004. Mol Genet Genomics 272(2):173-80`, pmid: '15449175' },
              { text: `Mutalová et al., 2024. Microbiol Resour Announc. 2024 Jul 31;13(9):e00347-24.`, pmid: '39083682' },
            ]}
          />
        </section>

        <section className="info-section strain-section" id="candida-auris-candidozyma-auris-strains">
          <h2><em>Candida auris</em> (<em>Candidozyma auris</em>) Strains</h2>
          <ul className="strain-list">
            <li><a href="#ar0382-b11109">AR0382 (B11109)</a></li>
            <li><a href="#ar0387-b8441">AR0387 (B8441)</a></li>
            <li><a href="#ar0389">AR0389</a></li>
            <li><a href="#ar0390-b11205">AR0390 (B11205)</a></li>
            <li><a href="#b11220">B11220</a></li>
            <li><a href="#b11221">B11221</a></li>
          </ul>

          <hr />
          <StrainEntry
            id="ar0382-b11109"
            name="AR0382 (B11109)"
            genotype={`Wild type`}
            notes={`Aggregative strain with high biofilm formation.`}
            citations={[
              { text: `Vila et al., 2020. mSphere. 2020 Aug 5;5(4):e00760-20`, pmid: '32759340' },
              { text: `Wang et al., 2024. Nat Commun. 2024 Oct 25;15(1):9212.`, pmid: '39455573' },
            ]}
          />

          <hr />
          <StrainEntry
            id="ar0387-b8441"
            name="AR0387 (B8441)"
            genotype={`Wild type`}
            notes={`Reference strain; non-aggregative strain with low biofilm formation.`}
            citations={[
              { text: `Vila et al., 2020. mSphere. 2020 Aug 5;5(4):e00760-20`, pmid: '32759340' },
              { text: `Wang et al., 2024. Nat Commun. 2024 Oct 25;15(1):9212.`, pmid: '39455573' },
            ]}
          />

          <hr />
          <StrainEntry
            id="ar0389"
            name="AR0389"
            genotype={`<em>erg11-Y132F</em>`}
            notes={`Has high drug resistance due to an <em>ERG11</em> mutation (Y132F) and overexpression of the drug efflux transporter gene <em>CDR1</em>.`}
            citations={[
              { text: `Shinohara et al., 2024. JAC Antimicrob Resist. 2024 Feb 21;6(1):dlad155.`, pmid: '38384742' },
            ]}
          />

          <hr />
          <StrainEntry
            id="ar0390-b11205"
            name="AR0390 (B11205)"
            genotype={`<em>erg11-K143R</em>`}
            notes={`Clinical isolate with high fluconazole resistance.`}
            citations={[
              { text: `Rybak et al., 2021. Microbiol Spectr. 2021 Dec 8;9(3):e01585-21.`, pmid: '34878305' },
            ]}
          />

          <hr />
          <StrainEntry
            id="b11220"
            name="B11220"
            genotype={`Wild type`}
            notes={`Clade II clinical isolate with susceptibility to all antifungal drugs.`}
            citations={[
              { text: `Yang et al., 2024. Infect Immun. 2024 Jun 11;92(6):e0010324.`, pmid: '38722168' },
            ]}
          />

          <hr />
          <StrainEntry
            id="b11221"
            name="B11221"
            genotype={`Wild type`}
            notes={`Clade III clinical isolate with resistance to caspofungin. Contains an L-rhamnose utilization cluster that appears to allow more ready use of alternate sugars, better drug tolerance, and better survival from host immune cell attack, possibly due to reduced β-(1,3)-glucans at the cell surface.`}
            citations={[
              { text: `Yang et al., 2024. Infect Immun. 2024 Jun 11;92(6):e0010324.`, pmid: '38722168' },
            ]}
          />
        </section>

        <section className="info-section strain-section" id="candida-tropicalis-strains">
          <h2><em>Candida tropicalis</em> Strains</h2>
          <ul className="strain-list">
            <li><a href="#atcc-20336-pk233">ATCC 20336 (pK233)</a></li>
            <li><a href="#atcc-20913">ATCC 20913</a></li>
            <li><a href="#atcc-750">ATCC 750</a></li>
            <li><a href="#ncyc2512">NCYC2512</a></li>
            <li><a href="#1230">1230</a></li>
          </ul>

          <hr />
          <StrainEntry
            id="atcc-20336-pk233"
            name="ATCC 20336 (pK233)"
            genotype={`Wild type`}
            notes={`This strain excretes alpha,omega-dicarboxylic acids as a by-product when cultured on n-alkanes or fatty acids as the carbon source.`}
            citations={[
              { text: `Craft et al., 2003. Appl Environ Microbiol 69(10):5983-91.`, pmid: '14532053' },
            ]}
          />

          <hr />
          <StrainEntry
            id="atcc-20913"
            name="ATCC 20913"
            genotype={`<em>ura3/ura3</em>`}
            notes={`A uracil auxotroph derived from <em>C. tropicalis</em> ATCC 20336 by random mutagenesis.`}
            citations={[
              { text: `Haas et al., 1990. J Bacteriol 172(8):4571-7.`, pmid: '2198267' },
            ]}
          />

          <hr />
          <StrainEntry
            id="atcc-750"
            name="ATCC 750"
            genotype={`Wild type`}
            notes={`A wild-type fluconazole susceptible strain.`}
            citations={[
              { text: `Barchiesi et al., 2000. Antimicrob Agents Chemother 44(6):1578-84.`, pmid: '10817712' },
            ]}
          />

          <hr />
          <StrainEntry
            id="ncyc2512"
            name="NCYC2512"
            genotype={`Wild type`}
            notes={`A wild-type saline soil isolate from Pakistan that is capable of producing large amounts of alpha,omega-dodecanedioic acid.`}
            citations={[
              { text: `Rodriguez et al., 1996. Yeast 12(13):1321-9.`, pmid: '8923737' },
            ]}
          />

          <hr />
          <StrainEntry
            id="1230"
            name="1230"
            genotype={`Wild type`}
            notes={`A wild-type dicarboxylic acid-producing industrial strain.`}
            citations={[
              { text: `He and Chen, 2005. Yeast 22(6):481-91.`, pmid: '15849785' },
            ]}
          />
        </section>

        <section className="info-section strain-section" id="candida-dubliniensis-strains">
          <h2><em>Candida dubliniensis</em> Strains</h2>
          <ul className="strain-list">
            <li><a href="#cd36">CD36</a></li>
          </ul>

          <hr />
          <StrainEntry
            id="cd36"
            name="CD36"
            genotype={`Wild type`}
            notes={`Type strain, oral isolate from an HIV+ patient in Ireland; also catalogued as NCPF 3949 and CBS-7987.`}
            citations={[
              { text: `Sullivan et al., 1995. Microbiology (Reading) 1995 Jul:141 ( Pt 7):1507-21.`, pmid: '7551019' },
            ]}
          />
        </section>
      </div>
    </div>
  );
}

export default StrainsPage;
