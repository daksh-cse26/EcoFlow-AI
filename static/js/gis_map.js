/**
 * EcoFlow AI - Interactive GIS Command Map Engine
 * Sections 13, 14, 15, 16, 41, 42, 43
 * "EcoFlow Command Center" & Household Location Picker
 */

class GISMapEngine {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.mode = options.mode || "command"; // 'command' or 'household_picker'

    // Map geographic bounds (Guwahati / Kamrup Metro Center)
    this.centerLat = 26.1750;
    this.centerLng = 26.1750 ? 91.7700 : 91.7700;
    this.zoom = options.zoom || 14;

    // Viewport pan offsets
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;

    // Layer toggles
    this.layers = {
      zones: true,
      pickups: true,
      collectors: true,
      hubs: true,
      recyclers: true,
      routes: true,
      heatmap: false
    };

    // Filter criteria
    this.filters = {
      zone: "ALL",
      status: "ALL"
    };

    // Household draggable pin position
    this.householdPin = {
      lat: 26.1795,
      lng: 91.7685,
      address: "House 14, Peace Enclave, Paltan Bazaar, Guwahati",
      landmark: "Opposite State Library",
      zone: "ZONE B"
    };

    // Active inspection item
    this.selectedEntity = null;
    this.onSelectCallback = options.onSelect || null;

    // Data cache
    this.zonesData = [];
    this.hubsData = [];
    this.employeesData = [];
    this.pickupsData = [];
    this.recyclersData = [];

