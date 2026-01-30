import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

function PDBHomologHelp() {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>CGD Help: PDB Homolog Page</h1>
        <hr />

        <div className="info-section">
          <h2>Contents</h2>
          <ul>
            <li><a href="#descrip">Page Description and Navigation</a></li>
            <li>
              <a href="#organization">Organization of the Results Table</a>
              <ul>
                <li><a href="#pdb_info">PDB protein structure(s) homologous to query protein</a></li>
                <li><a href="#source">PDB Homolog Source</a></li>
                <li><a href="#align">Protein Alignment: query vs. PDB Homolog</a></li>
                <li><a href="#links">External Links</a></li>
              </ul>
            </li>
            <li><a href="#related">Related CGD Help Documents</a></li>
          </ul>
        </div>

        <hr />

        <div className="info-section">
          <h2 id="descrip">Page Description and Navigation</h2>
          <p>
            The PDB Homolog Page presents information for proteins of known structure homologous to the
            specified CGD protein, identified in a BLASTP search of{' '}
            <a href="http://www.rcsb.org" target="_blank" rel="noopener noreferrer">
              The RCSB Protein Databank (PDB)
            </a>
            . All BLAST hits with a P-value less than 1E-5 are displayed. The search results and associated
            informational links are displayed in a large table.
          </p>
          <p>
            The top of the page provides a site-wide quick search, links to the major CGD informational
            resources, and a bar with links to popular tools, such as a local BLAST search.
          </p>
        </div>

        <div className="info-section">
          <h2 id="organization">Organization of the Results Table</h2>
          <p>The Results Table (PDB Blast Hits) presents information in 4 columns:</p>

          <h3 id="pdb_info">1. PDB protein structure(s) homologous to query protein</h3>
          <p>This column summarizes the homologous PDB structures in two sub-columns:</p>
          <ul>
            <li>PDB identifier and description.</li>
            <li>
              Links to summary (PDB_Info) and structure (PDB_Structure) for the{' '}
              <a href="http://www.rcsb.org" target="_blank" rel="noopener noreferrer">
                PDB
              </a>{' '}
              homolog. Clicking on the latter initiates an interactive viewing session at PDB's site using
              the{' '}
              <a
                href="http://www.rcsb.org/robohelp_f/#molecular_viewers/introduction_to_molecular_viewers.htm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Jmol
              </a>{' '}
              structure viewer.
            </li>
          </ul>

          <h3 id="source">2. PDB Homolog Source</h3>
          <p>This column identifies the source organism(s) for the PDB homolog.</p>

          <h3 id="align">3. Protein Alignment: query vs. PDB Homolog</h3>
          <p>
            This column summarizes the alignment between the query protein and PDB homolog in four
            sub-columns:
          </p>
          <ul>
            <li>
              <strong>P-Value.</strong> The significance score of the BLAST hit.
            </li>
            <li>
              <strong>% Identical.</strong> The percent of aligned residues that are identical between the
              query and PDB homolog.
            </li>
            <li>
              <strong>% Similar.</strong> The percent of aligned residues that are physicochemically similar
              between the query and PDB homolog.
            </li>
            <li>
              <strong>Alignment.</strong> Link to view the pairwise alignment between the query and PDB
              homolog.
            </li>
          </ul>

          <h3 id="links">4. External Links</h3>
          <p>
            This column provides links to external resources providing additional information on the
            3D-structure of the homolog. The resources are:
          </p>
          <ul>
            <li>
              <a href="http://www.cathdb.info/" target="_blank" rel="noopener noreferrer">
                CATH
              </a>{' '}
              (Class, Architecture, Topology, Homologous superfamily site)
            </li>
            <li>
              <a
                href="http://www.ncbi.nlm.nih.gov/Structure/MMDB/mmdb.shtml"
                target="_blank"
                rel="noopener noreferrer"
              >
                MMDB
              </a>{' '}
              (Molecular Modeling Database at NCBI)
            </li>
            <li>
              <a href="http://scop.mrc-lmb.cam.ac.uk/scop/" target="_blank" rel="noopener noreferrer">
                SCOP
              </a>{' '}
              (Structural Classification of Proteins site)
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2 id="related">Related CGD Help Documents</h2>
          <ul>
            <li>
              <Link to="/help/locus">Locus Summary Help Page</Link>
            </li>
            <li>
              <Link to="/help/protein-page">Protein Information Help Page</Link>
            </li>
            <li>
              <Link to="/help/protein-motifs">Protein Domain/Motif Help Page</Link>
            </li>
            <li>
              <Link to="/help/protein-properties">Physicochemical Properties Help Page</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PDBHomologHelp;
