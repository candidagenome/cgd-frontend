import React from 'react';
import { Link } from 'react-router-dom';
import './InfoPages.css';

const StaffPage = () => {
  const staffMembers = {
    principalInvestigator: {
      name: 'Gavin Sherlock, Ph.D.',
      title: 'Associate Professor',
      image: '/images/staff/gavin_sherlock.jpg',
      link: 'http://genetics.stanford.edu/~sherlock/'
    },
    bioinformatics: [
      {
        name: 'Jodi Lew-Smith, Ph.D.',
        title: 'Senior Biocuration Scientist',
        image: '/images/staff/jodi_lewsmith.jpg'
      },
      {
        name: 'Jon Binkley',
        title: 'Senior Scientific Programmer',
        image: '/images/staff/jon_binkley.jpg'
      }
    ],
    programming: [
      {
        name: 'Gail Binkley',
        title: 'Principal Database Administrator',
        phone: '650-498-7145',
        image: '/images/staff/gail_binkley_tn.jpg'
      },
      {
        name: 'Stuart Miyasato',
        title: 'Senior Systems Administrator',
        phone: '650-725-3125',
        image: '/images/staff/stuart_miyasato_tn.jpg'
      }
    ],
    pastContributors: [
      {
        name: 'Marek Skrzypek, Ph.D.',
        title: 'Senior Scientific Curator',
        image: '/images/staff/marek_skrzypek.jpg'
      },
      {
        name: 'Martha Arnaud, Ph.D.',
        title: 'Head, Scientific Curation',
        image: '/images/staff/martha_arnaud.jpg'
      },
      {
        name: 'Maria Costanzo, Ph.D.',
        title: 'Senior Scientific Curator',
        image: '/images/staff/maria_costanzo_tn.jpg'
      },
      {
        name: 'Diane Inglis, Ph.D.',
        title: 'Senior Scientific Curator',
        image: '/images/staff/diane_inglis.jpg'
      },
      {
        name: 'Prachi Shah',
        title: 'Lead Scientific Programmer',
        image: '/images/staff/prachi_shah.jpg'
      },
      {
        name: 'Farrell Wymore',
        title: 'Senior Scientific Programmer',
        image: '/images/staff/farrell_wymore.jpg'
      }
    ]
  };

  const StaffCard = ({ member }) => (
    <div className="staff-card">
      <div className="staff-image-container">
        <img src={member.image} alt={member.name} className="staff-image" />
      </div>
      <div className="staff-info">
        {member.link ? (
          <a href={member.link} target="_blank" rel="noopener noreferrer">
            <strong>{member.name}</strong>
          </a>
        ) : (
          <strong>{member.name}</strong>
        )}
        <br />
        {member.title}
        {member.phone && (
          <>
            <br />
            Voice: {member.phone}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1><em>Candida</em> Genome Database Staff</h1>
        <hr />

        <div className="info-section" style={{ textAlign: 'center' }}>
          <p>
            <strong>General Contact Information:</strong><br />
            Voice: 650-498-6012<br />
            FAX: 650-724-3701<br />
            Email: candida-curator [at] lists.stanford.edu
          </p>
          <h2>Stanford University School of Medicine</h2>
        </div>

        <div className="info-section">
          <h2 style={{ textAlign: 'center' }}>Principal Investigator</h2>
          <div className="staff-grid staff-grid-single">
            <StaffCard member={staffMembers.principalInvestigator} />
          </div>
        </div>

        <div className="info-section">
          <h2 style={{ textAlign: 'center' }}>Bioinformatics and Scientific Curation Staff</h2>
          <div className="staff-grid">
            {staffMembers.bioinformatics.map((member, index) => (
              <StaffCard key={index} member={member} />
            ))}
          </div>
        </div>

        <div className="info-section">
          <h2 style={{ textAlign: 'center' }}>Programming, Database and Systems Administration Staff</h2>
          <div className="staff-grid">
            {staffMembers.programming.map((member, index) => (
              <StaffCard key={index} member={member} />
            ))}
          </div>
        </div>

        <div className="info-section">
          <h2 style={{ textAlign: 'center' }}>Past Contributors</h2>
          <div className="staff-grid staff-grid-four">
            {staffMembers.pastContributors.map((member, index) => (
              <StaffCard key={index} member={member} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffPage;
