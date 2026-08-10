import { FaHamburger, FaDrumstickBite, FaPizzaSlice, FaBreadSlice, FaUtensils, FaGlassWhiskey, FaHotdog, FaCarrot, FaIceCream } from 'react-icons/fa';

// Maps the group keys GET /api/MenuItems/grouped returns (sandwiches,
// chickenWings, ...) to what the admin sidebar/pills display, and to the
// `category` string the backend expects when creating a new item via
// POST /api/MenuItems. This is the same mapping as server/src/formatMenuItem.js's
// CATEGORY_TO_GROUP_KEY, just reversed — kept here rather than shared across
// the frontend/backend boundary since there's no existing shared-code setup
// between src/ and server/.
export const ADMIN_CATEGORIES = [
  { key: 'sandwiches', label: 'Sandwiches', categoryValue: 'Sandwiches', icon: FaHamburger },
  { key: 'chickenWings', label: 'Chicken', categoryValue: 'Chicken Wings', icon: FaDrumstickBite },
  { key: 'pizza', label: 'Pizza', categoryValue: 'Pizza', icon: FaPizzaSlice },
  { key: 'empanadas', label: 'Empanadas', categoryValue: 'Empanadas', icon: FaBreadSlice },
  { key: 'yaroa', label: 'Yaroas', categoryValue: 'Yaroa', icon: FaUtensils },
  { key: 'freshJuice', label: 'Fresh Juice', categoryValue: 'Fresh Juice', icon: FaGlassWhiskey },
  { key: 'chiliDogs', label: 'Chilli Dogs', categoryValue: 'Chilli Dogs', icon: FaHotdog },
  { key: 'sides', label: 'Sides', categoryValue: 'Sides', icon: FaCarrot },
  { key: 'desserts', label: 'Desserts', categoryValue: 'Desserts', icon: FaIceCream },
];
