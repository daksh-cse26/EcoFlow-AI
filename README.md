# 🌿 EcoFlow AI

> **"AI-Assisted. Human-Verified. Digitally Traceable."**  
> *"EcoFlow AI — From Household Scrap to Responsible Recycling, Every Step Tracked."*

EcoFlow AI is an enterprise-grade, digitally managed recycling infrastructure designed specifically for regional Indian waste ecosystems. It organizes the complete recyclable-waste journey from household doorstep scrap to verified storage hubs and authorized industrial recyclers.

---

## 🌟 Core Product Principles

1. **"AI assists. Employees collect. Storage hubs verify. EcoFlow AI records, calculates and traces."**
2. **AI must NEVER independently determine the final payment.** The Storage Hub is the **FINAL AUTHORITY** for material classification, physical weight, and quality grading.
3. **Decoupled Pricing Rule:** Household settlements are calculated at verification time using official Company Buying Rates. Downstream industrial recycler sales use aggregated volume contracts and **never retroactively modify completed household settlements**.
4. **Inclusive Collector Workflows:** Smartphone ownership is **not mandatory**. Supports Mode 1 (Smartphone), Mode 2 (Basic Phone SMS), and Mode 3 (Physical dispatch through Field Coordinators).
5. **Privacy First:** Citizen household locations are strictly access-controlled and never exposed publicly.

---

## 🏗️ System Architecture & Workflow

```
HOUSEHOLD
    ↓ (Local AI Assessment & Voice Input)
PICKUP REQUEST (PR-2026-000842)
    ↓ (Operational Zone & Workload Engine)
FIELD COORDINATOR & COLLECTOR (COL-00142)
    ↓ (Mode 1: Smartphone / Mode 2: SMS / Mode 3: Physical)
DIGITAL LOT & IMMUTABLE QR (LOT-2026-000184)
    ↓
STORAGE HUB VERIFICATION (Physical Scale + Grade B)
    ↓ (Tolerance Evaluation: ±5%)
HOUSEHOLD SETTLEMENT (Verified Weight × Company Buying Rate = ₹5,044)
    ↓
HUB INVENTORY AGGREGATION (500 kg Industrial Batch)
    ↓
AUTHORIZED RECYCLER BIDDING & OFFERS
    ↓
SALE & DISPATCH MANIFEST (Gate Pass QR)
```

---

## 📱 6 Connected Stakeholder Perspectives

### 1. Household Citizen Mobile-First App
- **Impact Counters:** Verified Recycling (kg), Completed Pickups, Segregation Score (88/100), Weight Matches.
- **Multilingual Support:** English, Hindi (हिन्दी), Assamese (অসমীয়া), and Bengali (বাংলা) with structured localization keys.
- **Multilingual AI Speech Recognition:** 🎙️ Tap to Speak with waveform animation, Indian language presets, and mandatory `[Confirm]`, `[Edit]`, `[Cancel]` buttons.
- **Local AI Waste Scanner:** Regional Indian scrap presets (Copper Wires, Circuit Boards, Old Newspapers, PET Bottles, Aluminium Cans) or custom image upload. Returns detected material, confidence %, segregation score /100, segregation advice, and mandatory trust disclaimer.
- **Estimated Weight & Indicative Pricing:** User enters estimated weight (`user_estimated_weight`), strictly preserved and never overwritten.
- **Household Map:** Private interactive map to drop/move pin and set landmarks.
- **Transparent Settlement & Digital Receipt:** Complete calculation formula breakdown, lot ID link, print, and share options.
- **Rewards Program:** Attractive locked cards for 🌱 *Green Starter*, ♻️ *Eco Regular*, and 🏆 *Waste Warrior* marked **"COMING SOON"**.

### 2. Field Operations / Coordinator Dashboard
- **Operational Queue:** Pending Requests, Assigned Requests, Available Collectors, and Unacknowledged Timeout counters.
- **Intelligent Collector Matching:** Evaluates service zone, distance, availability, and active workload.
- **3 Collector Modes:** Mode 1 (Smartphone Collector App), Mode 2 (SMS Dispatch), Mode 3 (Physical Field Coordinator Dispatch).

### 3. Field Collector Application
- **Connectivity Status:** `ONLINE`, `OFFLINE`, `SYNC PENDING`, `SYNCED`.
- **Active Task & Route Manifest:** Pickup sequence with distance, travel time, and stop count.
- **Digital Waste Lot Generator:** Generates unique `LOT-2026-xxxxxx` with scannable QR code.

