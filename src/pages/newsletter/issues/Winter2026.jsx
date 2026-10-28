import React from 'react';
import { Link } from 'react-router-dom';

// CGD Newsletter, Winter 2026. Generated from "Winter 2026.docx" by
// scripts/newsletter_docx_to_issue.py; edit freely after review.
// Each article is a <section> whose id matches an entry in issues/index.js.
const IMG = '/images/newsletter/winter-2026';

function Winter2026() {
  return (
    <>
      <section className="newsletter-article" id="jon-binkley-s-retirement">
        <h2>Jon Binkley’s Retirement</h2>
        <p>We are sad to say farewell to Jon Binkley this winter. Jon has worked at both CGD and AspGD over the past sixteen years, and on CGD exclusively for the last decade. He’s been both our expert bioinformatician and stalwart developer, juggling five species and multiple genomes. This past year he’s been a good-humored hero for keeping our systems operating as we’ve battled bot attacks of all shapes and sizes. (He refers to the battle as an extended game of 'whack-a-mole'.) Jon and his wife Gail are part of the longtime SGD/CGD family, as Gail worked for years as the database administrator on both databases. Jon now joins her in retirement, from which we are hoping for pictures of them both enjoying copious sunshine.</p>
        <p>But not to fear, we are extremely fortunate to have Shuai Weng from SGD come to our aid. Shuai has been with SGD since nearly the first day it launched, so she knows both databases front and back—quite literally. Shuai has already launched into writing new code to bring CGD’s website into the modern age. Stay tuned for updates!</p>
      </section>

      <section className="newsletter-article" id="gsa-meetings-in-2026">
        <h2>GSA Meetings in 2026</h2>
        <p>In a big year for those who study yeasts, the <a href="https://genetics-gsa.org/" target="_blank" rel="noopener noreferrer">Genetics Society of America</a> is hosting two important meetings. The <a href="https://genetics-gsa.org/fungal-2026/" target="_blank" rel="noopener noreferrer">33rd Fungal Genetics Meeting</a> will take place from March 17 to 22, while the <a href="https://genetics-gsa.org/yeast-2026/" target="_blank" rel="noopener noreferrer">2026 Yeast Genetics Meetings</a> will take place from June 13 to 17, both at the Asilomar Conference Grounds in Pacific Grove, CA.</p>
        <p>Registration is currently open for the June meeting, with an Abstract Submission Deadline of March 5.</p>
      </section>

      <section className="newsletter-article" id="fungal-pathogen-genomics-course">
        <h2>Fungal Pathogen Genomics Course</h2>
        <p>For trainees and those improving their familiarity with bioinformatics of fungi, consider applying for the <a href="https://coursesandconferences.wellcomeconnectingscience.org/event/fungal-pathogen-genomics-virtual-20260601/" target="_blank" rel="noopener noreferrer">Fungal Pathogen Genomics Course</a>, hosted by <a href="https://coursesandconferences.wellcomeconnectingscience.org/" target="_blank" rel="noopener noreferrer">Wellcome Connecting Science</a>. The course is being held virtually this year, which makes it more affordable and accessible for researchers across the world. The application deadline is March 16.</p>
        <p>CGD (with SGD) has assisted in instruction for this course since its inception, for which we partner with FungiDB/VEuPathDB, MycoCosm/JGI, and Ensembl Fungi (EMBL-EBI). The quality of the training is quite high, and the virtual course offers additional flexibility.</p>
      </section>

      <section className="newsletter-article newsletter-spotlight" id="research-spotlight">
        <p className="newsletter-kicker">Research Spotlight</p>
        <h2>A small <em>Candida glabrata</em> protein promotes hyphal growth in <em>C. albicans</em> during mixed-species invasive candidiasis</h2>
        <p>The <em>Candida</em> field has long been mystified by the retention of mating and meiosis factors in <em>Candida glabrata</em> (<em>Nakaseomyces glabratus</em>) when the species has never been observed to mate.</p>
        <p>Now, a new study in <a href="https://www.cell.com/current-biology/home" target="_blank" rel="noopener noreferrer">Current Biology</a> by <a href="https://pubmed.ncbi.nlm.nih.gov/41308648/" target="_blank" rel="noopener noreferrer">Parnandi et al.</a> reveals that <em>C. glabrata</em> appears to have repurposed its pheromone pathway for a different purpose, that of signaling with <em>C. albicans</em> to assist the yeast-locked <em>C. glabrata</em> to invade host tissue with hyphae.</p>
        <p>This revelation of cooperative interactions among pathogenic fungi builds upon recent descriptions of evolved cooperation between fungi and bacteria (<em>Candida albicans</em> and <em>Staphylococcus aureus</em>), whereby <em>C. albicans</em> induces upregulation of an α-toxin by <em>S. aureus</em>, leading to enhanced infection.</p>
        <p>In a reverse fixture, this new study turns the table such that <em>C. albicans</em> is the species being induced to aid in infection, in this case by another commensal fungus. Several lines of evidence previously pointed to functional interaction between <em>C. glabrata</em> and <em>C. albicans</em>, including the facts that <em>C. glabrata</em> is rarely isolated alone, that <em>C. glabrata</em> and <em>C. albicans</em> frequently co-occur in infection, and that the two species have been shown to physically interact (<a href="https://journals.asm.org/doi/10.1128/aem.02769-17" target="_blank" rel="noopener noreferrer">Olson et al., 2018</a>; <a href="https://journals.plos.org/plospathogens/article?id=10.1371/journal.ppat.1005522" target="_blank" rel="noopener noreferrer">Tati et al., 2016</a>). The mechanism for this interaction, though, has remained uncharacterized.</p>
        <p>As a first question, the researchers asked whether cell-free supernatant (CFS) from <em>C. glabrata</em> would cause a change in <em>C. albicans</em>, i.e., does <em>C. glabrata</em> secrete something? Indeed, something secreted by <em>C. glabrata</em>—but not by either <em>C. albicans</em> or <em>S. cerevisiae</em>—is a powerful inducer of <em>C. albicans</em> filamentation.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-1.png`} alt="Figure 1" style={{ maxWidth: '383px' }} />
          <figcaption>Figure 1</figcaption>
        </figure>
        <p>They next asked about the specificity of this induction, showing that the cell-free extract has no effect on non-<em>albicans</em> species of <em>Candida</em>, nor that it is exclusive to the SC5314 strain that tends toward hyperfilamentation. Rather, the interaction is specific to <em>C. glabrata</em> and <em>C. albicans</em> in a non-strain-dependent manner.</p>
        <p>So, what, then, does <em>C. glabrata</em> secrete?</p>
        <p>Via biochemical and genetic analysis, the researchers narrowed the search to a small protein encoded by an uncharacterized gene, which they renamed <Link to="/locus/YHI1"><em>YHI1</em></Link>, for Yeast to Hyphal Inducer. No homologs of this protein were identified across biology, so it appears to be unique to <em>C. glabrata</em>.</p>
        <p>Then, from a screen of deletion mutants impaired in inducing hyphal growth in <em>C. albicans</em>, they further identified a putative oligopeptide transporter that might efflux Yhi1. Upon characterization, the transporter <Link to="/locus/ste6">Ste6</Link>, appears to be a repurposed pheromone transporter, acting under the control of the mating-related MAPK signaling pathway. When asking if <em>C. glabrata</em> MAPK pathway mutants might likewise be impaired in induction of hyphal growth, they indeed found several that could no longer induce hyphae, including <Link to="/locus/gpa1"><em>gpa1</em></Link> and <Link to="/locus/gpr1"><em>gpr1</em></Link>.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-2.png`} alt="Figure 2" style={{ maxWidth: '468px' }} />
          <figcaption>Figure 2</figcaption>
        </figure>
        <p>In these mutants defective in hyphal induction, the transcript levels of <em>YHI1</em> itself were not changed. Further study showed that regulation of this protein appears to take place at the translational level, which is also the case for proteins of the MAPK pathway in <em>S. cerevisiae</em>.</p>
        <p>In an intriguing twist to the story, they discovered that efflux of Yhi1 through the Ste6 transporter happens poorly in the absence of <em>C. glabrata</em> <Link to="/locus/mfa2"><em>Mfa2</em></Link>, a putative a-factor pheromone. They further show that Mfa2 and Yhi1 stably interact to form a complex in <em>C. glabrata</em>. As in <em>S. cerevisiae</em>, Mfa2 appears to undergo processing to become mature mating factor by being farnesylated and carboxymethylated. Thus, oddly enough, it appears that the expression and efflux of the key inducer of invasive growth for <em>C. glabrata</em> depends upon the vestigial mating machinery.</p>
        <p>Further detailed analysis of the Yhi1 protein revealed two copies of an AXVXH pentapeptide sequence that has not been hitherto characterized or reported, at least one of which was shown to be necessary and sufficient for inducing hyphal growth in <em>C. albicans</em>.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-3.png`} alt="Figure 3" style={{ maxWidth: '624px' }} />
          <figcaption>Figure 3</figcaption>
        </figure>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-4.png`} alt="Figure 4" style={{ maxWidth: '258px' }} />
          <figcaption>Figure 4</figcaption>
        </figure>
        <p>They next looked at <em>C. albicans</em> to ask what might be targeted by the Yhi1 protein to facilitate the induction of hyphal growth. Using a tagged Yhi1 protein, they performed a pull-down assay with <em>C. albicans</em> cell lysate, from which they identified the peroxiredoxin <Link to="/locus/CAL0000174369">Tsa1</Link> from <em>C. albicans</em> as physically interacting with <em>C. glabrata</em> Yhi1.</p>
        <p>Unlike uncharacterized Yhi1, <em>C. albicans</em> Tsa1 has been studied for its roles as both a protective antioxidant enzyme and also an activator of the yeast-to-hyphal transition in response to oxidative stress, via the Hog1 stress-activated MAPK pathway. Thus, while it is not known whether the <em>C. glabrata</em> Yhi1 small protein becomes internalized into the <em>C. albicans</em> yeast cell, it appears the interaction somehow triggers the same yeast-to-hyphal transition as does oxidative stress.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-5.png`} alt="Figure 5" style={{ maxWidth: '221px' }} />
          <figcaption>Figure 5</figcaption>
        </figure>
        <p>Which begs several questions. First, what does <em>C. albicans</em> get, if anything, from the interaction, i.e., is this a case of hijacking, or is there a subtle symbiosis that we've yet to identify? Then, given the degree of conservation between <em>TSA1</em> genes between close relatives among the Candida spp., such as <em>C. albicans</em> and <em>C. tropicalis</em>, why doesn’t the Yhi1 protein secreted by <em>C. glabrata</em> induce filamentation in other species?</p>
        <p>Despite these next questions, two important mysteries have been at least partially solved by this pivotal finding. We now know a means by which the yeast-locked <em>C. glabrata</em> can get out of the gut to cause systemic infection, via use of the hyphal penetration achieved by <em>C. albicans</em>. Further, we have at least one reason that <em>C. glabrata</em> has retained much of the mating machinery when it doesn't appear to mate, in that it has reconfigured the pheromone efflux pathway to help it find assistance in infection, rather than reproduction.</p>
      </section>

      <section className="newsletter-article" id="upcoming-meetings">
        <h2>Upcoming Meetings</h2>
        <ul>
          <li><a href="https://genetics-gsa.org/fungal-2026/" target="_blank" rel="noopener noreferrer"><strong>33</strong><strong><sup>rd</sup></strong> <strong>Fungal Genetics Conference</strong></a><br />Asilomar Conference Grounds, Pacific Grove, CA<br />March 17 – 22, 2026</li>
          <li><a href="https://coursesandconferences.wellcomeconnectingscience.org/event/antimicrobial-resistance-genomes-big-data-and-emerging-technologies-20260323/" target="_blank" rel="noopener noreferrer"><strong>Antimicrobial Resistance - Genomes, Big Data and Emerging Technologies</strong></a><br />Wellcome Genome Campus, UK and Virtual<br />March 23 – 25, 2026</li>
          <li><a href="https://coursesandconferences.wellcomeconnectingscience.org/event/fungal-pathogen-genomics-virtual-20260601/" target="_blank" rel="noopener noreferrer"><strong>Fungal Pathogen Genomics (Virtual Course)</strong></a><br />June 1 – 5, 2026</li>
          <li><a href="https://genetics-gsa.org/yeast-2026/" target="_blank" rel="noopener noreferrer"><strong>2026 Yeast Genetics Meeting</strong></a><br />Asilomar Conference Grounds, Pacific Grove, CA<br />June 13 – 17, 2026</li>
        </ul>
      </section>
    </>
  );
}

export default Winter2026;
