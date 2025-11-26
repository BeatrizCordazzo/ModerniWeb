INSERT INTO custom_furniture_options
  (service, name, type, base_price, image_url, min_width, max_width, min_height, max_height, depth, colors_json)
VALUES
  ('bathroom', 'Bathroom Vanity', 'storage', 599.95, 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop', 60, 180, 80, 90, 50,
    '[{"name":"White","code":"#FFFFFF"},{"name":"Oak","code":"#D2B48C"},{"name":"Gray","code":"#808080"},{"name":"Black","code":"#000000"}]'),
  ('bathroom', 'Bathroom Mirror', 'accessory', 199.95, 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=400&h=400&fit=crop', 50, 150, 60, 120, 5,
    '[{"name":"Chrome Frame","code":"#C0C0C0"},{"name":"Black Frame","code":"#000000"},{"name":"Gold Frame","code":"#FFD700"},{"name":"Frameless","code":"#FFFFFF"}]'),
  ('bathroom', 'Storage Cabinet', 'storage', 399.95, 'https://images.unsplash.com/photo-1595516695946-e22a04b82d70?w=400&h=400&fit=crop', 40, 80, 120, 200, 30,
    '[{"name":"White","code":"#FFFFFF"},{"name":"Oak","code":"#D2B48C"},{"name":"Gray","code":"#808080"},{"name":"Walnut","code":"#5C4033"}]'),
  ('bathroom', 'Shower Enclosure', 'fixture', 899.95, 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400&h=400&fit=crop', 80, 120, 180, 200, 80,
    '[{"name":"Clear Glass","code":"#E8F4F8"},{"name":"Frosted Glass","code":"#F0F0F0"},{"name":"Black Frame","code":"#000000"},{"name":"Chrome Frame","code":"#C0C0C0"}]'),
  ('bathroom', 'Bathtub', 'fixture', 1299.95, 'https://images.unsplash.com/photo-1564540583246-934409427776?w=400&h=400&fit=crop', 140, 180, 50, 65, 70,
    '[{"name":"White","code":"#FFFFFF"},{"name":"Matte Black","code":"#1C1C1C"},{"name":"Cream","code":"#FFFDD0"}]'),
  ('bathroom', 'Heated Towel Rack', 'accessory', 299.95, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=400&fit=crop', 50, 80, 80, 120, 15,
    '[{"name":"Chrome","code":"#C0C0C0"},{"name":"Brushed Nickel","code":"#B8B8B8"},{"name":"Matte Black","code":"#1C1C1C"},{"name":"Brass","code":"#B5A642"}]');

INSERT INTO custom_furniture_options
  (service, name, type, base_price, image_url, min_width, max_width, min_height, max_height, depth, colors_json)
VALUES
  ('kitchen', 'Base Cabinet', 'cabinet', 299.95, 'https://images.unsplash.com/photo-1595514535116-02876df50c56?w=400&h=400&fit=crop', 30, 120, 70, 90, 60,
    '[{"name":"White","code":"#FFFFFF"},{"name":"Oak","code":"#D2B48C"},{"name":"Walnut","code":"#5C4033"},{"name":"Gray","code":"#808080"}]'),
  ('kitchen', 'Upper Cabinet', 'cabinet', 249.95, 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=400&h=400&fit=crop', 30, 120, 50, 90, 35,
    '[{"name":"White","code":"#FFFFFF"},{"name":"Oak","code":"#D2B48C"},{"name":"Walnut","code":"#5C4033"},{"name":"Gray","code":"#808080"}]'),
  ('kitchen', 'Countertop', 'surface', 149.95, 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&h=400&fit=crop', 60, 300, 3, 5, 60,
    '[{"name":"Granite Black","code":"#1C1C1C"},{"name":"Marble White","code":"#F5F5F5"},{"name":"Quartz Gray","code":"#808080"},{"name":"Butcher Block","code":"#D2691E"}]'),
  ('kitchen', 'Kitchen Island', 'furniture', 899.95, 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=400&h=400&fit=crop', 100, 200, 85, 95, 80,
    '[{"name":"White","code":"#FFFFFF"},{"name":"Oak","code":"#D2B48C"},{"name":"Navy","code":"#001F3F"},{"name":"Gray","code":"#808080"}]'),
  ('kitchen', 'Tall Pantry', 'storage', 599.95, 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop', 60, 100, 200, 240, 60,
    '[{"name":"White","code":"#FFFFFF"},{"name":"Oak","code":"#D2B48C"},{"name":"Walnut","code":"#5C4033"},{"name":"Gray","code":"#808080"}]'),
  ('kitchen', 'Open Shelving Unit', 'storage', 199.95, 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&h=400&fit=crop', 60, 150, 30, 50, 30,
    '[{"name":"Natural Wood","code":"#D2B48C"},{"name":"White","code":"#FFFFFF"},{"name":"Black Metal","code":"#1C1C1C"},{"name":"Walnut","code":"#5C4033"}]');

