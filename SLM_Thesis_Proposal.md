---
title: "Specialized Small Language Models for NL-to-SQL: Task Specialization and Intelligent SLM–LLM Orchestration"
---

\vspace{2cm}

**Department of Computer Science**
**National University of Computer and Emerging Sciences, Islamabad**

# Specialized Small Language Models for NL-to-SQL: Task Specialization and Intelligent SLM–LLM Orchestration

| | | |
|---|---|---|
| **Submitted By** | : | Abdullah Amin, Haaniah Ismail, Mishal Fatima |
| **Roll No** | : | 23i-0691, 23i-0605, 23i-0776 |
| **Supervisor** | : | Ali Zeeshan |
| **Co-Supervisor** | : | - |

Department of Computer Science
2026

\newpage

# Thesis Proposal

## 1. Introduction

Small Language Models (SLMs) can match or exceed the performance of much larger, general-purpose Large Language Models (LLMs) on domain-specific tasks when they are properly specialized, while remaining deployable on consumer-grade hardware and preserving user privacy. This project investigates that claim for Natural-Language-to-SQL (NL-to-SQL) translation: the task of converting a natural-language question, together with a database schema, into a correct, executable SQL query. Reliance on large, general-purpose LLMs for a structured task like NL-to-SQL introduces high operational cost, dependence on cloud infrastructure, and exposure of potentially sensitive query data to third-party providers. This project asks whether a domain-specialized SLM, combined with an intelligent SLM–LLM orchestration layer, can achieve competitive NL-to-SQL accuracy while reducing computational cost and enabling deployment in resource-constrained environments.

### 1.1. Background / Domain Concepts

NL-to-SQL systems must map a natural-language question and a serialized database schema onto a syntactically valid, semantically correct SQL query. Small models in the sub-4B parameter range (e.g. SmolLM2, Gemma 3, Phi-3.5-mini) are attractive for this task because they can run locally rather than through a paid API, but their out-of-the-box accuracy typically lags behind frontier LLMs. Parameter-efficient fine-tuning methods such as LoRA and QLoRA allow an SLM to be specialized for a task like NL-to-SQL by training a small number of additional parameters rather than the full model, making specialization achievable without the cost of full fine-tuning. Separately, model routing (or orchestration) refers to systems that decide, on a per-query basis, whether a cheap/local model can handle a request or whether it should be escalated to a more capable and more expensive cloud LLM — trading off cost, latency, and quality.

### 1.2. The Problem

Existing research demonstrates both halves of this idea separately, but not combined for NL-to-SQL. On the specialization side, Fan et al. showed that a small model handling SQL structure and schema alignment, paired with a large model for reranking, improves execution accuracy by 5.5–16.4% over an SLM-only baseline, and Pei's Feather-SQL showed that sub-7B models can reach 54.76% execution accuracy on BIRD through schema pruning and multi-candidate generation without any fine-tuning at all. On the orchestration side, RouteLLM, FrugalGPT, and OrchestraLLM each demonstrate that routing between a cheap and an expensive model can cut inference cost substantially — from roughly 50% up to 85% — while retaining most of the quality of always using the larger model. However, these routing systems use generic, task-agnostic routing signals (confidence scores, preference classifiers, cascading thresholds). The one SQL-aware exception, EllieSQL (Li et al., COLM 2025), routes each query among text-to-SQL pipelines of increasing cost using a learned difficulty classifier — yet it neither fine-tunes the answering model nor exploits explicit SQL structure such as schema complexity, JOIN depth, or subquery nesting to decide when a locally fine-tuned SLM is trustworthy enough to answer on its own.

This leaves an open question: can a single project fine-tune an SLM for NL-to-SQL, characterize how far a small model can be pushed toward frontier-LLM accuracy, and then build a routing layer around that same specialized model using SQL-specific signals rather than generic confidence — combining specialization and orchestration into one system instead of treating them as separate problems, as prior work does?

### 1.3. Motivation

The motivation for this project is to move beyond treating SLM specialization and SLM–LLM routing as independent research problems, and instead build one system where a specialized SLM handles as much of the NL-to-SQL workload as it can, and an SQL-aware router escalates only the queries that genuinely need a larger model. This has two practical payoffs: consumer-hardware deployability and improved privacy, since more queries are handled without ever leaving the local model, and reduced operating cost, since only the queries that need a cloud LLM incur that expense. Understanding how small an SLM can be while remaining competitive with frontier LLMs on structured query generation is the foundation both goals depend on.

