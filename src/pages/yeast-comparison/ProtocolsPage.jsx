import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';
import './PathogenicYeastComparison.css';

// Converted from the CGD Public Wiki (Protocols and Methods).
function ProtocolsPage() {
  return (
    <div className="info-page pyc-page">
      <div className="info-page-content" id="top">
        <p className="pyc-breadcrumb">
          <Link to="/pathogenic-yeast-comparison">Pathogenic Yeast Comparison</Link>
        </p>
        <h1>Protocols and Methods</h1>
        <hr />

        <p>
          For genome-scale mutant and clone collections, see{' '}
          <Link to="/library-collections">Library Collections</Link>.
        </p>

        <ul className="pyc-toc">
          <li><a href="#candida-identification"><em>Candida</em> Identification</a></li>
          <li><a href="#candida-albicans-protocols-and-methods"><em>Candida albicans</em> Protocols and Methods</a></li>
          <li><a href="#candida-glabrata-nakaseomyces-glabratus-protocols-and-methods"><em>Candida glabrata</em> (<em>Nakaseomyces glabratus</em>) Protocols and Methods</a></li>
          <li><a href="#candida-parapsilosis-protocols-and-methods"><em>Candida parapsilosis</em> Protocols and Methods</a></li>
          <li><a href="#candida-auris-candidozyma-auris-protocols-and-methods"><em>Candida auris</em> (<em>Candidozyma auris</em>) Protocols and Methods</a></li>
          <li><a href="#candida-dubliensis-protocols-and-methods"><em>Candida dubliensis</em> Protocols and Methods</a></li>
          <li><a href="#candida-tropicalis-protocols-and-methods"><em>Candida tropicalis</em> Protocols and Methods</a></li>
        </ul>
        <h2 id="candida-identification"><em>Candida</em> Identification</h2>
        <h3 id="candida-identification-universal-primers">Universal primers</h3>
        <ul>
          <li>
            used to amplify ITS genes for subsequent sequencing to identify species
            <ul>
              <li>
                Fungi_ITS_Seq_F: GTGAATCATCGAATCTTTGAA
              </li>
              <li>
                Fungi_ITS_Seq_R: TCCTCCGCTTATTGATATGC
              </li>
              <li>
                These are primers ITS86F and ITS4 from the reference <a href="https://microbiomejournal.biomedcentral.com/articles/10.1186/s40168-019-0748-9" target="_blank" rel="noopener noreferrer">Park et al.</a>
              </li>
              <li>
                The primers themselves are from older literature, but this combination seems to work best for yeast species
              </li>
            </ul>
          </li>
        </ul>
        <h2 id="candida-albicans-protocols-and-methods"><em>Candida albicans</em> Protocols and Methods</h2>
        <ul>
          <li>
            Basic techniques
            <ul>
              <li>
                <a href="https://link.springer.com/book/10.1007/978-1-60327-151-6" target="_blank" rel="noopener noreferrer"><em>Candida albicans</em>: Methods and Protocols</a>
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/19253458/" target="_blank" rel="noopener noreferrer">Cihlar and Calderone, 2009</a>. Methods Mol Biol 2009:499:v
              </li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            MIC assays
            <ul>
              <li>
                <a href="https://clsi.org/standards/products/microbiology/documents/m38/" target="_blank" rel="noopener noreferrer">Clinical and Laboratory Standards Institute (CLSI) document M38</a>
              </li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            Insertion mutagenesis
            <ul>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/29378819/" target="_blank" rel="noopener noreferrer">Mielich et al., 2018</a> G3 (Bethesda) 2018 Mar 28;8(4):1139-1145
              </li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            CRISPR-Cas9 deletions
            <ul>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/30737491/" target="_blank" rel="noopener noreferrer">Halder et al., 2019</a>. Nat Protoc. 2019 Mar;14(3):955-975
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/29062088/" target="_blank" rel="noopener noreferrer">Shapiro et al., 2018</a>. Nat Microbiol. 2018 Jan;3(1):73-82
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/34709611/" target="_blank" rel="noopener noreferrer">Wensing and Shapiro, 2022</a>. Methods Mol Biol. 2022:2377:69-88
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/28497115/" target="_blank" rel="noopener noreferrer">Nguyen et al., 2021</a>. Microbiol Spectr. 2021 Dec 22;9(3):e0182021
              </li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            5-FOA assay for assessing mutation rates
            <ul>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/18202359/" target="_blank" rel="noopener noreferrer">Lang and Murray, 2008</a>. Genetics. 2008 Jan;178(1):67-82
              </li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            Virulence studies in <em>Galleria mellonella</em>
            <ul>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/27362761/" target="_blank" rel="noopener noreferrer">Champion et al., 2016</a>. Virulence. 2016 Oct 2;7(7):840-5
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/22305092/" target="_blank" rel="noopener noreferrer">Desbois and Coote, 2016</a>. Virulence. 2016 Oct 2;7(7):840-5
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/23211681/" target="_blank" rel="noopener noreferrer">Junqueira, 2012</a>. Virulence. 2012 Oct 1;3(6):474-6
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/32970818/" target="_blank" rel="noopener noreferrer">Wojda et al., 2020</a>. Pathog Dis. 2020 Nov 23;78(9):ftaa057
              </li>
            </ul>
          </li>
        </ul>
        <h2 id="candida-glabrata-nakaseomyces-glabratus-protocols-and-methods"><em>Candida glabrata</em> (<em>Nakaseomyces glabratus</em>) Protocols and Methods</h2>
        <ul>
          <li>
            Basic techniques
            <ul>
              <li>
                <a href="https://link.springer.com/book/10.1007/978-1-0716-2549-1" target="_blank" rel="noopener noreferrer"><em>Candida</em> Species: Methods and Protocols</a>
              </li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            MIC assays
            <ul>
              <li>
                <a href="https://clsi.org/standards/products/microbiology/documents/m27m44s" target="_blank" rel="noopener noreferrer">Clinical and Laboratory Standards Performance Standards for Antifungal Susceptibility Testing of Yeasts, 3rd Edition</a>
              </li>
              <li>
                <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8218755/" target="_blank" rel="noopener noreferrer">Israel et al., 2021</a>. J Clin Microbiol. 2021 Jun 18;59(7):e00311-21
              </li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            Genetic manipulation of <em>C. glabrata</em>
            <ul>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/39240247" target="_blank" rel="noopener noreferrer">Usher, 2024</a>. Curr Protoc. 2024 Sep;4(9):e70014
              </li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            Transformation of <em>C. glabrata</em>
            <ul>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/27774499/" target="_blank" rel="noopener noreferrer">Istel et al., 2015</a>. Bio Protoc. 2015 Jul 20;5(14):e1528
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/27766280/" target="_blank" rel="noopener noreferrer">Istel et al., 2015</a>. Bio Protoc. 2015 Jul 20;5(14):e1529
              </li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            CRISPR-Cas9-based deletions
            <ul>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/27767081/" target="_blank" rel="noopener noreferrer">Enkler et al., 2016</a>. Sci Rep. 2016 Oct 21:6:35766
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/31423617/" target="_blank" rel="noopener noreferrer">Maroc and Fairhead, 2019</a>. Yeast. 2019 Dec;36(12):723-731
              </li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            Virulence studies in <em>Galleria mellonella</em>
            <ul>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/27362761/" target="_blank" rel="noopener noreferrer">Champion et al., 2016</a>. Virulence. 2016 Oct 2;7(7):840-5
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/22305092/" target="_blank" rel="noopener noreferrer">Desbois and Coote, 2016</a>. Virulence. 2016 Oct 2;7(7):840-5
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/23211681/" target="_blank" rel="noopener noreferrer">Junqueira, 2012</a>. Virulence. 2012 Oct 1;3(6):474-6
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/32970818/" target="_blank" rel="noopener noreferrer">Wojda et al., 2020</a>. Pathog Dis. 2020 Nov 23;78(9):ftaa057
              </li>
            </ul>
          </li>
        </ul>
        <h2 id="candida-parapsilosis-protocols-and-methods"><em>Candida parapsilosis</em> Protocols and Methods</h2>
        <ul>
          <li>
            Basic techniques
            <ul>
              <li>
                <a href="https://link.springer.com/book/10.1007/978-1-0716-2549-1" target="_blank" rel="noopener noreferrer"><em>Candida</em> Species: Methods and Protocols</a>
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/38156315/" target="_blank" rel="noopener noreferrer">Arévalo-Jaimes et al.,2023</a>. Front Cell Infect Microbiol. 2023 Dec 13;13:1323619.
              </li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            MIC assays
            <ul>
              <li>
                <a href="https://clsi.org/standards/products/microbiology/documents/m27m44s" target="_blank" rel="noopener noreferrer">Clinical and Laboratory Standards Performance Standards for Antifungal Susceptibility Testing of Yeasts, 3rd Edition</a>
              </li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            Transformation of <em>C. parapsilosis</em>
            <ul>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/33729086/" target="_blank" rel="noopener noreferrer">Nemeth et al.,2021</a>. Virulence. 2021 Mar 17;12(1):937–950
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/14648114/" target="_blank" rel="noopener noreferrer">Zemanova et al.,2004</a>. Curr Genet. 2004 Mar;45(3):183-6
              </li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            Virulence studies in <em>Galleria mellonella</em>
            <ul>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/27362761/" target="_blank" rel="noopener noreferrer">Champion et al., 2016</a>. Virulence. 2016 Oct 2;7(7):840-5
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/22305092/" target="_blank" rel="noopener noreferrer">Desbois and Coote, 2016</a>. Virulence. 2016 Oct 2;7(7):840-5
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/23211681/" target="_blank" rel="noopener noreferrer">Junqueira, 2012</a>. Virulence. 2012 Oct 1;3(6):474-6
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/32970818/" target="_blank" rel="noopener noreferrer">Wojda et al., 2020</a>. Pathog Dis. 2020 Nov 23;78(9):ftaa057
              </li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            CRISPR-Cas9-based deletions
            <ul>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/36416551/" target="_blank" rel="noopener noreferrer">Lombardi et al.,2022</a>. mSphere. 2022 Dec 21;7(6):e0039322
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/36008654/" target="_blank" rel="noopener noreferrer">Lombardi and Butler,2022</a>. Methods Mol Biol. 2022:2542:13-40
              </li>
            </ul>
          </li>
        </ul>
        <h2 id="candida-auris-candidozyma-auris-protocols-and-methods"><em>Candida auris</em> (<em>Candidozyma auris</em>) Protocols and Methods</h2>
        <ul>
          <li>
            Basic techniques
            <ul>
              <li>
                <a href="https://link.springer.com/book/10.1007/978-1-0716-2417-3" target="_blank" rel="noopener noreferrer">Candida auris: Methods and Protocols</a>
              </li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            MIC assays
            <ul>
              <li>
                <a href="https://clsi.org/standards/products/microbiology/documents/m27m44s" target="_blank" rel="noopener noreferrer">Clinical and Laboratory Standards Performance Standards for Antifungal Susceptibility Testing of Yeasts, 3rd Edition</a>
              </li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            Identification of <em>C. auris</em>
            <ul>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/35343775/" target="_blank" rel="noopener noreferrer">Narayanan et al., 2022</a>. Microbiol Spectr. 2022 Apr 27;10(2):e0063422
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/35674942/" target="_blank" rel="noopener noreferrer">Abdolrasouli and Fraser, 2022</a>. Methods Mol Biol. 2022:2517:21-32
              </li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            Transformation of <em>C. auris</em>
            <ul>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/35674948/" target="_blank" rel="noopener noreferrer">Ruiz and Lorenz, 2022</a>. Methods Mol Biol. 2022:2517:95-110
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/35674947/" target="_blank" rel="noopener noreferrer">Kasir et al., 2022</a>. Methods Mol Biol. 2022: 2517:89-94
              </li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            CRISPR-Cas9-based deletions
            <ul>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/34730409/" target="_blank" rel="noopener noreferrer">Ennis et al., 2021</a>. Microbiol Spectr. 2021 Dec 22;9(3):e0182021
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/28497115/" target="_blank" rel="noopener noreferrer">Nguyen et al., 2017</a>. mSphere. 2017 Apr 26;2(2):e00149-17.
              </li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            Virulence studies in <em>Galleria mellonella</em>
            <ul>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/27547827/" target="_blank" rel="noopener noreferrer">Borman et al., 2016</a>. mSphere. 2016 Aug 18;1(4):e00189-16
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/34890523/" target="_blank" rel="noopener noreferrer">Garcia-Bustos et al., 2022</a>. Emerg Microbes Infect. 2022 Dec;11(1):136-146
              </li>
            </ul>
          </li>
        </ul>
        <h2 id="candida-dubliensis-protocols-and-methods"><em>Candida dubliensis</em> Protocols and Methods</h2>
        <ul>
          <li>
            Basic techniques
            <ul>
              <li>
                <a href="https://link.springer.com/book/10.1007/978-1-0716-2549-1" target="_blank" rel="noopener noreferrer"><em>Candida</em> Species: Methods and Protocols</a>
              </li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            Identification
            <ul>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/10747150/" target="_blank" rel="noopener noreferrer">Tintelnot at al., 2000</a>. J Clin Microbiol. 2000 Apr;38(4):1599-608
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/12624045/" target="_blank" rel="noopener noreferrer">Bliss et al., 2003</a>. J Clin Microbiol. 2003 Mar;41(3):1152-60
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/19682314/" target="_blank" rel="noopener noreferrer">Ells et al., 2011</a>. Mycoses. 2011 Jan;54(1):1-16
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/29862215/" target="_blank" rel="noopener noreferrer">Kianipour et al., 2018</a>. Adv Biomed Res. 2018 Apr 24:7:66
              </li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            Transformation and strain construction in C. dubliniensis
            <ul>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/10721733/" target="_blank" rel="noopener noreferrer">Staib et al., 2000</a>. Gene. 2000 Jan 25;242(1-2):393-8
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/11292806/" target="_blank" rel="noopener noreferrer">Staib et al., 2001</a>. J Bacteriol. 2001 May;183(9):2859-65
              </li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            Virulence studies in <em>Galleria mellonella</em>
            <ul>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/29315379/" target="_blank" rel="noopener noreferrer">Chupácová et al., 2018</a>. Pathog Dis. 2018 Feb 1;76(1)
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/30386966/" target="_blank" rel="noopener noreferrer">Dekkerová-Chupáčová et al., 2018</a>. Mycopathologia. 2018 Dec;183(6)
              </li>
            </ul>
          </li>
        </ul>
        <h2 id="candida-tropicalis-protocols-and-methods"><em>Candida tropicalis</em> Protocols and Methods</h2>
        <ul>
          <li>
            Basic techniques
            <ul>
              <li>
                <a href="https://link.springer.com/book/10.1007/978-1-0716-2549-1" target="_blank" rel="noopener noreferrer"><em>Candida</em> Species: Methods and Protocols</a>
              </li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            MIC assays
            <ul>
              <li>
                <a href="https://clsi.org/standards/products/microbiology/documents/m27m44s" target="_blank" rel="noopener noreferrer">Clinical and Laboratory Standards Performance Standards for Antifungal Susceptibility Testing of Yeasts, 3rd Edition</a>
              </li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            Transformation of <em>C. tropicalis</em>
            <ul>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/1368068/" target="_blank" rel="noopener noreferrer">Rohrer and Picataggio, 1992</a>. Appl Microbiol Biotechnol. 1992 Feb;36(5):650-4
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/25406254/" target="_blank" rel="noopener noreferrer">Xiang et al., 2014</a>. Yi Chuan. 2014 Oct;36(10):1053-61
              </li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            CRISPR-Cas9-based deletions
            <ul>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/35543560/" target="_blank" rel="noopener noreferrer">Li et al., 2022</a>. Microbiol Spectr. 2022 Jun 29;10(3):e0005922
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/36008654/" target="_blank" rel="noopener noreferrer">Lombardi and Butler, 2022</a>. Methods Mol Biol. 2022:2542:13-40
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/31654413/" target="_blank" rel="noopener noreferrer">Zhang et al., 2020</a>. Biotechnol Bioeng. 2020 Feb;117(2):531-542
              </li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            Virulence studies in <em>Galleria mellonella</em>
            <ul>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/23170962/" target="_blank" rel="noopener noreferrer">Mesa-Arango et al., 2013</a>. Med Mycol. 2013 Jul;51(5):461-72
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/23877676/" target="_blank" rel="noopener noreferrer">Forastiero et al., 2013</a>. Antimicrob Agents Chemother. 2013 Oct;57(10):4769-81
              </li>
              <li>
                <a href="https://pubmed.ncbi.nlm.nih.gov/32867152/" target="_blank" rel="noopener noreferrer">García-Carnero et al., 2020</a>. J Fungi (Basel). 2020 Aug 27;6(3):152
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default ProtocolsPage;
