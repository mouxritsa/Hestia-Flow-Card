# Compensation, relays and Turbo - how and why

**Hestia Flow Card v0.0.1** · first attempt, made by Mouxritsa together with Claude.

This page explains the part that is **not** in the card: the Home Assistant helpers and automations that really control the boiler.
The card only **shows** what happens. Everything here runs inside Home Assistant, so it keeps working when no browser is open.

> **Read this first.** The numbers in this page are **starting values** that work for my own house (an old, poorly insulated house with a big radiator system and a simple oil boiler). Every house is different. You must watch your system for a few days and tune the numbers - the section [How to tune](#5-how-to-tune-it-for-your-house) tells you how. The author gives **no warranty** (see the [LICENSE](../LICENSE)).

## Table of contents

1. [The idea in one minute](#1-the-idea-in-one-minute)
2. [The compensation (the water temperature that is asked)](#2-the-compensation-the-water-temperature-that-is-asked)
3. [The relay 6 automation (switching the boiler on and off)](#3-the-relay-6-automation-switching-the-boiler-on-and-off)
4. [Turbo and relay 7](#4-turbo-and-relay-7)
5. [How to tune it for your house](#5-how-to-tune-it-for-your-house)
6. [What exactly to put in `configuration.yaml`](#6-what-exactly-to-put-in-configurationyaml)
7. [What exactly to put in `automations.yaml`](#7-what-exactly-to-put-in-automationsyaml)
8. [Relay wiring (example)](#8-relay-wiring-example)
9. [Underfloor heating](#9-underfloor-heating)
10. [Frequently asked questions](#10-frequently-asked-questions)

---

## 1. The idea in one minute

A boiler that is simply switched on and off by a room thermostat heats the water as hot as it can, every time. That wastes fuel and it makes the boiler start and stop many times.

A **weather compensation** is smarter. It asks for:

- **cold outside → hotter water**,
- **mild outside → less hot water**,
- **warm outside → no heating at all**.

Less hot water means less fuel, and the house is warmed more gently.

Three small pieces do the job:

| Piece | Where it lives | What it does |
|---|---|---|
| `binary_sensor.hestia_heating_demand` | `configuration.yaml` | "Is the house asking for heat?" (from your room thermostat) |
| `sensor.hestia_target_temperature` | `configuration.yaml` | "How hot should the boiler water be right now?" (the compensation). `0` = do not heat. It has **two curves**: one for radiators, one (cooler) for underfloor heating |
| Automation **relay 6** | `automations.yaml` | Switches the boiler on and off to reach that water temperature |

And two extras:

- If you want the Turbo button: an `input_boolean` and the automation **relay 7**.
- If you have **both radiators and underfloor heating**: an `input_boolean` (`input_boolean.hestia_underfloor`) that remembers which circuit is open. The compensation reads it to choose the right curve.

The card reads `binary_sensor.hestia_heating_demand` (as `demand_entity`) and `sensor.hestia_target_temperature` (as `target_temp`) and draws the result.

## 2. The compensation (the water temperature that is asked)

### The formula

```
target = ( base - outdoor × slope ) + ( room_setpoint - 21 ) × shift
```

then it is limited:

- if **Turbo** is on → `max_water`,
- else if the house is **not asking for heat** → `0`,
- else if `outdoor >= cutoff` → `0` (too warm outside, no heating),
- else the result is kept between the lowest and the highest water temperature **of the circuit that is open**.

There are **two sets of numbers**. When `input_boolean.hestia_underfloor` is **ON** (or `underfloor_only` is `true`), the sensor uses the **underfloor** numbers. Otherwise it uses the **radiator** numbers. This is important: the room setpoint shift is added to the formula, so with a single curve a high thermostat setting (for example 30 °C) would ask for 70 °C even for the underfloor.

### The numbers (all of them are in the sensor, at the top)

**Radiators:**

| Name | Default | Meaning |
|---|---|---|
| `base` | 75 | Water temperature (°C) when it is 0 °C outside and your room setpoint is 21 °C |
| `slope` | 2.0 | How many °C hotter the water becomes for every 1 °C colder outside. This is the "heating curve" |
| `shift` | 3.0 | How many °C hotter the water becomes for every 1 °C that you raise the room setpoint above 21 °C (and colder below 21 °C) |
| `min_water` | 55 | The lowest water temperature when heating is on |
| `max_water` | 70 | The highest water temperature |

**Underfloor heating** (test values, **not tested in a real house**):

| Name | Default | Meaning |
|---|---|---|
| `base_uf` | 40 | Water temperature (°C) when it is 0 °C outside and your room setpoint is 21 °C |
| `slope_uf` | 0.8 | How many °C hotter the water becomes for every 1 °C colder outside |
| `shift_uf` | 1.0 | How many °C hotter the water becomes for every 1 °C that you raise the room setpoint above 21 °C |
| `min_uf` | 30 | The lowest water temperature when heating is on |
| `max_uf` | 40 | The highest water temperature. **Never exceeded.** Ask your floor installer for the right number |

**Common:**

| Name | Default | Meaning |
|---|---|---|
| `cutoff` | 22.0 | From this outdoor temperature (°C) and above, no heating is requested |
| `underfloor_only` | `false` | Set it to `true` **only** if you have underfloor heating and **no radiators** (then there is no button to choose, so the sensor always uses the underfloor curve) |

### What it gives with the defaults (room setpoint 21 °C)

| Outside | Water target |
|---|---|
| -5 °C | 70 °C (the maximum) |
| 0 °C | 70 °C (75 is limited to the maximum) |
| 5 °C | 65 °C |
| 7.5 °C | 60 °C |
| 10 °C | 55 °C |
| 15 °C | 55 °C (the minimum) |
| 22 °C and above | 0 - no heating |

Example with a higher room setpoint: you ask 24 °C and it is 5 °C outside → `65 + (24 - 21) × 3 = 74` → limited to **70 °C**.

### What the underfloor curve gives with the defaults (room setpoint 21 °C)

| Outside | Water target |
|---|---|
| -5 °C and 0 °C | 40 °C (the maximum) |
| 5 °C | 36 °C |
| 10 °C | 32 °C |
| 12.5 °C | 30 °C (the minimum) |
| 15 °C | 30 °C (the minimum) |
| 22 °C and above | 0 - no heating |

Example with a high room setpoint: you ask 30 °C and it is 0 °C outside → `40 + (30 - 21) × 1 = 49` → limited to **40 °C**. (With the radiator curve this same case gives 70 °C.)

### Why these choices

- **Why `min_water` = 55 °C?** A **simple (non-condensing) boiler** is damaged when the **return water** is too cold (below about 45-50 °C): acid forms inside it. The relay-6 automation keeps the boiler running until the return water reaches (target − 8 °C). With a target of at least 55 °C that means the return water gets to about 47 °C or more before the boiler stops, so the boiler works with warmer return water. This is **not a guarantee**: when the boiler starts from cold, the return water is cold for the first minutes, and software cannot avoid that. The real cure is hardware (a return-protection pump or valve). If your boiler is a **condensing** boiler, or its manual allows a colder return, you may use a lower number. **Check your own boiler's manual.**
- **Why a `cutoff`?** To not burn fuel on mild days. The room thermostat already stops the boiler when the house is warm, so the cutoff is only a second safety. **Do not set it too low**: if the cutoff is lower than the outdoor temperature on a day when you still want heat, the target becomes `0` and the boiler will **not start at all**, whatever the thermostat asks. (This happened to me with 17 °C when it was 18.4 °C outside, so I went back to 22 °C.)
- **Why `max_water` = 70 °C?** A normal limit for radiators with an old boiler. Do not go higher without checking your boiler.
- **Why `max_uf` = 40 °C?** Underfloor heating normally works with much cooler water than radiators. The right limit depends on the floor (for example screed or wood) and on the instructions of the manufacturer, and it is often somewhere between 35 and 45 °C. 40 °C is a cautious starting value, **not a rule for every floor**. Ask the person who installed your floor, and write that number in `max_uf` and in the card (`underfloor_max_temp`). The two numbers must be equal.
- **Why `shift`?** So that when you raise the thermostat (you want 24 °C instead of 21 °C) the boiler gives hotter water and the house warms faster.

## 3. The relay 6 automation (switching the boiler on and off)

Relay 6 is the relay that **lets the boiler burn**. (How it is wired: see [section 8](#8-relay-wiring-example).)

The automation uses **three temperatures**: the **target** (from section 2), the **supply** (outlet) water and the **return** (inlet) water.

| Situation | What it does |
|---|---|
| **Safety:** a temperature sensor is lost, or supply is above `hard_limit` (80 °C), or supply is more than `safety_margin` (10 °C) above the target | switches **OFF at once** |
| The target is `0` (no heating requested) | switches **OFF** |
| Relay is ON, the **return** water has reached (target − `off_return_margin`), that is target − 8 °C, and the boiler was ON for at least `min_on` (10 minutes) | switches **OFF** |
| Relay is OFF, the **supply** water is more than `on_margin` (2 °C) below the target, the return water is still below (target − 8 °C), and the relay was OFF for at least `min_off` (5 minutes) | switches **ON** |

### Why the **return** water decides when to stop

The supply sensor is at the outlet of the boiler, so it gets hot **very fast**, in a few minutes. In a **big installation** the water needs a long time to go round the radiators and come back. If the boiler stopped as soon as the **supply** reached the target, it would stop long before the radiators got warm, the supply would fall, and the boiler would start again - it would **start and stop all the time** ("short cycling"). That wastes fuel and wears the boiler.

With the rule "stop when the **return** water is warm" the boiler waits until the warm water has really **gone round the system and come back**. That means the radiators got heat. The boiler then runs longer, but fewer times - which is exactly what you want.

### The numbers (in the `variables:` of the automation)

| Name | Default | Meaning |
|---|---|---|
| `on_margin` | 2 | The boiler may start when supply is this many °C below the target |
| `off_return_margin` | 8 | The boiler stops when the **return** water reaches (target − this number). A smaller number = a longer run (the return must get hotter) |
| `safety_margin` | 10 | Emergency stop when supply is this many °C **above** the target |
| `hard_limit` | 80 | Emergency stop above this supply temperature (°C) |
| `min_on` | 600 | The boiler stays ON at least this many seconds |
| `min_off` | 300 | The boiler stays OFF at least this many seconds (the minimum times protect the burner: at most about 4 starts per hour) |

## 4. Turbo and relay 7

**Turbo** heats the hot-water tank with the boiler, **even when the house does not ask for heat**. The Turbo button of the card toggles an `input_boolean`; the automation **relay 7** switches the relay.

Safety rules in the automation (do not remove them):

- Turbo **starts only if the house is not asking for heat** and the supply water is below 70 °C. Otherwise you get a notification and the button goes back to OFF.
- Turbo **stops** when supply goes above 70 °C, when the supply sensor is lost, and **after 60 minutes**.

You need the Turbo automation **only if** you wired a relay 7 in parallel with the room thermostat. If you do not have such a relay, leave the Turbo parts out (do not set `relay7` and `turbo_entity` in the card).

## 5. How to tune it for your house

Do **one change at a time** and watch for **2-3 days** (the house takes time to react).

| What you see | What to change |
|---|---|
| The house **does not reach** the temperature you ask on cold days | Raise `slope` by 0.2 (2.0 → 2.2), or raise `base` by 3-5. Also check that `max_water` is not too low |
| The house is **too hot** on mild days, or the boiler works too much | Lower `slope` by 0.2, or lower `base` by 3-5 |
| The boiler **starts and stops too often** | Raise `min_on`; make `off_return_margin` smaller (5 or 6); check that the return sensor is on the return pipe |
| The boiler **runs too long**, the water is much hotter than needed | Make `off_return_margin` bigger (10), or lower `min_water` (only if your boiler allows a colder return) |
| The boiler **never starts** | Look at `sensor.hestia_target_temperature`. If it is `0` check the thermostat demand and the `cutoff`. If it is higher than 0, look at the supply and return values and at the minimum times |
| It is cold when the **room thermostat is set higher** | Raise `shift` (3.0 → 4.0) |

A very good tool: in Home Assistant open the **History** page and put together `supply`, `return`, `target` and the relay. You will see at once what the boiler does.

## 6. What exactly to put in `configuration.yaml`

`configuration.yaml` is in your Home Assistant configuration folder. You can edit it with the **File editor** or **Studio Code Server** add-on, or through Samba.

1. Make a **copy** of `configuration.yaml` first (a backup).
2. Open the file. Check if it already has a line `input_boolean:` and a line `template:`.
   - If **not**, paste the whole block below at the **end** of the file.
   - If it says something like `template: !include templates.yaml` (or `input_boolean: !include ...`), open **that other file** and add only the items, **without** the first line `template:` / `input_boolean:`.
   - You can also create the Turbo `input_boolean` in the screen **Settings → Devices & services → Helpers → Create helper → Toggle** (name it "Boiler Turbo"; the entity must become `input_boolean.hestia_turbo`).
   - If it **already has** one of them, do **not** paste a second one. Add only the items below **under the existing** `input_boolean:` or `template:`, with the same indentation.
3. Replace every `YOUR_...` with the entity of your installation:
   - `climate.YOUR_ROOM_THERMOSTAT` → your room thermostat. Find it in **Settings → Devices & services → Entities** (search "climate").
   - `sensor.YOUR_OUTDOOR_TEMPERATURE` → your outdoor temperature sensor.
4. Check the file: **Developer tools → YAML → Check configuration**.
5. Restart Home Assistant: **Settings → System →** power icon (top right) **→ Restart Home Assistant**.
   - If you have **only radiators**, you can leave `input_boolean.hestia_underfloor` out. If you have **only underfloor heating**, set `underfloor_only` to `true` in the sensor.
6. After the restart look in **Developer tools → States**: you should see `sensor.hestia_target_temperature`, `binary_sensor.hestia_heating_demand`, `input_boolean.hestia_turbo` and (if you use it) `input_boolean.hestia_underfloor`.

The same text is in [`examples/1-configuration.yaml`](../examples/1-configuration.yaml):

```yaml
# ======================================================================
#  Hestia Flow Card - what to add to your  configuration.yaml
#  Version v0.0.1 - made by Mouxritsa together with Claude (first attempt)
# ======================================================================
#  Replace every  YOUR_...  with the entity of YOUR installation.
#  Do NOT change the names  hestia_turbo, hestia_heating_demand,
#  hestia_target_temperature  unless you also change them in the
#  automations file and in the card.
#  TIP: use "Find and replace" of your editor, the placeholders appear several times.
#
#  IMPORTANT: a YAML file may contain each top-level key only ONCE.
#  If your configuration.yaml already has  input_boolean:  or  template:
#  do NOT paste a second one - add the items below under the existing key.
# ======================================================================

# ---- 1) Helpers: the Turbo button and the radiators / underfloor choice ----
input_boolean:
  hestia_turbo:
    name: Boiler Turbo (hot-water tank)
    icon: mdi:rocket-launch
  # Only if you have BOTH radiators and underfloor heating: remembers which circuit is open.
  # ON = underfloor, OFF = radiators.  Use it as  underfloor_entity  in the card, and the
  # compensation sensor below reads it to choose the right curve.
  hestia_underfloor:
    name: Boiler underfloor selected
    icon: mdi:heating-coil

# ---- 2) Two helper entities (template) --------------------------------
template:
  # 2a) "Is the house asking for heat?"  -> use it as  demand_entity  in the card
  - binary_sensor:
      - name: "Hestia Heating Demand"
        unique_id: hestia_heating_demand
        state: >
          {# { put your room thermostat (climate) here } #}
          {% set cl = 'climate.YOUR_ROOM_THERMOSTAT' %}
          {% set action = state_attr(cl, 'hvac_action') %}
          {% if states(cl) in ['off', 'unavailable', 'unknown'] %}
            false
          {% elif action in ['heating', 'idle', 'off'] %}
            {{ action == 'heating' }}
          {% else %}
            {# the thermostat has no hvac_action: compare the temperatures #}
            {{ state_attr(cl, 'current_temperature') | float(0) < state_attr(cl, 'temperature') | float(0) }}
          {% endif %}

  # 2b) The compensation: "how hot should the boiler water be right now?"
  #     -> use it as  target_temp  in the card, and in the relay-6 automation.
  #     0 means "do not heat".   Read docs/COMPENSATION.md to understand and tune it.
  #     TWO curves: one for radiators and one (much cooler) for underfloor heating.
  #     The underfloor curve is used when  input_boolean.hestia_underfloor  is ON.
  - sensor:
      - name: "Hestia Target Temperature"
        unique_id: hestia_target_temperature
        unit_of_measurement: "°C"
        device_class: temperature
        state: >
          {# ================= RADIATOR curve (see docs/COMPENSATION.md) ================= #}
          {% set base      = 75   %}  {# water temperature when it is 0 °C outside, before the room setpoint shift #}
          {% set slope     = 2.0  %}  {# °C of water for every 1 °C colder outside (the "heating curve") #}
          {% set shift     = 3.0  %}  {# °C of water for every 1 °C the room setpoint is above 21 °C #}
          {% set min_water = 55   %}  {# never ask for less than this when heating (protects a simple boiler) #}
          {% set max_water = 70   %}  {# never ask for more than this #}
          {# ============ UNDERFLOOR curve - TEST VALUES, NOT TESTED IN A REAL HOUSE ============ #}
          {% set base_uf   = 40   %}  {# water temperature when it is 0 °C outside #}
          {% set slope_uf  = 0.8  %}  {# °C of water for every 1 °C colder outside #}
          {% set shift_uf  = 1.0  %}  {# °C of water for every 1 °C the room setpoint is above 21 °C #}
          {% set min_uf    = 30   %}  {# never ask for less than this when heating #}
          {% set max_uf    = 40   %}  {# NEVER ask for more than this. Ask your floor installer for the right value #}
          {# =================================== common =================================== #}
          {% set cutoff    = 22.0 %}  {# at or above this outdoor temperature no heating is requested #}
          {% set underfloor_only = false %}  {# true ONLY if you have underfloor heating and NO radiators #}
          {# ============================================================================== #}
          {# { put your outdoor temperature sensor here } #}
          {% set t_out = states('sensor.YOUR_OUTDOOR_TEMPERATURE') | float(15) %}
          {# { put your room thermostat (climate) here } #}
          {% set t_set = state_attr('climate.YOUR_ROOM_THERMOSTAT', 'temperature') | float(21.0) %}
          {% set uf = underfloor_only or is_state('input_boolean.hestia_underfloor', 'on') %}
          {% set b   = base_uf  if uf else base      %}
          {% set sl  = slope_uf if uf else slope     %}
          {% set sh  = shift_uf if uf else shift     %}
          {% set lo  = min_uf   if uf else min_water %}
          {% set hi  = max_uf   if uf else max_water %}
          {% set target = (b - (t_out * sl)) + ((t_set - 21.0) * sh) %}
          {% if is_state('input_boolean.hestia_turbo', 'on') %}
            {{ max_water }}
          {% elif is_state('binary_sensor.hestia_heating_demand', 'off') %}
            0
          {% elif t_out >= cutoff %}
            0
          {% elif target > hi %}
            {{ hi }}
          {% elif target < lo %}
            {{ lo }}
          {% else %}
            {{ target | round(1) }}
          {% endif %}
```

## 7. What exactly to put in `automations.yaml`

`automations.yaml` is in the same folder as `configuration.yaml`.

1. Make a **copy** of `automations.yaml` first.
2. Open it and paste the two automations below at the **end** of the file. (If the file contains only `[]`, delete the `[]` first.)
3. Replace every `YOUR_...`:
   - `sensor.YOUR_BOILER_SUPPLY_TEMPERATURE` → the **supply / outlet** water sensor of the boiler.
   - `sensor.YOUR_BOILER_RETURN_TEMPERATURE` → the **return / inlet** water sensor of the boiler.
   - `switch.YOUR_RELAY_6_BOILER_ENABLE` → the switch of relay 6.
   - `switch.YOUR_RELAY_7_TURBO` → the switch of relay 7 (only if you have Turbo).
4. Reload: **Developer tools → YAML → Automations** (or restart Home Assistant).

Alternative without files: **Settings → Automations & scenes → Create automation → ⋮ → Edit in YAML**, paste one automation (without the first `- ` dash and with the lines moved to the left by two spaces), and save.

> **Important:** make sure **no other automation** switches the same relay 6. Two automations that fight over the same relay make the boiler start and stop. If you had an older automation for the boiler relay, delete it or turn it off.

The same text is in [`examples/2-automations.yaml`](../examples/2-automations.yaml):

```yaml
# ======================================================================
#  Hestia Flow Card - what to add to your  automations.yaml
#  Version v0.0.1 - made by Mouxritsa together with Claude (first attempt)
# ======================================================================
#  Replace every  YOUR_...  with the entity of YOUR installation.
#  Paste the two automations below at the END of automations.yaml
#  (or create them in the UI: Settings > Automations > Create > Edit in YAML).
#  Read docs/COMPENSATION.md first - it explains every line.
#  TIP: use "Find and replace" of your editor, the placeholders appear several times.
# ======================================================================

# ---- 1) Relay 6: lets the boiler burn (the "compensation" automation) ----
- id: hestia_relay6_boiler_enable
  alias: 'Hestia: boiler enable (relay 6)'
  description: >
    Turns the boiler on when the supply water is colder than the target, and turns it off
    when the warm water has come back (return temperature), with minimum on/off times.
  triggers:
  - trigger: state
    entity_id:
    # { your boiler SUPPLY temperature sensor }
    - sensor.YOUR_BOILER_SUPPLY_TEMPERATURE
    # { your boiler RETURN temperature sensor }
    - sensor.YOUR_BOILER_RETURN_TEMPERATURE
    - sensor.hestia_target_temperature
  - trigger: time_pattern
    minutes: /1
  variables:
    # ---------- numbers you can change (see docs/COMPENSATION.md) ----------
    on_margin: 2        # start when supply is this many °C below the target
    off_return_margin: 8   # stop when the RETURN water reaches (target minus this many °C)
    safety_margin: 10   # stop at once if supply is this many °C ABOVE the target
    hard_limit: 80      # stop at once above this supply temperature (°C)
    min_on: 600         # the boiler stays on at least this many seconds
    min_off: 300        # the boiler stays off at least this many seconds
    # ------------------------------------------------------------------------
    sup: "{{ states('sensor.YOUR_BOILER_SUPPLY_TEMPERATURE') | float(none) }}"
    ret: "{{ states('sensor.YOUR_BOILER_RETURN_TEMPERATURE') | float(none) }}"
    tgt: "{{ states('sensor.hestia_target_temperature') | float(0) }}"
    # { your relay 6 switch (boiler enable) } - keep the quotes and the brackets exactly as they are
    secs: "{{ (now() - states['switch.YOUR_RELAY_6_BOILER_ENABLE'].last_changed).total_seconds() }}"
  actions:
  - choose:
    # SAFETY: a sensor is lost, or the water is too hot  -> off at once
    - conditions:
      - condition: template
        value_template: >
          {{ sup is none or ret is none or sup >= hard_limit
             or (tgt > 0 and sup >= tgt + safety_margin) }}
      sequence:
      - action: switch.turn_off
        target:
          entity_id: switch.YOUR_RELAY_6_BOILER_ENABLE
    # No heat requested -> off
    - conditions:
      - condition: template
        value_template: "{{ tgt == 0 }}"
      sequence:
      - action: switch.turn_off
        target:
          entity_id: switch.YOUR_RELAY_6_BOILER_ENABLE
    # Warm water has come back -> off (but only after the minimum on-time)
    - conditions:
      - condition: state
        entity_id: switch.YOUR_RELAY_6_BOILER_ENABLE
        state: 'on'
      - condition: template
        value_template: "{{ ret >= tgt - off_return_margin and secs > min_on }}"
      sequence:
      - action: switch.turn_off
        target:
          entity_id: switch.YOUR_RELAY_6_BOILER_ENABLE
    # Water is too cold -> on (but only after the minimum off-time)
    - conditions:
      - condition: state
        entity_id: switch.YOUR_RELAY_6_BOILER_ENABLE
        state: 'off'
      - condition: template
        value_template: "{{ sup < tgt - on_margin and ret < tgt - off_return_margin and secs > min_off }}"
      sequence:
      - action: switch.turn_on
        target:
          entity_id: switch.YOUR_RELAY_6_BOILER_ENABLE
  mode: single

# ---- 2) Relay 7: the Turbo button (hot-water tank) -----------------------
#  Only needed if you wired relay 7 in PARALLEL with the thermostat to force the boiler on.
#  Turbo is refused while the house asks for heat, stops above 70 °C, when the supply sensor
#  is lost, and after 60 minutes.
- id: hestia_turbo_relay7
  alias: 'Hestia: Turbo (relay 7)'
  description: Turbo for the hot-water tank. Safe limits - 70 °C, sensor lost, 60 minutes.
  triggers:
  - trigger: state
    entity_id: input_boolean.hestia_turbo
    to: 'on'
    id: turbo_on
  - trigger: state
    entity_id: input_boolean.hestia_turbo
    to: 'off'
    id: turbo_off
  - trigger: numeric_state
    # { your boiler SUPPLY temperature sensor }
    entity_id: sensor.YOUR_BOILER_SUPPLY_TEMPERATURE
    above: 70
    id: too_hot
  - trigger: state
    entity_id: sensor.YOUR_BOILER_SUPPLY_TEMPERATURE
    to:
    - unavailable
    - unknown
    id: sensor_lost
  - trigger: state
    entity_id: input_boolean.hestia_turbo
    to: 'on'
    for:
      minutes: 60
    id: timeout
  actions:
  - choose:
    # Turbo requested and allowed
    - conditions:
      - condition: trigger
        id: turbo_on
      - condition: state
        entity_id: binary_sensor.hestia_heating_demand
        state: 'off'
      - condition: numeric_state
        entity_id: sensor.YOUR_BOILER_SUPPLY_TEMPERATURE
        below: 70
      sequence:
      - action: switch.turn_on
        target:
          # { your relay 7 switch (Turbo) }
          entity_id: switch.YOUR_RELAY_7_TURBO
    # Turbo requested but NOT allowed -> tell the user and put the button back to off
    - conditions:
      - condition: trigger
        id: turbo_on
      sequence:
      - action: persistent_notification.create
        data:
          title: Turbo
          message: >
            Turbo did not start: the house is asking for heat, or the supply sensor is
            unavailable, or the water is already above 70 °C.
      - action: input_boolean.turn_off
        target:
          entity_id: input_boolean.hestia_turbo
    # Turbo switched off by the user
    - conditions:
      - condition: trigger
        id: turbo_off
      sequence:
      - action: switch.turn_off
        target:
          entity_id: switch.YOUR_RELAY_7_TURBO
    # Safety stops: too hot / sensor lost / 60 minutes
    - conditions:
      - condition: trigger
        id:
        - too_hot
        - sensor_lost
        - timeout
      sequence:
      - action: switch.turn_off
        target:
          entity_id: switch.YOUR_RELAY_7_TURBO
      - action: input_boolean.turn_off
        target:
          entity_id: input_boolean.hestia_turbo
  mode: restart
```

## 8. Relay wiring (example)

This is how it is done in my installation. **Wiring a boiler must be done by a qualified person.** Your boiler may be different - follow its manual.

```
                      Boiler burner control
                      (terminals "room thermostat")
                              |
   Room thermostat -- relay 6 (in SERIES: it can only BLOCK the boiler) --+
                                                                         |
   relay 7 (in PARALLEL, COM + NO: it FORCES the boiler on, "Turbo") ----+
```

- **Relay 6 in series with the thermostat:** the boiler burns only when the thermostat **and** relay 6 both allow it. So relay 6 can only **stop** the boiler (for example when the water is hot enough). It can never force the boiler to burn if the thermostat does not ask. This is the safer choice.
- **Relay 7 in parallel (COM + NO):** when it closes, the boiler burns even if the thermostat does not ask. This is used for the Turbo (heating the hot-water tank). Because it bypasses the thermostat, the automation limits it to 70 °C, sensor-lost and 60 minutes.

## 9. Underfloor heating

Underfloor heating needs **much cooler water** (about 35-40 °C, depending on the floor) than radiators (55-70 °C). That is why the compensation has **two curves**:

- When the **radiators** are open, the sensor asks for 55-70 °C.
- When the **underfloor** is open, the sensor asks for 30-40 °C, and **never more than `max_uf`**.

How it chooses: the card has the two buttons **RADIATORS** and **UNDERFLOOR**. Give the card an `underfloor_entity` (the `input_boolean.hestia_underfloor` helper from `examples/1-configuration.yaml`). The buttons then switch this helper (**ON = underfloor, OFF = radiators**) and the compensation sensor reads the same helper. If you leave `underfloor_entity` out, the card remembers the choice only in the browser, and **the sensor cannot see it**, so it will use the radiator curve. If you have both circuits, always use the helper.

Keep the **card limit** `underfloor_max_temp` (default 40) **equal** to `max_uf` in the sensor.

- The **card** blocks the underfloor button when the supply water is above `underfloor_max_temp`. This is only a **help in the picture**.
- The real protection must be **hardware**: a **mixing valve** (or a 3-way mixing valve with its own thermostat) and a **safety thermostat** that stops the underfloor pump when the water is too hot.
- The underfloor numbers are **test values that I did not try in a real house**. Watch your floor for a few days and change them one at a time.
- **Simple (non-condensing) boiler:** with such cool water the return water can be below the safe limit of the boiler (see section 2). You may need a **return-protection valve** or pump. Check your boiler manual.
- If you have **only underfloor heating**, set `underfloor_only: true` in the sensor.
- **Switching circuits while water is hot.** If you press UNDERFLOOR when the supply water is still hot from the radiators, the card refuses (above the limit) until the water has cooled down. This is on purpose.

## 10. Frequently asked questions

**The target is 0 but the house is cold.**
Check `binary_sensor.hestia_heating_demand`. If it is `off`, the thermostat does not ask for heat (or the sensor is wrong). If the demand is `on` and the target is still 0, the outdoor temperature is above the `cutoff`.

**The boiler starts and stops every few minutes.**
See [section 5](#5-how-to-tune-it-for-your-house). First check that no second automation switches relay 6, and that the sensors have the right names (supply and return are not swapped).

**What happens if my outdoor temperature sensor is lost?**
The example sensor then assumes 15 °C outside, so while the house asks for heat it requests the minimum water temperature (55 °C). Change `float(15)` in the template if you prefer another value.

**Do I need the Turbo part?**
Only if you have a relay 7 wired in parallel and a hot-water tank on the boiler.

**Can I use a different set of numbers for summer and winter?**
Yes - change the numbers in the template sensor. A simple way is to raise `cutoff` in autumn and lower it in spring.

**I raised the thermostat to 30 °C and the water went to 70 °C with the underfloor open.**
In the first version of these examples there was only one curve. Use the examples of this version: the sensor chooses the underfloor curve when `input_boolean.hestia_underfloor` is ON and never asks for more than `max_uf`. Check that the card has the same helper as `underfloor_entity`.

**The card shows no target.**
Set `target_temp` to `sensor.hestia_target_temperature` in the card.

**Why not do all of this inside the card?**
A card only runs while a browser shows it. A boiler must be controlled by something that always runs, so Home Assistant automations are the right place.
