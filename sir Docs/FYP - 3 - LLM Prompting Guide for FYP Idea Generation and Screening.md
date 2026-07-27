## **LLM Prompting Guide for FYP Idea Generation and Screening** 

Detailed prompt set for serious LLM-assisted FYP ideation, novelty analysis, overlap checking, and screening 

## **1. Important note on prompt quality** 

Short prompts usually produce shallow answers. 

When using LLMs for FYP ideation, use detailed prompts that specify: 

- the role the LLM should play, 

- the criteria it must use, 

- what does not count as novelty, 

- how strict it should be, 

- and the exact structure of the output you want. 

For serious FYP analysis, the LLM should not just generate ideas. It should also: 

- reject weak ideas, 

- expose overlap, 

- challenge fake novelty, 

- identify contribution gaps, 

- and help reshape scope. 

## **2. If you want to use LLMs, use detailed prompts like these** 

These prompts are intentionally detailed. For serious FYP ideation and novelty analysis, short prompts usually produce shallow, generic, or overly agreeable answers. 

Before using the prompts below, students should attach or paste the list of previously completed departmental FYPs whenever overlap checking is required. 

## **Prompt 1: Problem-space exploration** 

I am exploring problem spaces for a computer science Final Year Project. The project must be suitable for a two-semester FYP, should be substantial enough for 3 capable students, and should support a meaningful proof of concept by December. 

I do not want you to jump directly to trendy app ideas. I want you to first identify serious problem spaces where current workflows are weak, inefficient, error-prone, fragmented, under-supported, or poorly handled. 

Please identify 8 promising problem spaces. For each one, provide: 

1. the target users or stakeholders, 

2. the current workflow, 

3. the main pain points or inefficiencies, 

4. why the problem matters, 

5. what kinds of solutions currently exist, 

6. where those current solutions are weak or incomplete, 

7. where a defendable technical or system-level contribution might exist, 

8. whether the space appears too shallow, too saturated, or still worth exploring for FYP purposes. 

Do not recommend ideas that are merely CRUD systems, dashboards, generic chatbots, simple portals, or thin wrappers around existing APIs. 

At the end, rank the 8 problem spaces by: 

- novelty potential, 

- technical depth, 

- suitability for 3 students, 

- and likelihood of surviving proposal-defense questioning. 

## **Prompt 2: Solution-landscape mapping** 

I want to map the existing solution landscape for the following candidate problem spaces for a CS Final Year Project. 

For each problem space, organize the analysis into these five categories: 

1. commercial tools/products, 

2. open-source tools, 

3. research prototypes / research directions, 

4. manual or non-digital workflows, 

5. prior departmental FYPs. 

For each category, explain: 

- what kinds of solutions already exist, 

- what they do well, 

- what they do poorly, 

- where limitations repeatedly appear, 

- and whether those limitations are meaningful enough to support a defendable FYP contribution. 

Then provide, for each problem space: 

- the strongest reason it may still be worth exploring, 

- the strongest reason it may be a weak or saturated FYP direction, 

- and whether the apparent gap seems real, exaggerated, or probably superficial. 

Be critical. Do not assume every problem space is worth pursuing. 

## **Prompt 3: Constrained idea generation** 

Based on the shortlisted problem spaces below, generate 10-12 candidate FYP ideas. 

## Constraints: 

- The ideas must be suitable for a two-semester CS Final Year Project. 

- The project must be substantial enough for 3 capable students. 

- A meaningful proof of concept should be achievable by December. 

- Novelty is the primary screening criterion. 

- Ideas should not rely on AI, LLMs, agents, RAG, or API usage as the novelty claim by themselves. 

- Avoid generic chatbots, basic dashboards, CRUD systems, management portals, feature bundles, and local-market-only copies of existing products. 

For each candidate idea, provide: 

1. working title, 

2. target problem, 

3. target users, 

4. current inadequacy in existing solutions, 

5. possible contribution, 

6. likely technical direction, 

7. why it might be novel, 

8. why it might fail the novelty test, 

9. why it may be too small, 

10. why it may be too large, 11. whether it looks Safe / Risky / Weak at first glance. I do not want polished marketing language. I want realistic, academically defensible candidates. 

## **Prompt 4: Contribution hunting** 

For each of the candidate FYP ideas below, identify possible contribution angles. 

