# Dataset Upload Protocol

Manual workflow for adding downloadable datasets to CGD.

## Overview

```
Local files  →  Prod server  →  Link in CGD Curator Central
(upload)        (stored)        (web UI)
```

## Upload Protocol

### 1. Prepare files locally

```bash
# Download the dataset files from the paper to the UPLOADS-AWS folder on your desktop
# (This is a shared folder that syncs with AWS)

# Open Terminal and navigate to the UPLOADS-AWS folder
cd ~/Desktop/UPLOADS-AWS
# Explanation: 'cd' means "change directory" - this moves you into the folder

# Create a new folder named Author_Year (e.g., Areastehfar_2026)
mkdir Areastehfar_2026
# Explanation: 'mkdir' means "make directory" - this creates a new folder

# Move all the downloaded dataset files into the new folder
mv file1.xlsx file2.csv file3.txt Areastehfar_2026/
# Explanation: 'mv' means "move" - this moves files into the folder
# Replace file1.xlsx, file2.csv, etc. with your actual file names
# You can also use: mv *.xlsx *.csv Areastehfar_2026/ to move all files of certain types
```

### 2. Create a compressed archive

```bash
# Create a .tar archive containing the folder and all its files
tar cvf Areastehfar_2026.tar Areastehfar_2026
# Explanation: 'tar cvf' creates an archive file
#   c = create a new archive
#   v = verbose (show files being added)
#   f = use the following filename
# This bundles the folder into a single .tar file for easy transfer
```

### 3. Upload to production server

```bash
# Copy the .tar file to the production server
scp Areastehfar_2026.tar cgd-prod:/data/downloads/systematic_results/
# Explanation: 'scp' means "secure copy" - this uploads the file to the server
# cgd-prod is the server name, followed by the destination path
```

### 4. Verify upload on server

```bash
# Connect to the production server
ssh cgd-prod
# Explanation: 'ssh' opens a remote connection to the server

# Navigate to the downloads folder
cd /data/downloads/systematic_results/
# Explanation: this moves you to the folder where datasets are stored

# List the files to verify the upload
ls -la
# Explanation: 'ls -la' lists all files with details (size, date, etc.)

# Extract the .tar archive
tar xvf Areastehfar_2026.tar
# Explanation: 'tar xvf' extracts the archive
#   x = extract files
#   v = verbose (show files being extracted)
#   f = use the following filename

# Verify the folder and files are there
ls -la Areastehfar_2026/
# Check that all expected files are present

# Remove the .tar file (no longer needed after extraction)
rm Areastehfar_2026.tar
# Explanation: 'rm' means "remove" - this deletes the archive file to save space

# Exit the server connection when done
exit
```

---

## After Upload: Link in CGD

The dataset needs to be linked to its reference paper in CGD Curator Central.

### 1. Link dataset to reference

1. Go to CGD Curator Central → "Edit or delete an existing reference"
2. Search by PMID
3. Click "Edit reference information"
4. At bottom, click "Add a new reference URL":
   - **Source:** Author
   - **URL_type:** reference data
   - **URL:** `/download/systematic_results/Author_Year`
5. Submit

### 2. Link to publisher supplement

1. Add another URL:
   - **Source:** Publisher
   - **URL_type:** reference supplement
   - **URL:** [paste publisher's supplemental data URL]
2. Submit

### 3. Verify

- Check that dataset appears in Download menu
- Verify "web supplement" icon links to the paper
