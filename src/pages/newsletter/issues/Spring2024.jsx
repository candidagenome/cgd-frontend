import React from 'react';

// CGD Newsletter, Spring 2024. Generated from "Newsletter Spring 2024.draft.docx" by
// scripts/newsletter_docx_to_issue.py; edit freely after review.
// Each article is a <section> whose id matches an entry in issues/index.js.
const IMG = '/images/newsletter/spring-2024';

function Spring2024() {
  return (
    <>
      <section className="newsletter-article" id="fill-out-our-questionnaire">
        <h2>Fill Out Our Questionnaire!</h2>
        <p>You should have received a questionnaire about what you'd most like to see at CGD. If you haven't filled it out yet, don't tarry!</p>
        <p><a href="https://www.surveymonkey.com/r/86ZQT9J" target="_blank" rel="noopener noreferrer">https://www.surveymonkey.com/r/86ZQT9J</a></p>
        <p>CGD’s grant renewal will be due on July 5 and we want your input on what to propose for improvements. In addition, if you run a lab, please forward the questionnaire to the people in your lab and ask them to fill it out too! We'd like responses by the end of April.</p>
        <p>We will be reaching out to request letters of support in the next few weeks.</p>
      </section>

      <section className="newsletter-article" id="upgrades-to-our-protein-pages">
        <h2>Upgrades to our Protein Pages</h2>
        <p>We now show domain data for every protein page, with links to the domain database that characterizes the given region.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-1.png`} alt="Figure 1" style={{ maxWidth: '624px' }} />
          <figcaption>Figure 1</figcaption>
        </figure>
      </section>

      <section className="newsletter-article" id="expression-datasets-now-available-for-all-species">
        <h2>Expression Datasets Now Available for All Species</h2>
        <p>We've imported numerous new RNA-Seq datasets into JBrowse for all five species in the database. The datasets fall into several categories: (1) studies comparing isolates known to be susceptible or resistant to a given drug or drug class; (2) comparisons of drug treatments to control for a single strain; (3) comparison of drug treatment against mutant versus wild-type strains; (4) comparison of mutant versus wild-type without treatment; and (5) comparison of modulating environmental conditions that trigger growth switches.</p>
        <p>This edition's Research Spotlight (see below) highlights a meta-analysis comparing datasets from at least three of these categories to look for biological relevance in how the datasets overlap. The reasoning is that <em>Candida</em> responds to environmental change in ways we don't yet understand, such that looking for genes that consistently get turned on or turned off might provide new clues.</p>
        <p>The current total number of RNA-Seq datasets per species in CGD is as follows:</p>
        <p>11 for <em>C. albicans</em></p>
        <p>8 for <em>C. auris</em></p>
        <p>3 for <em>C. dubliniensis</em></p>
        <p>4 for <em>C. glabrata</em></p>
        <p>3 for <em>C. parapsilosis</em></p>
        <p>Those added since January include:</p>
        <ul>
          <li><a href="https://pubmed.ncbi.nlm.nih.gov/23895281/" target="_blank" rel="noopener noreferrer">Connolly, et al., 2013</a><strong>.</strong> The APSES transcription factor <em>Efg1</em> is a global regulator that controls morphogenesis and biofilm formation in <em>Candida parapsilosis</em>. Mol Microbiol. 2013 Oct;90(1):36-53.</li>
          <li><a href="https://pubmed.ncbi.nlm.nih.gov/22192698/" target="_blank" rel="noopener noreferrer">Guida et al., 2011</a>. Using RNA-seq to determine the transcriptional landscape and the hypoxic response of the pathogenic yeast <em>Candida parapsilosis.</em> BMC Genomics. 2011 Dec 22:12:628.</li>
          <li><a href="https://pubmed.ncbi.nlm.nih.gov/23547856/" target="_blank" rel="noopener noreferrer">Grumaz, et al., 2013</a>. Species and condition specific adaptation of the transcriptional landscapes in <em>Candida albicans</em> and <em>Candida dubliniensis</em>. BMC Genomics. 2013 Apr 2:14:212.</li>
          <li><a href="https://pubmed.ncbi.nlm.nih.gov/33723044/" target="_blank" rel="noopener noreferrer">Singh-Babakh et al., 2021</a>. Lineage-specific selection and the evolution of virulence in the <em>Candida</em> clade. Proc Natl Acad Sci U S A. 2021 Mar 23;118(12):e2016818118.</li>
          <li><a href="https://pubmed.ncbi.nlm.nih.gov/36108742/" target="_blank" rel="noopener noreferrer">Bhakt et al., 2022</a>. The SET-domain protein CgSet4 negatively regulates antifungal drug resistance via the ergosterol biosynthesis transcriptional regulator CgUpc2a. J Biol Chem. 2022 Oct;298(10):102485</li>
          <li><a href="https://pubmed.ncbi.nlm.nih.gov/37737633/" target="_blank" rel="noopener noreferrer">Glazier et al., 2023</a>. The <em>Candida albicans</em> reference strain SC5314 contains a rare, dominant allele of the transcription factor <em>Rob1</em> that modulates filamentation, biofilm formation, and oral commensalism. mBio. 2023 Oct 31;14(5):e0152123.</li>
          <li><a href="https://pubmed.ncbi.nlm.nih.gov/31263212/" target="_blank" rel="noopener noreferrer">Shivarathri et al., 2019</a>. The fungal histone acetyl transferase <em>Gcn5</em> controls virulence of the human pathogen <em>Candida albicans</em> through multiple pathways. Sci Rep. 2019 Jul 1;9(1):9445.</li>
        </ul>
      </section>

      <section className="newsletter-article newsletter-spotlight" id="research-spotlight">
        <p className="newsletter-kicker">Research Spotlight</p>
        <h2>Transcriptomic meta-analysis to identify potential antifungal targets in Candida albicans</h2>
        <p>The team of <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10898158/" target="_blank" rel="noopener noreferrer">Hefny et al.</a> recently reported on a next-level meta-analysis of the genes important to <em>C. albicans</em> for dynamic response to environmental change.</p>
        <p>Beginning with 239 potential datasets at <a href="https://www.ncbi.nlm.nih.gov/" target="_blank" rel="noopener noreferrer">NCBI</a>, the team applied rigorous criteria to whittle the set to seven high-quality studies in which up- and downregulation could be assessed and compared with confidence.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-2.png`} alt="Figure 2" style={{ maxWidth: '364px' }} />
          <figcaption>Figure 2</figcaption>
        </figure>
        <p>The expression data within these seven studies included 46 different experimental conditions, allowing the researchers to apply tools to tease out the functional significance of over-represented genes. As a start, principal component analysis of log2-transformed gene counts showed clustering of several datasets.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-3.png`} alt="Figure 3" style={{ maxWidth: '343px' }} />
          <figcaption>Figure 3</figcaption>
        </figure>
        <p>One tightly clustered pair (<a href="https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE99767" target="_blank" rel="noopener noreferrer">GSE99767</a> and <a href="https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE49310" target="_blank" rel="noopener noreferrer">GSE49310</a>, green and gold, respectively) included two studies looking at responses to changing acidity. Another set of three partially clustered studies (<a href="https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE87832" target="_blank" rel="noopener noreferrer">GSE7832</a>, <a href="https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE73409" target="_blank" rel="noopener noreferrer">GSE73409</a>, and <a href="https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE64659" target="_blank" rel="noopener noreferrer">GSE64659</a>, aqua, pink, and blue, respectively) explored responses to various treatments with stress modulators, such as N-acetylglucosamine or hydrogen peroxide, suggesting that the responses to these treatments share overlapping pathways. The other two studies, in contrast, displayed unique responses to environmental change. One study (<a href="https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE99902" target="_blank" rel="noopener noreferrer">GSE99902</a>) looked at the filamentation response under various growth media and the other (<a href="https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE102039" target="_blank" rel="noopener noreferrer">GSE102039</a>) looked at response to air and CO<sub>2</sub> environments.</p>
        <p>To gain functional insight, the research team applied several software packages to perform GO enrichment analysis and clustering. They identified 69 clusters of GO terms for upregulated genes and 68 for downregulated genes. Of these, they chose the top 4 clusters with the highest GO ID numbers on which to conduct further analysis. Among several avenues of insight, they performed frequency analysis on the up- and downregulated clusters to see which genes appeared most frequently.</p>
        <p>Interestingly, <em>RSP5</em> appears at high frequency in two clusters, suggesting an importance that has yet to be appreciated or studied. Likewise, the phosphatase <em>GLC7</em> may play a key role in <em>C. albicans</em> response to environment that we do not understand.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-4.png`} alt="Figure 4" style={{ maxWidth: '474px' }} />
          <figcaption>Figure 4</figcaption>
        </figure>
        <p>Among the downregulated genes, three of the four most frequent genes are largely uncharacterized.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-5.png`} alt="Figure 5" style={{ maxWidth: '624px' }} />
          <figcaption>Figure 5</figcaption>
        </figure>
        <p>While there is no guarantee that these relationships have biological relevance, it seems there are interesting questions to be asked from this type of layered meta-analysis. Given the troubling nature of resistance to our typical antifungals, this type of analysis offers new options for targeting <em>C. albicans</em> by aiming at its key response genes.</p>
      </section>

      <section className="newsletter-article" id="upcoming-meetings">
        <h2>Upcoming Meetings</h2>
        <ul>
          <li><a href="https://coursesandconferences.wellcomeconnectingscience.org/event/fungal-pathogen-genomics-20240602/" target="_blank" rel="noopener noreferrer">Fungal Pathogen Genomics Course</a><br />Wellcome Genome Campus, Hinxton, UK: June 2-7 2024</li>
          <li><a href="https://easternsun.eventsair.com/2024-16th-international-congress-on-yeasts/" target="_blank" rel="noopener noreferrer">The 16<sup>th</sup> International Congress on Yeasts</a><br />Cape Town International Convention Centre, Cape Town, South Africa Sep 29 – Oct 3, 2024</li>
        </ul>
      </section>
    </>
  );
}

export default Spring2024;
