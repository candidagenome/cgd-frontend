import React from 'react';
import { Link } from 'react-router-dom';

// CGD Newsletter, Summer 2026. Generated from "Summer 2026.docx" by
// scripts/newsletter_docx_to_issue.py; edit freely after review.
// Each article is a <section> whose id matches an entry in issues/index.js.
const IMG = '/images/newsletter/summer-2026';

function Summer2026() {
  return (
    <>
      <section className="newsletter-article" id="proposal-naming-of-uncharacterized-orthologs">
        <h2>Proposal: Naming of Uncharacterized Orthologs</h2>
        <p>It has heretofore been our policy at CGD to only add standard names to genes when a published study gives a gene the name. With the addition of locus pages for <em>C. tropicalis</em>, as well as the addition of the Synteny Browser to CGD, which makes even clearer the orthologous relationships between genes in the pathogenic yeasts and <em>S. cerevisiae</em>, we now think there might be value in appending established names to clear orthologs.</p>
        <p>Thus, we are seeking input from the research community for the following proposal to transfer ortholog names to uncharacterized genes. The transferred names would be clearly identified as ‘named by orthology’ rather than by published experimental research.</p>
        <p>We propose to transfer ortholog names to uncharacterized <em>Candida</em> spp. genes when:</p>
        <ol>
          <li>no other standard name has been assigned by a research group using experimental evidence of a biological role or function; and</li>
          <li>there is a minimum of two orthologous genes with the same name among the six pathogenic spp. in CGD and <em>S. cerevisiae</em>, and there are no orthologs with a different name.</li>
        </ol>
        <p>Examples. For an unnamed gene in any of our curated species:</p>
        <ol>
          <li>If orthologs in <em>C. albicans</em> and <em>C. parapsilosis</em> are named <em>ABC1</em>, but named <em>DEF1</em> in <em>C. glabrata</em>, there would be no transfer</li>
          <li>If a gene is named <em>GHI1</em> in <em>S. cerevisiae</em> but none of the orthologous genes in the <em>Candida</em> species has been named, there would be no transfer</li>
          <li>If a gene is named <em>JKL1</em> in <em>S. cerevisiae</em> and <em>C. glabrata</em>, and has no name in any other of the <em>Candida</em> species with orthologs, the <em>JKL1</em> name would be transferred to the unnamed orthologs</li>
          <li>If a gene is named <em>MNO1</em> in <em>C. albicans</em> and <em>C. auris</em>, and has no name in any other of the <em>Candida</em> species with orthologs, the name would be transferred to the unnamed orthologs</li>
        </ol>
        <p>Orthology information in CGD is derived from <a href="http://cgob3.ucd.ie/" target="_blank" rel="noopener noreferrer">CGOB (Candida Gene Order Browser)</a>; please visit our <Link to="/synteny-browser">Synteny Browser</Link> page for further details.</p>
        <p>We are actively soliciting feedback on this proposal prior to instituting the changes, as we’d like to engage the community in the decision. Feedback to date has been positive, however, we’d like to hear from a broader audience. Please consider letting us know what you think.</p>
      </section>

      <section className="newsletter-article" id="species-addition-candida-tropicalis-as-the-sixth-pathogenic-candida-species-in-cgd">
        <h2>Species Addition: <em>Candida tropicalis</em> as the Sixth Pathogenic <em>Candida</em> species in CGD</h2>
        <p>We conducted a survey prior to our database grant renewal application in 2024 in which we asked the community which species to add next to the database. The results said <em>C. tropicalis</em> followed by <em>C. krusei</em>.</p>
        <p>Toward this goal, we solicited input from active <em>C. tropicalis</em> researchers as to the most up-to-date genome assembly to import and adopted the assembly described in <a href="https://pubmed.ncbi.nlm.nih.gov/32469306/" target="_blank" rel="noopener noreferrer">PMID 32469306</a> as the Candida tropicalis MYA-3404 reference genome.</p>
        <p>There are now locus pages for every genomic feature and orthology relationships allows users to rapidly switch to the appropriate <em>C. tropicalis</em> Locus Page from another species Locus Page. We are currently in the process of backfilling the curation by use of a triage strategy to find the most relevant papers for manual curation.</p>
      </section>

      <section className="newsletter-article" id="tool-release-virulence-factor-browser">
        <h2>Tool Release: Virulence Factor Browser</h2>
        <p>Given pressing need to combat pathogenic yeasts, we have built a new tool called the <Link to="/virulence-factor-browser">Virulence Factor Browser</Link>, designed to assist in this endeavor. The browser allows you aggregate all the virulence-related annotation (phenotypes, GO terms), together with the associated literature, for any given gene.</p>
        <p>The tool allows you to:</p>
        <ul>
          <li>Select one or more virulence categories to see all genes with evidence suggesting a role in the particular aspect of virulence. The categories include:</li>
          <ul>
            <li>Adhesins</li>
            <li>Secreted Enzymes</li>
            <li>Morphogenesis</li>
            <li>Host Interaction</li>
            <li>Biofilm Formation</li>
            <li>Immune Evasion</li>
            <li>Drug Resistance</li>
          </ul>
          <li>Select a category for all organisms or just a single organism</li>
          <li>Search the aggregated annotation by gene name or keyword</li>
          <li>Select the type of evidence associated with the results, i.e., assigned GO annotation or phenotype evidence</li>
          <li>Filter by confidence level (high, medium, low) to see well-established connections versus more subtle indications of roles in virulence</li>
          <li>Compare the ‘Curator summary’ (based on experimental evidence) for a given locus to the ‘AI summary’, which uses various computational means to assign functions and roles</li>
        </ul>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-1.png`} alt="Figure 1" style={{ maxWidth: '624px' }} />
          <figcaption>Figure 1</figcaption>
        </figure>
      </section>

      <section className="newsletter-article" id="feature-releases-five-additional-new-features">
        <h2>Feature Releases: Five Additional New Features</h2>
        <ol>
          <li><Link to="/synteny-browser"><strong>Synteny Viewer</strong></Link><br />The new Synteny Viewer tool renders a chromosomal region for a focal gene in the species of interest and then indicates which genes in the other CGD species are orthologous on the syntenic chromosomal regions. The ortholog mapping used at CGD, which allows switching between gene pages for different species and underlies the synteny browser, is taken from the mappings available at the Candida Gene Order Browser (CGOB). CGOB provides orthologous gene assignments that have been extensively manually curated, based on genomic context (local synteny) as well as sequence similarity, providing a “gold-standard” set of orthologs for evolutionary analysis.</li>
          <li><Link to="/ortholog-converter"><strong>Ortholog Converter</strong></Link><br />To help users with the challenge of transforming sets of genes between species, often to take advantage of better characterization in closely related species, we have implemented a tool that allows the retrieval of a list of orthologs from another species (the six species in CGD plus <em>S. cerevisiae</em>) using a list of identifiers from the species under study. For example, a common use is to retrieve the <em>S. cerevisiae</em> identifiers for a list of identifiers from a <em>Candida</em> species, to take advantage of the extensive gene and protein annotation available from SGD. As with the Synteny Viewer, we take advantage of ortholog mappings from CGOB as well as the Yeast Gene Order Browser.</li>
          <li><Link to="/crispr"><strong>CRISPR Guide Designer</strong></Link><br />CGD recently released the CRISPR Guide RNA Design tool for designing single guide RNAs (sgRNAs) for CRISPR-Cas gene editing experiments in <em>Candida</em> species. The tool has several advantages over more broad-range tools:</li>
          <ol>
            <ol>
              <li>Where many tools target the first 50% of the open reading frame, we use a conservative default setting that targets only the first 20% of the coding sequence. The 20% setting maximizes knockout effectiveness, avoids internal start codons, and reduces off-target risk</li>
              <li>CGD’s recommended option is the “5’ Region + Upstream”, which includes 20% of the coding region plus 500 bases of upstream region. This option is not available on most other sites.</li>
              <li>CGD maintains the most up-to-date genomic assemblies, meaning users can trust the background sequence over widely used tools with hundreds of genomes that may or may not get updated regularly</li>
            </ol>
          </ol>
          <li><Link to="/locus/CR_06440C_A?tab=expression"><strong>Expression Tab</strong></Link><br />As we have continued to import gene expression datasets in all species, the challenge has grown to present these data to users in a format that visualizes expression across different conditions, as well as which other genes are similarly regulated. We have thus added an Expression tab to every gene page to visualize (1) gene expression compared to controls in every dataset, sortable by experiment type, and (2) as an <Link to="/locus/CR_06440C_A?tab=expression">Expression Profile heat map</Link> across multiple conditions, allowing users to view genes that have the most correlated expression to the query gene.</li>
          <li><Link to="/locus/CR_06440C_A?tab=interactions"><strong>Interaction Tab</strong></Link><br />We have added a new tab to every locus page that displays genetic and physical interaction data for a given feature. These data are sourced from manual curation by BIOGRID and CGD together with computational curation by the STRING database, which provides powerful computational prediction using data from 12,535 organisms and over 20 billion protein-protein interactions. The annotations are provided in list form (with links to evidence), as well as in a Venn diagram and as a network diagram. The value of these interaction data for researchers is in designing the next set of experimental questions, where the ability to rapidly identify the ortholog and its interactors in a better-studied species provides clues as to which genes to study next in the species of interest.</li>
        </ol>
        <p><br /></p>
      </section>

      <section className="newsletter-article newsletter-spotlight" id="research-spotlight">
        <p className="newsletter-kicker">Research Spotlight</p>
        <h2>Repurposing a fungal exporter to import cyanine to kill <em>Candida</em>: an innovative way to fight drug resistance</h2>
        <p>There is a traditional view of efflux pumps solely as resistance determinants, where they become highly expressed due to mutations in their regulatory genes and then pump drugs out of the cell to generate resistance. A recent study in Cell Chemical Biology by <a href="https://pubmed.ncbi.nlm.nih.gov/41720080/" target="_blank" rel="noopener noreferrer">Chen et al.</a> has shown this to be an overly limited view. The efflux pump <Link to="/locus/C6_03170C_A">Mdr1</Link> in <em>Candida</em> spp. is an established example of a pump associated with azole resistance in numerous species, especially the haploid pathogens <em>C. auris</em> and <em>C. glabrata</em> (also called <em>Nakaseomyces glabratus</em>). However, in a phenomenon described as “collateral sensitivity”, the overexpression of an efflux pump creates resistance to certain drugs but simultaneous sensitivity to a small set of unrelated drugs. The phenomenon had not been studied with respect to fungal resistance, so the researchers looked to identify agents that selectively eliminate Mdr1-overexpressing <em>C. albicans</em> strains.</p>
        <p>They began with a susceptible strain called G2 (with negligible amounts of Mdr1 protein) compared to a resistant strain G5 (expressing high levels of Mdr1 due to a mutation in the transcriptional regulator <Link to="/locus/C3_05920W_A">Mrr1</Link>). They then tested a library of 550 small molecules to find those that selectively inhibited G5 but not G2. After narrowing the pool several times, they arrived at five positively charged quaternary ammonium compounds, of which three are cyanine derivatives. They selected one of the cyanine derivatives, MKT-077, for further study because it showed the greatest selectivity, was intrinsically fluorescent for visualization, and showed relatively low cytotoxicity toward a mammalian cell line.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-2.png`} alt="Figure 2" style={{ maxWidth: '624px' }} />
          <figcaption>Figure 2</figcaption>
        </figure>
        <p>The next important question was which mode of action was relevant. To ask whether MKT-077 was entering cells, the intrinsic fluorescence made it possible to use flow cytometry to measure intracellular drug content. The compound MKT-077 built up in cells only when Mdr1 was overexpressed, i.e., not in the absence of a gain-of-function <em>MRR1</em> mutation. The implication is that Mdr1, normally an exporter, might be able to <em>import</em> MKT-077. They proceeded to test the accuracy and specificity of this hypothesis in numerous ways, including by heterologous expression in <em>S. cerevisiae</em>. All results pointed to uptake of MKT-077 (and other cyanine derivatives) specifically by the Mdr1 transmembrane transporter.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-3.png`} alt="Figure 3" style={{ maxWidth: '563px' }} />
          <figcaption>Figure 3</figcaption>
        </figure>
        <p>Once the fact of uptake was experimentally established, the research group looked more deeply into the mechanism of the action. They analyzed protein structure in detail, eventually concluding that azole efflux occurred through a channel different from that which facilitated MKT-077 influx. They identified key residues via mutation analysis.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-4.png`} alt="Figure 4" style={{ maxWidth: '454px' }} />
          <figcaption>Figure 4</figcaption>
        </figure>
        <p>Next, they asked whether results in <em>C. albicans</em> would hold in other <em>Candida</em> strains, including <em>C. tropicalis</em>, <em>C. parapsilosis</em>, and <em>C. auris</em>. Using benomyl as an inducer of <em>MDR1</em> expression, they asked whether higher levels of Mdr1 transporter in other <em>Candida</em> spp. would increase sensitivity to MKT-077. They found the same correlation between <em>MDR1</em> expression and MKT-077 sensitivity in these other three <em>Candida</em> as they had in <em>C. albicans</em>, suggesting the ability of Mdr1 to uptake the cyanine derivative was a conserved feature of the protein.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-5.png`} alt="Figure 5" style={{ maxWidth: '421px' }} />
          <figcaption>Figure 5</figcaption>
        </figure>
        <p>They looked at MKT-077 in combination with other antifungals to see if import of MKT-077 by the Mdr1 channel could increase sensitivity to other drugs. Indeed, they found that benomyl application was synergistic with that of MKT-077. Further, the fungicidal activity of a combination of amphotericin B (AmB) and MKT-077 effectively eradicated drug-resistant biofilms in a manner dependent on the presence of Mdr1.</p>
        <p>The <em>in vivo</em> efficacy of MKT-077 was tested in <em>G. mellonella</em> insect larvae infected with <em>C. albicans</em> G2 (control) versus G5 (Mdr1-overexpressing) strains. After 10 days, 80% of the MKT-077-treated larvae survived, while only 40% of fluconazole-treated larvae and close to 0% of untreated larvae survived. They found similar results in mice, with a greatly reduced kidney burden after infection by G5 followed by treatment with MKT-077.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-6.png`} alt="Figure 6" style={{ maxWidth: '624px' }} />
          <figcaption>Figure 6</figcaption>
        </figure>
        <p>Resistance to azole drugs by pathogenic <em>Candida</em> spp. is of primary concern to global health. While resistance in <em>C. albicans</em> is not uncommon, resistance in the “killer fungus” <em>C. auris</em> is rampant. Multiple resistance mechanisms have been described, but the overexpression <em>Mdr1</em> transporter is among the most common. Where strains are becoming increasingly resistant to multiple drugs, overcoming resistance is of critical concern. Numerous synergies between drugs have been noted, however, understanding the biology of the synergy has been rare. This innovative study that describes bifunctionality of a transporter is in keeping with numerous examples of bifunctional transporters in other biological systems. Further, the idea of converting efflux-based resistance into an opportunity for targeted drug delivery could conceivably remodel existing therapies for treating drug-resistant pathogens.</p>
        <figure className="newsletter-figure">
          <img src={`${IMG}/figure-7.png`} alt="Figure 7" style={{ maxWidth: '279px' }} />
          <figcaption>Figure 7</figcaption>
        </figure>
      </section>
    </>
  );
}

export default Summer2026;
