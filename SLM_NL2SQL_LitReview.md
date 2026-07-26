<div align="center">

# Literature Review

## Specialized Small Language Models for NL-to-SQL: Task Specialization and Intelligent SLM–LLM Orchestration

*Peer-reviewed literature, 2025–2026 · Compiled July 2026*

</div>

---

## 1. Scope and Method

This review surveys research published in 2025 or later that bears directly on the two components of the proposed thesis: (i) specializing small language models (SLMs) for natural-language-to-SQL translation, and (ii) orchestrating SLM–LLM systems through query-aware routing. Coverage was restricted to peer-reviewed venues — ACL, NAACL, AACL-IJCNLP, COLM, ICLR, ICML, NeurIPS, KDD, VLDB, and the IEEE TKDE and Frontiers of Computer Science journals — with venue acceptance verified against the ACL Anthology, OpenReview, official proceedings pages, or publisher DOIs. Three influential works that have not passed peer review (Arctic-Text2SQL-R1 [9], the NVIDIA position paper on SLM-first agents [31], and the workshop-tier CARROT router [25]) are included because of their direct relevance, and are explicitly flagged as such wherever cited. The review is organized thematically; Section 9 synthesizes the findings against the proposal's gap analysis, and Section 10 provides a one-line summary of every work.

## 2. Specializing Small Models for NL-to-SQL

The strongest recent evidence that sub-2B models can be pushed to competitive text-to-SQL accuracy comes from **SLM-SQL [1]**. Sheng and Xu post-train five models in the 0.5B–1.5B range using supervised fine-tuning followed by GRPO-style reinforcement learning on two datasets derived from the SynSQL-2.5M corpus, then apply corrective self-consistency at inference. The recipe adds an average of 31.4 execution-accuracy (EX) points: their 1.5B model reaches 67.08% EX on the BIRD development set and 70.49% on the test set, and even the 0.5B model reaches 61.82% on test — numbers that approach what 7B-class systems reported a year earlier. This is the closest published work to the thesis's specialization component and the natural headline baseline for its 1–4B ablation.

**Feather-SQL [2]**, now peer-reviewed at Findings of AACL-IJCNLP 2025, attacks the same regime without any fine-tuning. Its pipeline of schema pruning, schema linking, multi-path and multi-candidate generation, and a "1+1" dual-model collaboration — pairing a general chat SLM with a SQL-specialized one — lifts un-fine-tuned sub-7B models by roughly ten EX points on BIRD, reaching a ceiling of 54.76%. Read together, [1] and [2] bracket the design space the thesis occupies: [2] shows what inference-time scaffolding alone buys a small model, and [1] shows how far parameter-efficient post-training extends that ceiling.

**MSc-SQL [3]** fine-tunes small open models to sample several candidate queries and then trains a separate critiquing model that judges candidates jointly, using execution results and schema metadata, achieving state-of-the-art results among small open-source systems on BIRD and Spider at a fraction of GPT-4-pipeline cost. **CSC-SQL [4]**, from the SLM-SQL authors, contributes a cheap test-time-compute recipe — parallel sampling, majority voting over the two most frequent outputs, and a GRPO-trained merge-revision model — whose 3B variant reaches 65.28% EX on BIRD dev. Finally, Oracle's **Distill-C [5]** provides an industrial template for the thesis's core premise: an ensemble of large teacher LLMs synthesizes domain-tailored NL2SQL data, multi-stage filtering cleans it, and small students fine-tuned on the result gain 36% average execution accuracy, rivaling teachers an order of magnitude larger.

## 3. Reasoning- and RL-Trained Text-to-SQL Models

A second line of 2025 work trains open models with execution feedback rather than plain supervised loss. **SQL-R1 [6]**, now published at NeurIPS 2025, trains Qwen2.5-Coder backbones with a composite reward (format, executability, result correctness, length) and reports 88.6% EX on Spider and 67.1% on BIRD with a 7B backbone, while analyzing how much cold-start SFT and synthetic data the recipe actually needs. **Reasoning-SQL [7]** refines the reward side: GRPO with SQL-tailored partial rewards — including an explicit schema-linking reward — combats reward sparsity, and its RL-trained 14B model outperforms o3-mini by about 4% on BIRD with better generalization than SFT. Notably for this thesis, [7] demonstrates that SQL-structural signals are informative enough to shape training rewards, the same intuition the thesis applies to routing instead.

