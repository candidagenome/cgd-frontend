import React from 'react';
import { Link } from 'react-router-dom';

// CGD Newsletter, Winter 2025. Generated from "Newsletter Winter 2025.docx" by
// scripts/newsletter_docx_to_issue.py; edit freely after review.
// Each article is a <section> whose id matches an entry in issues/index.js.
const IMG = '/images/newsletter/winter-2025';

function Winter2025() {
  return (
    <>
      <section className="newsletter-article" id="new-assemblies-of-candida-auris">
        <h2>New assemblies of <em>Candida auris</em></h2>
        <p>With the published announcement last summer by <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11465782/" target="_blank" rel="noopener noreferrer">Cauldron et al.</a> of an improved genome assembly of <em>Candida auris</em> strain <Link to="/genome-snapshot/C_auris_B8441">B8441</Link>, CGD is updating the reference genome for this strain so the new assembly can be downloaded, analyzed, and used for searches. Where the previous best assembly contained 15 contigs, the new assembly has been condensed to seven chromosomes using alignment to fill gaps. The submitted genome is available as <a href="https://www.ncbi.nlm.nih.gov/datasets/genome/GCA_002759435.3/" target="_blank" rel="noopener noreferrer">GCA_002759435.3</a>.</p>
        <p>To the further good of <em>C. auris</em> researchers, <a href="https://pubmed.ncbi.nlm.nih.gov/39230279/" target="_blank" rel="noopener noreferrer">Mahar et al.</a> announced the assemblies of three other strains of <em>C. auris</em> representing three distinct geographical clades: South Asian (Clade I, strain B11103); South African (Clade III, strain B11221); and South American (Clade IV, strain B11244). Containing 8 contigs each, these assemblies will be valuable for performing genomic studies on new isolates from these clades. CGD will provide these three strains as options to search against within our internal BLAST tools. The data are available at NCBI as <a href="https://www.ncbi.nlm.nih.gov/datasets/genome/GCA_031359945.2/" target="_blank" rel="noopener noreferrer">GCA_031359945.2 </a>(strain B11103), <a href="https://www.ncbi.nlm.nih.gov/datasets/genome/GCA_031357835.2/" target="_blank" rel="noopener noreferrer">GCA_031357835.2</a> (strain B11244), and <a href="https://www.ncbi.nlm.nih.gov/datasets/genome/GCA_031357565.2/" target="_blank" rel="noopener noreferrer">GCA_031357565.2</a> (strain B11221)</p>
      </section>

      <section className="newsletter-article" id="cgd-manuscript-in-genetics">
        <h2>CGD Manuscript in <em>Genetics</em></h2>
        <p>CGD is now taking part in the annual special issue in <em>Genetics</em> on “<a href="https://academic.oup.com/genetics/search-results?f_TocHeadingTitleList=Knowledgebase+and+Database+Resources" target="_blank" rel="noopener noreferrer">Knowledgebase and Database Resources</a>.” These papers are designed to highlight the importance of each knowledgebase, the most recent features and/or upgrades, and expected future directions. Whether or not you use CGD regularly, you might be unaware of features that could be useful to your research, thus <a href="https://academic.oup.com/genetics/advance-article-abstract/doi/10.1093/genetics/iyaf001/7944773?redirectedFrom=fulltext" target="_blank" rel="noopener noreferrer">this recent publication</a> aims to inspire extended use of the available knowledge.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-1.png`} alt="Figure 1" style={{ maxWidth: '511px' }} />
          <figcaption>Figure 1</figcaption>
        </figure>
      </section>

      <section className="newsletter-article newsletter-spotlight" id="research-spotlight">
        <p className="newsletter-kicker">Research Spotlight</p>
        <h2><a href="https://www.nature.com/articles/s44259-024-00057-0" target="_blank" rel="noopener noreferrer">The putative error prone polymerase <em>REV1</em> mediates DNA damage and drug resistance in <em>Candida albicans</em></a></h2>
        <p>The phenomenon of stress-induced mutagenesis has been well studied in bacteria (see <a href="https://pubmed.ncbi.nlm.nih.gov/35658528/" target="_blank" rel="noopener noreferrer">Pribis et al., 2022</a> for review). Clinical treatment with antibiotics, especially quinolones, can cause oxidative stress that triggers a cellular response to DNA damage, including upregulated expression of an error-prone DNA translesion polymerase. This type of polymerase repairs double-strand breaks but does so with reduced fidelity, thereby introducing a higher mutation rate. Introduced mutation in response to antibiotics can lead to evolved drug resistance.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-2.png`} alt="Figure 2" style={{ maxWidth: '326px' }} />
          <figcaption>Figure 2</figcaption>
        </figure>
        <p>Studies in the model yeast <em>S. cerevisiae</em> have shown a similar stress-induced increase in mutagenesis for eukaryotes (see <a href="https://pubmed.ncbi.nlm.nih.gov/16523685/" target="_blank" rel="noopener noreferrer">Krutiakov, 2006</a> for review). As in bacteria, DNA damage triggers upregulation of translesion synthesis (TLS) polymerases able to repair DNA lesions that cannot be repaired by stringent replicative polymerases. <em>S. cerevisiae</em> has three main TLS polymerases, including one encoded by the gene <a href="https://www.yeastgenome.org/locus/S000005873" target="_blank" rel="noopener noreferrer"><em>ScREV1</em></a>.</p>
        <p>The question of evolved resistance to DNA-damaging agents is especially relevant in fungal pathogens with high rates of resistance to antifungals. A paper by <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11606924/" target="_blank" rel="noopener noreferrer">Agyare-Tabbi et al.</a> in this month’s <em>Nature</em> journal <em>NPJ Antimicrobials and Resistance</em> reveals evidence of stress-induced mutagenesis in <em>Candida albicans</em> similar to what has been observed in <em>S. cerevisiae</em> and bacteria.</p>
        <p>The study begins with showing that the common antifungal agents fluconazole and caspofungin (representative of azole and echinocandin drug classes, respectively) do indeed cause double-strand breaks in DNA. The group then asked whether the error-prone TLS polymerases are upregulated in response to agents causing DNA damage. Using methyl methanesulfonate (MMS) as a positive control, they tested the effect of caspofungin on relative expression of the TLS genes. While the two agents caused upregulation of different subsets of TLS genes, <Link to="/locus/REV1"><em>REV1</em></Link> was significantly upregulated in response to both agents.</p>
        <p>Given this result and the importance of <em>ScREV1</em> for the <em>S. cerevisiae</em> damage response, the researchers focused on the role of the <em>C. albicans</em> <Link to="/locus/REV1"><em>REV1</em></Link> in DNA damage response. They first analyzed the role of the gene by deleting it to ask how this affects DNA repair. The null mutant shows such severe sensitivity to MMS that it largely cannot grow in the presence of the chemical.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-3.png`} alt="Figure 3" style={{ maxWidth: '358px' }} />
          <figcaption>Figure 3</figcaption>
        </figure>
        <p>Next they showed that the <em>rev1</em> null mutant has a spontaneous mutation rate much higher than wild type, as shown using the 5-fluoroorotic acid (5-FOA) fluctuation test in which a toxic metabolite is produced by the enzyme encoded by <Link to="/locus/URA3"><em>URA3</em></Link>. In a strain heterozygous for <em>ura3/URA3</em>, inactivating mutations create more colonies able to grow on 5-FOA agar, indicating a higher mutation rate.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-4.png`} alt="Figure 4" style={{ maxWidth: '360px' }} />
          <figcaption>Figure 4</figcaption>
        </figure>
        <p>Next, an evolution study was employed to show how the <em>rev1</em> null mutant evolves resistance to caspofungin more quickly than does wild type, presumably due to the established increase in mutation frequency.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-5.png`} alt="Figure 5" style={{ maxWidth: '300px' }} />
          <figcaption>Figure 5</figcaption>
        </figure>
        <p>As a final component to the study, the research group looked for genes in other pathways working in concert with <em>REV1</em> to affect the responses seen in the mutant. They conducted a proteomics study to see which proteins might be misregulated in the mutant, which focused their attention on <Link to="/locus/SHM1">Shm1p</Link>, a predicted serine hydroxymethyltransferase that showed a clear decrease in abundance in the mutant. <em>SHM1</em> had previously been shown to have a role in glycine metabolism in <em>C. albicans</em>, but not DNA damage response or mutation frequency. Interestingly, though, mutation of <a href="https://www.yeastgenome.org/locus/S000000467" target="_blank" rel="noopener noreferrer"><em>ScSHM1</em></a> in <em>S. cerevisiae</em> causes defects in genome stability and chromosome/plasmid maintenance.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-6.png`} alt="Figure 6" style={{ maxWidth: '239px' }} />
          <figcaption>Figure 6</figcaption>
        </figure>
        <p>To test the question of whether <em>SHM1</em> has a role in DNA damage repair in <em>C. albicans</em>, the group deleted the gene and used the same 5-FOA test to measure mutation frequency. The <em>shm1</em> null mutant indeed shows increased mutation frequency relative to wild type.</p>
        <p>Thus, a study that builds on a body of evidence in pathogenic bacteria and model eukaryotic cells makes a strong leap forward in understanding evolved drug resistance in pathogenic fungi. By knowing which questions to ask, the researchers have characterized an expected player (<em>REV1</em>) and identified an uncharacterized component (<em>SHM1</em>) within the DNA damage response pathway in <em>C. albicans</em>.</p>
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

export default Winter2025;