INSERT INTO custom_furniture_options
  (service, name, type, base_price, image_url, min_width, max_width, min_height, max_height, depth, colors_json)
VALUES
  ('livingroom', 'Sofa', 'seating', 1299.95, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop', 180, 280, 80, 100, 90,
    '[{"name":"Gray","code":"#808080"},{"name":"Beige","code":"#F5F5DC"},{"name":"Navy","code":"#000080"},{"name":"Charcoal","code":"#36454F"}]'),
  ('livingroom', 'Coffee Table', 'table', 399.95, 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=400&h=400&fit=crop', 100, 150, 40, 50, 60,
    '[{"name":"Walnut","code":"#5C4033"},{"name":"Oak","code":"#D2B48C"},{"name":"White","code":"#FFFFFF"},{"name":"Black","code":"#000000"}]'),
  ('livingroom', 'TV Entertainment Unit', 'storage', 899.95, 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=400&h=400&fit=crop', 150, 250, 50, 70, 45,
    '[{"name":"Walnut","code":"#5C4033"},{"name":"Oak","code":"#D2B48C"},{"name":"White Gloss","code":"#FFFFFF"},{"name":"Gray","code":"#808080"}]'),
  ('livingroom', 'Bookshelf', 'storage', 699.95, 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=400&h=400&fit=crop', 80, 180, 180, 240, 35,
    '[{"name":"Walnut","code":"#5C4033"},{"name":"Oak","code":"#D2B48C"},{"name":"White","code":"#FFFFFF"},{"name":"Black","code":"#000000"}]'),
  ('livingroom', 'Side Table', 'table', 249.95, 'https://images.unsplash.com/photo-1550254478-ead40cc54513?w=400&h=400&fit=crop', 40, 60, 50, 65, 40,
    '[{"name":"Walnut","code":"#5C4033"},{"name":"Oak","code":"#D2B48C"},{"name":"White","code":"#FFFFFF"},{"name":"Marble Top","code":"#E8F4F8"}]'),
  ('livingroom', 'Accent Chair', 'seating', 549.95, 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop', 60, 80, 80, 100, 70,
    '[{"name":"Velvet Blue","code":"#4169E1"},{"name":"Gray Fabric","code":"#A9A9A9"},{"name":"Beige Linen","code":"#F5F5DC"},{"name":"Emerald Green","code":"#50C878"}]');

INSERT INTO custom_furniture_options
  (service, name, type, base_price, image_url, min_width, max_width, min_height, max_height, depth, colors_json)