Snowflake's **ExCoT [8]** shows the same gains are reachable without full RL: iterative direct preference optimization over chain-of-thought reasoning paths, with preference pairs labeled purely by execution-result match, lifts LLaMA-3 70B from 57.4% to 68.5% EX on BIRD and yields similar gains on 7B/32B Qwen2.5-Coder models. Because DPO is LoRA-compatible and needs no reward model, [8] is arguably the most practical route for the thesis to add reasoning-style training on constrained hardware. **Arctic-Text2SQL-R1 [9]** — *flagged: arXiv preprint, not peer-reviewed* — pushes in the opposite direction of reward simplicity, using execution-correctness-only rewards to reach state-of-the-art results across six benchmarks, with its 7B model outperforming prior 70B-class systems; it is included here because it topped the BIRD leaderboard and defines the simplest strong RL baseline.

## 4. Data Synthesis, Multi-Candidate Generation, and Test-Time Compute

**OmniSQL [10]** (VLDB 2025) addresses the data bottleneck that constrains every small-model effort: its framework synthesizes SynSQL-2.5M — 2.5 million database/question/SQL/chain-of-thought quadruples over 16,000+ synthetic databases — and its 7B–32B models match or surpass GPT-4o across nine benchmarks. SynSQL-2.5M has since become the de facto training substrate for small-model work, including [1] and [4], and its stratified subsets are the obvious material for the thesis's data-volume ablation. **ROUTE [11]** (ICLR 2025; unrelated to routing despite the name) shows that multi-task supervised fine-tuning — SQL generation plus schema linking, noise correction, and continuation writing — with collaborative prompting at inference measurably improves eight open models on five benchmarks, evidence that schema linking as an auxiliary task benefits exactly the model class the thesis targets.

At the system level, Alibaba's **XiYan-SQL [12]** (accepted at IEEE TKDE, 2026) combines its M-Schema representation, several differently fine-tuned generators, and a learned selection model to reach 75.63% EX on BIRD test and 89.65% on Spider test; its openly released 3B fine-tuned generator is directly usable as a thesis baseline. Google's **CHASE-SQL [13]** (ICLR 2025) is the reference design for the escalation target side of the thesis — diverse candidate generation via divide-and-conquer and execution-plan chains with a preference-optimized pairwise selector, reaching 73.0% EX on BIRD with Gemini-1.5-pro generators. **Alpha-SQL [14]** (ICML 2025) offers a training-free contrast: Monte Carlo tree search over partial SQL construction states lifts a 32B open model to 69.7% EX on BIRD dev, suggesting test-time search as an intermediate step for hard queries before any cloud escalation.

## 5. Routing, Cascades, and SLM–LLM Orchestration

The most consequential finding of this review is **EllieSQL [15]** (COLM 2025), which partially anticipates the thesis's orchestration component. EllieSQL trains a lightweight complexity classifier — including a Qwen2.5-0.5B router fine-tuned with DPO — to estimate text-to-SQL difficulty and route each query to one of several generation pipelines of increasing cost, and introduces the Token Elasticity of Performance metric. With the 0.5B DPO router it cuts token expenditure by more than 40% on BIRD at no loss of execution accuracy. The proposal's claim that "no existing routing system is SQL-specific" is therefore no longer accurate and must be revised (Section 9); EllieSQL becomes the mandatory baseline. The thesis remains differentiated on three axes: EllieSQL routes among cloud-LLM pipelines rather than orchestrating a locally fine-tuned SLM generator; its difficulty signal is a learned classifier rather than explicit structural features (JOIN depth, subquery nesting, schema-linking overlap); and it does not use the generator's own token-level confidence for post-generation escalation.

