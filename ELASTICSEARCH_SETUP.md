# Elasticsearch Setup Guide for CGD

This document describes how to install and configure Elasticsearch for the CGD backend.

## Prerequisites

- Amazon Linux 2023 (or compatible Linux distribution)
- Root/sudo access
- At least 1GB free disk space (2GB+ recommended)
- At least 512MB available RAM for ES heap

## Installation Steps

### 1. Import Elasticsearch GPG Key

```bash
sudo rpm --import https://artifacts.elastic.co/GPG-KEY-elasticsearch
```

### 2. Create Yum Repository

```bash
sudo tee /etc/yum.repos.d/elasticsearch.repo << 'EOF'
[elasticsearch]
name=Elasticsearch repository for 8.x packages
baseurl=https://artifacts.elastic.co/packages/8.x/yum
gpgcheck=1
gpgkey=https://artifacts.elastic.co/GPG-KEY-elasticsearch
enabled=1
autorefresh=1
type=rpm-md
EOF
```

### 3. Install Elasticsearch

```bash
sudo dnf install -y elasticsearch
```

**Note:** The installer will generate a password for the `elastic` superuser - save this if you plan to use security features.

### 4. Create Clean Configuration

Replace the default configuration (which has auto-generated security settings):

```bash
sudo tee /etc/elasticsearch/elasticsearch.yml << 'EOF'
# ======================== Elasticsearch Configuration =========================
# CGD Server

# ---------------------------------- Cluster -----------------------------------
cluster.name: cgd-prod  # Use cgd-dev for dev server

# ------------------------------------ Node ------------------------------------
node.name: cgd-node-1

# ----------------------------------- Paths ------------------------------------
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch

# ---------------------------------- Network -----------------------------------
network.host: 127.0.0.1
http.port: 9200

# --------------------------------- Discovery ----------------------------------
# Single node (no clustering)
discovery.type: single-node

# --------------------------------- Security -----------------------------------
# Disabled for local development (ES only listens on localhost)
xpack.security.enabled: false
EOF
```

### 5. Configure Heap Size

Set heap size based on available memory (recommended: 512MB for dev, 1-2GB for prod):

```bash
# For dev server (limited RAM)
echo '-Xms512m
-Xmx512m' | sudo tee /etc/elasticsearch/jvm.options.d/heap.options

# For prod server (more RAM available)
echo '-Xms2g
-Xmx2g' | sudo tee /etc/elasticsearch/jvm.options.d/heap.options
```

### 6. Clean Up Security Keystore Entries

The installer auto-generates security entries that conflict with disabled security:

```bash
sudo /usr/share/elasticsearch/bin/elasticsearch-keystore remove xpack.security.http.ssl.keystore.secure_password
sudo /usr/share/elasticsearch/bin/elasticsearch-keystore remove xpack.security.transport.ssl.keystore.secure_password
sudo /usr/share/elasticsearch/bin/elasticsearch-keystore remove xpack.security.transport.ssl.truststore.secure_password
sudo /usr/share/elasticsearch/bin/elasticsearch-keystore remove autoconfiguration.password_hash
```

### 7. Enable and Start Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable elasticsearch
sudo systemctl start elasticsearch
```

### 8. Verify Installation

```bash
# Check service status
sudo systemctl status elasticsearch

# Test API
curl http://localhost:9200/
```

Expected output:
```json
{
  "name" : "cgd-node-1",
  "cluster_name" : "cgd-prod",
  "version" : {
    "number" : "8.19.x",
    ...
  },
  "tagline" : "You Know, for Search"
}
```

## Backend Configuration

### Python Elasticsearch Client Version

**IMPORTANT:** The Python `elasticsearch` package version must match the ES server major version:
- ES Server 8.x requires `elasticsearch>=8.0.0,<9.0.0`
- ES Server 9.x requires `elasticsearch>=9.0.0`

If you see errors like "Accept version must be either version 8 or 7, but found 9", downgrade the client:

```bash
pip install 'elasticsearch>=8.0.0,<9.0.0'
```

### Environment Variables

Add to your `.env` file or environment:

```bash
USE_ELASTICSEARCH=true
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_INDEX=cgd_search
```

### Restart Backend Service

After updating `.env`, restart the backend:

```bash
sudo systemctl restart cgd-api
```

### Index Data

Run the reindex command to populate ES with data from Oracle:

```bash
cd /path/to/cgd-backend
source venv/bin/activate
python -m cgd.cli.commands reindex
```

This indexes all search data types. Current counts (as of April 2026):
- Genes/Features: ~156,000 documents
- GO Terms: ~39,000 documents
- Phenotypes: ~150 documents
- References: ~56,000 documents
- **Total: ~250,000 documents**

Indexing takes approximately 2 minutes.

## Verification

Check ES status via API:

```bash
curl http://localhost:9200/cgd_search/_count
```

Or via the CGD backend health endpoint:

```bash
curl http://localhost:8000/api/search/es/status
```

## Troubleshooting

### ES Won't Start

1. Check logs: `sudo journalctl -xeu elasticsearch.service`
2. Check ES log: `sudo tail -100 /var/log/elasticsearch/cgd-*.log`
3. Verify config syntax: `sudo cat /etc/elasticsearch/elasticsearch.yml`

### Memory Issues

If ES crashes with OOM:
- Reduce heap size in `/etc/elasticsearch/jvm.options.d/heap.options`
- Ensure total system RAM is at least 2x heap size

### Search Not Using ES

1. Check `USE_ELASTICSEARCH=true` in environment
2. Verify ES is reachable: `curl http://localhost:9200/`
3. Check index exists: `curl http://localhost:9200/cgd_search/_count`
4. Check backend logs for ES errors

## Maintenance

### Reindex Data

```bash
python -m cgd.cli.commands reindex
```

### Check Index Health

```bash
curl http://localhost:9200/_cat/indices?v
curl http://localhost:9200/cgd_search/_stats
```

### Clear Index

```bash
curl -X DELETE http://localhost:9200/cgd_search
```