Do not give superficial suggestions like: - add a dashboard, - add a chatbot, - add multilingual support, - switch to mobile, - add voice, - use a different model, - improve the interface. Instead, focus on meaningful contribution types such as: - technical improvements, - workflow redesign, - decision-support improvement, - uncertainty-aware outputs, - human-in-the-loop systems, - domain-specific optimization, - neglected subproblems, - meaningful multimodal fusion, - evaluation innovation, - improved validation methodology, - stakeholder-specific optimization. For each idea, provide: 1. 3-5 plausible contribution angles, 2. which of them seems strongest, 3. which of them is most defensible in proposal defense, 4. which of them risks being too ambitious, 5. which of them risks being too cosmetic, 6. a one-sentence version starting with “Our contribution is...” If an idea seems unable to support a clear contribution, say so directly. 

## **Prompt 5: Novelty stress test** 

Act as a strict evaluator screening CS Final Year Project ideas where novelty is the primary filter. 

I am giving you several candidate ideas. Your job is not to be supportive. Your job is to reject weak ideas early. 

For each idea, critically evaluate: 

1. whether the problem itself is meaningful, 

2. whether the contribution is actually clear, 

3. whether the idea is mostly integration, 

4. whether the novelty claim is real or superficial, 

5. whether the idea seems too common or already obvious, 

6. whether the work seems too small, 

7. whether it sounds impressive but lacks substance. 

For each idea, produce: 

- verdict: Keep / Reshape / Reject, 

- strongest reason for the verdict, 

- specific novelty weakness, 

- specific scope weakness, 

- one or two ways it could be made more defensible. 

Be blunt. Do not rescue every idea. 

## **Prompt 6: Prior-FYP overlap check** 

I am providing a list of previously completed departmental FYPs. Treat this list as an internal priorproject database. 

I want you to compare each of my candidate ideas against those past FYPs. Do not compare only by title keywords. Compare structurally using: 

- the problem being solved, 

- target users, 

- core contribution, 

- technical pipeline, 

- inputs/data modalities, 

- outputs, 

- interaction style, 

- and evaluation story. 

For each candidate idea: 

1. identify the closest prior FYPs, 

2. explain the overlap in terms of problem overlap, method overlap, feature overlap, user overlap, and contribution overlap, 

3. classify the idea as Safe / Risky / Too Similar, 

4. explain whether the difference is substantial or merely cosmetic, 

5. state what would need to change to make the idea meaningfully distinct. 

Important: 

- changing domain wording alone does not count as distinct, 

- changing web to mobile does not count as distinct, 

- adding voice/chatbot/RAG does not automatically count as distinct, 

- changing one model for another does not automatically count as distinct. 

Be conservative. If similarity is substantial, say so clearly. 

## **Prompt 7: Overlap-based reframing** 

The following ideas were marked Risky or Too Similar when compared to prior departmental FYPs. 

For each one, I want you to propose 3 possible reframings that could make the idea more defensible. 

Each reframing must change something substantial, such as: 

- the contribution, 

- the target problem, 

- the workflow, 

- the technical pipeline, 

- the evaluation logic, 

- or the stakeholder value. 

Do not suggest cosmetic changes like: - renaming, 

- adding a chatbot, - adding multilingual support, 

- adding voice, - switching platforms, 

- or polishing the UI. 

For each reframing, provide: 

1. what changes, 

2. why the change is substantial, 

3. whether it reduces overlap with prior FYPs, 

4. whether it improves or weakens feasibility, 

5. whether it creates a clearer contribution. 

If an idea is too repetitive to rescue realistically, say that it should be dropped. 

## **Prompt 8: External comparison and gap analysis** 

For each shortlisted candidate idea, analyze the outside-world landscape and assess whether a real gap still exists. 

Consider: 

- commercial products, 

- established tools, 

- open-source systems, 

- research systems or prototypes, 

- and obvious non-digital workflows if relevant. 

For each idea, answer: 

1. what already exists, 

2. what those solutions do well, 

3. where they still fall short, 

4. whether those shortcomings are meaningful or minor, 

5. whether our proposed idea is a true contribution, a local deployment of an existing concept, or just a small variation, 

6. whether the remaining gap appears technically interesting enough for an FYP. 

End each idea with: 

- Gap status: Strong / Moderate / Weak 

- Novelty status versus existing solutions: Credible / Doubtful / Weak 

- Short conclusion: “Why this still may be worth pursuing” or “Why this is probably not strong enough” 

## **Prompt 9: Contribution statement forcing** 

