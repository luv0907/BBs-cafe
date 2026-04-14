-- Seed menu categories
INSERT INTO menu_categories (name, slug, description, display_order) VALUES
  ('Hot Coffee', 'hot-coffee', 'Our signature hot coffee selections', 1),
  ('Iced Coffee', 'iced-coffee', 'Refreshing cold coffee drinks', 2),
  ('Espresso', 'espresso', 'Classic espresso-based beverages', 3),
  ('Tea', 'tea', 'Premium teas and specialty blends', 4),
  ('Pastries', 'pastries', 'Freshly baked goods', 5),
  ('Breakfast', 'breakfast', 'Start your day right', 6),
  ('Sandwiches', 'sandwiches', 'Savory lunch options', 7),
  ('Desserts', 'desserts', 'Sweet treats and indulgences', 8)
ON CONFLICT (slug) DO NOTHING;

-- Seed menu items
INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, is_featured, rating) VALUES
  -- Hot Coffee
  ((SELECT id FROM menu_categories WHERE slug = 'hot-coffee'), 'House Blend', 'Our signature medium roast with notes of chocolate and caramel', 3.50, '/images/menu/house-blend.jpg', true, true, 4.8),
  ((SELECT id FROM menu_categories WHERE slug = 'hot-coffee'), 'French Press', 'Rich and full-bodied coffee brewed to perfection', 4.50, '/images/menu/french-press.jpg', true, false, 4.6),
  ((SELECT id FROM menu_categories WHERE slug = 'hot-coffee'), 'Pour Over', 'Hand-crafted single origin coffee with bright, clean flavors', 5.00, '/images/menu/pour-over.jpg', true, true, 4.9),
  ((SELECT id FROM menu_categories WHERE slug = 'hot-coffee'), 'Cafe au Lait', 'Equal parts coffee and steamed milk', 4.00, '/images/menu/cafe-au-lait.jpg', true, false, 4.5),
  
  -- Iced Coffee
  ((SELECT id FROM menu_categories WHERE slug = 'iced-coffee'), 'Cold Brew', 'Smooth, slow-steeped for 20 hours with low acidity', 4.50, '/images/menu/cold-brew.jpg', true, true, 4.9),
  ((SELECT id FROM menu_categories WHERE slug = 'iced-coffee'), 'Iced Latte', 'Espresso over ice with your choice of milk', 5.00, '/images/menu/iced-latte.jpg', true, false, 4.7),
  ((SELECT id FROM menu_categories WHERE slug = 'iced-coffee'), 'Vietnamese Iced Coffee', 'Bold coffee with sweetened condensed milk', 5.50, '/images/menu/vietnamese-coffee.jpg', true, true, 4.8),
  ((SELECT id FROM menu_categories WHERE slug = 'iced-coffee'), 'Iced Mocha', 'Espresso, chocolate, milk and ice topped with whipped cream', 5.75, '/images/menu/iced-mocha.jpg', true, false, 4.6),
  
  -- Espresso
  ((SELECT id FROM menu_categories WHERE slug = 'espresso'), 'Espresso', 'Double shot of our signature espresso blend', 3.00, '/images/menu/espresso.jpg', true, false, 4.7),
  ((SELECT id FROM menu_categories WHERE slug = 'espresso'), 'Americano', 'Espresso with hot water for a smooth, rich taste', 3.50, '/images/menu/americano.jpg', true, false, 4.5),
  ((SELECT id FROM menu_categories WHERE slug = 'espresso'), 'Cappuccino', 'Equal parts espresso, steamed milk, and foam', 4.50, '/images/menu/cappuccino.jpg', true, true, 4.8),
  ((SELECT id FROM menu_categories WHERE slug = 'espresso'), 'Latte', 'Espresso with steamed milk and a light layer of foam', 4.75, '/images/menu/latte.jpg', true, true, 4.9),
  ((SELECT id FROM menu_categories WHERE slug = 'espresso'), 'Flat White', 'Velvety microfoam over a double ristretto', 4.75, '/images/menu/flat-white.jpg', true, false, 4.7),
  ((SELECT id FROM menu_categories WHERE slug = 'espresso'), 'Mocha', 'Espresso with chocolate and steamed milk', 5.25, '/images/menu/mocha.jpg', true, true, 4.8),
  
  -- Tea
  ((SELECT id FROM menu_categories WHERE slug = 'tea'), 'Earl Grey', 'Classic bergamot-infused black tea', 3.50, '/images/menu/earl-grey.jpg', true, false, 4.5),
  ((SELECT id FROM menu_categories WHERE slug = 'tea'), 'Matcha Latte', 'Ceremonial grade matcha with steamed milk', 5.50, '/images/menu/matcha-latte.jpg', true, true, 4.9),
  ((SELECT id FROM menu_categories WHERE slug = 'tea'), 'Chai Latte', 'Spiced black tea with steamed milk and honey', 5.00, '/images/menu/chai-latte.jpg', true, true, 4.8),
  ((SELECT id FROM menu_categories WHERE slug = 'tea'), 'Jasmine Green Tea', 'Delicate jasmine-scented green tea', 3.50, '/images/menu/jasmine-tea.jpg', true, false, 4.6),
  
  -- Pastries
  ((SELECT id FROM menu_categories WHERE slug = 'pastries'), 'Butter Croissant', 'Flaky, buttery French croissant', 4.00, '/images/menu/croissant.jpg', true, true, 4.9),
  ((SELECT id FROM menu_categories WHERE slug = 'pastries'), 'Chocolate Croissant', 'Buttery croissant filled with dark chocolate', 4.50, '/images/menu/pain-au-chocolat.jpg', true, true, 4.8),
  ((SELECT id FROM menu_categories WHERE slug = 'pastries'), 'Blueberry Muffin', 'Moist muffin bursting with fresh blueberries', 3.75, '/images/menu/blueberry-muffin.jpg', true, false, 4.6),
  ((SELECT id FROM menu_categories WHERE slug = 'pastries'), 'Cinnamon Roll', 'Warm roll with cinnamon swirl and cream cheese frosting', 4.50, '/images/menu/cinnamon-roll.jpg', true, true, 4.9),
  
  -- Breakfast
  ((SELECT id FROM menu_categories WHERE slug = 'breakfast'), 'Avocado Toast', 'Smashed avocado on sourdough with poached eggs', 12.00, '/images/menu/avocado-toast.jpg', true, true, 4.8),
  ((SELECT id FROM menu_categories WHERE slug = 'breakfast'), 'Eggs Benedict', 'Poached eggs with hollandaise on English muffin', 14.00, '/images/menu/eggs-benedict.jpg', true, false, 4.7),
  ((SELECT id FROM menu_categories WHERE slug = 'breakfast'), 'Acai Bowl', 'Acai blend topped with granola, banana, and berries', 11.00, '/images/menu/acai-bowl.jpg', true, true, 4.9),
  ((SELECT id FROM menu_categories WHERE slug = 'breakfast'), 'Breakfast Burrito', 'Scrambled eggs, cheese, beans, and salsa in a flour tortilla', 10.00, '/images/menu/breakfast-burrito.jpg', true, false, 4.6),
  
  -- Sandwiches
  ((SELECT id FROM menu_categories WHERE slug = 'sandwiches'), 'Turkey Club', 'Roasted turkey, bacon, lettuce, tomato on sourdough', 13.00, '/images/menu/turkey-club.jpg', true, false, 4.7),
  ((SELECT id FROM menu_categories WHERE slug = 'sandwiches'), 'Caprese Panini', 'Fresh mozzarella, tomato, basil with balsamic glaze', 11.00, '/images/menu/caprese-panini.jpg', true, true, 4.8),
  ((SELECT id FROM menu_categories WHERE slug = 'sandwiches'), 'Chicken Pesto', 'Grilled chicken with pesto, arugula, and sun-dried tomatoes', 12.50, '/images/menu/chicken-pesto.jpg', true, false, 4.7),
  ((SELECT id FROM menu_categories WHERE slug = 'sandwiches'), 'Veggie Wrap', 'Hummus, roasted vegetables, and feta in a spinach wrap', 10.50, '/images/menu/veggie-wrap.jpg', true, false, 4.5),
  
  -- Desserts
  ((SELECT id FROM menu_categories WHERE slug = 'desserts'), 'Tiramisu', 'Classic Italian dessert with espresso-soaked ladyfingers', 8.00, '/images/menu/tiramisu.jpg', true, true, 4.9),
  ((SELECT id FROM menu_categories WHERE slug = 'desserts'), 'New York Cheesecake', 'Creamy cheesecake with graham cracker crust', 7.50, '/images/menu/cheesecake.jpg', true, true, 4.8),
  ((SELECT id FROM menu_categories WHERE slug = 'desserts'), 'Chocolate Lava Cake', 'Warm chocolate cake with molten center', 9.00, '/images/menu/lava-cake.jpg', true, false, 4.9),
  ((SELECT id FROM menu_categories WHERE slug = 'desserts'), 'Affogato', 'Vanilla gelato drowned in hot espresso', 6.50, '/images/menu/affogato.jpg', true, true, 4.8);
