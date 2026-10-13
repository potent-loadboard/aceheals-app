// 100+ clean recipes. Compact format, expanded at load.
// Fields: emoji, name, age ('All Ages'|'6mo+'|'1yr+'|'2yr+'), mins,
// tags[], contains[] (allergens present: gluten|dairy|egg|nut|soy|fish),
// ingredients[], steps[], note (non-medical nutrition note).

const R = (emoji, name, age, mins, tags, contains, ingredients, steps, note) =>
  ({ emoji, name, age, mins, tags, contains, ingredients, steps, note });

const BASE = [
R('🥤','Berry Banana Smoothie','1yr+',5,['Dairy-Free','Kid-Approved'],['dairy'],
 ['1 banana','1 cup mixed berries','1 cup oat milk','1 tbsp sunflower seed butter'],
 ['Add everything to a blender.','Blend 60 seconds until smooth.','Pour and serve right away.'],
 'Fruit + healthy fats for steady energy.'),
R('🥑','Avocado Mash Bowl','6mo+',5,['Dairy-Free','No GMO'],[],
 ['1 ripe avocado','Squeeze of lemon','Pinch of sea salt','Soft cooked sweet potato cubes'],
 ['Mash avocado with lemon and salt.','Top with sweet potato cubes.','Serve at room temp.'],
 'Avocado brings creamy healthy fats little ones love.'),
R('🍗','Simple Baked Chicken','1yr+',30,['Dairy-Free','Dye-Free'],[],
 ['2 chicken breasts','1 tbsp olive oil','1 tsp garlic powder','1 tsp paprika','Salt to taste'],
 ['Heat oven to 400°F.','Rub chicken with oil and spices.','Bake 22–25 min until juices run clear.','Rest 5 min, then slice.'],
 'A plain protein staple — batch cook for the week.'),
R('🍚','Coconut Rice','1yr+',20,['Dairy-Free','No GMO'],[],
 ['1 cup jasmine rice','1 cup coconut milk','1 cup water','Pinch of salt'],
 ['Rinse rice well.','Combine all in a pot and bring to a boil.','Cover, low heat 15 min.','Fluff with a fork.'],
 'Creamy without dairy — great base for bowls.'),
R('🥕','Roasted Carrot Fries','1yr+',25,['Dairy-Free','Kid-Approved'],[],
 ['4 large carrots','1 tbsp olive oil','Pinch of salt','Pinch of cinnamon'],
 ['Heat oven to 425°F.','Cut carrots into sticks.','Toss with oil, salt, cinnamon.','Roast 20 min, flipping once.'],
 'Sweet, dippable, and oven-crisp.'),
R('🍲','Chicken Veggie Soup','1yr+',35,['Dairy-Free','Dye-Free'],[],
 ['2 chicken thighs','2 carrots diced','2 celery stalks diced','4 cups water or broth','1 tsp turmeric'],
 ['Simmer chicken in water 20 min.','Add veggies and turmeric.','Cook 15 min more.','Shred chicken, serve warm.'],
 'Comfort in a bowl — freezes beautifully.'),
R('🥞','Banana Oat Pancakes','1yr+',15,['Dairy-Free','Kid-Approved'],[],
 ['2 ripe bananas','1 cup oat flour','2 eggs','1 tsp baking powder','Coconut oil for pan'],
 ['Mash bananas, whisk with eggs.','Fold in oat flour and baking powder.','Cook small pancakes 2 min per side.'],
 'No refined sugar — the bananas do the sweetening.'),
R('🍎','Baked Apple Slices','6mo+',20,['Dairy-Free','No GMO'],[],
 ['3 apples','1 tsp cinnamon','1 tbsp coconut oil melted'],
 ['Heat oven to 375°F.','Slice apples thin, toss with oil and cinnamon.','Bake 15 min until soft.'],
 'Warm, soft, and naturally sweet.'),
R('🥦','Steamed Broccoli Bites','6mo+',10,['Dairy-Free'],[],
 ['1 head broccoli','Water for steaming','Olive oil drizzle','Lemon squeeze'],
 ['Steam florets 5–6 min until bright green.','Drizzle with oil and lemon.','Cool before serving.'],
 'Bright green = just right, not mushy.'),
R('🍠','Sweet Potato Wedges','6mo+',30,['Dairy-Free','Kid-Approved'],[],
 ['2 sweet potatoes','1 tbsp olive oil','Pinch of salt'],
 ['Heat oven to 425°F.','Cut into wedges, toss with oil and salt.','Roast 25 min until edges crisp.'],
 'A first-food favorite that grows with them.'),
R('🥗','Rainbow Quinoa Bowl','2yr+',25,['Dairy-Free','No GMO'],[],
 ['1 cup quinoa','2 cups water','1 cup roasted veggies','Tahini-lemon drizzle'],
 ['Simmer quinoa 15 min, fluff.','Top with colorful roasted veggies.','Drizzle and serve.'],
 'Eat the rainbow — every color brings something different.'),
R('🍌','Frozen Banana Bites','1yr+',10,['Dairy-Free','Kid-Approved'],[],
 ['2 bananas','1/2 cup sunflower seed butter','1/4 cup dye-free chocolate chips melted'],
 ['Slice bananas, sandwich with seed butter.','Freeze 1 hour.','Dip halfway in chocolate, freeze again.'],
 'Tastes like ice cream, fuels like fruit.'),
R('🥣','Overnight Oats','2yr+',10,['Dairy-Free'],[],
 ['1/2 cup rolled oats','1/2 cup oat milk','1 tbsp chia seeds','1/2 cup berries'],
 ['Stir everything in a jar.','Refrigerate overnight.','Top with berries in the morning.'],
 'Breakfast makes itself while you sleep.'),
R('🍳','Veggie Egg Muffins','1yr+',25,['Dairy-Free','Kid-Approved'],['egg'],
 ['6 eggs','1/2 cup diced peppers','1/2 cup spinach chopped','Salt to taste'],
 ['Heat oven to 350°F.','Whisk eggs, fold in veggies.','Pour into greased muffin tin.','Bake 18 min until set.'],
 'Grab-and-go protein for busy mornings.'),
R('🐟','Baked Salmon','1yr+',20,['Dairy-Free'],['fish'],
 ['2 salmon fillets','1 tbsp olive oil','Lemon slices','Dill'],
 ['Heat oven to 400°F.','Place salmon on lined tray, oil + lemon + dill.','Bake 12–14 min.','Flake and check for bones.'],
 'Omega-rich fish, simply prepared.'),
R('🌮','Turkey Taco Bowls','2yr+',20,['Dairy-Free','Kid-Approved'],[],
 ['1 lb ground turkey','1 tbsp taco seasoning (dye-free)','Rice','Black beans','Avocado'],
 ['Brown turkey with seasoning.','Serve over rice with beans.','Top with avocado.'],
 'Deconstructed tacos — every kid builds their own.'),
R('🍝','Zucchini Pasta','2yr+',15,['Dairy-Free'],[],
 ['3 zucchini spiralized','1 cup tomato sauce (no added sugar)','Olive oil','Basil'],
 ['Sauté zucchini noodles 3 min.','Warm sauce separately.','Toss together, top with basil.'],
 'All the fun of pasta night, veggie-powered.'),
R('🥜','Sunflower Energy Balls','2yr+',15,['Dairy-Free','Kid-Approved'],[],
 ['1 cup oats','1/2 cup sunflower seed butter','1/3 cup honey','1/4 cup dye-free mini chips'],
 ['Mix everything in a bowl.','Roll into 1-inch balls.','Chill 30 min.'],
 'Lunchbox heroes — no baking required.'),
R('🍋','Lemon Herb Chicken','2yr+',30,['Dairy-Free','Dye-Free'],[],
 ['4 chicken thighs','Juice of 2 lemons','2 tbsp olive oil','1 tsp oregano','Garlic'],
 ['Marinate 15 min.','Heat oven to 400°F.','Roast 25 min until golden.'],
 'Bright and simple — great with rice.'),
R('🫘','Black Bean Burgers','2yr+',25,['Dairy-Free'],[],
 ['2 cans black beans mashed','1/2 cup oat flour','1 tsp cumin','1/2 onion diced'],
 ['Mix and form 4 patties.','Chill 10 min.','Pan-cook 4 min per side.'],
 'Crispy outside, soft inside.'),
R('🥒','Cucumber Boats','1yr+',10,['Dairy-Free'],[],
 ['2 cucumbers','1/2 cup hummus','Cherry tomatoes halved','Paprika sprinkle'],
 ['Halve cucumbers, scoop seeds.','Fill with hummus.','Top with tomatoes and paprika.'],
 'Crunchy, cool, and fun to eat.'),
R('🍑','Grilled Peaches','1yr+',10,['Dairy-Free'],['dairy'],
 ['3 peaches halved','Coconut oil','Cinnamon','Coconut yogurt for serving'],
 ['Brush peaches with oil.','Grill 3 min per side.','Serve warm with yogurt and cinnamon.'],
 'Dessert that happens to be fruit.'),
R('🥥','Coconut Chia Pudding','1yr+',10,['Dairy-Free'],[],
 ['1/4 cup chia seeds','1 cup coconut milk','1 tbsp maple syrup','Mango cubes'],
 ['Whisk chia, milk, maple.','Chill 2+ hours.','Top with mango.'],
 'Creamy pudding with zero cooking.'),
R('🌽','Elote-Style Corn','2yr+',15,['Dairy-Free'],[],
 ['4 corn cobs','2 tbsp olive oil mayo','Lime juice','Chili powder','Cilantro'],
 ['Grill or boil corn.','Spread with mayo, lime, chili.','Sprinkle cilantro.'],
 'Street-food fun at home.'),
R('🍆','Baked Eggplant Rounds','2yr+',25,['Dairy-Free'],[],
 ['1 eggplant sliced','Olive oil','Garlic powder','Tomato sauce','Basil'],
 ['Heat oven to 400°F.','Oil rounds, season, bake 20 min.','Top with sauce and basil.'],
 'Pizza vibes, veggie base.'),
];