I want to force each shortlisted idea into a precise contribution statement. 

For each idea: 

1. write one sentence beginning with “Our contribution is...” 

2. then explain whether that sentence is genuinely precise or still vague, 

3. identify any vague words or buzzwords being used, 

4. rewrite the sentence until it clearly states the contribution without relying on words like smart, innovative, AI-powered, intelligent, seamless, efficient, or user-friendly. 

If the contribution still cannot be stated clearly after refinement, conclude that the idea is not mature enough yet. 

## **Prompt 10: Proposal-defense simulation** 

Act as a strict FYP proposal-defense panel member. 

I will give you shortlisted FYP ideas. For each one, interrogate it as if you are trying to decide whether it should survive proposal defense. 

Challenge each idea using questions such as: 

- What is actually new here? 

- Why is this not just integration? 

- Why is this not a copy of existing systems? 

- Why is this not too similar to previous FYPs? 

- Why is this a Final Year Project instead of a semester project? 

- Why is it still feasible? 

- What is the biggest technical risk? 

- What exactly can realistically be ready by December? 

- On what grounds should this proposal be rejected? 

For each idea, provide: 

1. the 5 strongest objections, 

2. the likely faculty concern behind each objection, 

3. whether the idea currently survives or fails, 

4. what changes are needed to make it defensible. 

Do not be lenient. I want evaluator-style criticism, not encouragement. 

## **Prompt 11: Scope shaping** 

I want to calibrate scope for these shortlisted FYP ideas. 

Assume each project will be done by 3 capable students over two semesters, with a meaningful proof of concept expected by December. 

For each idea, break the work into: 

1. core contribution, 

2. supporting functionality, 

3. optional polish, 

4. features that should be removed, 

5. possible future extensions. 

Then assess: 

- why the idea may be too small, 

- why the idea may be too large, 

- whether the scope is balanced for 3 students, 

- what minimum proof of concept should exist by December, 

- what key risks could derail execution. 

End with: 

- Scope verdict: Too Small / Balanced / Too Large 

- Recommended action: Expand / Keep / Prune / Reframe 

## **Prompt 12: Final shortlist preparation** 

I want to prepare the strongest FYP ideas to take to a supervisor meeting. 

Based on all prior analysis — novelty, contribution clarity, overlap with prior departmental FYPs, overlap with external solutions, scope fit, feasibility, and proposal-defense strength — produce the best 5 shortlisted ideas. 

For each shortlisted idea, provide: 

1. tentative title, 

2. target problem, 

3. target users, 

4. current way the problem is handled, 

5. existing solutions, 

6. closest prior departmental FYPs, 

7. why this idea is still distinct, 

8. identified gap, 

9. exact contribution statement, 

10. core technical approach, 

11. why it suits 3 students over 2 semesters, 

12. what meaningful proof of concept could be ready by December, 

13. main risks, 

14. likely proposal-defense objections, 

15. final verdict: Strong Candidate / Borderline / Drop. 

Rank the shortlisted ideas from strongest to weakest and explain the ranking. 

## **3. One reusable detailed prompt block to paste before many prompts** 

I am working on Final Year Project ideation for a CS degree. 

The project must satisfy these constraints: 

- novelty is the most important screening criterion, 

- it must be suitable for a two-semester FYP, 

- it must be substantial enough for 3 capable students, 

- and it should support a meaningful proof of concept by December. 

I am also providing a list of previously completed departmental FYPs. Treat that list as an internal 

prior-project database and use it to avoid suggesting ideas that are duplicates, near-duplicates, or only superficial variations of past projects. 

When comparing ideas, do not rely only on titles. Compare using: 

- problem being solved, 

- target users, 

- technical pipeline, 

- core contribution, 

- data/input modalities, 

- outputs, 

- interaction model, 

- and evaluation story. 

Do not accept ideas as novel merely because they: 

- use AI, LLMs, agents, or RAG, 

- add a chatbot, 

- add multilingual support, 

- change from web to mobile, 

- change domain wording, 

- switch one model for another, 

- or combine common features in one system. 

I do not want polite or generic answers. I want critical, academically defensible analysis. 

When appropriate, reject weak ideas instead of improving all of them. 

Prefer structured outputs with clear verdicts, risks, overlap judgments, and contribution statements. 

**Usage reminder:** Students should not use these prompts to force weak ideas to sound novel. The purpose of this guide is to improve screening quality, not to manufacture artificial originality. 

