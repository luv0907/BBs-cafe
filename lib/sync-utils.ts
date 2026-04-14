import { addDocument } from "./firebase-utils";

export const initialMenuItems = [
  {
    name: 'Classic Espresso',
    category: 'coffee',
    price: 4.50,
    rating: 4.9,
    stock: 100,
    image: '/placeholder.jpg',
    description: 'Rich and intense espresso shot from 100% Arabica beans.',
    status: 'Active'
  },
  {
    name: 'Caramel Macchiato',
    category: 'coffee',
    price: 5.25,
    rating: 4.8,
    stock: 50,
    image: '/placeholder.jpg',
    description: 'Freshly steamed milk with vanilla-flavored syrup marked with espresso.',
    status: 'Active'
  },
  {
    name: 'Club Sandwich',
    category: 'snacks',
    price: 9.50,
    rating: 4.7,
    stock: 24,
    image: '/placeholder.jpg',
    description: 'Classic triple-decker with chicken, bacon, lettuce, and tomato.',
    status: 'Active'
  },
  {
    name: 'Double Choco Brownie',
    category: 'desserts',
    price: 4.25,
    rating: 4.9,
    stock: 12,
    image: '/placeholder.jpg',
    description: 'Fudgy chocolate brownie with dark chocolate chunks.',
    status: 'Low Stock'
  },
  {
    name: 'Breakfast Combo',
    category: 'combos',
    price: 15.00,
    rating: 4.8,
    stock: 40,
    image: '/placeholder.jpg',
    description: 'Cappuccino, croissant, and fresh fruit bowl.',
    status: 'Active'
  },
  {
    name: 'Iced Latte',
    category: 'coffee',
    price: 5.50,
    rating: 4.7,
    stock: 65,
    image: '/placeholder.jpg',
    description: 'Cold espresso with chilled milk over ice.',
    status: 'Active'
  },
  {
    name: 'French Fries',
    category: 'snacks',
    price: 5.00,
    rating: 4.6,
    stock: 80,
    image: '/placeholder.jpg',
    description: 'Crispy golden fries served with our signature dip.',
    status: 'Active'
  },
  {
    name: 'New York Cheesecake',
    category: 'desserts',
    price: 6.50,
    rating: 4.9,
    stock: 8,
    image: '/placeholder.jpg',
    description: 'Creamy cheesecake on a buttery graham cracker crust.',
    status: 'Low Stock'
  },
];

export const seedMenuDatabase = async () => {
  console.log("Seeding database with initial items...");
  let count = 0;
  for (const item of initialMenuItems) {
    try {
      await addDocument("menu", item);
      count++;
    } catch (err) {
      console.error(`Error adding ${item.name}:`, err);
    }
  }
  return count;
};
