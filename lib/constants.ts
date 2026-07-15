export const SITE = {
  name: "Pine Tree Golf Course",
  tagline: "Public Pete Dye Golf in Brownsburg, Indiana",
  subtagline: "18-hole championship layout just minutes west of Indianapolis.",
  address: "2450 Pine Ridge Rd, Brownsburg, IN 46112",
  phone: "(317) 555-0142",
  phoneHref: "tel:+13175550142",
  email: "proshop@pinetreegolf.com",
  manager: "Ryan Holt",
  managerTitle: "General Manager",
  hours: "Open daily — call for seasonal tee times",
  social: {
    facebook: "https://www.facebook.com/pinetreegolf",
  },
  mapEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3056.8!2d-86.397!3d39.843!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s2450%20Pine%20Ridge%20Rd%2C%20Brownsburg%2C%20IN%2046112!5e0!3m2!1sen!2sus!4v1",
} as const;

export const HERO_IMAGE = "/images/hero.jpg";

export const GALLERY_IMAGES = [
  {
    src: "https://static.wixstatic.com/media/ed04af_bae87069476d4bad9fda8fd4168a3a96~mv2_d_4032_3024_s_4_2.jpg/v1/fill/w_1600,h_1200,al_c,q_90/ed04af_bae87069476d4bad9fda8fd4168a3a96~mv2_d_4032_3024_s_4_2.jpg",
    alt: "Pine Tree Golf Course fairway",
  },
  {
    src: "https://static.wixstatic.com/media/ed04af_50c2eb63eefc40c0b99852c7e969f54b~mv2_d_4032_3024_s_4_2.jpg/v1/fill/w_1600,h_1200,al_c,q_90/ed04af_50c2eb63eefc40c0b99852c7e969f54b~mv2_d_4032_3024_s_4_2.jpg",
    alt: "Pine Tree Golf Course greens",
  },
  {
    src: "https://static.wixstatic.com/media/ed04af_de4fc6c6dce4421b8f3a11787bb49f8f~mv2.png/v1/fill/w_1600,h_800,al_c,q_90/ed04af_de4fc6c6dce4421b8f3a11787bb49f8f~mv2.png",
    alt: "Pine Tree Golf Course aerial view",
  },
  {
    src: "https://static.wixstatic.com/media/ed04af_715ce910640d432da0336e143a214342~mv2_d_2550_3300_s_4_2.jpg/v1/crop/x_0,y_0,w_2423,h_3053/fill/w_1200,h_1510,al_c,q_90/ed04af_715ce910640d432da0336e143a214342~mv2_d_2550_3300_s_4_2.jpg",
    alt: "Pine Tree Golf Course scorecard",
  },
] as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/book", label: "Book Tee Time" },
  { href: "/rates", label: "Rates" },
  { href: "/course", label: "Course" },
  { href: "/outings", label: "Outings" },
  { href: "/junior-golf", label: "Junior Golf" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
] as const;

export const DAILY_RATES = [
  { label: "9 Holes (Walking)", price: "$15.00" },
  { label: "9 Holes (With Cart)", price: "$20.00" },
  { label: "18 Holes (Walking)", price: "$24.00" },
  { label: "18 Holes (With Cart)", price: "$34.00" },
] as const;

export const PASS_RATES = [
  { label: "Season Pass — Single", price: "$1,200.00" },
  { label: "Season Pass — Single with Cart", price: "$1,800.00" },
  { label: "Season Pass — Family", price: "$1,800.00" },
  { label: "Season Pass — Family with Cart", price: "$2,400.00" },
  { label: "Junior Pass *", price: "$500.00", note: "18 years and younger, walking membership with driving range included." },
  { label: "Range Pass — Single", price: "$350.00" },
  { label: "Range Pass — Family", price: "$450.00" },
] as const;

export const RANGE_RATES = [
  { label: "Small Bucket", price: "$5.00" },
  { label: "Medium Bucket", price: "$10.00" },
  { label: "Large Bucket", price: "$15.00" },
] as const;

export const SCORECARD = {
  tees: ["Blue", "White", "Gold", "Red"] as const,
  front: [
    { hole: 1, par: 4, handicap: 15, blue: 370, white: 351, gold: 290, red: 288 },
    { hole: 2, par: 3, handicap: 7, blue: 187, white: 184, gold: 150, red: 110 },
    { hole: 3, par: 4, handicap: 17, blue: 371, white: 350, gold: 285, red: 254 },
    { hole: 4, par: 4, handicap: 5, blue: 378, white: 363, gold: 283, red: 260 },
    { hole: 5, par: 3, handicap: 13, blue: 155, white: 145, gold: 145, red: 135 },
    { hole: 6, par: 5, handicap: 11, blue: 527, white: 492, gold: 460, red: 460 },
    { hole: 7, par: 4, handicap: 1, blue: 453, white: 444, gold: 360, red: 393 },
    { hole: 8, par: 5, handicap: 9, blue: 506, white: 496, gold: 420, red: 419 },
    { hole: 9, par: 4, handicap: 3, blue: 440, white: 430, gold: 340, red: 339 },
  ],
  back: [
    { hole: 10, par: 3, handicap: 14, blue: 160, white: 147, gold: 112, red: 108 },
    { hole: 11, par: 5, handicap: 12, blue: 485, white: 470, gold: 420, red: 405 },
    { hole: 12, par: 5, handicap: 6, blue: 487, white: 469, gold: 380, red: 320 },
    { hole: 13, par: 4, handicap: 2, blue: 434, white: 348, gold: 280, red: 274 },
    { hole: 14, par: 3, handicap: 16, blue: 152, white: 144, gold: 144, red: 135 },
    { hole: 15, par: 4, handicap: 18, blue: 273, white: 262, gold: 240, red: 220 },
    { hole: 16, par: 4, handicap: 4, blue: 398, white: 386, gold: 285, red: 275 },
    { hole: 17, par: 4, handicap: 8, blue: 366, white: 348, gold: 265, red: 265 },
    { hole: 18, par: 4, handicap: 10, blue: 337, white: 328, gold: 288, red: 282 },
  ],
  totals: {
    frontPar: 36,
    backPar: 36,
    totalPar: 72,
    blue: 6479,
    white: 6157,
    gold: 5147,
    red: 4942,
  },
} as const;

export const AMENITY_CARDS = [
  { title: "18-Hole Championship Layout", description: "Pete Dye design with tree-lined fairways and challenging greens." },
  { title: "Driving Range", description: "Practice your game before your round with bucket options available." },
  { title: "Pro Shop", description: "Fully stocked pro shop with equipment, apparel, and expert advice." },
  { title: "Outings", description: "Corporate events, charity outings, leagues, and family gatherings." },
  { title: "Junior Golf", description: "Home course for local school teams and First Tee of Indiana." },
] as const;

export const BOOKING_SOURCES = ["online", "phone", "walk_in", "staff", "league", "other"] as const;
export const BOOKING_STATUSES = ["reserved", "checked_in", "cancelled", "no_show"] as const;
export const CART_PREFERENCES = ["walking", "cart", "unknown"] as const;
export const BLOCK_REASONS = [
  "League",
  "Outing",
  "Tournament",
  "Maintenance",
  "Frost delay",
  "Weather delay",
  "Private event",
  "Closed",
] as const;
