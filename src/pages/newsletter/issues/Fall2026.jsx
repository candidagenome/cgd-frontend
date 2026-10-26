import React from 'react';
import { Link } from 'react-router-dom';

// CGD Newsletter, Fall 2026. Generated from "Fall 2026.docx" by
// scripts/newsletter_docx_to_issue.py; edit freely after review.
// Each article is a <section> whose id matches an entry in issues/index.js.
const IMG = '/images/newsletter/fall-2026';

function Fall2026() {
  return (
    <>
      <section className="newsletter-article" id="naming-of-uncharacterized-orthologs">
        <h2>Naming of Uncharacterized Orthologs</h2>
        <p>It has heretofore been our policy at CGD to only append standard names to genes when a published study applies the name. Recently, with the addition of locus pages for <em>C. tropicalis</em> and the addition of the Synteny Browser that makes even more visual the nature of close relationships among the pathogenic yeasts, as well as with <em>S. cerevisiae</em>, we have come to think there might be value in appending established names to clear orthologs.</p>
        <p>Upon asking the community whether this would be advisable, the feedback received was all positive. We thus moved forward with the process. As a first step, we assessed gene families where one-to-one orthologs do not necessarily exist, and assignment of transitive orthology can create confusion. We thus assessed 104 putative families to decide which to keep, which members to include, and how to refer to the family. This was a curated process with multiple rounds of revision. Here is an example of how these family members look on a given page, where the query locus is <em>C. parapsilosis</em> CPAR2_807880.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-1.png`} alt="Figure 1" style={{ maxWidth: '624px' }} />
          <figcaption>Figure 1</figcaption>
        </figure>
        <p>For the ortholog clusters that are not gene families, the transfer was straightforward for clusters that met the criteria of (1) having two genes with the same name and (2) not having any other experimental names in the cluster. Here’s the example of an ortholog cluster for <em>C. albicans GRE3</em>.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-2.png`} alt="Figure 2" style={{ maxWidth: '523px' }} />
          <figcaption>Figure 2</figcaption>
        </figure>
        <p>One immediate advantage of the orthologous name transfers has been improved searching of new literature by our algorithms. Where systematic names are used infrequently, the name of the ortholog cluster is used with much greater frequency, such that we now discover papers more efficiently.</p>
      </section>

      <section className="newsletter-article" id="expanded-set-of-drug-related-literature-topic-tags">
        <h2>Expanded Set of Drug-Related Literature Topic Tags</h2>
        <p>Given the ongoing preponderance of papers addressing drugs and drug resistance, we felt it was time to assign more fine-grained Literature Topic tags to this set of papers, with the goal of making these papers more findable within CGD. The following set of topics are now being assigned where relevant either to genes in a study or to a study as a whole.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-3.png`} alt="Figure 3" style={{ maxWidth: '206px' }} />
          <figcaption>Figure 3</figcaption>
        </figure>
        <p>Papers addressing these topics can be located most easily by means of the <Link to="/literature-topic-search">Literature Topic Search</Link> tool.</p>
      </section>

      <section className="newsletter-article" id="new-chip-seq-and-chec-seq-datasets">
        <h2>New ChIP-Seq and ChEC-Seq datasets</h2>
        <p>One remaining goal for CGD is to improve our annotation of transcriptional regulation. To this end, we created a new pipeline for adding ChIP-Seq and ChEC-Seq datasets to JBrowse. As of yet, we have only identified datasets for <em>C. albicans</em>, but the pipeline will import for any species as new datasets become available. Please let us know of any datasets that might be appropriate.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-4.png`} alt="Figure 4" style={{ maxWidth: '319px' }} />
          <figcaption>Figure 4</figcaption>
        </figure>
      </section>

      <section className="newsletter-article" id="annotation-of-repetitive-elements">
        <h2>Annotation of Repetitive Elements</h2>
        <p>We recently completed a full assessment of repetitive sequence and transposable elements within all six species. We created <a href="https://github.com/candidagenome/cgd-backend/tree/main/scripts/repeat_te" target="_blank" rel="noopener noreferrer">discovery pipeline scripts</a>, together with an <a href="https://github.com/candidagenome/cgd-backend/blob/main/docs/REPEAT_TE_ANNOTATION_STRATEGY.md" target="_blank" rel="noopener noreferrer">annotation strategy document</a>, all of which we are making available as reusable downloads.</p>
        <p>We custom built a <em>C. albicans</em> library by extracting the sequences of all 366 curated repeat/TE features and formatting it as a <a href="/download/repeat_te/">RepeatMasker library that is available for download</a>. We did likewise for all the species in CGD and have made each available.</p>
        <p>Detailed information about our repeat and TE annotation is available on a dedicated <Link to="/help/repeat-te">repeat/TE help page</Link>, linked from the Help menu at the top of every page in CGD. The download links can be found on this page, as well as on the Downloads menu at the top of every page.</p>
      </section>

      <section className="newsletter-article newsletter-spotlight" id="research-spotlight">
        <p className="newsletter-kicker">Research Spotlight</p>
        <h2>Hac1-independent functions of Ire1 drive morphogenesis in <em>Candida albicans</em> through distinct transcriptional programs</h2>
        <p>The canonical example of ER stress-induced alternative splicing of <em>HAC1</em> mRNA via Ire1p has been well characterized in <em>Saccharomyces cerevisiae</em> (Cox and Walter, 1996; Mori et al., 1996). For this species, the presence of unfolded proteins in the cytoplasm triggers splicing of an intron from the <em>HAC1</em> mRNA that results in a functional transcription factor that enters the nucleus to activate the stress response.</p>
        <p>In contrast, it appears that most of the pathogenic yeasts, as well as <em>S. pombe</em>, have evolved different means to respond to ER stress, with varying reliance on Ire1 and Hac1. The near-relative to <em>S. cerevisiae, C. glabrata</em> (<em>Nakaseomyces glabratus</em>), does possess an <em>HAC1</em> ortholog, however alternative splicing does not appear to factor in the stress response. Where evidence had suggested that <em>C. albicans</em> might employ a more canonical version that does employ alternative splicing, a recent study by <a href="https://pubmed.ncbi.nlm.nih.gov/42305016/" target="_blank" rel="noopener noreferrer">Stack-Couture et al.</a> in the Journal of Cell Science, looked more closely into this species.</p>
        <p>In <em>C. albicans</em>, <Link to="/locus/IRE1">Ire1</Link> and <Link to="/locus/HAC1">Hac1</Link> have partially overlapping roles in several processes beyond the unfolded protein response (UPR, due to ER stress), including filamentation, which is required for virulence. The goal of the study was to tease out these roles, especially with respect to activation of transcription for genes involved in the stress response separate from genes involved in morphogenesis.</p>
        <p>As the <em>C. albicans</em> protein can functionally complement loss of <em>S. cerevisiae IRE1</em>, it is evident that splicing by Ire1 is retained in <em>C. albicans</em>. Further, however, <em>C. albicans</em> Ire1 is required for morphogenesis, as an <em>ire1</em> mutant grown on serum will not filament. Both the kinase and nuclease activities of the protein are necessary for filamentation, as either a kinase-dead or nuclease-dead mutant will likewise fail to filament.</p>
        <p>As a first step to understanding how Ire1 mediates both stress response and filamentation, the research group looked in detail at transcriptomics for the mutant versus wild type under ER stress (tunicamycin treatment) compared to filament induction (serum at 37 deg).</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-5.png`} alt="Figure 5" style={{ maxWidth: '274px' }} />
          <figcaption>Figure 5</figcaption>
        </figure>
        <p>As shown in the figure, the genes showing different regulation under the two conditions fall into highly distinct clusters. To separate those genes affected by Ire1 from those affected by a blanket response to conditions, the researchers employed the GRACE mutant library to identify those genes showing a growth defect specific to the ER stress response (i.e., tunicamycin) but not by mutation alone. Next, they looked at what is known of regulation of the genes identified as being dependent on Ire1 under filamentation-inducing conditions. <a href="https://yeastract-plus.org/pathoyeastract/" target="_blank" rel="noopener noreferrer">PathoYeastract</a> was instrumental in assembling a set of 49 transcription factors with significant roles in regulation of morphogenesis. Interestingly, Hac1 was not within this set, which the researchers speculate might be due to lack of characterization rather than lack of significance.</p>
        <p>To address the question of whether <em>HAC1</em> acts in morphogenesis, they looked at (1) whether it was required for filamentation and (2) whether it was spliced upon induction of filamentation. Observation of filamentation in a <em>hac1</em> mutant shows decreased and abnormal filamentation, but not the total absence seen in an <em>ire1</em> mutant, indicating that whereas Ire1 is required, Hac1 plays a comparatively minor role.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-6.png`} alt="Figure 6" style={{ maxWidth: '453px' }} />
          <figcaption>Figure 6</figcaption>
        </figure>
        <p>With respect to splicing of <em>HAC1</em> mRNA in response to filamentation induction (serum), they observed a similar result, in that splicing does occur but appears to be a minor factor. Using the strong increase in splicing of <em>HAC1</em> in response to ER stress (tunicamycin) as a positive control, they saw that splicing during filamentation occurs to a much smaller extent and was insignificant after 120 min. They concluded that Ire1 modulates the filamentation response mainly via factors other than <em>HAC1</em>.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-7.png`} alt="Figure 7" style={{ maxWidth: '240px' }} />
          <figcaption>Figure 7</figcaption>
        </figure>
        <p>To identify these factors specific to Ire1-mediated responses independent of <em>HAC1</em> splicing, the group looked at transcriptomic data to see that <em>ERG5</em> and <em>YWP1</em> appear to be regulated by Ire1 in response to tunicamycin, while <em>PGA31</em> is a major player in response to serum.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-8.png`} alt="Figure 8" style={{ maxWidth: '491px' }} />
          <figcaption>Figure 8</figcaption>
        </figure>
        <p>They next attempted to assess whether regulation of these three genes is via mRNA cleavage by Ire1, but this proved inconclusive via either assessment of motifs or treatment with a transcription inhibitor.</p>
        <p>Finally, the group asked whether Ire1 affects morphogenesis and/or ER stress through impact on cell wall proteins, as an <em>ire1</em> mutant is sensitive to cell wall stressors, and whether this effect requires <em>HAC1</em>. They again saw a similar pattern, where a <em>hac1</em> mutant shows a less severe sensitivity to cell wall stress and that constitutively spliced <em>HAC1</em> (<em>HAC1</em>*) could only partially rescue the phenotype.</p>
        <p>It thus appears that Ire1 plays several critical roles in <em>C. albicans</em> for which <em>HAC1</em> activation is responsible for only a subset. Alternative splicing of <em>HAC1</em> in <em>C. albicans</em> appears significant for the unfolded protein response in the same manner as in <em>S. cerevisiae</em>. In <em>C. albicans</em>, however, Ire1 regulates filamentation and cell wall arrangement via activation of factors apart from <em>HAC1</em>. The pathogenic yeast thus retains one feature while evolving additional ones as adaptation to life inside a host.</p>
      </section>
    </>
  );
}

export default Fall2026;
