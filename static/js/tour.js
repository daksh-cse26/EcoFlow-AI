/**
 * EcoFlow AI - 26-Step Complete Judge & Evaluator Guided Tour
 * Section 53: Complete Demo Journey
 */

class JudgeTourController {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 26;
    this.steps = [
      { id: 1, title: "Register / View Household", view: "household", desc: "View Household Dashboard with verified recycling impact counters." },
      { id: 2, title: "Select Language (Hindi/Assamese/Bengali/English)", view: "household", desc: "Switch UI language using localization keys architecture." },
      { id: 3, title: "Scan Waste (Local AI Camera/Presets)", view: "scanner", desc: "Open Local AI Waste Scanner with regional Indian scrap presets." },
      { id: 4, title: "See Local AI Assessment", view: "scanner", desc: "Inspect detected material (Copper Wires & PCB), confidence %, and disclaimer." },
      { id: 5, title: "See Segregation Score", view: "scanner", desc: "View 88/100 segregation score and actionable advice before collection." },
      { id: 6, title: "Enter Estimated Weight", view: "scanner", desc: "Household declares estimated weight (10 kg). Stored as user_estimated_weight." },
      { id: 7, title: "See Indicative Price", view: "scanner", desc: "Shows indicative valuation (₹5,800) based on configured admin rate card." },
      { id: 8, title: "Confirm Location on Interactive Map", view: "pickup_form", desc: "Household moves pin on private interactive map and adds landmark." },
      { id: 9, title: "Request Pickup (PR-2026-000842)", view: "pickup_form", desc: "Generate official pickup request with preferred time slot." },
      { id: 10, title: "Assign Collector (Operational Rules)", view: "coordinator", desc: "Coordinator views candidates matched by zone, distance, and workload." },
      { id: 11, title: "Phone-Less Collector Workflow (Mode 3)", view: "coordinator", desc: "Demonstrate basic SMS and physical field coordinator dispatch." },
      { id: 12, title: "Create Digital Waste Lot (LOT-2026-000184)", view: "collector", desc: "Collector weighs and seals scrap lot, binding customer and pickup ID." },
      { id: 13, title: "Generate QR Traceability Code", view: "collector", desc: "Unique QR code stamped on digital lot for end-to-end provenance." },
      { id: 14, title: "Scan Lot at Storage Hub", view: "hub", desc: "Storage hub operator scans QR code to retrieve digital lot manifest." },
      { id: 15, title: "Verify Material (Hub is Final Authority)", view: "hub", desc: "Operator inspects and segregates Copper Scrap (7.9kg) and PCB (2.1kg)." },
      { id: 16, title: "Enter Verified Weight (Physical Scale)", view: "hub", desc: "Enter physical scale weighment (10.0 kg). Source of truth recorded." },
      { id: 17, title: "Compare Estimated vs Verified Weight", view: "hub", desc: "Engine evaluates weight difference against configurable ±5% tolerance." },
      { id: 18, title: "Trigger Congratulations Popup (MATCH)", view: "hub", desc: "Trigger 'Leaner & Greener' celebration popup for matching weights!" },
      { id: 19, title: "Calculate Household Settlement", view: "settlement", desc: "Calculated strictly using Verified Weight × Buying Rate (₹5,044)." },
      { id: 20, title: "Generate Transparent Digital Receipt", view: "settlement", desc: "Generate audit-backed receipt with formula, grade, and lot reference." },
      { id: 21, title: "Add Verified Material to Inventory", view: "inventory", desc: "Verified materials enter hub inventory with AVAILABLE status." },
      { id: 22, title: "Aggregate Lots into Industrial Batch", view: "inventory", desc: "Combine multiple lots into 500kg PET / Copper Batch with traceability." },
      { id: 23, title: "Display Recycler Offers & Bids", view: "recycler", desc: "View purchase offers from authorized recyclers (e.g. GreenPlast)." },
      { id: 24, title: "Create Recycler Sale (Pricing Decoupled)", view: "recycler", desc: "Execute downstream sale without altering household settlement." },
      { id: 25, title: "Dispatch Material (Gate Pass QR)", view: "recycler", desc: "Generate dispatch manifest, vehicle record, and driver gate pass." },
      { id: 26, title: "Show Complete Digital Traceability Chain", view: "traceability", desc: "Inspect 10-step full audit chain from Household to Recycler Dispatch!" }
    ];
  }

  goToStep(stepNum) {
    if (stepNum < 1 || stepNum > this.totalSteps) return;
    this.currentStep = stepNum;
    const step = this.steps[stepNum - 1];

    // Update Tour Bar UI
    const stepBadge = document.getElementById("tour-step-badge");
    const stepTitle = document.getElementById("tour-step-title");
    const stepDesc = document.getElementById("tour-step-desc");
    const selectEl = document.getElementById("tour-step-select");

    if (stepBadge) stepBadge.textContent = `Step ${step.id} of ${this.totalSteps}`;
    if (stepTitle) stepTitle.textContent = step.title;
    if (stepDesc) stepDesc.textContent = step.desc;
    if (selectEl) selectEl.value = step.id;

    // Trigger associated perspective & action
    this.executeStepAction(step);
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.goToStep(this.currentStep + 1);
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    }
  }

  executeStepAction(step) {
    switch (step.id) {
      case 1:
        switchPerspective('household');
        switchHouseholdTab('home');
        break;
      case 2:
        switchPerspective('household');
        setLanguage('hi');
        setTimeout(() => setLanguage('en'), 1500);
        break;
      case 3:
        switchPerspective('household');
        switchHouseholdTab('scan');
        break;
      case 4:
      case 5:
      case 6:
      case 7:
        switchPerspective('household');
        switchHouseholdTab('scan');
        selectScannerPreset('COPPER_SCRAP');
        break;
      case 8:
      case 9:
        switchPerspective('household');
        openPickupModal();
        break;
      case 10:
      case 11:
        switchPerspective('coordinator');
        break;
      case 12:
      case 13:
        switchPerspective('collector');
        break;
      case 14:
      case 15:
      case 16:
      case 17:
        switchPerspective('hub');
        break;
      case 18:
        settlementEngine.showCelebrationModal({
          user_estimated_weight: 10.0,
          verified_weight: 10.0,
          tolerance_used: 5.0
        });
        break;
      case 19:
      case 20:
        switchPerspective('household');
        switchHouseholdTab('settlement');
        break;
      case 21:
      case 22:
        switchPerspective('admin');
        switchAdminTab('inventory');
        break;
      case 23:
      case 24:
      case 25:
        switchPerspective('recycler');
        break;
      case 26:
        switchPerspective('admin');
        switchAdminTab('traceability');
        loadTraceabilityChain('LOT-2026-000184');
        break;
    }
  }

  renderStepDropdown() {
    const selectEl = document.getElementById("tour-step-select");
    if (!selectEl) return;
    selectEl.innerHTML = this.steps.map(s => `
      <option value="${s.id}">Step ${s.id}: ${s.title}</option>
    `).join("");
  }
}

const judgeTour = new JudgeTourController();