The general-purpose routing literature has meanwhile matured into two granularities. At the **query level**, **RouteLLM [16]** (ICLR 2025) trains strong-vs-weak routers on Chatbot Arena preference data and reports up to 85% cost reduction on MT-Bench while retaining roughly 95% of GPT-4 quality; **MixLLM [17]** (NAACL 2025) adds contextual-bandit dynamics with per-LLM quality and cost predictors, achieving 97.25% of GPT-4 quality at 24.18% of its cost; **IRT-Router [18]** (ACL 2025) models routing psychometrically, matching latent model ability to latent query difficulty in an interpretable way that is conceptually the closest peer-reviewed framework to the thesis's SQL complexity score; **GraphRouter [19]** (ICLR 2025) shows that adding task-node context to a query–LLM graph improves routing by at least 12.3% over prior routers — indirect evidence that task-specific signals beat generic ones; **EmbedLLM [20]** (ICLR 2025 Spotlight) learns compact model embeddings that amortize router training across many models; and Google's **UniRoute [21]** (ICLR 2026) supplies the theoretical treatment — optimal routing rules, cluster-based approximations, and excess-risk bounds — while handling LLMs unseen at training time.

At the **token level**, **Faster Cascades [22]** (ICLR 2025 Oral, Outstanding Paper Honorable Mention) unifies cascades with speculative decoding and derives the theoretically optimal token-level deferral rule, giving formal grounding to confidence-based escalation; **CITER [23]** (COLM 2025) trains a token-level router with RL so an SLM generates non-critical tokens while an LLM handles critical ones; and She et al.'s edge-device demonstration **[24]** (ACL 2025 Demos) shows the deployed version of exactly the thesis's architecture — a 0.5B model decoding on a consumer laptop with under 7% of token generations escalated to a cloud LLM, for a 60% quality gain over the SLM alone. **CARROT [25]** — *flagged: workshop paper* — proves that a router which predicts both per-query cost and per-query accuracy is minimax rate-optimal, which is precisely the functional form of the SQL-aware router the thesis proposes. Across all of these, only [15] uses task-specific signals; every other confirmed router relies on embeddings, preference data, or learned latent difficulty — the space into which the thesis's explicit SQL-structural features fit.

## 6. Parameter-Efficient Fine-Tuning

Three 2025 works update the PEFT foundations the thesis builds on. **LoRA-Pro [26]** (ICLR 2025 Spotlight) proves that LoRA optimization is equivalent to full fine-tuning under a low-rank gradient and derives closed-form adjustments to the adapter gradients that substantially narrow the LoRA-versus-full-fine-tuning gap — a principled, drop-in upgrade for the thesis's training pipeline. Shuttleworth et al. **[27]** (NeurIPS 2025) show the two methods are nonetheless structurally different: LoRA introduces "intruder dimensions" — high-ranking singular vectors absent from fully fine-tuned models — that drive forgetting of the pre-training distribution and worsen under sequential fine-tuning. This matters directly for the thesis: a SQL-specialized SLM that has forgotten general language ability may misjudge out-of-scope or ambiguous questions, exactly the cases its router must catch. Mao et al.'s survey **[28]** (Frontiers of Computer Science, 2025) taxonomizes the LoRA family, including quantized QLoRA-style variants, and is the natural anchor citation for the proposal's methodology chapter.

## 7. Small Language Models: Capabilities and Positioning

Wang et al.'s survey **[29]** (KDD 2025; note this appears in the lecture-style tutorial/survey track rather than the research track) catalogs SLM architectures, enhancement techniques, and — most usefully here — a taxonomy of SLM–LLM collaboration modes (routing, cascading, speculative decoding) that frames both thesis components. **SmolLM2 [30]** (COLM 2025) is the only major small-model technical report with confirmed peer review: Hugging Face documents the data-centric, multi-stage training of a 1.7B model over ~11 trillion tokens that outperforms Qwen2.5-1.5B and Llama-3.2-1B, establishing both the capability ceiling of the thesis's model class and one of its candidate base models. NVIDIA's position paper **[31]** — *flagged: arXiv preprint, not peer-reviewed* — argues that SLMs are sufficiently capable, operationally better suited, and 10–30× cheaper for the narrow sub-tasks in agentic systems, estimating that 40–70% of LLM invocations in popular open-source agents could be served by specialized SLMs; it is the canonical statement of the thesis's motivating premise and should be cited as such, with its non-reviewed status noted.

## 8. Benchmarks, Evaluation, and Surveys

