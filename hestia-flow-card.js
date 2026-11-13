/*
 * Hestia Flow Card  v0.0.1
 * A full-screen animated flow card for a heating boiler in Home Assistant.
 *
 * This is my FIRST attempt at a Home Assistant card - please be kind and
 * report anything that does not work: it will be fixed in the next versions.
 * Made by Mouxritsa together with Claude (AI by Anthropic).
 *
 * Languages: Greek (el) · English (en) · German (de) - automatic, follows the Home Assistant language.
 *
 * THE CARD IS GRAPHIC ONLY.
 * It draws what is happening. The real control of the boiler (relays, compensation, Turbo)
 * is done by Home Assistant automations - see the README and docs/COMPENSATION.md.
 *
 * ======================================================================
 *  CONFIG EXAMPLE  (every { ... } is the place where YOU put your own entity)
 * ======================================================================
 *  type: custom:hestia-flow-card
 *  name: Boiler                      # { title of the card }
 *
 *  # --- Temperatures (sensor) ------------------------------------------
 *  outdoor_temp: sensor.xxx          # { your outdoor temperature sensor }
 *  supply_temp:  sensor.xxx          # { boiler SUPPLY / outlet water temperature sensor }
 *  return_temp:  sensor.xxx          # { boiler RETURN / inlet water temperature sensor }
 *  boiler_temp:  sensor.xxx          # { optional: boiler body temperature sensor }
 *
 *  # --- Heating request ------------------------------------------------
 *  climate_entity: climate.xxx       # { your room thermostat (climate) - gives the + / - buttons }
 *  demand_entity: binary_sensor.xxx  # { binary_sensor: ON when the room thermostat is calling for heat }
 *  target_temp: sensor.xxx           # { optional: sensor with the water temperature your compensation asks from the boiler, in °C }
 *
 *  # --- Relays (switch) ------------------------------------------------
 *  relay6: switch.xxx                # { switch that lets the boiler burn (in series with the room thermostat) }
 *  relay7: switch.xxx                # { switch for Turbo (wired in parallel, forces the boiler on) }
 *  turbo_entity: input_boolean.xxx   # { input_boolean (or switch) that the Turbo button toggles }
 *  confirm_turbo: true               # ask "are you sure?" before Turbo changes
 *
 *  # --- What do you have? (true / false) -------------------------------
 *  has_radiators: true               # radiators
 *  has_boiler: true                  # hot-water tank
 *  has_underfloor: false             # underfloor heating
 *  has_triodos: false                # draw 3-way valve 1 (radiators / hot-water tank)
 *  has_triodos_uf: false             # draw 3-way valve 2 (underfloor)
 *
 *  # --- Optional extras ------------------------------------------------
 *  underfloor_entity: input_boolean.xxx  # { optional: input_boolean/switch for the UNDERFLOOR button (on = underfloor, off = radiators). Without it the button remembers the choice in the browser }
 *  underfloor_max_temp: 40           # highest supply water (°C) allowed to go to the underfloor (default 40)
 *  triodos_entity: switch.xxx        # { optional: real sensor/switch of 3-way valve 1 (on = radiators, off = hot-water tank). Without it the valve is virtual }
 *  triodos_uf_entity: switch.xxx     # { optional: real sensor/switch of 3-way valve 2 (on = underfloor open). Without it the valve is virtual }
 *  circulator_entity: switch.xxx     # { optional: your circulator pump switch. Without it the pump is drawn spinning when supply >= 40 °C }
 *  neon_text: My Name                # { your own name in neon letters; empty = hidden; not set = "By Mouxritsa" }
 * ======================================================================
 */