### 1.4. Scope

This research is organized into two components. The first, **Task Specialization**, fine-tunes an SLM for NL-to-SQL translation, evaluates how model size affects structured-task performance, and establishes the reproducible fine-tuning and evaluation pipeline the rest of the project depends on. The second, **Intelligent Orchestration**, uses that specialized SLM to build a routing system that decides when the SLM can answer a query on its own and when to escalate to a cloud LLM, using SQL-specific complexity signals rather than generic confidence. The project targets the 1–4B parameter class specifically, evaluated on the Spider and WikiSQL benchmarks. General edge-deployment engineering (e.g. packaging for a specific device) and full reinforcement-learning-based training are outside this scope.

## 2. Research Objectives

The objectives of this research are organized around the two components in scope: SLM task specialization, and SLM–LLM orchestration.

1. Fine-tune an SLM for NL-to-SQL translation and evaluate how model size affects structured-task performance, to establish the size–accuracy tradeoff for this task.
2. Establish a reproducible fine-tuning and evaluation pipeline covering schema serialization, LoRA/QLoRA fine-tuning, and a standardized evaluation harness, that supports both components of the project.
3. Design an SQL-complexity-aware routing mechanism using signals such as schema complexity, JOIN depth, and subquery nesting — rather than generic confidence — to decide when the local SLM can answer autonomously and when to escalate to a cloud LLM.
4. Quantify the cost–quality tradeoff of routing by comparing always-SLM, always-LLM, and routed configurations, to determine how much of the LLM API cost can be saved while preserving output quality.
5. Benchmark the specialized SLM against frontier LLMs (GPT-4 / Claude) on the same test sets to characterize how competitive a properly specialized small model can become.

## 3. Literature Review / Related Work

Related work for this project falls into two groups that map directly onto its two components: work on specializing small models for NL-to-SQL, and work on routing/orchestrating between small and large models.

On **specialization**, Fan et al.'s ZeroNL2SQL pairs a small model (handling SQL structure and schema alignment) with a large model (reranking and filling in detail), improving execution accuracy by 5.5–16.4% over an SLM-only baseline on Spider and BIRD. Pei's Feather-SQL shows that schema pruning, linking, and multi-candidate generation let models under 7B parameters reach 54.76% execution accuracy on BIRD with no fine-tuning at all, and separately demonstrates knowledge distillation and SQL-aware pretraining for 100M–800M models. Ma et al.'s SQL-R1 uses reinforcement learning with execution-based rewards on roughly 2.5 million synthetic training pairs to push a 7B model to 88.6% accuracy on Spider and 67.1% on BIRD, showing what is achievable with large-scale RL training, though at a data and compute cost this project does not attempt to match. Pourreza and Rafiei's DTS-SQL demonstrates that explicitly decomposing NL-to-SQL fine-tuning into two stages — a dedicated schema-linking stage followed by SQL generation — allows small open-source LLMs to substantially close the gap to GPT-4-level accuracy on Spider, suggesting a concrete, lower-cost lever (structured, decomposed fine-tuning rather than raw scale) for closing the size–accuracy gap. Dettmers et al.'s QLoRA underlies the fine-tuning method itself: 4-bit quantization combined with trainable low-rank adapters matches full fine-tuning quality while sharply reducing the compute required, making it practical to fine-tune multiple model sizes for the size-effect ablation. Most recently, SLM-SQL (Sheng & Xu, AACL-IJCNLP 2025) post-trained 0.5B–1.5B models with SFT and reinforcement learning on roughly a million synthetic examples, reaching 70.49% execution accuracy on BIRD test with a 1.5B model — evidence that even the sub-2B class can approach 7B-class accuracy, though at a data and compute scale this project does not assume.

