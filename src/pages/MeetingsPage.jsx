import React from 'react';
import { Link } from 'react-router-dom';
import './InfoPages.css';

const MeetingsPage = () => {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>Meetings &amp; Courses</h1>
        <hr />

        <div className="info-section">
          <h2>Upcoming Meetings &amp; Courses</h2>
          <ul>
            <li>
              <a href="https://coursesandconferences.wellcomeconnectingscience.org/event/fungal-pathogen-genomics-20240602/" target="_blank" rel="noopener noreferrer">
                Fungal Pathogen Genomics Course
              </a>
              <br />
              <small>
                Wellcome Genome Campus, Hinxton, Cambridge, UK<br />
                June 2 - 7, 2024<br />
                Applications open until Feb 29, 2024
              </small>
            </li>
            <li>
              <a href="https://genetics-gsa.org/fungal/" target="_blank" rel="noopener noreferrer">
                Fungal Genetics Conference 2024
              </a>
              <br />
              <small>
                Asilomar Conference Grounds, Pacific Grove, CA<br />
                March 12 - 17, 2024
              </small>
            </li>
            <li>
              <a href="https://genetics-gsa.org/tagc-2024/" target="_blank" rel="noopener noreferrer">
                Yeast Meeting 2024 (part of The Allied Genetics Conference)
              </a>
              <br />
              <small>
                Metro Washington, DC<br />
                March 6 - 10, 2024
              </small>
            </li>
            <li>
              <a href="https://easternsun.eventsair.com/2024-16th-international-congress-on-yeasts/" target="_blank" rel="noopener noreferrer">
                16th International Congress on Yeasts
              </a>
              <br />
              <small>
                Cape Town International Conference Centre, Cape Town, South Africa<br />
                Sep 29 - Oct 3, 2024
              </small>
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2>Past Meetings &amp; Courses</h2>
          <ul>
            <li>
              Fungal Pathogen Genomics<br />
              <small>
                Wellcome Genome Campus, Hinxton, Cambridge, UK<br />
                May 7 - 12, 2023
              </small>
            </li>
            <li>
              <a href="https://microbiologysociety.org/event/full-events-listing/candida-and-candidiasis-2023.html" target="_blank" rel="noopener noreferrer">
                Candida and Candidiasis 2023
              </a>
              <br />
              <small>
                Montreal, Canada<br />
                May 13 - 17, 2023
              </small>
            </li>
            <li>
              <a href="https://conferences.uwo.ca/canfunnet/" target="_blank" rel="noopener noreferrer">
                3rd Annual CanFunNet Fungal Biology Conference
              </a>
              <br />
              <small>
                Virtual meeting hosted by the University of Alberta<br />
                June 1 - 3, 2022
              </small>
            </li>
            <li>
              <a href="https://hfp2022.febsevents.org" target="_blank" rel="noopener noreferrer">
                2022 FEBS Advanced Lecture Course on Molecular Mechanisms of Host-pathogen Interactions and Virulence in Human Fungal Pathogens
              </a>
              <br />
              <small>
                La Colle sur Loup, France<br />
                May 14 - 20, 2022
              </small>
            </li>
            <li>
              <a href="https://genetics-gsa.org/yeast/" target="_blank" rel="noopener noreferrer">
                Yeast Genetics Meeting
              </a>
              <br />
              <small>
                University of California, Los Angeles, CA<br />
                August 17 - 21, 2022
              </small>
            </li>
            <li>
              <a href="https://genetics-gsa.org/fungal/" target="_blank" rel="noopener noreferrer">
                31st Fungal Genetics Conference
              </a>
              <br />
              <small>
                Asilomar Conference Grounds, Pacific Grove, CA<br />
                March 15 - 20, 2022
              </small>
            </li>
            <li>
              <a href="https://microbiologysociety.org/event/full-events-listing/candida-and-candidiasis-2021.html#tab-2" target="_blank" rel="noopener noreferrer">
                Candida and Candidiasis 2021
              </a>
              <br />
              <small>
                Online Meeting<br />
                March 21 - 27, 2021
              </small>
            </li>
            <li>
              <a href="https://coursesandconferences.wellcomegenomecampus.org/our-events/fungal-pathogen-genomics-2021/" target="_blank" rel="noopener noreferrer">
                2021 Fungal Pathogen Genomics Workshop
              </a>
              <br />
              <small>
                Virtual workshop, May 10-14, 2021
              </small>
            </li>
            <li>
              <a href="https://www.mbl.edu/education/courses/molecular-mycology/" target="_blank" rel="noopener noreferrer">
                MBL Woods Hole Molecular Mycology Course
              </a>
              <br />
              <small>
                Online Webinar Course<br />
                August 14 - 29, 2021
              </small>
            </li>
            <li>
              <a href="https://microbiologysociety.org/event/society-events-and-meetings/candida-and-candidiasis-2020.html" target="_blank" rel="noopener noreferrer">
                Candida and Candidiasis 2020
              </a>
              <br />
              <small>
                Montreal, Canada<br />
                April 19 - 23, 2020
              </small>
            </li>
            <li>
              <a href="http://genetics-gsa.org" target="_blank" rel="noopener noreferrer">
                TAGC 2020 - The Allied Genetics Conference
              </a>
              <br />
              <small>
                Metro Washington D.C., USA<br />
                April 22 - 26, 2020
              </small>
            </li>
            <li>
              <a href="https://coursesandconferences.wellcomegenomecampus.org/our-events/fungal-pathogen-genomics-2020/" target="_blank" rel="noopener noreferrer">
                Fungal Pathogen Genomics Course
              </a>
              <br />
              <small>
                Wellcome Genome Campus, Hinxton, United Kingdom<br />
                May 11 - 16, 2020
              </small>
            </li>
            <li>
              <a href="https://www.embo-embl-symposia.org/symposia/2020/EES20-06/index.html" target="_blank" rel="noopener noreferrer">
                Innate Immunity in Host-Pathogen Interactions
              </a>
              <br />
              <small>
                EMBL Heidelberg, Germany<br />
                28 June - 1 July 2020
              </small>
            </li>
            <li>
              <a href="https://www.mbl.edu/education/courses/molecular-mycology/" target="_blank" rel="noopener noreferrer">
                Molecular Mycology Course: Current Approaches to Fungal Pathogenesis
              </a>
              <br />
              <small>
                Marine Biological Laboratory, Woods Hole, Massachusetts, USA<br />
                July 17 - August 2, 2020
              </small>
            </li>
            <li>
              <a href="https://humanfungalinfectionmodels2020.febsevents.org" target="_blank" rel="noopener noreferrer">
                FEBS Advanced Practical Course "State-of-the-art alternative infection models to study molecular mechanisms of human fungal infections"
              </a>
              <br />
              <small>
                Jena, Germany<br />
                February 16 - 22, 2020
              </small>
            </li>
            <li>
              <a href="https://www.ecfg15.org" target="_blank" rel="noopener noreferrer">
                15th European Conference on Fungal Genetics
              </a>
              <br />
              <small>
                Rome, Italy<br />
                February 17 - 20, 2020
              </small>
            </li>
            <li>
              <a href="https://yeast2019.org" target="_blank" rel="noopener noreferrer">
                29th International Conference on Yeast Genetics and Molecular Biology (ICYGMB)
              </a>
              <br />
              <small>
                Gothenburg, Sweden<br />
                August 18 - 22, 2019
              </small>
            </li>
            <li>
              <a href="https://coursesandconferences.wellcomegenomecampus.org/our-events/fungal-pathogen-genomics-2019/" target="_blank" rel="noopener noreferrer">
                Fungal Pathogen Genomics Course
              </a>
              <br />
              <small>
                Wellcome Genome Campus, Hinxton, United Kingdom<br />
                May 7 - 12, 2019
              </small>
            </li>
            <li>
              <a href="https://hfp2019.febsevents.org" target="_blank" rel="noopener noreferrer">
                HFP2019: Molecular Mechanisms of Host-Pathogen Interactions and Virulence in Human Fungal Pathogens
              </a>
              <br />
              <small>
                La Colle sur Loup, France<br />
                May 18 - 24, 2019
              </small>
            </li>
            <li>
              <a href="https://petitinstitute.gatech.edu/serym-2019" target="_blank" rel="noopener noreferrer">
                Southeastern Regional Yeast Meeting (SERYM) 2019
              </a>
              <br />
              <small>
                Petit Institute for Bioengineering and Bioscience, Georgia Tech, Atlanta, Georgia, USA<br />
                April 12 - 14, 2019
              </small>
            </li>
            <li>
              <a href="http://conferences.genetics-gsa.org/fungal/2019/index" target="_blank" rel="noopener noreferrer">
                30th Fungal Genetics Conference
              </a>
              <br />
              <small>
                Asilomar Conference Grounds, Pacific Grove, California, USA<br />
                March 12 - 17, 2019
              </small>
            </li>
            <li>
              <a href="https://www.grc.org/immunology-of-fungal-infections-grs-conference/2019/" target="_blank" rel="noopener noreferrer">
                Immunology of Fungal Infections - Gordon Research Seminar
              </a>
              <br />
              <small>
                Galveston, Texas, USA<br />
                January 12 - 13, 2019
              </small>
            </li>
          </ul>
        </div>

        <div className="info-note">
          <p>
            If you would like to add a conference or course to this list,
            please <Link to="/contact">send a message to CGD curators</Link> with details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MeetingsPage;