The evaluation landscape shifted materially in 2025. **Spider 2.0 [32]** (ICLR 2025 Oral) shows that while agents solve 91.2% of Spider 1.0, they solve only 21.3% of realistic enterprise workflow tasks over thousand-column schemas — simultaneously confirming that Spider 1.0 is near-saturated for large models and defining the "hard query" regime that justifies escalation to a cloud LLM. The BIRD team's **BIRD-CRITIC / SWE-SQL [33]** (NeurIPS 2025) moves evaluation from generation to repair of real user SQL issues, where even o3-mini achieves only 38.9%, and **BIRD-Interact [34]** (ICLR 2026 Oral) evaluates text-to-SQL as multi-turn interaction with a user simulator, where the best LLMs succeed on only ~16.3% of tasks — evidence that ambiguity detection and error recovery, precisely what a routing layer must sense, are the field's current bottleneck.

**FLEX [35]** (NAACL 2025) has direct methodological consequences for the thesis: it shows standard execution accuracy produces systematic false positives and negatives, and that an LLM-as-judge protocol raises agreement with human experts from κ = 62 to κ = 87, shifting average scores by 2.6 points and reordering Spider/BIRD leaderboards. The thesis's evaluation section should either supplement EX with a FLEX-style check or explicitly acknowledge EX's error band. Finally, two TKDE surveys — Hong et al. **[36]** on LLM-based text-to-SQL methods, benchmarks, and metrics, and Liu et al. **[37]** with a lifecycle view and an explicit decision roadmap for choosing among prompting, fine-tuning, and hybrid strategies under resource constraints — provide the related-work scaffolding; [37] in particular discusses the cost/latency trade-offs between small fine-tuned models and large prompted ones that motivate this project.

## 9. Synthesis: Implications for the Proposal's Gap Analysis

**Gap 1 ("no SQL-specific router exists") must be revised.** EllieSQL [15] is a peer-reviewed, SQL-complexity-aware router. The defensible restatement is narrower and still substantive: no existing system combines a locally fine-tuned 1–4B SLM generator with explicit SQL-structural routing features (JOIN depth, subquery nesting, schema-linking overlap) and post-generation token-confidence escalation to a cloud LLM. EllieSQL routes among cloud pipelines with a learned difficulty classifier and never fine-tunes the answering model; the thesis integrates specialization and routing around one local generator. EllieSQL becomes the primary baseline, alongside generic-signal routers [16, 17] as the proposal already planned.

**Gap 2 (the 1–4B class is under-explored) narrows but survives.** SLM-SQL [1] now characterizes 0.5B–1.5B models trained with SFT+RL on 900K+ synthetic examples, and XiYan-SQL releases a strong 3B generator [12]. What remains uncharted is precisely the thesis's setting: LoRA/QLoRA-only specialization of modern 1–4B models (Phi-3.5-mini, Gemma 3, SmolLM2 [30]) under modest data budgets, with a systematic size–accuracy curve.

**Gap 3 (no integrated fine-tune-plus-route system) stands.** Every specialization paper [1–5] stops at the model; every router [15–25] treats the answering models as fixed endpoints. The integrated system remains unclaimed territory.

**Gap 4 (data efficiency) stands and has sharpened.** SQL-R1 [6] and OmniSQL [10] operate at million-example scale, while ExCoT [8] hints that preference optimization may be far cheaper; nobody has published how few examples suffice for competitive LoRA-based NL-to-SQL at 1–4B, which the thesis's data-volume ablation answers directly.

Two further adjustments follow from the 2025 literature. First, evaluation: WikiSQL is effectively legacy and Spider 1.0 is near-saturated for large models [32], so BIRD should be promoted from a reference benchmark to a primary one, and execution accuracy should be reported with the caveats established by FLEX [35]. Second, training method: given ExCoT [8] and the GRPO recipes of [1, 4, 7], the thesis could add a lightweight execution-feedback DPO stage after LoRA SFT at modest cost, without crossing into the full-RL territory it explicitly scopes out.

## 10. Summary of Reviewed Literature

