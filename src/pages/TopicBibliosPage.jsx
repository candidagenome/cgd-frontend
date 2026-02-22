import React from 'react';
import './InfoPages.css';

// Citation component for consistent display
const Citation = ({ text, pmid, children }) => (
  <div className="citation-item">
    <p dangerouslySetInnerHTML={{ __html: text || '' }} />
    {children}
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

function TopicBibliosPage() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>Highlights in <em>Candida</em> biology</h1>
        <hr />

        <section className="info-section">
          <p>
            The selected topics on the bulleted list below link to sets of references compiled by CGD
            curators. These lists are intended to provide a brief overview of literature pertaining
            to each topic, rather than comprehensive bibliographies.
          </p>
        </section>

        <hr />

        {/* Table of Contents */}
        <section className="info-section" id="top_of_list">
          <h2>Selected Topics in <em>Candida albicans</em> Biology</h2>
          <ul className="topic-list">
            <li><a href="#Autophagy">Autophagy</a></li>
            <li><a href="#Biofilm">Biofilm Formation</a></li>
            <li><a href="#CellCycle">Cell Cycle</a></li>
            <li><a href="#CellWall">Cell Wall</a></li>
            <li><a href="#Chlamydospore">Chlamydospore Development</a></li>
            <li><a href="#CO2">CO2 sensing</a></li>
            <li><a href="#Drug">Drug resistance</a></li>
            <li><a href="#Tools">Gene Disruption and Molecular Tools</a></li>
            <li><a href="#GeneticInstability">Genetic Instability</a></li>
            <li><a href="#HostPatho">Host-Pathogen Interactions</a></li>
            <li><a href="#HostResponse">Host-Pathogen Interactions: Host Response to <em>C. albicans</em></a></li>
            <li><a href="#C.albicansResponse">Host-Pathogen Interactions: <em>C. albicans</em> Response to Host</a></li>
            <li><a href="#Hypoxia">Hypoxia</a></li>
            <li><a href="#Mating">Mating and the Parasexual Cycle</a></li>
            <li><a href="#Models">Models of Infection</a></li>
            <li><a href="#Morphogenesis">Morphogenesis and Polarized Cell Growth</a></li>
            <li><a href="#Switching">Phenotypic Switching</a></li>
            <li><a href="#pH">pH Response</a></li>
            <li><a href="#Quorum">Quorum Sensing</a></li>
            <li><a href="#Stress">Stress Response and Resistance</a></li>
            <li><a href="#Tropism">Thigmotropism and Galvanotropism</a></li>
            <li><a href="#Vacuolar">Vacuolar Dynamics and Inheritance</a></li>
            <li><a href="#Virulence">Virulence and Virulence Factors</a></li>
          </ul>

          <h2>Selected Topics in <em>Candida glabrata</em> Biology</h2>
          <ul className="topic-list">
            <li><a href="#CgReviews">Reviews about <em>Candida glabrata</em></a></li>
            <li><a href="#CgBiofilm">Biofilm Formation</a></li>
            <li><a href="#CgCellWall">Cell Wall and Adhesins</a></li>
            <li><a href="#CgDrug">Drug resistance</a></li>
            <li><a href="#CgSilencing">Gene Silencing</a></li>
            <li><a href="#CgMating">Mating Types</a></li>
            <li><a href="#CgSwitching">Phenotypic Switching</a></li>
            <li><a href="#CgVirulence">Virulence and Pathogenesis</a></li>
          </ul>

          <h2>Selected Topics in <em>Candida auris</em> Biology</h2>
          <ul className="topic-list">
            <li><a href="#CauReviews">Reviews about <em>Candida auris</em></a></li>
            <li><a href="#CauGenome">Genome Sequence</a></li>
          </ul>
        </section>

        <hr />

        {/* C. albicans Topics */}
        <section className="info-section">
          <h2>Selected Topics in <em>Candida albicans</em> Biology</h2>
        </section>

        <hr />

        {/* Autophagy Section */}
        <section className="info-section topic-section" id="Autophagy">
          <h3>Autophagy</h3>

          <Citation
            text="Kiel JA. Autophagy in unicellular eukaryotes. Philos Trans R Soc Lond B Biol Sci. 2010 Mar 12;365(1541):819-30."
            pmid="20124347"
          />

          <Citation
            text="Palmer GE, Askew DS, Williamson PR. The diverse roles of autophagy in medically important fungi. Autophagy. 2008 Nov 16;4(8):982-8. Epub 2008 Nov 29."
            pmid="18927489"
          />

          <Citation
            text="Palmer GE. Autophagy in the invading pathogen. Autophagy. 2007 May-Jun;3(3):251-3. Epub 2007 May 10."
            pmid="17224622"
          />

          <Citation
            text={`Palmer GE, Kelly MN, Sturtevant JE. Autophagy in the pathogen <em>Candida albicans</em>. Microbiology. 2007 Jan;153(Pt 1):51-8.`}
            pmid="17185534"
          />

          <p className="list-updated"><em>List last updated:</em> 05/26/2010 <a href="#top_of_list">Back to top</a></p>
        </section>

        <hr />

        {/* Biofilm Section */}
        <section className="info-section topic-section" id="Biofilm">
          <h3>Biofilm Formation</h3>

          <Citation
            text="Blankenship JR, Mitchell AP. How to build a biofilm: a fungal perspective. Curr Opin Microbiol. 2006 Dec;9(6):588-94. Epub 2006 Oct 20."
            pmid="17055772"
          />

          <Citation
            text={`Chandra J, Mukherjee PK, Ghannoum MA. In vitro growth and analysis of <em>Candida</em> biofilms. Nat Protoc. 2008;3(12):1909-24.`}
            pmid="19180075"
          />

          <Citation
            text={`Dongari-Bagtzoglou A, Kashleva H, Dwivedi P, Diaz P, Vasilakos J. Characterization of mucosal <em>Candida albicans</em> biofilms. PLoS One. 2009 Nov 24;4(11):e7967.`}
            pmid="19956771"
          />

          <Citation
            text={`Kumamoto CA, Vinces MD. Alternative <em>Candida albicans</em> lifestyles: growth on surfaces. Annu Rev Microbiol. 2005;59:113-33.`}
            pmid="16153165"
          />

          <Citation
            text={`Nobile CJ, Mitchell AP. Genetics and genomics of <em>Candida albicans</em> biofilm formation. Cell Microbiol. 2006 Sep;8(9):1382-91.`}
            pmid="16848788"
          />

          <Citation
            text="Ramage G, Mowat E, Jones B, Williams C, Lopez-Ribot J. Our current understanding of fungal biofilms. Crit Rev Microbiol. 2009;35(4):340-55."
            pmid="19863383"
          />

          <p className="list-updated"><em>List last updated:</em> 05/15/2010 <a href="#top_of_list">Back to top</a></p>
        </section>

        <hr />

        {/* Cell Cycle Section */}
        <section className="info-section topic-section" id="CellCycle">
          <h3>Cell Cycle</h3>

          <Citation
            text={`Berman J. Morphogenesis and cell cycle progression in <em>Candida albicans</em>. Curr Opin Microbiol. 2006 Dec;9(6):595-601. Epub 2006 Oct 23.`}
            pmid="17055773"
          />

          <Citation
            text={`Selmecki A, Forche A, Berman J. Aneuploidy and isochromosome formation in drug-resistant <em>Candida albicans</em>. Science. 2006 Jul 21;313(5785):367-70.`}
            pmid="16857942"
          />

          <p className="list-updated"><em>List last updated:</em> 05/15/2010 <a href="#top_of_list">Back to top</a></p>
        </section>

        <hr />

        {/* Cell Wall Section */}
        <section className="info-section topic-section" id="CellWall">
          <h3>Cell Wall</h3>

          <Citation
            text={`Chaffin WL, López-Ribot JL, Casanova M, Gozalbo D, Martínez JP. Cell wall and secreted proteins of <em>Candida albicans</em>: identification, function, and expression. Microbiol Mol Biol Rev. 1998 Mar;62(1):130-80.`}
            pmid="9529890"
          />

          <Citation
            text={`Gow NA, van de Veerdonk FL, Brown AJ, Netea MG. <em>Candida albicans</em> morphogenesis and host defence: discriminating invasion from colonization. Nat Rev Microbiol. 2012 Jan 16;10(2):112-22.`}
            pmid="22158429"
          />

          <p className="list-updated"><em>List last updated:</em> 05/15/2010 <a href="#top_of_list">Back to top</a></p>
        </section>

        <hr />

        {/* Drug Resistance Section */}
        <section className="info-section topic-section" id="Drug">
          <h3>Drug Resistance</h3>

          <Citation
            text={`Cowen LE, Steinbach WJ. Stress, drugs, and evolution: the role of cellular signaling in fungal drug resistance. Eukaryot Cell. 2008 May;7(5):747-64.`}
            pmid="18375617"
          />

          <Citation
            text={`Sanglard D, Odds FC. Resistance of <em>Candida</em> species to antifungal agents: molecular mechanisms and clinical consequences. Lancet Infect Dis. 2002 Feb;2(2):73-85.`}
            pmid="11901654"
          />

          <Citation
            text={`White TC, Marr KA, Bowden RA. Clinical, cellular, and molecular factors that contribute to antifungal drug resistance. Clin Microbiol Rev. 1998 Apr;11(2):382-402.`}
            pmid="9564569"
          />

          <p className="list-updated"><em>List last updated:</em> 05/15/2010 <a href="#top_of_list">Back to top</a></p>
        </section>

        <hr />

        {/* Virulence Section */}
        <section className="info-section topic-section" id="Virulence">
          <h3>Virulence and Virulence Factors</h3>

          <Citation
            text={`Calderone RA, Fonzi WA. Virulence factors of <em>Candida albicans</em>. Trends Microbiol. 2001 Jul;9(7):327-35.`}
            pmid="11435107"
          />

          <Citation
            text={`Mayer FL, Wilson D, Hube B. <em>Candida albicans</em> pathogenicity mechanisms. Virulence. 2013 Feb 15;4(2):119-28.`}
            pmid="23302789"
          />

          <Citation
            text={`Naglik JR, Challacombe SJ, Hube B. <em>Candida albicans</em> secreted aspartyl proteinases in virulence and pathogenesis. Microbiol Mol Biol Rev. 2003 Sep;67(3):400-28.`}
            pmid="12966142"
          />

          <p className="list-updated"><em>List last updated:</em> 05/15/2010 <a href="#top_of_list">Back to top</a></p>
        </section>

        <hr />

        {/* Additional placeholder sections */}
        <section className="info-section topic-section" id="Chlamydospore">
          <h3>Chlamydospore Development</h3>
          <p className="placeholder-note">See the full bibliography at <a href="/TopicBiblios.shtml">legacy page</a>.</p>
          <p className="list-updated"><a href="#top_of_list">Back to top</a></p>
        </section>

        <section className="info-section topic-section" id="CO2">
          <h3>CO2 sensing</h3>
          <p className="placeholder-note">See the full bibliography at <a href="/TopicBiblios.shtml">legacy page</a>.</p>
          <p className="list-updated"><a href="#top_of_list">Back to top</a></p>
        </section>

        <section className="info-section topic-section" id="Tools">
          <h3>Gene Disruption and Molecular Tools</h3>
          <p className="placeholder-note">See the full bibliography at <a href="/TopicBiblios.shtml">legacy page</a>.</p>
          <p className="list-updated"><a href="#top_of_list">Back to top</a></p>
        </section>

        <section className="info-section topic-section" id="GeneticInstability">
          <h3>Genetic Instability</h3>
          <p className="placeholder-note">See the full bibliography at <a href="/TopicBiblios.shtml">legacy page</a>.</p>
          <p className="list-updated"><a href="#top_of_list">Back to top</a></p>
        </section>

        <section className="info-section topic-section" id="HostPatho">
          <h3>Host-Pathogen Interactions</h3>
          <p className="placeholder-note">See the full bibliography at <a href="/TopicBiblios.shtml">legacy page</a>.</p>
          <p className="list-updated"><a href="#top_of_list">Back to top</a></p>
        </section>

        <section className="info-section topic-section" id="HostResponse">
          <h3>Host-Pathogen Interactions: Host Response to <em>C. albicans</em></h3>
          <p className="placeholder-note">See the full bibliography at <a href="/TopicBiblios.shtml">legacy page</a>.</p>
          <p className="list-updated"><a href="#top_of_list">Back to top</a></p>
        </section>

        <section className="info-section topic-section" id="C.albicansResponse">
          <h3>Host-Pathogen Interactions: <em>C. albicans</em> Response to Host</h3>
          <p className="placeholder-note">See the full bibliography at <a href="/TopicBiblios.shtml">legacy page</a>.</p>
          <p className="list-updated"><a href="#top_of_list">Back to top</a></p>
        </section>

        <section className="info-section topic-section" id="Hypoxia">
          <h3>Hypoxia</h3>
          <p className="placeholder-note">See the full bibliography at <a href="/TopicBiblios.shtml">legacy page</a>.</p>
          <p className="list-updated"><a href="#top_of_list">Back to top</a></p>
        </section>

        <section className="info-section topic-section" id="Mating">
          <h3>Mating and the Parasexual Cycle</h3>
          <p className="placeholder-note">See the full bibliography at <a href="/TopicBiblios.shtml">legacy page</a>.</p>
          <p className="list-updated"><a href="#top_of_list">Back to top</a></p>
        </section>

        <section className="info-section topic-section" id="Models">
          <h3>Models of Infection</h3>
          <p className="placeholder-note">See the full bibliography at <a href="/TopicBiblios.shtml">legacy page</a>.</p>
          <p className="list-updated"><a href="#top_of_list">Back to top</a></p>
        </section>

        <section className="info-section topic-section" id="Morphogenesis">
          <h3>Morphogenesis and Polarized Cell Growth</h3>
          <p className="placeholder-note">See the full bibliography at <a href="/TopicBiblios.shtml">legacy page</a>.</p>
          <p className="list-updated"><a href="#top_of_list">Back to top</a></p>
        </section>

        <section className="info-section topic-section" id="Switching">
          <h3>Phenotypic Switching</h3>
          <p className="placeholder-note">See the full bibliography at <a href="/TopicBiblios.shtml">legacy page</a>.</p>
          <p className="list-updated"><a href="#top_of_list">Back to top</a></p>
        </section>

        <section className="info-section topic-section" id="pH">
          <h3>pH Response</h3>
          <p className="placeholder-note">See the full bibliography at <a href="/TopicBiblios.shtml">legacy page</a>.</p>
          <p className="list-updated"><a href="#top_of_list">Back to top</a></p>
        </section>

        <section className="info-section topic-section" id="Quorum">
          <h3>Quorum Sensing</h3>
          <p className="placeholder-note">See the full bibliography at <a href="/TopicBiblios.shtml">legacy page</a>.</p>
          <p className="list-updated"><a href="#top_of_list">Back to top</a></p>
        </section>

        <section className="info-section topic-section" id="Stress">
          <h3>Stress Response and Resistance</h3>
          <p className="placeholder-note">See the full bibliography at <a href="/TopicBiblios.shtml">legacy page</a>.</p>
          <p className="list-updated"><a href="#top_of_list">Back to top</a></p>
        </section>

        <section className="info-section topic-section" id="Tropism">
          <h3>Thigmotropism and Galvanotropism</h3>
          <p className="placeholder-note">See the full bibliography at <a href="/TopicBiblios.shtml">legacy page</a>.</p>
          <p className="list-updated"><a href="#top_of_list">Back to top</a></p>
        </section>

        <section className="info-section topic-section" id="Vacuolar">
          <h3>Vacuolar Dynamics and Inheritance</h3>
          <p className="placeholder-note">See the full bibliography at <a href="/TopicBiblios.shtml">legacy page</a>.</p>
          <p className="list-updated"><a href="#top_of_list">Back to top</a></p>
        </section>

        <hr />

        {/* C. glabrata Topics */}
        <section className="info-section">
          <h2>Selected Topics in <em>Candida glabrata</em> Biology</h2>
        </section>

        <hr />

        <section className="info-section topic-section" id="CgReviews">
          <h3>Reviews about <em>Candida glabrata</em></h3>

          <Citation
            text={`Kaur R, Domergue R, Zupancic ML, Bhattacharjee AK. A yeast by any other name: <em>Candida glabrata</em> and its interaction with the host. Curr Opin Microbiol. 2005 Aug;8(4):378-84.`}
            pmid="15996895"
          />

          <Citation
            text={`Rodrigues CF, Silva S, Henriques M. <em>Candida glabrata</em>: a review of its features and resistance. Eur J Clin Microbiol Infect Dis. 2014 May;33(5):673-88.`}
            pmid="24249283"
          />

          <p className="list-updated"><a href="#top_of_list">Back to top</a></p>
        </section>

        <section className="info-section topic-section" id="CgBiofilm">
          <h3>Biofilm Formation (<em>C. glabrata</em>)</h3>
          <p className="placeholder-note">See the full bibliography at <a href="/TopicBiblios.shtml">legacy page</a>.</p>
          <p className="list-updated"><a href="#top_of_list">Back to top</a></p>
        </section>

        <section className="info-section topic-section" id="CgCellWall">
          <h3>Cell Wall and Adhesins (<em>C. glabrata</em>)</h3>
          <p className="placeholder-note">See the full bibliography at <a href="/TopicBiblios.shtml">legacy page</a>.</p>
          <p className="list-updated"><a href="#top_of_list">Back to top</a></p>
        </section>

        <section className="info-section topic-section" id="CgDrug">
          <h3>Drug Resistance (<em>C. glabrata</em>)</h3>
          <p className="placeholder-note">See the full bibliography at <a href="/TopicBiblios.shtml">legacy page</a>.</p>
          <p className="list-updated"><a href="#top_of_list">Back to top</a></p>
        </section>

        <section className="info-section topic-section" id="CgSilencing">
          <h3>Gene Silencing (<em>C. glabrata</em>)</h3>
          <p className="placeholder-note">See the full bibliography at <a href="/TopicBiblios.shtml">legacy page</a>.</p>
          <p className="list-updated"><a href="#top_of_list">Back to top</a></p>
        </section>

        <section className="info-section topic-section" id="CgMating">
          <h3>Mating Types (<em>C. glabrata</em>)</h3>
          <p className="placeholder-note">See the full bibliography at <a href="/TopicBiblios.shtml">legacy page</a>.</p>
          <p className="list-updated"><a href="#top_of_list">Back to top</a></p>
        </section>

        <section className="info-section topic-section" id="CgSwitching">
          <h3>Phenotypic Switching (<em>C. glabrata</em>)</h3>
          <p className="placeholder-note">See the full bibliography at <a href="/TopicBiblios.shtml">legacy page</a>.</p>
          <p className="list-updated"><a href="#top_of_list">Back to top</a></p>
        </section>

        <section className="info-section topic-section" id="CgVirulence">
          <h3>Virulence and Pathogenesis (<em>C. glabrata</em>)</h3>
          <p className="placeholder-note">See the full bibliography at <a href="/TopicBiblios.shtml">legacy page</a>.</p>
          <p className="list-updated"><a href="#top_of_list">Back to top</a></p>
        </section>

        <hr />

        {/* C. auris Topics */}
        <section className="info-section">
          <h2>Selected Topics in <em>Candida auris</em> Biology</h2>
        </section>

        <hr />

        <section className="info-section topic-section" id="CauReviews">
          <h3>Reviews about <em>Candida auris</em></h3>

          <Citation
            text={`Lockhart SR, Etienne KA, Vallabhaneni S, et al. Simultaneous emergence of multidrug-resistant <em>Candida auris</em> on 3 continents confirmed by whole-genome sequencing and epidemiological analyses. Clin Infect Dis. 2017;64(2):134-140.`}
            pmid="27988485"
          />

          <Citation
            text={`Satoh K, Makimura K, Hasumi Y, Nishiyama Y, Uchida K, Yamaguchi H. <em>Candida auris</em> sp. nov., a novel ascomycetous yeast isolated from the external ear canal of an inpatient in a Japanese hospital. Microbiol Immunol. 2009;53(1):41-44.`}
            pmid="19161556"
          />

          <p className="list-updated"><a href="#top_of_list">Back to top</a></p>
        </section>

        <section className="info-section topic-section" id="CauGenome">
          <h3>Genome Sequence (<em>C. auris</em>)</h3>
          <p className="placeholder-note">See the full bibliography at <a href="/TopicBiblios.shtml">legacy page</a>.</p>
          <p className="list-updated"><a href="#top_of_list">Back to top</a></p>
        </section>
      </div>
    </div>
  );
}

export default TopicBibliosPage;