const LFC_TR = {
  el: {
    defaultName: "Λέβητας",
    outdoor: "ΕΞΩΤΕΡΙΚΗ ΘΕΡΜΟΚΡΑΣΙΑ",
    thermostat: "ΘΕΡΜΟΣΤΑΤΗΣ",
    room: "Δωμάτιο",
    supply: "ΕΞΑΓΩΓΗ",
    ret: "ΕΙΣΑΓΩΓΗ",
    requested: "ΖΗΤΑΜΕ ΑΠΟ ΤΟΝ ΛΕΒΗΤΑ",
    noRequest: "ΚΑΜΙΑ ΖΗΤΗΣΗ",
    bodyTemp: "Σώμα λέβητα",
    waiting40: "ΠΕΡΙΜΕΝΕΙ 40°C",
    trio: "ΤΡΙΟΔΟΣ",
    trio2: "ΤΡΙΟΔΟΣ 2",
    ufBlocked: "Νερό πάνω από το όριο",
    ufLimit: "Το νερό είναι πάνω από το όριο ({max} °C, τώρα {now} °C) — δεν μπορεί να πάει στην ενδοδάπεδια.",
    toRad: "→ Σώματα",
    toBoil: "→ Boiler",
    toBoth: "Σώματα + Boiler",
    toUf: "→ Ενδοδάπεδια",
    radiators: "ΣΩΜΑΤΑ",
    open: "ΤΡΙΟΔΟΣ ΑΝΟΙΧΤΗ",
    closed: "ΤΡΙΟΔΟΣ ΚΛΕΙΣΤΗ",
    boilerBox: "BOILER",
    underfloor: "ΕΝΔΟΔΑΠΕΔΙΑ",
    running: "ΔΟΥΛΕΥΕΙ",
    waitingHeat: "ΠΕΡΙΜΕΝΕΙ ΘΕΡΜΑΝΣΗ",
    off: "ΣΒΗΣΤΟ",
    limit: "όριο 70 °C",
    relayBoiler: "Λέβητας",
    relayTank: "Θερμοσίφωνας",
    active: "ΕΝΕΡΓΟΣ",
    inactive: "ΑΝΕΝΕΡΓΟΣ",
    notSet: "δεν ορίστηκε",
    demand: "Ζήτηση θέρμανσης",
    yes: "ΝΑΙ",
    no: "ΟΧΙ",
    target: "στόχος",
    turbo: "TURBO ΘΕΡΜΟΣΙΦΩΝΑΣ - BOILER",
    turboOn: "ΕΝΕΡΓΟ · πάτα για σβήσιμο",
    turboOff: "ΑΝΕΝΕΡΓΟ · πάτα για άναμμα",
    noTurbo: "Διάλεξε κουμπί Turbo στις ρυθμίσεις της κάρτας",
    askOff: "Να σβήσει το Turbo του θερμοσίφωνα;",
    askOn: "Να ανάψει το Turbo του θερμοσίφωνα;",
    cardName: "Κάρτα ροής λέβητα",
    cardDesc: "Λέβητας, boiler, σώματα, ενδοδάπεδα, τρίοδοι και Turbo με επιβεβαίωση",
  },
  en: {
    defaultName: "Boiler",
    outdoor: "OUTDOOR TEMPERATURE",
    thermostat: "THERMOSTAT",
    room: "Room",
    supply: "SUPPLY",
    ret: "RETURN",
    requested: "REQUESTED FROM BOILER",
    noRequest: "NO REQUEST",
    bodyTemp: "Boiler body",
    waiting40: "WAITING 40°C",
    trio: "3-WAY VALVE",
    trio2: "3-WAY 2",
    ufBlocked: "Water above limit",
    ufLimit: "Water is above the limit ({max} °C, now {now} °C) — it cannot go to the underfloor heating.",
    toRad: "→ Radiators",
    toBoil: "→ Hot water",
    toBoth: "Radiators + Hot water",
    toUf: "→ Underfloor",
    radiators: "RADIATORS",
    open: "VALVE OPEN",
    closed: "VALVE CLOSED",
    boilerBox: "HOT WATER",
    underfloor: "UNDERFLOOR",
    running: "RUNNING",
    waitingHeat: "WAITING FOR HEAT",
    off: "OFF",
    limit: "limit 70 °C",
    relayBoiler: "Boiler",
    relayTank: "Hot water tank",
    active: "ACTIVE",
    inactive: "INACTIVE",
    notSet: "not set",
    demand: "Heating demand",
    yes: "YES",
    no: "NO",
    target: "target",
    turbo: "TURBO HOT WATER TANK",
    turboOn: "ACTIVE · tap to turn off",
    turboOff: "INACTIVE · tap to turn on",
    noTurbo: "Choose the Turbo button in the card settings",
    askOff: "Turn the hot water Turbo off?",
    askOn: "Turn the hot water Turbo on?",
    cardName: "Boiler Flow Card",
    cardDesc: "Heating boiler, hot-water tank, radiators, underfloor, 3-way valves and Turbo with confirmation",
  },
  de: {
    defaultName: "Heizkessel",
    outdoor: "AUSSENTEMPERATUR",
    thermostat: "THERMOSTAT",
    room: "Raum",
    supply: "VORLAUF",
    ret: "RÜCKLAUF",
    requested: "ANFORDERUNG AN KESSEL",
    noRequest: "KEINE ANFORDERUNG",
    bodyTemp: "Kesselkörper",
    waiting40: "WARTET AUF 40°C",
    trio: "3-WEGE-VENTIL",
    trio2: "VENTIL 2",
    ufBlocked: "Wasser über Grenzwert",
    ufLimit: "Das Wasser liegt über dem Grenzwert ({max} °C, jetzt {now} °C) — es darf nicht in die Fußbodenheizung.",
    toRad: "→ Heizkörper",
    toBoil: "→ Warmwasser",
    toBoth: "Heizkörper + Warmwasser",
    toUf: "→ Fußboden",
    radiators: "HEIZKÖRPER",
    open: "VENTIL OFFEN",
    closed: "VENTIL ZU",
    boilerBox: "WARMWASSER",
    underfloor: "FUSSBODENHEIZUNG",
    running: "LÄUFT",
    waitingHeat: "WARTET AUF WÄRME",
    off: "AUS",
    limit: "Limit 70 °C",
    relayBoiler: "Heizkessel",
    relayTank: "Warmwasserspeicher",
    active: "AKTIV",
    inactive: "INAKTIV",
    notSet: "nicht gesetzt",
    demand: "Heizanforderung",
    yes: "JA",
    no: "NEIN",
    target: "Ziel",
    turbo: "TURBO WARMWASSERSPEICHER",
    turboOn: "AKTIV · zum Ausschalten tippen",
    turboOff: "INAKTIV · zum Einschalten tippen",
    noTurbo: "Wähle die Turbo-Taste in den Karteneinstellungen",
    askOff: "Warmwasser-Turbo ausschalten?",
    askOn: "Warmwasser-Turbo einschalten?",
    cardName: "Heizkessel-Flusskarte",
    cardDesc: "Heizkessel, Warmwasserspeicher, Heizkörper, Fußbodenheizung, 3-Wege-Ventile und Turbo mit Bestätigung",
  },
};

