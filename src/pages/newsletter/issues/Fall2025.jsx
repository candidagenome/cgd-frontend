import React from 'react';
import { Link } from 'react-router-dom';

// CGD Newsletter, Fall 2025. Generated from "Newsletter Fall 2025.docx" by
// scripts/newsletter_docx_to_issue.py; edit freely after review.
// Each article is a <section> whose id matches an entry in issues/index.js.
const IMG = '/images/newsletter/fall-2025';

function Fall2025() {
  return (
    <>
      <section className="newsletter-article" id="introducing-a-public-wiki-for-candida">
        <h2>Introducing a Public Wiki for <em>Candida</em></h2>
        <p>CGD thought it would be useful to provide a single reference source for the pathogenic <em>Candida</em> spp. We envision this site to be useful to established researchers as a reference for quick answers to questions such as "Which pathogenic <em>Candida</em> make true hyphae versus pseudohyphae?" The primary usefulness, however, is likely to be for trainees new to the field of <em>Candida</em>. The site provides links and references covering a wide breadth of knowledge, including strains, protocols, seminal references, and comparisons between species.</p>
        <p>The <a href="http://publicwiki.candidagenome.org/" target="_blank" rel="noopener noreferrer">site is here</a> and is findable on our homepage via the Community menu. Make a shortcut!</p>
        <p>Short outline of wiki:</p>
        <ul>
          <li>Seminal <em>Candida</em> Papers</li>
          <ul>
            <li>Section for each species</li>
          </ul>
          <li>Current Taxonomy</li>
          <li>Strain Information</li>
          <ul>
            <li>Section for each species</li>
          </ul>
          <li>Protocols and Methods</li>
          <ul>
            <li>Section for each species</li>
          </ul>
          <li>Species Comparisons by Topic</li>
          <ul>
            <li>Ploidy</li>
            <li>CUG codon usage</li>
            <li>Mitochondrial genome type</li>
            <li>Filamentous growth type</li>
            <li>Biofilms composition</li>
            <li>Pathogenicity</li>
            <li>Mating/Reproduction</li>
            <li>Drug resistance</li>
            <li>Respiratory metabolism</li>
            <li>Virulence Factors</li>
          </ul>
          <li>Datasets Available in CGD</li>
        </ul>
      </section>

      <section className="newsletter-article" id="candida-and-candidiasis-2025">
        <h2><em>Candida</em> and Candidiasis 2025</h2>
        <p>The biennial <em>Candida</em> and Candidiasis meeting this year took place in Europe for the first time, from 6–9 October at the Estrel Congress Center in Berlin, Germany. Now hosted by the non-profit Microbiology Society, based in London, the conference is becoming more global. The plan as explained at the meeting is to alternate between North America and Europe. The next meeting is likely to take place in Mexico or Canada, but the exact location is not yet decided.</p>
        <p>This year's keynote speakers were Sarah Gaffen of the University of Pittsburgh speaking on "A cytokinologist's view of immunity in <em>Candida</em>" and Bernard Hube of Leibniz-HKI and FSU-Jena, Germany speaking on "The commensal and pathogenic lifestyles of <em>Candida albicans</em>." Both talks were excellent.</p>
        <p>Amidst talks on drug discovery, pathogenesis, and clinical aspects, several newer themes also emerged within the sessions. Building on Dr. Gaffen's keynote, there were more talks on the interplay between host and pathogen with respect to immunological crosstalk. Another theme was polymicrobial interactions, with a number of excellent reports on how other microbes in the mammalian microbiome can either repress or boost <em>Candida</em>. (See this issue's Research Spotlight for a recent paper on this theme.) A third theme was the prevalence of extracellular vesicles as important for fungal signaling and invasion.</p>
        <p>The <a href="https://microbiologysociety.org/event/society-events-and-meetings/candida-and-candidiasis-2025.html?keyword=" target="_blank" rel="noopener noreferrer">abstracts</a> for talks and posters can be found at the Microbiology Society website.</p>
      </section>

      <section className="newsletter-article newsletter-spotlight" id="research-spotlight">
        <p className="newsletter-kicker">Research Spotlight</p>
        <h2><em>Candida albicans Ssy1</em> is the extracellular sensor of gut microbiota-derived peptidoglycan fragments mediating invasive hyphal growth in the host</h2>
        <p>The human gut hosts numerous microbial interactions that we've only just begun to understand. In 2021 it was reported by <a href="https://pubmed.ncbi.nlm.nih.gov/33963193/" target="_blank" rel="noopener noreferrer">Tan et al</a>. that broad-spectrum antibiotics cause bacteria to release significant quantities of peptidoglycan fragments (PGNs) that potently induce invasive hyphal growth by <em>C. albicans.</em> Now, a study just released by <a href="https://pubmed.ncbi.nlm.nih.gov/40695824/" target="_blank" rel="noopener noreferrer">Li et al</a>. elegantly shows not one but two key aspects of how the fungus detects, internalizes, and regulates response to PGNs.</p>
        <p>The first question addressed in the study was how <em>C. albicans</em> uptakes the peptidoglycan fragments. By knocking out all seven known peptide transporters, they showed a lack of all peptide transport, even when a peptide was supplied as the sole nitrogen source. By this they determined that the PGN transporter must be among this collection. Using a complementation panel, they determined that transport of PGNs was restored to the greatest degree by <Link to="/locus/CAL0000180262">Opt4</Link>, with residual activity supplied by <Link to="/locus/Opt2">Opt2</Link> and <Link to="/locus/CAL0000185426">Opt3</Link>, which also have the greatest sequence similarity to Opt4. This result was confirmed by individual knockouts, among which <em>opt4Δ/Δ</em> displayed the greatest reduction in PGN transport.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-1.png`} alt="Figure 1" style={{ maxWidth: '125px' }} />
          <figcaption>Figure 1</figcaption>
        </figure>
        <p>Further, heterologous expression of <em>C. albicans</em> <em>OPT4</em> in <em>S. cerevisiae</em>, which does not normally uptake PGNs, led to ready uptake of various species of peptidoglycan.</p>
        <p>Next, building on existing knowledge that upregulation of OPT gene expression can be triggered by the extracellular presence of their cognate peptides, the group asked how these signals might be transduced. Since it was already known that the tripartite SPS (<Link to="/locus/ssy1">Ssy1</Link>-<Link to="/locus/Ptr3">Ptr3</Link>-<Link to="/locus/ssy5">Ssy5</Link>) system mediates both the sensing of extracellular signals and transduction of a signal that triggers expression of <Link to="/locus/OPT1"><em>OPT1</em></Link> and <Link to="/locus/CAL0000185426"><em>OPT3</em></Link>, they first asked if the SPS complex also regulates <em>OPT4</em>. The short answer is no, that <em>OPT4</em> expression is not controlled by the SPS system.</p>
        <p>In the course of this work, however, they uncovered some intriguing clues. First, that the cellular entry of PGN peptides does not appear to be required for PGN-induced hyphal growth, i.e., the signal for hyphal growth could be uncoupled from PGN transport. Their other important clue was that the cell surface protein Ssy1, the subunit of the SPS complex which senses extracellular amino acids, appeared to be required for hyphal growth because a mutant showed no hyphal induction. This finding suggested that Ssy1 might sense PGNs and transduce the signal by a means yet to be discovered. The team explored this possibility in various elegant ways, showing that the signal from PGN to hyphal growth was specific to sensing by Ssy1, and that it employed the cAMP-PKA pathway (involving <Link to="/locus/UME6"><em>UME6</em></Link> and <Link to="/locus/EFG1"><em>EFG1</em></Link> upregulation), rather than the MAPK pathway.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-2.png`} alt="Figure 2" style={{ maxWidth: '624px' }} />
          <figcaption>Figure 2</figcaption>
        </figure>
        <p>To ask how the Ssy1 protein achieves unique specificity, the group made targeted mutations and expressed the mutant proteins in a null background. The large protein is composed of twelve predicted transmembrane domains bracketed on both the N-terminal and C-terminal sides by extensions into the cytoplasm. The protein also includes two predicted extracellular loops that are implicated in ligand sensing. By means of targeted mutations, they demonstrated the requirement for the N-terminal extension (N300) and the L78 extracellular loop in hyphal induction by PGN.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-3.png`} alt="Figure 3" style={{ maxWidth: '452px' }} />
          <figcaption>Figure 3</figcaption>
        </figure>
        <p>The upshot of this work is twofold. We now have a working model of how PGNs produced by bacterial breakdown in the gut are sensed by <em>C. albicans</em> to trigger hyphal invasion.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-4.png`} alt="Figure 4" style={{ maxWidth: '419px' }} />
          <figcaption>Figure 4</figcaption>
        </figure>
        <p>Further, we have a new drug target in Ssy1. Indeed, an <em>ssy1Δ/Δ</em> strain shows no response to antibiotic-induced PGN storm in the mouse gut, remaining in the yeast form with no signs of systemic dissemination. Inhibition of this target is thus likely to inhibit disseminated candidiasis.</p>
      </section>

      <section className="newsletter-article" id="upcoming-meetings">
        <h2>Upcoming Meetings</h2>
        <ul>
          <li><a href="https://www.keystonesymposia.org/conferences/conference-listing/meeting/A12026" target="_blank" rel="noopener noreferrer">Keystone Symposium on Fungal Pathogens</a><br />Breckenridge, Colorado, January 12 - 15, 2026</li>
        </ul>
        <ul>
          <li><a href="https://coursesandconferences.wellcomeconnectingscience.org/event/antimicrobial-resistance-genomes-big-data-and-emerging-technologies-20260323/" target="_blank" rel="noopener noreferrer"><strong>Antimicrobial Resistance - Genomes, Big Data and Emerging Technologies</strong></a><br />Wellcome Genome Campus, UK and Virtual<br />March 23 - 25, 2026</li>
        </ul>
      </section>
    </>
  );
}

export default Fall2025;
