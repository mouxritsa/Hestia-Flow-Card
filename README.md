# Hestia Flow Card

### Hi there 👋 I'm Mouxritsa

- 🏠 **My Project:** [Hestia Flow Card](https://github.com/mouxritsa/Hestia-Flow-Card) - A full-screen animated flow card for heating boilers in Home Assistant.
- 📺 Watch My Videos: [![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/@mouxritsa)
- ☕ Support my work: [![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/mouxritsa)





**Version v0.0.1** · A full-screen, animated flow card for a **heating boiler** in Home Assistant.



> ### ⚠️ This is my first attempt
> This is the **first card I have ever made**, so it is version **0.0.1**.
> It works on my own boiler room, but your installation is different from mine, so something may not work for you.
> Please open an **Issue** on GitHub and tell me what happened - I will try to fix it in future versions.
>
> Made by **Mouxritsa** together with **Claude** (the AI assistant of Anthropic).

---

## Table of contents

1. [What it does](#what-it-does)
2. [Important: the card is graphic only](#important-the-card-is-graphic-only)
3. [Safety - please read](#safety---please-read)
4. [What you need before you start](#what-you-need-before-you-start)
5. [Installation](#installation)
6. [Set up the card](#set-up-the-card)
7. [What to add to Home Assistant (configuration.yaml and automations.yaml)](#what-to-add-to-home-assistant)
8. [All options of the card](#all-options-of-the-card)
9. [How the card behaves](#how-the-card-behaves)
10. [Troubleshooting](#troubleshooting)
11. [Credits and license](#credits-and-license)

---

## What it does

The card draws your boiler room as a live picture:

- **The boiler** with a flame, the **supply** (outlet) and **return** (inlet) water temperatures and, optionally, the temperature of the boiler body.
- The **outdoor temperature**.
- The **pipes** with moving water: red when hot water goes out, blue when it comes back.
- The **circulator pump**, which is drawn spinning only when the supply water is hot enough.
- Optional: **radiators**, a **hot-water tank**, **underfloor heating**, and one or two **3-way valves** (real or virtual).
- Two **+ / -** buttons for your **room thermostat** (steps of 0.5 °C).
- Buttons to choose where the hot water goes: **radiators** or **underfloor heating**.
- A **Turbo** button (with an "are you sure?" question) for heating the hot-water tank.
- Your own name in **neon letters** (you can type any text, or hide it).
- **3 languages** - Greek, English, German. It follows the language of your Home Assistant automatically.
- A **visual editor**: you fill in the entities in a form, no YAML is needed.

Every part is **optional**: if you have no hot-water tank or no underfloor heating, you simply turn that part off and it is not drawn.

## Important: the card is graphic only

The card **shows** what is happening and gives you a few buttons. It does **not** control your boiler by itself.

The real work - switching the boiler on and off, the compensation (how hot the water must be), the Turbo - is done by **Home Assistant automations**, which keep running even when no browser is open. That is the safe way to do it.
In this repository you get ready-made examples for them: see [`examples/`](examples) and [`docs/COMPENSATION.md`](docs/COMPENSATION.md).

The 3-way valves in the picture are **virtual** by default (just a drawing). If you really have 3-way valves and a sensor that tells their position, you can connect them (`triodos_entity`, `triodos_uf_entity`).

## Safety - please read

This is a hobby project, made for my own house and shared "as is", **without any warranty** (see the [LICENSE](LICENSE)). You use it at your own risk.

- **A card and an automation are not a safety device.** Your boiler must always have its own safety equipment (safety thermostat, pressure valve, etc.). Wiring relays to a boiler should be done by a qualified person.
- **Underfloor heating and hot water:** underfloor heating is normally limited to about 40 °C. Water at 60 °C in the floor can damage it. The card refuses to switch to underfloor heating when the supply water is above `underfloor_max_temp` (default 40 °C), **but this is only a software help**. The real protection must be **hardware**: a mixing valve and a safety thermostat on the underfloor circuit.
- **Simple (non-condensing) oil or gas boilers** can be damaged when the **return water is too cold** (below about 45-50 °C), because acid forms inside the boiler. Check the manual or the plate of your boiler for its minimum return temperature. This is why the compensation example asks for at least 55 °C when it heats. Read [`docs/COMPENSATION.md`](docs/COMPENSATION.md).
- **Turbo** (relay 7, wired in parallel with the thermostat) forces the boiler to burn without asking the thermostat. The example automation allows Turbo only when the house is not asking for heat, and stops it above 70 °C, when the sensor is lost, and after 60 minutes. Do not remove these safety stops.

## What you need before you start

You need these in Home Assistant. Entities marked **Optional** can be left out if you do not have them:

| What | Used for | Required? |
|---|---|---|
| Supply (outlet) temperature sensor of the boiler | the red pipe, circulator, safety | **Yes** |
| Return (inlet) temperature sensor of the boiler | the blue pipe, and the "warm water came back" rule | **Yes** (strongly recommended) |
| Outdoor temperature sensor | outdoor panel and compensation | **Yes** |
| A room thermostat (`climate` entity) | + / - buttons, and the heating-demand sensor of the examples is made from it | **Yes** (the example demand sensor needs it) |
| A heating-demand `binary_sensor` | tells the card the house wants heat | **Yes** for the water animation (an example is in `examples/1-configuration.yaml`) |
| A switch (relay) that lets the boiler burn ("relay 6") | shows if the boiler is allowed to burn | Optional |
| A switch (relay) for Turbo ("relay 7") and an `input_boolean` for the Turbo button | Turbo | Optional |
| A boiler body temperature sensor | shown on the boiler | Optional |

Your sensors can have any names. In this guide, **`{ put your ... here }`** or **`YOUR_...`** always means "the entity of YOUR installation".

## Installation

**Requirements:** a recent Home Assistant (2024.10 or newer is needed for the YAML examples), and for Option A [HACS](https://hacs.xyz) must already be installed.

### Option A - HACS (recommended)

1. In Home Assistant open **HACS**.
2. Click the three dots **⋮** (top right) → **Custom repositories**.
3. In *Repository* paste the address of this repository: `https://github.com/YOUR_GITHUB_NAME/hestia-flow-card` (replace `YOUR_GITHUB_NAME` with the real GitHub name of the owner of this repository - copy the address from your browser)
4. In *Type* choose **Dashboard** (in old HACS versions it is called **Lovelace**). Click **Add**.
5. Find **Hestia Flow Card** in the list and click **Download**.
6. Refresh the browser with **Ctrl+F5** (on a phone: close and open the app).

> Once the card is in the default HACS store, steps 2-4 are not needed: just search for "Hestia Flow Card".
> HACS adds the resource automatically if your dashboards are in the normal (UI) mode. If you use dashboards in YAML mode, add the resource yourself: URL `/hacsfiles/hestia-flow-card/hestia-flow-card.js`, type *JavaScript module*.

### Option B - manual

1. Download `hestia-flow-card.js` from the latest [Release](https://github.com/YOUR_GITHUB_NAME/hestia-flow-card/releases).
2. Copy it into the folder `www` inside your Home Assistant configuration folder (the one that contains `configuration.yaml`). If the folder `www` does not exist, create it and **restart Home Assistant once**, otherwise `/local/` does not work.
3. In Home Assistant open **Settings → Dashboards → ⋮ (top right) → Resources** (if you do not see *Resources*, first turn on **Advanced mode** in your user profile).
4. Click **Add resource**:
   - URL: `/local/hestia-flow-card.js?v=1`
   - Type: **JavaScript module**
5. Refresh the browser with **Ctrl+F5**.

When you later replace the file with a newer one, change `?v=1` to `?v=2` (then `3`, ...) so the browser downloads the new file and does not use the old copy.

## Set up the card

1. Make a dashboard view, and for a **full-screen** look set its type to **Panel (1 card)** (edit the view → *View type*).
2. Click **Add card** → search for **Hestia Flow Card**.
3. Fill in the form. The labels are in your language. Choose the entities of your installation and tick what you have (radiators, hot-water tank, underfloor heating, 3-way valves).
4. Save.

If you prefer YAML, a full example with `YOUR_...` placeholders is in [`examples/3-dashboard-card.yaml`](examples/3-dashboard-card.yaml).

## What to add to Home Assistant

The card needs a few helper entities and automations to work well. They are explained step by step in **[`docs/COMPENSATION.md`](docs/COMPENSATION.md)**. Short version:

| File | What you add | Example file |
|---|---|---|
| `configuration.yaml` | an `input_boolean` for the Turbo button, a `binary_sensor` "heating demand", and a `sensor` with the compensation target | [`examples/1-configuration.yaml`](examples/1-configuration.yaml) |
| `automations.yaml` | the automation for the boiler relay (relay 6) and the automation for Turbo (relay 7) | [`examples/2-automations.yaml`](examples/2-automations.yaml) |

In these files replace every `YOUR_...` with your own entity. After changing `configuration.yaml` do a full restart of Home Assistant (**Settings → System →** power icon at the top right **→ Restart Home Assistant**).

## All options of the card

All entities are chosen from lists in the visual editor. In YAML the names are:

| Option | Type | Default | What it does |
|---|---|---|---|
| `name` | text | `Boiler` (in your language) | Title written on the boiler |
| `outdoor_temp` | `sensor` | - | Outdoor temperature |
| `supply_temp` | `sensor` | - | Boiler **supply / outlet** water temperature (the hot water leaving the boiler) |
| `return_temp` | `sensor` | - | Boiler **return / inlet** water temperature (the water coming back) |
| `boiler_temp` | `sensor` | - | Optional: temperature of the boiler body |
| `climate_entity` | `climate` | - | Your room thermostat. Gives the **+ / -** buttons (0.5 °C steps) and shows the room and set temperature |
| `demand_entity` | `binary_sensor` | - | **ON** when the room thermostat is calling for heat. The hot water animation to the radiators / underfloor runs only when this is ON |
| `target_temp` | `sensor` | - | Optional: the water temperature your compensation asks from the boiler (°C). Shown in the "heating request" box. `0` means no request |
| `relay6` | `switch` | - | The switch that lets the boiler burn (wired in series with the thermostat). The card shows it as active / inactive |
| `relay7` | `switch` | - | The Turbo switch (wired in parallel). If ON, the card shows Turbo running |
| `turbo_entity` | `input_boolean` or `switch` | - | What the **Turbo button** toggles. Without it there is no Turbo button |
| `confirm_turbo` | true / false | `true` | Ask "are you sure?" before Turbo is switched |
| `has_radiators` | true / false | `true` | Draw radiators |
| `has_boiler` | true / false | `true` | Draw the **hot-water tank** (in the Greek/English text it is called "boiler" or "hot water"; the water goes to it when Turbo is on) |
| `has_underfloor` | true / false | `false` | Draw underfloor heating |
| `has_triodos` | true / false | `false` | ("triodos" is the Greek word for a 3-way valve) Draw 3-way valve 1 (radiators / hot-water tank). Needs radiators and the hot-water tank |
| `has_triodos_uf` | true / false | `false` | Draw 3-way valve 2 (underfloor). Needs underfloor heating |
| `underfloor_entity` | `input_boolean` or `switch` | - | Optional: remembers the choice of the radiators / underfloor buttons in Home Assistant. **ON = underfloor, OFF = radiators**. Without it the card remembers the choice in the browser. You can use it in your own automation to move a real valve |
| `underfloor_max_temp` | number (°C) | `40` | The highest supply water temperature that may go to the underfloor. Above it the underfloor button is blocked and shows a message |
| `triodos_entity` | `binary_sensor`, `switch`, `input_boolean` or `sensor` | - | Optional: a real sensor of 3-way valve 1. **ON = radiators, OFF = hot-water tank**. Without it the valve is virtual |
| `triodos_uf_entity` | `binary_sensor`, `switch`, `input_boolean` or `sensor` | - | Optional: a real sensor of 3-way valve 2. **ON = underfloor open**. Without it the valve is virtual |
| `circulator_entity` | `switch`, `input_boolean` or `binary_sensor` | - | Optional: the real circulator pump. Without it the pump is drawn spinning when the supply water is **40 °C or more** (and stops below 38 °C) |
| `neon_text` | text | `By Mouxritsa` | The neon text at the top. Write **your own name**. If you leave the field **empty** the neon text is hidden |

## How the card behaves

- **Water flow animation.** Hot water is drawn going to the radiators or the underfloor only when `demand_entity` is ON **and** the circulator is running. The water goes to the hot-water tank when Turbo is on.
- **The circulator.** If you do not give `circulator_entity`, the picture assumes the usual boiler pump with its own 40 °C thermostat: it spins when the supply water reaches 40 °C and stops when it falls below 38 °C. Until then the pipes do not move, even if the flame is on.
- **The flame** is shown when the house asks for heat (and relay 6, if you set it, is ON), or when Turbo (relay 7) is ON.
- **Only one heating circuit at a time.** If you have both radiators and underfloor heating, exactly one is open: radiators by default. Press the **underfloor** button and radiators close; press **radiators** and the underfloor closes. They are never both open and never both closed.
- **Underfloor safety limit.** If the supply water is above `underfloor_max_temp` (40 °C by default), the underfloor button cannot be selected. Pressing it shows a message: *"Water is above the limit ... it cannot go to the underfloor heating"*. If the underfloor is open and the water goes above the limit, the picture goes back to the radiators (when you have radiators).
- **3-way valve 1** points to the radiators or to the hot-water tank following the water flow. **3-way valve 2** is open when water goes to the underfloor. With `triodos_entity` / `triodos_uf_entity` they follow your real sensor instead.
- **Turbo button.** It toggles `turbo_entity`. Your automation (see `examples/2-automations.yaml`) then switches relay 7 and also protects you with the limits.
- **Thermostat buttons.** They change the set temperature of `climate_entity` in 0.5 °C steps within the limits of that thermostat.

## Troubleshooting

| Problem | What to do |
|---|---|
| **"Custom element doesn't exist: hestia-flow-card"** | The file is not loaded. Check that the resource exists (Settings → Dashboards → ⋮ → Resources), that the type is *JavaScript module*, and refresh with **Ctrl+F5**. |
| **404 when opening `/local/hestia-flow-card.js`** | The file is not in the right folder. It must be in `www` next to your `configuration.yaml`. Check the name is exactly `hestia-flow-card.js`. |
| The card does not change after I replaced the file | The browser keeps the old copy. Change `?v=1` to `?v=2` in the resource, and press **Ctrl+F5**. (With HACS: press *Update* in HACS, then **Ctrl+F5**.) |
| The card is loaded twice | You have the manual resource **and** the HACS one. Delete the manual `/local/...` resource. |
| No water animation | Check that `demand_entity` is ON, that `supply_temp` is **40 °C or more**, or give your real `circulator_entity`. |
| The underfloor button says "Water above limit" | The supply water is above `underfloor_max_temp`. This is on purpose. See [Safety](#safety---please-read). |
| Turbo button is missing | You did not set `turbo_entity`. |
| The boiler does not switch on or off | The card does not control it. Check the automation of relay 6 (`examples/2-automations.yaml`) and read [`docs/COMPENSATION.md`](docs/COMPENSATION.md). |

If you still have a problem, open an **Issue** and write: what you see, your Home Assistant version, and the YAML of the card.

## Credits and license

- First attempt, made by **Mouxritsa** together with **Claude** (AI assistant of Anthropic).
- License: [MIT](LICENSE) - free to use and change, **without any warranty**.