// Family generators — real variations, each a distinct recipe.
function smoothieFam() {
  const fruits = [
    ['🍓','Strawberry'],['🫐','Blueberry'],['🥭','Mango'],['🍍','Pineapple'],
    ['🍑','Peach'],['🍒','Cherry'],['🥝','Kiwi'],['🍇','Grape'],
  ];
  return fruits.map(([e, f]) => R(e, f + ' Sunrise Smoothie', '1yr+', 5,
    ['Dairy-Free','Kid-Approved'], [],
    ['1 cup ' + f.toLowerCase(), '1 banana', '1 cup oat milk', 'Ice'],
    ['Add all to blender.', 'Blend until smooth.', 'Serve immediately.'],
    'A new fruit to try every week.'));
}
function soupFam() {
  const kinds = [
    ['🎃','Pumpkin', ['2 cups pumpkin puree','1 onion diced','3 cups veggie broth','Coconut milk swirl']],
    ['🥕','Carrot Ginger', ['6 carrots chopped','1 tbsp fresh ginger','1 onion','3 cups broth']],
    ['🥦','Broccoli', ['2 heads broccoli','1 potato diced','1 onion','3 cups broth']],
    ['🍅','Tomato Basil', ['2 cans tomatoes','1 onion','Basil bunch','3 cups broth']],
    ['🌽','Corn Chowder', ['3 cups corn','1 potato diced','1 onion','3 cups broth']],
    ['🍠','Sweet Potato', ['3 sweet potatoes','1 onion','1 tsp cumin','3 cups broth']],
  ];
  return kinds.map(([e, n, ings]) => R(e, 'Creamy ' + n + ' Soup', '1yr+', 30,
    ['Dairy-Free','Dye-Free'], [],
    ings,
    ['Sauté onion 5 min.', 'Add everything else, simmer 20 min.', 'Blend smooth, serve warm.'],
    'One pot, endless comfort.'));
}
function bowlFam() {
  const kinds = [
    ['🍚','Teriyaki Chicken Rice', ['Chicken strips','Rice','Steamed broccoli','Dye-free teriyaki']],
    ['🥗','Fiesta Black Bean Bowl', ['Black beans','Rice','Corn','Avocado','Salsa']],
    ['🍣','Salmon Poke Bowl', ['Cooked salmon','Rice','Cucumber','Mango','Coconut aminos']],
    ['🦃','Turkey Meatball Bowl', ['Turkey meatballs','Quinoa','Roasted carrots','Tahini drizzle']],
    ['🍳','Breakfast Burrito Bowl', ['Scrambled eggs','Black beans','Potato cubes','Avocado']],
    ['🥙','Chicken Shawarma Bowl', ['Chicken strips','Rice','Cucumber','Tomato','Lemon-tahini']],
  ];
  return kinds.map(([e, n, ings]) => R(e, n, '2yr+', 25,
    ['Dairy-Free','Kid-Approved'], n.includes('Egg') ? ['egg'] : [],
    ings,
    ['Cook the protein.', 'Warm the grains.', 'Assemble bowls, add toppings.'],
    'Bowls let picky eaters choose their own adventure.'));
}
function snackFam() {
  const kinds = [
    ['🧀','Dairy-Free Cheese Crackers', ['1 cup almond flour','Nutritional yeast','Salt','Water'], ['nut']],
    ['🍿','Stovetop Popcorn', ['1/2 cup kernels','Coconut oil','Sea salt'], []],
    ['🥨','Soft Pretzel Bites', ['Pizza dough (dairy-free)','Baking soda bath','Salt'], ['gluten']],
    ['🍪','Oatmeal Raisin Cookies', ['Oats','Banana','Raisins','Cinnamon'], []],
    ['🧁','Applesauce Muffins', ['Applesauce','Oat flour','Baking powder','Cinnamon'], []],
    ['🍩','Baked Cinnamon Donuts', ['Oat flour','Applesauce','Maple','Cinnamon sugar'], []],
    ['🥧','Mini Fruit Pies', ['Pie dough (dairy-free)','Mixed berries','Maple'], ['gluten']],
    ['🍫','Dye-Free Fudge Pops', ['Coconut milk','Cocoa','Maple'], []],
  ];
  return kinds.map(([e, n, ings, contains]) => R(e, n, '2yr+', 20,
    ['Kid-Approved','Dye-Free'], contains,
    ings,
    ['Mix the dough/batter.', 'Shape or pour.', 'Bake or chill per type, then enjoy.'],
    'Snack time, upgraded.'));
}
function breakfastFam() {
  const kinds = [
    ['🧇','Coconut Waffles', ['Waffle batter (dairy-free)','Coconut milk','Berries']],
    ['🥣','Warm Quinoa Porridge', ['Quinoa','Oat milk','Cinnamon','Banana']],
    ['🍞','Avocado Toast Sticks', ['Dairy-free bread','Avocado','Everything seasoning']],
    ['🥚','Egg & Veggie Scramble', ['Eggs','Peppers','Spinach']],
    ['🫐','Berry Parfait', ['Coconut yogurt','Granola (nut-free)','Berries']],
    ['🥞','Sweet Potato Pancakes', ['Mashed sweet potato','Oat flour','Eggs','Cinnamon']],
  ];
  return kinds.map(([e, n, ings]) => R(e, n, '1yr+', 15,
    ['Kid-Approved'], n.includes('Egg') ? ['egg'] : (n.includes('Toast') ? ['gluten'] : []),
    ings,
    ['Prep ingredients.', 'Cook per type 5–10 min.', 'Serve warm with fruit.'],
    'Mornings are easier with a plan.'));
}
function dinnerFam() {
  const kinds = [
    ['🍛','Chicken Curry', ['Chicken','Coconut milk','Curry powder','Rice']],
    ['🥘','Veggie Stir Fry', ['Mixed veggies','Coconut aminos','Sesame oil','Rice']],
    ['🍕','Cauliflower Pizza', ['Cauliflower crust','Tomato sauce','Dairy-free cheese','Toppings']],
    ['🌯','Bean & Rice Burritos', ['Tortillas (gluten-free)','Black beans','Rice','Avocado']],
    ['🍲','Beef Stew', ['Stew beef','Carrots','Potatoes','Broth']],
    ['🐔','Sheet Pan Fajitas', ['Chicken strips','Peppers','Onion','Fajita seasoning','Tortillas']],
    ['🍝','Spaghetti Squash Bolognese', ['Spaghetti squash','Ground turkey','Tomato sauce']],
    ['🥟','Chicken Dumplings', ['Dumpling wrappers','Ground chicken','Cabbage','Ginger']],
  ];
  return kinds.map(([e, n, ings]) => R(e, n, '2yr+', 35,
    ['Dairy-Free','Dye-Free'], n.includes('Dumpling') || n.includes('Burrito') ? ['gluten'] : [],
    ings,
    ['Prep all ingredients.', 'Cook protein first.', 'Combine and finish per recipe.'],
    'Dinner in about half an hour.'));
}

