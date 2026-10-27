import React from 'react';
import { Link } from 'react-router-dom';

// CGD Newsletter, Summer 2024. Generated from "Newsletter Summer 2024.final.docx" by
// scripts/newsletter_docx_to_issue.py; edit freely after review.
// Each article is a <section> whose id matches an entry in issues/index.js.
const IMG = '/images/newsletter/summer-2024';

function Summer2024() {
  return (
    <>
      <section className="newsletter-article" id="grant-renewal-application">
        <h2>Grant Renewal Application</h2>
        <p>Thank you to everyone who wrote a letter of support for our recent grant renewal application. Based on the survey that many of you took part in, we proposed in the renewal a number of significant upgrades to CGD, including a major upgrade to the code base to bring the look and feel of CGD into the modern age.</p>
        <p>The other significant result of the survey was a clear preference within the community for <em>Candida tropicalis</em> as the next species to get locus pages within CGD. We proposed this work in our renewal and we hope to be able to see it through. We also proposed to update assemblies for several other species.</p>
        <p>Based on survey results, we further proposed several improvements to how we capture and display transcriptomic datasets. Our intention is to display heat maps that visualize patterns of expression for every gene. We would like to supplement these displays with ChIP-seq data that better elucidate transcription factor binding sites. If anyone is performing ChIP-seq experiments, kindly share your data with us.</p>
      </section>

      <section className="newsletter-article" id="new-literature-topics-for-candida-diseases">
        <h2>New Literature Topics for <em>Candida</em> Diseases</h2>
        <p>We now have the following literature topics with which to tag publications for better searchability within CGD. New papers will be tagged during curation and we will work backwards to tag older papers as an ongoing project.</p>
        <p>Candidemia</p>
        <p>Chronic disseminated candidiasis</p>
        <p>Gastrointestinal candidiasis</p>
        <p>Dental caries</p>
        <p>Oropharyngeal candidiasis</p>
        <p>Esophageal candidiasis</p>
        <p>Vaginal candidiasis</p>
        <p>Ocular candidiasis</p>
        <p>Neonatal candidiasis</p>
        <p><a href="https://www.omim.org/entry/114580?search=candida&amp;highlight=candida" target="_blank" rel="noopener noreferrer">Familial candidiasis</a></p>
        <p><a href="https://www.omim.org/entry/212050" target="_blank" rel="noopener noreferrer">Immunodeficiency 103 fungal infections</a></p>
        <p>Fungal myositis</p>
        <p>As always, we're happy to take suggestions for additions or modifications to this list at <a href="mailto:candida-curator@lists.stanford.edu" target="_blank" rel="noopener noreferrer">candida-curator@lists.stanford.edu</a>.</p>
      </section>

      <section className="newsletter-article" id="recent-expression-datasets">
        <h2>Recent Expression Datasets</h2>
        <p>The current total number of RNA-Seq datasets per species in CGD is as follows:</p>
        <p>11 for <em>C. albicans</em></p>
        <p>10 for <em>C. auris</em></p>
        <p>3 for <em>C. dubliniensis</em></p>
        <p>7 for <em>C. glabrata</em></p>
        <p>3 for <em>C. parapsilosis</em></p>
        <p>You can view these either by clicking the JBrowse link from any locus page:</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-1.png`} alt="Figure 1" style={{ maxWidth: '508px' }} />
          <figcaption>Figure 1</figcaption>
        </figure>
        <p>Alternatively, you can go to the homepage (or any page) and select the entire genome for a given species under the JBrowse menu tab:</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-2.png`} alt="Figure 2" style={{ maxWidth: '347px' }} />
          <figcaption>Figure 2</figcaption>
        </figure>
        <p>Those added since April include:</p>
        <ul>
          <li><a href="https://pubmed.ncbi.nlm.nih.gov/34591857/" target="_blank" rel="noopener noreferrer">Vu, et al., 2021</a>. The <em>Candida glabrata</em> <em>Upc2A</em> transcription factor is a global regulator of antifungal drug resistance pathways. PLoS Genet. 2021 Sep 30;17(9):e1009582.</li>
          <li><a href="https://pubmed.ncbi.nlm.nih.gov/37891489/" target="_blank" rel="noopener noreferrer">Ni, et al., 2023</a>. The regulatory subunits of CK2 complex mediate DNA damage response and virulence in <em>Candida glabrata</em>. BMC Microbiol. 2023 Oct 28;23(1):317.</li>
          <li><a href="https://pubmed.ncbi.nlm.nih.gov/38632999/" target="_blank" rel="noopener noreferrer">Kumar, et al., 2024</a>. SWI/SNF complex-mediated chromatin remodeling in <em>Candida glabrata</em> promotes immune evasion. iScience. 2024 Mar 27;27(4):109607.</li>
          <li><a href="https://pubmed.ncbi.nlm.nih.gov/35652307/" target="_blank" rel="noopener noreferrer">Shivarathri, et al., 2022</a>. Comparative transcriptomics reveal possible mechanisms of amphotericin B resistance in <em>Candida auris</em>. Antimicrob Agents Chemother. 2022 Jun 21;66(6):e0227621.</li>
          <li><a href="https://pubmed.ncbi.nlm.nih.gov/38466738/" target="_blank" rel="noopener noreferrer">Pelletier, et al., 2024</a>. Candida auris undergoes adhesin-dependent and -independent cellular aggregation. PLoS Pathog. 2024 Mar 11;20(3):e1012076</li>
        </ul>
      </section>

      <section className="newsletter-article newsletter-spotlight" id="research-spotlight">
        <p className="newsletter-kicker">Research Spotlight</p>
        <h2>Identification of an active RNAi pathway in <em>Candida albicans</em></h2>
        <p>Building on our recent research spotlight entitled "Two studies delve into why SC5314 is unique," a recent publication by <a href="https://www.pnas.org/doi/10.1073/pnas.2315926121" target="_blank" rel="noopener noreferrer">Iracane et al.</a> in <a href="https://www.pnas.org/" target="_blank" rel="noopener noreferrer">PNAS</a> further establishes that SC5314 is an outlier in a different area of cell biology. It seems SC5314 is defective in RNA interference when the great majority of <em>C. albicans</em> strains contain an active RNAi pathway.</p>
        <p>To study RNAi competence in SC5314, Iracane et al. focused on the known RNAi components. Whereas previous research had shown that the ribonuclease Dicer (<Link to="/locus/DCR1"><em>DCR1</em></Link>) is active in SC5314, little was known about Argonaute (<Link to="/locus/AGO1"><em>AGO1</em></Link>). They thus generated <em>ago1</em> null mutants and asked whether there was the expected increase in transcript levels of sRNA-rich loci, such as the subtelomeric <Link to="/locus/CAL0000187323"><em>TLO</em></Link> genes, as seen when Ago1p is lost in RNAi-competent strains. This increase was not observed, suggesting SC5314 is RNAi-incompetent for reasons poorly understood.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-3.png`} alt="Figure 3" style={{ maxWidth: '139px' }} />
          <figcaption>Figure 3</figcaption>
        </figure>
        <p>They then set out to characterize the <em>AGO1</em> gene to better understand RNAi deficiency in SC5314. After analysis of amino acid sequence alignment between Ago1p in SC5314 and well-characterized Argonaute proteins in diverse species, they discovered that the PAZ (Piwi/Argonaute/Zwille) domain in SC5314 differs by containing a lysine at position 361 (K361). In contrast, a glutamate at this position (E361) is universally conserved in every other species.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-4.png`} alt="Figure 4" style={{ maxWidth: '416px' }} />
          <figcaption>Figure 4</figcaption>
        </figure>
        <p>Further, this mutation does not appear to be a recent event, as 25 SC5314 strains sourced from 17 locations and the ATCC all contained the K361 variant. Likewise, the variant is found in the auxotrophic derivatives BWP17 and SN152. In total, the variant was found in nine of 296 strains, where SC5314 and its derivatives are in the nine.</p>
        <p>Next, the group looked at three different clinical isolates that contain the Ago1-E361 variant and showed active silencing of the subtelomeric <em>TLO</em> genes by means of RNA interference. They then did a swapping experiment where they introduced Ago1-K361E into the endogenous locus of the SC5314 reference strain and Ago1-E361K into the clinical isolates. Consistent with the hypothesis, RNAi was restored to SC5314 and abolished in the GC75 isolate.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-5.png`} alt="Figure 5" style={{ maxWidth: '315px' }} />
          <figcaption>Figure 5</figcaption>
        </figure>
        <p>Thus, something synergistic with the Ago1-K361 variant appears to make SC5314 RNAi incompetent with or without the full copy of the <em>AGO1</em> gene. Clearly further study is needed.</p>
        <p>The current study begs the question of whether RNAi has an important role in <em>C. albicans</em>. The loss of the pathway does not appear to impact fitness under standard laboratory conditions, however, as both a commensal and an opportunistic pathogen, <em>C. albicans</em> must continually adapt to changing niches within the host. It is possible that RNAi allows subtle and rapid adjustments that modulate fitness within a changing environment.</p>
        <p>The larger picture for <em>C. albicans</em> researchers is that once again the reference strain SC5314 contains a meaningful variation causing its phenotypes to differ from clinical isolates. Whereas the significance of RNAi remains to be determined, our previous research spotlight showed how variation in SC5314 led to increased filamentation/invasion and altered opaque/white switching compared to nearly every other strain. Now, with RNAi incompetence, SC5314 once more appears unique within <em>C. albicans</em> phylogeny.</p>
      </section>

      <section className="newsletter-article" id="upcoming-meetings">
        <h2>Upcoming Meetings</h2>
        <ul>
          <li><a href="https://easternsun.eventsair.com/2024-16th-international-congress-on-yeasts/" target="_blank" rel="noopener noreferrer">The 16<sup>th</sup> International Congress on Yeasts</a><br />Cape Town International Convention Centre, Cape Town, South Africa Sep 29–Oct 3, 2024</li>
        </ul>
        <ul>
          <li><a href="https://ecfg17.org/" target="_blank" rel="noopener noreferrer">17<sup>th</sup> European Conference on Fungal Genetics (ECFG)</a><br />Dublin, Ireland March 2–5 2025</li>
        </ul>
        <ul>
          <li>Candida and Candidiasis 2025<br />The Estrel Congress Center, Berlin, Germany; October 6–9 2025</li>
        </ul>
      </section>
    </>
  );
}

export default Summer2024;
