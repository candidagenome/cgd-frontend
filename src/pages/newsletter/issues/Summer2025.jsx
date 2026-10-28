import React from 'react';
import { Link } from 'react-router-dom';

// CGD Newsletter, Summer 2025. Generated from "Newsletter Summer 2025.docx" by
// scripts/newsletter_docx_to_issue.py; edit freely after review.
// Each article is a <section> whose id matches an entry in issues/index.js.
const IMG = '/images/newsletter/summer-2025';

function Summer2025() {
  return (
    <>
      <section className="newsletter-article" id="new-assemblies-of-candida-auris">
        <h2>New assemblies of <em>Candida auris</em></h2>
        <p>With the announcement last summer by <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11465782/" target="_blank" rel="noopener noreferrer">Cauldron et al.</a> of an improved genome assembly of <em>Candida auris</em> strain <Link to="/genome-snapshot/C_auris_B8441">B8441</Link>, CGD has updated the reference genome for this strain so the new assembly can be downloaded, analyzed, and used for searches. Where the previous best assembly contained 15 contigs, the new assembly leveraged long-read sequencing to improve the genome from 15 contigs to 7 chromosomes, using alignment to fill gaps. The submitted genome is available as <a href="https://www.ncbi.nlm.nih.gov/datasets/genome/GCA_002759435.3/" target="_blank" rel="noopener noreferrer">GCA_002759435.3</a>.</p>
        <p>Within the new assembly, 32 new features were identified and 22 features located in duplicated regions of the old assembly were merged with the remaining copy of each. Sequences were corrected for an additional 34 features, including 18 that were increased in length by 100 or more base pairs. While certain pieces of the new locus pages are not fully complete, we welcome all comments and suggestions from users so we can fix any errors.</p>
        <p>To the further good of <em>C. auris</em> researchers, <a href="https://pubmed.ncbi.nlm.nih.gov/39230279/" target="_blank" rel="noopener noreferrer">Mahar et al.</a> announced the assemblies of three other strains of <em>C. auris</em> representing three distinct geographical clades: South Asian (Clade I, strain B11103); South African (Clade III, strain B11221); and South American (Clade IV, strain B11244). Containing 8 contigs each, these assemblies will be valuable for performing genomic studies on new isolates from these clades. CGD will provide these three strains as options to search against within our internal BLAST tools. The data are available at NCBI as <a href="https://www.ncbi.nlm.nih.gov/datasets/genome/GCA_031359945.2/" target="_blank" rel="noopener noreferrer">GCA_031359945.2 </a>(strain B11103), <a href="https://www.ncbi.nlm.nih.gov/datasets/genome/GCA_031357835.2/" target="_blank" rel="noopener noreferrer">GCA_031357835.2</a> (strain B11244), and <a href="https://www.ncbi.nlm.nih.gov/datasets/genome/GCA_031357565.2/" target="_blank" rel="noopener noreferrer">GCA_031357565.2</a> (strain B11221)</p>
      </section>

      <section className="newsletter-article" id="upgrade-to-cgd-performance">
        <h2>Upgrade to CGD Performance</h2>
        <p>As several of you wrote to make us aware, we experienced an ongoing heavy usage load that slowed the database to a crawl for much of the last two weeks of June. We blocked a number of IP addresses that we believed to be causing the issues, but new heavy-use IPs continued to appear. After a good deal of troubleshooting, we made the decision to increase our capacity by upgrading to a larger server instance. You should thus enjoy enhanced performance speed and fewer periods of slow down.</p>
      </section>

      <section className="newsletter-article newsletter-spotlight" id="research-spotlight">
        <p className="newsletter-kicker">Research Spotlight</p>
        <h2>Regulation of meiotic gene expression is functional in the human fungal pathogen <em>Candida glabrata</em></h2>
        <p>A recent study in FEMS Yeast Research by <a href="https://academic.oup.com/femsyr/article/doi/10.1093/femsyr/foaf018/8104277" target="_blank" rel="noopener noreferrer">Klimova et al</a>. delves into the unexplained curiosities of the pathogenic yeast <em>Candida glabrata</em> (aka <em>Nakaseomyces glabratus</em>). Among the pathogenic yeasts, <em>C. glabrata</em> is notable for the absence of an observed sexual cycle and an obligate haploid lifestyle. The other pathogenic yeast that shares these traits is <em>C. auris</em>, despite that the two yeasts are on different branches of the evolutionary tree. For both these yeasts, however, there is evidence of past recombination events that suggests mating is possible under as-yet-undiscovered conditions (<a href="https://pubmed.ncbi.nlm.nih.gov/30559369/" target="_blank" rel="noopener noreferrer">Muñoz et al., 2018</a>, <a href="https://pubmed.ncbi.nlm.nih.gov/15707844/" target="_blank" rel="noopener noreferrer">Dodgson et al., 2005</a>).</p>
        <p>The lack of observed mating in <em>C. glabrata</em> is especially surprising given its close relationship to the model yeast <em>Saccharomyces cerevisiae</em>, in which mating has been extensively characterized. Like <em>S. cerevisiae, C. glabrata</em> has both 'a' and 'alpha' cell types and also contains homologs of most of the mating-related genes in <em>S. cerevisiae</em>. Where mating happens readily between 'a' and 'alpha' cell types in <em>S. cerevisiae</em>, leading to formation of diploids that undergo meiosis under harsh conditions, <em>C. glabrata</em> has one or more barriers to this process that have yet to be described.</p>
        <p>Klimova et al. make a step toward understanding these barriers by seeking a functional homolog of <em>S. cerevisiae UME6</em>, encoding a zinc cluster transcription factor involved in both repression and activation of meiosis-related genes (Raithatha et al. 2021). By comparing the protein sequence of Ume6 to the proteome of <em>C. glabrata</em>, they identify <em>ZCF11</em> in <em>C. glabrata</em> as the putative homolog based on conservation of the DNA-binding domain, which is unusually located at the C terminus in both proteins.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-1.png`} alt="Figure 1" style={{ maxWidth: '416px' }} />
          <figcaption>Figure 1</figcaption>
        </figure>
        <p>As <em>ZCF11</em> in <em>C. glabrata</em> is an essential gene, where <em>UME6</em> in <em>S. cerevisiae</em> is not, the first step toward assessment of functional homology was to ask whether <em>UME6</em> on a plasmid could restore viability to a strain in which <em>ZCF11</em> expression is repressed by addition of tetracycline. As shown in Fig. 2, <em>UME6</em> restores growth but to a level well below wild type, suggesting partial complementation.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-2.png`} alt="Figure 2" style={{ maxWidth: '363px' }} />
          <figcaption>Figure 2</figcaption>
        </figure>
        <p>A detailed analysis of transcription patterns in the presence versus absence of <em>ZCF11</em> in <em>C. glabrata</em> showed that the factor appears to have little role as a transcriptional activator but a significant role as a repressor. Of the over 200 genes upregulated when <em>ZCF11</em> is knocked down, GO enrichment analysis showed 22.3% of the genes had 'meiotic cell cycle' as an associated GO term. Of the 80 most induced genes in the absence of <em>ZCF11</em>, over half were associated with GO categories related to meiosis or sexual reproduction.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-3.png`} alt="Figure 3" style={{ maxWidth: '167px' }} />
          <figcaption>Figure 3</figcaption>
        </figure>
        <p>One of these repressed genes is <em>IME1</em>, for which the homolog in <em>S. cerevisiae</em> has been well characterized as a master regulator of meiosis. To ask whether Zcf11 affects repression of this gene at the transcriptional level rather than the mRNA stability level, the research group fused the Cg<em>IME1</em> promoter to LacZ and assayed beta-galactosidase levels in the presence versus absence of <em>ZCF11</em> expression. They show clearly that regulation happens via transcriptional repression when <em>ZCF11</em> is expressed.</p>
        <p>As a final look at functional homology, the group compared the respective DNA-binding domains from Sc<em>UME6</em> and Cg<em>ZCF11</em> to ask whether they bind the same DNA sequence. Using electrophoretic mobility shift assay (EMSA), they incubated isolated DNA-binding domains from each protein with a consensus UME6-binding site nucleotide. They compared between the consensus sequence versus a mutated version of the consensus sequence. Though this is an <em>in vitro</em> look, it does show specific recognition of the same consensus sequence by both proteins, which is a persuasive measure of conservation.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-4.png`} alt="Figure 4" style={{ maxWidth: '232px' }} />
          <figcaption>Figure 4</figcaption>
        </figure>
        <p>The next obvious questions have not yet been asked. Why would <em>C. glabrata</em> retain a strong transcriptional repressor for meiosis unless meiosis happens on rare occasion? How can meiosis ever take place in <em>C. glabrata</em> if no diploid cells are formed? Are there conditions under which 'a' and 'alpha' cells do fuse? What are these exceedingly rare and unique conditions? What other cellular barriers prevent these processes in <em>C. glabrata</em>.</p>
      </section>

      <section className="newsletter-article" id="upcoming-meetings">
        <h2>Upcoming Meetings</h2>
        <ul>
          <li><a href="https://microbiologysociety.org/event/society-events-and-meetings/candida-and-candidiasis-2025.html" target="_blank" rel="noopener noreferrer">Candida and Candidiasis 2025</a><br />The Estrel Congress Center, Berlin, Germany; October 6–9 2025</li>
        </ul>
        <ul>
          <li><a href="https://www.keystonesymposia.org/conferences/conference-listing/meeting/A12026" target="_blank" rel="noopener noreferrer">Keystone Symposium on Fungal Pathogens</a><br />Breckenridge, Colorado, January 12 - 15, 2026</li>
        </ul>
      </section>
    </>
  );
}

export default Summer2025;
