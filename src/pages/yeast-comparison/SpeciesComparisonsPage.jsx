import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';
import './PathogenicYeastComparison.css';

// Converted from the CGD Public Wiki (Species Comparisons by Topic).
function SpeciesComparisonsPage() {
  return (
    <div className="info-page pyc-page">
      <div className="info-page-content" id="top">
        <p className="pyc-breadcrumb">
          <Link to="/pathogenic-yeast-comparison">Pathogenic Yeast Comparison</Link>
        </p>
        <h1>Species Comparisons by Topic</h1>
        <hr />

        <ul className="pyc-toc">
          <li><a href="#ploidy">Ploidy</a></li>
          <li><a href="#cug-codon-usage">CUG codon usage</a></li>
          <li><a href="#mitochondrial-genome">Mitochondrial genome</a></li>
          <li><a href="#filamentous-growth">Filamentous growth</a></li>
          <li><a href="#biofilms">Biofilms</a></li>
          <li><a href="#pathogenicity">Pathogenicity</a></li>
          <li><a href="#mating-reproduction">Mating/Reproduction</a></li>
          <li><a href="#drug-resistance">Drug resistance</a></li>
          <li><a href="#respiratory-metabolism">Respiratory metabolism</a></li>
          <li><a href="#virulence-factors">Virulence Factors</a></li>
        </ul>
        <h2 id="ploidy">Ploidy</h2>
        <p><strong>Notes:</strong> <em>Candida albicans</em> and its close relatives are all on a single phylogenetic branch characterized by diploidy, while the two typical haploid species (<em>C. glabrata</em> and <em>C. auris</em>) are on distinct, distantly related branches for which haploidy is the standard form. Note that the two haploid pathogens are more prone to pleiotropic resistance because only a single mutation is needed in the haploid genome to generate stable change.</p>
        <p><strong>References:</strong></p>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19465905/" target="_blank" rel="noopener noreferrer">Butler et al., 2009</a>
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/30559369/" target="_blank" rel="noopener noreferrer">Munoz et al., 2018</a>
          </li>
        </ul>
        <h3 id="ploidy-typical-diploids">Typical diploids</h3>
        <ul>
          <li>
            <em>C. albicans</em>
          </li>
          <li>
            <em>C. dubliniensis</em>
          </li>
          <li>
            <em>C. parapsilosis</em>
          </li>
          <li>
            <em>C. tropicalis</em>
          </li>
        </ul>
        <h3 id="ploidy-typical-haploids">Typical haploids</h3>
        <ul>
          <li>
            <em>C. glabrata</em>
          </li>
          <li>
            <em>C. auris</em>
          </li>
        </ul>
        <figure className="pyc-figure">
          <img src="/images/pyc/phylogeny2.png" alt="Phylogeny2" />
        </figure>
        <p>From <a href="https://www.nature.com/articles/s41467-018-07779-6/figures/3" target="_blank" rel="noopener noreferrer">Munoz et al., 2018</a></p>
        <h2 id="cug-codon-usage">CUG codon usage</h2>
        <p><strong>Notes:</strong> Yeasts of the <em>Candida</em> clade (as opposed to <em>C. glabrata</em>, also known as <em>Nakaseomyces glabratus</em>, which is on the <em>Saccharomyces</em> clade) have undergone an evolutionary reassignment of the CUG codon from leucine to serine. This is due to a novel serine-tRNA (ser-tRNACAG) that contains a guanosine at position 33, a position that is occupied by a pyrimidine (uridine) in nearly all other tRNAs.</p>
        <p><strong>References:</strong></p>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/2506450/" target="_blank" rel="noopener noreferrer">Kawaguchi et al., 1989</a>
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/7784200/" target="_blank" rel="noopener noreferrer">Santos and Tuite, 1995</a>
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/8890179/" target="_blank" rel="noopener noreferrer">Santos et al., 1996</a>
          </li>
          <li>
            <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12471149/" target="_blank" rel="noopener noreferrer">Čermáková and Heidingsfeld, 2025</a>
          </li>
        </ul>
        <h3 id="cug-codon-usage-reassigned-cug-as-serine">Reassigned CUG as serine</h3>
        <ul>
          <li>
            <em>C. albicans</em>
          </li>
          <li>
            <em>C. dubliniensis</em>
          </li>
          <li>
            <em>C. parapsilosis</em>
          </li>
          <li>
            <em>C. tropicalis</em>
          </li>
          <li>
            <em>C. auris</em>
          </li>
        </ul>
        <h3 id="cug-codon-usage-standard-cug-as-leucine">Standard CUG as leucine</h3>
        <ul>
          <li>
            <em>C. glabrata</em>
          </li>
        </ul>
        <figure className="pyc-figure">
          <img src="/images/pyc/phylogeny3.png" alt="Phylogeny3" />
        </figure>
        <p>From <a href="https://pubmed.ncbi.nlm.nih.gov/19465905/" target="_blank" rel="noopener noreferrer">Butler et al., 2009</a></p>
        <h2 id="mitochondrial-genome">Mitochondrial genome</h2>
        <p><strong>Notes:</strong> <em>Candida parapsilosis</em> is unusual in having a mitochondrial genome that is linear and capped by telomeric ends. The close relatives of this species, <em>C. orthopsilosis</em> and <em>C. metapsilosis</em> and <em>Candida subhashii</em>, have a mix of circular and linear mitochondrial genomes. The other <em>Candida</em> spp. are exclusively circular.</p>
        <p><strong>References:</strong></p>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/16684995/" target="_blank" rel="noopener noreferrer">Kosa et al., 2006</a>
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/34129020/" target="_blank" rel="noopener noreferrer">Mixão et al., 2021</a>
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/11071936/" target="_blank" rel="noopener noreferrer">Tomaska et al., 2000</a>
          </li>
        </ul>
        <h3 id="mitochondrial-genome-exclusively-linear">Exclusively linear</h3>
        <ul>
          <li>
            <em>C. parapsilosis</em>
          </li>
        </ul>
        <h3 id="mitochondrial-genome-mix-of-linear-and-circular">Mix of linear and circular</h3>
        <ul>
          <li>
            <em>C. orthopsilosis</em>
          </li>
          <li>
            <em>C. metapsilosis</em>
          </li>
          <li>
            <em>C. subhashii</em>
          </li>
        </ul>
        <h3 id="mitochondrial-genome-exclusively-circular">Exclusively circular</h3>
        <ul>
          <li>
            <em>C. albicans</em>
          </li>
          <li>
            <em>C. dubliniensis</em>
          </li>
          <li>
            <em>C. tropicalis</em>
          </li>
          <li>
            <em>C. auris</em>
          </li>
          <li>
            <em>C. glabrata</em>
          </li>
        </ul>
        <figure className="pyc-figure">
          <img src="/images/pyc/phylogeny-mito.png" alt="Phylogeny .Mito" />
        </figure>
        <p>From <a href="https://pubmed.ncbi.nlm.nih.gov/16684995/" target="_blank" rel="noopener noreferrer">Kosa et al., 2006</a></p>
        <h2 id="filamentous-growth">Filamentous growth</h2>
        <p><strong>Notes:</strong> <em>Candida spp.</em> vary in filamentous growth as a means of infection/invasion. <em>C. albicans</em> and its close relative <em>C. dubliniensis</em> use true hyphae to penetrate tissues, while <em>C. parapsilosis</em> and <em>C. tropicalis</em> can penetrate tissues by means of pseudohyphae (lacking septa). In contrast, <em>C. glabrata</em> almost never forms filaments and infects in the yeast form. <em>C. auris </em> is an outlier in that it infects both by pseudohyphae and in the yeast form.</p>
        <p>Note that the classifications below represent the typical forms for each species, but exceptions are not unusual.</p>
        <p><strong>References:</strong></p>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/35247799/" target="_blank" rel="noopener noreferrer">Arita et al., 2022</a> (review)
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/30823468/" target="_blank" rel="noopener noreferrer">Kornitzer, 2019</a> (review)
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/21569057/" target="_blank" rel="noopener noreferrer">Silva et al., 2012</a> (review)
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/36675901/" target="_blank" rel="noopener noreferrer">Branco et al., 2023</a> (review)
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/38904381/" target="_blank" rel="noopener noreferrer">Bryak et al., 2024</a>
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/38895705/" target="_blank" rel="noopener noreferrer">Groenewald et al., 2023</a>
          </li>
        </ul>
        <h3 id="filamentous-growth-invasive-infectious-by-true-hyphae">Invasive/infectious by true hyphae</h3>
        <ul>
          <li>
            <em>C. albicans</em>
          </li>
          <li>
            <em>C. dubliniensis</em>
          </li>
        </ul>
        <h3 id="filamentous-growth-invasive-infectious-pseudohyphal-growth-lacking-septa">Invasive/infectious pseudohyphal growth (lacking septa)</h3>
        <ul>
          <li>
            <em>C. parapsilosis</em>
          </li>
          <li>
            <em>C. tropicalis</em>
          </li>
          <li>
            <em>C. auris</em>
          </li>
        </ul>
        <h3 id="filamentous-growth-invasive-infectious-as-yeast-form">Invasive/infectious as yeast form</h3>
        <ul>
          <li>
            <em>C. glabrata</em>
          </li>
          <li>
            <em>C. auris</em>
          </li>
        </ul>
        <h2 id="biofilms">Biofilms</h2>
        <p><strong>Notes:</strong> <em>Candida</em> species all form biofilms but not in the same manner. Biofilms all begin as adherence to a surface and then excretion of an extracellular matrix composed mainly of proteins, carbohydrates, and lipids. All species employ extracellular vesicles to facilitate excretion. They differ in the types of cells that inhabit the biofilm environment.</p>
        <p><strong>References:</strong></p>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/36095193/" target="_blank" rel="noopener noreferrer">Zarnowski et al., 2022</a>
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/36436326/" target="_blank" rel="noopener noreferrer">Kaur and Nobile, 2023</a>
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/26432632/" target="_blank" rel="noopener noreferrer">Pujol et al., 2015</a>
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19888800/" target="_blank" rel="noopener noreferrer">Silva et al., 2009</a>
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/31132181/" target="_blank" rel="noopener noreferrer">Singh et al., 2019</a>
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/39297645/" target="_blank" rel="noopener noreferrer">Louvet et al., 2024</a>
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/21569057/" target="_blank" rel="noopener noreferrer">Silva et al., 2012</a> (review)
          </li>
        </ul>
        <h3 id="biofilms-biofilms-comprising-primarily-filamentous-cells">Biofilms comprising primarily filamentous cells</h3>
        <ul>
          <li>
            <em>C. albicans</em>
          </li>
          <li>
            <em>C. dubliniensis</em> (but mature biofilms are composed predominately of pseudohyphae rather than true hyphae (26432632)
          </li>
        </ul>
        <h3 id="biofilms-biofilms-comprising-mixed-yeast-and-pseudohyphae">Biofilms comprising mixed yeast and pseudohyphae</h3>
        <ul>
          <li>
            <em>C. tropicalis</em>
          </li>
          <li>
            <em>C. parapsilosis</em>
          </li>
          <li>
            <em>C. auris</em>
          </li>
        </ul>
        <h3 id="biofilms-biofilms-comprising-primarily-yeast-cells">Biofilms comprising primarily yeast cells</h3>
        <ul>
          <li>
            <em>C. glabrata</em>
          </li>
        </ul>
        <h2 id="pathogenicity">Pathogenicity</h2>
        <p><strong>Notes:</strong> <em>Candida</em> species show heterogeneity in pathogenicity, where each species has a unique profile. See descriptions below.</p>
        <p><strong>References:</strong></p>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/19465905/" target="_blank" rel="noopener noreferrer">Butler et al., 2009</a>
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/31337723/" target="_blank" rel="noopener noreferrer">Casadevall et al., 2019</a>
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/21569057/" target="_blank" rel="noopener noreferrer">Silva et al., 2012</a> (review)
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/36675901/" target="_blank" rel="noopener noreferrer">Branco et al., 2023</a> (review)
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/26920876/" target="_blank" rel="noopener noreferrer">Höfs et al., 2016</a> (review)
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/30814115/" target="_blank" rel="noopener noreferrer">Tóth et al., 2019</a> (review)
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/29734333/" target="_blank" rel="noopener noreferrer">Du et al., 2018</a>
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/26801081/" target="_blank" rel="noopener noreferrer">Kołaczkowska and Kołaczkowski, 2016</a> (review)
          </li>
        </ul>
        <h3 id="pathogenicity-c-albicans"><em>C. albicans</em></h3>
        <ul>
          <li>
            Exclusively commensal, <em>C. albicans</em> is fully adapted to the mammalian host, characterized by high thermotolerance and an advance ability to respond to changes in the body
          </li>
          <li>
            While non-albicans species are increasingly the cause of disease, <em>C. albicans</em> remains the most prevalent pathogen causing candidiasis
          </li>
          <li>
            Virulence properties are extensive, including the ability to (1) switch from the yeast form to the hyphal form; (2) secrete adhesins, biofilm matrix components, proteases, and hydrolytic enzymes; (4) undergo phenotypic change to allow sexual reproduction; (5) adapt metabolic processes to available nutrients; and (6) evade immune responses by various means
          </li>
        </ul>
        <h3 id="pathogenicity-c-parapsilosis"><em>C. parapsilosis</em></h3>
        <ul>
          <li>
            <em>C. parapsilosis</em> is the second or third most commonly isolated pathogenic species in several parts of the world
          </li>
          <li>
            Can live either commensally or freely in a wide range of ecological niches
          </li>
          <li>
            Has an enhanced ability to adhere to inert surfaces and is thus a particular problem in neonates, transplant recipients, and patients receiving parenteral nutrition
          </li>
        </ul>
        <h3 id="pathogenicity-c-tropicalis"><em>C. tropicalis</em></h3>
        <ul>
          <li>
            Can live either commensally or freely in diverse environments
          </li>
          <li>
            More commonly associated with neutropenia and malignancy
          </li>
        </ul>
        <h3 id="pathogenicity-c-glabrata"><em>C. glabrata</em></h3>
        <ul>
          <li>
            Exclusively commensal, with an enormous ability to adapt to various stresses within the human body, including low availability of carbon, iron, and nitrogen, low pH, and both high and low oxygen levels
          </li>
          <li>
            Upon pathogenic invasion, can reach fatality levels of 50%
          </li>
          <li>
            More often associated with adults than children and is thus more prevalent in wealthier nations, where demographics skew to higher average age.
          </li>
        </ul>
        <h3 id="pathogenicity-c-dubliniensis"><em>C. dubliniensis</em></h3>
        <ul>
          <li>
            As a close relative of <em>C. albicans</em>, <em>C. dubliniensis</em> is a successful colonizer of the human host. However, it primarily lives as a benign commensal and only rarely causes invasive infection
          </li>
          <li>
            When <em>C. dubliniensis</em> does cause infection, it most commonly causes oral candidiasis (see <a href="https://pubmed.ncbi.nlm.nih.gov/21706283/" target="_blank" rel="noopener noreferrer">Moyes et al.</a> and <a href="https://pubmed.ncbi.nlm.nih.gov/21531874/" target="_blank" rel="noopener noreferrer">Chen et al.</a>)
          </li>
        </ul>
        <h3 id="pathogenicity-c-auris"><em>C. auris</em></h3>
        <ul>
          <li>
            <em>C. auris</em> was only recognized as a human pathogen in 2009 and may have only recently evolved the ability to colonize the human host
          </li>
          <li>
            Can live either commensally or freely in a wide range of ecological niches
          </li>
          <li>
            It has been hypothesized that <em>C. auris</em> made the shift to commensalism due to climate change, where increasing terrestrial temperatures made it more possible to bridge the transition into the high-temperature environment inside a mammal
          </li>
          <li>
            As <em>C. auris</em> preferentially colonizes the cooler skin rather than the hotter gut microbiome, new commensalism may be consistent with a recent acquisition of thermotolerance
          </li>
          <li>
            The inclination to colonize skin has made <em>C. auris</em> particularly problematic in hospital settings, where widespread outbreaks have become common
          </li>
        </ul>
        <h2 id="mating-reproduction">Mating/Reproduction</h2>
        <p><strong>Notes:</strong> <em>Candida</em> species show heterogeneity in mating/reproduction, as described below. References are by species.</p>
        <h3 id="mating-reproduction-c-albicans"><em>C. albicans</em></h3>
        <ul>
          <li>
            Undergoes both heterothallic and homothallic reproduction
          </li>
          <li>
            Heterothallic reproduction between two haploids of opposite mating type occurs at low frequency and requires a phenotypic switch from the white to the opaque state, where the opaque state is mating competent
          </li>
          <li>
            Does not appear to undergo mating type switching within a strain
          </li>
          <li>
            Once mating occurs, the fungus does not undergo a meiotic program but instead reduces chromosome number by chromosome loss
          </li>
          <li>
            Parasexual (i.e., homothallic) reproduction via the mating of two diploids is likewise followed by chromosome loss leading to aneuploidy
          </li>
          <li>
            Has a remarkable tolerance for aneuploidy
          </li>
        </ul>
        <figure className="pyc-figure">
          <img src="/images/pyc/c-albicans-mating.png" alt="C. albicans mating" />
        </figure>
        <p>From <a href="https://pubmed.ncbi.nlm.nih.gov/20552251/" target="_blank" rel="noopener noreferrer">Alby and Bennett, 2010</a></p>
        <p><a href="https://pubmed.ncbi.nlm.nih.gov/3539914/" target="_blank" rel="noopener noreferrer">Slutsky et al., 1987</a> <a href="https://pubmed.ncbi.nlm.nih.gov/20552251/" target="_blank" rel="noopener noreferrer">Alby and Bennett, 2010</a> (review) <a href="https://pubmed.ncbi.nlm.nih.gov/14745027/" target="_blank" rel="noopener noreferrer">Butler et al., 2004</a> <a href="https://pubmed.ncbi.nlm.nih.gov/17614788/" target="_blank" rel="noopener noreferrer">Noble and Johnson, 2007</a> (review)</p>
        <h3 id="mating-reproduction-c-dubliniensis"><em>C. dubliniensis</em></h3>
        <ul>
          <li>
            Undergoes mating similarly to <em>C. albicans</em> and is likely to complete the mating cycle by parasexual loss of chromosomes rather than meiosis
          </li>
          <li>
            Requires phenotypic switching from white to opaque before mating
          </li>
          <li>
            Has a higher percentage (~30%) of natural strains that are MTL homozygous (a/a or alpha/alpha) than does C. albicans (~8%)
          </li>
        </ul>
        <p><a href="https://pubmed.ncbi.nlm.nih.gov/15302834/" target="_blank" rel="noopener noreferrer">Pujol et al., 2004</a> <a href="https://pubmed.ncbi.nlm.nih.gov/26432632/" target="_blank" rel="noopener noreferrer">Pujol et al., 2015</a> <a href="https://pubmed.ncbi.nlm.nih.gov/20552251/" target="_blank" rel="noopener noreferrer">Alby and Bennett, 2010</a> (review) <a href="https://pubmed.ncbi.nlm.nih.gov/14745027/" target="_blank" rel="noopener noreferrer">Butler et al., 2004</a></p>
        <h3 id="mating-reproduction-c-tropicalis"><em>C. tropicalis</em></h3>
        <ul>
          <li>
            Undergoes both homothallic and heterothallic mating, followed by chromosome loss rather than meiosis
          </li>
          <li>
            Tetraploid progeny of homothallic matings can mate with diploid cells of the opposite mating type, generating unstable genomes that give rise to diverse offspring
          </li>
        </ul>
        <p><a href="https://pubmed.ncbi.nlm.nih.gov/29734333/" target="_blank" rel="noopener noreferrer">Du et al., 2018</a> <a href="https://pubmed.ncbi.nlm.nih.gov/20552251/" target="_blank" rel="noopener noreferrer">Alby and Bennett, 2010</a> (review)</p>
        <h3 id="mating-reproduction-c-parapsilosis"><em>C. parapsilosis</em></h3>
        <ul>
          <li>
            Never observed to mate
          </li>
        </ul>
        <p><a href="https://pubmed.ncbi.nlm.nih.gov/20552251/" target="_blank" rel="noopener noreferrer">Alby and Bennett, 2010</a> (review)</p>
        <h3 id="mating-reproduction-c-glabrata"><em>C. glabrata</em></h3>
        <ul>
          <li>
            Never observed to mate
          </li>
          <li>
            However, there is genomic evidence for past recombination events and the genome contains the factors shown necessary for meiosis in the close relative <em>S. cerevisiae</em>
          </li>
        </ul>
        <p><a href="https://pubmed.ncbi.nlm.nih.gov/15707844/" target="_blank" rel="noopener noreferrer">Dodgson et al., 2005</a> <a href="https://pubmed.ncbi.nlm.nih.gov/37151577/" target="_blank" rel="noopener noreferrer">Bedekovic and Usher, 2023</a> (review)</p>
        <h3 id="mating-reproduction-c-auris"><em>C. auris</em></h3>
        <ul>
          <li>
            Never observed to mate
          </li>
          <li>
            However, there is evidence in the genome for past recombination events, especially from before the clades split, and the species appears to contain the necessary factors for mating/meiosis
          </li>
        </ul>
        <p><a href="https://pubmed.ncbi.nlm.nih.gov/30559369/" target="_blank" rel="noopener noreferrer">Muñoz et al., 2018</a></p>
        <h2 id="drug-resistance">Drug resistance</h2>
        <p><strong>Notes:</strong> <em>Candida</em> species show distinct drug resistance profiles. While all species can acquire resistance, inherent resistance and/or tolerance is especially concerning for <em>C. auris</em> and <em>C. glabrata</em>, likely due to their haploid genomes.</p>
        <p><strong>References:</strong></p>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/33820824/" target="_blank" rel="noopener noreferrer">Carolus et al., 2021</a>
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/26801081/" target="_blank" rel="noopener noreferrer">Kołaczkowska and Kołaczkowska, 2016</a>
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/38465406/" target="_blank" rel="noopener noreferrer">Ahmady et al., 2024</a>
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/30965100/" target="_blank" rel="noopener noreferrer">Pristov and Ghannoum, 2019</a>
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/28542486/" target="_blank" rel="noopener noreferrer">Chowdhary et al., 2017</a>
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/32047294/" target="_blank" rel="noopener noreferrer">Berman and Krysan, 2020</a>
          </li>
        </ul>
        <h3 id="drug-resistance-concerning-levels-of-inherent-azole-resistance">Concerning levels of inherent azole resistance</h3>
        <ul>
          <li>
            <em>C. glabrata</em>
          </li>
          <li>
            <em>C. auris</em>
          </li>
          <li>
            <em>C. krusei</em>
          </li>
        </ul>
        <h3 id="drug-resistance-concerning-levels-of-inherent-echinocandin-resistance">Concerning levels of inherent echinocandin resistance</h3>
        <ul>
          <li>
            <em>C. glabrata</em>
          </li>
          <li>
            <em>C. auris</em>
          </li>
        </ul>
        <h3 id="drug-resistance-concerning-levels-of-amphotericin-b-resistance">Concerning levels of amphotericin B resistance</h3>
        <ul>
          <li>
            <em>C. auris</em>
          </li>
        </ul>
        <h3 id="drug-resistance-acquired-resistance-in-nosocomial-settings">Acquired resistance in nosocomial settings</h3>
        <ul>
          <li>
            All species
          </li>
        </ul>
        <h3 id="drug-resistance-resistance-within-biofilms">Resistance within biofilms</h3>
        <ul>
          <li>
            All species
          </li>
        </ul>
        <h2 id="respiratory-metabolism">Respiratory metabolism</h2>
        <p><strong>Notes:</strong> The Crabtree effect explains why baker’s yeast is also called brewer’s yeast, in that <em>S. cerevisiae</em> preferentially converts sugar to alcohol in lieu of other types of respiration. This is referred to as Crabtree positive. Among the pathogenic yeasts, the only member with this ability is the phylogenetic outlier <em>C. glabrata</em>, which is more closely related to <em>S. cerevisiae</em> than to the other pathogenic yeasts. The other pathogenic yeasts are all Crabtree negative, meaning they do not produce alcohol as a product of respiration. For these non-fermentative yeasts, the ability to utilize many carbon sources (with little preference for glucose) is thought to provide an advantage for pathogenesis in various host niches.</p>
        <p><strong>References</strong></p>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/8279829/" target="_blank" rel="noopener noreferrer">van Dijken et al., 1993</a>
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/3050010/" target="_blank" rel="noopener noreferrer">Niimi et al., 1988</a>
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/23232717/" target="_blank" rel="noopener noreferrer">Sandai et al., 2012</a>
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/27073846/" target="_blank" rel="noopener noreferrer">Childers et al., 2016</a>
          </li>
        </ul>
        <h3 id="respiratory-metabolism-crabtree-negative-non-fermentative">Crabtree negative (non-fermentative)</h3>
        <ul>
          <li>
            <em>C. albicans</em>
          </li>
          <li>
            <em>C. dubliniensis</em>
          </li>
          <li>
            <em>C. parapsilosis</em>
          </li>
          <li>
            <em>C. tropicalis</em>
          </li>
          <li>
            <em>C. auris</em>
          </li>
        </ul>
        <h3 id="respiratory-metabolism-crabtree-positive-fermentative">Crabtree positive (fermentative)</h3>
        <ul>
          <li>
            <em>C. glabrata</em>
          </li>
        </ul>
        <h2 id="virulence-factors">Virulence Factors</h2>
        <p><strong>Notes:</strong> Pathogenic yeasts vary in use of secreted and membrane-bound virulence factors involved in invasion, damage and translocation.</p>
        <p><strong>References</strong></p>
        <ul>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/31544690/" target="_blank" rel="noopener noreferrer">Staniszewska, 2020</a>
          </li>
          <li>
            <a href="https://pubmed.ncbi.nlm.nih.gov/34506621/" target="_blank" rel="noopener noreferrer">Lim et al., 2021</a>
          </li>
        </ul>
        <figure className="pyc-figure">
          <img src="/images/pyc/virulence-factors.png" alt="Virulence factors" />
        </figure>
        <p>From <a href="https://pubmed.ncbi.nlm.nih.gov/34506621/" target="_blank" rel="noopener noreferrer">Lim et al., 2021</a></p>
      </div>
    </div>
  );
}

export default SpeciesComparisonsPage;
