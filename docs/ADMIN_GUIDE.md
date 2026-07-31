# Admin Guide

## Managing Supabase
- **Row Level Security (RLS):** Policies are pre-configured in the schema script. To add new roles, modify the JWT claim checks in the `CREATE POLICY` statements.
- **pgvector Maintenance:** Monitor the performance of the `knowledge_base_embedding_idx` (HNSW index). If queries slow down as the database grows, consider adjusting the `ef_search` parameter in Postgres.

## Kubernetes Deployment
- Apply manifests in `deploy/k8s/`:
  - `kubectl apply -f deploy/k8s/deployment.yaml`
  - `kubectl apply -f deploy/k8s/service.yaml`
- Ensure secrets are mounted properly in the `command-center-secrets` K8s Secret.
