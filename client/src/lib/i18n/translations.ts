export type LanguageCode = 'en' | 'si' | 'ta';

export interface Translations {
  // Brand & General
  brandName: string;
  brandTagline: string;
  fourPortals: string;
  signIn: string;
  signOut: string;
  loading: string;
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  submit: string;
  continue: string;
  back: string;
  search: string;
  filter: string;
  all: string;
  verified: string;
  pending: string;
  rejected: string;
  active: string;
  inactive: string;
  completed: string;
  inTransit: string;
  disputed: string;
  viewAll: string;
  emptyState: string;

  // Navigation & Shell
  dashboard: string;
  myFarms: string;
  cropListings: string;
  farmOrders: string;
  hubDropoffs: string;
  earningsWallet: string;
  wallet: string;
  messages: string;
  settings: string;
  availableTrips: string;
  hubSchedule: string;
  myVehicles: string;
  tripHistory: string;
  commandCenter: string;
  kycQueue: string;
  orderOversight: string;
  disputesDesk: string;
  payoutsQueue: string;
  logisticsConfig: string;
  auditTrail: string;
  reportsStudio: string;

  // Portals Directory
  portalSelectTitle: string;
  portalSelectSubtitle: string;
  farmerPortalTitle: string;
  farmerPortalSubtitle: string;
  farmerPortalDesc: string;
  customerPortalTitle: string;
  customerPortalSubtitle: string;
  customerPortalDesc: string;
  deliveryPortalTitle: string;
  deliveryPortalSubtitle: string;
  deliveryPortalDesc: string;
  adminPortalTitle: string;
  adminPortalSubtitle: string;
  adminPortalDesc: string;
  openPortal: string;

  // Farmer Portal specifics
  farmerOpsCenter: string;
  welcomeFarmer: string;
  farmerSubtitle: string;
  registerNewFarm: string;
  listNewCrop: string;
  totalRevenue: string;
  activeListings: string;
  pendingOrders: string;
  volumeDispatched: string;
  upcomingCollection: string;
  collectionNotice: string;
  registeredFarms: string;
  landExtent: string;
  acres: string;
  ownership: string;
  irrigation: string;
  certifiedOrganic: string;
  editFarm: string;
  deactivateFarm: string;
  activateFarm: string;
  viewListings: string;

  // Marketplace specifics
  marketplaceTitle: string;
  marketplaceSubtitle: string;
  freshProduce: string;
  addToBasket: string;
  buyNow: string;
  inStock: string;
  outOfStock: string;
  deliverTo: string;
  searchProducePlaceholder: string;
  escrowProtected: string;
  cart: string;
  checkout: string;
  trackOrder: string;
  rateExperience: string;
  raiseDispute: string;

  // Delivery Portal specifics
  deliveryFleet: string;
  goOnline: string;
  goOffline: string;
  radarMatching: string;
  todayEarnings: string;
  completedTrips: string;
  acceptTrip: string;
  activeTrip: string;
  hubIntakeSheet: string;
  signLockManifest: string;

  // Admin specifics
  executiveCommandCenter: string;
  approveKyc: string;
  rejectKyc: string;
  processPayout: string;
  lankaPayRef: string;
  adjudicateDispute: string;

  // KYC Alert Banner
  kycBannerTitle: string;
  kycBannerDesc: string;
  completeKycNow: string;

  // Customer Shell
  chats: string;
  wishlist: string;
  filters: string;
  searchPlaceholder: string;

  // Hero & Discovery
  exploreAllLots: string;
  b2bWholesale: string;
  viewingB2bWholesale: string;
  signInToUnlock: string;
  savedWishlist: string;
  liveOrderTracking: string;
  escrowWallet: string;
}

