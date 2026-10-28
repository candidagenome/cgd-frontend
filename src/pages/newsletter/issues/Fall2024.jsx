import React from 'react';

// CGD Newsletter, Fall 2024. Generated from "Newsletter Fall 2024.docx" by
// scripts/newsletter_docx_to_issue.py; edit freely after review.
// Each article is a <section> whose id matches an entry in issues/index.js.
const IMG = '/images/newsletter/fall-2024';

function Fall2024() {
  return (
    <>
      <section className="newsletter-article" id="new-taxonomy-in-candida">
        <h2>New Taxonomy in <em>Candida</em></h2>
        <p>The genus <em>Candida</em> was originally formed as a heterogeneous grouping of opportunistic pathogenic budding yeasts that lacked sexual reproduction (<a href="https://pubmed.ncbi.nlm.nih.gov/38895705/" target="_blank" rel="noopener noreferrer">38895705</a>). Further genomic study has revealed evolutionary distances between these species that argues for taxonomic revision within the budding yeast subphylum Saccharomycotina (<a href="https://pubmed.ncbi.nlm.nih.gov/33148650/" target="_blank" rel="noopener noreferrer">33148650</a>, <a href="https://pubmed.ncbi.nlm.nih.gov/39161632/" target="_blank" rel="noopener noreferrer">39161632</a>, <a href="https://pubmed.ncbi.nlm.nih.gov/36632423/" target="_blank" rel="noopener noreferrer">36632423</a>). Interestingly, it appears pathogenicity within humans has evolved multiple times in this subphylum (<a href="https://pubmed.ncbi.nlm.nih.gov/35508719/" target="_blank" rel="noopener noreferrer">35508719</a>).</p>
        <p>NCBI has recently announced <a href="https://ncbiinsights.ncbi.nlm.nih.gov/2024/08/29/ncbi-taxonomy-updates-to-yeasts/" target="_blank" rel="noopener noreferrer">adoption of new taxonomy</a> that affects the <em>Candida</em> community. While CGD has no immediate plans to adopt the name changes, we believe it a good time to open discussion, as we would appreciate hearing from the community either in favor of or opposed to updating these names.</p>
        <p>The specific name changes are as follows:</p>
        <ul>
          <li><em>Clavispora lusitaniae</em> (syn. <em>Candida lusitaniae</em>)</li>
          <li><em>Pichia kudriavzevii</em> (syn. <em>Candida krusei</em>)</li>
          <li><em>Meyerozyma guilliermondii</em> (syn. <em>Candida guilliermondii</em>)</li>
          <li><em>Nakaseomyces glabratus</em> (syn. <em>Candida glabrata</em>)</li>
          <li><em>Candidozyma auris</em> (syn. <em>Candida auris</em>)</li>
        </ul>
      </section>

      <section className="newsletter-article" id="expression-datasets">
        <h2>Expression Datasets</h2>
        <p>Given the comparative ease of transcriptomics at present, so many studies are employing these techniques that the data are rapidly becoming overwhelming. We thus intend to introduce a new tool to pool datasets and create a clearer picture of expression metadata. We have proposed this as an aim for our next grant cycle. In the meantime, we have added a number of datasets that we believe to be of general interest and will continue importing datasets likely to be of use a wider audience. As examples, a study that looks at expression during biofilm development (under specific conditions) is likely to be of wider use than a study that looks at differing expression between wild type and a single mutant with altered biofilms.</p>
        <p>If you think your own dataset might be of general interest and would be a good addition to CGD, please (1) submit the data to NCBI; (2) let us know about it when you submit to NCBI; and (3) link a publication to the submission (or tell us the associated publication if they were not originally linked), as we cannot import a dataset without a reference.</p>
        <p>The current total number of RNA-Seq datasets per species in CGD is as follows:</p>
        <p>14 for <em>C. albicans</em></p>
        <p>10 for <em>C. auris</em></p>
        <p>3 for <em>C. dubliniensis</em></p>
        <p>7 for <em>C. glabrata</em></p>
        <p>3 for <em>C. parapsilosis</em></p>
        <p>Those added since July include:</p>
        <ul>
          <li><a href="https://pubmed.ncbi.nlm.nih.gov/38466738/" target="_blank" rel="noopener noreferrer">Pelletier, et al., 2024</a>. <em>Candida auris</em> undergoes adhesin-dependent and -independent cellular aggregation. PLoS Pathog. 2024 Mar 11;20(3):e1012076</li>
          <li><a href="https://pubmed.ncbi.nlm.nih.gov/38905306/" target="_blank" rel="noopener noreferrer">Rai, et al., 2024</a>. Metabolic reprogramming during <em>Candida albicans</em> planktonic-biofilm transition is modulated by the transcription factors Zcf15 and Zcf26. PLoS Biol. 2024 Jun 21;22(6):e3002693.</li>
          <li><a href="https://pubmed.ncbi.nlm.nih.gov/38921373/" target="_blank" rel="noopener noreferrer">Zhang, et al. 2024</a>. DNA Damage Checkpoints Govern Global Gene Transcription and Exhibit Species-Specific Regulation on HOF1 in <em>Candida albicans</em>. J Fungi (Basel). 2024 May 29;10(6):387.</li>
        </ul>
      </section>

      <section className="newsletter-article newsletter-spotlight" id="research-spotlight">
        <p className="newsletter-kicker">Research Spotlight</p>
        <h2>Infectious Synergism between <em>Candida albicans</em> and <em>Staphylococcus aureus</em></h2>
        <p>In an intriguing result, it appears that <em>Candida albicans</em> and <em>Staphylococcus aureus</em> have evolved a form of cooperative pathogenesis in the mammalian abdomen. In a report in Nature Communications by <a href="https://www.nature.com/articles/s41467-024-50058-w" target="_blank" rel="noopener noreferrer">Paul et al.,</a> the group describes the mechanisms behind the previous observation that <em>C. albicans</em> induces upregulation of an α-toxin by <em>S. aureus</em>, leading to enhanced infection.</p>
        <p>The study begins by demonstrating that the α-toxin released by <em>S. aureus</em> is the cause of organ damage during intra-abdominal infection (IAI) in mice, as bacteria lacking the ability to make the toxin fail to cause damage during co-infection with <em>C. albicans</em>. They next show that the α-toxin must form functional pores in the cell membrane to take part in lethal synergism, as an inactivating point mutation H35L leads to lack of virulence.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-1.png`} alt="Figure 1" style={{ maxWidth: '624px' }} />
          <figcaption>Figure 1</figcaption>
        </figure>
        <p>To seek the mechanism for what <em>C. albicans</em> contributes to this synergism, the team utilized that the fungus stimulates the staphylococcal <em>agr</em> quorum sensing system, which is required for toxicity. They thus undertook a screen of nonessential transcription factor deletion mutants in <em>C. albicans</em> to look for mutants that failed to cause the wild-type fluorescence of an <em>S. aureus agr</em>-GFP reporter. They identified nine candidate factors in this screen.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-2.png`} alt="Figure 2" style={{ maxWidth: '624px' }} />
          <figcaption>Figure 2</figcaption>
        </figure>
        <p>Analysis of which of these might drive synergistic lethality led to <em>ZCF13</em>. They found a <em>zcf13Δ/Δ</em> mutant was unable to induce <em>S. aureus</em> α-toxin production in the kidney and peritoneal cavity compared to a control. Further, upon coinfection of mice with wild-type <em>S. aureus</em> and various <em>C. albicans</em> strains, the only population of mice with 0% mortality were those coinfected with the <em>zcf13</em>Δ/Δ mutant.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-3.png`} alt="Figure 3" style={{ maxWidth: '487px' }} />
          <figcaption>Figure 3</figcaption>
        </figure>
        <p>To understand the mechanism behind the impact of <em>ZCF13</em> on synergistic lethality, the researchers next performed transcriptomics. Interestingly, they noted a strong downregulation of the ribokinase <em>RBK1</em> in the <em>zcf13</em>Δ/Δ mutant. This ribokinase is required for ribose catabolism and, indeed, the mutant grows poorly when pentose sugars are supplied as the sole carbon source.</p>
        <p>So, what’s the connection between pentose sugars and induction of bacterial α-toxin?</p>
        <p>As mentioned above, <em>S. aureus</em> produces a number of toxins that are primarily regulated through the <em>agr</em> quorum sensing locus (Thoendel et al., 2011). Previous studies in other bacterial species have shown that ribose interferes with biofilm production and quorum sensing (<a href="https://pubmed.ncbi.nlm.nih.gov/29018429/" target="_blank" rel="noopener noreferrer">Liu et al., 2017</a>). Thus, the researchers asked similar questions about the effects of ribose in <em>S. aureus</em>. They found that while all pentose sugars inhibited toxin production in <em>S. aureus</em>, ribose was an especially potent inhibitor. Further, the homozygous <em>rbk1</em> mutant phenocopies the <em>zcf13</em> mutant for failure to stimulate <em>agr</em>-based toxicity, thereby improving survival. Consistent with this, the <em>HGT7</em> ribose transporter appears regulated by Zcf13p and an <em>hgt7</em> mutant displays a similar phenotype.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-4.png`} alt="Figure 4" style={{ maxWidth: '624px' }} />
          <figcaption>Figure 4</figcaption>
        </figure>
        <p>As ribose is inhibitory to toxin production, <em>ZCF13</em> improves toxicity by stimulating breakdown of ribose via upregulation of the ribokinase <em>RBK1</em>, which uses ribose as an input. Similarly, the sugar importer <em>HGT7</em> is regulated by <em>ZCF13</em> and lack of it causes an increase in ribose levels.</p>
        <p>The consistency of these results is unexpected, given the challenging complexities of microbe-microbe interaction studies. That this study appears to have unraveled the mechanics of an intricate polymicrobial infection could lead to breakthroughs in treating this severe disease.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-5.png`} alt="Figure 5" style={{ maxWidth: '440px' }} />
          <figcaption>Figure 5</figcaption>
        </figure>
      </section>

      <section className="newsletter-article" id="upcoming-meetings">
        <h2>Upcoming Meetings</h2>
        <ul>
          <li><a href="https://ecfg17.org/" target="_blank" rel="noopener noreferrer">17th European Conference on Fungal Genetics (ECFG)</a><br />Dublin, Ireland; March 2–5, 2025</li>
          <li><a href="https://microbiologysociety.org/event/society-events-and-meetings/candida-and-candidiasis-2025.html" target="_blank" rel="noopener noreferrer">Candida and Candidiasis 2025</a><br />The Estrel Congress Center, Berlin, Germany; October 6–9 2025</li>
        </ul>
      </section>
    </>
  );
}

export default Fall2024;