On **orchestration**, RouteLLM learns a preference-trained routing classifier that achieves roughly 2× cost reduction while retaining 95%+ of quality; FrugalGPT (Chen, Zaharia & Zou, published in Transactions on Machine Learning Research, 2024) applies a cascade-based strategy where cheap models are tried first and expensive models are called only when needed; and OrchestraLLM applies the same idea to dialogue state tracking, cutting cost by 50%+ while maintaining task performance. All three, however, route on generic, task-agnostic signals. The closest existing work to this project's orchestration component is EllieSQL (Li et al., COLM 2025), which trains a lightweight complexity classifier — including a 0.5B router fine-tuned with DPO — to route each query among text-to-SQL pipelines of increasing cost, cutting token expenditure by more than 40% on BIRD with no loss of execution accuracy. EllieSQL, however, routes among pipelines built around fixed cloud LLMs: it does not fine-tune the answering model, does not use explicit SQL-structural features — schema complexity, JOIN depth, subquery nesting, ambiguous column references — and does not escalate based on the generator's own token-level confidence. Deciding whether a locally fine-tuned SLM is likely to get a given query right, using such signals, remains open; that remaining gap is the direct motivation for this project's orchestration component.

The table below summarizes the key related work, its methodology, findings, and relevance to this project.

| Author & Year | Objective | Methodology | Key Findings | Limitations & Relevance |
|---|---|---|---|---|
| **Fan et al. (PVLDB 2024) — ZeroNL2SQL** | Combine a small model and a large model for zero-shot NL-to-SQL translation. | SLM generates candidate SQL structure/schema alignment; LLM reranks and fills in remaining detail; evaluated on Spider and BIRD. | Hybrid approach improves execution accuracy by +5.5–16.4% over an SLM-only baseline. | Treats fine-tuning and routing as separate problems rather than a single system; motivates this project's integrated specialization + orchestration design. |
| **Pei (2025) — Feather-SQL** | Enable competitive NL-to-SQL performance for models under 7B parameters at low inference cost. | Schema pruning/linking, multi-candidate generation, and knowledge distillation for 100M–800M models. | 54.76% execution accuracy on BIRD without any task-specific fine-tuning. | Does not address edge-deployment constraints or measure real latency/memory; this project's specialization component fills that gap. |
| **Ma et al. (NeurIPS 2025) — SQL-R1** | Train an NL-to-SQL model to iteratively refine queries using execution feedback as a reward signal. | Reinforcement learning with execution-based rewards on ~2.5M synthetic query pairs, evaluated at 7B scale. | 88.6% execution accuracy on Spider and 67.1% on BIRD. | Uses far more training data than is practical to characterize at the 1–4B scale; motivates this project's own data-efficiency ablation. |
| **Pourreza & Rafiei (Findings of EMNLP 2024) — DTS-SQL** | Close the accuracy gap between small and large models on NL-to-SQL through structured, decomposed fine-tuning. | Two-stage supervised fine-tuning — a dedicated schema-linking stage followed by SQL generation — evaluated on Spider and Spider-SYN with open-source LLMs. | Substantially narrows the gap to GPT-4-level accuracy without increasing model size. | Peer-reviewed; supports this project's use of structured, decomposed fine-tuning as a lever for the size–accuracy tradeoff. |
| **Dettmers et al. (NeurIPS 2023) — QLoRA** | Enable fine-tuning of large language models on limited hardware without quality loss. | 4-bit quantization of frozen base-model weights with trainable low-rank adapters (LoRA). | Matches full fine-tuning quality while drastically reducing memory footprint. | Adopted as the project's core parameter-efficient fine-tuning method for comparing LoRA vs. QLoRA efficiency. |
| **RouteLLM (Ong et al., ICLR 2025)** | Route queries between cheaper and more capable models using a learned preference-trained classifier. | Binary router trained on human preference data, evaluated on general-purpose tasks. | Achieves roughly 2× cost reduction while retaining 95%+ of quality. | Routing signal is generic and task-agnostic; does not exploit SQL-specific structure. Core related work for this project's routing component. |
| **OrchestraLLM (NAACL 2024)** | Orchestrate when to call specialized modules versus larger LLMs for dialogue state tracking. | Lightweight orchestrator model that decides per-turn whether a small module or a large LLM should respond. | Cuts inference cost 50%+ while maintaining task performance. | Domain is dialogue state tracking, not SQL; demonstrates the general orchestration pattern this project adapts to NL-to-SQL. |
| **FrugalGPT (Chen, Zaharia & Zou; Transactions on Machine Learning Research, 2024)** | Reduce LLM API cost while preserving output quality. | Cascade-based routing: cheap models are tried first, escalating to expensive models only when needed. | Substantial cost savings with minimal quality loss on general NLP tasks. | Generic cascading, not SQL-aware; used as a baseline routing strategy to compare against this project's SQL-complexity-aware router. |
| **Li et al. (COLM 2025) — EllieSQL** | Cut text-to-SQL serving cost by routing each query to a pipeline matching its difficulty. | Learned complexity classifier (incl. a 0.5B DPO-tuned router) routes queries among basic/intermediate/advanced pipelines; Token Elasticity of Performance metric. | >40% token-cost reduction on BIRD dev with no loss of execution accuracy. | Routes among fixed cloud-LLM pipelines: no fine-tuned local generator, no explicit structural features, no token-confidence escalation — the closest prior work and the primary routing baseline for this project. |
| **Sheng & Xu (AACL-IJCNLP 2025) — SLM-SQL** | Characterize how far 0.5B–1.5B models can be pushed on text-to-SQL. | SFT + GRPO-style RL on ~900K+ SynSQL-derived examples; corrective self-consistency at inference. | +31.4 EX points on average; 1.5B model reaches 70.49% EX on BIRD test. | Depends on large-scale synthetic data and RL compute; no routing. Motivates this project's LoRA/QLoRA data-efficiency ablation in the 1–4B class. |