### 4. Storage Hub Physical Verification Station (The Final Authority)
- **Multi-Material Breakdown:** Allows multi-material splits (e.g. Copper Scrap 7.9kg + PCB 2.1kg).
- **Physical Scale Weighment:** Calibrated digital scale entry (the source of truth).
- **Quality Grading:** Grade A, Grade B, Grade C with explicit criteria.
- **Weight Match Evaluation (Section 25 & 26):**
  - **Scenario 1 (MATCH):** User estimate 10 kg vs Hub verified 10 kg -> Triggers attractive *"Congratulations! You are making a Leaner and Greener Environment"* celebration popup with leaf particles and confetti!
  - **Scenario 2 (DIFFERENCE):** User estimate 10 kg vs Hub verified 7.8 kg -> Informative notice without accusations.
- **Household Final Settlement:** `Verified Weight × Company Buying Rate` (AI is never used).

### 5. Authorized Recycler Marketplace & Aggregation
- **Lot Aggregation:** Aggregates verified lots into industrial batches (e.g. 500 kg PET / Copper Batch).
- **Recycler Bidding:** Industrial recyclers submit offers with price per kg, volume, and conditions.
- **Decoupled Pricing:** Recycler prices never retroactively modify household settlements.
- **Dispatch Order:** Generates shipment gate pass QR and vehicle manifest.

### 6. Admin Command Center & AI Management
- **EcoFlow Command Map (GIS):** Interactive Canvas GIS map with pan/zoom, service zones A/B/C/D, color-coded pins (Green collector, Blue pickup, Orange pending, Red urgent, Purple hub, Dark green recycler), animated route pulse, and real-time inspector sidebar.
- **AI Model Versioning:** Active model badge (`EcoFlow-Waste-v1.0`), categories (20+), version history (`v0.9`, `v1.0`, `v1.1`), metrics (Accuracy 94.2%, F1 0.920), and live model tester.
- **AI Feedback Dataset Loop:** Pairs hub verifications with AI predictions for validation and retraining datasets.
- **End-to-End Digital Traceability Explorer:** Full 10-step digital provenance chain.
- **Immutable Chronological Audit Trail:** Comprehensive event log.

---

## 🚀 26-Step Complete Judge Tour (Section 53)

A sticky top navigation bar lets any judge or reviewer walk through all 26 steps:
1. Register / View Household Dashboard
2. Select Language (Hindi/Assamese/Bengali/English)
3. Scan Waste (Local AI Camera/Presets)
4. See Local AI Assessment
5. See Segregation Score
6. Enter Estimated Weight
7. See Indicative Price
8. Confirm Location on Interactive Map
9. Request Pickup (`PR-2026-000842`)
10. Assign Collector (Operational Rules)
11. Phone-Less Collector Workflow (Mode 3)
12. Create Digital Waste Lot (`LOT-2026-000184`)
13. Generate QR Traceability Code
14. Scan Lot at Storage Hub
15. Verify Material (Hub is Final Authority)
16. Enter Verified Weight (Physical Scale)
17. Compare Estimated vs Verified Weight
18. Trigger Congratulations Popup (`MATCH`)
19. Calculate Household Settlement
20. Generate Transparent Digital Receipt
21. Add Verified Material to Inventory
22. Aggregate Lots into Industrial Batch
23. Display Recycler Offers & Bids
24. Create Recycler Sale (Pricing Decoupled)
25. Dispatch Material (Gate Pass QR)
26. Show Complete Digital Traceability Chain

---

## 💻 Running Locally

### Option 1: Python Web Server with SQLite
```bash
cd C:\Users\LOQ\.gemini\antigravity-ide\scratch\ecoflow-ai
python server.py 8080
```
Open **`http://localhost:8080`** in your browser.

### Option 2: Standalone File Execution (Zero Dependencies)
You can directly double-click or open:
`C:\Users\LOQ\.gemini\antigravity-ide\scratch\ecoflow-ai\static\index.html`
in Chrome, Edge, or Firefox. The built-in offline-first engine will seamlessly serve all data, maps, scanner models, and workflows!

---

## 🧪 Automated Test Suite
To verify database integrity and business logic assertions:
```bash
python test_runner.py
```
Outputs:
- PASS: Scenario 1 Pickup PR-2026-000842 found.
- PASS: Scenario 1 Verification LOT-2026-000184 verified weight = 10.0kg (Status: MATCH).
- PASS: Scenario 2 Verification LOT-2026-000185 verified weight = 7.8kg (Status: DIFFERENCE).
- PASS: Local AI inference result: Copper Wires & Scrap (Confidence: 93.8%, Segregation: 89/100).
- PASS: Independent Household Settlement: INR 5044.0 decoupled from Recycler downstream offer.
