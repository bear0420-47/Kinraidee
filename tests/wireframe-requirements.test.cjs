const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "wireframe.html"), "utf8");
const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(match => match[1]);
const appScript = inlineScripts.at(-1);

const catalogSource = appScript.match(/const menuCatalog = (\[[\s\S]*?\n    \]);/)[1];
const catalog = vm.runInNewContext(catalogSource);
const filterFunctions = appScript.match(/function itemId[\s\S]*?(?=\n    function cardMarkup)/)[0];
const availableFunction = appScript.match(/function availableItems\(\) \{[\s\S]*?\n    \}/)[0];

function runFilters(overrides = {}) {
  const state = {
    budget: "฿50–100",
    mood: "Surprise me",
    type: "Any food type",
    area: "Any area near MFU",
    rejected: new Set(),
    ...overrides
  };
  const context = { menuCatalog: catalog, state, result: null };
  vm.runInNewContext(filterFunctions + "\n" + availableFunction + "\nresult = availableItems();", context);
  return { result: context.result, state };
}

test("inline application script parses", () => {
  assert.doesNotThrow(() => new vm.Script(appScript));
});

test("wireframe has unique element ids and all referenced local images", () => {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);

  const imagePaths = [...html.matchAll(/(?:src|image:)\s*=?:?\s*"?(assets\/food\/[^"'}\s]+)/g)]
    .map(match => match[1]);
  assert.ok(imagePaths.length >= 45);
  for (const imagePath of imagePaths) {
    assert.ok(fs.existsSync(path.join(root, imagePath)), "Missing image: " + imagePath);
  }
});

test("catalog contains 45 menus across five balanced food types", () => {
  assert.equal(catalog.length, 45);
  const counts = new Map();
  for (const item of catalog) counts.set(item.type, (counts.get(item.type) || 0) + 1);
  assert.deepEqual([...counts.values()].sort(), [9, 9, 9, 9, 9]);
});

test("budget is a mandatory filter", () => {
  const low = runFilters({ budget: "Under ฿50", type: "Rice dishes" }).result;
  const regular = runFilters({ budget: "฿50–100", type: "Rice dishes" }).result;
  assert.ok(low.length > 0);
  assert.ok(regular.length > low.length);
  assert.ok(low.every(item => Number(item.price.replace(/[^0-9]/g, "")) < 50));
  assert.ok(regular.every(item => {
    const price = Number(item.price.replace(/[^0-9]/g, ""));
    return price >= 50 && price <= 100;
  }));
});

test("mood, food type, and area all change the qualifying set", () => {
  const spicyRice = runFilters({ mood: "Spicy", type: "Rice dishes" }).result;
  const freshRice = runFilters({ mood: "Fresh", type: "Rice dishes" }).result;
  const dorm = runFilters({ area: "Dormitory area" }).result;
  const banDu = runFilters({ area: "Ban Du and Nang Lae" }).result;

  assert.ok(spicyRice.length > 0);
  assert.notDeepEqual(spicyRice.map(item => item.name), freshRice.map(item => item.name));
  assert.ok(dorm.length > 0);
  assert.ok(banDu.length > 0);
  assert.ok(dorm.every(item => /Dormitory|dormitory|Kochaphon|Lamduan/i.test(item.area)));
  assert.ok(banDu.every(item => /Ban Du|Nang Lae/i.test(item.area)));
});

test("rejected choices stay out of the session pool", () => {
  const filtered = runFilters({ type: "Fast food" });
  assert.ok(filtered.result.length > 0);
  const rejectedId = filtered.result[0].name + "::" + filtered.result[0].restaurant;
  filtered.state.rejected.add(rejectedId);
  const context = { menuCatalog: catalog, state: filtered.state, result: null };
  vm.runInNewContext(filterFunctions + "\n" + availableFunction + "\nresult = availableItems();", context);
  assert.ok(context.result.every(item => item.name + "::" + item.restaurant !== rejectedId));
});

test("required empty, edit, reset, and shuffle states are represented", () => {
  for (const id of [
    "empty-state",
    "empty-edit",
    "empty-reset",
    "shuffle-results"
  ]) {
    assert.match(html, new RegExp('id="' + id + '"'));
  }
  assert.match(appScript, /slice\(0, 3\)/);
  assert.match(appScript, /state\.rejected\.add/);
});

test("step three presents only the shuffle action", () => {
  const controls = html.match(/<div class="results-controls">([\s\S]*?)<\/div>/)[1];
  assert.equal((controls.match(/<button\b/g) || []).length, 1);
  assert.match(controls, /id="shuffle-results"/);
  assert.doesNotMatch(controls, /Pick one for me|Edit conditions|Start new session/);
});

test("current-area shortcut and its hidden location flow are absent", () => {
  assert.doesNotMatch(html, /Use current area|location-notice-button|location-overlay/);
});

test("area filter uses an accessible doodle-styled dropdown menu", () => {
  assert.match(html, /class="doodle-select border border-2" id="area-select-shell"/);
  assert.match(html, /id="area-select" type="button" aria-haspopup="listbox"/);
  assert.match(html, /class="doodle-select-arrow" aria-hidden="true"/);
  assert.match(html, /id="area-options" role="listbox"/);
  assert.equal((html.match(/class="doodle-option" role="option"/g) || []).length, 4);
  assert.match(appScript, /function chooseArea\(option\)/);
  assert.match(appScript, /event\.key === "Escape"/);
});

test("header presents one clear action", () => {
  const nav = html.match(/<nav aria-label="Main navigation">([\s\S]*?)<\/nav>/)[1];
  assert.equal((nav.match(/<button\b/g) || []).length, 1);
  assert.equal((nav.match(/<a\b/g) || []).length, 0);
  assert.match(nav, />Start choosing<\/button>/);
});

test("whole-baht budget boundaries belong to exactly one range", () => {
  const budgets = ["Under ฿50", "฿50–100", "฿101–200"];
  for (const [price, expected] of [[49, 0], [50, 1], [100, 1], [101, 2], [200, 2], [201, -1]]) {
    const matches = budgets.map(budget => {
      const context = { state: { budget }, item: { price: "≈฿" + price } };
      return vm.runInNewContext(filterFunctions + "\nmatchesBudget(item);", context);
    });
    assert.deepEqual(matches, budgets.map((_, index) => index === expected), "Price: " + price);
  }
});

test("empty results distinguish changed conditions from exhausted matching choices", () => {
  const renderSource = appScript.match(/function renderShortlist\(\) \{[\s\S]*?\n    \}/)[0];
  const rejected = new Set(["earlier choice"]);
  for (const matchingCount of [0, 2]) {
    let message;
    const context = {
      state: { rejected },
      availableItems: () => [],
      qualifyingItems: () => Array(matchingCount).fill({}),
      preferredItems: items => items,
      showEmptyState: (title, copy) => { message = { title, copy }; },
      updateSummary: () => {}
    };
    vm.runInNewContext(renderSource + "\nrenderShortlist();", context);
    assert.equal(message.title, matchingCount ? "You reviewed every matching choice" : "No choices match every condition");
    assert.match(message.copy, matchingCount ? /Start a new session/ : /wider budget or area/);
  }
});

test("every meal has explicit taste and area labels", () => {
  for (const item of catalog) {
    assert.ok(item.moods.length > 0, item.name);
    assert.ok(item.moods.every(mood => ["Spicy", "Fresh", "Comforting"].includes(mood)), item.name);
    assert.ok([null, "campus", "dorm", "ban-du"].includes(item.areaKey), item.name);
  }
});

test("names and distance descriptions cannot override explicit matching labels", () => {
  const context = {
    state: { mood: "Spicy", area: "MFU campus and front gate" },
    item: { name: "Spicy Korean Chicken", type: "Fast food", moods: ["Comforting"], area: "1.6 km from MFU", areaKey: null }
  };
  assert.equal(vm.runInNewContext(filterFunctions + "\nmatchesMood(item);", context), false);
  assert.equal(vm.runInNewContext(filterFunctions + "\nmatchesArea(item);", context), false);
  const campus = runFilters({ area: "MFU campus and front gate" }).result;
  assert.ok(campus.length > 0);
  assert.ok(campus.every(item => item.areaKey === "campus"));
  assert.ok(campus.every(item => item.restaurant !== "The Little Things"));
});

test("meal explanations contain the selected meal's own details", () => {
  const context = { state: { mood: "Surprise me" }, item: catalog[1] };
  const reason = vm.runInNewContext(filterFunctions + "\nreasonFor(item);", context);
  assert.match(reason, /฿45/);
  assert.match(reason, /MFU campus/);
  assert.match(reason, /Rice dishes/);
});

function sessionContext(overrides = {}) {
  const state = {
    budget: "฿50–100", mood: "Surprise me", type: "Any food type", area: "Any area near MFU",
    rejected: new Set(), seen: new Set(), shown: [], undo: null, ...overrides
  };
  const context = vm.createContext({ state, menuCatalog: catalog });
  const shuffleSource = appScript.match(/function shuffled\(items\) \{[\s\S]*?\n    \}/)[0];
  const sessionSource = appScript.match(/function preferredItems[\s\S]*?(?=\n    function clearUndo)/)[0];
  vm.runInContext(filterFunctions + "\n" + availableFunction + "\n" + shuffleSource + "\n" + sessionSource, context);
  return context;
}

test("shuffle prefers unseen meals, then reviewed meals outside the current shortlist", () => {
  const context = sessionContext();
  const candidates = vm.runInContext("availableItems()", context);
  context.state.shown = candidates.slice(0, 3);
  context.state.shown.forEach(item => context.state.seen.add(item.name + "::" + item.restaurant));
  let next = vm.runInContext("preferredItems(availableItems()).slice(0, 3)", context);
  assert.equal(next.length, 3);
  assert.ok(next.every(item => !context.state.seen.has(item.name + "::" + item.restaurant)));
  candidates.forEach(item => context.state.seen.add(item.name + "::" + item.restaurant));
  next = vm.runInContext("preferredItems(availableItems()).slice(0, 3)", context);
  assert.ok(next.every(item => !context.state.shown.includes(item)));
});

test("rejection replaces in place with an unseen choice and Undo restores the exact shortlist", () => {
  const context = sessionContext();
  const candidates = vm.runInContext("availableItems()", context);
  const initial = candidates.slice(0, 3);
  context.state.shown = initial;
  initial.forEach(item => context.state.seen.add(item.name + "::" + item.restaurant));
  context.id = initial[1].name + "::" + initial[1].restaurant;
  assert.equal(vm.runInContext("rejectChoice(id)", context), true);
  const next = context.state.shown;
  assert.equal(next[0], initial[0]);
  assert.equal(next[2], initial[2]);
  assert.notEqual(next[1], initial[1]);
  assert.ok(!context.state.seen.has(next[1].name + "::" + next[1].restaurant));
  assert.equal(new Set(next.map(item => item.name + "::" + item.restaurant)).size, 3);
  assert.ok(!vm.runInContext("availableItems()", context).includes(initial[1]));
  assert.equal(vm.runInContext("undoRejection()", context), 1);
  assert.deepEqual(Array.from(context.state.shown), Array.from(initial));
  assert.equal(context.state.rejected.has(context.id), false);
  assert.equal(vm.runInContext("undoRejection()", context), null);
});

test("Undo recovers an exhausted shortlist and only reverses the latest rejection", () => {
  const context = sessionContext({ budget: "Under ฿50", type: "Rice dishes" });
  const initial = vm.runInContext("availableItems()", context);
  assert.equal(initial.length, 1);
  context.state.shown = initial;
  context.id = initial[0].name + "::" + initial[0].restaurant;
  vm.runInContext("rejectChoice(id)", context);
  assert.equal(context.state.shown.length, 0);
  vm.runInContext("undoRejection()", context);
  assert.deepEqual(Array.from(context.state.shown), Array.from(initial));

  const broad = sessionContext();
  broad.state.shown = vm.runInContext("availableItems().slice(0,3)", broad);
  broad.firstId = broad.state.shown[0].name + "::" + broad.state.shown[0].restaurant;
  vm.runInContext("rejectChoice(firstId)", broad);
  broad.secondId = broad.state.shown[1].name + "::" + broad.state.shown[1].restaurant;
  vm.runInContext("rejectChoice(secondId); undoRejection();", broad);
  assert.equal(broad.state.rejected.has(broad.firstId), true);
  assert.equal(broad.state.rejected.has(broad.secondId), false);
});
