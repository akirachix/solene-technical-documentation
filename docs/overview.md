---
title: Overview
description: What Canopy is, the problem it solves, how the research shaped it, and what it does, explained for readers new to mountain gorilla conservation.
status: draft
---

# Overview

Mountain gorillas are an endangered species. Fewer than 1,100 are left in the wild, and one of the biggest dangers to them is disease, especially respiratory infections like the ones people catch. A cough in one gorilla can spread to its whole family group within days.

Every day, field staff called **trackers** walk into the forest to watch gorilla groups and note anything unusual, such as a gorilla that is coughing, limping or not eating. Wildlife vets called **gorilla doctors** then decide what to do about it.

The people doing this work already collect a huge amount of information. The trouble is that it lives in many different places: paper notebooks, radio calls, WhatsApp messages, medical files and research databases. When a vet needs to make a decision, they have to piece the story together by hand, and things can be missed or delayed.

**Canopy brings all of that information together around one gorilla's health concern**, from the moment a tracker first notices something until the vet records how it ended. It helps the team spot worrying patterns earlier and makes sure nothing falls through the cracks. It does **not** diagnose or treat animals. The vet always makes the decision.

## How to read this page

This page explains Canopy from the beginning, in the order the product was designed:

1. **[Why mountain gorillas need help](#why-mountain-gorillas-need-help).** The species, its recovery and the health threats it faces.
2. **[How gorilla health is monitored today](#how-gorilla-health-is-monitored-today).** The people, the daily routine and where information is kept.
3. **[What our research found](#what-our-research-found).** How we studied the problem, and the five specific problems we identified.
4. **[The problem Canopy solves](#the-problem-canopy-solves).** The problem statement, in one paragraph.
5. **[The people Canopy is for](#the-people-canopy-is-for).** The users, what they need and the stakeholders.
6. **[Why existing tools are not enough](#why-existing-tools-are-not-enough).** What other systems do, and the gap between them.
7. **[How Canopy works](#how-canopy-works).** The solution, step by step, with an example.
8. **[Features and the problems they solve](#features-and-the-problems-they-solve).** Every feature, traced back to a problem.
9. **[Product requirements](#product-requirements).** Goals, priorities, scope and assumptions.
10. **[How we measure success](#how-we-measure-success).** The main metric and supporting metrics.
11. **[What comes next](#what-comes-next).** The pilot, roadmap and conditions for going live.

If a word is unfamiliar, check the [glossary](#glossary) at the end. For the full detail behind this page, see the [source documents](#source-documents).

## Why mountain gorillas need help

### A small population that is still at risk

Mountain gorillas live in only two places in the world, both high-altitude forests in East and Central Africa:

- **The Virunga Massif**, a chain of volcanoes across Rwanda, Uganda and the Democratic Republic of the Congo (DRC).
- **Bwindi-Sarambwe**, in Uganda and the DRC.

These forests are small and surrounded by farmland and villages, so the gorillas cannot spread out to new areas.

Their story is one of conservation's great successes. In 1981, only about **242** mountain gorillas were left in the Virunga Massif. By 2018, about **1,063** lived across both forests, and their status on the IUCN Red List (the global list of threatened species) improved from _Critically Endangered_ to _Endangered_.

That recovery did not happen on its own. It depended on rangers protecting the forest, trackers watching the gorillas every day, vets treating sick and injured animals, tourism money, research and cooperation between three countries. **Vet care alone is estimated to explain up to 40% of the difference in growth** between gorilla groups that receive it and those that don't.

The recovery is real, but fragile. Because the population is so small and went through a severe decline, mountain gorillas have very low genetic diversity: about **34% of their genome** is identical on both copies (homozygous). This can make them less able to cope with disease and environmental change.

### Disease is one of the biggest threats

Mountain gorillas are closely related to humans and meet people every day through tourism, research, tracking and veterinary work. They can catch human illnesses, and those illnesses can spread fast within a group.

| Threat                                             | Why it matters                                                                                                                                                                                                                                                                                                             |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Respiratory disease** (coughs, colds, pneumonia) | The leading recorded infectious cause of death, linked to about **24–25%** of investigated deaths. Between 1990 and 2010, **18 outbreaks** were recorded in monitored groups in Rwanda, and **35 gorillas** needed vet treatment for life-threatening illness. Outbreaks are **2.3 times more likely in the rainy season** |
| **Human viruses**                                  | Viruses that normally infect people have been found in sick gorillas: _human metapneumovirus_ in a 2009 outbreak in which two gorillas died, and _human respiratory syncytial virus_ in 2012 and 2013                                                                                                                      |
| **Fast spread within groups**                      | Scientists estimate that one sick gorilla can infect between **1.7 and 9.4** others in its group (this number is called R0)                                                                                                                                                                                                |
| **Injuries and snares**                            | Trauma is the leading cause of death in infant gorillas (**56%**). Wire snares set for other animals injure gorillas' hands and feet, mostly young ones                                                                                                                                                                    |
| **Gut parasites**                                  | In Bwindi, a parasite called _Strongyloides_ was found in **49.6%** of sampled gorillas, more often in groups living near the forest edge                                                                                                                                                                                  |

**This is why speed matters.** When an illness can move through a family group in days, the time between a tracker seeing a cough and a vet reviewing it can affect whether one gorilla gets sick or many.

## How gorilla health is monitored today

### The people involved

| Who                                        | What they do                                                                                                                                                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Trackers and animal health technicians** | Walk into the forest every day to find their assigned gorilla groups, recognise each individual, and note health signs and behaviour. They are usually the first to notice a problem                         |
| **Gorilla doctors (wildlife vets)**        | Decide whether a gorilla should be watched more closely, examined, sampled or treated. Treating a wild gorilla often means sedating it, which carries its own risks, so this decision is never taken lightly |
| **Conservation programme managers**        | Coordinate staff, transport, supplies and reports. They need to know which cases are open and whether follow-ups are done, but they don't make medical decisions                                             |
| **Laboratories**                           | Test samples (such as faeces) to confirm what is causing an illness. Results can take days or weeks                                                                                                          |

### Habituated and unhabituated groups

Some gorilla groups are **habituated**: they have become used to people over many years, so trackers can watch them closely every day and vets can reach them. About **30–40%** of mountain gorillas live in **unhabituated** groups, which avoid people and are monitored only through occasional nest counts and genetic samples.

Canopy focuses on **habituated groups**, because that is where daily health information exists and where better use of it can make an immediate difference. The first site is **Volcanoes National Park in Rwanda**.

### Where information lives today

The conservation system already produces a lot of information:

- **Tracker observations.** Virunga National Park recorded **69,511 gorilla observations** in the field in 2025 alone.
- **Gorilla Doctors' medical records**, kept for every known gorilla since **1986**: examinations, treatments, outcomes and samples.
- **Karisoke Research Center records** on behaviour, births, deaths and group membership since **1967**.
- **SMART**, a tool used by more than **1,400 rangers** to record patrols, threats and wildlife sightings.
- **Informal channels**: radio calls, phone calls, WhatsApp messages, paper notebooks and the memories of experienced staff.

Each of these sources is valuable. The difficulty is that they are separate.

## What our research found

### How we studied the problem

We wanted to understand exactly how health information moves from the forest to a vet's decision and beyond, and where it gets lost or delayed. The research combined:

- **Scientific studies** on mountain gorilla health and disease.
- **Operational documents** such as vet protocols and park reports.
- **Interviews with practitioners**: vets, field staff and people who manage conservation data.
- **A review of existing technology** used in gorilla conservation.

We followed a single health concern through every stage of its life, asking at each stage what information is needed, who acts on it, which tools they use and what happens when something is missing:

1. A tracker **observes** a gorilla.
2. The observation is **recorded** and **reported**.
3. The vet **gathers background**: the gorilla's history and its group.
4. The vet **reviews** the case and **decides** what to do.
5. **Action** is taken, such as closer monitoring, sampling or treatment.
6. Someone **follows up** to check on the gorilla.
7. The **outcome** is recorded for the future.

We also checked findings against each other. A claim was only treated as established when independent sources agreed, for example when interviews matched what operational documents said.

### The main finding: the information exists, but it doesn't connect

> The problem is not a lack of monitoring or expertise. It is the difficulty of making sure the right health information is connected, put in context and carried through the vet's work at the right time.

A single observation rarely tells the whole story. Whether a cough is worrying depends on questions like these:

- Has this gorilla had the same problem before?
- Has the cough continued over several days, or was it a one-off?
- Are other gorillas in the group showing similar signs?
- Was this gorilla treated recently, and did the treatment work?
- Is a previous follow-up instruction still waiting to be done?

The answers usually exist somewhere, but finding and connecting them takes time and depends on knowing where to look.

### Five specific problems

| #   | Problem                       | In plain terms                                                                                                                                                                                         | Why it matters                                                                                                                |
| --- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Observation uncertainty**   | In thick forest, trackers can't always see every gorilla clearly. Dominant gorillas can block the view of weaker ones. A tracker may not be able to tell whether a sign is absent, or just wasn't seen | If an empty field is recorded as "normal", a sick gorilla can look healthy on paper                                           |
| 2   | **Finding the history**       | A gorilla's medical history is spread across paper files, notes, databases and messages                                                                                                                | Vets lose time reconstructing history when speed matters, and may repeat a treatment that already failed                      |
| 3   | **Spotting patterns**         | One cough means more if it keeps happening, comes back, or appears in other gorillas too. Today, nothing makes these patterns visible automatically                                                    | Early signs of an outbreak depend on one experienced person happening to notice them                                          |
| 4   | **Deciding what comes first** | Vets must weigh the risks of sedating and handling a gorilla against the risks of waiting, often before lab results are back                                                                           | Good decisions depend on having the right information at the right moment                                                     |
| 5   | **Following through**         | Follow-up checks do happen, but they are arranged verbally or by message and recorded on paper. Cases can quietly end without anyone recording how                                                     | Nobody outside the vet team can see whether the follow-up happened, and outcomes are not linked back to what started the case |

### What a vet told us

An interview with a veterinary professional working in primate health made these problems concrete:

- **History is slow to find.** In one case, a fungal infection needed **three different treatments of about 30 days each**. Without quick access to that history, a vet could restart a treatment that had already failed.
- **Follow-up is done but invisible.** Animals are checked the day after treatment, but the result goes on the same paper file and isn't visible to others without going through it.
- **Decisions are made without a confirmed diagnosis.** Confirming an illness needs samples and lab tests, and sedating a gorilla to take samples isn't always justified. So some cases are watched first, others need immediate action, and the vet decides under uncertainty.

These findings directly shaped Canopy. They are why Canopy keeps treatment history linked to each gorilla, keeps "what was seen" separate from "what was diagnosed", never treats missing information as normal, keeps follow-ups attached to the case until it is closed, and never diagnoses, prescribes or recommends sedation.

## The problem Canopy solves

Putting the research together gives this problem statement:

> Mountain gorillas, an endangered population that depends on conservation, are vulnerable to respiratory diseases and other health threats that can spread quickly within groups and become severe when worrying signs are not recognised and followed up in time.
>
> Trackers, wildlife vets and conservation programme managers need a connected way to link field observations, each gorilla's health history, what is happening in its group, vet decisions and follow-up actions. Today, fragmented information can delay the recognition of serious patterns. Connecting it means gorillas get timely, well-informed vet review, and the gains won through decades of protection are sustained.

The design question we set ourselves was:

> **How might we** help conservation teams spot health concerns earlier and keep each case connected from first observation to outcome, so that gorillas get timely, well-informed care while vets keep full authority over clinical decisions?

## The people Canopy is for

### The gorilla tracker

**Emmanuel Niyonzima**, 27, is a gorilla tracker in Musanze, near Volcanoes National Park. He spends most of his day in steep, wet forest, finding his assigned groups, recognising each gorilla and watching for signs like coughing, injuries, weakness or a gorilla that isn't eating. Mobile signal comes and goes. He records what he sees, but he cannot diagnose illness or decide on treatment.

**What makes his work hard today:**

- Reports get lost or delayed in areas with no signal, rain and fog, so he falls back on paper notes.
- He sends the same concern by radio, WhatsApp and word of mouth because he never knows which message reached the vet.
- Follow-up checks are agreed verbally and depend on memory.
- Once he reports something, he rarely learns what happened, which is discouraging.

**What he needs from Canopy:** record observations quickly with few taps; work fully offline without losing anything; know that his report reached the vet; see his follow-up tasks and due dates as soon as he opens the app; and see what happened as a result of his reports.

### The gorilla doctor

**Jane Amondi**, 35, is a Gorilla Doctors veterinarian in Musanze. She decides whether a gorilla should be watched more closely, examined, sampled or treated. She often has to decide before lab results are available, and every intervention carries risks for the animal.

**What makes her work hard today:**

- She has to piece together a gorilla's history from files, messages and colleagues' memories.
- Field reports can be incomplete, delayed or use different terms for the same thing.
- Recognising an outbreak depends on someone noticing patterns across separate conversations.
- Her decisions are made verbally, and follow-up is tracked in a separate conversation, so nothing links the decision to whether it happened.

**What she needs from Canopy:** one summary per case showing the current concern, the gorilla's history, what is happening in its group and any open follow-up; the source of every fact; a clear view of what is uncertain or missing; a queue of cases sorted by urgency; the ability to record a decision, assign follow-up and close a case; and full authority over every clinical decision.

### The programme manager

**David N.** coordinates monitoring, vet workload, staffing and reports for funders and partners. He doesn't treat gorillas, but needs to know which cases are open, which follow-ups are overdue and whether every group is being observed, without seeing sensitive medical details or exact gorilla locations he doesn't need.

### Stakeholders

Some organisations don't use Canopy every day but decide whether and how it is used.

| Stakeholder                                                               | Role                                                     | Why they matter                                                         |
| ------------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Gorilla Doctors**                                                       | Provides vet care and keeps the official medical records | Main clinical users; their records remain the authoritative source      |
| **Conservation organisations** (for example the Dian Fossey Gorilla Fund) | Run programmes, coordinate resources, report to funders  | Decide whether to adopt or expand Canopy                                |
| **Protected-area authorities**: RDB (Rwanda), UWA (Uganda), ICCN (DRC)    | Manage the parks and own location and operational data   | Approve deployment, set rules for location data, review the audit trail |
| **Laboratories, researchers, rangers, tourism operators**                 | Supporting roles                                         | May provide data or use summaries later; not primary users at first     |

### What each user is trying to get done

| As a…   | When…                                    | I want to…                                                                                                          | So that…                                                     |
| ------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Tracker | I see a sign but can't be sure           | mark it as "not seen", "not observed" or "unsure"                                                                   | the record shows what I could really assess                  |
| Tracker | I'm somewhere with no signal             | record an observation without losing anything                                                                       | my work isn't lost                                           |
| Tracker | I send a report                          | see whether it is waiting to send, sent, seen or acknowledged                                                       | I don't have to repeat it by radio and WhatsApp              |
| Tracker | the vet asks me to check a gorilla again | get it as a task with a due date                                                                                    | it becomes part of my patrol                                 |
| Tracker | my report leads to a decision            | see the outcome                                                                                                     | my reporting visibly helps the gorillas                      |
| Vet     | I open a respiratory case                | see whether other gorillas have similar signs, whether people were nearby in the last 7–14 days, and past illnesses | I can tell one sick gorilla from the start of an outbreak    |
| Vet     | I review a case                          | see where every fact came from and how certain it is                                                                | I can trust the evidence and see what is missing             |
| Vet     | I review a case                          | see weather and habitat conditions for that place and time                                                          | I can consider them without assuming they caused the illness |
| Vet     | I make a decision                        | record why, and assign follow-up in the same step                                                                   | the decision stays linked to what happens next               |
| Anyone  | I open a case                            | see only what my role allows                                                                                        | sensitive data is protected without slowing my work          |

## Why existing tools are not enough

Canopy is not the first technology in gorilla conservation. Each existing system does an important job well.

| System                               | What it does well                                                                      | What it does not do                                                                   |
| ------------------------------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Gorilla Doctors medical database** | The world's largest medical database on wild great apes, running since 1986            | Doesn't handle tracker observations, assemble group context or manage follow-up tasks |
| **SMART**                            | Rangers' tool for recording patrols, threats and sightings in a standard way           | Isn't a medical system; has no health cases or treatment history                      |
| **EarthRanger**                      | Live map of patrols, collars, camera traps and incidents, used in 900+ protected areas | Isn't built for vet work, and isn't yet used in the Virunga landscape                 |
| **Camera traps, drones, image AI**   | Detect species and monitor areas                                                       | Can't reliably identify individual mountain gorillas or track their health            |

**The gap is between these systems, not inside any one of them.** No tool today handles these four moments:

1. When a tracker's **observation becomes a case** that a vet needs to look at.
2. When the **background is gathered** so the vet can review it.
3. When the vet's **decision becomes a follow-up task** with someone responsible for it.
4. When that **follow-up becomes a recorded outcome** that closes the case.

That is exactly where Canopy sits. It doesn't replace any of these systems; it connects the work that happens between them.

## How Canopy works

### The health case

The core idea in Canopy is the **health case**: a single record that follows one health concern for one gorilla from start to finish. It begins when an observation (or a pattern of observations) needs a vet's attention, and stays open until the vet records how it ended. Everything related to that concern is attached to it: the original observation, later observations, the gorilla's history, its group, lab requests and results, vet decisions, follow-up tasks and the final outcome.

### A health concern, step by step

1. **A tracker records an observation.** In the forest, the tracker opens the Canopy app, picks the gorilla and records what they saw: the sign, how severe it looks, and whether anything couldn't be assessed. This works with no signal at all; the observation is saved on the phone.
2. **The observation reaches the system.** As soon as the phone has signal again, the observation is sent automatically. The tracker can see that it was sent.
3. **Canopy decides whether a vet needs to see it.** Clear, written rules check things such as how severe the sign is, whether it has been seen before, and whether other gorillas in the group have similar signs. If a vet needs to look, Canopy creates a new health case or adds the observation to an open one. Trackers can also escalate a concern manually at any time.
4. **Canopy gathers the background.** It pulls together the gorilla's recent observations and history, past cases, what is happening in its group, and the weather and conditions where it was seen, keeping a note of where each piece came from.
5. **The vet reviews the case.** The vet opens a one-screen case summary showing the current concern, how it has developed, the background, what is missing, and an AI risk assessment explaining which conditions the evidence is consistent with and why. The vet decides what to do.
6. **The decision becomes action.** The vet records the decision and the reason for it, and in the same step assigns a follow-up, such as "Re-check this gorilla's breathing at tomorrow's visit", to a named tracker with a due date.
7. **The tracker follows up.** The task appears in the tracker's app. Their new observation is automatically linked to the same case. If a task becomes overdue, Canopy flags it.
8. **The case is closed.** When the vet is satisfied, they record the outcome and close the case. If the problem returns, the case can be reopened. The complete history stays available for the future.

### An example: before and after Canopy

**Before Canopy.** On Monday, a tracker sees a young gorilla coughing. There's no signal, so she writes it in her notebook and radios it in that evening. Unsure the message got through, she also sends a WhatsApp message. On Tuesday, a colleague in another part of the forest sees a cough in a different gorilla from the same group, and mentions it at the team meeting on Thursday. The vet, meanwhile, has to dig through paper files to find that the first gorilla had a respiratory infection last year. She asks for a re-check by phone. Nobody records whether it happened, and the case ends without a written outcome.

**With Canopy.** On Monday, the tracker records the cough in the app, offline. It syncs as she walks back into signal, and she sees it was delivered. On Tuesday, her colleague records the second cough. Canopy links both observations to the same group and adds them to one health case. The vet opens the case and immediately sees both observations, the first gorilla's previous respiratory infection, the recent heavy rain in that part of the forest, and an AI assessment listing the conditions the evidence is consistent with, with its sources. She decides to monitor closely and assigns a re-check to the tracker for the next morning. The tracker sees the task, completes it, and the result is added to the case. When both gorillas recover, the vet closes the case with a recorded outcome. The tracker can see how her report helped.

### The principles behind Canopy

- **The vet always decides.** Canopy supports clinical decisions; it never makes them. Vets can open a case, change its priority or close it whatever the system suggests.
- **Show the evidence, not just a conclusion.** Every fact is linked to where it came from, and anything uncertain or missing is shown clearly.
- **Clear rules come first, AI second.** Urgent situations are caught by simple, transparent rules. The AI adds an extra signal with its reasoning, and can never quietly lower an alert raised by a rule.
- **Connect, don't replace.** Gorilla Doctors, SMART, EarthRanger and Karisoke stay in charge of their own records. Canopy connects information around a case.
- **No extra paperwork.** Canopy must reduce the work of trackers and vets, not add to it. Nobody should enter the same information twice.
- **Protect sensitive data.** Gorilla locations and medical details are shown only to people whose role needs them, and important actions are recorded in an audit trail.

### What Canopy deliberately does not do

| Canopy does not…                                  | Why                                                               |
| ------------------------------------------------- | ----------------------------------------------------------------- |
| Diagnose illness                                  | Only a qualified vet can make a diagnosis                         |
| Recommend treatment or medicine                   | The clinical and animal-welfare risks are too high                |
| Trigger any intervention automatically            | Every intervention needs a vet's judgement                        |
| Draw research conclusions on its own              | Research findings need expert interpretation                      |
| Replace existing medical databases or field tools | Those systems remain the official record; Canopy connects to them |
| Make wildlife data public                         | Exact gorilla locations could put the animals at risk             |
| Predict deaths                                    | There isn't enough data to do this responsibly                    |
| Blame tourists or staff for an illness            | This can't be proven without lab and epidemiological evidence     |

We also considered sensors such as camera traps, acoustic monitors and collars, and decided against them for now. Trackers already see the signs most sensors would try to detect, the most useful data is restricted, and power, rain and steep terrain make devices unreliable in the forest.

## Features and the problems they solve

Every feature in Canopy exists because of a specific problem found in the research.

| Problem                                    | Feature                                | What it does                                                                                                                                                                                                                                   | Learn more                     |
| ------------------------------------------ | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Reports lost where there is no signal      | **Offline-first app**                  | Trackers record observations with no signal; they are saved on the phone and sent automatically when signal returns. The app works the same online and offline                                                                                 | [Mobile App](/frontend-mobile) |
| Missing information mistaken for "normal"  | **Uncertainty states**                 | Trackers can record "not seen", "not observed" or "unable to assess". These stay on the record and are shown to the vet                                                                                                                        | [Mobile App](/frontend-mobile) |
| The same report sent through many channels | **Report status**                      | Each report shows whether it is waiting to send, sent, seen or acknowledged                                                                                                                                                                    | [Mobile App](/frontend-mobile) |
| Cases that never formally end              | **Health cases**                       | Every concern becomes one case with a clear status, from new to closed or reopened, linking everything that happened                                                                                                                           | [Backend](/backend)            |
| History that is hard to find               | **Case summary and health timeline**   | One screen with the concern, history, group context and open actions, plus a timeline of every event for each gorilla                                                                                                                          | [Web App](/frontend-web)       |
| Patterns that nobody sees                  | **Group cluster alert**                | If 3 or more gorillas in the same group show similar signs within 14 days, Canopy raises a flag and shows the observations behind it                                                                                                           | [Backend](/backend)            |
| Patterns that nobody sees                  | **Weather and environment**            | Weather for the place and time of each observation is attached and compared with normal conditions. It is shown as context, never as a cause                                                                                                   | [AI Module](/ai)               |
| Deciding what comes first                  | **AI risk assessment**                 | An AI assistant, grounded in a library of veterinary research papers, suggests which conditions the evidence is consistent with, how likely they are and why, with sources. Every answer is checked for accuracy and safety before it is saved | [AI Module](/ai)               |
| Deciding what comes first                  | **Risk map**                           | A satellite map showing gorilla groups, open cases and areas of higher risk                                                                                                                                                                    | [Web App](/frontend-web)       |
| Decisions disconnected from action         | **Decision and follow-up in one step** | When the vet records a decision, the follow-up task is created at the same time, with a named person and due date                                                                                                                              | [Backend](/backend)            |
| Follow-up that is invisible                | **Follow-up tracking**                 | Every task has an owner, a due date and a result. Overdue tasks are flagged                                                                                                                                                                    | [Backend](/backend)            |
| Trackers never hear what happened          | **Feedback to trackers**               | Trackers can see the outcome of the cases their reports started                                                                                                                                                                                | [Mobile App](/frontend-mobile) |
| Preventing future illness                  | **Preventive recommendations**         | Suggested preventive measures are saved as proposals and approved or rejected by a vet. Those decisions improve future suggestions                                                                                                             | [AI Module](/ai)               |
| Sensitive data                             | **Role-based access and audit trail**  | Each user sees only what their role allows, enforced by the server; important actions are recorded                                                                                                                                             | [Security](/security)          |

### Health signals: when does something need a vet?

Canopy watches a set of signals. Each one has a "healthy" state and a "concerning" state. A concerning state means **"a vet should look at this"**, not "this gorilla has a disease".

| Signal                    | Healthy                                                        | Concerning                                                        | What Canopy does                                                                            |
| ------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| A sign in one gorilla     | Recorded as "all normal"                                       | A specific sign: breathing, digestive, injury, behaviour or other | Puts it in the vet's queue within minutes of syncing; emergencies are escalated immediately |
| Uncertainty               | The sign was clearly seen, or clearly absent                   | "Not observed" or "unable to assess"                              | Keeps it on the record and highlights it for the vet                                        |
| Several gorillas affected | Fewer than 3 with similar signs in 14 days                     | 3 or more with similar signs in 14 days                           | Raises a group cluster flag with the observations behind it                                 |
| Follow-up                 | Done by the due date, with a result                            | More than 24 hours overdue                                        | Flags it to the programme manager                                                           |
| Contact with people       | No sick visitors or staff near the group in the last 7–14 days | A sick tourist or staff member was near the group                 | Adds it to the case timeline as context                                                     |
| Environment               | Normal conditions over the last 3, 7, 14 or 30 days            | Unusual weather compared with normal for that place               | Shows it alongside the case, never as the cause                                             |

### Technology: what was planned and what was built

| Need                          | Planned in the product requirements | Built with                                                                 |
| ----------------------------- | ----------------------------------- | -------------------------------------------------------------------------- |
| Weather data                  | Open-Meteo                          | Open-Meteo                                                                 |
| Maps                          | Mapbox or Google Maps               | MapLibre with MapTiler satellite maps                                      |
| AI assistant                  | Grok                                | Google Gemini with File Search, grounded in a library of veterinary papers |
| Field data from other systems | EarthRanger and SMART               | Not connected yet; planned for a later phase                               |

## Product requirements

### What Canopy must achieve

1. Keep the way trackers already collect data, with **no duplicate data entry**.
2. Connect observations, history, group context and follow-up into **one continuous case**.
3. **Cut the time** it takes to piece together a gorilla's health history.
4. Make **repeated, returning and group-wide signs** visible.
5. Connect health events with **place**: location, weather, climate and habitat.
6. Show vets **where every fact came from** and **what is uncertain**.
7. Give every follow-up **a named owner and a due date**.
8. Keep a **traceable record** of decisions, outcomes and closure.
9. **Work offline** in the field.
10. Control access **by role** and **record** every significant action.
11. Keep **the vet's judgement at the centre** of every clinical decision.

### What was built first: MoSCoW

MoSCoW sorts features into what the product **M**ust have, **S**hould have, **C**ould have and **W**on't have.

| Feature                                   | Priority   | Why                                                                                    |
| ----------------------------------------- | ---------- | -------------------------------------------------------------------------------------- |
| Structured observation form               | **Must**   | Where every case starts: the tracker's record of what they saw                         |
| Health case sent to the vet               | **Must**   | Brings the observations and the reason for concern to the vet                          |
| Recording decisions with a reason         | **Must**   | Shows why a vet accepted or rejected a concern, and helps improve the system over time |
| Follow-up task with an owner and due date | **Must**   | Makes sure the gorilla is checked until it recovers                                    |
| Group cluster detection                   | **Must**   | Spots illness spreading within a group                                                 |
| Offline field capture                     | **Should** | Lets trackers work where there is little or no signal                                  |
| Automatic diagnosis and treatment         | **Won't**  | Canopy never replaces the vet's clinical decision                                      |

### Scoring features: RICE

RICE helps decide what to build first by scoring each feature on **R**each (how many people it helps), **I**mpact (how much it helps), **C**onfidence (how sure we are) and **E**ffort (how much work it takes).

**RICE score = Reach × Impact × Confidence ÷ Effort**

| Feature                                        | Reach | Impact | Confidence | Effort | Score   | Priority |
| ---------------------------------------------- | ----- | ------ | ---------- | ------ | ------- | -------- |
| Structured observation form                    | 10    | 3      | 0.9        | 3      | **9.0** | Must     |
| Health case sent to the vet                    | 10    | 3      | 0.9        | 3      | **9.0** | Must     |
| AI help deciding which observations need a vet | 10    | 3      | 0.8        | 3      | **8.0** | Must     |
| Group cluster detection                        | 10    | 3      | 0.8        | 3      | **8.0** | Must     |
| Recording decisions with a reason              | 9     | 3      | 0.8        | 3      | **7.2** | Must     |
| Follow-up task with an owner and due date      | 8     | 3      | 0.9        | 3      | **7.2** | Must     |
| Offline field capture                          | 8     | 2      | 0.8        | 2      | **6.4** | Should   |

### Assumptions

These are things we believe to be true but still need to confirm:

- Existing records can be matched reliably to each individual gorilla.
- Mobile signal in the forest drops out for hours, but comes back at some point every working day.
- The first pilot runs only in Rwanda, so no agreements between countries are needed yet.
- Trackers will share their location, so observations can be placed on the map.

## How we measure success

### The main measure: time to vet review

> **How long it takes, from a tracker recording a potentially serious sign in the field, until a qualified vet has reviewed it.**

This is the single number that best shows whether Canopy is working. Canopy exists to close the gap between a sign being seen and a vet having what they need to review it.

- **How it is calculated:** the median of (time reviewed − time observed) across every observation that led to a case. The median is the middle value, so a few unusual cases don't distort it.
- **Target:** a median of **5 hours or less** within the first 90 days of use, and falling over time.

### Supporting measures

| Measure                     | What it tells us                                               | How it is calculated                                                                | Goal   |
| --------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------ |
| **Uncertainty kept**        | Whether "not seen" and "unsure" survive all the way to the vet | Observations still marked uncertain at review ÷ observations marked uncertain × 100 | Higher |
| **Reports acknowledged**    | Whether vets acknowledge reports quickly                       | Reports acknowledged in time ÷ reports sent × 100                                   | Higher |
| **Follow-ups done on time** | Whether checks happen when they should                         | Follow-ups completed on time ÷ follow-ups assigned × 100                            | Higher |
| **Useful cluster alerts**   | Whether group alerts point to real concerns                    | Alerts confirmed by a vet ÷ alerts raised × 100                                     | Higher |
| **Overdue follow-ups**      | Whether checks are being missed                                | Follow-ups more than 24 hours late ÷ follow-ups assigned × 100                      | Lower  |
| **Cases resolved**          | Whether cases reach a recorded outcome                         | Cases closed in time ÷ cases opened × 100                                           | Higher |

## What comes next

### The pilot

Canopy will first be tested in **Volcanoes National Park, Rwanda**, with a small number of habituated gorilla groups and the trackers, vets and programme staff who look after them. Everyone will receive short, practical training: trackers on recording observations, working offline and completing follow-ups; vets on the case queue, case summary and recording decisions; managers on the overview dashboards.

### The roadmap

| Phase                                 | What happens                                                                                                                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase 0: Getting ready**            | No software yet. Agree the pilot site, who owns which data, what data can be used, how it is governed, and who provides vet oversight                                                                    |
| **Phase 1: The core workflow**        | The tracker app, the vet's case queue and case summary, the manager view, rule-based alerts, follow-ups, offline sync, security and audit. The goal is to prove the workflow works and measure its value |
| **Phase 2: Connecting other systems** | With agreements in place, bring in historical medical records and connect to SMART and EarthRanger. Add reporting on case numbers, response times, follow-ups and monitoring coverage                    |
| **Phase 3: Expanding**                | Extend to more sites across the Virunga Massif and possibly Bwindi, with agreements between organisations and countries and sustainable funding                                                          |

### Conditions for going live

Canopy will only move from a prototype to real use after passing eight checks.

| Check                                                           | Where it stands                                                                                                               |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Problem**: is this a real problem worth solving?              | Partly confirmed: interviews confirmed that finding history, keeping cases connected and tracking follow-up are real problems |
| **Data**: is the data available?                                | Partly confirmed: tracker, group and follow-up data is available; medical and lab data need formal agreements                 |
| **Users**: do trackers and managers find it useful?             | Waiting for a working prototype to be tested                                                                                  |
| **Veterinary**: do vets approve the rules and the case summary? | Waiting for vet review                                                                                                        |
| **Technical**: does it work reliably in the field?              | Waiting for testing                                                                                                           |
| **Security**: is sensitive data properly protected?             | Waiting for a security audit                                                                                                  |
| **Commercial**: is there a way to fund it long term?            | Waiting for an organisation or funder to commit                                                                               |

### Risks and how they are managed

| Risk                                                  | How Canopy reduces it                                                          |
| ----------------------------------------------------- | ------------------------------------------------------------------------------ |
| A serious health event is missed                      | Clear rules catch urgent situations, and trackers can always escalate manually |
| Too many false alarms, so people stop trusting alerts | Rules are approved by vets, and every alert explains why it was raised         |
| Existing data is incomplete or inconsistent           | Every fact shows its source and how certain it is                              |
| No signal or broken devices in the field              | The app works fully offline and syncs later                                    |
| Sensitive data seen by the wrong people               | Access is limited by role, and actions are recorded                            |
| No long-term funding                                  | The product is validated step by step before full deployment                   |

## Glossary

| Term                          | Meaning                                                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Audit trail**               | A record of who did what in the system, and when                                                                          |
| **Case summary (case brief)** | The one-screen view a vet sees for a health case                                                                          |
| **Cluster**                   | Several gorillas in the same group showing similar signs within a short period, which can be an early sign of an outbreak |
| **Escalation**                | Raising a concern so that a vet looks at it                                                                               |
| **Follow-up**                 | A task to check on a gorilla again, assigned to a named person with a due date                                            |
| **Gorilla doctor**            | A wildlife vet who cares for mountain gorillas, usually from the organisation Gorilla Doctors                             |
| **Group**                     | A gorilla family that lives and travels together, usually led by a silverback                                             |
| **Habituated group**          | A group that has become used to people, so it can be observed closely every day                                           |
| **Health case**               | One record that follows a single health concern for one gorilla from first observation to recorded outcome                |
| **Human in the loop**         | A design where people, not the software, make the final decisions                                                         |
| **IUCN Red List**             | The global list of threatened species and how endangered they are                                                         |
| **Observation**               | A tracker's record of what they saw in one gorilla at one time and place                                                  |
| **Offline-first**             | An app designed to work fully without internet, sending data when a connection returns                                    |
| **Outbreak**                  | Illness spreading through a group in a short period                                                                       |
| **R0**                        | How many others one sick individual is expected to infect                                                                 |
| **Respiratory disease**       | Illness affecting breathing, such as coughs, colds and pneumonia                                                          |
| **Tracker**                   | A field worker who finds and observes gorilla groups every day                                                            |
| **Unhabituated group**        | A group that avoids people and is monitored only occasionally                                                             |

## Where to go next

| To learn about…                      | Read                                      |
| ------------------------------------ | ----------------------------------------- |
| How the parts of Canopy fit together | [Architecture](/architecture)             |
| The server, data and business rules  | [Backend / API](/backend)                 |
| The tracker app and offline sync     | [Mobile App](/frontend-mobile)            |
| The vet and admin website            | [Web App](/frontend-web)                  |
| How the AI risk assessment works     | [AI Module](/ai)                          |
| Access control and data protection   | [Security](/security)                     |
| How Canopy looks and behaves         | [Design & Guidelines](/design-guidelines) |

## Source documents

Everything on this page is based on two documents written while designing Canopy. Read them for the full detail, evidence and references.

| Document                                                                                                                                | What it covers                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Research report](https://docs.google.com/document/d/1ul7OiGLB9B0EDY3lq-xmhEUrR3JehwMYsYTYWlhCv9M/edit?usp=sharing)                     | The conservation and health context, research method, practitioner interviews, problem breakdown, users, existing systems, proposed solution, feasibility and scientific references |
| [Product requirements document (PRD)](https://docs.google.com/document/d/1Ug0A8Si3KWfFguMVAXvLTLa16ETbZsamt6VmJiAqn3Y/edit?usp=sharing) | The problem statement, product goals, stakeholders, personas, jobs to be done, features, scope, dependencies, assumptions, metrics and prioritisation                               |