const LFC_LABELS = {
  el: {
    name: "Τίτλος",
    outdoor_temp: "Εξωτερική θερμοκρασία (sensor)",
    supply_temp: "Εξαγωγή λέβητα - παροχή (sensor)",
    return_temp: "Εισαγωγή λέβητα - επιστροφή (sensor)",
    boiler_temp: "Θερμοκρασία σώματος λέβητα (sensor, προαιρετικό)",
    climate_entity: "Θερμοστάτης δωματίου (climate) - για τα κουμπιά − / +",
    target_temp: "Στόχος αντιστάθμισης (sensor, προαιρετικό)",
    underfloor_entity: "Κουμπί ΕΝΔΟΔΑΠΕΔΙΑ - τρίοδος (input_boolean, προαιρετικό)",
    circulator_entity: "Κυκλοφορητής (switch, προαιρετικό)",
    demand_entity: "Ζήτηση θέρμανσης (binary_sensor)",
    relay6: "Ρελέ λέβητα (switch)",
    relay7: "Ρελέ Turbo θερμοσίφωνα (switch)",
    turbo_entity: "Κουμπί Turbo (input_boolean ή switch)",
    confirm_turbo: "Ερώτηση πριν αλλάξει το Turbo",
    has_radiators: "Έχω σώματα",
    has_boiler: "Έχω θερμοσίφωνα (boiler)",
    has_underfloor: "Έχω ενδοδάπεδια",
    has_triodos: "Εμφάνιση τριόδου 1 (σώματα / boiler)",
    has_triodos_uf: "Εμφάνιση τριόδου 2 (ενδοδάπεδια)",
    underfloor_max_temp: "Μέγιστη θερμοκρασία νερού για ενδοδάπεδια (°C)",
    triodos_entity: "Τρίοδος 1 - αισθητήρας/διακόπτης (προαιρετικό: on = σώματα, off = boiler)",
    triodos_uf_entity: "Τρίοδος 2 - αισθητήρας/διακόπτης (προαιρετικό: on = ενδοδάπεδια)",
    neon_text: "Όνομα στο neon (άδειο = κρύβεται)",
  },
  en: {
    name: "Title",
    outdoor_temp: "Outdoor temperature (sensor)",
    supply_temp: "Boiler supply / outlet temperature (sensor)",
    return_temp: "Boiler return / inlet temperature (sensor)",
    boiler_temp: "Boiler body temperature (sensor, optional)",
    climate_entity: "Room thermostat (climate) - for the − / + buttons",
    target_temp: "Compensation target (sensor, optional)",
    underfloor_entity: "UNDERFLOOR button - valve (input_boolean, optional)",
    circulator_entity: "Circulator pump (switch, optional)",
    demand_entity: "Heating demand (binary_sensor)",
    relay6: "Boiler relay (switch)",
    relay7: "Hot water Turbo relay (switch)",
    turbo_entity: "Turbo button (input_boolean or switch)",
    confirm_turbo: "Ask before changing Turbo",
    has_radiators: "I have radiators",
    has_boiler: "I have a hot water tank",
    has_underfloor: "I have underfloor heating",
    has_triodos: "Show 3-way valve 1 (radiators / hot water)",
    has_triodos_uf: "Show 3-way valve 2 (underfloor)",
    underfloor_max_temp: "Max water temperature for underfloor (°C)",
    triodos_entity: "3-way valve 1 sensor/switch (optional: on = radiators, off = boiler)",
    triodos_uf_entity: "3-way valve 2 sensor/switch (optional: on = underfloor)",
    neon_text: "Neon text / your name (empty = hidden)",
  },
  de: {
    name: "Titel",
    outdoor_temp: "Außentemperatur (Sensor)",
    supply_temp: "Kessel Vorlauf (Sensor)",
    return_temp: "Kessel Rücklauf (Sensor)",
    boiler_temp: "Kesselkörper-Temperatur (Sensor, optional)",
    climate_entity: "Raumthermostat (climate) - für die Tasten − / +",
    target_temp: "Kompensations-Zielwert (Sensor, optional)",
    underfloor_entity: "Taste FUSSBODENHEIZUNG - Ventil (input_boolean, optional)",
    circulator_entity: "Umwälzpumpe (switch, optional)",
    demand_entity: "Heizanforderung (binary_sensor)",
    relay6: "Kessel-Relais (switch)",
    relay7: "Warmwasser-Turbo-Relais (switch)",
    turbo_entity: "Turbo-Taste (input_boolean oder switch)",
    confirm_turbo: "Vor Änderung des Turbo nachfragen",
    has_radiators: "Ich habe Heizkörper",
    has_boiler: "Ich habe einen Warmwasserspeicher",
    has_underfloor: "Ich habe Fußbodenheizung",
    has_triodos: "3-Wege-Ventil 1 anzeigen (Heizkörper / Warmwasser)",
    has_triodos_uf: "3-Wege-Ventil 2 anzeigen (Fußbodenheizung)",
    underfloor_max_temp: "Max. Wassertemperatur für Fußbodenheizung (°C)",
    triodos_entity: "3-Wege-Ventil 1 Sensor/Schalter (optional: an = Heizkörper, aus = Speicher)",
    triodos_uf_entity: "3-Wege-Ventil 2 Sensor/Schalter (optional: an = Fußboden)",
    neon_text: "Neon-Text / dein Name (leer = ausgeblendet)",
  },
};

// Η γλώσσα ακολουθεί αυτόματα το Home Assistant (el / de / en, αλλιώς en)
function lfcLang(hass) {
  let h = hass;
  if (!h) {
    const ha = document.querySelector("home-assistant");
    h = ha && ha.hass;
  }
  const raw = (h && ((h.locale && h.locale.language) || h.language)) || document.documentElement.lang || navigator.language || "en";
  const l = String(raw).slice(0, 2).toLowerCase();
  return LFC_TR[l] ? l : "en";
}

class HestiaFlowCard extends HTMLElement {
  static getConfigForm() {
    const ent = (domain, extra) => ({ entity: Object.assign({ domain: domain }, extra || {}) });
    return {
      schema: [
        { name: "name", selector: { text: {} } },
        { name: "outdoor_temp", selector: ent("sensor") },
        { name: "supply_temp", selector: ent("sensor") },
        { name: "return_temp", selector: ent("sensor") },
        { name: "boiler_temp", selector: ent("sensor") },
        { name: "climate_entity", selector: ent("climate") },
        { name: "target_temp", selector: ent("sensor") },
        { name: "underfloor_entity", selector: { entity: { domain: ["input_boolean", "switch"] } } },
        { name: "circulator_entity", selector: { entity: { domain: ["switch", "input_boolean", "binary_sensor"] } } },
        { name: "demand_entity", selector: { entity: {} } },
        { name: "relay6", selector: ent("switch") },
        { name: "relay7", selector: ent("switch") },
        { name: "turbo_entity", selector: { entity: { domain: ["input_boolean", "switch"] } } },
        { name: "confirm_turbo", selector: { boolean: {} } },
        { name: "has_radiators", selector: { boolean: {} } },
        { name: "has_boiler", selector: { boolean: {} } },
        { name: "has_underfloor", selector: { boolean: {} } },
        { name: "has_triodos", selector: { boolean: {} } },
        { name: "has_triodos_uf", selector: { boolean: {} } },
        { name: "triodos_entity", selector: { entity: { domain: ["binary_sensor", "switch", "input_boolean", "sensor"] } } },
        { name: "triodos_uf_entity", selector: { entity: { domain: ["binary_sensor", "switch", "input_boolean", "sensor"] } } },
        { name: "underfloor_max_temp", selector: { number: { min: 25, max: 60, step: 1, mode: "box", unit_of_measurement: "°C" } } },
        { name: "neon_text", selector: { text: {} } },
      ],
      computeLabel: (schema) => (LFC_LABELS[lfcLang()] || LFC_LABELS.en)[schema.name] || schema.name,
    };
  }

  static getStubConfig() {
    return {
      has_radiators: true,
      has_boiler: true,
      has_underfloor: false,
      has_triodos: false,
      has_triodos_uf: false,
      confirm_turbo: true,
    };
  }