| Ref | Work | Venue (Year) | Approach | Key result / relevance |
|---|---|---|---|---|
| [1] | SLM-SQL (Sheng & Xu) | AACL-IJCNLP 2025 Findings | SFT + RL post-training of 0.5B–1.5B models on SynSQL-derived data | +31.4 EX avg.; 1.5B reaches 70.49% EX on BIRD test — closest evidence for sub-2B specialization |
| [2] | Feather-SQL (Pei et al.) | AACL-IJCNLP 2025 Findings | Schema pruning/linking, multi-path candidates, dual-model "1+1" collaboration; no fine-tuning | ~10-pt EX gain for sub-7B SLMs; 54.76% EX on BIRD |
| [3] | MSc-SQL (Gorti et al.) | NAACL 2025 | Fine-tuned small open models + trained multi-sample critic using execution results | SOTA among small open models on BIRD/Spider at low cost |
| [4] | CSC-SQL (Sheng & Xu) | AACL-IJCNLP 2025 Findings | Corrective self-consistency: sample, vote, merge-revise; GRPO-trained | 3B variant 65.28% EX BIRD dev; 7B 71.72% test |
| [5] | Distill-C (Hoang et al., Oracle) | NAACL 2025 Industry | Teacher-ensemble data synthesis + filtering; fine-tune small students | +36% avg. EX over base models; students rival 10× larger teachers |
| [6] | SQL-R1 (Ma et al.) | NeurIPS 2025 | RL (composite execution-based reward) on Qwen2.5-Coder 7B/14B | 88.6% EX Spider, 67.1% BIRD with 7B backbone |
| [7] | Reasoning-SQL (Pourreza et al.) | COLM 2025 | GRPO with SQL-specific partial rewards incl. schema linking | RL-trained 14B beats o3-mini by ~4% on BIRD |
| [8] | ExCoT (Zhai et al., Snowflake) | ACL 2025 Findings | Iterative DPO over CoT paths labeled purely by execution match | BIRD 57.4→68.5 (LLaMA-3 70B); LoRA-friendly alternative to RL |
| [9] | Arctic-Text2SQL-R1 (Yao et al.) | arXiv 2025 — preprint | GRPO with minimal execution-only reward | 7B outperforms prior 70B-class systems; **flag: not peer-reviewed** |
| [10] | OmniSQL (Li et al.) | VLDB 2025 | SynSQL-2.5M synthetic corpus (2.5M CoT-annotated samples); 7B–32B models | Matches/surpasses GPT-4o across nine benchmarks; standard SLM training substrate |
| [11] | ROUTE (Qin et al., Alibaba) | ICLR 2025 | Multi-task SFT (SQL + schema linking + noise correction) with collaboration prompting | Schema linking as auxiliary task lifts small open models |
| [12] | XiYan-SQL (Liu et al., Alibaba) | IEEE TKDE 2026 | Multi-generator ensemble, M-Schema, fine-tuned selector; open 3B/7B generators | 75.63% EX BIRD test, 89.65% Spider test |
| [13] | CHASE-SQL (Pourreza et al., Google) | ICLR 2025 | Diverse CoT candidate generation + pairwise fine-tuned selector (large models) | 73.0% EX BIRD test; reference design for cloud-LLM escalation target |
| [14] | Alpha-SQL (Li et al.) | ICML 2025 | Training-free MCTS over partial SQL states | 69.7% EX BIRD dev (32B); test-time-search alternative to fine-tuning |
| [15] | EllieSQL (Li et al.) | COLM 2025 | SQL complexity-aware routing across pipelines; 0.5B DPO-trained router | >40% token cost cut on BIRD at accuracy parity — mandatory baseline for this thesis |
| [16] | RouteLLM (Ong et al., Berkeley) | ICLR 2025 | Preference-data-trained strong/weak router (generic signals) | Up to 85% cost cut retaining ~95% of GPT-4 quality |
| [17] | MixLLM (Wang et al.) | NAACL 2025 | Contextual-bandit routing with per-LLM quality/cost predictors | 97.25% of GPT-4 quality at 24.18% of cost |
| [18] | IRT-Router (Song et al.) | ACL 2025 | Item-response-theory latent ability/difficulty routing | Interpretable difficulty modeling; strong cold-start |
| [19] | GraphRouter (Feng et al.) | ICLR 2025 | Heterogeneous task–query–LLM graph; GNN edge prediction | ≥12.3% over prior routers; task context helps routing |
| [20] | EmbedLLM (Zhuang et al.) | ICLR 2025 Spotlight | Compact learned model embeddings for routing/performance forecasting | Amortizes router training across many models |
| [21] | UniRoute (Jitkrittum et al., Google) | ICLR 2026 | Routing to unseen LLMs via prompt-performance feature vectors; excess-risk bounds | Theory of optimal routing rules; 30+ unseen LLMs |
| [22] | Faster Cascades (Narasimhan et al., Google) | ICLR 2025 Oral | Unifies cascades with speculative decoding; optimal token-level deferral | Pareto-dominates plain cascades and speculative decoding |
| [23] | CITER (Zheng et al.) | COLM 2025 | RL-trained token-level SLM↔LLM routing | Cost cut at preserved quality across five benchmarks |
| [24] | Token-level routing on edge (She et al.) | ACL 2025 Demo | 0.5B on-device SLM + selective cloud token generation | +60% on CommonsenseQA with <7% tokens escalated |
| [25] | CARROT (Somerstep et al.) | ICLR 2025 Workshop | Minimax-optimal predict-cost-and-accuracy router; SPROUT dataset | Theoretical form of the router this thesis builds; **flag: workshop tier** |
| [26] | LoRA-Pro (Wang et al.) | ICLR 2025 Spotlight | Closed-form gradient adjustment aligning LoRA with full-FT gradients | Narrows LoRA vs full fine-tuning gap |
| [27] | LoRA: Illusion of Equivalence (Shuttleworth et al., MIT) | NeurIPS 2025 | Spectral analysis: LoRA introduces "intruder dimensions" | Explains LoRA forgetting; relevant to keeping routing-relevant general ability |
| [28] | LoRA survey (Mao et al.) | Front. Comput. Sci. 2025 | Taxonomy of LoRA variants incl. quantized (QLoRA-style) | Anchor citation for PEFT background |
| [29] | SLM survey (Wang et al., Penn State) | KDD 2025 (tutorial track) | SLM capabilities, SLM–LLM collaboration taxonomy | Frames both thesis components |
| [30] | SmolLM2 (Ben Allal et al., HF) | COLM 2025 | Data-centric training of a 1.7B SLM (~11T tokens) | SOTA in class; candidate base model for this thesis |
| [31] | SLMs are the Future of Agentic AI (Belcak et al., NVIDIA) | arXiv 2025 — position paper | Argues SLM-first, LLM-fallback architectures | Canonical motivation; **flag: not peer-reviewed** |
| [32] | Spider 2.0 (Lei et al.) | ICLR 2025 Oral | 632 enterprise text-to-SQL workflow tasks | Best agent: 21.3% vs 91.2% on Spider 1.0 — defines the "hard query" regime |
| [33] | BIRD-CRITIC / SWE-SQL (Li et al.) | NeurIPS 2025 | SQL issue-debugging benchmark + Six-Gym training environment | o3-mini only 38.9% — SQL repair remains open |
| [34] | BIRD-Interact (Huo et al.) | ICLR 2026 Oral | Interactive/agentic text-to-SQL evaluation with user simulator | Best LLMs ~16.3% — ambiguity detection motivates escalation |
| [35] | FLEX (Kim et al.) | NAACL 2025 | LLM-as-judge SQL correctness metric; re-evaluates 50 systems | Human agreement κ 62→87; EX has systematic false (non)matches |
| [36] | Text-to-SQL survey (Hong et al.) | IEEE TKDE 2025 | Survey: prompting vs fine-tuning, benchmarks, metrics | Related-work anchor |
| [37] | NL2SQL survey (Liu et al.) | IEEE TKDE 2025 | Lifecycle survey; roadmap for prompt vs fine-tune vs hybrid | Maps design choices for SLM + routing |