function saladFam() {
  const kinds = [
    ['🥗','Crunchy Apple Slaw', ['Cabbage','Apple','Carrot','Lemon-honey dressing']],
    ['🥑','Avocado Citrus Salad', ['Avocado','Orange segments','Greens','Olive oil']],
    ['🫘','Three Bean Salad', ['Green beans','Kidney beans','Chickpeas','Vinaigrette']],
    ['🥒','Cucumber Dill Salad', ['Cucumber','Dill','Lemon','Olive oil']],
    ['🌽','Mexican Street Corn Salad', ['Corn','Lime','Cilantro','Dairy-free mayo']],
    ['🍉','Watermelon Mint Salad', ['Watermelon','Mint','Lime','Cucumber']],
  ];
  return kinds.map(([e, n, ings]) => R(e, n, '2yr+', 12,
    ['Dairy-Free','No GMO'], [],
    ings,
    ['Chop everything bite-size.', 'Whisk the dressing.', 'Toss and serve chilled.'],
    'Crunchy salads kids actually eat.'));
}
function sideFam() {
  const kinds = [
    ['🍟','Baked Sweet Potato Fries', ['Sweet potato','Olive oil','Salt']],
    ['🥔','Crispy Smashed Potatoes', ['Baby potatoes','Olive oil','Rosemary']],
    ['🌽','Buttered Corn (Dairy-Free)', ['Corn','Dairy-free butter','Salt']],
    ['🥦','Garlic Green Beans', ['Green beans','Garlic','Olive oil']],
    ['🍚','Herbed Rice Pilaf', ['Rice','Veggie broth','Parsley']],
    ['🥕','Honey Glazed Carrots', ['Carrots','Honey','Dairy-free butter']],
    ['🫛','Steamed Edamame', ['Edamame','Sea salt'], ['soy']],
    ['🍄','Roasted Mushrooms', ['Mushrooms','Olive oil','Thyme']],
  ];
  return kinds.map(([e, n, ings, contains]) => R(e, n, '1yr+', 20,
    ['Dairy-Free'], contains || [],
    ings,
    ['Prep the veggies.', 'Season simply.', 'Roast, steam, or sauté until tender.'],
    'Sides that steal the show.'));
}
function drinkFam() {
  const kinds = [
    ['🍋','Honey Lemon Water', ['Lemon','Honey','Warm water']],
    ['🥒','Cucumber Mint Cooler', ['Cucumber','Mint','Sparkling water','Lime']],
    ['🍎','Warm Apple Cider', ['Apple juice','Cinnamon stick','Cloves']],
    ['🍫','Dairy-Free Hot Cocoa', ['Cocoa','Oat milk','Maple']],
    ['🍑','Peach Iced Tea', ['Brewed tea','Peach slices','Honey','Ice']],
    ['🥥','Coconut Pineapple Cooler', ['Coconut water','Pineapple juice','Lime']],
    ['🫐','Berry Lemonade', ['Berries','Lemon','Honey','Water']],
    ['🌺','Hibiscus Cooler', ['Hibiscus tea','Honey','Orange slice','Ice']],
  ];
  return kinds.map(([e, n, ings]) => R(e, n, '1yr+', 8,
    ['Dairy-Free','Dye-Free'], [],
    ings,
    ['Combine in a pitcher.', 'Stir or shake well.', 'Serve over ice or warm.'],
    'Better than the juice box aisle.'));
}
function dessertFam() {
  const kinds = [
    ['🍦','Banana Nice Cream', ['Frozen bananas','Splash oat milk','Vanilla']],
    ['🍮','Chia Chocolate Mousse', ['Chia seeds','Cocoa','Coconut milk','Maple']],
    ['🥧','Apple Crisp', ['Apples','Oat crumble','Cinnamon','Coconut oil']],
    ['🍰','Flourless Brownies', ['Black beans','Cocoa','Maple','Vanilla']],
    ['🧁','Carrot Cake Muffins', ['Carrots','Oat flour','Applesauce','Cinnamon']],
    ['🍩','Baked Apple Donuts', ['Oat flour','Applesauce','Cinnamon sugar']],
    ['🍨','Coconut Mango Sorbet', ['Mango','Coconut milk','Lime']],
    ['🍪','Sunflower Butter Cookies', ['Sunflower seed butter','Maple','Oat flour','Vanilla']],
  ];
  return kinds.map(([e, n, ings]) => R(e, n, '1yr+', 20,
    ['Dairy-Free','Kid-Approved'], [],
    ings,
    ['Mix the base.', 'Bake or freeze per type.', 'Cool, then enjoy together.'],
    'Sweet endings, clean ingredients.'));
}
function lunchFam() {
  const kinds = [
    ['🥪','Sunflower Butter Sandwich', ['Dairy-free bread','Sunflower seed butter','Banana slices'], ['gluten']],
    ['🌯','Hummus Veggie Wrap', ['Tortilla','Hummus','Shredded veggies'], ['gluten']],
    ['🍲','Leftover Soup & Bread', ['Any soup','Dairy-free bread'], ['gluten']],
    ['🥗','Chicken Salad Cups', ['Chicken','Dairy-free mayo','Celery','Lettuce cups']],
    ['🍱','DIY Lunchbox Bento', ['Turkey roll-ups','Fruit','Veggie sticks','Hummus']],
    ['🧆','Falafel Pitas', ['Falafel','Pita','Cucumber','Tahini'], ['gluten','soy']],
    ['🌮','Quesadillas (Dairy-Free)', ['Tortillas','Dairy-free cheese','Black beans'], ['gluten']],
    ['🍜','Veggie Noodle Cups', ['Rice noodles','Veggie broth powder','Dried veggies']],
  ];
  return kinds.map(([e, n, ings, contains]) => R(e, n, '2yr+', 15,
    ['Kid-Approved'], contains || [],
    ings,
    ['Assemble the base.', 'Add fillings.', 'Pack or serve right away.'],
    'Lunch in 15 minutes flat.'));
}

export const RECIPES = [
  ...BASE,
  ...smoothieFam(), ...soupFam(), ...bowlFam(), ...snackFam(), ...breakfastFam(),
  ...dinnerFam(), ...saladFam(), ...sideFam(), ...drinkFam(), ...dessertFam(), ...lunchFam(),
];

export const ALLERGENS = ['gluten','dairy','egg','nut','soy','fish'];
export const ALLERGEN_LABEL = { gluten:'Gluten', dairy:'Dairy', egg:'Egg', nut:'Nut', soy:'Soy', fish:'Fish' };
export const AGES = ['All Ages','6mo+','1yr+','2yr+'];
