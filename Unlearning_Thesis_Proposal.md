<div align="center">

**Department of Computer Science**
**National University of Computer and Emerging Sciences, Islamabad**

# Verifiable Machine Unlearning: Executing Deletion Requests and Certifying Forgetting through Adversarial Audits

</div>

| | | |
|---|---|---|
| **Submitted By** | : | [Student Name 1], [Student Name 2], [Student Name 3] |
| **Roll No** | : | [Roll Numbers] |
| **Supervisor** | : | [Supervisor Name] |
| **Co-Supervisor** | : | [Co-Supervisor Name, if any] |

<div align="center">

Department of Computer Science
2026

</div>

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Research Objectives](#2-research-objectives)
3. [Literature Review / Related Work](#3-literature-review--related-work)
4. [Gap Analysis](#4-gap-analysis)
5. [Problem Statement](#5-problem-statement)
6. [Research Questions](#6-research-questions)
7. [Methodology](#7-methodology)
8. [Dataset & Sources](#8-dataset--sources)
9. [Evaluation Strategy & Metrics](#9-evaluation-strategy--metrics)
10. [Expected Outcome(s)](#10-expected-outcomes)
11. [References](#11-references)

---

# Final Year Project Proposal

## 1. Introduction

Organizations that train machine-learning models on user data are increasingly obligated, under regulations such as the GDPR "right to be forgotten" and the CCPA, to honor deletion requests. Deleting a user's rows from a database, however, does not remove that user's influence from a model already trained on those rows: the information persists in the learned weights and can be recovered by inference attacks. Retraining the model from scratch for every deletion request removes that influence but is computationally infeasible at any realistic request volume. *Machine unlearning* — efficiently removing the influence of specific training data from a trained model without full retraining — has emerged to close this gap, and recent work spans both exact methods (sharded retraining) and approximate methods (influence-function scrubbing, gradient-based forgetting, certified removal). Yet a second, equally important problem remains largely unaddressed in practice: even when an unlearning method is executed, there is no standard, adversarially validated way to *prove* that the model actually forgot. Compliance today is therefore effectively unauditable. This project asks whether an integrated framework can execute deletion requests against trained models **and** produce quantified, adversarially tested evidence of forgetting — a *deletion certificate* — while characterizing where each unlearning method sits on the accuracy–forgetting–compute frontier.

### 1.1. Background / Domain Concepts

A trained model's parameters encode statistical information about every example in its training set. **Machine unlearning** seeks to transform a trained model into one that behaves as if a designated "forget set" had never been included, without repeating the full training run. Two broad families exist. **Exact unlearning** partitions training data so that removing an example requires retraining only a small, isolated portion of the model — the canonical example is SISA (Sharded, Isolated, Sliced, Aggregated training), whose modern successors reduce this cost further using parameter-efficient fine-tuning. **Approximate unlearning** instead edits a fully trained model directly — using influence functions to estimate and subtract a deleted example's contribution, applying negative-gradient/gradient-ascent updates on the forget set, or adding calibrated noise so the result is provably close to a retrained model. This last idea, **certified unlearning**, borrows the (ε, δ)-indistinguishability language of differential privacy to bound how distinguishable an unlearned model is from one retrained from scratch.

Separately, **verification** asks whether forgetting actually happened. The dominant tool is the **membership inference attack (MIA)** — most sharply, the **Likelihood Ratio Attack (LiRA)**, which trains shadow models to test, at low false-positive rates, whether a given example was in the training set; a successful unlearning should drop a forget-set example's membership signal to that of a never-seen example. A complementary tool is **canary / poison injection**: deliberately planting identifiable or influential examples before training and measuring whether their effect survives unlearning. These verification tools sit alongside **cryptographic verification**, which uses commitments and proofs so a server can prove to a user that the deletion computation was actually performed.

### 1.2. The Problem

Recent peer-reviewed work has advanced both halves of this space, but as separate research artifacts rather than an integrated, auditable system. On the *execution* side, exact methods such as S3T (Basu Roy Chowdhury et al., ICLR 2025) make sharded retraining scalable via parameter-efficient fine-tuning, while approximate and certified methods — Hessian-free online certified unlearning (Qiao et al., ICLR 2025), certified unlearning for general non-convex networks (Koloskova et al., ICML 2025), Rewind-to-Delete (Mu & Klabjan, NeurIPS 2025), and influence-function scrubbing for LLM adapters (Ding et al., ICLR 2025) — each demonstrate efficient removal with different guarantee strengths and compute costs. On the *verification* side, cryptographic certificates (Eisenhofer et al., SaTML 2025), triple-granularity provider audits (TruVRF, IEEE TIFS 2025), sample-level completeness measurement (IAM, USENIX Security 2025), and rectified inference-attack evaluations (RULI, USENIX Security 2025; A-LiRA, ICDM 2025) each measure forgetting from a different angle. Crucially, a cluster of negative results — that approximate unlearning fails to remove data-poisoning effects (Pawelczyk et al., ICLR 2025), that duplicated data defeats even retraining-from-scratch (Ye et al., USENIX Security 2025), and that single-attack audits systematically disagree and under-report privacy risk (Wang et al., CCS 2025) — shows that *claimed* forgetting and *actual* forgetting routinely diverge.

What is missing is a system that closes the loop: executes a deletion request using a chosen unlearning method, subjects the result to a battery of adversarial audits, and emits a single quantified certificate recording the forgetting evidence, the accuracy cost, and the compute cost — evaluated consistently across methods and datasets. Existing evaluation is ad hoc and per-paper; there is no integrated pipeline that both *performs* unlearning and *produces adversarially tested evidence of forgetting*.

### 1.3. Motivation

The motivation is to make unlearning **auditable and comparable** rather than assumed. For an organization responding to a deletion request, an unlearning method that runs quickly but leaves a recoverable membership signal is worse than useless — it creates a false record of compliance. A framework that pairs execution with adversarial verification lets an operator answer a concrete question for each deletion request: *how much evidence is there that this data was actually forgotten, at what accuracy cost, and at what compute cost?* Turning that answer into a portable **deletion certificate** provides the auditable artifact that regulators and data owners currently lack, and benchmarking methods on a common accuracy–forgetting–compute frontier turns a collection of incomparable papers into actionable guidance on which method to use when.

### 1.4. Scope

This research is organized into three components. The first, **Unlearning Engines**, implements and exposes a common interface over one exact method (a SISA-style sharded pipeline) and one to two approximate methods (influence-function scrubbing and gradient-ascent/certified-removal forgetting), plus an exact retrain-from-scratch reference as the gold standard. The second, **Adversarial Audit Suite**, implements the verification battery — a LiRA-style shadow-model membership-inference audit and a planted-canary audit — used to quantify residual influence of the forget set. The third, **Certificate & Benchmark Harness**, integrates the first two into an end-to-end pipeline that generates per-request deletion certificates (forgetting score, accuracy delta, compute cost) and produces a comparative benchmark of the methods on the accuracy–forgetting–compute frontier. The project targets small, tractable models on the CIFAR-10, UCI Adult, and a small text-classification dataset, so that the exact retrain-from-scratch reference and shadow-model audits are computationally feasible. Cryptographic proof-of-computation certificates (e.g., SNARK-based schemes) and large-language-model-scale unlearning are treated as reference points and future work, not implementation targets. An initial proof-of-concept — one model family, SISA plus one approximate method, and the membership-inference audit running end-to-end with a generated certificate — is targeted for December.

## 2. Research Objectives

The objectives are organized around the three components in scope: unlearning execution, adversarial verification, and certification/benchmarking.

1. Implement an exact (SISA-style) unlearning engine and one to two approximate unlearning methods behind a common interface, alongside an exact retrain-from-scratch reference, so that deletion requests can be executed and compared uniformly.
2. Build an adversarial audit suite — a LiRA-style shadow-model membership-inference attack and a planted-canary influence audit — that quantifies how much residual influence of the forget set survives a given unlearning method.
3. Define and generate a per-request **deletion certificate** that records a quantified forgetting score, the utility (accuracy) delta relative to the original model, and the compute cost of the deletion.
4. Benchmark all implemented unlearning methods on a common **accuracy–forgetting–compute frontier**, across multiple datasets and forget-set sizes, using the audit suite as the forgetting measure.
5. Validate the certificate's faithfulness by stress-testing it against known failure modes (e.g., poisoned or duplicated forget data) so that a "forgotten" verdict is only issued when adversarial evidence supports it.

## 3. Literature Review / Related Work

Related work falls into three groups that map directly onto the project's three components: methods for *executing* unlearning (exact and approximate/certified), methods for *verifying* forgetting (adversarial audits and cryptographic certificates), and *benchmarks* that standardize evaluation. The review below is restricted to peer-reviewed work published in 2025–2026.

On **execution**, exact unlearning has moved toward scalability: Basu Roy Chowdhury et al.'s S3T (ICLR 2025) layers a sharded/sliced training scheme over parameter-efficient fine-tuning so that a deletion request need only deactivate the layers exposed to the removed slice, improving "deletion capacity" and retained accuracy over SISA-style baselines. On the approximate and certified side, Qiao et al. (ICLR 2025) give a Hessian-free online certified unlearning method that bounds the divergence between the unlearned and retrained models without inverting the Hessian, reporting millisecond-scale per-deletion cost; Koloskova et al. (ICML 2025) provide the first certified guarantees for general non-convex networks by recasting unlearning as privacy amplification via noisy fine-tuning on the retain set; Mu & Klabjan's Rewind-to-Delete (NeurIPS 2025) is a first-order, black-box certified method for non-convex losses that rewinds to a checkpoint, re-descends on the retain loss, and adds calibrated noise; and Ding et al.'s LLMEraser (ICLR 2025) uses influence functions to compute closed-form adapter edits for instance-wise unlearning without retraining. Together these span the exact ↔ approximate and heuristic ↔ certified axes this project's engines must cover, and their differing compute costs (retrain shards, noisy fine-tuning, checkpoint rewind, influence edits) directly populate the compute axis of the benchmark.

On **verification**, Eisenhofer et al. (SaTML 2025) give the first cryptographic definition of verifiable unlearning and a proof-based protocol by which a server can prove deletion was performed — the formal, provable end of the certificate spectrum. Complementing this, TruVRF (Zhou et al., IEEE TIFS 2025) provides a non-invasive, triple-granularity (class/volume/sample) audit that catches "neglecting, lazy, deceiving" providers with over 90% accuracy without pre-injected backdoors. The statistical-audit line is anchored by membership inference: IAM (Wang et al., USENIX Security 2025) measures sample-level unlearning *completeness* cheaply enough to track it across a model's deletion lifecycle; RULI (Naderloui et al., USENIX Security 2025) rectifies the systematic under-estimation of privacy risk and efficacy in per-sample evaluation via a dual-objective LiRA-style attack; and A-LiRA (Gu et al., ICDM 2025) audits approximate unlearning under differential privacy with an efficient LiRA variant that cuts attack cost by 88.3% while finding that unlearning can compromise *retained*-sample privacy. Wang et al. (CCS 2025) show that different MIAs disagree substantially on which samples are exposed, arguing for ensemble audits rather than a single attack — a direct design lesson for this project's audit suite. Two negative results define the failure modes any certificate must survive: Pawelczyk et al. (ICLR 2025) show approximate unlearning fails to remove data-poisoning effects across vision and LLM models even at large compute budgets (an implicit canary/poison-injection audit), and Ye et al. (USENIX Security 2025) show that duplicated training data can defeat even retraining-from-scratch.

On **benchmarks**, MUSE (Shi et al., ICLR 2025) defines a six-property evaluation for LLM unlearning (verbatim memorization, knowledge memorization, privacy leakage, utility, scalability, sustainability) and finds most methods degrade utility and fail at sequential/large-scale removal; OpenUnlearning (Dorna et al., NeurIPS 2025 Datasets & Benchmarks) unifies 13 methods and 16 metrics across three benchmarks with a meta-evaluation that scores the *metrics themselves* — a template this project adapts to validate its certificate; Wang et al. (ICLR 2025) show common forgetting metrics reflect surface behavior rather than true removal and propose attack-resistant, calibrated comparisons; and SemEval-2025 Task 4 (Ramakrishna et al., ACL 2025) supplies a peer-reviewed competition protocol and the LUME benchmark for standardized unlearning evaluation.

The table below summarizes the key related work, its methodology, findings, and relevance to this project.

| Author & Year | Objective | Methodology | Key Findings | Limitations & Relevance |
|---|---|---|---|---|
| **Basu Roy Chowdhury et al. (ICLR 2025) — S3T** | Make *exact* unlearning scalable by minimizing how much of a model must be retrained per deletion. | Sequence-aware Sharded Sliced Training over parameter-efficient fine-tuning; deletion deactivates only the layers exposed to a removed data slice. | Higher deletion capacity and better retained accuracy than SISA-style baselines. | Higher storage cost for shards/checkpoints; the natural modern "exact" engine and gold-standard-adjacent baseline for this project. |
| **Qiao et al. (ICLR 2025) — Hessian-Free Online Certified Unlearning** | Provide certified approximate unlearning for streaming deletions without Hessian inversion. | Affine stochastic recursion bounds the parameter gap between unlearned and retrained models; O(d) per deletion. | Millisecond-scale per-deletion cost with orders-of-magnitude time/storage savings over prior certified methods, plus accuracy gains. | Guarantee is DP-style bounded, not a public artifact; supplies the "approximate but provable" engine and a compute-axis anchor. |
| **Koloskova et al. (ICML 2025) — Certified Unlearning for Neural Networks** | Certified unlearning for general non-convex deep networks without loss assumptions. | Recasts unlearning as privacy amplification by noisy fine-tuning on the retain set to reach (ε, δ)-indistinguishability from retraining. | First certified method for arbitrary non-convex objectives; formal privacy–utility trade-off, outperforming prior certified baselines. | Guarantee strength tied to noise budget; no benchmark harness. Provides the (ε, δ) certificate primitive this project quantifies. |
| **Mu & Klabjan (NeurIPS 2025) — Rewind-to-Delete** | First-order, black-box certified unlearning for non-convex losses. | Rewind to an earlier checkpoint, re-descend on the retain loss, add Gaussian noise; prove (ε, δ) certified deletion. | Explicit privacy–utility–complexity trade-off; generalization guarantees under Polyak–Łojasiewicz conditions. | Needs stored checkpoints; tight only under PL-type assumptions. A concrete, low-machinery certificate-generating engine. |
| **Ding et al. (ICLR 2025) — LLMEraser** | Instance-wise unlearning for adapter-tuned models without retraining. | Influence functions compute closed-form edits to PEFT/LoRA adapters, reformulated as a finite-sum quadratic program. | Outperforms SOTA instance-wise unlearning baselines while preserving utility. | Heuristic (Taylor-approximation) guarantee, not certified; the influence-function "scrubbing" engine and an efficiency contrast case. |
| **Eisenhofer et al. (SaTML 2025) — Verifiable and Provably Secure Machine Unlearning** | Let a user cryptographically verify deletion actually occurred. | First cryptographic definition of verifiable unlearning; proofs of training and of correct unlearning via SNARKs/commitments over admissible functions. | Formal provable guarantees with a working end-to-end protocol. | Proof overhead dominated by SNARK cost; closest prior work to "deletion certificates" — the provable end of the spectrum this project references. |
| **Zhou et al. (IEEE TIFS 2025) — TruVRF** | Non-invasively verify a provider honestly performed unlearning. | Three Unlearning-Metrics at class/volume/sample granularity targeting neglecting/lazy/deceiving servers; no pre-injected backdoors. | >90% verification accuracy at class and sample level; works with SISA and Amnesiac unlearning. | Empirical, not cryptographic; a deployable audit baseline complementing this project's MIA/canary suite. |
| **Wang, C.-L. et al. (USENIX Security 2025) — IAM** | Measure sample-level unlearning *completeness* across a model's lifecycle. | Interpolated Approximate Measurement interpolates membership signals to score completeness far more cheaply than shadow-model MIAs. | Existing approximate methods leave measurable residual membership; scalable completeness scoring over sequential deletions. | Approximate estimator, not a formal proof; a strong candidate metric for this project's certificate forgetting-score. |
| **Naderloui et al. (USENIX Security 2025) — RULI** | Fix under-estimation of privacy risk and efficacy in per-sample unlearning evaluation. | Dual-objective, likelihood-ratio (LiRA-style) shadow-model attack measuring efficacy and residual privacy jointly at per-sample granularity. | Higher attack success than prior evaluators; exposes privacy risks standard metrics miss. | Shadow-model compute cost; the rigorous adversarial-audit methodology this project's MIA component builds on. |
| **Gu et al. (ICDM 2025) — A-LiRA** | Audit approximate unlearning under differential privacy for forgotten and retained data. | DP-grounded privacy criteria plus an efficient sample-level LiRA variant (A-LiRA). | Matches best prior attack accuracy at 88.3% lower cost; finds unlearning can compromise *retained*-sample privacy. | Focused on DP models; motivates certifying both the forget set *and* the unaffected retain set. |
| **Wang, Z. et al. (ACM CCS 2025) — MIAs as Privacy Tools** | Assess reliability/disparity of MIAs used for privacy auditing and unlearning verification. | Analyzes disagreement across SOTA MIAs beyond AUC/TPR@low-FPR; proposes a three-strategy ensemble. | Different MIAs disagree on which samples are exposed; ensembles give more complete, robust audits. | Establishes why single-attack audits are insufficient — the design recipe for this project's ensemble audit suite. |
| **Pawelczyk et al. (ICLR 2025) — Unlearning Fails to Remove Data Poisoning** | Test whether approximate unlearning removes the *effects* of injected data. | Evaluates 8 unlearning algorithms against indiscriminate, targeted, and a new Gaussian poisoning attack on vision and LLM models; releases OpenUnlearn. | Approximate unlearning consistently fails to remove poisoning effects even at large compute budgets. | Negative/diagnostic result; the canary/poison-injection stress test any certificate must survive — core problem-statement motivation. |
| **Ye et al. (USENIX Security 2025) — Data Duplication Attack** | Study how duplicated training data undermines unlearning. | Adversary duplicates data, later requests unlearning, and measures residual influence and detectability under standard/federated/RL unlearning. | Even retrain-from-scratch can fail under duplication; unlearning duplicates can degrade the model; crafted duplicates evade de-duplication. | Defines an adversarial failure mode the audit/certificate must be robust to; informs forget-set construction. |
| **Shi et al. (ICLR 2025) — MUSE** | A standardized six-property benchmark for unlearning evaluation. | Six axes (verbatim/knowledge memorization, privacy leakage, utility, scalability, sustainability) over 8 algorithms. | Most methods degrade utility and fail at sequential and large-scale removal; only one avoids severe privacy leakage. | LLM-text-specific, no formal certificate; supplies a ready multi-metric definition of "forgetting" for this project's frontier. |
| **Dorna et al. (NeurIPS 2025 D&B) — OpenUnlearning** | Unify unlearning methods and the metrics that judge them. | Integrates 13 algorithms and 16 evaluations across 3 benchmarks; releases 450+ checkpoints and a meta-evaluation of metric faithfulness. | Reproducible leaderboard-style harness; identifies which memorization metrics are trustworthy. | LLM-only, no guarantees; the strongest template for this project's benchmark harness and its metric-validation idea. |
| **Wang, Q. et al. (ICLR 2025) — Effective Evaluations for LLM Unlearning** | Improve robustness/comparability of unlearning evaluation. | Identifies attack-resistant metrics; calibration scheme restores retain-set performance for fair comparison. | Common metrics reflect surface behavior, not true removal; forgetting vs. retention conflict is measurable and partly resolvable. | Empirical, LLM-focused; motivates why this project's certificate must be adversarially validated, not metric-surface. |
| **Ramakrishna et al. (ACL 2025) — SemEval-2025 Task 4** | A community shared task standardizing sensitive-content unlearning. | Three subtasks (long-form docs, PII biographies, real training docs) evaluated with the LUME benchmark; 100+ submissions. | Synthesizes winning techniques and lessons on the forgetting–retention trade-off. | Workshop competition, task-specific; a citable standardized protocol and benchmark reference for this project's evaluation. |

## 4. Gap Analysis

Existing work leaves several gaps relevant to this project's three components.

**First, execution and verification are treated as separate artifacts.** Execution methods (S3T, Hessian-free certified unlearning, Koloskova et al., Rewind-to-Delete, LLMEraser) report their own ad hoc forgetting evidence, while verification methods (TruVRF, IAM, RULI, A-LiRA) are typically demonstrated against a small, fixed set of unlearning algorithms. No existing system executes a deletion request with a *chosen* engine and then routes the result through a *common* adversarial audit battery, so results across papers are not comparable. This project's integration of engines and audits behind one interface addresses that directly.

**Second, there is no quantified, portable deletion certificate for the practical (non-cryptographic) setting.** Eisenhofer et al. (SaTML 2025) provide a cryptographic proof-of-computation certificate, but at SNARK-proof overhead and without a statistical measure of *how much* was forgotten. The statistical audits (IAM, RULI, A-LiRA) produce forgetting evidence but not a single artifact that jointly records forgetting score, accuracy delta, and compute cost per request. This project defines exactly that certificate as its central artifact.

**Third, forgetting metrics are known to be unreliable, yet are rarely validated adversarially before a "forgotten" verdict is issued.** Wang et al. (CCS 2025) show single MIAs disagree; Pawelczyk et al. (ICLR 2025) and Ye et al. (USENIX Security 2025) show claimed forgetting fails under poisoning and duplication; Wang et al. (ICLR 2025) show surface metrics mislead. Despite this, no unlearning pipeline conditions its compliance claim on surviving these adversarial stress tests. This project's certificate is only issued when ensemble-audit and canary/poison evidence support it — turning the negative results above into acceptance criteria.

**Finally, no benchmark maps the accuracy–forgetting–compute frontier across method families on classical (non-LLM) tasks with a feasible exact reference.** OpenUnlearning and MUSE standardize LLM-text unlearning, but at a scale where retrain-from-scratch (the true gold standard) is impractical to run as a reference for every configuration. By targeting small models on CIFAR-10, Adult, and a small text task, this project can include the exact retrain-from-scratch reference and shadow-model LiRA audits, and thereby place exact, approximate, and certified methods on one comparable frontier.

## 5. Problem Statement

Organizations must honor data-deletion requests, but deleting records does not remove their influence from trained models, full retraining is infeasible at scale, and — critically — there is no standard, adversarially validated way to prove that an executed unlearning method actually caused the model to forget, leaving compliance unauditable. This project investigates whether an integrated framework can execute deletion requests using exact and approximate unlearning methods, verify forgetting through adversarial audits (membership inference and canary injection), and emit a quantified deletion certificate recording forgetting, accuracy cost, and compute cost — while benchmarking the methods on a common accuracy–forgetting–compute frontier — treating execution and verification as one system rather than two separate problems.

## 6. Research Questions

**Primary Research Question:**

- Can an integrated framework execute a data-deletion request and produce quantified, adversarially validated evidence that the model actually forgot — a deletion certificate — that is trustworthy under known unlearning failure modes?

**Secondary Research Questions:**

- How do exact (SISA-style) and approximate (influence-function, gradient-ascent/certified) unlearning methods compare on the accuracy–forgetting–compute frontier across different datasets and forget-set sizes?
- How reliably do adversarial audits — LiRA-style membership inference and planted canaries — detect residual influence that surface-level forgetting metrics miss, and how much does an ensemble audit improve over a single attack?
- Does the certificate correctly withhold a "forgotten" verdict when forget data is poisoned or duplicated, i.e., under the failure modes reported for approximate unlearning and retraining?

## 7. Methodology

The project is organized into the three components defined in Section 1.4: Unlearning Engines, the Adversarial Audit Suite, and the Certificate & Benchmark Harness. These map onto the team split of three students — one per component — with the third student additionally owning end-to-end system integration and evaluation.

### 7.1 Component 1 — Unlearning Engines

This component implements a common `unlearn(model, forget_set)` interface over several methods: an **exact SISA-style** engine (sharded/sliced training with per-shard checkpoints, so a deletion retrains only affected shards), one to two **approximate** engines (influence-function scrubbing in the style of LLMEraser adapted to small classifiers, and a gradient-ascent / certified-removal method drawing on Koloskova et al. and Rewind-to-Delete), and an **exact retrain-from-scratch** reference that serves as the gold-standard target for the audits. Each engine reports the compute cost of a deletion (wall-clock, and where applicable the number of retrained shards or fine-tuning steps and the noise budget). The engines are built with PyTorch on small architectures so that the retrain-from-scratch reference remains feasible.

### 7.2 Component 2 — Adversarial Audit Suite

This component quantifies residual forget-set influence. The primary audit is a **LiRA-style shadow-model membership-inference attack**: shadow models are trained with and without each forget example to calibrate a per-sample likelihood-ratio test, and forgetting is scored by how far the unlearned model drives each forget example's membership signal toward the never-trained distribution (reported as TPR at low FPR, following RULI and A-LiRA). The complementary audit is **canary / poison injection**: identifiable canaries and, separately, poisoning examples are planted before training, and the audit measures whether their signal or effect survives unlearning (following the poisoning-based diagnostic of Pawelczyk et al.). Per the disagreement finding of Wang et al. (CCS 2025), audits are combined into an **ensemble** forgetting score rather than relying on a single attack, and, per A-LiRA, the suite also audits the *retain* set to detect collateral privacy damage.

### 7.3 Component 3 — Certificate & Benchmark Harness

This component integrates Components 1 and 2 into an end-to-end pipeline. For each deletion request it produces a **deletion certificate** recording (i) a quantified forgetting score from the ensemble audit, referenced against the retrain-from-scratch and never-trained baselines, (ii) the accuracy delta on a held-out test set relative to the original model, and (iii) the measured compute cost. A "forgotten" verdict is issued only when the forgetting score and the canary/poison checks meet preset thresholds. The harness then sweeps methods × datasets × forget-set sizes to plot the **accuracy–forgetting–compute frontier**, and — adapting the meta-evaluation idea from OpenUnlearning — validates the certificate's own faithfulness by confirming it withholds a forgotten verdict on poisoned/duplicated forget sets. The December proof-of-concept instantiates this pipeline on one model family with SISA plus one approximate method and the membership-inference audit, generating a complete certificate end-to-end.

## 8. Dataset & Sources

### CIFAR-10 Dataset

- **Source:** Canadian Institute For Advanced Research, accessible at <https://www.cs.toronto.edu/~kriz/cifar.html>
- **Structure and Attributes:** 60,000 32×32 colour images across 10 classes (50,000 train / 10,000 test).
- **Justification for Dataset Selection:** A standard image-classification benchmark small enough that retrain-from-scratch references and shadow-model MIAs are feasible, and widely used in the unlearning and membership-inference literature.

### UCI Adult (Census Income) Dataset

- **Source:** UCI Machine Learning Repository, accessible at <https://archive.ics.uci.edu/dataset/2/adult>
- **Structure and Attributes:** ~48,842 records with 14 demographic/financial attributes and a binary income label.
- **Justification for Dataset Selection:** A tabular dataset containing person-level records, making it a natural setting for per-individual deletion requests and privacy auditing, and complementary to the image modality.

### Small Text-Classification Dataset (e.g., AG News / SST-2)

- **Source:** AG News (<https://huggingface.co/datasets/ag_news>) or SST-2 via the GLUE benchmark.
- **Structure and Attributes:** Tens of thousands of short text samples with topic or sentiment labels.
- **Justification for Dataset Selection:** Extends the framework to a small text classifier so that forgetting and audits are evaluated across image, tabular, and text modalities without incurring LLM-scale cost.

### Standardized Unlearning Benchmarks (Reference)

- **Structure and Attributes:** LLM-scale unlearning benchmarks and harnesses — MUSE, OpenUnlearning, and the SemEval-2025 LUME benchmark — used in the literature this project builds on.
- **Justification for Dataset Selection:** Referenced for metric design and for positioning results against published protocols; not implementation targets, since their scale precludes a feasible retrain-from-scratch reference.

### Preprocessing Steps

- **Forget/Retain Splitting:** For each experiment, a forget set is drawn (single-sample, class-level, and random-subset variants, and duplicated/poisoned variants for the robustness tests) and the complement is designated the retain set.
- **Shadow-Set Construction:** For the LiRA audit, multiple in/out shadow splits are constructed per forget example to calibrate the likelihood-ratio test.
- **Canary/Poison Injection:** Identifiable canaries and poisoning examples are injected into the training set prior to training for the injection-based audits.
- **Checkpointing:** Per-shard and per-epoch checkpoints are stored to support the SISA engine and the checkpoint-rewind approximate method.

## 9. Evaluation Strategy & Metrics

### Performance Metrics

- **Forgetting Score:** the ensemble adversarial-audit result — LiRA TPR at low FPR on the forget set relative to retrain-from-scratch and never-trained baselines, plus canary/poison residual-effect measures — reported per method and forget-set size.
- **Utility (Accuracy Delta):** held-out test accuracy of the unlearned model relative to the original model, capturing the accuracy cost of forgetting; retain-set privacy is additionally audited to detect collateral damage.
- **Compute Cost:** wall-clock deletion time and method-specific cost (retrained shards, fine-tuning steps, noise budget), used as the compute axis of the frontier.

### Comparative Analysis

Each unlearning method is compared against two anchors: the **original model** (no forgetting) and the **retrain-from-scratch** reference (ideal forgetting). Methods are then compared to one another on the accuracy–forgetting–compute frontier, and the ensemble audit is compared against each single attack to quantify the benefit of combining audits, following the disparity finding of Wang et al. (CCS 2025).

### Experimental Setup

- **Ablations:** method family (exact vs. approximate vs. certified), forget-set size (single-sample → class-level), and forget-set composition (clean vs. duplicated vs. poisoned) are varied one at a time so effects can be attributed cleanly.
- **Certificate Faithfulness Check:** adapting OpenUnlearning's meta-evaluation, the certificate is validated by confirming it issues a "forgotten" verdict for genuine deletions and withholds it under poisoned/duplicated forget sets that are known to defeat naive metrics.
- **Reproducibility:** all runs use fixed seeds, stored checkpoints, and logged compute measurements so the frontier is reconstructable.

## 10. Expected Outcome(s)

- **An Integrated Unlearning Framework:** a common interface over exact (SISA-style) and approximate unlearning engines with an exact retrain-from-scratch reference.
- **An Adversarial Audit Suite:** a LiRA-style membership-inference audit and a canary/poison-injection audit, combined into an ensemble forgetting measure.
- **A Deletion Certificate Specification and Generator:** per-request certificates recording forgetting score, accuracy delta, and compute cost, issued only when adversarial evidence supports a "forgotten" verdict.
- **An Accuracy–Forgetting–Compute Benchmark:** a comparative frontier of unlearning methods across CIFAR-10, Adult, and a small text task, at multiple forget-set sizes.
- **A Certificate-Faithfulness Finding:** evidence on whether the certificate correctly withholds compliance under poisoning and duplication failure modes.
- **A Reusable, Reproducible Codebase:** engines, audits, and harness released together so unlearning methods can be executed and certified under one pipeline.

## 11. References

1. Basu Roy Chowdhury, S., Choromanski, K., Sehanobish, A., Dubey, A., & Chaturvedi, S. (2025). *Towards Scalable Exact Machine Unlearning Using Parameter-Efficient Fine-Tuning (S3T).* International Conference on Learning Representations (ICLR 2025).
2. Qiao, X., Zhang, M., Tang, M., & Wei, E. (2025). *Hessian-Free Online Certified Unlearning.* International Conference on Learning Representations (ICLR 2025).
3. Koloskova, A., Allouah, Y., Jha, A., Guerraoui, R., & Koyejo, S. (2025). *Certified Unlearning for Neural Networks.* International Conference on Machine Learning (ICML 2025).
4. Mu, S., & Klabjan, D. (2025). *Rewind-to-Delete: Certified Machine Unlearning for Nonconvex Functions.* Advances in Neural Information Processing Systems (NeurIPS 2025).
5. Ding, C., Wu, J., Yuan, Y., Lu, J., Zhang, K., Wang, X., Su, A., & He, X. (2025). *Unified Parameter-Efficient Unlearning for LLMs (LLMEraser).* International Conference on Learning Representations (ICLR 2025).
6. Eisenhofer, T., Riepel, D., Chandrasekaran, V., Ghosh, E., Ohrimenko, O., & Papernot, N. (2025). *Verifiable and Provably Secure Machine Unlearning.* IEEE Conference on Secure and Trustworthy Machine Learning (SaTML 2025).
7. Zhou, C., Gao, Y., Fu, A., Chen, K., Zhang, Z., Xue, M., Dai, Z., Ji, S., & Zhang, Y. (2025). *TruVRF: Toward Triple-Granularity Verification on Machine Unlearning.* IEEE Transactions on Information Forensics and Security (TIFS), Vol. 20, 2025.
8. Wang, C.-L., Li, Q., Xiang, Z., Cao, Y., & Wang, D. (2025). *Towards Lifecycle Unlearning Commitment Management: Measuring Sample-level Unlearning Completeness (IAM).* 34th USENIX Security Symposium (USENIX Security 2025).
9. Naderloui, N., Yan, S., Wang, B., Fu, J., Wang, W. H., Liu, W., & Hong, Y. (2025). *Rectifying Privacy and Efficacy Measurements in Machine Unlearning: A New Inference Attack Perspective (RULI).* 34th USENIX Security Symposium (USENIX Security 2025).
10. Gu, Y., He, J., & Chen, K. (2025). *Auditing Approximate Machine Unlearning for Differentially Private Models (A-LiRA).* IEEE International Conference on Data Mining (ICDM 2025).
11. Wang, Z., Zhang, C., Chen, Y., Baracaldo, N., Kadhe, S., & Yu, L. (2025). *Membership Inference Attacks as Privacy Tools: Reliability, Disparity and Ensemble.* ACM SIGSAC Conference on Computer and Communications Security (CCS 2025).
12. Pawelczyk, M., Di, J. Z., Lu, Y., Sekhari, A., Kamath, G., & Neel, S. (2025). *Machine Unlearning Fails to Remove Data Poisoning Attacks.* International Conference on Learning Representations (ICLR 2025).
13. Ye, D., Zhu, T., Li, J., Gao, K., Liu, B., Zhang, L. Y., Zhou, W., & Zhang, Y. (2025). *Data Duplication: A Novel Multi-Purpose Attack Paradigm in Machine Unlearning.* 34th USENIX Security Symposium (USENIX Security 2025).
14. Shi, W., Lee, J., Huang, Y., Malladi, S., Zhao, J., Holtzman, A., Liu, D., Zettlemoyer, L., Smith, N. A., & Zhang, C. (2025). *MUSE: Machine Unlearning Six-Way Evaluation for Language Models.* International Conference on Learning Representations (ICLR 2025).
15. Dorna, V., Mekala, A., Zhao, W., McCallum, A., Kolter, Z., Lipton, Z., & Maini, P. (2025). *OpenUnlearning: Accelerating LLM Unlearning via Unified Benchmarking of Methods and Metrics.* Advances in Neural Information Processing Systems (NeurIPS 2025), Datasets & Benchmarks Track.
16. Wang, Q., Han, B., Yang, P., Zhu, J., Liu, T., & Sugiyama, M. (2025). *Towards Effective Evaluations and Comparisons for LLM Unlearning Methods.* International Conference on Learning Representations (ICLR 2025).
17. Ramakrishna, A., Wan, Y., Jin, X., Chang, K.-W., Bu, Z., Vinzamuri, B., Cevher, V., Hong, M., & Gupta, R. (2025). *SemEval-2025 Task 4: Unlearning Sensitive Content from Large Language Models.* Proceedings of the 19th International Workshop on Semantic Evaluation (SemEval-2025), Association for Computational Linguistics.
18. Krizhevsky, A. (2009). *Learning Multiple Layers of Features from Tiny Images (CIFAR-10).* <https://www.cs.toronto.edu/~kriz/cifar.html>
19. Becker, B., & Kohavi, R. (1996). *Adult (Census Income) Data Set.* UCI Machine Learning Repository. <https://archive.ics.uci.edu/dataset/2/adult>