> **Note:** EX = execution accuracy. Rows [9], [25], and [31] are not peer-reviewed publications and are flagged accordingly.

## 11. References

[1] Sheng, L., & Xu, S.-S. (2025). *SLM-SQL: An Exploration of Small Language Models for Text-to-SQL.* In Findings of the Association for Computational Linguistics: AACL-IJCNLP 2025. <https://aclanthology.org/2025.findings-ijcnlp.92/>

[2] Pei, W., et al. (2025). *Feather-SQL: A Lightweight NL2SQL Framework with Dual-Model Collaboration Paradigm for Small Language Models.* In Findings of AACL-IJCNLP 2025. <https://aclanthology.org/2025.findings-ijcnlp.130/>

[3] Gorti, S. K., et al. (2025). *MSc-SQL: Multi-Sample Critiquing Small Language Models for Text-to-SQL Translation.* In Proceedings of NAACL 2025 (Long Papers), 2145–2160. <https://aclanthology.org/2025.naacl-long.107/>

[4] Sheng, L., & Xu, S.-S. (2025). *CSC-SQL: Corrective Self-Consistency in Text-to-SQL via Reinforcement Learning.* In Findings of AACL-IJCNLP 2025. <https://aclanthology.org/2025.findings-ijcnlp.91/>

[5] Hoang, C. D. V., Tangari, G., et al. (2025). *Distill-C: Enhanced NL2SQL via Distilled Customization with LLMs.* In Proceedings of NAACL 2025, Industry Track. <https://aclanthology.org/2025.naacl-industry.64/>