## 4. Gap Analysis

Existing work leaves several gaps relevant to this project's two components.

**First, SQL-aware routing remains incomplete:** general-purpose routers (RouteLLM, FrugalGPT, OrchestraLLM) use task-agnostic confidence or preference signals, and the one SQL-specific router, EllieSQL, relies on a learned difficulty classifier over fixed cloud-LLM pipelines. No existing system routes with explicit SQL-structural features — schema complexity, JOIN depth, subquery nesting, ambiguous column references — combined with a locally fine-tuned SLM's own confidence, to decide when that SLM can answer autonomously; this project's orchestration component addresses that directly.

**Second, the 1–4B parameter class remains only partially characterized for NL-to-SQL:** earlier results benchmark either very small models (e.g. T5-Small, ~60M parameters) or large models (7B+), and the most recent small-model work, SLM-SQL, post-trains 0.5B–1.5B models with SFT and reinforcement learning over roughly a million synthetic examples. What remains uncharted is the setting this project targets: LoRA/QLoRA-only specialization of modern 1–4B SLMs (Phi-3.5-mini, Gemma 3 1B/4B) under modest data budgets, with a systematically mapped size–accuracy curve. This project's specialization component maps that frontier directly.

**Third, hybrid SLM+LLM strategies** such as ZeroNL2SQL and Feather-SQL are proposed without an integrated system that fine-tunes an SLM for SQL, measures its confidence or complexity signal on each query, and routes to an LLM only when needed — existing work, including EllieSQL's pipeline-level router, treats fine-tuning and routing as separate problems. This project's contribution is that single, integrated pipeline: one specialized SLM feeding one SQL-aware router, evaluated together rather than as two independent systems.

**Finally, a data-efficiency gap remains open:** SQL-R1 uses 2.5 million synthetic training pairs, but it is unclear how few training examples are actually needed for competitive NL-to-SQL performance in a LoRA/QLoRA fine-tuning setting. This project's data-volume ablation, run as part of the specialization component, addresses that question directly.

## 5. Problem Statement

The widespread reliance on large, general-purpose LLMs for domain-specific applications such as NL-to-SQL introduces significant challenges, including high operational cost, dependence on cloud infrastructure, and privacy concerns. This project investigates whether a domain-specialized SLM, combined with an SQL-aware SLM–LLM orchestration layer, can achieve competitive execution accuracy on NL-to-SQL tasks while reducing computational cost and enabling deployment in resource-constrained environments — treating specialization and routing as one integrated system rather than two separate problems.

## 6. Research Questions

**Primary Research Question:**

- How small can an SLM go while remaining competitive with frontier LLMs on structured query (NL-to-SQL) generation?

**Secondary Research Questions:**

- How do SLMs respond to parameter-efficient (LoRA/QLoRA) fine-tuning across different training-data volumes and configurations?
- Can SQL-complexity-aware routing — using signals such as schema complexity, JOIN depth, and subquery nesting — reduce LLM API costs by 50%+ while maintaining 95%+ of output quality, compared to generic confidence-based routing?

## 7. Methodology

The project is organized into the two components defined in Section 1.4: Task Specialization (which also establishes the shared fine-tuning and evaluation pipeline) and Intelligent Orchestration.

