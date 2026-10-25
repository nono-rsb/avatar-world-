'use strict';
// ===== Catalogue des objets et des animaux =====
(() => {
  const I = G.ITEMS = {};
  const add = (cat, list) => list.forEach(([id, e, n, o]) => I[id] = Object.assign({ e, n, cat }, o || {}));

  add('food', [
    ['pomme', '🍎', 'Pomme', { food: 15, p: 2, blend: 'jus' }],
    ['banane', '🍌', 'Banane', { food: 15, p: 2, blend: 'smoothie' }],
    ['raisin', '🍇', 'Raisin', { food: 12, p: 3, blend: 'jus' }],
    ['fraise', '🍓', 'Fraise', { food: 10, p: 3, blend: 'smoothie' }],
    ['pasteque', '🍉', 'Pastèque', { food: 20, p: 4, blend: 'jus' }],
    ['orange', '🍊', 'Orange', { food: 12, p: 2, blend: 'jus' }],
    ['coco', '🥥', 'Noix de coco', { food: 15, p: 3, blend: 'smoothie' }],
    ['carotte', '🥕', 'Carotte', { food: 10, p: 1, petfood: 1, blend: 'jus' }],
    ['mais', '🌽', 'Maïs', { food: 10, p: 2, cook: 'popcorn' }],
    ['brocoli', '🥦', 'Brocoli', { food: 10, p: 2 }],
    ['tomate', '🍅', 'Tomate', { food: 8, p: 1, blend: 'jus' }],
    ['patate', '🥔', 'Pomme de terre', { food: 8, p: 1, cook: 'frites' }],
    ['citrouille', '🎃', 'Citrouille', { food: 20, p: 5, sz: 66, cook: 'soupe' }],
    ['pain', '🍞', 'Pain', { food: 15, p: 2, cook: 'tartine' }],
    ['oeuf', '🥚', 'Œuf', { food: 5, p: 1, cook: 'oeufplat' }],
    ['viande', '🥩', 'Steak', { food: 10, p: 4, cook: 'gigot' }],
    ['poulet', '🍗', 'Poulet', { food: 30, p: 5 }],
    ['poisson', '🐟', 'Poisson', { food: 10, p: 4, cook: 'crevette', petfood: 1 }],
    ['fromage', '🧀', 'Fromage', { food: 15, p: 3 }],
    ['pates', '🍝', 'Spaghetti', { food: 35, p: 5 }],
    ['pizza', '🍕', 'Pizza', { food: 35, p: 6 }],
    ['burger', '🍔', 'Burger', { food: 40, p: 6 }],
    ['frites', '🍟', 'Frites', { food: 25, p: 4 }],
    ['popcorn', '🍿', 'Pop-corn', { food: 15, p: 3, fun: 10 }],
    ['oeufplat', '🍳', 'Œuf au plat', { food: 25, p: 3 }],
    ['gigot', '🍖', 'Viande grillée', { food: 35, p: 6 }],
    ['crevette', '🍤', 'Beignet', { food: 25, p: 5 }],
    ['tartine', '🥪', 'Sandwich', { food: 30, p: 4 }],
    ['soupe', '🍲', 'Soupe', { food: 40, p: 5 }],
    ['sushi', '🍣', 'Sushi', { food: 25, p: 6 }],
    ['croissant', '🥐', 'Croissant', { food: 20, p: 3 }],
    ['crepe', '🥞', 'Crêpes', { food: 30, p: 4, fun: 5 }],
    ['gateau', '🍰', 'Gâteau', { food: 25, p: 6, fun: 15 }],
    ['anniv', '🎂', "Gâteau d'anniversaire", { food: 30, p: 15, fun: 30, sz: 64 }],
    ['cupcake', '🧁', 'Cupcake', { food: 15, p: 4, fun: 10 }],
    ['donut', '🍩', 'Donut', { food: 15, p: 3, fun: 10 }],
    ['cookie', '🍪', 'Cookie', { food: 10, p: 2, fun: 8 }],
    ['chocolat', '🍫', 'Chocolat', { food: 10, p: 3, fun: 10 }],
    ['bonbon', '🍬', 'Bonbon', { food: 5, p: 1, fun: 8 }],
    ['sucette', '🍭', 'Sucette', { food: 5, p: 2, fun: 10 }],
    ['glace', '🍦', 'Glace', { food: 12, p: 3, fun: 12 }],
    ['sorbet', '🍧', 'Sorbet', { food: 12, p: 3, fun: 12 }],
  ]);
  add('drink', [
    ['lait', '🥛', 'Lait', { food: 10, drink: 1, p: 2 }],
    ['jus', '🧃', 'Jus de fruits', { food: 10, drink: 1, p: 2, fun: 5 }],
    ['smoothie', '🥤', 'Smoothie', { food: 15, drink: 1, p: 4, fun: 8 }],
    ['cafe', '☕', 'Chocolat chaud', { food: 5, drink: 1, p: 2, energy: 20 }],
    ['the', '🍵', 'Thé', { food: 5, drink: 1, p: 2, energy: 10 }],
    ['biberon', '🍼', 'Biberon', { food: 20, drink: 1, p: 2, fun: 10 }],
    ['cocktail', '🍹', 'Cocktail de fruits', { food: 10, drink: 1, p: 5, fun: 15 }],
    ['bulle', '🧋', 'Bubble tea', { food: 15, drink: 1, p: 5, fun: 15 }],
  ]);
  add('toy', [
    ['ours', '🧸', 'Nounours', { fun: 15, sz: 60 }],
    ['ballon', '⚽', 'Ballon', { ball: 1, sz: 50, p: 5 }],
    ['basket', '🏀', 'Ballon de basket', { ball: 1, sz: 50, p: 5 }],
    ['ballonplage', '🏐', 'Ballon de plage', { ball: 1, sz: 56, p: 4 }],
    ['baudruche', '🎈', 'Ballon', { float: 1, sz: 60, p: 2 }],
    ['yoyo', '🪀', 'Yo-yo', { fun: 8, p: 3 }],
    ['voiture', '🚗', 'Petite voiture', { fun: 8, p: 5, roll: 1 }],
    ['robot', '🤖', 'Robot', { fun: 10, p: 8 }],
    ['cerfvolant', '🪁', 'Cerf-volant', { fun: 10, p: 6, float: 1 }],
    ['des', '🎲', 'Dé', { fun: 5, p: 1, dice: 1, sz: 42 }],
    ['puzzle', '🧩', 'Puzzle', { fun: 8, p: 3 }],
    ['poupee', '🪆', 'Poupée', { fun: 10, p: 6 }],
    ['livre', '📖', 'Livre', { fun: 10, p: 4, read: 1 }],
    ['livres', '📚', 'Livres', { fun: 8, p: 6, read: 1 }],
    ['crayon', '✏️', 'Crayon', { p: 1 }],
    ['crayons', '🖍️', 'Crayons de couleur', { p: 2 }],
    ['regle', '📐', 'Équerre', { p: 1 }],
    ['cartable', '🎒', 'Cartable', { p: 8, sz: 60 }],
    ['palette', '🎨', 'Peinture', { p: 4, paint: 1 }],
    ['manette', '🎮', 'Manette', { fun: 12, p: 10 }],
    ['pelle', '🪣', 'Seau', { p: 3 }],
    ['bouee', '🛟', 'Bouée', { p: 6, sz: 64 }],
    ['skate', '🛹', 'Skate', { p: 12, sz: 64, roll: 1 }],
  ]);
  add('music', [
    ['guitare', '🎸', 'Guitare', { inst: [0, 4, 7, 12], p: 20, sz: 64 }],
    ['trompette', '🎺', 'Trompette', { inst: [7, 9, 12, 14], p: 18 }],
    ['violon', '🎻', 'Violon', { inst: [12, 16, 19, 24], p: 20, sz: 62 }],
    ['tambour', '🥁', 'Tambour', { inst: 'drum', p: 15 }],
    ['micro', '🎤', 'Micro', { inst: 'sing', p: 12 }],
    ['clavier', '🎹', 'Clavier', { inst: [0, 2, 4, 5, 7, 9, 11, 12], p: 20, sz: 62 }],
  ]);
  add('care', [
    ['savon', '🧼', 'Savon', { clean: 30, p: 2 }],
    ['eponge', '🧽', 'Éponge', { clean: 25, p: 2 }],
    ['brosse', '🪥', 'Brosse à dents', { clean: 15, p: 2 }],
    ['shampoing', '🧴', 'Shampoing', { clean: 20, p: 3 }],
    ['papier', '🧻', 'Papier toilette', { p: 1 }],
    ['pilule', '💊', 'Médicament', { heal: 1, p: 3 }],
    ['pansement', '🩹', 'Pansement', { heal: 1, p: 2 }],
    ['seringue', '💉', 'Vaccin', { heal: 1, p: 4 }],
    ['thermometre', '🌡️', 'Thermomètre', { thermo: 1, p: 2 }],
    ['rouge', '💄', 'Maquillage', { makeup: 1, p: 6 }],
    ['vernis', '💅', 'Vernis', { fun: 8, p: 4 }],
  ]);
  add('wear', [
    ['couronne', '👑', 'Couronne', { wear: ['hat', 'couronne', '#ffd23f'], p: 25 }],
    ['casquette', '🧢', 'Casquette', { wear: ['hat', 'casquette', '#4aa3ff'], p: 8 }],
    ['chapeau', '👒', 'Chapeau', { wear: ['hat', 'chapeau', '#f6e09a'], p: 10 }],
    ['noeud', '🎀', 'Nœud', { wear: ['hat', 'noeud', '#ff5c8a'], p: 5 }],
    ['lunettes', '🕶️', 'Lunettes de soleil', { wear: ['glasses', 'soleil', '#3d3d4f'], p: 8 }],
    ['lunettes2', '👓', 'Lunettes', { wear: ['glasses', 'rondes', '#3d3d4f'], p: 6 }],
    ['chapsorc', '🧙', 'Chapeau de sorcier', { wear: ['hat', 'sorciere', '#5b3f8c'], p: 15 }],
    ['casque', '🎧', 'Casque audio', { wear: ['hat', 'casque', '#ff5c8a'], p: 15 }],
  ]);
  add('misc', [
    ['cadeau', '🎁', 'Cadeau', { gift: 1, sz: 62, p: 15 }],
    ['telephone', '📱', 'Téléphone', { phone: 1, p: 20 }],
    ['appareil', '📷', 'Appareil photo', { camera: 1, p: 15 }],
    ['lampe', '🔦', 'Lampe torche', { p: 4 }],
    ['fleur', '🌷', 'Fleur', { love: 1, p: 2 }],
    ['bouquet', '💐', 'Bouquet', { love: 1, p: 6, sz: 60 }],
    ['rose', '🌹', 'Rose', { love: 1, p: 3 }],
    ['potion', '🧪', 'Potion magique', { potion: 1, p: 12 }],
    ['baguette', '🪄', 'Baguette magique', { wand: 1, p: 30 }],
    ['parapluie', '☂️', 'Parapluie', { p: 6, sz: 64 }],
    ['lettre', '💌', "Lettre d'amour", { love: 1, p: 2 }],
    ['etoile', '⭐', 'Étoile', { p: 5, float: 1 }],
    ['diamant', '💎', 'Diamant', { p: 50 }],
    ['tirelire', null, 'Tirelire', { piggy: 1, sz: 64, svg: 'tirelire' }],
    ['os', '🦴', 'Os', { petfood: 1, p: 2 }],
    ['croquettes', '🥫', 'Croquettes', { petfood: 1, p: 3 }],
    ['herbe', '🌾', 'Foin', { petfood: 1, p: 1 }],
    ['arrosoir', null, 'Arrosoir', { water: 1, sz: 66, svg: 'arrosoir' }],
    ['graine_tomate', '🌰', 'Graines de tomate', { seed: 'tomate', b: '🍅', p: 3 }],
    ['graine_carotte', '🌰', 'Graines de carotte', { seed: 'carotte', b: '🥕', p: 3 }],
    ['graine_fleur', '🌰', 'Graines de fleur', { seed: 'tournesol', b: '🌻', p: 3 }],
    ['graine_fraise', '🌰', 'Graines de fraise', { seed: 'fraise', b: '🍓', p: 4 }],
    ['graine_citrouille', '🌰', 'Graines de citrouille', { seed: 'citrouille', b: '🎃', p: 5 }],
    ['graine_mais', '🌰', 'Graines de maïs', { seed: 'mais', b: '🌽', p: 3 }],
    ['tournesol', '🌻', 'Tournesol', { love: 1, p: 3 }],
    ['bougie', '🕯️', 'Bougie', { p: 3 }],
    ['fantome', '👻', 'Déguisement fantôme', { p: 8, fun: 10, boo: 1 }],
  ]);
  // Plantes du potager : graine -> légume
  G.PLANTS = { tomate: 'tomate', carotte: 'carotte', tournesol: 'tournesol', fraise: 'fraise', citrouille: 'citrouille', mais: 'mais' };

  // SVG d'objets spéciaux
  G.ITEM_SVG = {
    tirelire: (st) => {
      const { e, c, p, r, t } = G.svg;
      return G.svg.wrap(64, 64, e(32, 38, 26, 20, '#ff9ebb') + c(54, 34, 8, '#ff9ebb') + c(56, 34, 2, G.O, 0) + c(52, 34, 2, G.O, 0)
        + r(14, 50, 7, 10, '#ff9ebb', 3, 2.5) + r(40, 50, 7, 10, '#ff9ebb', 3, 2.5) + p('M22,20 L30,22', 'none', 4) + c(40, 28, 3, G.O, 0)
        + p('M12,30 Q4,26 8,20', 'none', 2.5) + (st && st.coins ? t(32, 4, '🪙' + st.coins, 13, '#3a2a4d', 'font-weight="700"') : ''));
    },
    arrosoir: () => {
      const { r, p, c } = G.svg;
      return G.svg.wrap(66, 66, p('M44,30 L64,14 L66,20 L48,40', '#4aa3ff', 3) + r(8, 26, 40, 34, '#4aa3ff', 8) + p('M14,26 C14,6 42,6 42,26', 'none', 5) + c(64, 16, 4, '#7fd6ff', 2) + r(14, 34, 28, 6, '#7fd6ff', 3, 0));
    }
  };

  // ===== Animaux =====
  G.PETS = {
    chien: { e: '🐶', n: 'Chien', p: 60, snd: 'bark', say: 'Wouf !' },
    chat: { e: '🐱', n: 'Chat', p: 60, snd: 'meow', say: 'Miaou !' },
    lapin: { e: '🐰', n: 'Lapin', p: 50, snd: 'squeak', say: 'Snif snif' },
    hamster: { e: '🐹', n: 'Hamster', p: 40, snd: 'squeak', say: 'Couic !' },
    tortue: { e: '🐢', n: 'Tortue', p: 45, snd: 'pop', say: '...' },
    perroquet: { e: '🦜', n: 'Perroquet', p: 80, snd: 'squeak', say: 'Coucou ! Coucou !' },
    poussin: { e: '🐥', n: 'Poussin', p: 30, snd: 'squeak', say: 'Piou piou !' },
    cochon: { e: '🐷', n: 'Cochon', p: 70, snd: 'bark', say: 'Groin !' },
    renard: { e: '🦊', n: 'Renard', p: 120, snd: 'bark', say: 'Yip !' },
    panda: { e: '🐼', n: 'Panda', p: 200, snd: 'pop', say: 'Bambou ?' },
    licorne: { e: '🦄', n: 'Licorne', p: 300, snd: 'magic', say: '✨ Hiii ✨' },
    dino: { e: '🦖', n: 'Dino', p: 250, snd: 'boing', say: 'RAAAWR !' },
  };
  G.PET_NAMES = ['Biscuit', 'Caramel', 'Noisette', 'Pompon', 'Filou', 'Moka', 'Praline', 'Choupi', 'Réglisse', 'Pépite', 'Nougat', 'Flocon', 'Tigrou', 'Câlin'];
})();