VALUES
  ('bedroom', 'Bed Frame', 'furniture', 899.95, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop', 140, 200, 40, 150, 210,
    '[{"name":"Oak","code":"#D2B48C"},{"name":"Walnut","code":"#5C4033"},{"name":"White","code":"#FFFFFF"},{"name":"Gray","code":"#808080"}]'),
  ('bedroom', 'Nightstand', 'furniture', 249.95, 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=400&h=400&fit=crop', 40, 60, 50, 70, 40,
    '[{"name":"Oak","code":"#D2B48C"},{"name":"Walnut","code":"#5C4033"},{"name":"White","code":"#FFFFFF"},{"name":"Black","code":"#000000"}]'),
  ('bedroom', 'Dresser', 'storage', 699.95, 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop', 100, 180, 80, 120, 50,
    '[{"name":"Oak","code":"#D2B48C"},{"name":"Walnut","code":"#5C4033"},{"name":"White","code":"#FFFFFF"},{"name":"Gray","code":"#808080"}]'),
  ('bedroom', 'Wardrobe', 'storage', 1299.95, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', 100, 250, 180, 240, 60,
    '[{"name":"Oak","code":"#D2B48C"},{"name":"Walnut","code":"#5C4033"},{"name":"White","code":"#FFFFFF"},{"name":"Mirrored","code":"#E8F4F8"}]'),
  ('bedroom', 'Bedroom Bench', 'furniture', 349.95, 'https://images.unsplash.com/photo-1550254478-ead40cc54513?w=400&h=400&fit=crop', 100, 150, 40, 50, 40,
    '[{"name":"Fabric Gray","code":"#A9A9A9"},{"name":"Fabric Beige","code":"#F5F5DC"},{"name":"Leather Brown","code":"#654321"},{"name":"Velvet Navy","code":"#001F3F"}]'),
  ('bedroom', 'Vanity Table', 'furniture', 499.95, 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop', 80, 120, 75, 80, 45,
    '[{"name":"White","code":"#FFFFFF"},{"name":"Oak","code":"#D2B48C"},{"name":"Gold Accent","code":"#FFD700"},{"name":"Black","code":"#000000"}]');

INSERT INTO custom_furniture_options
  (service, name, type, base_price, image_url, min_width, max_width, min_height, max_height, depth, colors_json)
VALUES
  ('others', 'Entry Console', 'storage', 449.95, 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400&h=400&fit=crop', 90, 140, 75, 90, 35,
    '[{"name":"Walnut","code":"#5C4033"},{"name":"Oak","code":"#D2B48C"},{"name":"White","code":"#FFFFFF"},{"name":"Matte Black","code":"#1C1C1C"}]'),
  ('others', 'Accent Cabinet', 'storage', 799.95, 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=400&h=400&fit=crop', 80, 140, 90, 120, 45,
    '[{"name":"Indigo","code":"#264653"},{"name":"Mustard","code":"#E9C46A"},{"name":"Forest","code":"#2A9D8F"},{"name":"Charcoal","code":"#333333"}]'),
  ('others', 'Wall Shelf Set', 'storage', 199.95, 'https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?w=400&h=400&fit=crop', 40, 120, 20, 40, 20,
    '[{"name":"Natural Wood","code":"#D2B48C"},{"name":"Walnut","code":"#5C4033"},{"name":"White","code":"#FFFFFF"},{"name":"Black","code":"#000000"}]'),
  ('others', 'Reading Chair', 'seating', 599.95, 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop', 70, 90, 90, 110, 75,
    '[{"name":"Teal","code":"#008080"},{"name":"Rust","code":"#B7410E"},{"name":"Cream","code":"#FFFDD0"},{"name":"Gray","code":"#808080"}]'),
  ('others', 'Floor Lamp', 'lighting', 249.95, 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&h=400&fit=crop', 30, 40, 150, 180, 30,
    '[{"name":"Brass","code":"#B5A642"},{"name":"Matte Black","code":"#1C1C1C"},{"name":"White Shade","code":"#FFFFFF"},{"name":"Bronze","code":"#8C7853"}]'),
  ('others', 'Workspace Desk', 'furniture', 549.95, 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&h=400&fit=crop', 120, 180, 75, 80, 70,
    '[{"name":"Oak","code":"#D2B48C"},{"name":"Walnut","code":"#5C4033"},{"name":"White","code":"#FFFFFF"},{"name":"Graphite","code":"#4B4B4B"}]');
