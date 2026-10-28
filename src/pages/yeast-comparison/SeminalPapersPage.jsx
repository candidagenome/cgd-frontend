import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';
import './PathogenicYeastComparison.css';

// Converted from the CGD Public Wiki (Seminal Candida Papers).
function SeminalPapersPage() {
  return (
    <div className="info-page pyc-page">
      <div className="info-page-content" id="top">
        <p className="pyc-breadcrumb">
          <Link to="/pathogenic-yeast-comparison">Pathogenic Yeast Comparison</Link>
        </p>
        <h1>Seminal <em>Candida</em> Papers</h1>
        <hr />

        <ul className="pyc-toc">
          <li><a href="#c-albicans"><em>C. albicans</em></a></li>
          <li><a href="#c-glabrata"><em>C. glabrata</em></a></li>
          <li><a href="#c-parapsilosis"><em>C. parapsilosis</em></a></li>
          <li><a href="#c-auris"><em>C. auris</em></a></li>
          <li><a href="#c-dubliniensis"><em>C. dubliniensis</em></a></li>
          <li><a href="#c-tropicalis"><em>C. tropicalis</em></a></li>
        </ul>
        <h2 id="c-albicans"><em>C. albicans</em></h2>
        <h3 id="c-albicans-cell-biology">Cell Biology</h3>
        <h4>AUTOPHAGY</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/17185534/" target="_blank" rel="noopener noreferrer">Palmer GE, Kelly MN, Sturtevant JE</a>. Autophagy in the pathogen <em>Candida albicans</em>. Microbiology. 2007 Jan;153(Pt 1):51-8.
          </li>
        </ul>
        <h4>CELL CYCLE</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/3077140/" target="_blank" rel="noopener noreferrer">Barton R, Gull K</a>. Variation in cytoplasmic microtubule organization and spindle length between the two forms of the dimorphic fungus <em>Candida albicans</em>. J Cell Sci. 1988 Oct;91 ( Pt 2):211-20.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/17055773/" target="_blank" rel="noopener noreferrer">Berman, J</a>. Morphogenesis and cell cycle progression in <em>Candida albicans</em>. 2006 Dec;9(6):595-601. Epub 2006 Oct 20.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/15643064/" target="_blank" rel="noopener noreferrer">Chapa y Lazo B, Bates S, Sudbery P</a>. The G1 cyclin Cln3 regulates morphogenesis in <em>Candida albicans</em>. Eukaryot Cell. 2005 Jan;4(1):90-4.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19477921/" target="_blank" rel="noopener noreferrer">Cote P, Hogues H, Whiteway M</a>. Transcriptional analysis of the <em>Candida albicans</em> cell cycle. Mol Biol Cell. 2009 Jul;20(14):3363-73. Epub 2009 May 28.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/16215177/" target="_blank" rel="noopener noreferrer">Finley KR, Berman J</a>. Microtubules in <em>Candida albicans</em> hyphae drive nuclear dynamics and connect cell cycle progression to morphogenesis. Eukaryot Cell. 2005 Oct;4(10):1697-711.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/17557192/" target="_blank" rel="noopener noreferrer">Singh A, Sharma S, Khuller GK</a>. cAMP regulates vegetative growth and cell cycle in <em>Candida albicans</em>. Mol Cell Biochem. 2007 Oct;304(1-2):331-41. Epub 2007 Jun 8.
          </li>
        </ul>
        <h4>CELL WALL</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/18772287/" target="_blank" rel="noopener noreferrer">Chaffin WL</a>. <em>Candida albicans</em> cell wall proteins. Microbiol Mol Biol Rev. 2008 Sep;72(3):495-544.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/16493703/" target="_blank" rel="noopener noreferrer">Ebanks RO, Chisholm K, McKinnon S, Whiteway M, Pinto DM</a>. Proteomic analysis of <em>Candida albicans</em> yeast and hyphal cell wall and associated proteins. Proteomics. 2006 Apr;6(7):2147-56.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/11800263/" target="_blank" rel="noopener noreferrer">Klis FM, de Groot P, Hellingwerf K</a>. Molecular organization of the cell wall of <em>Candida albicans</em>. Med Mycol. 2001;39 Suppl 1:1-8.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19624749/" target="_blank" rel="noopener noreferrer">Klis FM, Sosinska GJ, de Groot PW, Brul S</a>. Covalently linked cell wall proteins of <em>Candida albicans</em> and their role in fitness and virulence. FEMS Yeast Res. 2009 Oct;9(7):1013-28. Epub 2009 Jun 22.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/16423067/" target="_blank" rel="noopener noreferrer">Ruiz-Herrera J, Elorza MV, Valentin E, Sentandreu R</a>. Molecular organization of the cell wall of <em>Candida albicans</em> and its relation to pathogenicity. FEMS Yeast Res. 2006 Jan;6(1):14-29.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/16611038/" target="_blank" rel="noopener noreferrer">Sohn K, Schwenk J, Urban C, Lechner J, Schweikert M, Rupp S</a>. Getting in touch with <em>Candida albicans</em>: the cell wall of a fungal pathogen. Curr Drug Targets. 2006 Apr;7(4):505-12.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/12174081/" target="_blank" rel="noopener noreferrer">Sundstrom P</a>. Adhesion in <em>Candida</em> spp. Cell Microbiol. 2002 Aug;4(8):461-9.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/22609181/" target="_blank" rel="noopener noreferrer">Gow NA, Hube B</a>. Importance of the <em>Candida albicans</em> cell wall during commensalism and infection. Curr Opin Microbiol. 2012 Aug;15(4):406-12.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/28513415/" target="_blank" rel="noopener noreferrer">Gow NAR, Latge JP, Munro CA</a>. The fungal cell wall: structure, biosynthesis, and function. Microbiol Spectr. 2017 May;5(3)
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/36266346/" target="_blank" rel="noopener noreferrer">Gow NAR, Lenardon MD</a>. Architecture of the dynamic fungal cell wall. Nat Rev Microbiol. 2023 Apr;21(4):248-259.
          </li>
        </ul>
        <h4>CO2 SENSING</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/16303555/" target="_blank" rel="noopener noreferrer">Mitchell AP</a>. Fungal CO2 sensing: a breath of fresh air. Curr Biol. 2005 Nov 22;15(22):R934-6.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/2162728/" target="_blank" rel="noopener noreferrer">Mock RC, Pollack JH, Hashimoto T</a>. Carbon dioxide induces endotrophic germ tube formation in <em>Candida albicans</em>. Can J Microbiol. 1990 Apr;36(4):249-53.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/3095550/" target="_blank" rel="noopener noreferrer">Sims W</a>. Effect of carbon dioxide on the growth and form of <em>Candida albicans</em>. J Med Microbiol. 1986 Nov;22(3):203-8.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/3106612/" target="_blank" rel="noopener noreferrer">Webster CE, Odds FC</a>. Growth of pathogenic <em>Candida</em> isolates anaerobically and under elevated concentrations of CO2 in air. J Med Vet Mycol. 1987 Feb;25(1):47-53. Erratum in: J Med Vet Mycol 1988 Feb;26(1):75.
          </li>
        </ul>
        <h4>GENETIC INSTABILITY</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/15720560/" target="_blank" rel="noopener noreferrer">Selmecki A, Bergmann S, Berman J</a>. Comparative genome hybridization reveals widespread aneuploidy in <em>Candida albicans</em> laboratory strains. Mol Microbiol. 2005 Mar;55(5):1553-65.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19876375/" target="_blank" rel="noopener noreferrer">Selmecki AM, Dulmage K, Cowen LE, Anderson JB, Berman J</a>. Acquisition of aneuploidy provides increased fitness during the evolution of antifungal drug resistance. PLoS Genet. 2009 Oct;5(10):e1000705. Epub 2009 Oct 30.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/15654090/" target="_blank" rel="noopener noreferrer">Wu W, Pujol C, Lockhart SR, Soll DR</a>. Chromosome loss followed by duplication is the major mechanism of spontaneous mating-type locus homozygosis in <em>Candida albicans</em>. Genetics. 2005 Mar;169(3):1311-27. Epub 2005 Jan 16.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/26945893/" target="_blank" rel="noopener noreferrer">Berman J</a>. Ploidy plasticity: a rapid and reversible strategy for adaptation to stress. FEMS Yeast Res. 2016 May;16(3):fow020.
          </li>
        </ul>
        <h4>VACUOLAR DYNAMICS AND INHERITANCE</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/6757383/" target="_blank" rel="noopener noreferrer">Gow NA, Gooday GW</a>. Growth kinetics and morphology of colonies of the filamentous form of <em>Candida albicans</em>. J Gen Microbiol. 1982 Sep;128(9):2187-94.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/6374934/" target="_blank" rel="noopener noreferrer">Gow NA, Gooday GW</a>. A model for the germ tube formation and mycelial growth form of <em>Candida albicans</em>. Sabouraudia. 1984;22(2):137-44.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/12796285/" target="_blank" rel="noopener noreferrer">Barelle CJ, Bohula EA, Kron SJ, Wessels D, Soll DR, Schafer A, Brown AJ, Gow NA</a>. Asynchronous cell cycle and asymmetric vacuolar inheritance in true hyphae of <em>Candida albicans</em>. Eukaryot Cell. 2003 Jun;2(3):398-410.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19054134/" target="_blank" rel="noopener noreferrer">Veses V, Gow NA</a>. Vacuolar dynamics during the morphogenetic transition in <em>Candida albicans</em>. FEMS Yeast Res. 2008 Dec;8(8):1339-48.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19040629/" target="_blank" rel="noopener noreferrer">Veses V, Richards A, Gow NA</a>. Vacuole inheritance regulates cell size and branching frequency of <em>Candida albicans</em> hyphae. Mol Microbiol. 2009 Jan;71(2):505-19.
          </li>
        </ul>
        <h4>DRUG RESISTANCE MECHANISMS</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19897505/" target="_blank" rel="noopener noreferrer">Arana DM, Nombela C, Pla J</a>. Fluconazole at subinhibitory concentrations induces the oxidative- and nitrosative-responsive genes <em>TRR1</em>, <em>GRE2</em>  and <em>YHB1</em>, and enhances the resistance of <em>Candida albicans</em> to phagocytes. J Antimicrob Chemother. 2010 Jan;65(1):54-62.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/17693596/" target="_blank" rel="noopener noreferrer">Coste A, Selmecki A, Forche A, Diogo D, Bougnoux ME, d'Enfert C, Berman J, Sanglard D</a>. Genotypic evolution of azole resistance mechanisms in sequential <em>Candida albicans</em> isolates. Eukaryot Cell. 2007 Oct;6(10):1889-904.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/18375617/" target="_blank" rel="noopener noreferrer">Cowen LE, Steinbach WJ</a>. Stress, drugs, and evolution: the role of cellular signaling in fungal drug resistance. Eukaryot Cell. 2008 May;7(5):747-64.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19910410/" target="_blank" rel="noopener noreferrer">Manoharlal R, Gorantala J, Sharma M, Sanglard D, Prasad R</a>. PAP1 [poly(A) polymerase 1] homozygosity and hyperadenylation are major determinants of increased mRNA stability of <em>CDR1</em> in azole-resistant clinical isolates of <em>Candida albicans</em>. Microbiology. 2010 Feb;156(Pt 2):313-26.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19665571/" target="_blank" rel="noopener noreferrer">Morschhauser J</a>. Regulation of multidrug resistance in pathogenic fungi. Fungal Genet Biol. 2010 Feb;47(2):94-106.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19799637/" target="_blank" rel="noopener noreferrer">Odds FC</a>. In <em>Candida albicans</em>, resistance to flucytosine and terbinafine is linked to MAT locus homozygosity and multilocus sequence typing clade 1. FEMS Yeast Res. 2009 Oct;9(7):1091-101.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19400764/" target="_blank" rel="noopener noreferrer">Peman J, Canton E, Espinel-Ingroff A</a>. Antifungal drug resistance mechanisms. Expert Rev Anti Infect Ther. 2009 May;7(4):453-60.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/11932451/" target="_blank" rel="noopener noreferrer">Rustad TR, Stevens DA, Pfaller MA, White TC</a>. Homozygosity at the <em>Candida albicans</em> MTL locus associated with azole resistance. Microbiology. 2002 Apr;148(Pt 4):1061-72.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19799636/" target="_blank" rel="noopener noreferrer">Sanglard D, Coste A, Ferrari S</a>. Antifungal drug resistance mechanisms in fungal pathogens from the perspective of transcriptional gene regulation. FEMS Yeast Res. 2009 Oct;9(7):1029-50.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19876375/" target="_blank" rel="noopener noreferrer">Selmecki AM, Dulmage K, Cowen LE, Anderson JB, Berman J</a>. Acquisition of aneuploidy provides increased fitness during the evolution of antifungal drug resistance. PLoS Genet. 2009 Oct;5(10):e1000705.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/31603213/" target="_blank" rel="noopener noreferrer">Nishimoto AT, Sharma C, Rogers PD</a>. Molecular and genetic basis of azole antifungal resistance in the opportunistic pathogenic fungus <em>Candida albicans</em>. J Antimicrob Chemother. 2020 Feb 1;75(2):257-270.
          </li>
        </ul>
        <h3 id="c-albicans-transformation-response">Transformation/Response</h3>
        <h4>BIOFILMS</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19956771/" target="_blank" rel="noopener noreferrer">Dongari-Bagtzoglou A, Kashleva H, Dwivedi P, Diaz P, Vasilakos J</a>. Characterization of mucosal <em>Candida albicans</em> biofilms. PLoS One. 2009 Nov 24;4(11):e7967.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19837954/" target="_blank" rel="noopener noreferrer">Ene IV, Bennett RJ</a>. Hwp1 and related adhesins contribute to both mating and biofilm formation in <em>Candida albicans</em>. Eukaryot Cell. 2009 Dec;8(12):1909-13. Epub 2009 Oct 16
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/16153165/" target="_blank" rel="noopener noreferrer">Kumamoto CA, Vinces MD</a>. Alternative <em>Candida albicans</em> lifestyles: growth on surfaces. Annu Rev Microbiol. 2005;59:113-33.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/16151249/" target="_blank" rel="noopener noreferrer">Murillo LA, Newport G, Lan CY, Habelitz S, Dungan J, Agabian NM</a>. Genome-wide transcription profiling of the early phase of biofilm formation by <em>Candida albicans</em>. Eukaryot Cell. 2005 Sep;4(9):1562-73.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/18635358/" target="_blank" rel="noopener noreferrer">Nobile CJ, Schneider HA, Nett JE, Sheppard DC, Filler SG, Andes DR, Mitchell AP</a>. Complementary adhesin function in <em>C. albicans</em> biofilm formation. Curr Biol. 2008 Jul 22;18(14):1017-24.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/17001605/" target="_blank" rel="noopener noreferrer">Thomas DP, Bachmann SP, Lopez-Ribot JL</a>. Proteomics for the analysis of the <em>Candida albicans</em> biofilm lifestyle. Proteomics. 2006 Nov;6(21):5795-804.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19278980/" target="_blank" rel="noopener noreferrer">ten Cate JM, Klis FM, Pereira-Cenci T, Crielaard W, de Groot PW</a>. Molecular and cellular mechanisms that lead to <em>Candida</em> biofilm formation. J Dent Res. 2009 Feb;88(2):105-15.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/27250770/" target="_blank" rel="noopener noreferrer">Soll DR, Daniels KJ</a>. Plasticity of <em>Candida albicans</em> Biofilms. Microbiol Mol Biol Rev. 2016 Jun 1;80(3):565-95.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/16848788/" target="_blank" rel="noopener noreferrer">Nobile CJ, Mitchell AP</a>. Genetics and genomics of <em>Candida albicans</em> biofilm formation. Cell Microbiol. 2006 Sep;8(9):1382-91.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/26806384/" target="_blank" rel="noopener noreferrer">Gulati M, Nobile CJ</a>. <em>Candida albicans</em> biofilms: development, regulation, and molecular mechanisms. Microbes Infect. 2016 May;18(5):310-21.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/29062072/" target="_blank" rel="noopener noreferrer">Lohse MB, Gulati M, Johnson AD, Nobile CJ</a>. Development and regulation of single- and multi-species <em>Candida albicans</em> biofilms. Nat Rev Microbiol. 2018 Jan;16(1):19-31.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/26488273/" target="_blank" rel="noopener noreferrer">Nobile CJ, Johnson AD</a>. <em>Candida albicans</em> biofilms and human disease. Annu Rev Microbiol. 2015;69:71-92.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/31952361/" target="_blank" rel="noopener noreferrer">Perry AM, Hernday AD, Nobile CJ</a>. Unraveling How <em>Candida albicans</em> Forms Sexual Biofilms. J Fungi (Basel). 2020 Jan 15;6(1):14.
          </li>
        </ul>
        <h4>CHLAMYDOSPORE DEVELOPMENT</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/12627804/" target="_blank" rel="noopener noreferrer">Fabry W, Schmid EN, Schraps M, Ansorg R</a>. Isolation and purification of chlamydospores of <em>Candida albicans</em>. Med Mycol. 2003 Feb;41(1):53-8.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/4099099/" target="_blank" rel="noopener noreferrer">Jansons VK, Nickerson WJ</a>. Chemical composition of chlamydospores of <em>Candida albicans</em>. J Bacteriol. 1970 Nov;104(2):922-32.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/16002645/" target="_blank" rel="noopener noreferrer">Martin SW, Douglas LM, Konopka JB</a>. Cell cycle dynamics and quorum sensing in <em>Candida albicans</em> chlamydospores are distinct from budding and hyphal growth. Eukaryot Cell. 2005 Jul;4(7):1191-202.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/14663094/" target="_blank" rel="noopener noreferrer">Nobile CJ, Bruno VM, Richard ML, Davis DA, Mitchell AP</a>. Genetic control of chlamydospore formation in <em>Candida albicans</em>. Microbiology. 2003 Dec;149(Pt 12):3629-37.
          </li>
        </ul>
        <h4>HYPOXIA</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19016786/" target="_blank" rel="noopener noreferrer">Ernst JF, Tielker D</a>. Responses to hypoxia in fungal pathogens. Cell Microbiol. 2009 Feb;11(2):183-90.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/16998073/" target="_blank" rel="noopener noreferrer">Mulhern SM, Logue ME, Butler G</a>. <em>Candida albicans</em> transcription factor Ace2 regulates metabolism and is required for filamentation in hypoxic conditions. Eukaryot Cell. 2006 Dec;5(12):2001-13.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/16854431/" target="_blank" rel="noopener noreferrer">Setiadi ER, Doedt T, Cottier F, Noffz C, Ernst JF</a>. Transcriptional response of <em>Candida albicans</em> to hypoxia: linkage of oxygen sensing and Efg1p-regulatory networks. J Mol Biol. 2006 Aug 18;361(3):399-411.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19346360/" target="_blank" rel="noopener noreferrer">Stichternoth C, Ernst JF</a>. Hypoxic adaptation by Efg1 regulates biofilm formation by <em>Candida albicans</em>. Appl Environ Microbiol. 2009 Jun;75(11):3663-72.
          </li>
        </ul>
        <h4>MATING AND THE PARASEXUAL CYCLE</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/10455055/" target="_blank" rel="noopener noreferrer">Hull CM, Johnson AD</a>. Identification of a mating type-like locus in the asexual pathogenic yeast <em>Candida albicans</em>. Science. 1999 Aug 20;285(5431):1271-5.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/10894780/" target="_blank" rel="noopener noreferrer">Hull CM, Raisner RM, Johnson AD</a>. Evidence for mating of the "asexual" yeast <em>Candida albicans</em> in a mammalian host. Science. 2000 Jul 14;289(5477):307-10.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/10894781/" target="_blank" rel="noopener noreferrer">Magee BB, Magee PT</a>. Induction of mating in <em>Candida albicans</em> by construction of <em>MTLa</em> and <em>MTLalpha</em> strains. Science. 2000 Jul 14;289(5477):310-3.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/12399384/" target="_blank" rel="noopener noreferrer">Lockhart SR, Pujol C, Daniels KJ, Miller MG, Johnson AD, Pfaller MA, Soll DR</a>. In <em>Candida albicans</em>, white-opaque switchers are homozygous for mating type. Genetics. 2002 Oct;162(2):737-45.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19675652/" target="_blank" rel="noopener noreferrer">Alby K, Schaefer D, Bennett RJ</a>. Homothallic and heterothallic mating in the opportunistic pathogen <em>Candida albicans</em>. Nature. 2009 Aug 13;460(7257):890-3.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/12743044/" target="_blank" rel="noopener noreferrer">Bennett RJ, Johnson AD</a>. Completion of a parasexual cycle in <em>Candida albicans</em> by induced chromosome loss in tetraploid strains. EMBO J. 2003 May 15;22(10):2505-15.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/14585977/" target="_blank" rel="noopener noreferrer">Bennett RJ, Uhl MA, Miller MG, Johnson AD</a>. Identification and characterization of a <em>Candida albicans</em> mating pheromone. Mol Cell Biol. 2003 Nov;23(22):8189-201.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/18346117/" target="_blank" rel="noopener noreferrer">Cote P, Whiteway M</a>. The role of <em>Candida albicans</em> <em>FAR1</em> in regulation of pheromone-mediated mating, gene expression and cell cycle arrest. Mol Microbiol. 2008 Apr;68(2):392-404.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/14565982/" target="_blank" rel="noopener noreferrer">Daniels KJ, Lockhart SR, Staab JF, Sundstrom P, Soll DR</a>. The adhesin Hwp1 and the first daughter cell localize to the a/a portion of the conjugation bridge during <em>Candida albicans</em> mating. Mol Biol Cell. 2003 Dec;14(12):4920-30.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19837954/" target="_blank" rel="noopener noreferrer">Ene IV, Bennett RJ</a>. Hwp1 and related adhesins contribute to both mating and biofilm formation in <em>Candida albicans</em>. Eukaryot Cell. 2009 Dec;8(12):1909-13.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/18462019/" target="_blank" rel="noopener noreferrer">Forche A, Alby K, Schaefer D, Johnson AD, Berman J, Bennett RJ</a>. The parasexual cycle in <em>Candida albicans</em> provides an alternative pathway to meiosis for the formation of recombinant strains. PLoS Biol. 2008 May 6;6(5):e110.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/16239535/" target="_blank" rel="noopener noreferrer">Ibrahim AS, Magee BB, Sheppard DC, Yang M, Kauffman S, Becker J, Edwards JE Jr, Magee PT</a>. Effects of ploidy and mating type on virulence of <em>Candida albicans</em>. Infect Immun. 2005 Nov;73(11):7366-74.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/12582122/" target="_blank" rel="noopener noreferrer">Lockhart SR, Daniels KJ, Zhao R, Wessels D, Soll DR</a>. Cell biology of mating in <em>Candida albicans</em>. Eukaryot Cell. 2003 Feb;2(1):49-61.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/15695357/" target="_blank" rel="noopener noreferrer">Lockhart SR, Wu W, Radke JB, Zhao R, Soll DR</a>. Increased virulence and competitive advantage of <em>a/alpha</em> over <em>a/a</em> or <em>alpha/alpha</em> offspring conserves the mating system of <em>Candida albicans</em>. Genetics. 2005 Apr;169(4):1883-90.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/14555467/" target="_blank" rel="noopener noreferrer">Lockhart SR, Zhao R, Daniels KJ, Soll DR</a>. Alpha-pheromone-induced "shmooing" and gene regulation require white-opaque switching during <em>Candida albicans</em> mating. Eukaryot Cell. 2003 Oct;2(5):847-55.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19892588/" target="_blank" rel="noopener noreferrer">Sherwood RK, Bennett RJ</a>. Fungal meiosis and parasexual reproduction--lessons from pathogenic yeast. Curr Opin Microbiol. 2009 Dec;12(6):599-607.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/12796284/" target="_blank" rel="noopener noreferrer">Soll DR, Lockhart SR, Zhao R</a>. Relationship between switching and mating in <em>Candida albicans</em>. Eukaryot Cell. 2003 Jun;2(3):390-7.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/15654090/" target="_blank" rel="noopener noreferrer">Wu W, Pujol C, Lockhart SR, Soll DR</a>. Chromosome loss followed by duplication is the major mechanism of spontaneous mating-type locus homozygosis in <em>Candida albicans</em>. Genetics. 2005 Mar;169(3):1311-27.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/15910278/" target="_blank" rel="noopener noreferrer">Bennett RJ, Johnson AD</a>. Mating in <em>Candida albicans</em> and the search for a sexual cycle. Annu Rev Microbiol. 2005;59:233-55.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/28657889/" target="_blank" rel="noopener noreferrer">Wolfe KH, Butler G</a>. Evolution of Mating in the Saccharomycotina. Annu Rev Microbiol. 2017 Sep 8;71:197-214.
          </li>
        </ul>
        <h4>MORPHOGENESIS AND POLARIZED CELL GROWTH</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/6757383/" target="_blank" rel="noopener noreferrer">Gow NA, Gooday GW</a>. Growth kinetics and morphology of colonies of the filamentous form of <em>Candida albicans</em>. J Gen Microbiol. 1982 Sep;128(9):2187-94.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/6757384/" target="_blank" rel="noopener noreferrer">Gow NA, Gooday GW</a>. Vacuolation, branch production and linear growth of germ tubes in <em>Candida albicans</em>. J Gen Microbiol. 1982 Sep;128(9):2195-8.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/3319423/" target="_blank" rel="noopener noreferrer">Gow NA, Gooday GW</a>. Cytological aspects of dimorphism in <em>Candida albicans</em>. Crit Rev Microbiol. 1987;15(1):73-8.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/9504066/" target="_blank" rel="noopener noreferrer">Gow NA</a>. Germ tube growth of <em>Candida albicans</em>. Curr Top Med Mycol. 1997 Dec;8(1-2):43-55.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/17055773/" target="_blank" rel="noopener noreferrer">Berman, J</a>. Morphogenesis and cell cycle progression in <em>Candida albicans</em>. 2006 Dec;9(6):595-601.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/17765684/" target="_blank" rel="noopener noreferrer">Sinha I, Wang YM, Philp R, Li CR, Yap WH, Wang Y</a>. Cyclin-dependent kinases control septin phosphorylation in <em>Candida albicans</em> hyphal development. Dev Cell. 2007 Sep;13(3):421-32.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19054134/" target="_blank" rel="noopener noreferrer">Veses V, Gow NA</a>. Vacuolar dynamics during the morphogenetic transition in <em>Candida albicans</em>. FEMS Yeast Res. 2008 Dec;8(8):1339-48.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19040629/" target="_blank" rel="noopener noreferrer">Veses V, Richards A, Gow NA</a>. Vacuole inheritance regulates cell size and branching frequency of <em>Candida albicans</em> hyphae. Mol Microbiol. 2009 Jan;71(2):505-19.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19837628/" target="_blank" rel="noopener noreferrer">Wang Y</a>. CDKs and the yeast-hyphal decision. Curr Opin Microbiol. 2009 Dec;12(6):644-9.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/17506678/" target="_blank" rel="noopener noreferrer">Whiteway M, Bachewich C</a>. Morphogenesis in <em>Candida albicans</em>. Annu Rev Microbiol. 2007;61:529-53.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/32784532/" target="_blank" rel="noopener noreferrer">Du H, Ennis CL, Hernday AD, Nobile CJ, Huang G</a>. N-Acetylglucosamine (GlcNAc) Sensing, Utilization, and Functions in <em>Candida albicans</em>. J Fungi (Basel). 2020 Aug 7;6(3):129.
          </li>
        </ul>
        <h4>WHITE-OPAQUE SWITCHING</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/2643570/" target="_blank" rel="noopener noreferrer">Anderson J, Cundiff L, Schnars B, Gao MX, Mackenzie I, Soll DR</a>. Hypha formation in the white-opaque transition of <em>Candida albicans</em>. Infect Immun. 1989 Feb;57(2):458-67.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/2403540/" target="_blank" rel="noopener noreferrer">Anderson J, Mihalik R, Soll DR</a>. Ultrastructure and antigenicity of the unique cell wall pimple of the <em>Candida </em> opaque phenotype. J Bacteriol. 1990 Jan;172(1):224-35.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/1576587/" target="_blank" rel="noopener noreferrer">Soll DR</a>. High-frequency switching in <em>Candida albicans</em>. Clin Microbiol Rev. 1992 Apr;5(2):183-203.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/8456504/" target="_blank" rel="noopener noreferrer">Soll DR, Morrow B, Srikantha T</a>. High-frequency phenotypic switching in <em>Candida albicans</em>. Trends Genet. 1993 Feb;9(2):61-5.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/12796284/" target="_blank" rel="noopener noreferrer">Soll DR, Lockhart SR, Zhao R</a>. Relationship between switching and mating in <em>Candida albicans</em>. Eukaryot Cell. 2003 Jun;2(3):390-7.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19853498/" target="_blank" rel="noopener noreferrer">Lohse MB, Johnson AD</a>. White-opaque switching in <em>Candida albicans</em>. Curr Opin Microbiol. 2009 Dec;12(6):650-4.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19458191/" target="_blank" rel="noopener noreferrer">Alby K, Bennett RJ</a>. Stress-induced phenotypic switching in <em>Candida albicans</em>. Mol Biol Cell. 2009 Jul;20(14):3178-91.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/16628217/" target="_blank" rel="noopener noreferrer">Daniels KJ, Srikantha T, Lockhart SR, Pujol C, Soll DR</a>. Opaque cells signal white cells to form biofilms in <em>Candida albicans</em>. EMBO J. 2006 May 17;25(10):2240-52.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/16905649/" target="_blank" rel="noopener noreferrer">Huang G, Wang H, Chou S, Nie X, Chen J, Liu H</a>. Bistable expression of <em>WOR1</em>, a master regulator of white-opaque switching in <em>Candida albicans</em>. Proc Natl Acad Sci U S A. 2006 Aug 22;103(34):12813-8.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/20300604/" target="_blank" rel="noopener noreferrer">Huang G, Yi S, Sahni N, Daniels KJ, Srikantha T, Soll DR</a>. N-acetylglucosamine induces white to opaque switching, a mating prerequisite in <em>Candida albicans</em>. PLoS Pathog. 2010 Mar 12;6(3):e1000806.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19744246/" target="_blank" rel="noopener noreferrer">Soll DR</a>. Why does <em>Candida albicans</em> switch? FEMS Yeast Res. 2009 Oct;9(7):973-89.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/16950924/" target="_blank" rel="noopener noreferrer">Srikantha T, Borneman AR, Daniels KJ, Pujol C, Wu W, Seringhaus MR, Gerstein M, Yi S, Snyder M, Soll DR</a>. <em>TOS9</em> regulates white-opaque switching in <em>Candida albicans</em>. Eukaryot Cell. 2006 Oct;5(10):1674-87.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/16899543/" target="_blank" rel="noopener noreferrer">Zordan RE, Galgoczy DJ, Johnson AD</a>. Epigenetic properties of white-opaque switching in <em>Candida albicans</em> are based on a self-sustaining transcriptional feedback loop. Proc Natl Acad Sci U S A. 2006 Aug 22;103(34):12807-12.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/17880264/" target="_blank" rel="noopener noreferrer">Zordan RE, Miller MG, Galgoczy DJ, Tuch BB, Johnson AD</a>. Interlocking transcriptional feedback loops control white-opaque switching in <em>Candida albicans</em>. PLoS Biol. 2007 Oct;5(10):e256.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/38546228/" target="_blank" rel="noopener noreferrer">Soll DR</a>. White-opaque switching in <em>Candida albicans</em>: cell biology, regulation, and function. Microbiol Mol Biol Rev. 2024 Jun 27;88(2):e0004322. doi: 10.1128/mmbr.00043-22.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/32784532/" target="_blank" rel="noopener noreferrer">Du H, Ennis CL, Hernday AD, Nobile CJ, Huang G</a>. N-Acetylglucosamine (GlcNAc) Sensing, Utilization, and Functions in <em>Candida albicans</em>. J Fungi (Basel). 2020 Aug 7;6(3):129.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/33435404/" target="_blank" rel="noopener noreferrer">Qasim MN, Valle Arevalo A, Nobile CJ, Hernday AD</a>. The roles of chromatin accessibility in regulating the <em>Candida albicans</em> white-opaque phenotypic switch. J Fungi (Basel). 2021 Jan 9;7(1):37.
          </li>
        </ul>
        <h4>PH RESPONSE</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/15554973/" target="_blank" rel="noopener noreferrer">Bensen ES, Martin SJ, Li M, Berman J, Davis DA</a>. Transcriptional profiling in <em>Candida albicans</em> reveals new adaptive responses to extracellular pH and functions for Rim101p. Mol Microbiol. 2004 Dec;54(5):1335-51.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19632143/" target="_blank" rel="noopener noreferrer">Davis DA</a>. How human pathogenic fungi sense and adapt to pH: the link to virulence. Curr Opin Microbiol. 2009 Aug;12(4):365-70.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/12819929/" target="_blank" rel="noopener noreferrer">Davis D</a>. Adaptation to environmental pH in <em>Candida albicans</em> and its relation to pathogenesis. Curr Genet. 2003 Oct;44(1):1-7. Erratum in: Curr Genet. 2003 Oct;44(1):58.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/10629054/" target="_blank" rel="noopener noreferrer">Davis D, Wilson RB, Mitchell AP</a>. <em>RIM101</em>-dependent and-independent pathways govern pH responses in <em>Candida albicans</em>. Mol Cell Biol. 2000 Feb;20(3):971-8.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/17927701/" target="_blank" rel="noopener noreferrer">Kullas AL, Martin SJ, Davis D</a>. Adaptation to environmental pH: integrating the Rim101 and calcineurin signal transduction pathways. Mol Microbiol. 2007 Nov;66(4):858-71.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/12912891/" target="_blank" rel="noopener noreferrer">Ramon AM, Fonzi WA</a>. Diverged binding specificity of Rim101p, the <em>Candida albicans</em> ortholog of PacC. Eukaryot Cell. 2003 Aug;2(4):718-28.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/10601210/" target="_blank" rel="noopener noreferrer">Ramon AM, Porta A, Fonzi WA</a>. Effect of environmental pH on morphological development of <em>Candida albicans</em> is mediated via the PacC-related transcription factor encoded by PRR2. J Bacteriol. 1999 Dec;181(24):7524-30.
          </li>
        </ul>
        <h4>QUORUM SENSING</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/18983434/" target="_blank" rel="noopener noreferrer">Kruppa M</a>. Quorum sensing and <em>Candida albicans</em>. Mycoses. 2009 Jan;52(1):1-10.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19995193/" target="_blank" rel="noopener noreferrer">Langford ML, Atkin AL, Nickerson KW</a>. Cellular interactions of farnesol, a quorum-sensing molecule produced by <em>Candida albicans</em>. Future Microbiol. 2009 Dec;4:1353-62.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19656200/" target="_blank" rel="noopener noreferrer">Roman E, Alonso-Monge R, Gong Q, Li D, Calderone R, Pla J</a>. The Cek1 MAPK is a short-lived protein regulated by quorum sensing in the fungal pathogen <em>Candida albicans</em>. FEMS Yeast Res. 2009 Sep;9(6):942-55.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19933803/" target="_blank" rel="noopener noreferrer">Langford ML, Hasim S, Nickerson KW, Atkin AL</a>. Activity and toxicity of farnesol towards <em>Candida albicans</em> are dependent on growth conditions. Antimicrob Agents Chemother. 2010 Feb;54(2):940-2.
          </li>
        </ul>
        <h4>STRESS RESPONSES</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19220347/" target="_blank" rel="noopener noreferrer">Alonso-Monge R, Roman E, Arana DM, Pla J</a>, Nombela C. Fungi sensing environmental stress. Clin Microbiol Infect. 2009 Jan;15 Suppl 1:17-9.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19897505/" target="_blank" rel="noopener noreferrer">Arana DM, Nombela C, Pla J</a>. Fluconazole at subinhibitory concentrations induces the oxidative- and nitrosative-responsive genes <em>TRR1</em>, <em>GRE2</em>  and <em>YHB1</em>, and enhances the resistance of <em>Candida albicans</em> to phagocytes. J Antimicrob Chemother. 2010 Jan;65(1):54-62.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/20118211/" target="_blank" rel="noopener noreferrer">Deveau A, Piispanen AE, Jackson AA, Hogan DA</a>. Farnesol induces hydrogen peroxide resistance in <em>Candida albicans</em> yeast by inhibiting the Ras-cyclic AMP signaling pathway. Eukaryot Cell. 2010 Apr;9(4):569-77.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19755168/" target="_blank" rel="noopener noreferrer">Reedy JL, Filler SG, Heitman J</a>. Elucidating the <em>Candida albicans</em> calcineurin signaling cascade controlling stress response and virulence. Fungal Genet Biol. 2010 Feb;47(2):107-16.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19759180/" target="_blank" rel="noopener noreferrer">Rodaki A, Bohovych IM, Enjalbert B, Young T, Odds FC, Gow NA, Brown AJ</a>. Glucose promotes stress resistance in the fungal pathogen <em>Candida albicans</em>. Mol Biol Cell. 2009 Nov;20(22):4845-55.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/26945893/" target="_blank" rel="noopener noreferrer">Berman J</a>. Ploidy plasticity: a rapid and reversible strategy for adaptation to stress. FEMS Yeast Res. 2016 May;16(3):fow020.
          </li>
        </ul>
        <h4>THIGMOTROPISM, GALVANOTROPISM AND CONTACT-SENSING</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/1287165/" target="_blank" rel="noopener noreferrer">Sherwood J, Gow NA, Gooday GW, Gregory DW, Marshall D</a>. Contact sensing in <em>Candida albicans</em>: a possible aid to epithelial penetration. J Med Vet Mycol. 1992;30(6):461-9.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/7747168/" target="_blank" rel="noopener noreferrer">Gow NA, Perera TH, Sherwood-Higham J, Gooday GW, Gregory DW, Marshall D</a>. Investigation of touch-sensitive responses by hyphae of the human pathogenic fungus <em>Candida albicans</em>. Scanning Microsc. 1994;8(3):705-10.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/9504066/" target="_blank" rel="noopener noreferrer">Gow NA</a>. Germ tube growth of <em>Candida albicans</em>. Curr Top Med Mycol. 1997 Dec;8(1-2):43-55.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19154328/" target="_blank" rel="noopener noreferrer">Brand A, Lee K, Veses V, Gow NA</a>. Calcium homeostasis is required for contact-dependent helical and sinusoidal tip growth in <em>Candida albicans</em> hyphae. Mol Microbiol. 2009 Mar;71(5):1155-64.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/18281602/" target="_blank" rel="noopener noreferrer">Brand A, Vacharaksa A, Bendel C, Norton J, Haynes P, Henry-Stanley M, Wells C, Ross K, Gow NA, Gale CA</a>. An internal polarity landmark is important for externally induced hyphal behaviors in <em>Candida albicans</em>. Eukaryot Cell. 2008 Apr;7(4):712-20.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/9534238/" target="_blank" rel="noopener noreferrer">Watts HJ, Very AA, Perera TH, Davies JM, Gow NA</a>. Thigmotropism and stretch-activated channels in the pathogenic fungus <em>Candida albicans</em>. Microbiology. 1998 Mar;144 ( Pt 3):689-95.
          </li>
        </ul>
        <h3 id="c-albicans-virulence">Virulence</h3>
        <h4>HOST-PATHOGEN INTERACTIONS</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/6327882/" target="_blank" rel="noopener noreferrer">Cockayne A, Odds FC</a>. Interactions of <em>Candida albicans</em> yeast cells, germ tubes and hyphae with human polymorphonuclear leucocytes in vitro. J Gen Microbiol. 1984 Mar;130(3):465-71.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/16837237/" target="_blank" rel="noopener noreferrer">Filler SG</a>. <em>Candida</em>-host cell receptor-ligand interactions. Curr Opin Microbiol. 2006 Aug;9(4):333-9. Epub 2006 Jul 11.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/15729357/" target="_blank" rel="noopener noreferrer">Gantner BN, Simmons RM, Underhill DM</a>. Dectin-1 mediates macrophage recognition of <em>Candida albicans</em> yeast but not filaments. EMBO J. 2005 Mar 23;24(6):1277-86. Epub 2005 Feb 24.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19880183/" target="_blank" rel="noopener noreferrer">Gropp K, Schild L, Schindler S, Hube B, Zipfel PF, Skerka C</a>. The yeast <em>Candida albicans</em> evades human complement attack by secretion of aspartic proteases. Mol Immunol. 2009 Dec;47(2-3):465-75. Epub 2009 Oct 31.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/12455685/" target="_blank" rel="noopener noreferrer">Lorenz MC, Fink GR</a>. Life and death in a macrophage: role of the glyoxylate cycle in virulence. Eukaryot Cell. 2002 Oct;1(5):657-62.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/20123707/" target="_blank" rel="noopener noreferrer">McKenzie CG, Koser U, Lewis LE, Bain JM, Mora-Montes HM, Barker RN, Gow NA, Erwig LP</a>. Contribution of <em>Candida albicans</em> cell wall components to recognition by and escape from murine macrophages. Infect Immun. 2010 Apr;78(4):1650-8. Epub 2010 Feb 1.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/20361054/" target="_blank" rel="noopener noreferrer">Mochon AB, Ye J, Kayala MA, Wingard JR, Clancy CJ, Nguyen MH, Felgner P, Baldi P, Liu H</a>. Serological profiling of a <em>Candida albicans</em> protein microarray reveals permanent host-pathogen interplay and stage-specific responses during candidemia. PLoS Pathog. 2010 Mar 26;6(3):e1000827.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/20164191/" target="_blank" rel="noopener noreferrer">Mora-Montes HM, Bates S, Netea MG, Castillo L, Brand A, Buurman ET, Diaz-Jimenez DF, Jan Kullberg B, Brown AJ, Odds FC, Gow NA</a>. A multifunctional mannosyltransferase family in <em>Candida albicans</em> determines cell wall mannan structure and host-fungus interactions. J Biol Chem. 2010 Apr 16;285(16):12087-95. Epub 2010 Feb 17.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/17661651/" target="_blank" rel="noopener noreferrer">Rupp S</a>. Interactions of the fungal pathogen <em>Candida albicans</em> with the host. Future Microbiol. 2007 Apr;2:141-51.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19919567/" target="_blank" rel="noopener noreferrer">Zhu W, Filler SG</a>. Interactions of <em>Candida albicans</em> with epithelial cells. Cell Microbiol. 2010 Mar;12(3):273-82. Epub 2009 Nov 16.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/17707687/" target="_blank" rel="noopener noreferrer">Brown AJ, Odds FC, Gow NA</a>. Infection-related gene expression in <em>Candida albicans</em>. Curr Opin Microbiol. 2007 Aug;10(4):307-13.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19880183/" target="_blank" rel="noopener noreferrer">Gropp K, Schild L, Schindler S, Hube B, Zipfel PF, Skerka C</a>. The yeast <em>Candida albicans</em> evades human complement attack by secretion of aspartic proteases. Mol Immunol. 2009 Dec;47(2-3):465-75.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/17661666/" target="_blank" rel="noopener noreferrer">Hube B</a>. Infection-associated genes of <em>Candida albicans</em>. Future Microbiol. 2006 Aug;1:209-18.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/15470236/" target="_blank" rel="noopener noreferrer">Lorenz MC, Bender JA, Fink GR</a>. Transcriptional response of <em>Candida albicans</em> upon internalization by macrophages. Eukaryot Cell. 2004 Oct;3(5):1076-87.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/20415594/" target="_blank" rel="noopener noreferrer">Luo G, Ibrahim AS, Spellberg B, Nobile CJ, Mitchell AP, Fu Y</a>. <em>Candida albicans</em> Hyr1p confers resistance to neutrophil killing and is a potential vaccine target. J Infect Dis. 2010 Jun 1;201(11):1718-28.
          </li>
        </ul>
        <h4>VIRULENCE AND VIRULENCE FACTORS</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/10066539/" target="_blank" rel="noopener noreferrer">Mitchell AP</a>. Dimorphism and virulence in <em>Candida albicans</em>. Curr Opin Microbiol. 1998 Dec;1(6):687-92.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/16239535/" target="_blank" rel="noopener noreferrer">Ibrahim AS, Magee BB, Sheppard DC, Yang M, Kauffman S, Becker J, Edwards JE Jr, Magee PT</a>. Effects of ploidy and mating type on virulence of <em>Candida albicans</em>. Infect Immun. 2005 Nov;73(11):7366-74
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19473261/" target="_blank" rel="noopener noreferrer">Wilson D, Thewes S, Zakikhany K, Fradin C, Albrecht A, Almeida R, Brunke S, Grosse K, Martin R, Mayer F, Leonhardt I, Schild L, Seider K, Skibbe M, Slesiona S, Waechtler B, Jacobsen I, Hube B</a>. Identifying infection-associated genes of <em>Candida albicans</em> in the postgenomic era. FEMS Yeast Res. 2009 Aug;9(5):688-700.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/17555440/" target="_blank" rel="noopener noreferrer">Wu W, Lockhart SR, Pujol C, Srikantha T, Soll DR</a>. Heterozygosity of genes on the sex chromosome regulates <em>Candida albicans</em> virulence. Mol Microbiol. 2007 Jun;64(6):1587-604.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19995187/" target="_blank" rel="noopener noreferrer">Hogan DA, Sundstrom P</a>. The Ras/cAMP/PKA signaling pathway and virulence in <em>Candida albicans</em>. Future Microbiol. 2009 Dec;4:1263-70.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/16207242/" target="_blank" rel="noopener noreferrer">Kumamoto CA, Vinces MD</a>. Contributions of hyphae and hypha-co-regulated genes to <em>Candida albicans</em> virulence. Cell Microbiol. 2005 Nov;7(11):1546-54.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/17975704/" target="_blank" rel="noopener noreferrer">Lengeler KB, Tielker D, Ernst JF</a>. Protein-O-mannosyltransferases in virulence and development. Cell Mol Life Sci. 2008 Feb;65(4):528-44.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/16375670/" target="_blank" rel="noopener noreferrer">Mavor AL, Thewes S, Hube B</a>. Systemic fungal infections caused by <em>Candida</em> species: epidemiology, infection process and virulence attributes. Curr Drug Targets. 2005 Dec;6(8):863-74.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/12437091/" target="_blank" rel="noopener noreferrer">Monod M, Borg-von ZM</a>. Secreted aspartic proteases as virulence factors of <em>Candida </em> species. Biol Chem. 2002 Jul-Aug;383(7-8):1087-93.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/17321137/" target="_blank" rel="noopener noreferrer">Roman E, Arana DM, Nombela C, Alonso-Monge R, Pla J</a>. MAP kinase pathways as regulators of fungal virulence. Trends Microbiol. 2007 Apr;15(4):181-90.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/16262871/" target="_blank" rel="noopener noreferrer">Schaller M, Borelli C, Korting HC, Hube B</a>. Hydrolytic enzymes as virulence factors of <em>Candida albicans</em>. Mycoses. 2005 Nov;48(6):365-77.
          </li>
        </ul>
        <h2 id="c-glabrata"><em>C. glabrata</em></h2>
        <h3 id="c-glabrata-cell-biology">Cell Biology</h3>
        <h4>CELL WALL</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/10417386/" target="_blank" rel="noopener noreferrer">Cormack BP, Ghori, N, Falkow S</a>. An adhesin of the yeast pathogen Candida glabrata mediating adherence to human epithelial cells. Science 1999 Jul 23;285(5427);578-82.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/18806209/" target="_blank" rel="noopener noreferrer">de Groot PW, Kraneveld EA, Yin QY, Dekker HL, Gross U, Crielaard W, de Koster CG, Bader O, Klis FM, Weig M</a>. The cell wall of the human pathogen Candida glabrata: differential incorporation of novel adhesin-like wall proteins. Eukaryot Cell. 2008 Nov;7(11):1951-64.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/12952896/" target="_blank" rel="noopener noreferrer">De Las Peñas A, Pan SJ, Castaño I, Alder J, Cregg R, Cormack BP</a>. Virulence-related surface glycoproteins in the yeast pathogen Candida glabrata are encoded in subtelomeric clusters and subject to RAP1- and SIR-dependent transcriptional silencing. Genes Dev. 2003 Sep 15;17(18):2245-58.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/18394144/" target="_blank" rel="noopener noreferrer">Zupancic ML, Frieman M, Smith D, Alvarez RA, Cummings RD, Cormack BP</a>. Glycan microarray analysis of Candida glabrata adhesin ligand specificity. Mol Microbiol. 2008 May;68(3):547-59.
          </li>
        </ul>
        <h4>GENE SILENCING</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/12952896/" target="_blank" rel="noopener noreferrer">De Las Peñas A, Pan SJ, Castaño I, Alder J, Cregg R, Cormack BP</a>. Virulence-related surface glycoproteins in the yeast pathogen Candida glabrata are encoded in subtelomeric clusters and subject to RAP1- and SIR-dependent transcriptional silencing. Genes Dev. 2003 Sep 15;17(18):2245-58.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/15774723/" target="_blank" rel="noopener noreferrer">Domergue R, Castaño I, De Las Peñas A, Zupancic M, Lockatell V, Hebel JR, Johnson D, Cormack BP</a>. Nicotinic acid limitation regulates silencing of Candida adhesins during UTI. Science. 2005 May 6;308(5723):866-70.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/20675581/" target="_blank" rel="noopener noreferrer">Ramírez-Zavaleta CY, Salas-Delgado GE, De Las Peñas A, Castaño I</a>. Subtelomeric silencing of the MTL3 locus of Candida glabrata requires yKu70, yKu80, and Rif1 proteins. Eukaryot Cell. 2010 Oct;9(10):1602-11.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/18836091/" target="_blank" rel="noopener noreferrer">Rosas-Hernández LL, Juárez-Reyes A, Arroyo-Helguera OE, De Las Peñas A, Pan SJ, Cormack BP, Castaño I</a>. yKu70/yKu80 and Rif1 regulate silencing differentially at telomeres in Candida glabrata. Eukaryot Cell. 2008 Dec;7(12):2168-78.
          </li>
        </ul>
        <h4>DRUG RESISTANCE MECHANISMS</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/15105136/" target="_blank" rel="noopener noreferrer">Brun S, Bergès T, Poupard P, Vauzelle-Moreau C, Renier G, Chabasse D, Bouchara JP</a>. Mechanisms of azole resistance in petite mutants of Candida glabrata. Antimicrob Agents Chemother. 2004 May;48(5):1788-96.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19546367/" target="_blank" rel="noopener noreferrer">Garcia-Effron G, Lee S, Park S, Cleary JD, Perlin DS</a>. Effect of Candida glabrata FKS1 and FKS2 mutations on echinocandin sensitivity and kinetics of 1,3-beta-D-glucan synthase: implication for the existing susceptibility breakpoint. Antimicrob Agents Chemother. 2009 Sep;53(9):3690-9.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/21408004/" target="_blank" rel="noopener noreferrer">Ferrari S, Sanguinetti M, Torelli R, Posteraro B, Sanglard D</a>. Contribution of CgPDR1-regulated genes in enhanced virulence of azole-resistant Candida glabrata. PLoS One. 2011 Mar 9;6(3):e17589.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/11257032/" target="_blank" rel="noopener noreferrer">Sanglard D, Ischer F, Bille J</a>. Role of ATP-binding-cassette transporter genes in high-frequency acquisition of resistance to azole antifungals in Candida glabrata. Antimicrob Agents Chemother. 2001 Apr;45(4):1174-83.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/16569856/" target="_blank" rel="noopener noreferrer">Tsai HF, Krol AA, Sarti KE, Bennett JE</a>. Candida glabrata PDR1, a transcriptional regulator of a pleiotropic drug resistance network, mediates azole resistance in clinical isolates and petite mutants. Antimicrob Agents Chemother. 2006 Apr;50(4):1384-92.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/16803598/" target="_blank" rel="noopener noreferrer">Vermitsky JP, Earhart KD, Smith WL, Homayouni R, Edlind TD, Rogers PD</a>. Pdr1 regulates multidrug resistance in Candida glabrata: gene disruption and genome-wide expression studies. Mol Microbiol. 2006 Aug;61(3):704-22.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/15388433/" target="_blank" rel="noopener noreferrer">Vermitsky JP, Edlind TD</a>. Azole resistance in Candida glabrata: coordinate upregulation of multidrug transporters and evidence for a Pdr1-like transcription factor. Antimicrob Agents Chemother. 2004 Oct;48(10):3773-81.
          </li>
        </ul>
        <h3 id="c-glabrata-transformation-response">Transformation/Response</h3>
        <h4>BIOFILMS</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/15686569/" target="_blank" rel="noopener noreferrer">Iraqui I, Garcia-Sanchez S, Aubert S. Dromer F, Ghigo JM, d'Enfert C, Janbon, G</a>. The Yak1p kinase controls expression of adhesins and biofilm formation in Candida glabrata in a Sir4-dependent pathway. Mol Microbiol. 2005 Feb;55(4);1259-71.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/21566087/" target="_blank" rel="noopener noreferrer">Kucharikova S, Tournu H, Lagrou K, Van Dijck P, Bujdakova H</a>. Detailed comparison of Candida albicans and Candida glabrata biofilms under different conditions and its susceptibility to caspofungin and anidulafungin. J Med Microbiol. 2011 Sep;60(Pt 9):1261-1269.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/21411325/" target="_blank" rel="noopener noreferrer">Silva S, Negri M, Henriques M, Oliviera, Williams DW, Azeredo J</a>. Adherence and biofilm formation of non-Candida albicans Candida species. Trends Microbiol. 2011 May;19(5)241-7.
          </li>
        </ul>
        <h4>MATING AND MATING LOCI</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/14745027/" target="_blank" rel="noopener noreferrer">Butler G, Kenny C, Fagan A, Kurischko C, Gaillardin C, Wolfe KH</a>. Evolution of the MAT locus and its Ho endonuclease in yeast species. Proc Natl Acad Sci U S A. 2004 Feb 10;101(6):1632-7.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/18375614/" target="_blank" rel="noopener noreferrer">Muller H, Hennequin C, Gallaud J, Dujon B, Fairhead C</a>. The asexual yeast Candida glabrata maintains distinct a and alpha haploid mating types Eukaryot Cell. 2008 May;7(5):848-58. Erratum in: Eukaryot Cell. 2010 Apr;9(4):671-2.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/20675581/" target="_blank" rel="noopener noreferrer">Ramírez-Zavaleta CY, Salas-Delgado GE, De Las Peñas A, Castaño I</a>. Subtelomeric silencing of the MTL3 locus of Candida glabrata requires yKu70, yKu80, and Rif1 proteins. Eukaryot Cell. 2010 Oct;9(10):1602-11.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/12684382/" target="_blank" rel="noopener noreferrer">Srikantha T, Lachke SA, Soll DR</a>. Three mating type-like loci in Candida glabrata. Eukaryot Cell. 2003 Apr;2(2):328-40.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/12620120/" target="_blank" rel="noopener noreferrer">Wong S, Fares MA, Zimmermann W, Butler G, Wolfe KH</a>. Evidence from comparative genomics for a complete sexual cycle in the 'asexual' pathogenic yeast Candida glabrata. Genome Biol. 2003;4(2):R10.
          </li>
        </ul>
        <h4>PHENOTYPIC SWITCHING</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/14638801/" target="_blank" rel="noopener noreferrer">Brockert PJ, Lachke SA, Srikantha T, Pujol C, Galask R, Soll DR</a>. Phenotypic switching and mating type switching of Candida glabrata at sites of colonization. Infect Immun. 2003 Dec;71(12):7109-18.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/12213913/" target="_blank" rel="noopener noreferrer">Lachke SA, Joly S, Daniels K, Soll DR</a>. Phenotypic switching and filamentation in Candida glabrata. Microbiology. 2002 Sep;148(Pt 9):2661-74.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/10639459/" target="_blank" rel="noopener noreferrer">Lachke SA, Srikantha T, Tsai LK, Daniels K, Soll DR</a>. Phenotypic switching in Candida glabrata involves phase-specific regulation of the metallothionein gene MT-II and the newly discovered hemolysin gene HLP Infect Immun. 2000 Feb;68(2):884-95.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/18957584/" target="_blank" rel="noopener noreferrer">Srikantha T, Daniels KJ, Wu W, Lockhart SR, Yi S, Sahni N, Ma N, Soll DR</a>. Dark brown is the more virulent of the switch phenotypes of Candida glabrata. Microbiology. 2008 Nov;154(Pt 11):3309-18.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/16087748/" target="_blank" rel="noopener noreferrer">Srikantha T, Zhao R, Daniels K, Radke J, Soll DR</a>. Phenotypic switching in Candida glabrata accompanied by changes in expression of genes with deduced functions in copper detoxification and stress. Eukaryot Cell. 2005 Aug;4(8):1434-45.
          </li>
        </ul>
        <h3 id="c-glabrata-virulence">Virulence</h3>
        <h4>HOST-PATHOGEN INTERACTIONS</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/10417386/" target="_blank" rel="noopener noreferrer">Cormack BP, Ghori N, Falkow S</a>. An adhesin of the yeast pathogen Candida glabrata mediating adherence to human epithelial cells. Science. 1999 Jul 23;285(5427):578-82.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/15996895/" target="_blank" rel="noopener noreferrer">Kaur R, Domergue R, Zupancic ML, Cormack BP</a>. A yeast by any other name: Candida glabrata and its interaction with the host. Curr Opin Microbiol. 2005 Feb;55(4):1259-271. Aug;8(4)378-84.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/29783771/" target="_blank" rel="noopener noreferrer">Timmermans B, De Las Peñas A, Castaño I, Van Dijck P</a>. Adhesins in Candida glabrata. J fungi (Basel, Switzerland). 2018, 4 (2), 60.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/31083555/" target="_blank" rel="noopener noreferrer">Galocha M, Pais P, Cavalheiro M, Pereira D, Viana R, Teixeira MC</a>. Divergent approaches to virulence in C. albicans and C. glabrata: Two sides of the same coin. Int J Mol Sci. 2019, 20 (9), 2345.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/32668993/" target="_blank" rel="noopener noreferrer">Rasheed M, Battu A, Kaur R</a>. Host-pathogen interaction in Candida glabrata infection: Current knowledge and implications for antifungal therapy. Expert Rev Anti Infect Ther. 2020, 18 (11), 1093– 1103.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/39668745/" target="_blank" rel="noopener noreferrer">Askari F, Kaur R</a>. Candida glabrata: a tale of stealth and endurance. ACS Infect Dis. 2025 Jan 10;11(1):4-20.
          </li>
        </ul>
        <h4>VIRULENCE FACTORS</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/16611037/" target="_blank" rel="noopener noreferrer">Ruhnke M</a>. Epidemiology of Candida albicans infections and role of non-Candida-albicans yeasts. Curr Drug Targets. 2006 Apr;7(4):495-504.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19148266/" target="_blank" rel="noopener noreferrer">Ferrari S, Ischer F, Calabrese D, Posteraro B, Sanguinetti M, Fadda G, Rohde B, Bauser C, Bader O, Sanglard D</a>. Gain of function mutations in CgPDR1 of Candida glabrata not only mediate antifungal resistance but also enhance virulence. PLoS Pathog. 2009 Jan;5(1):e1000268.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/21321146/" target="_blank" rel="noopener noreferrer">Ferrari S, Sanguinetti M, De Bernardis F, Torelli R, Posteraro B, Vandeputte P, Sanglard D</a>. Loss of mitochondrial functions associated with azole resistance in Candida glabrata results in enhanced virulence in mice. Antimicrob Agents Chemother. 2011 May;55(5):1852-60.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/17456602/" target="_blank" rel="noopener noreferrer">Kaur R, Ma B, Cormack BP</a>. A family of glycosylphosphatidylinositol-linked aspartyl proteases is required for virulence of Candida glabrata. Proc Natl Acad Sci U S A. 2007 May 1;104(18):7628-33.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/15075283/" target="_blank" rel="noopener noreferrer">Kamran M, Calcagno AM, Findon H, Bignell E, Jones MD, Warn P, Hopkins P, Denning DW, Butler G, Rogers T, Mühlschlegel FA, Haynes K</a>. Inactivation of transcription factor gene ACE2 in the fungal pathogen Candida glabrata results in hypervirulence. Eukaryot Cell. 2004 Apr;3(2):546-52.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/20008535/" target="_blank" rel="noopener noreferrer">Jacobsen ID, Brunke S, Seider K, Schwarzmüller T, Firon A, d'Enfért C, Kuchler K, Hube B</a>. Candida glabrata persistence in mice does not depend on host immunosuppression and is unaffected by fungal amino acid auxotrophy. Infect Immun. 2010 Mar;78(3):1066-77.
          </li>
        </ul>
        <h2 id="c-parapsilosis"><em>C. parapsilosis</em></h2>
        <h3 id="c-parapsilosis-cell-biology">Cell Biology</h3>
        <h4>CELL WALL</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/21953587/" target="_blank" rel="noopener noreferrer">Vinterová Z, Sanda M, Dostál J, Hrušková-Heidingsfeldová O, Pichová I</a>. Evidence for the presence of proteolytically active secreted aspartic proteinase 1 of <em>Candida parapsilosis</em> in the cell wall. Protein Sci. 2011 Dec;20(12):2004-12.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/26438063/" target="_blank" rel="noopener noreferrer">Kozik A, Karkowska-Kuleta J, Zajac D, Bochenska O, Kedracka-Krok S, Jankowska U, Rapala-Kozik M</a>. Fibronectin-, vitronectin- and laminin-binding proteins at the cell walls of <em>Candida parapsilosis</em> and <em>Candida tropicalis</em> pathogenic yeasts. BMC Microbiol. 2015 Oct 5;15:197.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/26636137/" target="_blank" rel="noopener noreferrer">Karkowska-Kuleta J, Zajac D, Bochenska O, Kozik A</a>. Surfaceome of pathogenic yeasts, <em>Candida parapsilosis</em> and <em>Candida tropicalis</em>, revealed with the use of cell surface shaving method and shotgun proteomic approach. Acta Biochim Pol. 2015;62(4):807-19.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/27014229/" target="_blank" rel="noopener noreferrer">Pérez-García LA, Csonka K, Flores-Carreón A, Estrada-Mata E, Mellado-Mojica E, Németh T, López-Ramírez LA, Toth R, López MG, Vizler C, Marton A, Tóth A, Nosanchuk JD, Gácser A, Mora-Montes HM</a>.  Role of protein glycosylation in <em>Candida parapsilosis</em>  cell wall integrity and host interaction. Front Microbiol. 2016 Mar 8:7:306.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/31105652/" target="_blank" rel="noopener noreferrer">Oh SH, Smith B, Miller AN, Staker B, Fields C, Hernandez A, Hoyer LL</a>. Agglutinin-Like Sequence (ALS) Genes in the <em>Candida parapsilosis</em>  species complex: blurring the boundaries between gene families that encode cell-wall proteins. Front Microbiol. 2019 Apr 26:10:781.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/36851809/" target="_blank" rel="noopener noreferrer">Satala D, Karkowska-Kuleta J, Bras G, Rapala-Kozik M, Kozik A</a>. <em>Candida parapsilosis</em> cell wall proteins-CPAR2_404800 and CPAR2_404780-are adhesins that bind to human epithelial and endothelial cells and extracellular matrix proteins. Yeast. 2023 Aug;40(8):377-389.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/36992262/" target="_blank" rel="noopener noreferrer">Gong X, Srivastava V, Naicker P, Khan A, Ahmad A</a>. <em>Candida parapsilosis</em> cell wall proteome characterization and effectiveness against hematogenously disseminated candidiasis in a murine model. Vaccines (Basel). 2023 Mar 16;11(3):674.
          </li>
        </ul>
        <h4>DRUG RESISTANCE MECHANISMS</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/36121151/" target="_blank" rel="noopener noreferrer">Bergin SA, Zhao F, Ryan AP, Müller CA, Nieduszynski CA, Zhai B, Rolling T, Hohl TM, Morio F, Scully J, Wolfe KH, Butler G</a>. Systematic analysis of copy number variations in the pathogenic yeast <em>Candida parapsilosis</em> identifies a gene amplification in <em> RTA3</em> that is associated with drug resistance. mBio. 2022 Oct 26;13(5):e0177722.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/33115837/" target="_blank" rel="noopener noreferrer">Papp C, Bohner F, Kocsis K, Varga M, Szekeres A, Bodai L, Willis JR, Gabaldón T, Tóth R, Nosanchuk JD, Vágvölgyi C, Gácser A</a>.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/26248365/" target="_blank" rel="noopener noreferrer">Branco J, Silva AP, Silva RM, Silva-Dias A, Pina-Vaz C, Butler G, Rodrigues AG, Miranda IM</a>. Fluconazole and voriconazole resistance in <em>Candida parapsilosis</em> is conferred by gain-of-function mutations in <em>MRR1</em> transcription factor gene. Antimicrob Agents Chemother. 2015 Oct;59(10):6629-33.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/36675901/" target="_blank" rel="noopener noreferrer">Branco J, Miranda IM, Rodrigues AG</a>. <em>Candida parapsilosis</em> Virulence and antifungal resistance mechanisms: a comprehensive review of key determinants. J Fungi (Basel). 2023 Jan 5;9(1):80.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/15956390/" target="_blank" rel="noopener noreferrer">Sarvikivi E, Lyytikäinen O, Soll DR</a>. Emergence of fluconazole resistance in a <em>Candida parapsilosis</em> strain that caused infections in a neonatal intensive care unit. J Clin Microbiol. 2005;43(6):2729–2735.
          </li>
        </ul>
        <h3 id="c-parapsilosis-transformation-response">Transformation/Response</h3>
        <h4>BIOFILMS</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/26071437/" target="_blank" rel="noopener noreferrer">Pereira L, Silva S, Ribeiro B, Henriques M, Azeredo J</a>. Influence of glucose concentration on the structure and quantity of biofilms formed by <em>Candida parapsilosis</em>. FEMS Yeast Res. 2015 Aug;15(5):fov043.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/23895281/" target="_blank" rel="noopener noreferrer">Connolly LA, Riccombeni A, Grózer Z, Holland LM, Lynch DB, Andes DR, Gácser A, Butler G</a>. The APSES transcription factor <em>Efg1</em> is a global regulator that controls morphogenesis and biofilm formation in <em>Candida parapsilosis. </em> Mol Microbiol. 2013 Oct;90(1):36-53.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/33538224/" target="_blank" rel="noopener noreferrer">Branco J, Martins-Cruz C, Rodrigues L, Silva RM, Araújo-Gomes N, Gonçalves T, Miranda IM, Rodrigues AG</a>. The transcription factor <em>Ndt80</em> is a repressor of <em>Candida parapsilosis</em> virulence attributes. Virulence. 2021 Dec;12(1):601-614.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/25233198/" target="_blank" rel="noopener noreferrer">Holland LM, Schröder MS, Turner SA, Taff H, Andes D, Grózer Z, Gácser A, Ames L, Haynes K, Higgins DG, Butler G</a>. Comparative phenotypic analysis of the major fungal pathogens <em>Candida parapsilosis</em> and <em>Candida albicans</em>. PLoS Pathog. 2014 Sep 18;10(9):e1004365.
          </li>
        </ul>
        <h4>ADHESION</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/33568454/" target="_blank" rel="noopener noreferrer">Bliss JM, Tollefson GA, Cuevas A, Longley SJ, Neale MN, Uzun A, Shaw SK</a>. Transcription profiles associated with inducible adhesion in <em>Candida parapsilosis</em>. mSphere. 2021 Feb 10;6(1):e01071-20.
          </li>
        </ul>
        <h4>MATING LOCI</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/15947193/" target="_blank" rel="noopener noreferrer">Logue ME, Wong S, Wolfe KH, Butler G</a>. A genome sequence survey shows that the pathogenic yeast <em>Candida parapsilosis</em> has a defective <em>MTLa1</em> allele at its mating type locus. Eukaryot Cell. 2005 Jun;4(6):1009-17.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/21335529/" target="_blank" rel="noopener noreferrer">Sai S, Holland LM, McGee CF, Lynch DB, Butler G</a>. Evolution of mating within the <em>Candida parapsilosis</em> species group. Eukaryot Cell. 2011 Apr;10(4):578-87.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/28771588/" target="_blank" rel="noopener noreferrer">Döğen A, Metin B, Ilkit M, de Hoog GS, Heitman J</a>. MTL genotypes, phenotypic switching, and susceptibility profiles of <em>Candida parapsilosis</em> species group compared to <em>Lodderomyces elongisporus</em>. PLoS One. 2017 Aug 3;12(8):e0182653.
          </li>
        </ul>
        <h4>PHENOTYPIC SWITCHING</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/15817776/" target="_blank" rel="noopener noreferrer">Laffey SF, Butler G</a>. Phenotype switching affects biofilm formation by <em>Candida parapsilosis</em>. Microbiology (Reading). 2005 Apr;151(Pt 4):1073-1081.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/33572958/" target="_blank" rel="noopener noreferrer">Pál SE, Tóth R, Nosanchuk JD, Vágvölgyi C, Németh T, Gácser A</a>. A <em>Candida parapsilosis</em> overexpression collection reveals genes required for pathogenesis. J Fungi (Basel). 2021 Jan 29;7(2):97.
          </li>
        </ul>
        <h4>STRESS RESPONSE</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/24922533/" target="_blank" rel="noopener noreferrer">Sánchez-Fresneda R, Martínez-Esparza M, Maicas S, Argüelles JC, Valentín E</a>. In <em>Candida parapsilosis</em> the <em>ATC1</em> gene encodes for an acid trehalase involved in trehalose hydrolysis, stress resistance and virulence. PLoS One. 2014 Jun 12;9(6):e99113.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/31399405/" target="_blank" rel="noopener noreferrer">Jakab Á, Tóth Z, Nagy F, Nemes D, Bácskay I, Kardos G, Emri T, Pócsi I, Majoros L, Kovács R</a>. Physiological and transcriptional responses of <em>Candida parapsilosis</em> to exogenous tyrosol. Appl Environ Microbiol. 2019 Oct 1;85(20):e01388-19.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/33302409/" target="_blank" rel="noopener noreferrer">Zangl I, Beyer R, Pap IJ, Strauss J, Aspöck C, Willinger B, Schüller C</a>. Human pathogenic <em>Candida</em> species respond distinctively to lactic acid stress. J Fungi (Basel). 2020 Dec 8;6(4):348.
          </li>
        </ul>
        <h3 id="c-parapsilosis-virulence">Virulence</h3>
        <h4>HOST-PATHOGEN INTERACTIONS</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/29358719/" target="_blank" rel="noopener noreferrer">Tóth R, Cabral V, Thuer E, Bohner F, Németh T, Papp C, Nimrichter L, Molnár G, Vágvölgyi C, Gabaldón T, Nosanchuk JD, Gácser A</a>. Investigation of <em>Candida parapsilosis</em> virulence regulatory factors during host-pathogen interaction. Sci Rep. 2018 Jan 22;8(1):1346.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/33572958/" target="_blank" rel="noopener noreferrer">Pál SE, Tóth R, Nosanchuk JD, Vágvölgyi C, Németh T, Gácser A</a>. A <em>Candida parapsilosis</em> Overexpression collection reveals genes required for pathogenesis. J Fungi (Basel). 2021 Jan 29;7(2):97.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/24257473/" target="_blank" rel="noopener noreferrer">Singaravelu K, Gácser A, Nosanchuk JD</a>. Genetic determinants of virulence - <em>Candida parapsilosis</em>. Rev Iberoam Micol. 2014 Jan-Mar;31(1):16-21.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/25911234/" target="_blank" rel="noopener noreferrer">Polke M, Hube B, Jacobsen ID</a>. <em>Candida</em> survival strategies. Adv Appl Microbiol. 2015:91:139-235. [REVIEW]
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/21569057/" target="_blank" rel="noopener noreferrer">Silva S, Negri M, Henriques M, Oliveira R, Williams DW, Azeredo J</a>. <em>Candida glabrata, Candida parapsilosis</em> and <em>Candida tropicalis</em>: biology, epidemiology, pathogenicity and antifungal resistance. FEMS Microbiol Rev. 2012 Mar;36(2):288-305. [REVIEW]
          </li>
        </ul>
        <h4>VIRULENCE FACTORS</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/8335087/" target="_blank" rel="noopener noreferrer">Fusek M, Smith EA, Monod M, Foundling SI</a>. <em>Candida parapsilosis</em> expresses and secretes two aspartic proteinases. FEBS Lett. 1993 Jul 19;327(1):108-12.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/36675901/" target="_blank" rel="noopener noreferrer">Branco J, Miranda IM, Rodrigues AG</a>. <em>Candida parapsilosis</em> Virulence and antifungal resistance mechanisms: a comprehensive review of key determinants. J Fungi (Basel). 2023 Jan 5;9(1):80.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/27526931/" target="_blank" rel="noopener noreferrer">Toth R, Toth A, Vagvolgyi C, Gacser A</a>. <em>Candida parapsilosis</em> Secreted lipase as an important virulence factor. Curr Protein Pept Sci. 2017;18(10):1043-1049.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/38918050/" target="_blank" rel="noopener noreferrer">Gandra RM, Ramos LS, Cruz LPS, Souza LOP, Branquinha MH, Santos ALS</a>. <em>Candida parapsilosis</em>: Heterogeneous and strain-specific expression of secreted aspartic proteases (Sapp1 and Sapp2). Med Mycol. 2024 Jul 4;62(7):myae066.
          </li>
        </ul>
        <h2 id="c-auris"><em>C. auris</em></h2>
        <h3 id="c-auris-cell-biology">Cell Biology</h3>
        <h4>CELL WALL</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/34160238/" target="_blank" rel="noopener noreferrer">Horton MV, Johnson CJ, Zarnowski R, Andes BD, Schoen TJ, Kernien JF, Lowman D, Kruppa MD, Ma Z, Williams DL, Huttenlocher A, Nett JE</a>. <em>Candida auris</em> cell wall mannosylation contributes to neutrophil evasion through pathways divergent from <em>Candida albicans</em> and <em>Candida glabrata</em>. mSphere. 2021 Jun 30;6(3):e0040621.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/38851008/" target="_blank" rel="noopener noreferrer">Dakalbab S, Hamdy R, Holigová P, Abuzaid EJ, Abu-Qiyas A, Lashine Y, Mohammad MG, Soliman SSM</a>. Uniqueness of <em>Candida auris</em> cell wall in morphogenesis, virulence, resistance, and immune evasion. Microbiol Res. 2024 Sep;286:127797.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/39656857/" target="_blank" rel="noopener noreferrer">Alvarado M, Gómez-Navajas JA, Blázquez-Muñoz MT, Gómez-Molero E, Fernández-Sánchez S, Eraso E, Munro CA, Valentín E, Mateo E, de Groot PWJ</a>. The good, the bad, and the hazardous: comparative genomic analysis unveils cell wall features in the pathogen <em>Candidozyma auris</em> typical for both baker's yeast and <em>Candida</em>. FEMS Yeast Res. 2024 Jan 9;24:foae039.
          </li>
        </ul>
        <h4>DRUG RESISTANCE MECHANISMS</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/35252632/" target="_blank" rel="noopener noreferrer">Shahi G, Kumar M, Skwarecki AS, Edmondson M, Banerjee A, Usher J, Gow NAR, Milewski S, Prasad R</a>. Fluconazole resistant <em>Candida auris</em> clinical isolates have increased levels of cell wall chitin and increased susceptibility to a glucosamine-6-phosphate synthase inhibitor. Cell Surf. 2022 Feb 25;8:100076.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/35770999/" target="_blank" rel="noopener noreferrer">Jacobs SE, Jacobs JL, Dennis EK, Taimur S, Rana M, Patel D, Gitman M, Patel G, Schaefer S, Iyer K, Moon J, Adams V, Lerner P, Walsh TJ, Zhu Y, Anower MR, Vaidya MM, Chaturvedi S, Chaturvedi V</a>. <em>Candida auris</em> pan-drug-resistant to four classes of antifungal agents. Antimicrob Agents Chemother. 2022 Jul 19;66(7):e0005322.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/33820824/" target="_blank" rel="noopener noreferrer">Carolus H, Pierson S, Muñoz JF, Subotić A, Cruz RB, Cuomo CA, Van Dijck P</a>. Genome-wide analysis of experimentally evolved <em>Candida auris</em> reveals multiple novel mechanisms of multidrug resistance. mBio. 2021 Apr 5;12(2):e03333-20.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/37337929/" target="_blank" rel="noopener noreferrer">Jangir P, Kalra S, Tanwar S, Bari VK</a>. Azole resistance in <em>Candida auris</em>: mechanisms and combinatorial therapy. APMIS. 2023 Aug;131(8):442-462.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/35794716/" target="_blank" rel="noopener noreferrer">Sanyaolu A, Okorie C, Marinkovic A, Abbasi AF, Prakash S, Mangat J, Hosein Z, Haider N, Chan J</a>. <em>Candida auris</em>: An overview of the emerging drug-resistant fungal infection. Infect Chemother. 2022 Jun;54(2):236-246. [Review]
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/33091071/" target="_blank" rel="noopener noreferrer">Du H, Bing J, Hu T, Ennis CL, Nobile CJ, Huang G</a>. <em>Candida auris</em>: Epidemiology, biology, antifungal resistance, and virulence. PLoS Pathog. 2020 Oct 22;16(10):e1008921. [Review]
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/37998390/" target="_blank" rel="noopener noreferrer">Czajka KM, Venkataraman K, Brabant-Kirwan D, Santi SA, Verschoor C, Appanna VD, Singh R, Saunders DP, Tharmalingam S</a>. Molecular mechanisms associated with antifungal resistance in pathogenic <em>Candida</em> species. Cells. 2023 Nov 19;12(22):2655. [Review]
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/38686214/" target="_blank" rel="noopener noreferrer">Lee Y, Robbins N, Cowen LE</a>. Molecular mechanisms governing antifungal drug resistance. NPJ Antimicrob Resist. 2023;1(1):5. [Review]
          </li>
        </ul>
        <h3 id="c-auris-transformation-response">Transformation/Response</h3>
        <h4>BIOFILMS</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/31969479/" target="_blank" rel="noopener noreferrer">Horton MV, Johnson CJ, Kernien JF, Patel TD, Lam BC, Cheong JZA, Meudt JJ, Shanmuganayagam D, Kalan LR, Nett JE</a>. <em>Candida auris</em> forms high-burden biofilms in skin niche conditions and on porcine skin. mSphere. 2020 Jan 22;5(1):e00910-19.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/35674961/" target="_blank" rel="noopener noreferrer">Corzo-León DE, Mark C, MacCallum DM, Munro CA</a>. A human ex vivo skin model to study <em>Candida auris</em> biofilms. Methods Mol Biol. 2022;2517:259-267.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/34540717/" target="_blank" rel="noopener noreferrer">Bapat PS, Nobile CJ</a>. Photodynamic therapy is effective against <em>Candida auris</em> biofilms. Front Cell Infect Microbiol. 2021 Sep 3;11:713092.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/38493178/" target="_blank" rel="noopener noreferrer">Bing J, Guan Z, Zheng T, Ennis CL, Nobile CJ, Chen C, Chu H, Huang G</a>. Rapid evolution of an adaptive multicellular morphology of <em>Candida auris</em> during systemic infection. Nat Commun. 2024 Mar 16;15(1):2381.
          </li>
        </ul>
        <h4>ADHESION</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/37769084/" target="_blank" rel="noopener noreferrer">Santana DJ, Anku JAE, Zhao G, Zarnowski R, Johnson CJ, Hautau H, Visser ND, Ibrahim AS, Andes D, Nett JE, Singh S, O'Meara TR</a>. A <em>Candida auris</em>-specific adhesin, Scf1, governs surface association, colonization, and virulence. Science. 2023 Sep 29;381(6665):1461-1467.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/39455573/" target="_blank" rel="noopener noreferrer">Wang TW, Sofras D, Montelongo-Jauregui D, Paiva TO, Carolus H, Dufrêne YF, Alfaifi AA, McCracken C, Bruno VM, Van Dijck P, Jabra-Rizk MA</a>. Functional redundancy in <em>Candida auris</em> cell surface adhesins crucial for cell-cell interaction and aggregation. Nat Commun. 2024 Oct 25;15(1):9212.
          </li>
        </ul>
        <h4>MATING LOCI</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/30559369/" target="_blank" rel="noopener noreferrer">Muñoz JF, Gade L, Chow NA, Loparev VN, Juieng P, Berkow EL, Farrer RA, Litvintseva AP, Cuomo CA</a>. Genomic insights into multidrug-resistance, mating and virulence in <em>Candida auris</em> and related emerging species. Nat Commun. 2018 Dec 17;9(1):5346.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/35782746/" target="_blank" rel="noopener noreferrer">Wang Y, Xu J</a>. Population genomic analyses reveal evidence for limited recombination in the superbug <em>Candida auris</em> in nature. Comput Struct Biotechnol J. 2022 Jun 16;20:3030-3040.
          </li>
        </ul>
        <h4>PHENOTYPIC SWITCHING</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/30482894/" target="_blank" rel="noopener noreferrer">Yue H, Bing J, Zheng Q, Zhang Y, Hu T, Du H, Wang H, Huang G</a>. Filamentation in <em>Candida auris</em>, an emerging fungal pathogen of humans: passage through the mammalian body induces a heritable phenotypic switch. Emerg Microbes Infect. 2018 Nov 28;7(1):188.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/30329075/" target="_blank" rel="noopener noreferrer">Bentz ML, Sexton DJ, Welsh RM, Litvintseva AP</a>. Phenotypic switching in newly emerged multidrug-resistant pathogen <em>Candida auris</em>. Med Mycol. 2019 Jul 1;57(5):636-638.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/39405274/" target="_blank" rel="noopener noreferrer">Phan-Canh T, Kuchler K</a>. Do morphogenetic switching and intraspecies variation enhance virulence of <em>Candida auris</em>? PLoS Pathog. 2024 Oct 15;20(10):e1012559. [Review]
          </li>
        </ul>
        <h4>STRESS RESPONSE</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/34643421/" target="_blank" rel="noopener noreferrer">Jakab Á, Balla N, Ragyák Á, Nagy F, Kovács F, Sajtos Z, Tóth Z, Borman AM, Pócsi I, Baranyai E, Majoros L, Kovács R</a>. Transcriptional profiling of the <em>Candida auris</em> response to exogenous farnesol exposure. mSphere. 2021 Oct 27;6(5):e0071021.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/34630944/" target="_blank" rel="noopener noreferrer">Zamith-Miranda D, Amatuzzi RF, Munhoz da Rocha IF, Martins ST, Lucena ACR, Vieira AZ, Trentin G, Almeida F, Rodrigues ML, Nakayasu ES, Nosanchuk JD, Alves LR</a>. Transcriptional and translational landscape of <em>Candida auris</em> in response to caspofungin. Comput Struct Biotechnol J. 2021 Sep 14;19:5264-5277.
          </li>
        </ul>
        <h3 id="c-auris-virulence">Virulence</h3>
        <h4>HOST-PATHOGEN INTERACTIONS</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/33190684/" target="_blank" rel="noopener noreferrer">Chaturvedi V, Linhardt RJ, Papon N</a>. <em>Candida auris</em> mannans and pathogen-host interplay. Trends Microbiol. 2020 Dec;28(12):954-956.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/38493178/" target="_blank" rel="noopener noreferrer">Bing J, Guan Z, Zheng T, Ennis CL, Nobile CJ, Chen C, Chu H, Huang G</a>. Rapid evolution of an adaptive multicellular morphology of <em>Candida auris</em> during systemic infection. Nat Commun. 2024 Mar 16;15(1):2381.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/37204928/" target="_blank" rel="noopener noreferrer">Weerasinghe H, Simm C, Djajawi TM, Tedja I, Lo TL, Simpson DS, Shasha D, Mizrahi N, Olivier FAB, Speir M, Lawlor KE, Ben-Ami R, Traven A</a>. <em>Candida auris</em> uses metabolic strategies to escape and kill macrophages while avoiding robust activation of the NLRP3 inflammasome response. Cell Rep. 2023 May 30;42(5):112522.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/38127686/" target="_blank" rel="noopener noreferrer">Horton MV, Holt AM, Nett JE</a>. Mechanisms of pathogenicity for the emerging fungus <em>Candida auris</em>. PLoS Pathog. 2023 Dec 21;19(12):e1011843. [Review]
          </li>
        </ul>
        <h4>VIRULENCE FACTORS</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/35142597/" target="_blank" rel="noopener noreferrer">Allert S, Schulz D, Kämmer P, Großmann P, Wolf T, Schäuble S, Panagiotou G, Brunke S, Hube B</a>. From environmental adaptation to host survival: Attributes that mediate pathogenicity of <em>Candida auris</em>. Virulence. 2022 Dec;13(1):191-214.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/38992278/" target="_blank" rel="noopener noreferrer">Li C, Wang J, Li H, Wang Y, Wu H, Wei W, Wu D, Shao J, Wang T, Wang C</a>. Suppressing the virulence factors of <em>Candida auris</em> with baicalein through multifaceted mechanisms. Arch Microbiol. 2024 Jul 11;206(8):349.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/33091071/" target="_blank" rel="noopener noreferrer">Du H, Bing J, Hu T, Ennis CL, Nobile CJ, Huang G</a>. <em>Candida auris</em>: Epidemiology, biology, antifungal resistance, and virulence. PLoS Pathog. 2020 Oct 22;16(10):e1008921. [Review]
          </li>
        </ul>
        <h2 id="c-dubliniensis"><em>C. dubliniensis</em></h2>
        <h3 id="c-dubliniensis-cell-biology">Cell Biology</h3>
        <h4>CELL WALL</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/33910989/" target="_blank" rel="noopener noreferrer">Bemena LD, Min K, Konopka JB, Neiman AM</a>. A conserved machinery underlies the synthesis of a chitosan layer in the <em>Candida</em> chlamydospore cell wall. mSphere. 2021 Apr 28;6(2):e00080-21.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/23482280/" target="_blank" rel="noopener noreferrer">Yazdanparast SA, Nezarati SS, Heshmati F, Hamzehlou S</a>. Comparison of cell wall proteins in putative <em>Candida albicans</em> & <em>Candida dubliniensis</em> by using modified staining method & SDS-PAGE. Med J Islam Repub Iran. 2012 May;26(2):45-9.
          </li>
        </ul>
        <h4>DRUG RESISTANCE MECHANISMS</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/11709317/" target="_blank" rel="noopener noreferrer">Wirsching S, Moran GP, Sullivan DJ, Coleman DC, Morschhäuser J</a>. MDR1-mediated drug resistance in <em>Candida dubliniensis</em>. Antimicrob Agents Chemother. 2001 Dec;45(12):3416-21.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/21531874/" target="_blank" rel="noopener noreferrer">Chen YL, Brand A, Morrison EL, Silao FG, Bigol UG, Malbas FF Jr, Nett JE, Andes DR, Solis NV, Filler SG, Averette A, Heitman J</a>. Calcineurin controls drug tolerance, hyphal growth, and virulence in <em>Candida dubliniensis</em>. Eukaryot Cell. 2011 Jun;10(6):803-19.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/24474018/" target="_blank" rel="noopener noreferrer">Linares CE, Giacomelli SR, Altenhofen D, Alves SH, Morsch VM, Schetinger MR</a>. Fluconazole and amphotericin-B resistance are associated with increased catalase and superoxide dismutase activity in <em>Candida albicans</em> and <em>Candida dubliniensis</em>. Rev Soc Bras Med Trop. 2013 Nov-Dec;46(6):752-8.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/14734017/" target="_blank" rel="noopener noreferrer">Sullivan DJ, Moran GP, Pinjon E, Al-Mosaid A, Stokes C, Vaughan C, Coleman DC</a>. Comparison of the epidemiology, drug resistance mechanisms, and virulence of <em>Candida dubliniensis</em> and <em>Candida albicans</em>. FEMS Yeast Res. 2004 Jan;4(4-5):369-76. (Review)
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/20521937/" target="_blank" rel="noopener noreferrer">Coleman DC, Moran GP, McManus BA, Sullivan DJ</a>. Mechanisms of antifungal drug resistance in <em>Candida dubliniensis</em>. Future Microbiol. 2010 Jun;5(6):935-49. (Review)
          </li>
        </ul>
        <h3 id="c-dubliniensis-transformation-response">Transformation/Response</h3>
        <h4>BIOFILMS</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/11526156/" target="_blank" rel="noopener noreferrer">Ramage G, Vande Walle K, Wickes BL, López-Ribot JL</a>. Biofilm formation by <em>Candida dubliniensis</em>. J Clin Microbiol. 2001 Sep;39(9):3234-40.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/26432632/" target="_blank" rel="noopener noreferrer">Pujol C, Daniels KJ, Soll D</a>. Comparison of switching and biofilm formation between MTL-homozygous strains of <em>Candida albicans</em> and <em>Candida dubliniensis</em>. Eukaryot Cell. 2015 Dec;14(12):1186-202.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/25911234/" target="_blank" rel="noopener noreferrer">Polke M, Hube B, Jacobsen ID</a>. <em>Candida</em> survival strategies. Adv Appl Microbiol. 2015:91:139-235. (Review)
          </li>
        </ul>
        <h4>ADHESION</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/15482009/" target="_blank" rel="noopener noreferrer">Jabra-Rizk MA, Falkler WA Jr, Merz WG, Baqui AA, Kelley JI, Meiller TF</a>. Cell surface hydrophobicity-associated adherence of <em>Candida dubliniensis</em> to human buccal epithelial cells. Rev Iberoam Micol. 2001 Mar;18(1):17-22.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19626546/" target="_blank" rel="noopener noreferrer">Biasoli MS, Tosello ME, Luque AG, Magaró HM</a>. Adherence, colonization and dissemination of <em>Candida dubliniensis</em> and other <em>Candida</em> species. Med Mycol. 2010 Mar;48(2):291-7.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/24625677/" target="_blank" rel="noopener noreferrer">Jordan RP, Williams DW, Moran GP, Coleman DC, Sullivan DJ</a>. Comparative adherence of <em>Candida albicans</em> and <em>Candida dubliniensis</em> to human buccal epithelial cells and extracellular matrix proteins. Med Mycol. 2014 Apr;52(3):254-63.
          </li>
        </ul>
        <h4>MATING LOCI</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/15302834/" target="_blank" rel="noopener noreferrer">Pujol C, Daniels KJ, Lockhart SR, Srikantha T, Radke JB, Geiger J, Soll DR</a>. The closely related species <em>Candida albicans</em> and <em>Candida dubliniensis</em> can mate. Eukaryot Cell. 2004 Aug;3(4):1015-27.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/26432632/" target="_blank" rel="noopener noreferrer">Pujol C, Daniels KJ, Soll D</a>. Comparison of switching and biofilm formation between MTL-homozygous strains of <em>Candida albicans</em> and <em>Candida dubliniensis</em>. Eukaryot Cell. 2015 Dec;14(12):1186-202.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/26714067/" target="_blank" rel="noopener noreferrer">Yue H, Hu J, Guan G, Tao L, Du H, Li H, Huang G</a>. Discovery of the gray phenotype and white-gray-opaque tristable phenotypic transitions in <em>Candida dubliniensis</em>. Virulence. 2016 Apr 2;7(3):230-42.
          </li>
        </ul>
        <h4>CHLAMYDOSPORE DEVELOPMENT</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/15659176/" target="_blank" rel="noopener noreferrer">Staib P, Morschhäuser J</a>. Differential expression of the <em>NRG1</em> repressor controls species-specific regulation of chlamydospore development in <em>Candida albicans</em> and <em>Candida dubliniensis</em>. Mol Microbiol. 2005 Jan;55(2):637-52.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/23613980/" target="_blank" rel="noopener noreferrer">Palige K, Linde J, Martin R, Böttcher B, Citiulo F, Sullivan DJ, Weber J, Staib C, Rupp S, Hube B, Morschhäuser J, Staib P</a>. Global transcriptome sequencing identifies chlamydospore specific markers in <em>Candida albicans</em> and <em>Candida dubliniensis</em>. PLoS One. 2013 Apr 15;8(4):e61940.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/17302741/" target="_blank" rel="noopener noreferrer">Staib P, Morschhäuser J</a>. Chlamydospore formation in <em>Candida albicans</em> and <em>Candida dubliniensis</em>--an enigmatic developmental programme. Mycoses. 2007 Jan;50(1):1-12. (Review)
          </li>
        </ul>
        <h4>FILAMENTATION</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/17251042/" target="_blank" rel="noopener noreferrer">Stokes C, Moran GP, Spiering MJ, Cole GT, Coleman DC, Sullivan DJ</a>. Lower filamentation rates of <em>Candida dubliniensis</em> contribute to its lower virulence in comparison with <em>Candida albicans</em>. Fungal Genet Biol. 2007 Sep;44(9):920-31.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/21531874/" target="_blank" rel="noopener noreferrer">Chen YL, Brand A, Morrison EL, Silao FG, Bigol UG, Malbas FF Jr, Nett JE, Andes DR, Solis NV, Filler SG, Averette A, Heitman J</a>. Calcineurin controls drug tolerance, hyphal growth, and virulence in <em>Candida dubliniensis</em>. Eukaryot Cell. 2011 Jun;10(6):803-19.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/21706283/" target="_blank" rel="noopener noreferrer">Moyes DL, Murciano C, Runglall M, Kohli A, Islam A, Naglik JR</a>. Activation of MAPK/c-Fos induced responses in oral epithelial cells is specific to <em>Candida albicans</em> and <em>Candida dubliniensis</em> hyphae. Med Microbiol Immunol. 2012 Feb;201(1):93-101.
          </li>
        </ul>
        <h4>STRESS RESPONSE</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/17710623/" target="_blank" rel="noopener noreferrer">Tosello ME, Biasoli MS, Luque AG, Magaró HM, Krapp AR</a>. Oxidative stress response involving induction of protective enzymes in <em>Candida dubliniensis</em>. Med Mycol. 2007 Sep;45(6):535-40.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19239621/" target="_blank" rel="noopener noreferrer">Enjalbert B, Moran GP, Vaughan C, Yeomans T, Maccallum DM, Quinn J, Coleman DC, Brown AJ, Sullivan DJ</a>. Genome-wide gene expression profiling and a forward genetic screen show that differential expression of the sodium ion transporter Ena21 contributes to the differential tolerance of <em>Candida albicans</em> and <em>Candida dubliniensis</em> to osmotic stress. Mol Microbiol. 2009 Apr;72(1):216-28.
          </li>
        </ul>
        <h3 id="c-dubliniensis-virulence">Virulence</h3>
        <h4>HOST-PATHOGEN INTERACTIONS</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/20492535/" target="_blank" rel="noopener noreferrer">Koga-Ito CY, Komiyama EY, Martins CA, Vasconcellos TC, Jorge AO, Carvalho YR, do Prado RF, Balducci I</a>. Experimental systemic virulence of oral <em>Candida dubliniensis</em> isolates in comparison with <em>Candida albicans</em>, <em>Candida tropicalis</em> and <em>Candida krusei</em>. Mycoses. 2011 Sep;54(5):e278-85.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/16213674/" target="_blank" rel="noopener noreferrer">Sullivan DJ, Moran GP, Coleman DC</a>. <em>Candida dubliniensis</em>: ten years on. FEMS Microbiol Lett. 2005 Dec 1;253(1):9-17. (Review)
          </li>
        </ul>
        <h4>VIRULENCE FACTORS</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/9579058/" target="_blank" rel="noopener noreferrer">D Gilfillan G, Derek J S, Parkinson T, Coleman DC, Gow NAR</a>. <em>Candida dubliniensis</em>: Phylogeny and putative virulence factors. Microbiology (Reading). 1998 Apr;144 ( Pt 4):829-838.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/17251042/" target="_blank" rel="noopener noreferrer">Stokes C, Moran GP, Spiering MJ, Cole GT, Coleman DC, Sullivan DJ</a>. Lower filamentation rates of <em>Candida dubliniensis</em> contribute to its lower virulence in comparison with <em>Candida albicans</em>. Fungal Genet Biol. 2007 Sep;44(9):920-31.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/21531874/" target="_blank" rel="noopener noreferrer">Chen YL, Brand A, Morrison EL, Silao FG, Bigol UG, Malbas FF Jr, Nett JE, Andes DR, Solis NV, Filler SG, Averette A, Heitman J</a>. Calcineurin controls drug tolerance, hyphal growth, and virulence in <em>Candida dubliniensis</em>. Eukaryot Cell. 2011 Jun;10(6):803-19.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/12146754/" target="_blank" rel="noopener noreferrer">Vilela MM, Kamei K, Sano A, Tanaka R, Uno J, Takahashi I, Ito J, Yarita K, Miyaji M</a>. Pathogenicity and virulence of <em>Candida dubliniensis</em>: comparison with <em>C. albicans</em>. Med Mycol. 2002 Jun;40(3):249-57.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/39722735/" target="_blank" rel="noopener noreferrer">Gómez-Gaviria M, Baruch-Martínez DA, Mora-Montes HM</a>. Exploring the biology, virulence, and general aspects of <em>Candida dubliniensis</em>. Infect Drug Resist. 2024 Dec 21;17:5755-5773. (Review)
          </li>
        </ul>
        <h2 id="c-tropicalis"><em>C. tropicalis</em></h2>
        <h3 id="c-tropicalis-cell-biology">Cell Biology</h3>
        <h4>CELL WALL</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/26438063/" target="_blank" rel="noopener noreferrer">Kozik A, Karkowska-Kuleta J, Zajac D, Bochenska O, Kedracka-Krok S, Jankowska U, Rapala-Kozik M</a>. Fibronectin-, vitronectin- and laminin-binding proteins at the cell walls of <em>Candida parapsilosis</em> and <em>Candida tropicalis</em> pathogenic yeasts. BMC Microbiol. 2015 Oct 5;15:197.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/26636137/" target="_blank" rel="noopener noreferrer">Karkowska-Kuleta J, Zajac D, Bochenska O, Kozik A</a>. Surfaceome of pathogenic yeasts, <em>Candida parapsilosis</em> and <em>Candida tropicalis</em>, revealed with the use of cell surface shaving method and shotgun proteomic approach. Acta Biochim Pol. 2015;62(4):807-19.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/29718196/" target="_blank" rel="noopener noreferrer">Hernández-Chávez MJ, Franco B, Clavijo-Giraldo DM, Hernández NV, Estrada-Mata E, Mora-Montes HM</a>. Role of protein phosphomannosylation in the <em>Candida tropicalis</em>-macrophage interaction. FEMS Yeast Res. 2018 Aug 1;18(5).
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/36745535/" target="_blank" rel="noopener noreferrer">Ke CL, Lew SQ, Hsieh Y, Chang SC, Lin CH</a>. Convergent and divergent roles of the glucose-responsive kinase <em>SNF4</em> in <em>Candida tropicalis</em>. Virulence. 2023 Dec;14(1):2175914.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/40517912/" target="_blank" rel="noopener noreferrer">Souza CM, Paulo EA, Souza NAA, Santos MMD, Mantovani MS, Furlaneto-Maia L, Furlaneto MC</a>. Enhanced biofilm formation by <em>Candida tropicalis</em> morphotypes under host-mimicking conditions: Insights into cell wall modifications and gene expression. Microb Pathog. 2025 Jun 13:107807.
          </li>
        </ul>
        <h4>DRUG RESISTANCE MECHANISMS</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/23877676/" target="_blank" rel="noopener noreferrer">Forastiero A, Mesa-Arango AC, Alastruey-Izquierdo A, Alcazar-Fuoli L, Bernal-Martinez L, Pelaez T, Lopez JF, Grimalt JO, Gomez-Lopez A, Cuesta I, Zaragoza O, Mellado E</a>. <em>Candida tropicalis</em> antifungal cross-resistance is related to different azole target (Erg11p) modifications. Antimicrob Agents Chemother. 2013 Oct;57(10):4769-81.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/30472420/" target="_blank" rel="noopener noreferrer">Fan X, Xiao M, Zhang D, Huang JJ, Wang H, Hou X, Zhang L, Kong F, Chen SC, Tong ZH, Xu YC</a>. Molecular mechanisms of azole resistance in <em>Candida tropicalis</em> isolates causing invasive candidiasis in China. Clin Microbiol Infect. 2019 Jul;25(7):885-891.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/32339847/" target="_blank" rel="noopener noreferrer">Paul S, Singh S, Sharma D, Chakrabarti A, Rudramurthy SM, Ghosh AK</a>. Dynamics of in vitro development of azole resistance in <em>Candida tropicalis</em>. J Glob Antimicrob Resist. 2020 Sep;22:553-561.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/38102133/" target="_blank" rel="noopener noreferrer">an X, Dai RC, Zhang S, Geng YY, Kang M, Guo DW, Mei YN, Pan YH, Sun ZY, Xu YC, Gong J, Xiao M</a>. Tandem gene duplications contributed to high-level azole resistance in a rapidly expanding <em>Candida tropicalis</em> population. Nat Commun. 2023 Dec 15;14(1):8369.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/38767668/" target="_blank" rel="noopener noreferrer">Khamrai A, Paul S, Rudramurthy SM, Ghosh AK</a>. Carbon substrates promotes stress resistance and drug tolerance in clinical isolates of <em>Candida tropicalis</em>. Arch Microbiol. 2024 May 20;206(6):270.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/20413622/" target="_blank" rel="noopener noreferrer">Kothavade RJ, Kura MM, Valand AG, Panthaki MH</a>. <em>Candida tropicalis</em>: its prevalence, pathogenicity and increasing resistance to fluconazole. J Med Microbiol. 2010 Aug;59(Pt 8):873-880. (Review)
          </li>
        </ul>
        <h3 id="c-tropicalis-transformation-response">Transformation/Response</h3>
        <h4>BIOFILMS</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/16849719/" target="_blank" rel="noopener noreferrer">Al-Fattani MA, Douglas LJ</a>. Biofilm matrix of <em>Candida albicans</em> and <em>Candida tropicalis</em>: chemical composition and role in drug resistance. J Med Microbiol. 2006 Aug;55(Pt 8):999-1008.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/24612417/" target="_blank" rel="noopener noreferrer">Jones SK Jr, Hirakawa MP, Bennett RJ</a>. Sexual biofilm formation in <em>Candida tropicalis</em> opaque cells. Mol Microbiol. 2014 Apr;92(2):383-98.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/32562809/" target="_blank" rel="noopener noreferrer">Moralez AP, Perini HF, Paulo EA, Furlaneto-Maia L, Furlaneto MC</a>. Effect of phenotypic switching on biofilm traits in <em>Candida tropicalis</em>. Microb Pathog. 2020 Dec;149:104346.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/33603717/" target="_blank" rel="noopener noreferrer">da Silva MA, Baronetti JL, Páez PL, Paraje MG</a>. Oxidative imbalance in <em>Candida tropicalis</em> biofilms and its relation with persister cells. Front Microbiol. 2021 Feb 2;11:598834.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/36061861/" target="_blank" rel="noopener noreferrer">Atiencia-Carrera MB, Cabezas-Mera FS, Vizuete K, Debut A, Tejera E, Machado A</a>. Evaluation of the biofilm life cycle between <em>Candida albicans</em> and <em>Candida tropicalis</em>. Front Cell Infect Microbiol. 2022 Aug 18;12:953168.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/40517912/" target="_blank" rel="noopener noreferrer">Souza CM, Paulo EA, Souza NAA, Santos MMD, Mantovani MS, Furlaneto-Maia L, Furlaneto MC</a>. Enhanced biofilm formation by <em>Candida tropicalis</em> morphotypes under host-mimicking conditions: Insights into cell wall modifications and gene expression. Microb Pathog. 2025 Jun 13:107807.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/36809069/" target="_blank" rel="noopener noreferrer">de Souza CM, Dos Santos MM, Furlaneto-Maia L, Furlaneto MC</a>. Adhesion and biofilm formation by the opportunistic pathogen <em>Candida tropicalis</em>: what do we know? Can J Microbiol. 2023 Jun 1;69(6):207-218. (Review)
          </li>
        </ul>
        <h4>ADHESION</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/8408636/" target="_blank" rel="noopener noreferrer">Bendel CM, Hostetter MK</a>. Distinct mechanisms of epithelial adhesion for <em>Candida albicans</em> and <em>Candida tropicalis</em>. Identification of the participating ligands and development of inhibitory peptides. J Clin Invest. 1993 Oct;92(4):1840-9.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/36809069/" target="_blank" rel="noopener noreferrer">de Souza CM, Dos Santos MM, Furlaneto-Maia L, Furlaneto MC</a>. Adhesion and biofilm formation by the opportunistic pathogen <em>Candida tropicalis</em>: what do we know? Can J Microbiol. 2023 Jun 1;69(6):207-218. (Review)
          </li>
        </ul>
        <h4>MATING AND MATING LOCI</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/22158989/" target="_blank" rel="noopener noreferrer">Porman AM, Alby K, Hirakawa MP, Bennett RJ</a>. Discovery of a phenotypic switch regulating sexual mating in the opportunistic fungal pathogen <em>Candida tropicalis</em>. Proc Natl Acad Sci U S A. 2011 Dec 27;108(52):21158-63.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/22544905/" target="_blank" rel="noopener noreferrer">Xie J, Du H, Guan G, Tong Y, Kourkoumpetis TK, Zhang L, Bai FY, Huang G</a>. N-acetylglucosamine induces white-to-opaque switching and mating in <em>Candida tropicalis</em>, providing new insights into adaptation and fungal sexual evolution. Eukaryot Cell. 2012 Jun;11(6):773-82.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/23555286/" target="_blank" rel="noopener noreferrer">Porman AM, Hirakawa MP, Jones SK, Wang N, Bennett RJ</a>. MTL-independent phenotypic switching in <em>Candida tropicalis</em> and a dual role for Wor1 in regulating switching and filamentation. Porman AM, Hirakawa MP, Jones SK, Wang N, Bennett RJ.PLoS Genet. 2013 Mar;9(3):e1003369.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/24123269/" target="_blank" rel="noopener noreferrer">Seervai RN, Jones SK Jr, Hirakawa MP, Porman AM, Bennett RJ</a>. Parasexuality and ploidy change in <em>Candida tropicalis</em>. Eukaryot Cell. 2013 Dec;12(12):1629-40.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/24612417/" target="_blank" rel="noopener noreferrer">Jones SK Jr, Hirakawa MP, Bennett RJ</a>. Sexual biofilm formation in <em>Candida tropicalis</em> opaque cells. Mol Microbiol. 2014 Apr;92(2):383-98.
          </li>
          <li>
            [med.ncbi.nlm.nih.gov/27246518/ Zhang Y, Tao L, Zhang Q, Guan G, Nobile CJ, Zheng Q, Ding X, Huang G]. The gray phenotype and tristable phenotypic transitions in the human fungal pathogen <em>Candida tropicalis</em>. Fungal Genet Biol. 2016 Aug;93:10-6.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/29030879/" target="_blank" rel="noopener noreferrer">Zheng Q, Zhang Q, Bing J, Ding X, Huang G</a>. Environmental and genetic regulation of white-opaque switching in <em>Candida tropicalis</em>. Mol Microbiol. 2017 Dec;106(6):999-1017.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/29734333/" target="_blank" rel="noopener noreferrer">Du H, Zheng Q, Bing J, Bennett RJ, Huang G</a>. A coupled process of same- and opposite-sex mating generates polyploidy and genetic diversity in <em>Candida tropicalis</em>. PLoS Genet. 2018 May 7;14(5):e1007377.
          </li>
        </ul>
        <h4>FILAMENTATION</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/23555286/" target="_blank" rel="noopener noreferrer">Porman AM, Hirakawa MP, Jones SK, Wang N, Bennett RJ</a>. MTL-independent phenotypic switching in <em>Candida tropicalis</em> and a dual role for Wor1 in regulating switching and filamentation. Porman AM, Hirakawa MP, Jones SK, Wang N, Bennett RJ.PLoS Genet. 2013 Mar;9(3):e1003369.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/24442892/" target="_blank" rel="noopener noreferrer">Chen YL, Yu SJ, Huang HY, Chang YL, Lehman VN, Silao FG, Bigol UG, Bungay AA, Averette A, Heitman J</a>. Calcineurin controls hyphal growth, virulence, and drug tolerance of <em>Candida tropicalis</em>. Eukaryot Cell. 2014 Jul;13(7):844-54.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/26466925/" target="_blank" rel="noopener noreferrer">Zhang Q, Tao L, Guan G, Yue H, Liang W, Cao C, Dai Y, Huang G</a>. Regulation of filamentation in the human fungal pathogen <em>Candida tropicalis</em>. Mol Microbiol. 2016 Feb;99(3):528-45.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/27851809/" target="_blank" rel="noopener noreferrer">Wu Y, Li YH, Yu SB, Li WG, Liu XS, Zhao L, Lu JX</a>. A genome-wide transcriptional analysis of yeast-hyphal transition in <em>Candida tropicalis</em> by RNA-Seq. PLoS One. 2016 Nov 16;11(11):e0166645.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/27664724/" target="_blank" rel="noopener noreferrer">Jiang C, Li Z, Zhang L, Tian Y, Dong D, Peng Y</a>. Significance of hyphae formation in virulence of <em>Candida tropicalis</em> and transcriptomic analysis of hyphal cells. Microbiol Res. 2016 Nov;192:65-72.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/32562809/" target="_blank" rel="noopener noreferrer">Moralez AP, Perini HF, Paulo EA, Furlaneto-Maia L, Furlaneto MC</a>. Effect of phenotypic switching on biofilm traits in <em>Candida tropicalis</em>. Microb Pathog. 2020 Dec;149:104346.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/40216406/" target="_blank" rel="noopener noreferrer">Perini HF, de Souza CM, Paulo EA, Tomiotto-Pellissier F, Pavanelli WR, Furlaneto-Maia L, Furlaneto MC</a>. Role of phenotypic switching in the adaptive response of <em>Candida tropicalis</em> to hyperosmotic stress. Med Mycol. 2025 Apr 2;63(4):myaf035.
          </li>
        </ul>
        <h4>STRESS RESPONSE</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/25384372/" target="_blank" rel="noopener noreferrer">Ilyas S, Rehman A</a>. Oxidative stress, glutathione level and antioxidant response to heavy metals in multi-resistant pathogen, <em>Candida tropicalis</em>. Environ Monit Assess. 2015 Jan;187(1):4115.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/28920150/" target="_blank" rel="noopener noreferrer">Khan Z, Rehman A, Nisar MA, Zafar S, Hussain SZ, Zerr I, Hussain I, Waseem M, Arif M</a>. Molecular basis of Cd+2 stress response in <em>Candida tropicalis</em>. Appl Microbiol Biotechnol. 2017 Oct;101(20):7715-7728.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/38767668/" target="_blank" rel="noopener noreferrer">Khamrai A, Paul S, Rudramurthy SM, Ghosh AK</a>. Carbon substrates promotes stress resistance and drug tolerance in clinical isolates of <em>Candida tropicalis</em>. Arch Microbiol. 2024 May 20;206(6):270.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/40216406/" target="_blank" rel="noopener noreferrer">Perini HF, de Souza CM, Paulo EA, Tomiotto-Pellissier F, Pavanelli WR, Furlaneto-Maia L, Furlaneto MC</a>. Role of phenotypic switching in the adaptive response of <em>Candida tropicalis</em> to hyperosmotic stress. Med Mycol. 2025 Apr 2;63(4):myaf035.
          </li>
        </ul>
        <h3 id="c-tropicalis-virulence">Virulence</h3>
        <h4>HOST-PATHOGEN INTERACTIONS</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/29718196/" target="_blank" rel="noopener noreferrer">Hernández-Chávez MJ, Franco B, Clavijo-Giraldo DM, Hernández NV, Estrada-Mata E, Mora-Montes HM</a>. Role of protein phosphomannosylation in the <em>Candida tropicalis</em>-macrophage interaction. FEMS Yeast Res. 2018 Aug 1;18(5).
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/31467372/" target="_blank" rel="noopener noreferrer">Perini HF, Moralez ATP, Almeida RSC, Panagio LA, Junior AOG, Barcellos FG, Furlaneto-Maia L, Furlaneto MC</a>. Phenotypic switching in <em>Candida tropicalis</em> alters host-pathogen interactions in a <em>Galleria mellonella</em> infection model. Sci Rep. 2019 Aug 29;9(1):12555.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/31849889/" target="_blank" rel="noopener noreferrer">Hernández-Chávez MJ, Clavijo-Giraldo DM, Novák Á, Lozoya-Pérez NE, Martínez-Álvarez JA, Salinas-Marín R, Hernández NV, Martínez-Duncker I, Gácser A, Mora-Montes HM</a>. Role of protein mannosylation in the <em>Candida tropicalis</em>-host interaction. Front Microbiol. 2019 Nov 28;10:2743.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/39057387/" target="_blank" rel="noopener noreferrer">Hernández-Chávez MJ, Martínez-Duncker I, Clavijo-Giraldo DM, López-Ramirez LA, Mora-Montes HM</a>. <em>Candida tropicalis PMT2</em> is a dispensable gene for viability but required for proper interaction with the host. J Fungi (Basel). 2024 Jul 20;10(7):502.
          </li>
        </ul>
        <h4>VIRULENCE FACTORS</h4>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/24442892/" target="_blank" rel="noopener noreferrer">Chen YL, Yu SJ, Huang HY, Chang YL, Lehman VN, Silao FG, Bigol UG, Bungay AA, Averette A, Heitman J</a>. Calcineurin controls hyphal growth, virulence, and drug tolerance of <em>Candida tropicalis</em>. Eukaryot Cell. 2014 Jul;13(7):844-54.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/27664724/" target="_blank" rel="noopener noreferrer">Jiang C, Li Z, Zhang L, Tian Y, Dong D, Peng Y</a>. Significance of hyphae formation in virulence of <em>Candida tropicalis</em> and transcriptomic analysis of hyphal cells. Microbiol Res. 2016 Nov;192:65-72.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/36745535/" target="_blank" rel="noopener noreferrer">Ke CL, Lew SQ, Hsieh Y, Chang SC, Lin CH</a>. Convergent and divergent roles of the glucose-responsive kinase <em>SNF4</em> in <em>Candida tropicalis</em>. Virulence. 2023 Dec;14(1):2175914.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/22037823/" target="_blank" rel="noopener noreferrer">Negri M, Silva S, Henriques M, Oliveira R</a>. Insights into <em>Candida tropicalis</em> nosocomial infections and virulence factors. Eur J Clin Microbiol Infect Dis. 2012 Jul;31(7):1399-412.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/31544690/" target="_blank" rel="noopener noreferrer">Staniszewska M</a>. Virulence factors in <em>Candida</em> species. Curr Protein Pept Sci. 2020;21(3):313-323. (Review)
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/37505455/" target="_blank" rel="noopener noreferrer">Dos Santos MM, Ishida K</a>. We need to talk about <em>Candida tropicalis</em>: Virulence factors and survival mechanisms. Med Mycol. 2023 Aug 2;61(8):myad075. (Review)
          </li>
        </ul>
      </div>
    </div>
  );
}

export default SeminalPapersPage;