### 7.1 Component 1 — NL-to-SQL Task Specialization

This component fine-tunes an SLM (candidates: Phi-3.5-mini, Gemma 3 1B/4B, SmolLM2 135M–1.7B) for NL-to-SQL translation using a LoRA/QLoRA pipeline built with Hugging Face Transformers, PEFT, and TRL. The model is trained and evaluated on the Spider and WikiSQL datasets, with execution accuracy, exact match, and partial match reported as the primary metrics. Two ablations structure the experiments: a model-size ablation, comparing accuracy across the candidate model sizes to trace the size–accuracy tradeoff curve, and a training-data-volume ablation, to establish how much fine-tuning data is actually needed for competitive performance. The specialized model is additionally benchmarked against GPT-4 and Claude on the same test sets to quantify how close a properly specialized small model can get to frontier-LLM accuracy. This component also produces the reusable fine-tuning and evaluation codebase, including a comparison of LoRA versus QLoRA efficiency on the available GPU, that supports Component 2.

### 7.2 Component 2 — Intelligent SLM–LLM Orchestration

Using the specialized SLM from Component 1, this component designs a confidence- and complexity-based routing mechanism that decides, per query, whether the local SLM can be trusted to answer or whether the query should be escalated to a cloud LLM. Routing features include table/column count, JOIN count, a nested-query indicator, schema-linking overlap, and the SLM's own token-level confidence, in contrast to the generic, task-agnostic signals used by RouteLLM, FrugalGPT, and OrchestraLLM. The routing pipeline is implemented as a cascade — SLM generates an answer, the complexity/confidence check runs, and the query escalates to the LLM only if needed — and is evaluated on mixed-difficulty query sets. Cost savings versus quality retention are analyzed across a range of routing thresholds, comparing always-SLM, always-LLM, and routed configurations.

## 8. Dataset & Sources

### Spider Dataset

- **Source:** Yale-LILY Lab, accessible at <https://yale-lily.github.io/spider>
- **Structure and Attributes:** 10,181 natural-language questions paired with SQL queries across 200 cross-domain databases, with a standard train/dev split.
- **Justification for Dataset Selection:** The standard cross-domain NL-to-SQL benchmark, well suited to evaluating both the size–accuracy tradeoff and query-complexity signals for routing.

### WikiSQL Dataset

- **Source:** Salesforce Research, accessible at <https://github.com/salesforce/WikiSQL>
- **Structure and Attributes:** 80,654 natural-language question and SQL-query pairs over single-table databases.
- **Justification for Dataset Selection:** A large-scale, complementary benchmark used alongside Spider for fine-tuning and evaluation, and to test generalization across differing schema complexity.

### BIRD Benchmark (Reference)

- **Structure and Attributes:** A large-scale, cross-domain NL-to-SQL benchmark with greater real-world complexity than Spider, used in the literature this project builds on.
- **Justification for Dataset Selection:** Referenced for comparison against prior published results (e.g. Feather-SQL, SQL-R1, ZeroNL2SQL); used as a secondary evaluation set where time permits.

### Preprocessing Steps

- **Schema Serialization:** Each database schema is serialized into a compact text representation appended to the natural-language question.
- **Complexity Feature Extraction:** Table/column counts, JOIN counts, and nested-query indicators are computed per query for use as routing features in Component 2.
- **Data-Volume Sampling:** Stratified subsets of the training data are constructed to support the data-efficiency ablation.
- **Execution Environment:** SQLite copies of the Spider and WikiSQL databases are prepared to support execution-based accuracy scoring.

## 9. Evaluation Strategy & Metrics

### Performance Metrics

- **Execution Accuracy, Exact Match, and Partial Match:** the primary metrics for Component 1, reported per model size and per training-data volume.
- **Latency, Memory, and Perplexity:** baseline performance metrics captured by the shared fine-tuning and evaluation pipeline for every model configuration.
- **Cost–Quality Tradeoff:** for Component 2, the proportion of queries handled locally, the resulting API cost savings, and the quality retained relative to an always-LLM baseline, measured across routing thresholds.

### Comparative Analysis