    this.initEvents();
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width * (window.devicePixelRatio || 1);
    this.canvas.height = (rect.height || 520) * (window.devicePixelRatio || 1);
    this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    this.render();
  }

  loadData(payload) {
    if (payload.zones) this.zonesData = payload.zones;
    if (payload.hubs) this.hubsData = payload.hubs;
    if (payload.employees) this.employeesData = payload.employees;
    if (payload.pickups) this.pickupsData = payload.pickups;
    if (payload.recyclers) this.recyclersData = payload.recyclers;
    this.render();
  }

  initEvents() {
    this.canvas.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this.startX = e.offsetX - this.panX;
      this.startY = e.offsetY - this.panY;
    });

    window.addEventListener("mouseup", () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (this.isDragging) {
        this.panX = e.offsetX - this.startX;
        this.panY = e.offsetY - this.startY;
        this.render();
      }
    });

    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      this.zoom = Math.min(22, Math.max(8, this.zoom * zoomFactor));
      this.render();
    });

    this.canvas.addEventListener("click", (e) => {
      this.handleClick(e.offsetX, e.offsetY);
    });
  }

  geoToPixel(lat, lng) {
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Mercator approximation for localized regional coordinate space
    const scale = this.zoom * 2500;
    const x = width / 2 + (lng - this.centerLng) * scale + this.panX;
    const y = height / 2 - (lat - this.centerLat) * scale + this.panY;
    return { x, y };
  }

  pixelToGeo(x, y) {
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const scale = this.zoom * 2500;

    const lng = (x - width / 2 - this.panX) / scale + this.centerLng;
    const lat = this.centerLat - (y - height / 2 - this.panY) / scale;
    return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
  }

  render() {
    if (!this.ctx || !this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    this.ctx.clearRect(0, 0, w, h);

    // 1. Draw Map Background (Sleek dark/light styled GIS surface)
    this.drawBaseMap(w, h);

    // 2. Draw Service Zones
    if (this.layers.zones) {
      this.drawServiceZones();
    }

    // 3. Draw Heatmap (Density of scrap collection)
    if (this.layers.heatmap) {
      this.drawHeatmap();
    }

    // 4. Draw Active Collector Routes
    if (this.layers.routes) {
      this.drawRoutes();
    }

    // 5. Draw Recyclers (Dark Green)
    if (this.layers.recyclers) {
      this.drawRecyclers();
    }

    // 6. Draw Storage Hubs (Purple)
    if (this.layers.hubs) {
      this.drawHubs();
    }

    // 7. Draw Pickups (Blue/Orange/Red)
    if (this.layers.pickups) {
      this.drawPickups();
    }

    // 8. Draw Collectors (Green)
    if (this.layers.collectors) {
      this.drawCollectors();
    }

    // 9. If Household Picker mode: Draw draggable customer marker
    if (this.mode === "household_picker") {
      this.drawHouseholdMarker();
    }

    // 10. Map HUD overlay (Compass, Scale, Current Zone info)
    this.drawHUD(w, h);
  }

  drawBaseMap(w, h) {
    const ctx = this.ctx;
    ctx.fillStyle = "#0B1512"; // Deep ecological dark slate
    ctx.fillRect(0, 0, w, h);

    // Grid lines for geospatial grid
    ctx.strokeStyle = "rgba(16, 185, 129, 0.08)";
    ctx.lineWidth = 1;
    const gridSize = 40 * (this.zoom / 14);

    const offsetX = (this.panX % gridSize);
    const offsetY = (this.panY % gridSize);

    for (let x = offsetX; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = offsetY; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Simulated arterial roadways and river contour (Brahmaputra bend)
    this.drawMajorRoads();
  }

  drawMajorRoads() {
    const ctx = this.ctx;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 3;

    // Roadway nodes
    const roads = [
      [[26.195, 91.730], [26.185, 91.755], [26.178, 91.770], [26.165, 91.815]], // GS Road artery
      [[26.182, 91.745], [26.175, 91.775], [26.140, 91.790]], // Zoo Road artery
      [[26.192, 91.740], [26.188, 91.770], [26.170, 91.825]]  // Ring bypass
    ];

    roads.forEach(coords => {
      ctx.beginPath();
      coords.forEach((c, idx) => {
        const pt = this.geoToPixel(c[0], c[1]);
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
    });
  }

  drawServiceZones() {
    const ctx = this.ctx;
    const zones = [
      { id: "ZONE A", name: "Zone A: North Kamrup", color: "rgba(59, 130, 246, 0.12)", border: "#3B82F6", lat: 26.1850, lng: 91.7500, r: 85 },
      { id: "ZONE B", name: "Zone B: Paltan & Panbazar", color: "rgba(16, 185, 129, 0.12)", border: "#10B981", lat: 26.1800, lng: 91.7700, r: 90 },
      { id: "ZONE C", name: "Zone C: Dispur Capital", color: "rgba(245, 158, 11, 0.12)", border: "#F59E0B", lat: 26.1400, lng: 91.7900, r: 80 },
      { id: "ZONE D", name: "Zone D: Narangi Industrial", color: "rgba(168, 85, 247, 0.12)", border: "#A855F7", lat: 26.1600, lng: 91.8200, r: 95 }
    ];

    zones.forEach(z => {
      if (this.filters.zone !== "ALL" && this.filters.zone !== z.id) return;

      const pt = this.geoToPixel(z.lat, z.lng);
      const rad = z.r * (this.zoom / 14);

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, rad, 0, Math.PI * 2);
      ctx.fillStyle = z.color;
      ctx.fill();
      ctx.strokeStyle = z.border;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = z.border;
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(z.id, pt.x - 20, pt.y - rad + 14);
    });
  }

  drawRoutes() {
    const ctx = this.ctx;
    // Route from Collector COL-00142 -> PR-2026-000842 -> PR-2026-000843 -> HUB-001
    const routePoints = [
      { lat: 26.1795, lng: 91.7680 }, // Collector
      { lat: 26.1792, lng: 91.7695 }, // Pickup A (PR-2026-000842)
      { lat: 26.1825, lng: 91.7660 }, // Pickup B (PR-2026-000843)
      { lat: 26.1780, lng: 91.7650 }  // Central Hub HUB-001
    ];

    ctx.beginPath();
    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);

    routePoints.forEach((p, idx) => {
      const pt = this.geoToPixel(p.lat, p.lng);
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Animated pulsing flow dot along route
    const now = Date.now() / 1000;
    const seg = Math.floor(now % (routePoints.length - 1));
    const subT = (now % 1);
    const p1 = this.geoToPixel(routePoints[seg].lat, routePoints[seg].lng);
    const p2 = this.geoToPixel(routePoints[seg + 1].lat, routePoints[seg + 1].lng);
    const flowX = p1.x + (p2.x - p1.x) * subT;
    const flowY = p1.y + (p2.y - p1.y) * subT;

    ctx.beginPath();
    ctx.arc(flowX, flowY, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#34D399";
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  drawHeatmap() {
    const ctx = this.ctx;
    const hotspots = [
      { lat: 26.1795, lng: 91.7690, intensity: 0.45 },
      { lat: 26.1820, lng: 91.7640, intensity: 0.35 },
      { lat: 26.1410, lng: 91.7870, intensity: 0.30 }
    ];

    hotspots.forEach(h => {
      const pt = this.geoToPixel(h.lat, h.lng);
      const rad = 60 * (this.zoom / 14);
      const grad = ctx.createRadialGradient(pt.x, pt.y, 5, pt.x, pt.y, rad);
      grad.addColorStop(0, "rgba(239, 68, 68, 0.45)");
      grad.addColorStop(0.5, "rgba(245, 158, 11, 0.25)");
      grad.addColorStop(1, "rgba(16, 185, 129, 0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, rad, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  drawPickups() {
    const ctx = this.ctx;
    const pickups = this.pickupsData.length ? this.pickupsData : [
      { pickup_id: "PR-2026-000842", household_name: "Demo Household", lat: 26.1792, lng: 91.7695, status: "VERIFIED", preliminary_material: "Copper Scrap", user_estimated_weight: 10.0, service_zone: "ZONE B" },
      { pickup_id: "PR-2026-000843", household_name: "Ananya Baruah", lat: 26.1825, lng: 91.7660, status: "VERIFIED", preliminary_material: "Copper Cables", user_estimated_weight: 10.0, service_zone: "ZONE B" },
      { pickup_id: "PR-2026-000844", household_name: "Meenakshi Devi", lat: 26.1740, lng: 91.7760, status: "PENDING", preliminary_material: "Newspaper & Cardboard", user_estimated_weight: 25.0, service_zone: "ZONE B" }
    ];

    pickups.forEach(p => {
      if (this.filters.zone !== "ALL" && this.filters.zone !== p.service_zone) return;
      const pt = this.geoToPixel(p.lat, p.lng);

      // Section 16 Color Coding: Blue = Request, Orange = Pending, Red = Urgent, Green = Verified
      let color = "#3B82F6"; // Blue
      if (p.status === "PENDING") color = "#F97316"; // Orange
      else if (p.status === "URGENT") color = "#EF4444"; // Red
      else if (p.status === "VERIFIED") color = "#10B981"; // Green

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pin badge
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 9px sans-serif";
      ctx.fillText("P", pt.x - 3, pt.y + 3);

      // Label
      ctx.fillStyle = "#E2E8F0";
      ctx.font = "10px sans-serif";
      ctx.fillText(p.pickup_id, pt.x + 12, pt.y + 3);
    });
  }

  drawCollectors() {
    const ctx = this.ctx;
    const collectors = this.employeesData.length ? this.employeesData : [
      { employee_id: "COL-00142", name: "Rameshwar Boro", lat: 26.1795, lng: 91.7680, mode: "smartphone", availability: "AVAILABLE", service_zone: "ZONE B" },
      { employee_id: "COL-00156", name: "Abdul Karim", lat: 26.1820, lng: 91.7620, mode: "basic_phone", availability: "AVAILABLE", service_zone: "ZONE B" },
      { employee_id: "COL-00173", name: "Dhaniram Deka", lat: 26.1760, lng: 91.7720, mode: "no_phone", availability: "AVAILABLE", service_zone: "ZONE B" }
    ];

    collectors.forEach(c => {
      if (this.filters.zone !== "ALL" && this.filters.zone !== c.service_zone) return;
      const pt = this.geoToPixel(c.current_lat || c.lat, c.current_lng || c.lng);

      // Section 16: Green for available collector with pulse
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(16, 185, 129, 0.25)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#10B981";
      ctx.fill();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Mode icon badge
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 9px sans-serif";
      const badge = c.mode === "smartphone" ? "📱" : (c.mode === "basic_phone" ? "✉️" : "👤");
      ctx.fillText(badge, pt.x - 5, pt.y + 4);

      // Label
      ctx.fillStyle = "#A7F3D0";
      ctx.font = "10px sans-serif";
      ctx.fillText(`${c.employee_id} (${c.name.split(' ')[0]})`, pt.x + 12, pt.y + 3);
    });
  }

  drawHubs() {
    const ctx = this.ctx;
    const hubs = this.hubsData.length ? this.hubsData : [
      { hub_id: "HUB-001", name: "Central Sorting Hub", lat: 26.1780, lng: 91.7650, capacity_kg: 10000, current_load_kg: 3420 },
      { hub_id: "HUB-002", name: "North Kamrup Station", lat: 26.1920, lng: 91.7420, capacity_kg: 8000, current_load_kg: 1850 }
    ];

    hubs.forEach(h => {
      const pt = this.geoToPixel(h.lat, h.lng);

      // Section 16: Purple for Storage Hub
      ctx.beginPath();
      ctx.rect(pt.x - 9, pt.y - 9, 18, 18);
      ctx.fillStyle = "#8B5CF6";
      ctx.fill();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 9px sans-serif";
      ctx.fillText("H", pt.x - 3, pt.y + 4);

      ctx.fillStyle = "#DDD6FE";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText(h.hub_id, pt.x + 14, pt.y + 3);
    });
  }

  drawRecyclers() {
    const ctx = this.ctx;
    const recyclers = this.recyclersData.length ? this.recyclersData : [
      { recycler_id: "REC-001", org_name: "Pragati Metal Refiners", lat: 26.1620, lng: 91.8240 },
      { recycler_id: "REC-002", org_name: "GreenPlast Solutions", lat: 26.1980, lng: 91.7380 },
      { recycler_id: "REC-003", org_name: "IndoTech E-Waste", lat: 26.1550, lng: 91.8100 }
    ];

    recyclers.forEach(r => {
      const pt = this.geoToPixel(r.lat, r.lng);

      // Section 16: Dark Green for Recycler
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 9, 0, Math.PI * 2);
      ctx.fillStyle = "#064E3B";
      ctx.fill();
      ctx.strokeStyle = "#34D399";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#34D399";
      ctx.font = "bold 9px sans-serif";
      ctx.fillText("R", pt.x - 3, pt.y + 3);

      ctx.fillStyle = "#A7F3D0";
      ctx.font = "10px sans-serif";
      ctx.fillText(r.recycler_id, pt.x + 12, pt.y + 3);
    });
  }

  drawHouseholdMarker() {
    const ctx = this.ctx;
    const pt = this.geoToPixel(this.householdPin.lat, this.householdPin.lng);

    // Draggable / selected household pin
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 16, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(16, 185, 129, 0.35)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#10B981";
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("📍", pt.x - 6, pt.y + 4);

    // Callout badge
    ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 1;
    ctx.fillRect(pt.x - 85, pt.y - 45, 170, 26);
    ctx.strokeRect(pt.x - 85, pt.y - 45, 170, 26);

    ctx.fillStyle = "#F8FAFC";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("📍 Click Map to Move Pin", pt.x - 75, pt.y - 28);
  }

  drawHUD(w, h) {
    const ctx = this.ctx;
    // Map Legend Bar
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.fillRect(12, h - 38, w - 24, 28);
    ctx.strokeRect(12, h - 38, w - 24, 28);

    const legendItems = [
      { color: "#10B981", label: "Collector (Green)" },
      { color: "#3B82F6", label: "Pickup Req (Blue)" },
      { color: "#F97316", label: "Pending (Orange)" },
      { color: "#8B5CF6", label: "Hub (Purple)" },
      { color: "#064E3B", label: "Recycler (Dk Green)" }
    ];

    let curX = 24;
    ctx.font = "11px sans-serif";
    legendItems.forEach(item => {
      ctx.beginPath();
      ctx.arc(curX, h - 24, 5, 0, Math.PI * 2);
      ctx.fillStyle = item.color;
      ctx.fill();

      ctx.fillStyle = "#E2E8F0";
      ctx.fillText(item.label, curX + 10, h - 20);
      curX += ctx.measureText(item.label).width + 30;
    });

    // Zoom Indicator
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(w - 75, 14, 60, 24);
    ctx.fillStyle = "#A7F3D0";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(`Zoom: ${this.zoom.toFixed(1)}x`, w - 70, 30);
  }

  handleClick(px, py) {
    if (this.mode === "household_picker") {
      const geo = this.pixelToGeo(px, py);
      this.householdPin.lat = geo.lat;
      this.householdPin.lng = geo.lng;

      // Update input fields
      const latEl = document.getElementById("pickup-lat");
      const lngEl = document.getElementById("pickup-lng");
      if (latEl) latEl.value = geo.lat;
      if (lngEl) lngEl.value = geo.lng;

      this.render();
      return;
    }

    // Command map click detection on pins
    let clicked = null;

    // Check pickups
    const pickups = this.pickupsData.length ? this.pickupsData : [
      { pickup_id: "PR-2026-000842", household_name: "Demo Household", lat: 26.1792, lng: 91.7695, status: "VERIFIED", preliminary_material: "Copper Scrap", user_estimated_weight: 10.0, service_zone: "ZONE B" }
    ];
    for (let p of pickups) {
      const pt = this.geoToPixel(p.lat, p.lng);
      if (Math.hypot(pt.x - px, pt.y - py) < 14) {
        clicked = { type: "PICKUP", data: p };
        break;
      }
    }

    // Check collectors
    if (!clicked) {
      const collectors = this.employeesData.length ? this.employeesData : [
        { employee_id: "COL-00142", name: "Rameshwar Boro", lat: 26.1795, lng: 91.7680, mode: "smartphone", availability: "AVAILABLE", service_zone: "ZONE B", workload: 1 }
      ];
      for (let c of collectors) {
        const pt = this.geoToPixel(c.current_lat || c.lat, c.current_lng || c.lng);
        if (Math.hypot(pt.x - px, pt.y - py) < 14) {
          clicked = { type: "COLLECTOR", data: c };
          break;
        }
      }
    }

    // Check hubs
    if (!clicked) {
      const hubs = this.hubsData.length ? this.hubsData : [
        { hub_id: "HUB-001", name: "Central Sorting Hub", lat: 26.1780, lng: 91.7650, capacity_kg: 10000, current_load_kg: 3420, service_zone: "ZONE B" }
      ];
      for (let h of hubs) {
        const pt = this.geoToPixel(h.lat, h.lng);
        if (Math.hypot(pt.x - px, pt.y - py) < 16) {
          clicked = { type: "HUB", data: h };
          break;
        }
      }
    }

    if (clicked) {
      this.selectedEntity = clicked;
      this.renderInspector(clicked);
      if (this.onSelectCallback) this.onSelectCallback(clicked);
    }
  }

  renderInspector(entity) {
    const inspectorEl = document.getElementById("map-inspector-content");
    if (!inspectorEl) return;

    if (entity.type === "PICKUP") {
      const p = entity.data;
      inspectorEl.innerHTML = `
        <div class="inspector-card">
          <div class="inspector-badge badge-blue">PICKUP REQUEST</div>
          <h4>${p.pickup_id}</h4>
          <p class="inspector-sub">Citizen: <strong>${p.household_name}</strong></p>
          <div class="inspector-grid">
            <div><span class="lbl">Zone:</span> <strong>${p.service_zone}</strong></div>
            <div><span class="lbl">Status:</span> <span class="status-pill status-${p.status.toLowerCase()}">${p.status}</span></div>
            <div><span class="lbl">Material:</span> <strong>${p.preliminary_material}</strong></div>
            <div><span class="lbl">User Est. Weight:</span> <strong>${p.user_estimated_weight} kg</strong></div>
            <div><span class="lbl">Assigned Collector:</span> <strong>${p.assigned_employee || 'COL-00142 (Rameshwar)'}</strong></div>
          </div>
          <button class="btn btn-sm btn-outline" onclick="loadTraceabilityChain('${p.pickup_id}')">🔍 Trace Full Chain</button>
        </div>
      `;
    } else if (entity.type === "COLLECTOR") {
      const c = entity.data;
      inspectorEl.innerHTML = `
        <div class="inspector-card">
          <div class="inspector-badge badge-green">FIELD COLLECTOR</div>
          <h4>${c.name}</h4>
          <p class="inspector-sub">ID: <strong>${c.employee_id}</strong> (${c.mode.toUpperCase()})</p>
          <div class="inspector-grid">
            <div><span class="lbl">Zone:</span> <strong>${c.service_zone}</strong></div>
            <div><span class="lbl">Availability:</span> <span class="status-pill status-available">${c.availability}</span></div>
            <div><span class="lbl">Current Workload:</span> <strong>${c.workload || 1} Active Tasks</strong></div>
            <div><span class="lbl">Assigned Hub:</span> <strong>HUB-001</strong></div>
          </div>
          <p class="small text-muted mt-2">Mode: ${c.mode === 'no_phone' ? 'Physical dispatch via Field Coordinator' : (c.mode === 'basic_phone' ? 'SMS Task Dispatch' : 'Smartphone Collector App')}</p>
        </div>
      `;
    } else if (entity.type === "HUB") {
      const h = entity.data;
      inspectorEl.innerHTML = `
        <div class="inspector-card">
          <div class="inspector-badge badge-purple">STORAGE HUB</div>
          <h4>${h.name}</h4>
          <p class="inspector-sub">ID: <strong>${h.hub_id}</strong> (${h.service_zone})</p>
          <div class="inspector-grid">
            <div><span class="lbl">Capacity:</span> <strong>${h.capacity_kg} kg</strong></div>
            <div><span class="lbl">Current Load:</span> <strong>${h.current_load_kg} kg</strong></div>
            <div><span class="lbl">Utilization:</span> <strong>${((h.current_load_kg / h.capacity_kg) * 100).toFixed(1)}%</strong></div>
            <div><span class="lbl">Operator:</span> <strong>Manoj Kalita</strong></div>
          </div>
          <button class="btn btn-sm btn-outline mt-2" onclick="switchPerspective('hub')">Open Hub Station</button>
        </div>
      `;
    }
  }

  setFilter(key, val) {
    this.filters[key] = val;
    this.render();
  }

  toggleLayer(layerName, enabled) {
    this.layers[layerName] = enabled;
    this.render();
  }

  zoomIn() {
    this.zoom = Math.min(22, this.zoom * 1.2);
    this.render();
  }

  zoomOut() {
    this.zoom = Math.max(8, this.zoom * 0.8);
    this.render();
  }

  resetView() {
    this.panX = 0;
    this.panY = 0;
    this.zoom = 14;
    this.render();
  }
}
