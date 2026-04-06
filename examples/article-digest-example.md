# Article Digest — Proof Points

Compact proof points from portfolio projects. Read by Sadhak at evaluation time to populate match tables and STAR stories without hardcoding metrics in prompts.

---

## CloudScale API Gateway — High-Performance Proxy

**Hero metrics:** 50K req/s throughput, 99.99% uptime, 12ms p99 latency

**Architecture:** NGINX ingress → rate limiter (token bucket) → auth middleware (JWT + API key) → request routing → circuit breaker → upstream services → response caching (Redis, 5ms reads)

**Key decisions:**
- Chose token bucket over sliding window for rate limiting (simpler, 95% as accurate)
- Built custom circuit breaker instead of using library (needed fine-grained per-endpoint control)
- Added request coalescing for cache misses (reduced upstream load by 40%)

**Proof points:**
- Replaced legacy gateway, reducing infrastructure cost by $180K/year
- Handles Black Friday traffic spikes (10x normal) without manual scaling
- Zero-downtime deployments via blue-green strategy
- Open source core with 1.2K GitHub stars

---

## ML Pipeline Orchestrator — End-to-End Training Platform

**Hero metrics:** 3x faster model iteration, 60% reduction in failed experiments, used by 15 ML engineers

**Architecture:** Experiment tracker → data versioning (DVC) → training orchestrator (Airflow) → model registry → A/B testing framework → monitoring dashboard

**Key decisions:**
- Chose Airflow over Kubeflow (team already knew Airflow, migration cost wasn't justified)
- Built custom experiment tracker instead of MLflow (needed tighter integration with internal tools)
- Implemented automatic rollback on metric regression (caught 5 bad deploys in first quarter)

**Proof points:**
- Reduced model deployment time from 2 weeks to 2 days
- Standardized ML workflow across 3 teams
- Conference talk: "Scaling ML Infrastructure" (QCon 2024)
- Saved ~200 engineer-hours/quarter through automation
