import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

// Rotating images for the slideshow
const SLIDESHOW_IMAGES = [
  '/images/Morschauser.jpg',
  '/images/Anaphase.jpg',
  '/images/Colony.jpg',
  '/images/GFPDAPI.jpg',
  '/images/thigmotropism.jpg',
  '/images/Wells.jpg',
  '/images/Hube5.jpg',
];

// Meetings data
const MEETINGS = [

  {
    title: 'Antimicrobial Resistance - Genomes, Big Data and Emerging Technologies',
    url: 'https://coursesandconferences.wellcomeconnectingscience.org/event/antimicrobial-resistance-genomes-big-data-and-emerging-technologies-20260323/',
    location: 'Wellcome Genome Campus, UK and Virtual',
    date: 'March 23 - 25, 2026',
  },
  {
    title: 'Fungal Pathogen Genomics (Virtual Course)',
    url: 'https://coursesandconferences.wellcomeconnectingscience.org/event/fungal-pathogen-genomics-virtual-20260601/',
    location: null,
    date: 'June 1 - 5, 2026',
  },
];

// News items
const NEWS_ITEMS = [
  {
    title: 'New: Virulence Factor Browser (Preview)',
    content: (
      <>
        Explore our new tool for searching and filtering <em>Candida</em> virulence-related genes,
        including curated summaries, evidence types, confidence scores, and supporting literature.
        <p></p>
        This is an early release, and we'd love your feedback to help refine it before full launch.
        <br /><br />
        <Link to="/virulence-factor-browser">Try it out and share your thoughts</Link>
      </>
    ),
    date: 'April 2026',
    highlight: true,
  },
  // {
  //   title: 'New CGD Website Launched',
  //   content: (
  //     <>
  //       We've launched a redesigned CGD website with improved search, updated JBrowse, enhanced
  //       literature tools, and a new API interface. The new site offers faster performance, better
  //       navigation, and more powerful data exploration tools.<p></p>
  //       For a list of new features, see the <a href="http://ec2-52-40-145-49.us-west-2.compute.amazonaws.com/index.php?title=Main_Page#Newsletter_Archives" target='new' >Spring 2026 CGD Newsletter.</a>
  //       <br /><br />
  //       Explore the new features and <Link to="/contact">let us know your feedback</Link>.
  //     </>
  //   ),
  //   date: 'March 2026',
  //   highlight: true,
  // },
  {
    title: 'CGD Curation News',
    content: (
      <ul>
        <li>
          <Link to="/genome-snapshot/C_albicans_SC5314">
            <em>C. albicans</em> Genome Snapshot
          </Link>
        </li>
        <li>
          <Link to="/genome-snapshot/C_glabrata_CBS138">
            <em>C. glabrata</em> Genome Snapshot
          </Link>
        </li>
        <li>
          <Link to="/genome-snapshot/C_parapsilosis_CDC317">
            <em>C. parapsilosis</em> Genome Snapshot
          </Link>
        </li>
        <li>
          <Link to="/genome-snapshot/C_dubliniensis_CD36">
            <em>C. dubliniensis</em> Genome Snapshot
          </Link>
        </li>
        <li>
          <Link to="/genome-snapshot/C_auris_B8441">
            <em>C. auris</em> Genome Snapshot
          </Link>
        </li>
        <li>
          <a href="/reference/NewPapersThisWeek" target="_blank" rel="noopener noreferrer">New papers</a> added to CGD this week.
        </li>
        <li>
          View <Link to="/reference/GenomewideAnalysisPapers">Genome-wide Analysis papers</Link> in
          CGD.
        </li>
        <li>
          View <Link to="/disease-related-papers">Disease-Related papers</Link> in CGD.
        </li>
      </ul>
    ),
    date: null,
  },
  {
    title: 'Introducing a Public Wiki for Candida',
    content: (
      <>
        CGD thought it would be useful to provide a single reference source for the pathogenic{' '}
        <em>Candida</em> spp. We envision this site to be useful to established researchers as a
        reference for quick answers to questions such as "Which pathogenic <em>Candida</em> make
        true hyphae versus pseudohyphae?" The primary usefulness, however, is likely to be for
        trainees new to the field of <em>Candida</em>. The site provides links and references
        covering a wide breadth of knowledge, including strains, protocols, seminal references, and
        comparisons between species. The{' '}
        <a href="http://publicwiki.candidagenome.org/" target="_blank" rel="noopener noreferrer">
          site is here
        </a>{' '}
        and is findable on our homepage via the Community menu. Make a shortcut!
      </>
    ),
    date: 'November 3, 2025',
  },  
  {
    title: (
      <>
        New Assemblies of <em>Candida auris</em>
      </>
    ),
    content: (
      <>
        CGD has updated the reference genome for <em>Candida auris</em> strain B8441 based on the
        announcement by{' '}
        <a
          href="https://pubmed.ncbi.nlm.nih.gov/39177371/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Cauldron et al.
        </a>{' '}
        of an improved genome assembly that leveraged long-read sequencing to improve the genome
        from 15 contigs to 7 chromosomes, using alignment to fill gaps. The new assembly can be
        downloaded, analyzed, and used for searches.
      </>
    ),
    date: 'September 3, 2025',
  },
  {
    title: 'Registration is now open for Candida and Candidiasis 2025',
    content: (
      <>
        Registration has opened for this October's major conference for <em>Candida</em>{' '}
        researchers. Consideration for talks will close on May 15, while submissions for posters
        will remain open as long as space allows.{' '}
        <a
          href="https://microbiologysociety.org/event/society-events-and-meetings/candida-and-candidiasis-2025.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          Information is all here.
        </a>{' '}
        The registration deadline is September 15.
      </>
    ),
    date: 'April 15, 2025',
  },
  {
    title: (
      <>
        New Release of the <em>Candida albicans</em> PeptideAtlas Proteomics Resource
      </>
    ),
    content: (
      <>
        With the first new build in nearly ten years, the PeptideAtlas now utilizes 34 datasets to
        provide 79.5% sequence coverage at the protein level (4,995 proteins), with new experimental
        evidence identifying phosphorylated and acetylated residues.
      </>
    ),
    date: 'March 25, 2025',
  },
];