[6] Ma, P., et al. (2025). *SQL-R1: Training Natural Language to SQL Reasoning Model by Reinforcement Learning.* In Advances in Neural Information Processing Systems (NeurIPS 2025). <https://openreview.net/forum?id=hgJQcuDwm1>

[7] Pourreza, M., Talaei, S., Sun, R., et al. (2025). *Reasoning-SQL: Reinforcement Learning with SQL Tailored Partial Rewards for Reasoning-Enhanced Text-to-SQL.* In Conference on Language Modeling (COLM 2025). <https://openreview.net/forum?id=HbwkIDWQgN>

[8] Zhai, B., Xu, C., He, Y., & Yao, Z. (2025). *Optimizing Reasoning for Text-to-SQL with Execution Feedback (ExCoT).* In Findings of ACL 2025, 19206–19218. <https://aclanthology.org/2025.findings-acl.982/>

[9] Yao, Z., Sun, G., Borchmann, L., et al. (2025). *Arctic-Text2SQL-R1: Simple Rewards, Strong Reasoning in Text-to-SQL.* arXiv:2505.20315. *[Preprint — not peer-reviewed]*

[10] Li, H., et al. (2025). *OmniSQL: Synthesizing High-Quality Text-to-SQL Data at Scale.* Proceedings of the VLDB Endowment, 18, 4695 ff. <https://doi.org/10.14778/3749646.3749723>

[11] Qin, Y., et al. (2025). *ROUTE: Robust Multitask Tuning and Collaboration for Text-to-SQL.* In International Conference on Learning Representations (ICLR 2025). <https://openreview.net/forum?id=BAglD6NGy0>

[12] Liu, Y., et al. (2026). *XiYan-SQL: A Novel Multi-Generator Framework for Text-to-SQL.* IEEE Transactions on Knowledge and Data Engineering. <https://doi.org/10.1109/TKDE.2026.3657851>

[13] Pourreza, M., Li, H., Sun, R., et al. (2025). *CHASE-SQL: Multi-Path Reasoning and Preference Optimized Candidate Selection in Text-to-SQL.* In ICLR 2025. <https://openreview.net/forum?id=CvGqMD5OtX>

[14] Li, B., Zhang, J., Fan, J., Luo, Y., et al. (2025). *Alpha-SQL: Zero-Shot Text-to-SQL using Monte Carlo Tree Search.* In Proceedings of ICML 2025, PMLR 267. <https://proceedings.mlr.press/v267/li25dt.html>

[15] Li, B., et al. (2025). *EllieSQL: Cost-Efficient Text-to-SQL with Complexity-Aware Routing.* In Conference on Language Modeling (COLM 2025). <https://arxiv.org/abs/2503.22402>

[16] Ong, I., et al. (2025). *RouteLLM: Learning to Route LLMs with Preference Data.* In ICLR 2025. <https://openreview.net/forum?id=8sSqNntaMr>

[17] Wang, X., et al. (2025). *MixLLM: Dynamic Routing in Mixed Large Language Models.* In Proceedings of NAACL 2025 (Long Papers). <https://aclanthology.org/2025.naacl-long.545/>

[18] Song, W., et al. (2025). *IRT-Router: Effective and Interpretable Multi-LLM Routing via Item Response Theory.* In Proceedings of ACL 2025 (Long Papers), 15629–15644. <https://aclanthology.org/2025.acl-long.761/>

[19] Feng, T., Shen, Y., & You, J. (2025). *GraphRouter: A Graph-based Router for LLM Selections.* In ICLR 2025. <https://openreview.net/forum?id=eU39PDsZtT>