export const translations: Record<LanguageCode, Translations> = {
  en: {
    brandName: 'Pola.lk',
    brandTagline: 'Sri Lanka’s Agricultural Direct Marketplace',
    fourPortals: '4 Portals',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    loading: 'Loading...',
    save: 'Save Changes',
    cancel: 'Cancel',
    edit: 'Edit Details',
    delete: 'Delete',
    submit: 'Submit',
    continue: 'Continue',
    back: 'Back',
    search: 'Search...',
    filter: 'Filter',
    all: 'All',
    verified: 'Verified ✓',
    pending: 'Pending Review',
    rejected: 'Rejected',
    active: 'Active',
    inactive: 'Inactive',
    completed: 'Completed',
    inTransit: 'In Transit',
    disputed: 'Disputed',
    viewAll: 'View All',
    emptyState: 'No items found',

    dashboard: 'Dashboard',
    myFarms: 'My Farms',
    cropListings: 'Crop Listings',
    farmOrders: 'Farm Orders',
    hubDropoffs: 'Hub Drop-offs',
    earningsWallet: 'Wallet',
    wallet: 'Wallet',
    messages: 'Messages',
    settings: 'Profile & Settings',
    availableTrips: 'Available Trips',
    hubSchedule: 'Hub Schedule',
    myVehicles: 'My Vehicles',
    tripHistory: 'Trip History',
    commandCenter: 'Command Center',
    kycQueue: 'KYC Verifications',
    orderOversight: 'Order Oversight',
    disputesDesk: 'Disputes Desk',
    payoutsQueue: 'Payouts Queue',
    logisticsConfig: 'Logistics Config',
    auditTrail: 'Audit Trail',
    reportsStudio: 'Reports Studio',

    portalSelectTitle: 'Choose Your Dedicated Portal',
    portalSelectSubtitle: 'Pola operates 4 independent portals with distinct tools and workflows.',
    farmerPortalTitle: 'Farmer & Collector Portal',
    farmerPortalSubtitle: 'ගොවි සහ එකතුකරන්නන්ගේ පිවිසුම',
    farmerPortalDesc: 'List crop harvests, schedule village hub drop-offs, track wholesale orders, and request LankaPay bank withdrawals.',
    customerPortalTitle: 'Customer & Buyer Marketplace',
    customerPortalSubtitle: 'පාරිභෝගික සහ වෙළඳ පිවිසුම',
    customerPortalDesc: 'Browse fresh produce from all 25 districts with dual-range price filters, wholesale discounts, and escrow protection.',
    deliveryPortalTitle: 'Delivery Fleet & Courier Portal',
    deliveryPortalSubtitle: 'බෙදාහැරීමේ රියදුරු පිවිසුම',
    deliveryPortalDesc: 'Access GPS radius radar to match with Leg-1 village collections or Leg-2 doorstep deliveries with driver payouts.',
    adminPortalTitle: 'Executive Command Center',
    adminPortalSubtitle: 'පරිපාලන පාලක මැදිරිය',
    adminPortalDesc: 'Platform GMV analytics, split-screen KYC document verification, LankaPay withdrawal processing, and order routing.',
    openPortal: 'Open Portal',

    farmerOpsCenter: 'Farmer Portal',
    welcomeFarmer: 'Ayubowan, Farmer Partner!',
    farmerSubtitle: 'Manage your agricultural harvests, village hub drop-offs, and LankaPay payouts.',
    registerNewFarm: 'Register New Farm',
    listNewCrop: 'List New Crop',
    totalRevenue: 'Total Revenue (LKR)',
    activeListings: 'Active Harvest Listings',
    pendingOrders: 'Pending Orders',
    volumeDispatched: 'Volume Dispatched',
    upcomingCollection: 'Upcoming Village Collection Day',
    collectionNotice: 'Ensure your crops are harvested, weighed, and packed into standardized plastic crates before the 06:00 AM Hub intake schedule.',
    registeredFarms: 'Registered Farm Fields',
    landExtent: 'Land Extent',
    acres: 'Acres',
    ownership: 'Ownership',
    irrigation: 'Irrigation',
    certifiedOrganic: 'Certified Organic Farm',
    editFarm: 'Edit Farm Details',
    deactivateFarm: 'Deactivate Farm',
    activateFarm: 'Activate Farm',
    viewListings: 'View Crops on this Farm',

    marketplaceTitle: 'Direct from Farm to Table',
    marketplaceSubtitle: 'Buy fresh produce directly from verified local growers with 100% Escrow Protection.',
    freshProduce: 'Fresh Harvest Produce',
    addToBasket: 'Add to Basket',
    buyNow: 'Buy Now',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    deliverTo: 'Deliver to',
    searchProducePlaceholder: 'Search fresh vegetables, fruits, grains, spices...',
    escrowProtected: '100% Escrow Protected — Funds held until verified delivery',
    cart: 'Shopping Basket',
    checkout: 'Proceed to Checkout',
    trackOrder: 'Track Live Delivery',
    rateExperience: 'Rate Experience',
    raiseDispute: 'Report Issue / Dispute',

    deliveryFleet: 'Delivery Logistics Portal',
    goOnline: 'GO ONLINE',
    goOffline: 'OFFLINE',
    radarMatching: 'GPS Radius Radar Matching',
    todayEarnings: 'Today’s Earnings',
    completedTrips: 'Completed Trips',
    acceptTrip: 'Accept Order & Start Trip',
    activeTrip: 'Active Delivery HUD',
    hubIntakeSheet: 'Hub Intake & Grading Sheet',
    signLockManifest: 'Sign & Lock Hub Manifest',

    executiveCommandCenter: 'Executive Command Center',
    approveKyc: 'Approve & Verify Account',
    rejectKyc: 'Reject Documents',
    processPayout: 'Mark as LankaPay Processed',
    lankaPayRef: 'LankaPay Reference No.',
    adjudicateDispute: 'Adjudicate Dispute',

    kycBannerTitle: 'Identity Verification Incomplete',
    kycBannerDesc: 'Your account is pending verification. Submit your National Identity Card (NIC) to activate marketplace listings and payouts.',
    completeKycNow: 'Complete Verification Now →',

    // Customer Shell
    chats: 'Chats',
    wishlist: 'Wishlist',
    filters: 'Filters',
    searchPlaceholder: 'Search fresh harvest, crops...',

    // Hero & Discovery
    exploreAllLots: 'Explore All Lots',
    b2bWholesale: 'B2B Wholesale',
    viewingB2bWholesale: 'Viewing B2B Wholesale',
    signInToUnlock: 'Sign in to unlock',
    savedWishlist: 'Saved Wishlist',
    liveOrderTracking: 'Live Order Tracking',
    escrowWallet: 'Escrow Wallet',
  },

  si: {
    brandName: 'පොළ.lk',
    brandTagline: 'ශ්‍රී ලංකාවේ කෘෂිකාර්මික ඍජු වෙළඳපොළ',
    fourPortals: 'ප්‍රධාන පුවරු 4',
    signIn: 'ඇතුල් වන්න',
    signOut: 'ඉවත් වන්න',
    loading: 'පූරණය වෙමින් පවතී...',
    save: 'වෙනස්කම් සුරකින්න',
    cancel: 'අවලංගු කරන්න',
    edit: 'විස්තර සංස්කරණය',
    delete: 'මකන්න',
    submit: 'යොමු කරන්න',
    continue: 'ඉදිරියට යන්න',
    back: 'ආපසු',
    search: 'සොයන්න...',
    filter: 'පෙරහන',
    all: 'සියල්ල',
    verified: 'තහවුරු කරන ලදී ✓',
    pending: 'සමාලෝචනය වෙමින්',
    rejected: 'ප්‍රතික්ෂේපිතයි',
    active: 'ක්‍රියාකාරී',
    inactive: 'අක්‍රියයි',
    completed: 'සම්පූර්ණයි',
    inTransit: 'ප්‍රවාහනයේ',
    disputed: 'ගැටලුසහගතයි',
    viewAll: 'සියල්ල බලන්න',
    emptyState: 'කිසිදු අයිතමයක් නැත',

    dashboard: 'පාලක පුවරුව',
    myFarms: 'මගේ ගොවිබිම්',
    cropListings: 'අස්වනු ලැයිස්තුව',
    farmOrders: 'ගොවි ඇණවුම්',
    hubDropoffs: 'මධ්‍යස්ථාන භාරදීම්',
    earningsWallet: 'පසුම්බිය',
    wallet: 'පසුම්බිය',
    messages: 'පණිවිඩ',
    settings: 'ගිණුම් සැකසුම්',
    availableTrips: 'ලබාගත හැකි චාරිකා',
    hubSchedule: 'මධ්‍යස්ථාන කාලසටහන',
    myVehicles: 'මගේ වාහන',
    tripHistory: 'චාරිකා ඉතිහාසය',
    commandCenter: 'පරිපාලන මැදිරිය',
    kycQueue: 'හැඳුනුම්පත් තහවුරු කිරීම්',
    orderOversight: 'ඇණවුම් අධීක්ෂණය',
    disputesDesk: 'ගැටලු විනිශ්චය',
    payoutsQueue: 'ගෙවීම් පෝලිම',
    logisticsConfig: 'ප්‍රවාහන සැකසුම්',
    auditTrail: 'විගණන සටහන',
    reportsStudio: 'වාර්තා මැදිරිය',

    portalSelectTitle: 'ඔබගේ කැපවූ පිවිසුම තෝරන්න',
    portalSelectSubtitle: 'පොළ වේදිකාව ස්වාධීන මෙහෙයුම් පුවරු 4කින් සමන්විත වේ.',
    farmerPortalTitle: 'ගොවි සහ එකතුකරන්නන්ගේ පිවිසුම',
    farmerPortalSubtitle: 'ගොවිබිම් සහ අස්වනු කළමනාකරණය',
    farmerPortalDesc: 'අස්වනු ලැයිස්තුගත කිරීම, ගම්මාන මධ්‍යස්ථාන වෙත භාරදීම, තොග ඇණවුම් සහ ලංකාපේ මුදල් ලබාගැනීම්.',
    customerPortalTitle: 'පාරිභෝගික සහ වෙළඳ පිවිසුම',
    customerPortalSubtitle: 'නැවුම් ගොවිපල අස්වනු මිලදී ගැනීම',
    customerPortalDesc: 'දිස්ත්‍රික්ක 25න්ම නැවුම් එළවළු, පළතුරු, ධාන්‍ය සහ කුළුබඩු ඍජුවම මිලදී ගන්න.',
    deliveryPortalTitle: 'බෙදාහැරීමේ රියදුරු පිවිසුම',
    deliveryPortalSubtitle: 'ප්‍රවාහන සහ කුරියර් හවුල්කරුවන්',
    deliveryPortalDesc: 'GPS රේඩාර් මඟින් ගම්මාන මධ්‍යස්ථාන එකතුකිරීම් සහ පාරිභෝගික දොරකඩ බෙදාහැරීම් භාරගන්න.',
    adminPortalTitle: 'පරිපාලන පාලක මැදිරිය',
    adminPortalSubtitle: 'විධායක සහ මෙහෙයුම් අධීක්ෂණය',
    adminPortalDesc: 'GMV විශ්ලේෂණ, KYC ලේඛන තහවුරු කිරීම්, ලංකාපේ බැංකු ගෙවීම් සහ ඇණවුම් පාලනය.',
    openPortal: 'පුවරුව විවෘත කරන්න',

    farmerOpsCenter: 'ගොවි පෝර්ටලය',
    welcomeFarmer: 'ආයුබෝවන්, ගොවි මහතාණෙනි!',
    farmerSubtitle: 'ඔබගේ කෘෂිකාර්මික අස්වනු, ගම්මාන මධ්‍යස්ථාන භාරදීම් සහ ලංකාපේ ගෙවීම් මෙහෙයවන්න.',
    registerNewFarm: 'නව ගොවිබිමක් ලියාපදිංචි කරන්න',
    listNewCrop: 'නව අස්වැන්නක් ලැයිස්තුගත කරන්න',
    totalRevenue: 'මුළු ආදායම (රු.)',
    activeListings: 'සක්‍රිය අස්වනු ලැයිස්තු',
    pendingOrders: 'භාරදීමට ඇති ඇණවුම්',
    volumeDispatched: 'බෙදාහැරූ මුළු බර',
    upcomingCollection: 'ඉදිරි ගම්මාන එකතුකිරීමේ දිනය',
    collectionNotice: 'උදෑසන 06:00 මධ්‍යස්ථාන භාරගැනීමට පෙර ඔබගේ අස්වැන්න කිරා, ප්‍රමිතිගත ප්ලාස්ටික් කූඩවල අසුරන්න.',
    registeredFarms: 'ලියාපදිංචි ගොවිබිම්',
    landExtent: 'ඉඩම් ප්‍රමාණය',
    acres: 'අක්කර',
    ownership: 'අයිතිය',
    irrigation: 'ජල සම්පාදනය',
    certifiedOrganic: 'කාබනික සහතිකලත් ගොවිපලක්',
    editFarm: 'ගොවිබිම් විස්තර සංස්කරණය',
    deactivateFarm: 'ගොවිබිම අක්‍රිය කරන්න',
    activateFarm: 'ගොවිබිම සක්‍රිය කරන්න',
    viewListings: 'මෙම බිමේ අස්වනු බලන්න',

    marketplaceTitle: 'ගොවිබිමෙන් ඔබගේ දොරකඩටම',
    marketplaceSubtitle: '100% එස්ක්‍රෝ ආරක්ෂාව සහිතව සෘජුවම ගොවීන්ගෙන් නැවුම් අස්වනු මිලදී ගන්න.',
    freshProduce: 'නැවුම් ගොවිපල අස්වැන්න',
    addToBasket: 'මල්ලට එක්කරන්න',
    buyNow: 'දැන් මිලදී ගන්න',
    inStock: 'තොග ඇත',
    outOfStock: 'තොග අවසන්',
    deliverTo: 'බෙදාහරින ලිපිනය',
    searchProducePlaceholder: 'එළවළු, පළතුරු, ධාන්‍ය, කුළුබඩු සොයන්න...',
    escrowProtected: '100% එස්ක්‍රෝ ආරක්ෂාව — භාණ්ඩ ලැබෙන තුරු මුදල් සුරක්ෂිතයි',
    cart: 'මිලදී ගැනීමේ මල්ල',
    checkout: 'ගෙවීම් පිටුවට යන්න',
    trackOrder: 'ඇණවුම නිරීක්ෂණය කරන්න',
    rateExperience: 'අදහස් හා ඇගයීම් දක්වන්න',
    raiseDispute: 'ගැටලුවක් වාර්තා කරන්න',

    deliveryFleet: 'බෙදාහැරීමේ ලොජිස්ටික්ස් පුවරුව',
    goOnline: 'සක්‍රිය වන්න',
    goOffline: 'අක්‍රියයි',
    radarMatching: 'GPS රේඩාර් සෙවීම',
    todayEarnings: 'අද දින ඉපැයීම්',
    completedTrips: 'සම්පූර්ණ කළ චාරිකා',
    acceptTrip: 'ඇණවුම භාරගෙන ආරම්භ කරන්න',
    activeTrip: 'සක්‍රිය බෙදාහැරීමේ පුවරුව',
    hubIntakeSheet: 'මධ්‍යස්ථාන තත්ත්ව පරීක්ෂාව',
    signLockManifest: 'මැනිෆෙස්ට් වාර්තාව අත්සන් කරන්න',

    executiveCommandCenter: 'පරිපාලන පාලක මැදිරිය',
    approveKyc: 'ගිණුම අනුමත කර තහවුරු කරන්න',
    rejectKyc: 'ලේඛන ප්‍රතික්ෂේප කරන්න',
    processPayout: 'ලංකාපේ හරහා ගෙවූ බව සටහන් කරන්න',
    lankaPayRef: 'ලංකාපේ යොමු අංකය (Ref No.)',
    adjudicateDispute: 'ගැටලුව විනිශ්චය කරන්න',

    kycBannerTitle: 'හැඳුනුම්පත් තහවුරු කිරීම අසම්පූර්ණයි',
    kycBannerDesc: 'ඔබගේ ගිණුම තවමත් තහවුරු කර නොමැත. අස්වනු විකිණීම සහ මුදල් ලබාගැනීම සක්‍රිය කිරීමට ඔබගේ ජාතික හැඳුනුම්පත (NIC) ඉදිරිපත් කරන්න.',
    completeKycNow: 'දැන්ම තහවුරු කරන්න →',

    // Customer Shell
    chats: 'සංවාද',
    wishlist: 'පැතුම් ලැයිස්තුව',
    filters: 'පෙරහන්',
    searchPlaceholder: 'නැවුම් අස්වනු සොයන්න...',

    // Hero & Discovery
    exploreAllLots: 'සියලු අස්වනු බලන්න',
    b2bWholesale: 'තොග වෙළඳාම (B2B)',
    viewingB2bWholesale: 'තොග වෙළඳාම බලමින්',
    signInToUnlock: 'ප්‍රවේශ වී ලබාගන්න',
    savedWishlist: 'කැමති ලැයිස්තුව',
    liveOrderTracking: 'සජීවී ඇණවුම් නිරීක්ෂණය',
    escrowWallet: 'පොලා පසුම්බිය',
  },

  ta: {
    brandName: 'Pola.lk',
    brandTagline: 'இலங்கையின் நேரடி விவசாய சந்தை',
    fourPortals: '4 முக்கிய தளங்கள்',
    signIn: 'உள்நுழைக',
    signOut: 'வெளியேறுக',
    loading: 'ஏற்றுகிறது...',
    save: 'சேமிக்க',
    cancel: 'ரத்து செய்க',
    edit: 'திருத்துக',
    delete: 'நீக்குக',
    submit: 'சமர்ப்பிக்க',
    continue: 'தொடர்க',
    back: 'பின்செல்க',
    search: 'தேடுக...',
    filter: 'வடிகட்டல்',
    all: 'அனைத்தும்',
    verified: 'சரிபார்க்கப்பட்டது ✓',
    pending: 'மதிப்பாய்வில்',
    rejected: 'நிராகரிக்கப்பட்டது',
    active: 'செயலில்',
    inactive: 'செயலற்றது',
    completed: 'முடிந்தது',
    inTransit: 'பயணத்தில்',
    disputed: 'சர்ச்சை',
    viewAll: 'அனைத்தையும் காண்க',
    emptyState: 'எதுவும் கிடைக்கவில்லை',

    dashboard: 'முகப்பு பலகை',
    myFarms: 'என் பண்ணைகள்',
    cropListings: 'பயிர் பட்டியல்',
    farmOrders: 'பண்ணை கட்டளைகள்',
    hubDropoffs: 'மையத்தில் ஒப்படைப்பு',
    earningsWallet: 'பணப்பை',
    wallet: 'பணப்பை',
    messages: 'செய்திகள்',
    settings: 'சுயவிவரம் & அமைப்புகள்',
    availableTrips: 'கிடைக்கும் பயணங்கள்',
    hubSchedule: 'மைய அட்டவணை',
    myVehicles: 'என் வாகனங்கள்',
    tripHistory: 'பயண வரலாறு',
    commandCenter: 'கட்டுப்பாட்டு மையம்',
    kycQueue: 'அடையாள சரிபார்ப்புகள்',
    orderOversight: 'கட்டளை மேற்பார்வை',
    disputesDesk: 'சர்ச்சை மேசை',
    payoutsQueue: 'பணம் செலுத்தும் வரிசை',
    logisticsConfig: 'போக்குவரத்து அமைப்புகள்',
    auditTrail: 'தணிக்கை பதிவு',
    reportsStudio: 'அறிக்கைகள் அரங்கம்',

    portalSelectTitle: 'உங்கள் தளத்தை தேர்ந்தெடுக்கவும்',
    portalSelectSubtitle: 'Pola தளம் 4 தனித்துவமான தளங்களை இயக்குகிறது.',
    farmerPortalTitle: 'விவசாயி & சேகரிப்பாளர் தளம்',
    farmerPortalSubtitle: 'பண்ணை மற்றும் அறுவடை மேலாண்மை',
    farmerPortalDesc: 'அறுவடைகளை பட்டியலிடவும், கிராம மையங்களில் ஒப்படைக்கவும், லங்காபே பணப்பரிமாற்றங்களை பெறவும்.',
    customerPortalTitle: 'வாடிக்கையாளர் & வாங்குவோர் சந்தை',
    customerPortalSubtitle: 'புதிய பண்ணை அறுவடை கொள்முதல்',
    customerPortalDesc: '25 மாவட்டங்களிலிருந்தும் புதிய காய்கறிகள், பழங்கள், தானியங்கள் மற்றும் மசாலாப் பொருட்களை வாங்கவும்.',
    deliveryPortalTitle: 'விநியோக ஓட்டுநர் தளம்',
    deliveryPortalSubtitle: 'போக்குவரத்து கூட்டாளர்கள்',
    deliveryPortalDesc: 'GPS ரேடார் மூலம் கிராம மைய சேகரிப்புகள் மற்றும் வாடிக்கையாளர் வீட்டு விநியோகங்களை ஏற்கவும்.',
    adminPortalTitle: 'நிர்வாக கட்டுப்பாட்டு மையம்',
    adminPortalSubtitle: 'மேற்பார்வை மற்றும் கட்டளை மையம்',
    adminPortalDesc: 'GMV பகுப்பாய்வு, KYC ஆவண சரிபார்ப்பு, லங்காபே வங்கி பணம் செலுத்துதல் மற்றும் கட்டளை மேலாண்மை.',
    openPortal: 'தளத்தை திறக்கவும்',

    farmerOpsCenter: 'விவசாய போர்டல்',
    welcomeFarmer: 'வணக்கம், விவசாய கூட்டாளரே!',
    farmerSubtitle: 'உங்கள் விவசாய அறுவடைகள், கிராம மைய ஒப்படைப்புகள் மற்றும் லங்காபே கொடுப்பனவுகளை நிர்வகிக்கவும்.',
    registerNewFarm: 'புதிய பண்ணையை பதிவு செய்யவும்',
    listNewCrop: 'புதிய பயிரை பட்டியலிடவும்',
    totalRevenue: 'மொத்த வருவாய் (LKR)',
    activeListings: 'செயலில் உள்ள பட்டியல்கள்',
    pendingOrders: 'நிலுவையில் உள்ள கட்டளைகள்',
    volumeDispatched: 'அனுப்பப்பட்ட மொத்த எடை',
    upcomingCollection: 'அடுத்த கிராம சேகரிப்பு நாள்',
    collectionNotice: 'காலை 06:00 மணிக்கு முன் அறுவடை செய்து, எடை போட்டு, பிளாஸ்டிக் பெட்டிகளில் அடைக்கவும்.',
    registeredFarms: 'பதிவு செய்யப்பட்ட பண்ணைகள்',
    landExtent: 'நில அளவு',
    acres: 'ஏக்கர்',
    ownership: 'உரிமைத்துவம்',
    irrigation: 'நீர்ப்பாசனம்',
    certifiedOrganic: 'இயற்கை சான்றளிக்கப்பட்ட பண்ணை',
    editFarm: 'பண்ணை விபரங்களை திருத்தவும்',
    deactivateFarm: 'பண்ணையை முடக்கவும்',
    activateFarm: 'பண்ணையை இயக்கவும்',
    viewListings: 'இப்பண்ணையின் பயிர்களை காண்க',

    marketplaceTitle: 'பண்ணையிலிருந்து உங்கள் இல்லத்திற்கு',
    marketplaceSubtitle: '100% எஸ்க்ரோ பாதுகாப்புடன் நேரடியாக விவசாயிகளிடமிருந்து புதிய விளைபொருட்களை வாங்கவும்.',
    freshProduce: 'புதிய பண்ணை விளைபொருட்கள்',
    addToBasket: 'கூடையில் சேர்க்கவும்',
    buyNow: 'இப்போதே வாங்கவும்',
    inStock: 'கையிருப்பில் உள்ளது',
    outOfStock: 'கையிருப்பில் இல்லை',
    deliverTo: 'விநியோக முகவரி',
    searchProducePlaceholder: 'காய்கறிகள், பழங்கள், தானியங்கள், மசாலாப் பொருட்களை தேடவும்...',
    escrowProtected: '100% எஸ்க்ரோ பாதுகாப்பு — விநியோகம் வரை பணம் பாதுகாப்பானது',
    cart: 'கொள்முதல் கூடை',
    checkout: 'பணம் செலுத்த தொடரவும்',
    trackOrder: 'நேரலை விநியோகத்தை கண்காணிக்கவும்',
    rateExperience: 'மதிப்பீடு வழங்கவும்',
    raiseDispute: 'பிரச்சினையை புகாரளிக்கவும்',

    deliveryFleet: 'விநியோக தளவாட தளம்',
    goOnline: 'இணைப்பில் இருங்கள்',
    goOffline: 'இணைப்பிலிருந்து விலகுங்கள்',
    radarMatching: 'GPS ரேடார் தேடல்',
    todayEarnings: 'இன்றைய வருமானம்',
    completedTrips: 'முடிக்கப்பட்ட பயணங்கள்',
    acceptTrip: 'கட்டளையை ஏற்று தொடங்கவும்',
    activeTrip: 'செயலில் உள்ள விநியோக பலகை',
    hubIntakeSheet: 'மைய மதிப்பீட்டு தாள்',
    signLockManifest: 'மேனிஃபெஸ்ட் ஆவணத்தில் கையொப்பமிடவும்',

    executiveCommandCenter: 'நிர்வாக கட்டுப்பாட்டு மையம்',
    approveKyc: 'கணக்கை அங்கீகரித்து சரிபார்க்கவும்',
    rejectKyc: 'ஆவணங்களை நிராகரிக்கவும்',
    processPayout: 'லங்காபே மூலம் செலுத்தப்பட்டதாக குறிக்கவும்',
    lankaPayRef: 'லங்காபே குறிப்பு எண் (Ref No.)',
    adjudicateDispute: 'சர்ச்சையை தீர்க்கவும்',

    kycBannerTitle: 'அடையாள சரிபார்ப்பு முழுமையடையவில்லை',
    kycBannerDesc: 'உங்கள் கணக்கு சரிபார்க்கப்படாமல் உள்ளது. விற்பனை மற்றும் பணம் பெறுவதை செயல்படுத்த உங்கள் தேசிய அடையாள அட்டையை (NIC) சமர்ப்பிக்கவும்.',
    completeKycNow: 'இப்போதே சரிபார்க்கவும் →',

    // Customer Shell
    chats: 'உரையாடல்கள்',
    wishlist: 'விருப்பப்பட்டியல்',
    filters: 'வடிகட்டிகள்',
    searchPlaceholder: 'புதிய விளைச்சலைத் தேடுக...',

    // Hero & Discovery
    exploreAllLots: 'அனைத்து விளைச்சல்களையும் காண்க',
    b2bWholesale: 'மொத்த வர்த்தகம் (B2B)',
    viewingB2bWholesale: 'மொத்த வர்த்தகத்தை பார்க்கிறீர்கள்',
    signInToUnlock: 'அணுக உள்நுழைக',
    savedWishlist: 'விருப்பப்பட்டியல்',
    liveOrderTracking: 'நேரடி ஆர்டர் கண்காணிப்பு',
    escrowWallet: 'பாதுகாப்பான பணப்பை',
  },
};
