import express, { Request, Response } from "express";

// ==== Type Definitions, feel free to add or modify ==========================
interface cookbookEntry {
  name: string;
  type: string;
}

interface requiredItem {
  name: string;
  quantity: number;
}

interface recipe extends cookbookEntry {
  requiredItems: requiredItem[];
}

interface ingredient extends cookbookEntry {
  cookTime: number;
}

// =============================================================================
// ==== HTTP Endpoint Stubs ====================================================
// =============================================================================
const app = express();
app.use(express.json());

// Store your recipes here!
const cookbook: (recipe | ingredient)[] = [];

// Task 1 helper (don't touch)
app.post("/parse", (req: Request, res: Response) => {
  const { input } = req.body;

  const parsed_string = parse_handwriting(input)
  if (parsed_string == null) {
    res.status(400).send("this string is cooked");
    return;
  }
  res.json({ msg: parsed_string });
  return;

});

// [TASK 1] ====================================================================
// Takes in a recipeName and returns it in a form that is legible
const hyphen_underscore_regex = /[-_]/g;
const non_alpha = /[^a-z ]/g;
// matches all instances of a (start of string | whitespace) followed by non-whitespace
// decided to use \s and \S instead of ' ' and [a-z] for clarity of intent
const first_letter_regex = /(^|\s)\S/g;
const multiple_spaces = / +/g;
const parse_handwriting = (recipeName: string): string | null => {
  let res = recipeName.trim().toLowerCase()
    .replace(hyphen_underscore_regex, ' ')
    .replace(non_alpha, '')
    .replace(first_letter_regex, (firstLetter) => firstLetter.toUpperCase())
    .replace(multiple_spaces, ' ');
  return res.length > 0 ? res : null;
}

// [TASK 2] ====================================================================
// Endpoint that adds a CookbookEntry to your magical cookbook
app.post("/entry", (req: Request, res: Response) => {
  const { name, type, _ } = req.body;
  let fail = false;
  let failMsg = "";

  if (cookbook.some(x => x.name == name)) {
    fail = true
    failMsg = "entry in cookbook is already present"
  } else if (type == "recipe") {
    const requiredItems: requiredItem[] = req.body.requiredItems;
    const itemNames = requiredItems.map(item => item.name);
    const uniqueItemNames = new Set(itemNames);

    if (uniqueItemNames.size !== itemNames.length) {
      fail = true;
      failMsg = "required items must be unique";
    }

    if (!fail) cookbook.push({ name, type, requiredItems })

  } else if (type == "ingredient") {
    const cookTime: number = req.body.cookTime;

    if (cookTime < 0) {
      fail = true
      failMsg = "invalid cook time"
    }

    if (!fail) cookbook.push({ name, type, cookTime })

  } else {
    fail = true
    failMsg = "invalid type"
  }

  if (fail) {
    res.status(400).send(failMsg)
  } else {
    res.status(200).send("successfully added to the cookbook")
  }

});

// [TASK 3] ====================================================================
// Endpoint that returns a summary of a recipe that corresponds to a query name
app.get("/summary", (req: Request, res: Request) => {
  const recipeName = req.query.name as string;
  const recipeEntry = cookbook.find(x => x.name === recipeName && x.type === "recipe") as recipe | undefined;

  if (!recipeEntry || recipeEntry.type != "recipe") {
    res.status(400).send("recipe not found");
    return;
  }

  let totalCookTime = 0;
  const ingredientMap: Map<string, number> = new Map();

  function collectIngredients(entryName: string, multiplier: number = 1) {
    const entry = cookbook.find(x => x.name === entryName);
    if (!entry) throw Error(`Couldn't find ${entryName} in the cookbook`);

    if (entry.type === "ingredient") {
      const ing = entry as ingredient;
      totalCookTime += ing.cookTime * multiplier;
      ingredientMap.set(ing.name, (ingredientMap.get(ing.name) || 0) + multiplier);
    } else if (entry.type === "recipe") {
      const rec = entry as recipe;
      for (const item of rec.requiredItems) {
        collectIngredients(item.name, item.quantity * multiplier);
      }
    }
  }

  try {
    collectIngredients(recipeEntry.name);
  } catch (e) {
    res.status(400).send((e as Error).message);
    return;
  }

  const ingredients = Array.from(ingredientMap.entries()).map(([name, quantity]) => ({ name, quantity }));

  res.json({
    cookTime: totalCookTime,
    ingredients
  });

});

// =============================================================================
// ==== DO NOT TOUCH ===========================================================
// =============================================================================
const port = 8080;
app.listen(port, () => {
  console.log(`Running on: http://127.0.0.1:8080`);
});
