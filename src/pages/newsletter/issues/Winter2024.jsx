import React from 'react';
import { Link } from 'react-router-dom';

// CGD Newsletter, Winter 2024. Generated from "Newsletter Winter 2024.draft.docx" by
// scripts/newsletter_docx_to_issue.py; edit freely after review.
// Each article is a <section> whose id matches an entry in issues/index.js.
const IMG = '/images/newsletter/winter-2024';

function Winter2024() {
  return (
    <>
      <section className="newsletter-article" id="upcoming-grant-renewal-spells-new-opportunity">
        <h2>Upcoming Grant Renewal Spells New Opportunity</h2>
        <p>CGD’s grant renewal will be due on July 5 and we’d like to hear from you by the end of February on what you’d most like to see incorporated into CGD. Drug response data? Links to a new resource? Interactions between genes and/or proteins?</p>
        <p>Regarding expression data (which has been requested multiple times), we’ve already made a strong start on this work– read about it next.</p>
        <p>We will be reaching out in April to request letters of support.</p>
      </section>

      <section className="newsletter-article" id="new-expression-datasets-at-cgd">
        <h2>New Expression Datasets at CGD</h2>
        <p>In a major new upgrade for CGD, we have built a rapid pipeline tool for incorporating RNA-seq datasets into JBrowse. The tool allows us to perform alignment from fastq files at NCBI against the reference genome held at CGD and format alignment, coverage, and density tracks for each run of a given study.</p>
        <p>The first organism targeted has been <em>C. auris</em>, and we have to date incorporated 208 tracks from the following six studies.</p>
        <ul>
          <li><Link to="/cgi-bin/reference/reference.pl?pubmed=35412372">Simm, et al., 2022</Link>. Disruption of iron homeostasis and mitochondrial metabolism are promising targets to inhibit <em>Candida auris</em>. Microbiol Spectr 2022 Apr 27;10(2):e0010022.</li>
          <li><Link to="/cgi-bin/reference/reference.pl?pubmed=34643421">Jakab, et al., 2021</Link>. Transcriptional profiling of the <em>Candida auris</em> response to exogenous farnesol exposure <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8513684/" target="_blank" rel="noopener noreferrer">mSphere.</a> 2021 Sep-Oct; 6(5): e00710-21.</li>
          <li><Link to="/cgi-bin/reference/reference.pl?pubmed=35473297">Biermann, et al., 2022</Link>. Transcriptional response of <em>Candida auris</em> to the <em>Mrr1</em> inducers methylglyoxal and benomyl. mSphere 2022 Jun 29;7(3):e0012422.</li>
          <li><Link to="/cgi-bin/reference/reference.pl?pubmed=37532970">Balla, et al., 2023</Link>. Total transcriptome analysis of <em>Candida auris</em> planktonic cells exposed to tyrosol. AMB Express 2023 Aug 2;13(1):81.</li>
          <li><Link to="/cgi-bin/reference/reference.pl?pubmed=33937102">Jenull et al., 2021</Link>. Transcriptome signatures predict phenotypic variations of <em>Candida auris</em>. Front Cell Infect Microbiol 2021 Apr 14:11:662563.</li>
          <li>Chow et al., 2023. The transcription factor Rpn4 activates its own transcription and induces efflux pump expression to confer fluconazole resistance in <em>Candida auris</em>. mBio 2023 Nov 28;14(6):e0268823</li>
        </ul>
        <p>We will continue adding new tracks so feel free to suggest studies you’d like to see incorporated.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-1.png`} alt="Figure 1" style={{ maxWidth: '547px' }} />
          <figcaption>Figure 1</figcaption>
        </figure>
      </section>

      <section className="newsletter-article" id="fungal-pathogen-genomics-course-2024">
        <h2>Fungal Pathogen Genomics Course 2024</h2>
        <p>For researchers who would like to learn more about fungal pathogens and/or genomics, consider the <a href="https://coursesandconferences.wellcomeconnectingscience.org/event/fungal-pathogen-genomics-20240602/" target="_blank" rel="noopener noreferrer">Fungal Pathogen Genomics Course</a> at the Wellcome Genome Campus in Hinxton, UK next June 2-7.</p>
        <p>This course is aimed at graduate students, postdocs, clinical scientists, clinicians/healthcare professionals or lab heads working on fungal pathogens.</p>
        <p>The week-long course offers hands-on training in web-based data-mining resources for fungal genomes, with a collaborative teaching effort by representatives of the following data resources:</p>
        <ul>
          <li>FungiDB/VEuPathDB</li>
          <li>Ensembl Fungi/EBI</li>
          <li>SGD/CGD</li>
          <li>MycoCosm/JGI</li>
        </ul>
        <p>We’ll be there and hope you might be too.</p>
      </section>

      <section className="newsletter-article newsletter-spotlight" id="research-spotlight">
        <p className="newsletter-kicker">Research Spotlight</p>
        <h2>Two Studies Delve into Why SC5314 Is Unique</h2>
        <p>Reference strains are generally chosen for being “typical.” Such was the belief for <Link to="/strains"><em>C. albicans</em> SC5314</Link> until recently, as new research has documented ways that SC5314 differs from the majority of strains. This spotlight will highlight two of these studies.</p>
        <p>A recent report by <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10653842/" target="_blank" rel="noopener noreferrer">Glazier et al.</a> in <em>mBio</em> looked at the pivotal transcription factor <Link to="/locus/ROB1">Rob1p</Link> which modulates formation of biofilms and filaments. The study shows that reference strain SC5314 is actually heterozygous at the <em>ROB1</em> locus, as it appears there is a non-synonymous C/T polymorphism at position 2902 of the C terminus that results in the A allele encoding a serine while the B allele encodes a proline at position 946 of the protein sequence.</p>
        <p>To test the effect of this polymorphism, the researchers looked at an allele series of six independent <em>rob1/ROB1</em> heterozygotes in the SN/SC5314 background differing at the single nucleotide polymorphism.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-2.png`} alt="Figure 2" style={{ maxWidth: '273px' }} />
          <figcaption>Figure 2</figcaption>
        </figure>
        <p>Remarkably, this single-nucleotide change correlates with strikingly different colony morphology. The SN250 wild-type strain is highly wrinkled, and so are all the heterozygotes with the 946S allele. Conversely, both the full null <em>rob1/</em> and the heterozygotes with only the proline-containing protein isoform (C at position 2902 of the genome) give rise to smooth colonies.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-3.png`} alt="Figure 3" style={{ maxWidth: '428px' }} />
          <figcaption>Figure 3</figcaption>
        </figure>
        <p>The researchers then looked at biofilm formation and saw an identical pattern., i.e., in cases where the only isoform was the proline-containing form, biofilm formation was minimal. The serine-containing isoform, however, gave rise to robust biofilms both <em>in vivo</em> and <em>in vitro</em>. The serine-containing isoform thus appears to be a gain-of-function allele.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-4.png`} alt="Figure 4" style={{ maxWidth: '372px' }} />
          <figcaption>Figure 4</figcaption>
        </figure>
        <p>To assess the effect of single and double copies of the allele, the researchers introduced one or the other copy into various backgrounds. The summary of these studies is that a single copy of the <em>rob1-946S</em> allele leads to increased filamentation in both weakly and strongly filamenting strains, and that two copies leads to even more. Further, the <em>rob1-946P</em> allele associates with commensalism in the oral mucosa while the <em>rob1-946S</em> promotes invasion.</p>
        <p>Given the powerful effects of the <em>rob1-946S</em> allele, the researchers assessed its prevalence across <em>Candida albicans</em> phylogeny. Remarkably, they failed to find the allele in any strain other than SC5314.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-5.png`} alt="Figure 5" style={{ maxWidth: '330px' }} />
          <figcaption>Figure 5</figcaption>
        </figure>
        <p>In a separate recent study in <em>Genetics</em>, the team of <a href="https://academic.oup.com/genetics/article-abstract/225/3/iyad162/7301265?redirectedFrom=fulltext&amp;login=false" target="_blank" rel="noopener noreferrer">Lohse et al.</a> looked at white-opaque switching in SC5314 relative to other strains—and again found SC5314 to be an outlier.</p>
        <p>Mating type in <em>C. albicans</em> has three flavors: homozygous a/a or α/α versus heterozygous a/α. Each of the homozygotes readily forms opaque cells (typically a precursor to mating) in response to environmental signals. The heterozygote typically resists formation of opaque cells (i.e., remains white) due to the expression of both halves of a repressive heterodimer. It was thought this repression in the heterozygote was universal until several groups showed in 2006 that up to two-thirds of the clinical isolates tested were, under the right conditions of <em>N</em>-acetylglucosamine (GlcNAc) and 5% CO<sub>2</sub>, in fact able to form opaque cells. SC5314, however, remained white under these same conditions.</p>
        <p>Lohse et al. performed targeted transcriptional profiling to ask focused questions about what makes SC5314 fail to respond to these signals. While expression of the mating type loci is not different between SC5314 and other strains, they found a large difference in expression of four transcriptional regulators previously shown to act in filamentation responses. mRNA transcript levels of <Link to="/locus/BRG1"><em>BRG1</em> </Link>were 13-fold higher, <Link to="/locus/UME6"><em>UME6</em></Link> levels were 8-fold higher, <Link to="/locus/RFX2"><em>RFX2</em></Link> levels were 5-fold higher, and <Link to="/locus/SFL2"><em>SFL2</em></Link> levels were 3-fold higher in SC5314 relative to the other 16 a/α strains tested. While <em>BRG1</em>, <em>SFL2</em>, and <em>UME6</em> are shown to activate the filamentation response, <em>RFX2</em> acts as a repressor.</p>
        <p>Interestingly, the expression of these genes is likewise responsive to GlcNAc and CO<sub>2</sub>. The researchers did an elaborate series of single and double mutation studies to understand the connection between these regulators and the white-opaque switching response. They found that no single regulator was responsible for repressing white-opaque switching in SC5314, but rather that they appear to act with synergism to form a block to switching.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-6.png`} alt="Figure 6" style={{ maxWidth: '437px' }} />
          <figcaption>Figure 6</figcaption>
        </figure>
        <p>Thus, these two studies each come to the conclusion that SC5314 is more an outlier than a typical strain, where SC5314 is uniquely able to induce filamentation by a method that appears to simultaneously block switching.</p>
        <p>It will be interesting to ask questions about the role of <em>ROB1</em> (with the unique serine-containing isoform) with respect to phenotypic switching.</p>
      </section>

      <section className="newsletter-article" id="upcoming-meetings">
        <h2>Upcoming Meetings</h2>
        <ul>
          <li><a href="https://genetics-gsa.org/tagc-2024/" target="_blank" rel="noopener noreferrer">The Allied Genetics Conference 2024</a> (Including the Yeast Genetics Meeting)</li>
        </ul>
        <p>Washington, DC; March 6 - 10, 2024</p>
        <ul>
          <li>Fungal Genetics Conference 2024</li>
        </ul>
        <p>Asilomar Conference Grounds, Pacific Grove, CA; March 12 - 17, 2024</p>
        <ul>
          <li><a href="https://coursesandconferences.wellcomeconnectingscience.org/event/fungal-pathogen-genomics-20240602/" target="_blank" rel="noopener noreferrer">Fungal Pathogen Genomics Course</a><br />Wellcome Genome Campus, Hinxton, UK: June 2-7 2024</li>
          <li><a href="https://easternsun.eventsair.com/2024-16th-international-congress-on-yeasts/" target="_blank" rel="noopener noreferrer">The 16<sup>th</sup> International Congress on Yeasts</a><br />Cape Town International Convention Centre, Cape Town, South Africa Sep 29 – Oct 3, 2024</li>
        </ul>
      </section>
    </>
  );
}

export default Winter2024;
