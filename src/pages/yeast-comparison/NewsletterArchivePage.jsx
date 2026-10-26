import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';
import './PathogenicYeastComparison.css';

// Converted from the CGD Public Wiki (Newsletter Archives).
function NewsletterArchivePage() {
  return (
    <div className="info-page pyc-page">
      <div className="info-page-content" id="top">
        <p className="pyc-breadcrumb">
          <Link to="/pathogenic-yeast-comparison">Pathogenic Yeast Comparison</Link>
        </p>
        <h1>CGD Newsletter Archive</h1>
        <hr />

        <h2 id="cgd-newsletter-spring-2026">CGD Newsletter, Spring 2026</h2>
        <h3 id="cgd-newsletter-spring-2026-about-this-newsletter">About this newsletter</h3>
        <p>The goals of the CGD newsletter are to connect with the Candida community, inform researchers about new features in the database, and solicit input from you, our community members. Given that we strive to read most Candida reports, we will also offer "research spotlights" on intriguing new results.</p>
        <p>Please feel free to make suggestions for the newsletter and/or the research spotlight by <Link to="/contact">contacting us</Link>.</p>
        <hr />
        <h3 id="cgd-newsletter-spring-2026-cgd-is-getting-remodelled">CGD IS GETTING REMODELLED!</h3>
        <p>This is the biggest announcement in many years. You'll soon see a brand-new appearance for CGD that includes:</p>
        <ol>
          <li>
            A cleaner interface that makes it easier to find what you need
          </li>
          <li>
            An organism selector added to many pages, allowing you to switch quickly between species
          </li>
          <li>
            Newly searchable tables that allow you to filter the results and/or sort by column
          </li>
          <li>
            A brand-new Literature Topic Search tool that allows you to search by topic tag, so you can quickly find all the papers/features related to a given topic or combination of topics.
            <figure className="pyc-figure">
              <img src="/images/pyc/literature-text-search.png" alt="Literature Text Search" style={{ maxWidth: '400px' }} />
            </figure>
          </li>
          <li>
            A brand-new Text Search tool, making it possible to mine CGD data in ways that haven't been possible.
            <figure className="pyc-figure">
              <img src="/images/pyc/text-search-tool.png" alt="Text Search Tool" style={{ maxWidth: '400px' }} />
            </figure>
          </li>
          <li>
            Revisions of outdated pages, including a new "What Is GO?" page that serves as an introduction for trainees
          </li>
          <li>
            Upgrades to the latest version of JBrowse 2 with the CGD classic style. The visual layout stays nearly identical, but improvements include:
            <ol>
              <li>
                Faster rendering (WebGL improvements)
              </li>
              <li>
                Better large track handling
              </li>
              <li>
                Improved plugin system
              </li>
              <li>
                Improved session handling
              </li>
              <li>
                Better remote file support
              </li>
            </ol>
          </li>
          <li>
            Updated "Genome Snapshots" for each species, now including distributions of GO terms within each category of function, process, and component
          </li>
          <li>
            New "CGD Paper" pages that list all the phenotypes and GO terms derived from that paper
          </li>
          <li>
            New "quick links" on the homepage under "CGD Curation News," including one to Disease-related papers. Access the newest literature related to candidiasis in a rapid search.
          </li>
          <li>
            Improved tools that allow for using larger datasets, including the GO Term Finder.
          </li>
          <li>
            Introduced CGD Swagger UI, offering a convenient way to retrieve data programmatically. This includes an interactive API Playground for testing endpoints and generating Python and R code snippets.
          </li>
          <li>
            New Synteny Viewer for the species within CGD, available from the Tools menu or on the Homologs page for each locus
          </li>
        </ol>
        <p>To what do we owe this embarrassment of riches? Our new programmer/developer stepped in just a couple months ago and quickly began building improved tools. That said, we fully expect there will still be bugs and small fixes to make on the new site. Please get in touch whenever you find something that doesn't seem to work correctly. Also, we are open to suggestion for further improvements, so feel free to share your ideas.</p>
        <hr />
        <h3 id="cgd-newsletter-spring-2026-research-spotlight-fungal-extracellular-vesicles-mediate-conserved-cross-species-communication-and-immunomodulation">Research Spotlight: Fungal extracellular vesicles mediate conserved cross-species communication and immunomodulation</h3>
        <p>Continuing with the theme of crosstalk within the mammalian host, a recent study examines how fungi employ extracellular vesicles (EVs) for this specific purpose. Piraine et al. describe in a recent <em>mBio</em> paper that fungi use EVs to not only communicate within their own species, but also with other fungal species and with the host.</p>
        <p>The study looks at use of EV communication for two <em>Candida</em> spp. (<em>C. albicans</em> and <em>C. auris</em>) and two <em>Cryptococcus</em> spp. (<em>C. neoformans</em> and <em>C. gattii</em>). Study of EVs began in <em>C. neoformans</em> in 2007. Now, after isolating EVs from each species, the researchers labeled them to track "receipt" by other cells. Their study shows that EVs are first recognized and bound at the cell surface, after which they may or may not be internalized. (The yellow arrows in the figure indicate interaction.)</p>
        <figure className="pyc-figure">
          <img src="/images/pyc/figure-1.png" alt="Figure 1" style={{ maxWidth: '600px' }} />
        </figure>
        <p>They found that a given species not only recognizes its own EVs but also those produced by near relatives. Further, an inter-phylum association was seen in <em>C. auris</em> recognizing EVs produced by <em>C. neoformans</em>. This is an intriguing result.</p>
        <p>A next set of experiments looked at the role of EV-mediated communication on biofilm adhesion and dispersal. For both <em>C. albicans</em> and <em>C. auris</em>, concentrations of EVs from either species above a certain number (10 EVs per cell in a well) consistently increased both biofilm adhesion and dispersal. Further, application of EVs from either species to itself or the other led to increased expression of ERG11 and increased resistance to fluconazole. It thus appears that what EVs deliver contribute to both virulence and resistance, tilting the balance in favor of the pathogen.</p>
        <figure className="pyc-figure">
          <img src="/images/pyc/figure-2.png" alt="Figure 2" style={{ maxWidth: '600px' }} />
        </figure>
        <p>With respect to crosstalk between pathobiont fungi and the host, it has been established that fungal EVs carry factors that act as pathogen-associated molecular patterns (PAMPs), which activate the innate immune response (see Brown et al., 2024 for review). These factors are typically fungal cell wall proteins that mammals do not produce, thus are recognized as foreign by immune pattern recognition receptors (PRRs).</p>
        <p>Curious about this interaction, the researchers introduced fungal EVs to THP-1 macrophage-like cells and then measured signaling events. They detected an increase in STAT1 signaling linked to M1-type activated macrophages, which then led to downstream immune responses including altered transcription patterns and cytokine production associated with the pro-inflammatory response. Thus, immune cells are recognizing fungi as pathogens via materials contained within EVs and launching a defense.</p>
        <p>A particularly interesting finding was the upregulation of the macrophage TLR9 receptor in response to <em>C. albicans</em> and <em>C. auris</em> EVs, which the authors speculate to contain chitin and nucleic acids. In contrast, <em>C. gattii</em> EVs trigger the opposite effect of downregulating TLR9, which could be a form of immune evasion.</p>
        <figure className="pyc-figure">
          <img src="/images/pyc/figure-3.png" alt="Figure 3" style={{ maxWidth: '700px' }} />
        </figure>
        <p>The concept that fungal EVs are pivotal to intra- and interspecies communication is a relatively hot new topic, for which CGD recently added a literature topic tag due to the number of papers coming out. However, the nature of the information being communicated by vesicles largely remains unknown. Fungi are likely exchanging "news" of the environment, toward either assisting or hampering certain neighbors within the microbiome. The results of this paper show clear assistance between related fungi.</p>
        <p>The communication between fungi and their hosts, however, is harder to interpret. Are immune cells "intercepting" EVs that are meant for other fungi? Or, in the case of the TLR9 repression by <em>C. gattii</em>, have fungi evolved a means to evade detection by sending out vesicles to "disarm" the receptors?</p>
        <p>Future studies will have these intriguing questions to tackle.</p>
      </div>
    </div>
  );
}

export default NewsletterArchivePage;
