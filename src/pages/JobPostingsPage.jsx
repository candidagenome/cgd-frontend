import React from 'react';
import { Link } from 'react-router-dom';
import './InfoPages.css';

const JobPostingsPage = () => {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1><em>Candida</em> Community Job Postings</h1>
        <hr />

        <div className="info-section">
          <h2>Postdoctoral Position in Molecular Mechanisms of Fungal Pathogenesis; University of Texas, San Antonio (posted November 17, 2024)</h2>

          <p><strong>Description:</strong> A NIH-funded postdoctoral position is available in the laboratory of Dr. David Kadosh in the Department of Microbiology, Immunology and Molecular Genetics at the University of Texas Health Science Center at San Antonio. The Kadosh laboratory uses a variety of molecular, bioinformatic, genetic, cellular, genomic and biochemical approaches to address fundamental and clinically relevant questions in fungal pathogenesis. Research will focus on molecular mechanisms that control <em>Candida albicans</em> morphology, stress resistance, virulence and/or virulence-related properties in response to host environmental cues (for additional details and previous publications see <a href="https://wp.uthscsa.edu/mimg/team-member/david-kadosh-ph-d/" target="_blank" rel="noopener noreferrer">the posting</a>). Many opportunities are available for collaboration with both basic and clinical mycologists at the internationally recognized <a href="http://www.sacmm.org/" target="_blank" rel="noopener noreferrer">San Antonio Center for Medical Mycology</a>. This group represents one of the largest mycology centers in the U.S. and includes 10 laboratories working on a variety of topics in fungal pathogenesis.</p>

          <p><strong>Requirements:</strong> Candidates should have a Ph.D. and/or M.D. degree and previous experience in molecular biology, biochemistry, genetics, genomics, bioinformatics, cell biology and/or fungal pathogenesis. Preference will be given to candidates with a strong publication record in these areas. Prior experience in fungal pathogenesis is not necessarily required.</p>

          <p><strong>How to Apply:</strong> Applicants should send a cover letter, updated CV, and contact information for three references to David Kadosh, Ph.D. (kadosh@uthscsa.edu), Department of Microbiology, Immunology &amp; Molecular Genetics, University of Texas Health Science Center at San Antonio, 7703 Floyd Curl Drive, MC: 7758, San Antonio, TX 78229.</p>

          <p>The successful applicant will receive equivalent to NIH-level salary and full benefits. Located in south central Texas, near both Austin and the Texas Hill Country, San Antonio is one of the lowest cost-of-living major metropolitan areas in the U.S.</p>

          <p>All postdoctoral appointments are designated as security sensitive positions. The University of Texas Health Science Center at San Antonio is an Equal Employment Opportunity/Affirmative Action Employer.</p>
        </div>

        <hr style={{ margin: '30px 0' }} />

        <div className="info-note">
          <p>
            Job opportunities should be related to <em>Candida</em> biology. Postings will be added at the discretion of the CGD staff. To submit a posting, contact the <Link to="/contact">CGD Curators</Link>. Postings will typically remain on the CGD web site for two to three months after submission, or they may be removed sooner at the request of the submitter.
          </p>
        </div>
      </div>
    </div>
  );
};

export default JobPostingsPage;
