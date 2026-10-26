import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';
import './PathogenicYeastComparison.css';

// Converted from the CGD Public Wiki (Datasets Available in CGD).
function JBrowseDatasetsPage() {
  return (
    <div className="info-page pyc-page">
      <div className="info-page-content" id="top">
        <p className="pyc-breadcrumb">
          <Link to="/pathogenic-yeast-comparison">Pathogenic Yeast Comparison</Link>
        </p>
        <h1>Datasets Available in CGD</h1>
        <hr />

        <p><strong>NOTE:</strong> To access a specific dataset in JBrowse, open the track selector on the JBrowse page for the species and choose the dataset by first author name.</p>
        <h2 id="c-albicans-in-jbrowse"><em>C. albicans</em> in JBrowse</h2>
        <p><a href="/jbrowse2/?assembly=C_albicans_SC5314&loc=Ca22chr1A_C_albicans_SC5314:120520..134789" target="_blank" rel="noopener noreferrer">View in JBrowse</a></p>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/20810668/" target="_blank" rel="noopener noreferrer">Bruno et al., 2010</a>. Comprehensive annotation of the transcriptome of the human fungal pathogen <em>Candida albicans</em> using RNA-seq. Genome Res. 2010 Oct;20(10):1451-8.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19465905/" target="_blank" rel="noopener noreferrer">Butler et al., 2009</a>. Evolution of pathogenicity and sexual reproduction in eight <em>Candida</em> genomes. Nature. 2009 Jun 4;459(7247):657-62.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/23572557/" target="_blank" rel="noopener noreferrer">Desai et al., 2013</a>. Regulatory role of glycerol in <em>Candida albicans</em> biofilm formation. mBio. 2013 Apr 9;4(2):e00637-12.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/26772749/" target="_blank" rel="noopener noreferrer">Lohse and Johnson, 2016</a>. Identification and characterization of <em>Wor4</em>, a new transcriptional regulator of white-opaque switching. G3 (Bethesda). 2016 Jan 15;6(3):721-9
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/24025428/" target="_blank" rel="noopener noreferrer">Muzzy et al., 2013</a>. Assembly of a phased diploid <em>Candida albicans</em> genome facilitates allele-specific measurements and provides a simple model for repeat and indel structure. Genome Biol. 2013;14(9):R97.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/28874114/" target="_blank" rel="noopener noreferrer">Niemec et al., 2017</a>. Dual transcriptome of the immediate neutrophil and <em>Candida albicans</em> interplay. BMC Genomics. 2017 Sep 6;18(1):696.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/30377286/" target="_blank" rel="noopener noreferrer">Segal et al., 2018</a>. Gene essentiality analyzed by in vivo transposon mutagenesis and machine learning in a stable haploid isolate of <em>Candida albicans</em>. mBio. 2018 Oct 30;9(5):e02048-18.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/23555196/" target="_blank" rel="noopener noreferrer">Xie et al., 2013</a>. White-opaque switching in natural <em>MTLa/α</em> isolates of <em>Candida albicans</em>: evolutionary implications for roles in host adaptation, pathogenesis, and sex. PLoS Biol. 2013;11(3):e1001525.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/37737633/" target="_blank" rel="noopener noreferrer">Glazier et al., 2023</a>. The <em>Candida albicans</em> reference strain SC5314 contains a rare, dominant allele of the transcription factor <em>Rob1</em> that modulates filamentation, biofilm formation, and oral commensalism. mBio. 2023 Oct 31;14(5):e0152123.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/31263212/" target="_blank" rel="noopener noreferrer">Shivarathri et al., 2019</a>. The fungal histone acetyl transferase <em>Gcn5</em> controls virulence of the human pathogen <em>Candida albicans</em> through multiple pathways. Sci Rep. 2019 Jul 1;9(1):9445.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/38905306/" target="_blank" rel="noopener noreferrer">Rai, et al., 2024</a>. Metabolic reprogramming during <em>Candida albicans</em> planktonic-biofilm transition is modulated by the transcription factors <em>Zcf15</em> and <em>Zcf26</em>. PLoS Biol. 2024 Jun 21;22(6):e3002693.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/38921373/" target="_blank" rel="noopener noreferrer">Zhang, et al. 2024</a>. DNA damage checkpoints govern global gene transcription and exhibit species-specific regulation on <em>HOF1</em> in <em>Candida albicans</em>. J Fungi (Basel). 2024 May 29;10(6):387.
          </li>
        </ul>
        <h2 id="c-parapsilosis-in-jbrowse"><em>C. parapsilosis</em> in JBrowse</h2>
        <p><a href="/jbrowse2/?assembly=C_parapsilosis_CDC317&loc=Contig005569_C_parapsilosis_CDC317:2164961..2179340" target="_blank" rel="noopener noreferrer">View in JBrowse</a></p>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/23895281/" target="_blank" rel="noopener noreferrer">Connolly, et al., 2013</a>. The APSES transcription factor <em>Efg1</em> is a global regulator that controls morphogenesis and biofilm formation in <em>Candida parapsilosis</em>. Mol Microbiol. 2013 Oct;90(1):36-53.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/22192698/" target="_blank" rel="noopener noreferrer">Guida et al., 2011</a>. Using RNA-seq to determine the transcriptional landscape and the hypoxic response of the pathogenic yeast <em>Candida parapsilosis</em>. BMC Genomics. 2011 Dec 22:12:628.
          </li>
        </ul>
        <h2 id="c-dubliniensis-in-jbrowse"><em>C. dubliniensis</em> in JBrowse</h2>
        <p><a href="/jbrowse2/?assembly=C_dubliniensis_CD36&loc=Chr1_C_dubliniensis_CD36:131099..145478" target="_blank" rel="noopener noreferrer">View in JBrowse</a></p>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/23547856/" target="_blank" rel="noopener noreferrer">Grumaz et al., 2013</a>. Species and condition specific adaptation of the transcriptional landscapes in <em>Candida albicans</em> and <em>Candida dubliniensis</em>. BMC Genomics. 2013 Apr 2:14:212.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/33723044/" target="_blank" rel="noopener noreferrer">Singh-Babakh et al., 2021</a>. Lineage-specific selection and the evolution of virulence in the <em>Candida</em> clade. Proc Natl Acad Sci U S A. 2021 Mar 23;118(12):e2016818118.
          </li>
        </ul>
        <h2 id="c-glabrata-in-jbrowse"><em>C. glabrata</em> in JBrowse</h2>
        <p><a href="/jbrowse2/?assembly=C_glabrata_CBS138&loc=ChrL_C_glabrata_CBS138:1176133..1190402" target="_blank" rel="noopener noreferrer">View in JBrowse</a></p>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/34591857/" target="_blank" rel="noopener noreferrer">Vu, et al., 2021</a>. The <em>Candida glabrata Upc2A</em> transcription factor is a global regulator of antifungal drug resistance pathways. PLoS Genet. 2021 Sep 30;17(9):e1009582.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/37891489/" target="_blank" rel="noopener noreferrer">Ni, et al., 2023</a>. The regulatory subunits of CK2 complex mediate DNA damage response and virulence in <em>Candida glabrata</em>. BMC Microbiol. 2023 Oct 28;23(1):317.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/38632999/" target="_blank" rel="noopener noreferrer">Kumar, et al., 2024</a>. SWI/SNF complex-mediated chromatin remodeling in <em>Candida glabrata</em>  promotes immune evasion. iScience. 2024 Mar 27;27(4):109607.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/36108742/" target="_blank" rel="noopener noreferrer">Bhakt et al., 2022</a>. The SET-domain protein <em>CgSet4</em> negatively regulates antifungal drug resistance via the ergosterol biosynthesis transcriptional regulator <em>CgUpc2a</em>. J Biol Chem. 2022 Oct;298(10):102485.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/25586221/" target="_blank" rel="noopener noreferrer">Linde et al., 2015</a>. Defining the transcriptomic landscape of <em>Candida glabrata</em> by RNA-Seq. Nucleic Acids Res. 2015 Feb 18;43(3):1392-406.
          </li>
        </ul>
        <h2 id="c-auris-in-jbrowse"><em>C. auris</em> in JBrowse</h2>
        <p><a href="/jbrowse2/?assembly=C_auris_B8441" target="_blank" rel="noopener noreferrer">View in JBrowse</a></p>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/35412372/" target="_blank" rel="noopener noreferrer">Simm, et al., 2022</a>. Disruption of iron homeostasis and mitochondrial metabolism are promising targets to inhibit <em>Candida auris</em>. Microbiol Spectr 2022 Apr 27;10(2):e0010022.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/34643421/" target="_blank" rel="noopener noreferrer">Jakab, et al., 2021</a>. Transcriptional profiling of the <em>Candida auris</em> response to exogenous farnesol exposure mSphere. 2021 Sep-Oct; 6(5): e00710-21.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/35473297/" target="_blank" rel="noopener noreferrer">Biermann and Hogan, 2022</a> Transcriptional response of <em>Candida auris</em> to the <em>Mrr1</em> inducers methylglyoxal and benomyl. mSphere 2022 Jun 29;7(3):e0012422.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/37532970/" target="_blank" rel="noopener noreferrer">Balla, et al., 2023</a>. Total transcriptome analysis of <em>Candida auris</em> planktonic cells exposed to tyrosol. AMB Express 2023 Aug 2;13(1):81.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/33937102/" target="_blank" rel="noopener noreferrer">Jenull et al., 2021</a>. Transcriptome signatures predict phenotypic variations of <em>Candida auris</em>. Front Cell Infect Microbiol 2021 Apr 14:11:662563.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/38014938/" target="_blank" rel="noopener noreferrer">Chow et al., 2023</a>. The transcription factor <em>Rpn4</em> activates its own transcription and induces efflux pump expression to confer fluconazole resistance in <em>Candida auris</em>. mBio 2023 Nov 28;14(6):e0268823
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/35652307/" target="_blank" rel="noopener noreferrer">Shivarathri, et al., 2022</a>. Comparative transcriptomics reveal possible mechanisms of amphotericin B resistance in <em>Candida auris</em>. Antimicrob Agents Chemother. 2022 Jun 21;66(6):e0227621.
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/38466738/" target="_blank" rel="noopener noreferrer">Pelletier, et al., 2024</a>. <em>Candida auris</em> undergoes adhesin-dependent and -independent cellular aggregation. PLoS Pathog. 2024 Mar 11;20(3):e1012076
          </li>
        </ul>
      </div>
    </div>
  );
}

export default JBrowseDatasetsPage;