  setConfig(config) {
    this._config = Object.assign(
      { has_radiators: true, has_boiler: true, has_underfloor: false, has_triodos: false, has_triodos_uf: false, underfloor_max_temp: 40, confirm_turbo: true },
      config || {}
    );
    this._sig = null;
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() {
    return 12;
  }

  _st(id) {
    if (!id || !this._hass) return undefined;
    const s = this._hass.states[id];
    return s ? s.state : undefined;
  }
  _on(id) {
    return this._st(id) === "on";
  }
  _num(id) {
    const v = parseFloat(this._st(id));
    return isNaN(v) ? null : v;
  }
  // Κουμπιά ΣΩΜΑΤΑ / ΕΝΔΟΔΑΠΕΔΙΑ: με οντότητα -> ακολουθεί την οντότητα, αλλιώς θυμάται την επιλογή στον browser
  // Δουλεύει ένα τη φορά: όταν ανοίγει το ένα, κλείνει το άλλο.
  _loadLs() {
    if (this._ls) return;
    this._ls = {};
    try {
      const raw = window.localStorage.getItem("lfc_sel");
      if (raw) this._ls = JSON.parse(raw) || {};
    } catch (e) {}
  }
  // true = το νερό πάει στα ενδοδάπεδα, false = στα σώματα (πάντα ανοιχτό ΑΚΡΙΒΩΣ ένα κύκλωμα)
  _ufRaw() {
    const c = this._config || {};
    if (!c.has_underfloor) return false;
    if (!c.has_radiators) return true;
    if (c.underfloor_entity) return this._on(c.underfloor_entity);
    this._loadLs();
    return this._ls.uf === true;
  }
  _ufMax() {
    const v = parseFloat((this._config || {}).underfloor_max_temp);
    return isNaN(v) ? 40 : v;
  }
  _notify(msg) {
    this.dispatchEvent(new CustomEvent("hass-notification", { detail: { message: msg, duration: 6000 }, bubbles: true, composed: true }));
  }
  _pick(key) {
    const c = this._config;
    const L = LFC_TR[lfcLang(this._hass)];
    const wantUf = key === "uf";
    if (wantUf) {
      if (!c.has_underfloor) return;
      const tSup = this._num(c.supply_temp);
      if (tSup !== null && tSup > this._ufMax()) {
        this._notify(L.ufLimit.replace("{max}", String(this._ufMax())).replace("{now}", tSup.toFixed(1)));
        return;
      }
    } else if (!c.has_radiators) return;
    if (c.underfloor_entity) {
      this._hass.callService(c.underfloor_entity.split(".")[0], wantUf ? "turn_on" : "turn_off", { entity_id: c.underfloor_entity });
    } else {
      this._loadLs();
      this._ls.uf = wantUf;
      try { window.localStorage.setItem("lfc_sel", JSON.stringify(this._ls)); } catch (e) {}
    }
    this._sig = null;
    this._render();
  }
  _fmt(v) {
    return v === null ? "--" : v.toFixed(1) + " °C";
  }

  _render() {
    if (!this._config || !this._hass || !this.shadowRoot) return;
    const c = this._config;
    const lang = lfcLang(this._hass);
    const L = LFC_TR[lang];

    const heating = c.demand_entity ? this._on(c.demand_entity) : false;
    const r6 = c.relay6 ? this._on(c.relay6) : false;
    const r7 = c.relay7 ? this._on(c.relay7) : false;
    const turbo = (c.turbo_entity ? this._on(c.turbo_entity) : false) || r7;
    const trioActive = !!(c.has_triodos && c.has_radiators && c.has_boiler);

    const tSupNow = this._num(c.supply_temp);
    // ασφάλεια: αν το νερό ξεπεράσει το όριο, η ενδοδάπεδια δεν μπορεί να είναι ενεργή (όταν υπάρχουν και σώματα)
    const ufBlocked = !!c.has_underfloor && tSupNow !== null && tSupNow > this._ufMax();
    const selUf = !!c.has_underfloor && this._ufRaw() && !(ufBlocked && c.has_radiators);
    const selRad = !!c.has_radiators && !selUf;
    const radFlow = !!c.has_radiators && heating && selRad;
    const ufFlow = !!c.has_underfloor && heating && selUf;
    const boilFlow = !!c.has_boiler && turbo;
    const burning = (heating && (c.relay6 ? r6 : true)) || r7;

    const tOut = this._num(c.outdoor_temp);
    const tSup = this._num(c.supply_temp);
    const tRet = this._num(c.return_temp);
    const tBoi = this._num(c.boiler_temp);

    const cl = c.climate_entity && this._hass.states[c.climate_entity] ? this._hass.states[c.climate_entity].attributes || {} : null;
    const spRaw = cl ? parseFloat(cl.temperature) : NaN;
    const spNow = isNaN(spRaw) ? null : spRaw;
    const roomRaw = cl ? parseFloat(cl.current_temperature) : NaN;
    const room = isNaN(roomRaw) ? null : roomRaw;
    // κυκλοφορητής: ξεκινά όταν η εξαγωγή φτάσει 40°C, σταματά κάτω από 38°C (μόνο στο σχέδιο)
    if (tSup !== null) this._circ = tSup >= 40 ? true : tSup < 38 ? false : !!this._circ;
    const circ = c.circulator_entity ? this._on(c.circulator_entity) : !!this._circ;
    const tTarget = this._num(c.target_temp);
    const sp = this._pending != null ? this._pending : spNow;

    const sig = JSON.stringify([ufBlocked, this._st(c.triodos_entity), this._st(c.triodos_uf_entity), selRad, selUf, lang, tTarget, circ, sp, room, c, heating, r6, r7, turbo, radFlow, ufFlow, boilFlow, burning, tOut, tSup, tRet, tBoi]);
    if (sig === this._sig) return;
    this._sig = sig;

    const t = (v) => (v === null ? "--" : v.toFixed(1));

    // ---------- διάταξη ----------
    const rows = [];
    if (c.has_boiler) rows.push({ kind: "boil", flow: boilFlow, label: L.boilerBox });
    if (c.has_radiators) rows.push({ kind: "rad", flow: radFlow, label: L.radiators });
    if (c.has_underfloor) rows.push({ kind: "uf", flow: ufFlow, label: L.underfloor });
    const RH = 200, GAP = 36, RY0 = 210, RX = 640, RW = 310;
    rows.forEach((r, i) => (r.y = RY0 + i * (RH + GAP)));
    rows.forEach((r) => (r.pf = r.flow && circ));
    const rowsEnd = rows.length ? RY0 + rows.length * (RH + GAP) - GAP : RY0 + 200;
    const cy = Math.max((RY0 + rowsEnd) / 2, 410);
    const bodyBottom = Math.max(rowsEnd, cy + 190);
    const yb = bodyBottom + 40;
    const selN = (c.has_radiators ? 1 : 0) + (c.has_underfloor ? 1 : 0);
    const ty = yb + (selN ? 190 : 104);
    const H = ty + 92 + 28;
    const supY = cy - 100, retY = cy + 100;

    // ---------- σωλήνες ----------
    let pipes = "";
    const pipe = (d, flow, cold) => {
      const mid = flow ? (cold ? "#2aa7e6" : "#ff5a36") : "#59616b";
      let s = `<path d="${d}" class="p-out"/><path d="${d}" class="p-mid" style="stroke:${mid}"/><path d="${d}" class="p-hi"/>`;
      if (flow) s += `<path d="${d}" class="p-flow"/>`;
      return s;
    };
    [false, true].forEach((flowPass) => {
      rows.filter((r) => !!r.pf === flowPass).forEach((r) => {
        pipes += pipe(`M360 ${supY} H500 V${r.y + 60} H${RX}`, r.pf, false);
        pipes += pipe(`M${RX} ${r.y + 140} H540 V${retY} H360`, r.pf, true);
      });
    });
    if (!rows.length) pipes += pipe(`M360 ${supY} H500`, false, false);
    const anyFlow = rows.some((r) => r.pf);
    const waiting = rows.some((r) => r.flow) && !circ;

    // ---------- βοηθητικά σχέδια ----------
    const plate = (x, y, w, h, title, val, unit, hot) => `
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" class="plate"/>
      <text x="${x + w / 2}" y="${y + 17}" text-anchor="middle" class="pt">${title}</text>
      <text x="${x + w / 2}" y="${y + h - 10}" text-anchor="middle" class="pv ${hot ? "hot" : ""}">${val}<tspan class="pu"> ${unit}</tspan></text>`;

    const nipple = (x, y, dir) => `
      <rect x="${dir > 0 ? x : x - 22}" y="${y - 11}" width="22" height="22" rx="4" fill="url(#gBrass)" stroke="#3b3320" stroke-width="1.5"/>
      <rect x="${dir > 0 ? x + 6 : x - 16}" y="${y - 11}" width="2.5" height="22" fill="#00000044"/>
      <rect x="${dir > 0 ? x + 12 : x - 10}" y="${y - 11}" width="2.5" height="22" fill="#00000044"/>`;

    // ---------- λέβητας ----------
    const bx = 50, by = cy - 190, bw = 310, bh = 380;
    const wcx = bx + bw / 2, wcy = cy - 20;
    const ringCol = burning ? "#ff4a1c" : "#4a5059";
    const flameG = burning
      ? `<g class="fl" style="transform-origin:${wcx}px ${wcy + 48}px">
           <path d="M${wcx} ${wcy + 48} C${wcx - 52} ${wcy + 20} ${wcx - 30} ${wcy - 10} ${wcx - 14} ${wcy - 52} C${wcx - 2} ${wcy - 22} ${wcx + 38} ${wcy - 8} ${wcx + 44} ${wcy + 24} C${wcx + 48} ${wcy + 40} ${wcx + 20} ${wcy + 48} ${wcx} ${wcy + 48} Z" fill="url(#gFlame)"/>
           <path d="M${wcx} ${wcy + 46} C${wcx - 26} ${wcy + 28} ${wcx - 14} ${wcy + 4} ${wcx - 2} ${wcy - 20} C${wcx + 12} ${wcy + 4} ${wcx + 28} ${wcy + 18} ${wcx + 18} ${wcy + 38} C${wcx + 12} ${wcy + 46} ${wcx + 6} ${wcy + 46} ${wcx} ${wcy + 46} Z" fill="#ffd36a" opacity=".92"/>
         </g>`
      : `<path d="M${wcx} ${wcy + 40} C${wcx - 40} ${wcy + 16} ${wcx - 22} ${wcy - 6} ${wcx - 10} ${wcy - 38} C${wcx} ${wcy - 14} ${wcx + 30} ${wcy - 4} ${wcx + 34} ${wcy + 20} C${wcx + 36} ${wcy + 34} ${wcx + 16} ${wcy + 40} ${wcx} ${wcy + 40} Z" fill="#3a4048" opacity=".7"/>`;
    const boilerSvg = `
      ${burning ? `<circle cx="${wcx}" cy="${wcy}" r="118" fill="url(#gGlow)" class="glow"/>` : ""}
      <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="22" fill="url(#gMetal)" stroke="#0b0d10" stroke-width="3"/>
      <rect x="${bx + 6}" y="${by + 6}" width="${bw - 12}" height="${bh - 12}" rx="17" fill="none" stroke="#ffffff18" stroke-width="2"/>
      <rect x="${bx + 70}" y="${by + 16}" width="${bw - 140}" height="34" rx="9" class="plate"/>
      <text x="${wcx}" y="${by + 40}" text-anchor="middle" class="ttl">${(c.name || L.defaultName).toUpperCase()}</text>
      <circle cx="${wcx}" cy="${wcy}" r="88" fill="#15181c" stroke="#05070a" stroke-width="4"/>
      <circle cx="${wcx}" cy="${wcy}" r="80" fill="url(#gWin)" stroke="${ringCol}" stroke-width="5" ${burning ? 'class="ring"' : ""}/>
      ${flameG}
      ${plate(bx + 14, cy + 78, 138, 58, L.supply, t(tSup), "°C", burning)}
      ${plate(bx + bw - 152, cy + 78, 138, 58, L.ret, t(tRet), "°C", false)}
      ${c.target_temp ? `<text x="${wcx}" y="${cy + 158}" text-anchor="middle" class="sub" style="fill:#ff9a6b">${L.requested}: ${tTarget === null || tTarget <= 0 ? L.noRequest : t(tTarget) + " °C"}</text>` : ""}
      ${c.boiler_temp ? `<text x="${wcx}" y="${cy + 178}" text-anchor="middle" class="sub">${L.bodyTemp}: ${t(tBoi)} °C</text>` : ""}
      ${nipple(bx + bw, supY, 1)}${nipple(bx + bw, retY, 1)}`;

    // ---------- κυκλοφορητής ----------
    const circX = 430;
    const circSvg = `
      <g transform="translate(${circX} ${supY})">
        ${waiting ? `<text x="0" y="52" text-anchor="middle" class="sub" style="fill:#ffb199">${L.waiting40}</text>` : ""}
        <circle r="27" fill="url(#gMetal)" stroke="#0b0d10" stroke-width="3"/>
        <circle r="19" fill="#15181c"/>
        <g class="${circ && anyFlow ? "spin" : ""}" style="transform-box:fill-box;transform-origin:center">
          <path d="M0 0 L-4 -17 A17 17 0 0 1 12 -12 Z" fill="${circ && anyFlow ? "#38d27a" : "#6b7280"}"/>
          <path d="M0 0 L-4 -17 A17 17 0 0 1 12 -12 Z" fill="${circ && anyFlow ? "#38d27a" : "#6b7280"}" transform="rotate(120)"/>
          <path d="M0 0 L-4 -17 A17 17 0 0 1 12 -12 Z" fill="${circ && anyFlow ? "#38d27a" : "#6b7280"}" transform="rotate(240)"/>
        </g>
      </g>`;

    // ---------- τρίοδος (μόνο γραφικό: δείχνει πού πάει το νερό) ----------
    let trio = "";
    if (trioActive) {
      let toRad = rows.some((r) => r.kind === "rad" && r.flow);
      let toBoil = rows.some((r) => r.kind === "boil" && r.flow);
      const te = c.triodos_entity ? this._st(c.triodos_entity) : undefined;
      if (te === "on" || te === "off") { toRad = te === "on"; toBoil = te === "off"; }
      const lbl = toRad && toBoil ? L.toBoth : toRad ? L.toRad : toBoil ? L.toBoil : "—";
      const col = (on) => (on ? "#38d27a" : "#59616b");
      const tri = (up, on, dy, sc) => `<path d="M-8 6 L0 -9 L8 6 Z" fill="${col(on)}" transform="translate(0 ${dy}) scale(${sc}) rotate(${up ? 0 : 180})"/>`;
      const arrows = toRad && toBoil ? tri(true, true, -5, 0.75) + tri(false, true, 6, 0.75) : toBoil ? tri(true, true, 0, 1) : toRad ? tri(false, true, 0, 1) : tri(false, false, 0, 1);
      trio = `
        <g transform="translate(500 ${supY})">
          <rect x="-72" y="-70" width="144" height="42" rx="9" class="plate"/>
          <text x="0" y="-53" text-anchor="middle" class="pt">${L.trio}</text>
          <text x="0" y="-36" text-anchor="middle" class="pv" style="font-size:13px;fill:${toRad || toBoil ? "#38d27a" : "#8b949e"}">${lbl}</text>
          <circle r="17" fill="url(#gMetal)" stroke="#0b0d10" stroke-width="3"/>
          ${arrows}
        </g>`;
    }

    // ---------- τρίοδος 2 (ενδοδάπεδια - μόνο γραφικό) ----------
    let trio2 = "";
    const ufRow = rows.find((r) => r.kind === "uf");
    if (c.has_triodos_uf && ufRow) {
      const tue = c.triodos_uf_entity ? this._st(c.triodos_uf_entity) : undefined;
      const on = tue === "on" || tue === "off" ? tue === "on" : !!ufRow.flow;
      trio2 = `
        <g transform="translate(590 ${ufRow.y + 60})">
          <circle r="15" fill="url(#gMetal)" stroke="#0b0d10" stroke-width="3"/>
          <path d="M-7 5 L0 -8 L7 5 Z" fill="${on ? "#38d27a" : "#59616b"}" transform="rotate(90)"/>
          <rect x="-46" y="16" width="92" height="42" rx="8" class="plate"/>
          <text x="0" y="31" text-anchor="middle" class="pt" style="font-size:10px">${L.trio2}</text>
          <text x="0" y="49" text-anchor="middle" class="pv" style="font-size:10px;fill:${on ? "#38d27a" : "#8b949e"}">${on ? L.toUf : "—"}</text>
        </g>`;
    }

    // ---------- καταναλωτές ----------
    const consumer = (r) => {
      const y = r.y, on = r.pf;
      const edge = on ? "#ff5a36" : "#4a5059";
      const head = `<text x="${RX + RW / 2}" y="${y + 24}" text-anchor="middle" class="ttl">${r.label}</text>
        <text x="${RX + RW / 2}" y="${y + RH - 10}" text-anchor="middle" class="sub">${on ? L.running : r.flow ? L.waitingHeat : L.off}${r.kind === "boil" ? " · " + L.limit : ""}</text>`;
      let art = "";
      if (r.kind === "rad") {
        let fins = "";
        for (let i = 0; i < 8; i++) {
          const fx = RX + 38 + i * 30;
          fins += `<rect x="${fx}" y="${y + 52}" width="20" height="108" rx="10" fill="${on ? "url(#gRadHot)" : "url(#gMetal)"}" stroke="#0b0d10" stroke-width="2"/>`;
        }
        const waves = on
          ? [0, 1, 2, 3].map((i) => `<path class="wave" style="animation-delay:${i * 0.35}s" d="M${RX + 70 + i * 55} ${y + 48} q-8 -10 0 -20 q8 -10 0 -20" fill="none" stroke="#ff8a5c" stroke-width="3" stroke-linecap="round"/>`).join("")
          : "";
        art = `<rect x="${RX + 22}" y="${y + 44}" width="266" height="12" rx="5" fill="url(#gMetal)"/><rect x="${RX + 22}" y="${y + 156}" width="266" height="12" rx="5" fill="url(#gMetal)"/>${fins}${waves}`;
      } else if (r.kind === "boil") {
        art = `
          <rect x="${RX + 90}" y="${y + 34}" width="130" height="136" rx="32" fill="url(#gTank)" stroke="#0b0d10" stroke-width="3"/>
          <path d="M${RX + 122} ${y + 150} V${y + 90} q0 -22 16 -22 t16 22 v60 M${RX + 154} ${y + 150} V${y + 90} q0 -22 16 -22 t16 22 v60" fill="none" stroke="${on ? "#ff5a36" : "#59616b"}" stroke-width="7" stroke-linecap="round" class="${on ? "coil" : ""}"/>
          ${on ? `<circle cx="${RX + 155}" cy="${y + 100}" r="70" fill="url(#gGlow)" class="glow"/>` : ""}
          ${nipple(RX, y + 60, 1)}${nipple(RX, y + 140, 1)}`;
      } else {
        let d = `M${RX + 40} ${y + 56}`;
        for (let i = 0; i < 4; i++) {
          const yy = y + 56 + i * 32;
          d += ` H${RX + 270} q22 0 22 16 t-22 16 H${RX + 40} q-22 0 -22 16 t22 16`;
          if (i === 1) break;
        }
        art = `<rect x="${RX + 14}" y="${y + 40}" width="282" height="134" rx="14" fill="#1a1d21" stroke="#2a2f35" stroke-width="2"/>
          <path d="M${RX + 40} ${y + 62} H${RX + 262} q24 0 24 18 t-24 18 H${RX + 48} q-24 0 -24 18 t24 18 H${RX + 262}" fill="none" stroke="${on ? "#ff7a45" : "#59616b"}" stroke-width="7" stroke-linecap="round" class="${on ? "coil" : ""}"/>`;
      }
      return `<rect x="${RX}" y="${y}" width="${RW}" height="${RH}" rx="18" fill="#171a1f" stroke="${edge}" stroke-width="${on ? 3 : 2}" ${on ? 'class="edge"' : ""}/>${art}${head}`;
    };
    const consumers = rows.map(consumer).join("");

    // ---------- θερμοστάτης (ρύθμιση θερμοκρασίας) ----------
    const thermo = c.climate_entity
      ? `
      <rect x="720" y="20" width="240" height="118" rx="20" fill="url(#gMetal)" stroke="#0b0d10" stroke-width="3"/>
      <rect x="730" y="30" width="220" height="98" rx="14" fill="#14171b" stroke="#ffffff14"/>
      <text x="840" y="52" text-anchor="middle" class="ttl">${L.thermostat}</text>
      <g id="tm" style="cursor:pointer"><circle cx="762" cy="88" r="21" fill="#23282e" stroke="#4a5059" stroke-width="2"/><rect x="753" y="86" width="18" height="4" rx="2" fill="#e6edf3"/></g>
      <g id="tp" style="cursor:pointer"><circle cx="918" cy="88" r="21" fill="#23282e" stroke="#4a5059" stroke-width="2"/><rect x="909" y="86" width="18" height="4" rx="2" fill="#e6edf3"/><rect x="916" y="79" width="4" height="18" rx="2" fill="#e6edf3"/></g>
      <text x="840" y="98" text-anchor="middle" class="big" style="font-size:34px">${t(sp)}<tspan class="pu">°</tspan></text>
      <text x="840" y="121" text-anchor="middle" class="sub">${L.room}: ${t(room)} °C</text>`
      : "";

    // ---------- πλαίσιο εξωτερικής ----------
    const outdoor = `
      <rect x="50" y="20" width="310" height="118" rx="20" fill="url(#gMetal)" stroke="#0b0d10" stroke-width="3"/>
      <rect x="60" y="30" width="290" height="98" rx="14" fill="#14171b" stroke="#ffffff14"/>
      <text x="205" y="54" text-anchor="middle" class="ttl">${L.outdoor}</text>
      <g transform="translate(95 96)"><rect x="-7" y="-26" width="14" height="38" rx="7" fill="none" stroke="#cfd6de" stroke-width="3"/><circle cy="18" r="11" fill="#ff5a36"/><rect x="-3" y="-8" width="6" height="26" fill="#ff5a36"/></g>
      <text x="225" y="108" text-anchor="middle" class="big">${t(tOut)}<tspan class="pu"> °C</tspan></text>`;

    // ---------- neon ----------
    const neonTxt = (c.neon_text === undefined || c.neon_text === null ? "By Mouxritsa" : String(c.neon_text)).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
    const neon = !neonTxt.trim() ? "" : `
      <g class="neon">
        <text x="540" y="92" text-anchor="middle" class="neon-t" filter="url(#fNeon)">${neonTxt}</text>
        <text x="540" y="92" text-anchor="middle" class="neon-t core">${neonTxt}</text>
      </g>`;

    // ---------- ρελέ & Turbo ----------
    const relay = (x, w, title, sub, on) => `
      <rect x="${x}" y="${yb}" width="${w}" height="84" rx="14" fill="#171a1f" stroke="${on ? "#38d27a" : "#3a4048"}" stroke-width="2.5"/>
      <circle cx="${x + 30}" cy="${yb + 42}" r="11" fill="${on ? "#38d27a" : "#3a4048"}" ${on ? 'class="led"' : ""}/>
      <text x="${x + 54}" y="${yb + 38}" class="label">${title}</text>
      <text x="${x + 54}" y="${yb + 62}" class="sub">${sub}</text>`;
    const relays =
      relay(40, 290, L.relayBoiler, c.relay6 ? (r6 ? L.active : L.inactive) : L.notSet, r6) +
      relay(355, 290, L.relayTank, c.relay7 ? (r7 ? L.active : L.inactive) : L.notSet, r7) +
      relay(670, 290, L.demand, (heating ? L.yes : L.no) + (c.target_temp && tTarget !== null && tTarget > 0 ? " · " + L.target + " " + t(tTarget) + " °C" : ""), heating);

    // ---------- κουμπιά τριόδων (πού πηγαίνει το νερό) ----------
    const selItems = [];
    if (c.has_radiators) selItems.push({ k: "rad", label: L.radiators, on: selRad });
    if (c.has_underfloor) selItems.push({ k: "uf", label: L.underfloor, on: selUf, blocked: ufBlocked && !selUf });
    const selW = (920 - 20 * (selItems.length - 1)) / Math.max(selItems.length, 1);
    const selBtns = selItems
      .map((it, i) => {
        const x = 40 + i * (selW + 20);
        return `<g class="sel" data-k="${it.k}" style="cursor:pointer">
          <rect x="${x}" y="${yb + 100}" width="${selW}" height="74" rx="14" fill="${it.on ? "#13281d" : "#171a1f"}" stroke="${it.on ? "#38d27a" : it.blocked ? "#ff8a5c" : "#3a4048"}" stroke-width="2.5"/>
          <circle cx="${x + 32}" cy="${yb + 137}" r="12" fill="${it.on ? "#38d27a" : "#3a4048"}" ${it.on ? 'class="led"' : ""}/>
          <path d="M${x + 27} ${yb + 143} L${x + 32} ${yb + 131} L${x + 37} ${yb + 143} Z" fill="${it.on ? "#0d1013" : "#59616b"}" transform="rotate(${it.k === "rad" ? 180 : 90} ${x + 32} ${yb + 137})"/>
          <text x="${x + 58}" y="${yb + 132}" class="label">${it.label}</text>
          <text x="${x + 58}" y="${yb + 156}" class="sub" style="fill:${it.on ? "#38d27a" : it.blocked ? "#ff8a5c" : "#8b949e"}">${it.on ? L.open : it.blocked ? L.ufBlocked : L.closed}</text>
        </g>`;
      })
      .join("");

    const turboBtn = c.turbo_entity
      ? `<g id="turbo" style="cursor:pointer">
           <rect x="40" y="${ty}" width="920" height="92" rx="20" fill="${turbo ? "url(#gTurbo)" : "url(#gMetal)"}" stroke="${turbo ? "#ffb199" : "#0b0d10"}" stroke-width="3" ${turbo ? 'class="edge"' : ""}/>
           <text x="500" y="${ty + 36}" text-anchor="middle" class="tb">${L.turbo}</text>
           <text x="500" y="${ty + 68}" text-anchor="middle" class="sub" style="fill:#ffffffcc">${turbo ? L.turboOn : L.turboOff}</text>
         </g>`
      : `<text x="500" y="${ty + 56}" text-anchor="middle" class="sub">${L.noTurbo}</text>`;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; }
        ha-card { background:#0d1013; overflow:hidden; border-radius:var(--ha-card-border-radius,14px); }
        svg { width:100%; height:auto; max-height:calc(100vh - 24px); display:block; margin:0 auto; }
        .plate { fill:#0e1114; stroke:#3a4048; stroke-width:1.5; }
        .pt { fill:#8b949e; font:600 12px sans-serif; letter-spacing:.8px; }
        .pv { fill:#e6edf3; font:700 24px 'Courier New',monospace; }
        .pv.hot { fill:#ff7a45; }
        .pu { font-size:14px; fill:#8b949e; }
        .big { fill:#e6edf3; font:700 46px 'Courier New',monospace; }
        .ttl { fill:#e6edf3; font:700 15px sans-serif; letter-spacing:1.4px; }
        .label { fill:#e6edf3; font:600 17px sans-serif; }
        .sub { fill:#8b949e; font:600 13px sans-serif; letter-spacing:.6px; }
        .tb { fill:#fff; font:800 26px sans-serif; letter-spacing:1px; }
        .p-out { fill:none; stroke:#07090b; stroke-width:20; stroke-linecap:round; stroke-linejoin:round; }
        .p-mid { fill:none; stroke-width:13; stroke-linecap:round; stroke-linejoin:round; }
        .p-hi { fill:none; stroke:#ffffff; stroke-opacity:.22; stroke-width:3; stroke-linecap:round; stroke-linejoin:round; transform:translate(0,-3px); }
        .p-flow { fill:none; stroke:#fff; stroke-opacity:.75; stroke-width:4; stroke-linecap:round; stroke-linejoin:round; stroke-dasharray:3 24; animation:flow 1s linear infinite; }
        @keyframes flow { to { stroke-dashoffset:-54; } }
        .fl { animation:flick .7s ease-in-out infinite alternate; }
        @keyframes flick { from { transform:scale(1,.94); } to { transform:scale(1.05,1.06); } }
        .glow { animation:glow 1.6s ease-in-out infinite alternate; }
        @keyframes glow { from { opacity:.55; } to { opacity:1; } }
        .ring { animation:glow 1.2s ease-in-out infinite alternate; }
        .spin { animation:spin 1.4s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .wave { animation:rise 1.6s ease-in infinite; }
        @keyframes rise { from { opacity:0; transform:translateY(10px); } 40% { opacity:1; } to { opacity:0; transform:translateY(-14px); } }
        .coil { animation:glow 1.3s ease-in-out infinite alternate; }
        .edge { animation:glow 1.8s ease-in-out infinite alternate; }
        .neon-t { font:italic 700 44px "Brush Script MT","Segoe Script","Lucida Handwriting",cursive; fill:#ff3fd8; stroke:#ff3fd8; stroke-width:1.2px; letter-spacing:1px; }
        .neon-t.core { fill:#ffe3fb; stroke:#fff; stroke-width:.4px; filter:none; }
        .neon { animation:neonf 4s linear infinite; }
        @keyframes neonf { 0%,18%,22%,62%,64%,100% { opacity:1; } 20%,63% { opacity:.55; } }
        .led { animation:glow 1.1s ease-in-out infinite alternate; }
      </style>
      <ha-card>
        <svg viewBox="0 0 1000 ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMin meet">
          <defs>
            <linearGradient id="gMetal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#555d67"/><stop offset=".5" stop-color="#2d3238"/><stop offset="1" stop-color="#1d2126"/></linearGradient>
            <linearGradient id="gBrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2c97a"/><stop offset=".5" stop-color="#a98a3c"/><stop offset="1" stop-color="#6d5622"/></linearGradient>
            <linearGradient id="gTank" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a3037"/><stop offset=".35" stop-color="#5b646f"/><stop offset="1" stop-color="#20252b"/></linearGradient>
            <linearGradient id="gRadHot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9166"/><stop offset="1" stop-color="#c73a17"/></linearGradient>
            <linearGradient id="gTurbo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7a45"/><stop offset="1" stop-color="#d8431a"/></linearGradient>
            <radialGradient id="gWin" cx=".5" cy=".6" r=".7"><stop offset="0" stop-color="#2b1a14"/><stop offset="1" stop-color="#0a0b0d"/></radialGradient>
            <radialGradient id="gGlow"><stop offset="0" stop-color="#ff5a36" stop-opacity=".55"/><stop offset="1" stop-color="#ff5a36" stop-opacity="0"/></radialGradient>
            <linearGradient id="gFlame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff9a1f"/><stop offset="1" stop-color="#ff3d00"/></linearGradient>
            <filter id="fNeon" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#ffffff" stroke-opacity=".035"/></pattern>
          </defs>
          <rect width="1000" height="${H}" fill="#0d1013"/>
          <rect width="1000" height="${H}" fill="url(#grid)"/>
          ${outdoor}
          ${thermo}
          ${neon}
          ${pipes}
          ${boilerSvg}
          ${circSvg}
          ${trio}
          ${trio2}
          ${consumers}
          ${relays}
          ${selBtns}
          ${turboBtn}
        </svg>
      </ha-card>`;

    const step = (d) => {
      const base = this._pending != null ? this._pending : spNow != null ? spNow : 21;
      const lo = cl && cl.min_temp != null ? parseFloat(cl.min_temp) : 5;
      const hi = cl && cl.max_temp != null ? parseFloat(cl.max_temp) : 30;
      const v = Math.min(hi, Math.max(lo, Math.round((base + d) * 2) / 2));
      this._pending = v;
      this._sig = null;
      this._render();
      this._hass.callService("climate", "set_temperature", { entity_id: c.climate_entity, temperature: v });
      clearTimeout(this._pt);
      this._pt = setTimeout(() => { this._pending = null; this._sig = null; this._render(); }, 4000);
    };
    const tmB = this.shadowRoot.getElementById("tm");
    const tpB = this.shadowRoot.getElementById("tp");
    if (tmB) tmB.addEventListener("click", () => step(-0.5));
    if (tpB) tpB.addEventListener("click", () => step(0.5));

    this.shadowRoot.querySelectorAll(".sel").forEach((g) => {
      g.addEventListener("click", () => {
        const k = g.getAttribute("data-k");
        this._pick(k);
      });
    });

    const btn = this.shadowRoot.getElementById("turbo");
    if (btn) {
      btn.addEventListener("click", () => {
        const turbo_on = this._on(c.turbo_entity);
        const msg = turbo_on ? L.askOff : L.askOn;
        if (c.confirm_turbo !== false && !window.confirm(msg)) return;
        const domain = c.turbo_entity.split(".")[0];
        this._hass.callService(domain, "toggle", { entity_id: c.turbo_entity });
      });
    }
  }
}

if (!customElements.get("hestia-flow-card")) {
  customElements.define("hestia-flow-card", HestiaFlowCard);
}
window.customCards = window.customCards || [];
window.customCards.push({
  type: "hestia-flow-card",
  name: "Hestia Flow Card",
  description: "Heating boiler, hot-water tank, radiators, underfloor, 3-way valves and Turbo - el / en / de",
  preview: false,
});
console.info("%c HESTIA-FLOW-CARD %c v0.0.1 · by Mouxritsa and Claude ", "background:#ff3fd8;color:#000;font-weight:700", "background:#222;color:#fff");
