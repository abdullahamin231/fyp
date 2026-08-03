## Idea: Digital Khata + AI-Driven Alternative Credit Scoring for Small Shopkeepers

### 1. Tentative Title
**Khatabaz** *(working title)* — AI-Driven Alternative Credit Scoring from Informal Ledger Data

### 2. Problem Statement
Small shopkeepers across Pakistan (kiryana/general stores) run the majority of their business on informal credit — customers buy now and pay later, tracked in a paper *khata* (ledger). These same shopkeepers, despite running real, ongoing businesses with predictable cash flow, are almost entirely excluded from formal credit. They have no payslips, no bank statements, and no credit bureau history, so banks and formal lenders won't lend to them. To restock inventory or expand, they're forced into predatory informal lending or simply can't grow. Meanwhile, the ledger data that could prove their business is stable and creditworthy exists — it just sits unused on paper or in a basic digital notebook.

### 3. Target Users / Stakeholders
- **Primary:** small retail shopkeepers across Pakistan's cities and towns — one of the most common small-business categories in the country, not a niche group.
- **Secondary:** microfinance banks and fintech lenders looking for a reliable way to assess credit risk in a population with no formal credit history.
- **Secondary:** the shopkeepers' regular customers, indirectly, through the digitized khata itself (payment reminders, transparent balances).

### 4. Existing Related Systems / Products
| System | What it does well | Limitation / gap | Our contribution |
|---|---|---|---|
| Digital ledger apps (KhataBook-style apps, local Pakistani equivalents) | Digitize the paper ledger; send payment reminders to customers | Data just sits as a digital notebook — it is never converted into a usable credit signal | Turns the same ledger data into a structured, defensible creditworthiness score |
| Traditional bank lending / credit bureaus | Rigorous, well-established credit assessment | Requires formal financial history (payslips, bank statements) that shopkeepers structurally don't have | Builds a credit signal from data shopkeepers actually generate — transaction and supplier patterns |
| Informal lending (local moneylenders) | Fills the gap banks won't touch | High interest rates, no transparency, no path to formal credit history | Gives shopkeepers a route into formal, lower-cost credit instead |
| Early SME fintech lending pilots | Starting to explore alternative data for lending | Largely ad hoc, not built around a structured, auditable scoring methodology | A dedicated, purpose-built scoring engine rather than a bolted-on feature |

### 5. Why Existing Systems Are Not Enough
Digital ledger apps solve the record-keeping problem but stop there — they were built to replace the paper notebook, not to prove creditworthiness. Formal banks and credit bureaus require exactly the kind of documentation this population structurally cannot produce, so they are excluded by design, not by choice. Informal lenders fill the gap but at predatory cost and with no way for a shopkeeper to build a track record that improves their terms over time. No existing system converts everyday transaction behavior into a defensible, structured credit signal for this specific population.

### 6. Identified Gap
There is no system that takes the transaction and ledger data shopkeepers already generate and turns it into an alternative, auditable credit score usable by real lenders — where no formal credit bureau history exists to draw on instead.

### 7. Proposed Contribution
*Our contribution is an AI-driven alternative credit-scoring system that converts informal ledger and transaction-pattern data — cash-flow stability, supplier payment cycles, business category, customer repayment patterns — into a structured creditworthiness signal usable for microloan qualification, for a population with no formal credit history.*

### 8. Why the Idea Is Novel
- Not novelty-by-AI-buzzword: the contribution is a **scoring methodology and data model** for an underserved population, not a chatbot or thin LLM wrapper.
- Not a copy of existing digital khata apps: those stop at digitization; this project's core work begins where they stop — turning the ledger into a credit signal.
- Confirmed against the department's full prior-FYP list: "khata," "credit score," "microfinance," "unbanked," "informal economy," and "street vendor" all return zero hits — no prior overlap.
- Supports genuine technical depth: a fine-tuned scoring model (since no labeled formal credit-bureau data exists for this population, the model has to be built from proxy signals), a multi-agent reasoning system (separate agents assessing cash-flow stability, default risk, and informal debt-network patterns), and a knowledge graph modeling buyer–supplier–debtor relationships.

### 9. Why the Idea Has Sufficient Scope for 3 Students
The work splits into three real subsystems:
1. **Ledger/data-capture layer** — the digital khata interface itself, capturing transaction history, customer credit records, and supplier payment patterns as structured data.
2. **Credit-scoring model & knowledge graph** — the core technical contribution: a fine-tuned scoring model built on proxy signals, plus a knowledge graph of buyer-supplier-debtor relationships to surface risk patterns invisible in raw transaction logs.
3. **Multi-agent risk reasoning & lender-facing product** — agents that separately assess cash-flow stability, default risk, and network-level risk, combined into a final score surfaced through a lender-facing interface for actual loan-qualification decisions.

### 10. What Could Realistically Be Ready by December
A working proof of concept for **one shop category, in one city**, covering: a functioning digital ledger capturing real or pilot transaction data, a first-pass credit-scoring model producing a defensible score from that data, and a basic lender-facing view showing the score with its supporting evidence. Full multi-agent reasoning and the knowledge graph can be scoped as Semester 2 refinements if needed, but a working end-to-end score by December is realistic.

---

### Notes for the supervisor/defense conversation
- **Data availability:** real shopkeeper transaction data is not publicly available as an open dataset — plan to pilot with a small number of real shopkeepers (or a partnered digital-ledger app, if one is willing to share anonymized data) rather than assuming an off-the-shelf dataset exists. State this plan explicitly rather than leaving it as an open question.
- **Validation without a credit bureau:** since there's no ground truth "correct" credit score to train against, the defensible approach is to validate the score against actual repayment outcomes over the pilot period (does a shopkeeper who scores well actually repay reliably?) rather than claiming accuracy against a formal benchmark that doesn't exist for this population.
- **Marketability for the job fair:** pitch as *"we help shopkeepers turn their khata into a loan"* — intuitive, mass-market, and immediately understandable, unlike the SKU/PLM idea. Revenue model: fee or referral commission from microfinance banks/fintechs for qualified loan referrals.