The specialized SLM is compared against GPT-4 and Claude baselines on the same Spider/WikiSQL test sets to characterize the size–accuracy tradeoff. The routing system is compared against always-SLM, always-LLM, generic confidence-based routing (as a proxy for RouteLLM/FrugalGPT-style baselines), and an EllieSQL-style learned-complexity router, to isolate the benefit of explicit SQL-structural routing signals.

### Experimental Setup

- **Data Splitting:** Standard train/dev splits for Spider and WikiSQL are used, with held-out test sets reserved for the final LLM comparison.
- **Ablation Design:** Model-size and data-volume ablations are each run under a fixed configuration for the other variable, so that accuracy changes can be attributed cleanly.
- **Threshold Sweep:** The routing component is evaluated across a range of complexity/confidence thresholds to trace the full cost–quality tradeoff curve rather than a single operating point.

## 10. Expected Outcome(s)

- **A Fine-Tuned NL-to-SQL Model:** specialized via LoRA/QLoRA, with benchmark results directly comparable to GPT-4/Claude baselines.
- **An Accuracy–Size Tradeoff Curve:** characterizing how small an SLM can go while remaining competitive with frontier LLMs on NL-to-SQL.
- **A Modular, Reusable Fine-Tuning and Evaluation Codebase:** including a LoRA-vs-QLoRA efficiency comparison, usable beyond this project.
- **An SQL-Complexity-Aware Orchestration Framework:** with configurable routing thresholds, built around SQL-specific signals rather than generic confidence.
- **A Cost–Quality Tradeoff Analysis:** comparing always-SLM, always-LLM, and routed configurations across threshold settings.
- **A Data-Efficiency Finding:** clarifying how few training examples suffice for competitive NL-to-SQL performance in a LoRA/QLoRA setting.

## 11. References

1. Fan, Y., et al. (2024). *Combining Small and Large Language Models for Zero-Shot NL-to-SQL.* Proceedings of the VLDB Endowment (PVLDB).
2. Pei, W., et al. (2025). *Feather-SQL: A Lightweight NL2SQL Framework with Dual-Model Collaboration Paradigm for Small Language Models.* Findings of the Association for Computational Linguistics: AACL-IJCNLP 2025.
3. Ma, X., et al. (2025). *SQL-R1: NL-to-SQL Reasoning via Reinforcement Learning with Execution Feedback.* Advances in Neural Information Processing Systems (NeurIPS).
4. Pourreza, M., et al. (2025). *CHASE-SQL: Multi-Path Reasoning and Preference-Optimized Candidate Selection for NL-to-SQL.* International Conference on Learning Representations (ICLR).
5. Pourreza, M., & Rafiei, D. (2024). *DTS-SQL: Decomposed Text-to-SQL with Small Large Language Models.* Findings of the Association for Computational Linguistics: EMNLP 2024, pp. 8212–8220.
6. Dettmers, T., Pagnoni, A., Holtzman, A., & Zettlemoyer, L. (2023). *QLoRA: Efficient Finetuning of Quantized LLMs.* Advances in Neural Information Processing Systems (NeurIPS).
7. Ong, I., et al. (2025). *RouteLLM: Learning to Route LLMs with Preference Data.* International Conference on Learning Representations (ICLR).
8. Chen, L., Zaharia, M., & Zou, J. (2024). *FrugalGPT: How to Use Large Language Models While Reducing Cost and Improving Performance.* Transactions on Machine Learning Research (TMLR).
9. Yao, Z., et al. (2024). *OrchestraLLM: Efficient Orchestration for Dialogue State Tracking with Large Language Models.* North American Chapter of the Association for Computational Linguistics (NAACL).
10. Yu, T., et al. (2018). *Spider: A Large-Scale Human-Labeled Dataset for Complex and Cross-Domain Semantic Parsing and Text-to-SQL Task.* <https://yale-lily.github.io/spider>
11. Zhong, V., Xiong, C., & Socher, R. (2017). *Seq2SQL: Generating Structured Queries from Natural Language using Reinforcement Learning (WikiSQL).* <https://github.com/salesforce/WikiSQL>
12. Li, B., et al. (2025). *EllieSQL: Cost-Efficient Text-to-SQL with Complexity-Aware Routing.* Conference on Language Modeling (COLM 2025).
13. Sheng, L., & Xu, S.-S. (2025). *SLM-SQL: An Exploration of Small Language Models for Text-to-SQL.* Findings of the Association for Computational Linguistics: AACL-IJCNLP 2025.