function HomePage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Rotate images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % SLIDESHOW_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-page">
      <div className="home-content">
        {/* Left Column */}
        <div className="home-left">
          {/* Image Slideshow */}
          <div className="slideshow-container">
            <img
              src={SLIDESHOW_IMAGES[currentImageIndex]}
              alt="Candida research"
              className="slideshow-image"
            />
          </div>

          {/* About CGD */}
          <section className="about-section">
            <h2>About CGD</h2>
            <p>
              This is the home of the <em>Candida</em> Genome Database, a resource for genomic
              sequence data and gene and protein information for <em>Candida albicans</em> and
              related species. CGD is based on the{' '}
              <a
                href="https://www.yeastgenome.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <em>Saccharomyces</em> Genome Database
              </a>{' '}
              and is funded by the{' '}
              <a href="http://www.nidcr.nih.gov/" target="_blank" rel="noopener noreferrer">
                National Institute of Dental & Craniofacial Research
              </a>{' '}
              at the{' '}
              <a href="http://www.nih.gov/" target="_blank" rel="noopener noreferrer">
                US National Institutes of Health
              </a>
              .
            </p>
          </section>

          {/* Contact CGD */}
          <section className="contact-section">
            <h2>Contact CGD</h2>
            <Link to="/contact" className="contact-link">
              Send a Message to the CGD Curators
            </Link>
          </section>

          {/* Meetings & Courses */}
          <section className="meetings-section">
            <h2>Meetings & Courses</h2>
            <ul className="meetings-list">
              {MEETINGS.map((meeting, index) => (
                <li key={index}>
                  <a href={meeting.url} target="_blank" rel="noopener noreferrer">
                    <strong>{meeting.title}</strong>
                  </a>
                  <div className="meeting-details">
                    {meeting.location && (
                      <>
                        {meeting.location}
                        <br />
                      </>
                    )}
                    {meeting.date}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right Column - News */}
        <div className="home-right">
          <section className="news-section">
            <h1>New and Noteworthy</h1>

            {NEWS_ITEMS.map((item, index) => (
              <article key={index} className={`news-item ${item.highlight ? 'news-highlight' : ''}`}>
                <h2>{item.title}</h2>
                <div className="news-content">{item.content}</div>
                {item.date && <p className="news-date">(Posted {item.date})</p>}
              </article>
            ))}
            <hr />
            <article className="news-item">
              <h2>Archived News</h2>
              <p>
                Click <Link to="/news/archive">here</Link> to view archived news items.
              </p>
            </article>
          </section>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