[20] Zhuang, R., et al. (2025). *EmbedLLM: Learning Compact Representations of Large Language Models.* In ICLR 2025 (Spotlight). <https://openreview.net/forum?id=Fs9EabmQrJ>

[21] Jitkrittum, W., et al. (2026). *Universal Model Routing for Efficient LLM Inference.* In ICLR 2026. <https://openreview.net/forum?id=ka82fvJ5f1>

[22] Narasimhan, H., Jitkrittum, W., et al. (2025). *Faster Cascades via Speculative Decoding.* In ICLR 2025 (Oral; Outstanding Paper Honorable Mention). <https://openreview.net/forum?id=vo9t20wsmd>

[23] Zheng, W., et al. (2025). *CITER: Collaborative Inference for Efficient LLM Decoding with Token-Level Routing.* In Conference on Language Modeling (COLM 2025). <https://arxiv.org/abs/2502.01976>

[24] She, J., et al. (2025). *Token Level Routing Inference System for Edge Devices.* In Proceedings of ACL 2025, System Demonstrations, 159–166. <https://aclanthology.org/2025.acl-demo.16/>

[25] Somerstep, S., Maia Polo, F., et al. (2025). *CARROT: A Cost Aware Rate Optimal Router.* ICLR 2025 Workshop on Foundation Models in the Wild. <https://arxiv.org/abs/2502.03261> *[Workshop paper — lighter review tier]*

[26] Wang, Z., Liang, J., He, R., & Tan, T. (2025). *LoRA-Pro: Are Low-Rank Adapters Properly Optimized?* In ICLR 2025 (Spotlight). <https://arxiv.org/abs/2407.18242>

[27] Shuttleworth, R., Andreas, J., Torralba, A., & Sharma, P. (2025). *LoRA vs Full Fine-tuning: An Illusion of Equivalence.* In NeurIPS 2025. <https://arxiv.org/abs/2410.21228>

[28] Mao, Y., et al. (2025). *A Survey on LoRA of Large Language Models.* Frontiers of Computer Science, 19(7). <https://doi.org/10.1007/s11704-024-40663-9>

[29] Wang, F., et al. (2025). *A Survey on Small Language Models in the Era of Large Language Models: Architecture, Capabilities, and Trustworthiness.* In Proceedings of KDD 2025 (tutorial/survey track). <https://doi.org/10.1145/3711896.3736563>

[30] Ben Allal, L., et al. (2025). *SmolLM2: When Smol Goes Big — Data-Centric Training of a Small Language Model.* In Conference on Language Modeling (COLM 2025). <https://openreview.net/pdf?id=3JiCl2A14H>

[31] Belcak, P., et al. (2025). *Small Language Models are the Future of Agentic AI.* arXiv:2506.02153. *[Preprint position paper — not peer-reviewed]*

[32] Lei, F., et al. (2025). *Spider 2.0: Evaluating Language Models on Real-World Enterprise Text-to-SQL Workflows.* In ICLR 2025 (Oral). <https://arxiv.org/abs/2411.07763>

[33] Li, J., et al. (2025). *SWE-SQL: Illuminating LLM Pathways to Solve User SQL Issues in Real-World Applications (BIRD-CRITIC).* In NeurIPS 2025. <https://arxiv.org/abs/2506.18951>

[34] Huo, N., Xu, X., Li, J., et al. (2026). *BIRD-Interact: Re-imagining Text-to-SQL Evaluation via the Lens of Dynamic Interactions.* In ICLR 2026 (Oral). <https://openreview.net/forum?id=nHrYBGujps>

[35] Kim, H., et al. (2025). *FLEX: Expert-Level False-Less EXecution Metric for Text-to-SQL Benchmark.* In Proceedings of NAACL 2025 (Long Papers). <https://aclanthology.org/2025.naacl-long.228/>

[36] Hong, Z., et al. (2025). *Next-Generation Database Interfaces: A Survey of LLM-Based Text-to-SQL.* IEEE Transactions on Knowledge and Data Engineering. <https://arxiv.org/abs/2406.08426>

[37] Liu, X., et al. (2025). *A Survey of Text-to-SQL in the Era of LLMs: Where Are We, and Where Are We Going?* IEEE Transactions on Knowledge and Data Engineering, 37(10), 5735–5754. <https://arxiv.org/abs/2408.05109>
