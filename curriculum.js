"use strict";

window.KRID_WORLDS = {
  fractions: {
    title: "Fraction Frontier",
    subject: "Mathematics realm",
    badge: "FR",
    accent: "#c9ff55",
    intro: "The Number Line has cracked into unequal pieces. Rebuild it before the Glitch declares one half smaller than one third.",
    concepts: [
      {
        title: "Parts of a whole",
        short: "Numerator & denominator",
        explanation: "A fraction describes equal parts of one whole. The numerator tells how many parts you have; the denominator tells how many equal parts the whole contains.",
        memory: "Top counts the chosen parts. Bottom names the total equal parts.",
        example: "In 3/8, the whole has 8 equal parts and 3 of them are selected.",
        question: {
          prompt: "A pizza is cut into 8 equal slices and you eat 3. Which fraction was eaten?",
          options: ["3/8", "8/3", "5/8", "3/5"], answer: 0,
          hint: "The number eaten goes on top; the total number of equal slices goes below.",
          success: "Correct. The pizza has become mathematics, which is its second-best destiny."
        },
        boss: {
          prompt: "In the fraction 7/10, what does the denominator represent?",
          options: ["Seven chosen parts", "Ten equal parts in the whole", "Three missing parts", "The size of each chosen part"], answer: 1,
          hint: "The denominator is the bottom number. It names how many equal pieces form the whole."
        }
      },
      {
        title: "Equivalent fractions",
        short: "Same value, new outfit",
        explanation: "Equivalent fractions look different but represent the same amount. Multiply or divide both numerator and denominator by the same non-zero number.",
        memory: "Whatever you do to the top, do to the bottom.",
        example: "1/2 × 3/3 = 3/6. Both fractions cover exactly half a whole.",
        question: {
          prompt: "Which fraction is equivalent to 2/3?",
          options: ["3/4", "4/6", "4/5", "6/8"], answer: 1,
          hint: "Multiply both 2 and 3 by the same number.",
          success: "Yes. 2/3 put on a 4/6 disguise, but you recognized it."
        },
        boss: {
          prompt: "Complete the equivalence: 3/5 = ?/20",
          options: ["8", "10", "12", "15"], answer: 2,
          hint: "Five was multiplied by 4 to become 20. Apply the same change to 3."
        }
      },
      {
        title: "Comparing fractions",
        short: "Which is larger?",
        explanation: "When denominators match, compare numerators. When they differ, use a common denominator or compare cross-products.",
        memory: "Same bottom? Bigger top wins. Different bottoms? Make them match.",
        example: "3/4 and 5/8 become 6/8 and 5/8, so 3/4 is greater.",
        question: {
          prompt: "Which statement is true?",
          options: ["2/5 > 3/5", "3/4 < 2/3", "5/6 > 4/6", "1/2 > 3/4"], answer: 2,
          hint: "One option already has matching denominators, so compare its numerators.",
          success: "Exactly. Five sixths wins by one tiny, extremely confident sixth."
        },
        boss: {
          prompt: "Which fraction is greatest?",
          options: ["2/3", "3/5", "5/8", "7/12"], answer: 0,
          hint: "Compare decimal values or rewrite them with a common denominator."
        }
      },
      {
        title: "Adding fractions",
        short: "Combine equal pieces",
        explanation: "Fractions can be added directly only when their denominators match. Find a common denominator first, then add the numerators and simplify.",
        memory: "Match the pieces, add the counts, simplify the result.",
        example: "1/3 + 1/6 = 2/6 + 1/6 = 3/6 = 1/2.",
        question: {
          prompt: "What is 1/4 + 2/4?",
          options: ["3/8", "3/4", "2/8", "1/2"], answer: 1,
          hint: "The pieces are already the same size. Keep the denominator and add the numerators.",
          success: "Three quarters. The denominators stayed calm and nobody added them."
        },
        boss: {
          prompt: "What is 2/3 + 1/6 in simplest form?",
          options: ["3/9", "3/6", "5/6", "1"], answer: 2,
          hint: "Rewrite 2/3 as sixths before adding."
        }
      }
    ]
  },

  photosynthesis: {
    title: "Chlorophyll City",
    subject: "Biology realm",
    badge: "PH",
    accent: "#79ef8b",
    intro: "The city plants have forgotten how to cook sunlight. Restore their green factories before everyone is forced to eat soil soup.",
    concepts: [
      {
        title: "The big purpose", short: "Light into food",
        explanation: "Photosynthesis is the process plants, algae, and some bacteria use to convert light energy into chemical energy stored in glucose.",
        memory: "Plants do not eat sunlight; they use its energy to manufacture glucose.",
        example: "A leaf captures light and stores part of that energy in the bonds of a glucose molecule.",
        question: { prompt: "What is the main energy-rich product of photosynthesis?", options: ["Oxygen", "Glucose", "Carbon dioxide", "Nitrogen"], answer: 1, hint: "It is a sugar that stores chemical energy.", success: "Glucose secured. The leaf café can reopen." },
        boss: { prompt: "Photosynthesis changes light energy mainly into what form?", options: ["Sound energy", "Chemical energy", "Kinetic energy", "Nuclear energy"], answer: 1, hint: "The energy ends up stored in the chemical bonds of sugar." }
      },
      {
        title: "Ingredients & products", short: "The leaf recipe",
        explanation: "Plants use carbon dioxide and water, powered by light, to make glucose and oxygen. The balanced summary is 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂.",
        memory: "Carbon dioxide + water + light → glucose + oxygen.",
        example: "Roots supply water, stomata admit carbon dioxide, and oxygen leaves through the stomata.",
        question: { prompt: "Which pair contains both raw materials used in photosynthesis?", options: ["Glucose and oxygen", "Water and carbon dioxide", "Light and oxygen", "Soil and glucose"], answer: 1, hint: "Choose the substances on the left side of the word equation.", success: "Recipe restored. Soil was disappointed not to be the main course." },
        boss: { prompt: "Which gas is released as a product of photosynthesis?", options: ["Carbon dioxide", "Methane", "Oxygen", "Nitrogen"], answer: 2, hint: "It is produced when water molecules are split during the light reactions." }
      },
      {
        title: "Chloroplast control room", short: "Where it happens",
        explanation: "Photosynthesis occurs in chloroplasts. Chlorophyll in the thylakoid membranes absorbs light; the Calvin cycle in the stroma helps build sugar.",
        memory: "Thylakoids catch light. The stroma builds sugar.",
        example: "Stacks of thylakoids called grana provide a large surface area for light-dependent reactions.",
        question: { prompt: "Which cell structure is the main site of photosynthesis?", options: ["Mitochondrion", "Nucleus", "Chloroplast", "Ribosome"], answer: 2, hint: "Look for the organelle that contains chlorophyll.", success: "Chloroplast located. It was green and not hiding very effectively." },
        boss: { prompt: "Where in a chloroplast is chlorophyll mainly located?", options: ["The outer cell wall", "Thylakoid membranes", "The nucleus", "The cytoplasm"], answer: 1, hint: "These flattened membrane sacs are stacked into grana." }
      },
      {
        title: "Limiting factors", short: "What controls the rate",
        explanation: "Light intensity, carbon dioxide concentration, and temperature can limit the rate. Raising one helps only until a different factor becomes limiting.",
        memory: "The scarcest requirement sets the speed limit.",
        example: "More light may stop increasing the rate if carbon dioxide is already too scarce.",
        question: { prompt: "Light is plentiful, but carbon dioxide is very low. What most likely limits photosynthesis?", options: ["Oxygen", "Carbon dioxide", "Chlorophyll color", "Glucose"], answer: 1, hint: "The process cannot speed up without enough of every required input.", success: "Correct. Carbon dioxide was the bottleneck wearing a tiny traffic cone." },
        boss: { prompt: "Why can very high temperatures slow photosynthesis?", options: ["Light disappears", "Enzymes lose their functional shape", "Water turns into glucose", "Chlorophyll becomes oxygen"], answer: 1, hint: "Photosynthesis depends on enzymes, and proteins are sensitive to excessive heat." }
      }
    ]
  },

  javascript: {
    title: "JavaScript Jungle",
    subject: "Coding realm",
    badge: "JS",
    accent: "#ffd765",
    intro: "The jungle console is throwing errors like coconuts. Debug its vines, variables, and loops before the Infinite While-serpent wakes up.",
    concepts: [
      {
        title: "Variables", short: "Store useful values",
        explanation: "Variables give names to values. Use const when the binding should not be reassigned and let when it will change. Avoid var in modern beginner code because its scope is less predictable.",
        memory: "const stays bound; let can be reassigned.",
        example: "const playerName = 'Ari'; let score = 0; score = score + 10;",
        question: { prompt: "Which declaration is best for a score that will change?", options: ["const score = 0", "let score = 0", "fixed score = 0", "value score = 0"], answer: 1, hint: "Choose the keyword that permits reassignment.", success: "Variable captured. It has promised to change responsibly." },
        boss: { prompt: "What happens if code tries to reassign a const variable?", options: ["It silently changes", "It causes an error", "It becomes a let", "It deletes the value"], answer: 1, hint: "A const binding cannot be assigned a different value later." }
      },
      {
        title: "Types & comparisons", short: "Know your data",
        explanation: "Common primitive values include strings, numbers, booleans, undefined, bigint, symbol, and null. Strict equality (===) compares value and type without coercion.",
        memory: "Three equals signs ask: same value and same type?",
        example: "5 === '5' is false because one is a number and one is a string.",
        question: { prompt: "What is the result of 3 === '3'?", options: ["true", "false", "undefined", "A syntax error"], answer: 1, hint: "Strict equality compares both the value and its type.", success: "False. The number 3 refused to impersonate the string '3'." },
        boss: { prompt: "Which value has the boolean type?", options: ["'false'", "0", "false", "'0'"], answer: 2, hint: "Quotation marks create strings, even when the text looks boolean-like." }
      },
      {
        title: "Functions", short: "Reusable behavior",
        explanation: "A function packages instructions so they can be called repeatedly. Parameters receive inputs; return sends a result back to the caller.",
        memory: "Parameters enter. A return value exits.",
        example: "function double(n) { return n * 2; } gives double(4) the value 8.",
        question: { prompt: "What does return do inside a JavaScript function?", options: ["Repeats the function forever", "Sends a value back and exits the function", "Prints automatically", "Renames a parameter"], answer: 1, hint: "It gives the caller the function's result.", success: "Return value delivered. No postage required." },
        boss: { prompt: "What value does add(2, 5) return if add is (a, b) => a + b?", options: ["25", "7", "a + b", "undefined"], answer: 1, hint: "Replace a with 2 and b with 5, then evaluate the expression." }
      },
      {
        title: "Loops & arrays", short: "Repeat with control",
        explanation: "Arrays hold ordered collections. Loops process repeated steps; a for...of loop visits each array value without manually managing an index.",
        memory: "Arrays collect values. Loops visit them.",
        example: "for (const fruit of fruits) { console.log(fruit); } visits every item once.",
        question: { prompt: "Which expression reads the first item in an array named colors?", options: ["colors[1]", "colors.first", "colors[0]", "colors(-1)"], answer: 2, hint: "JavaScript array indexes begin at zero.", success: "Index zero found. Computers enjoy starting races before one arrives." },
        boss: { prompt: "What is the main danger of a loop whose condition never becomes false?", options: ["It changes into an array", "It can run indefinitely", "It returns zero", "It deletes the function"], answer: 1, hint: "A while loop needs a condition that can eventually stop it." }
      }
    ]
  },

  solar: {
    title: "Orbit Outpost",
    subject: "Space science realm",
    badge: "OR",
    accent: "#b7a8ff",
    intro: "The Outpost navigation computer has put Mars inside the Sun and labelled Earth ‘probably round.’ Restore the Solar System immediately.",
    concepts: [
      {
        title: "Our star", short: "The Solar System's center",
        explanation: "The Sun is a medium-sized star containing about 99.8% of the Solar System's mass. Its gravity keeps planets and other bodies in orbit.",
        memory: "Most mass is in the Sun, so its gravity dominates the system.",
        example: "Earth continuously falls toward the Sun but its sideways motion keeps it in orbit.",
        question: { prompt: "What keeps Earth moving in orbit around the Sun?", options: ["Solar wind", "The Sun's gravity", "Earth's magnetic field", "Moonlight"], answer: 1, hint: "The most massive object provides the dominant attractive force.", success: "Orbit stabilized. Earth may continue its extremely long lap." },
        boss: { prompt: "The Sun produces energy mainly through which process?", options: ["Combustion", "Nuclear fusion", "Nuclear fission", "Friction"], answer: 1, hint: "Hydrogen nuclei combine to form helium in the core." }
      },
      {
        title: "Planet families", short: "Rocky and giant worlds",
        explanation: "Mercury, Venus, Earth, and Mars are small rocky planets. Jupiter and Saturn are gas giants; Uranus and Neptune are ice giants.",
        memory: "Four rocky inner planets, then four giant outer planets.",
        example: "The asteroid belt lies mainly between rocky Mars and giant Jupiter.",
        question: { prompt: "Which planet is a rocky inner planet?", options: ["Neptune", "Saturn", "Mars", "Jupiter"], answer: 2, hint: "It is one of the first four planets from the Sun.", success: "Mars identified. It remains red, rocky, and dramatic." },
        boss: { prompt: "Which pair consists of ice giants?", options: ["Earth and Mars", "Jupiter and Saturn", "Uranus and Neptune", "Mercury and Venus"], answer: 2, hint: "They are the two farthest major planets from the Sun." }
      },
      {
        title: "Rotation & revolution", short: "Days and years",
        explanation: "Rotation is a body's spin on its axis and creates day-night cycles. Revolution is motion around another body and defines a planet's year.",
        memory: "Rotate for a day. Revolve for a year.",
        example: "Earth rotates in about 24 hours and revolves around the Sun in about 365.25 days.",
        question: { prompt: "Which motion mainly causes day and night on Earth?", options: ["Earth's rotation", "Earth's revolution", "The Moon's revolution", "The Sun's rotation"], answer: 0, hint: "Think of Earth spinning different locations into and out of sunlight.", success: "Day-night cycle repaired. Bedtimes are once again scientifically enforceable." },
        boss: { prompt: "Why do planets farther from the Sun generally have longer years?", options: ["They rotate more slowly", "They travel larger orbits and move more slowly", "They have more moons", "They receive less light"], answer: 1, hint: "A farther planet has a longer path and a lower orbital speed." }
      },
      {
        title: "Moons & smaller bodies", short: "The supporting cast",
        explanation: "Moons orbit planets. Dwarf planets orbit the Sun but have not cleared their orbital neighborhood. Asteroids are mostly rocky; comets contain ice and dust.",
        memory: "Comets are icy; asteroids are mostly rocky; moons orbit planets.",
        example: "A comet's tail develops near the Sun and points mostly away from it because of radiation and solar wind.",
        question: { prompt: "Which object is typically made of ice, dust, and rock and may grow a tail near the Sun?", options: ["A moon", "A comet", "A gas giant", "A star"], answer: 1, hint: "Its frozen material heats and releases gas and dust near the Sun.", success: "Comet confirmed. Tail magnificent. Personal space questionable." },
        boss: { prompt: "Why is Pluto classified as a dwarf planet?", options: ["It has no gravity", "It does not orbit the Sun", "It has not cleared its orbital neighborhood", "It is made only of gas"], answer: 2, hint: "It meets two planet criteria but not the orbital-clearing criterion." }
      }
    ]
  },

  digestion: {
    title: "Digestive Dungeon",
    subject: "Human biology realm",
    badge: "DG",
    accent: "#ff8d5b",
    intro: "A sandwich has entered the dungeon and lost its map. Guide nutrients to the bloodstream before the Large Intestine claims everything as furniture.",
    concepts: [
      {
        title: "Mechanical & chemical", short: "Two kinds of breakdown",
        explanation: "Mechanical digestion physically breaks food into smaller pieces. Chemical digestion uses enzymes and other chemicals to break large molecules into absorbable units.",
        memory: "Mechanical changes size. Chemical changes molecules.",
        example: "Chewing is mechanical; salivary amylase chemically starts breaking starch down.",
        question: { prompt: "Which is an example of chemical digestion?", options: ["Teeth crushing food", "The stomach churning", "Amylase breaking down starch", "The tongue moving food"], answer: 2, hint: "Choose the process where an enzyme changes a food molecule.", success: "Chemical digestion spotted. The enzyme denies chewing anything." },
        boss: { prompt: "Why does chewing help chemical digestion?", options: ["It produces glucose", "It increases food's surface area", "It absorbs all nutrients", "It neutralizes every acid"], answer: 1, hint: "Smaller pieces expose more food to enzymes." }
      },
      {
        title: "The route", short: "Mouth to intestine",
        explanation: "Food travels through the mouth, esophagus, stomach, small intestine, large intestine, rectum, and anus. Peristalsis pushes it along.",
        memory: "Mouth → esophagus → stomach → small intestine → large intestine.",
        example: "Wave-like muscle contractions called peristalsis move a swallowed bite through the esophagus.",
        question: { prompt: "Which organ receives food directly after the esophagus?", options: ["Small intestine", "Liver", "Stomach", "Large intestine"], answer: 2, hint: "This muscular sac churns food and mixes it with acid and enzymes.", success: "Route corrected. The sandwich has stopped asking the liver for directions." },
        boss: { prompt: "What is peristalsis?", options: ["Nutrient diffusion", "Wave-like muscle contractions", "The release of insulin", "The production of bile"], answer: 1, hint: "It is the coordinated muscular motion that pushes material along the digestive tract." }
      },
      {
        title: "Absorption", short: "Nutrients enter the body",
        explanation: "Most nutrient absorption occurs in the small intestine. Villi and microvilli create a very large surface area for efficient transfer into blood and lymph.",
        memory: "Small intestine, huge surface area.",
        example: "Glucose and amino acids enter blood capillaries in villi; many fats enter lymph vessels called lacteals.",
        question: { prompt: "Which feature helps the small intestine absorb nutrients efficiently?", options: ["Thick smooth walls", "Villi with a large surface area", "A very low blood supply", "Hard tooth-like structures"], answer: 1, hint: "More surface touching digested food allows faster absorption.", success: "Villi activated. Tiny structures, enormous work ethic." },
        boss: { prompt: "Where does most digested glucose enter after crossing the small intestine wall?", options: ["The lungs", "Blood capillaries", "The stomach", "The large intestine"], answer: 1, hint: "Water-soluble nutrients are carried away in the bloodstream." }
      },
      {
        title: "Helper organs", short: "Liver, pancreas, gallbladder",
        explanation: "The liver makes bile, the gallbladder stores it, and the pancreas releases digestive enzymes and bicarbonate into the small intestine.",
        memory: "Liver makes bile; gallbladder stores it; pancreas sends enzymes.",
        example: "Bile emulsifies fat into small droplets, increasing the surface available to lipase.",
        question: { prompt: "Which organ produces bile?", options: ["Pancreas", "Stomach", "Liver", "Gallbladder"], answer: 2, hint: "The gallbladder stores this substance but does not make it.", success: "The liver made it. The gallbladder was merely running the warehouse." },
        boss: { prompt: "What is one digestive role of pancreatic bicarbonate?", options: ["Digesting protein directly", "Neutralizing acidic material from the stomach", "Making bile", "Absorbing glucose"], answer: 1, hint: "Enzymes in the small intestine work better when the stomach acid is neutralized." }
      }
    ]
  },

  climate: {
    title: "Climate Command",
    subject: "Earth science realm",
    badge: "CL",
    accent: "#57e6ed",
    intro: "The weather machine thinks one rainy Tuesday proves an ice age. Teach it the difference between weather and climate before it packs seventeen umbrellas.",
    concepts: [
      {
        title: "Weather vs climate", short: "Now versus normal",
        explanation: "Weather describes short-term atmospheric conditions. Climate describes long-term patterns, usually measured across decades, for a place or the planet.",
        memory: "Weather is your outfit today. Climate is your wardrobe.",
        example: "A cold day is weather; a region's average winter temperature over 30 years is climate.",
        question: { prompt: "Which statement describes climate?", options: ["It rained this morning", "Tomorrow will be windy", "This region has dry summers over many decades", "A storm arrives tonight"], answer: 2, hint: "Look for a long-term pattern, not a short event.", success: "Climate identified. One rainy picnic no longer controls the century." },
        boss: { prompt: "Why can a cold winter day occur during global warming?", options: ["Weather still varies day to day", "Global warming stops every winter", "Climate is measured hourly", "Cold disproves all long-term data"], answer: 0, hint: "A long-term global trend does not remove short-term and local variation." }
      },
      {
        title: "The greenhouse effect", short: "Earth's heat blanket",
        explanation: "Greenhouse gases absorb and re-emit some outgoing infrared radiation, keeping Earth warmer. Human emissions strengthen this natural effect.",
        memory: "Sunlight enters; some outgoing heat is retained.",
        example: "Carbon dioxide, methane, nitrous oxide, and water vapor all contribute to the greenhouse effect.",
        question: { prompt: "What do greenhouse gases mainly absorb?", options: ["All incoming visible light", "Outgoing infrared radiation", "Sound waves", "Earth's gravity"], answer: 1, hint: "Earth gives off energy as heat after its surface is warmed.", success: "Infrared energy tracked. The atmosphere's blanket has been located." },
        boss: { prompt: "Which human activity is a major source of additional atmospheric carbon dioxide?", options: ["Tidal motion", "Burning fossil fuels", "Moonlight", "Earth's rotation"], answer: 1, hint: "Coal, oil, and gas contain carbon that is released when burned." }
      },
      {
        title: "Carbon cycle", short: "Carbon on the move",
        explanation: "Carbon moves among the atmosphere, organisms, oceans, and rocks. Photosynthesis removes carbon dioxide; respiration, decomposition, and combustion release it.",
        memory: "Photosynthesis takes CO₂ in; respiration and combustion send it out.",
        example: "A growing forest can store carbon in wood and soil, acting as a carbon sink.",
        question: { prompt: "Which process directly removes carbon dioxide from the atmosphere?", options: ["Combustion", "Respiration", "Photosynthesis", "Decomposition"], answer: 2, hint: "Plants use atmospheric carbon to build sugars.", success: "Carbon captured. A tree would nod, but it is busy photosynthesizing." },
        boss: { prompt: "Why can deforestation increase atmospheric carbon dioxide?", options: ["It creates more oceans", "Fewer trees absorb CO₂ and stored carbon may be released", "It stops respiration everywhere", "It makes the Sun hotter"], answer: 1, hint: "Consider both lost photosynthesis and carbon stored in biomass." }
      },
      {
        title: "Evidence & action", short: "Measure, reduce, adapt",
        explanation: "Evidence includes temperature records, ice cores, glacier loss, sea-level rise, and ecosystem shifts. Mitigation reduces causes; adaptation reduces harm from impacts.",
        memory: "Mitigation tackles causes. Adaptation prepares for effects.",
        example: "Replacing fossil electricity with wind is mitigation; building flood defenses is adaptation.",
        question: { prompt: "Which action is an example of climate adaptation?", options: ["Installing solar panels", "Using less fossil fuel", "Building heat-safe city shelters", "Planting trees to store carbon"], answer: 2, hint: "Adaptation helps people cope with effects that occur.", success: "Adaptation selected. The city now owns fewer panic umbrellas." },
        boss: { prompt: "Which evidence gives scientists information about ancient atmospheres?", options: ["Tomorrow's forecast", "Air bubbles trapped in ice cores", "Modern traffic maps", "A single thermometer today"], answer: 1, hint: "Layers of old ice preserve small samples of past air." }
      }
    ]
  }
};
