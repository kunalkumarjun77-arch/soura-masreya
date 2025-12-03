// --- PERSONAS ---
const personas = [
    { type: 'man', pronoun: 'He', description: 'A man' },
    { type: 'woman', pronoun: 'She', description: 'A woman' },
    { type: 'woman_hijabi', pronoun: 'She', description: 'A woman wearing a stylish hijab' },
    { type: 'child_boy', pronoun: 'He', description: 'A young boy' },
    { type: 'child_girl', pronoun: 'She', description: 'A young girl' },
];

// --- LOCATIONS (Vastly Expanded Egyptian Context) ---
const locations: string[] = [
    // --- Cairo (Classic & Urban) ---
    'in a crowded Khan el-Khalili market at night, surrounded by glowing lanterns and the buzz of haggling',
    'on a quiet, leafy balcony overlooking the Zamalek district, with city lights twinkling below',
    'walking down the historic Moez Street in Islamic Cairo, with ancient mosques and madrasas lining the way',
    'inside a modern art gallery in Downtown Cairo, juxtaposed against classic European-style architecture',
    'browsing in a dusty, old bookstore in El-Attaba, shafts of light cutting through the air, the smell of old paper',
    'on a felucca on the Nile as the sun sets, casting a fiery orange glow over the water and the city skyline',
    'waiting for a metro at the crowded Sadat station, a blur of people rushing past in a chaotic rhythm',
    'in a traditional ahwa (coffee shop) engrossed in a game of backgammon, under a single bare bulb, sipping dark tea',
    'exploring the ancient Citadel of Saladin with a hazy sky creating a diffused light over the sprawling city',
    'in the tranquil garden of Al-Azhar Park, with the historic skyline of Islamic Cairo providing a stunning backdrop',
    'on a rooftop in Garden City, overlooking the Nile, with a gentle breeze rustling through nearby trees',
    'inside the chaotic Ramses Station, surrounded by the echoes of train announcements and hurried travelers',
    'at a bustling street food stall downtown, ordering a koshary bowl amidst the sounds of the city',
    'in the quiet, sun-drenched courtyard of the Ibn Tulun Mosque, feeling the immense history and peace',
    'on a packed microbus navigating the frenetic Cairo traffic, looking out the window at the city life',
    'exploring the narrow, shaded alleyways of Coptic Cairo, with ancient churches and history at every turn',
    'stuck in traffic on the 6th of October Bridge, with a river of red taillights stretching into the distance',
    'inside the opulent Cairo Opera House, waiting for a performance to begin',
    'at the top of the Cairo Tower at dusk, watching the megalopolis light up',
    'exploring the unique architecture of the Baron Empain Palace in Heliopolis',
    
    // --- Alexandria & Coastal ---
    'at a rustic, dimly lit cafe in Alexandria, the air thick with the smell of shisha and coffee, overlooking the Mediterranean',
    'walking on the Stanley Bridge with the sea spray in the air and distant ship lights on the horizon',
    'sitting on the steps of the Bibliotheca Alexandrina, the modern library an architectural marvel against the sea',
    'exploring the Roman Amphitheater in Kom El-Dikka, Alexandria',
    'on a beach in the North Coast (Sahel) during the off-season, with white sand and turquoise water looking serene and empty',
    'on the Alexandria corniche on a windy winter day, waves crashing against the sea wall',
    'at a seaside restaurant in Dahab, with floor cushions and a view of the Sinai mountains across the water',

    // --- Luxor & Aswan (Upper Egypt) ---
    'exploring the magnificent Karnak Temple in Luxor at sunrise, with light catching the hieroglyphs',
    'sailing on the Nile in Aswan on a felucca, passing by Elephantine Island and the Aga Khan Mausoleum',
    'in a Nubian village near Aswan, surrounded by brightly colored houses and warm, welcoming locals',
    'walking through the Valley of the Kings, the air dry and hot, feeling the weight of ancient history',
    'at the base of the colossal Abu Simbel temples, awestruck by their scale',

    // --- Occasions, Seasons & Events ---
    'at a family gathering for an Iftar during Ramadan, the table laden with food as the call to prayer begins',
    'amidst a vibrant Mouled celebration, with Sufi chanting, colorful lights, and street vendors selling sweets',
    'at a loud, joyful, and chaotic "farah sha\'bi" (traditional neighborhood wedding)',
    'celebrating Sham El Nessim in a public park, surrounded by families enjoying salted fish and green onions',
    'attending a Coptic Christmas mass, the scent of incense in the air and the sound of ancient chants',
    'preparing for Ramadan by hanging a colorful fanous (lantern) on a balcony',
    'having a late-night Sohour meal at a street tent (kheima) in Cairo during Ramadan, the air full of chatter and the smell of food',
    'attending Eid al-Fitr prayers in the early morning in a massive, open-air gathering',
    'at a family gathering on the first day of Eid, children showing off new clothes and eating kahk (special cookies)',
    'watching a traditional Tanoura dance performance, a mesmerizing swirl of colorful skirts and spiritual music',
    'at a "Sebou" celebration for a newborn, surrounded by family, candles, and unique rituals',
    'attending a traditional Henna party before a wedding, intricate designs being drawn on hands',
    'watching a classic Egyptian black-and-white film at an old, elegant cinema in downtown Cairo',
    'celebrating Mawlid al-Nabi (the Prophet\'s Birthday), buying a sugar doll (\'arouset el-moulid\') from a street stall',
    'on a cold, rainy winter evening in Cairo, walking under an umbrella, with streetlights reflecting on wet asphalt',
    'on a scorching hot summer afternoon, seeking shade under a large tree',
    'in a home decorated for Christmas with a small tree and festive lights',
    'at a New Year\'s Eve gathering on a rooftop, watching distant fireworks',

    // --- Home & Indoor Environments ---
    'in a local "forn balady" (bakery), watching the baker pull hot, fresh bread from the clay oven',
    'in the organized chaos of a workshop in the City of the Dead (Qarafa), where life and work continue among the tombs',
    'in a small village in the Nile Delta, surrounded by lush green fields and date palm trees',
    'at a weekly "souk" (market) in a provincial town, filled with farmers selling their produce',
    'inside a traditional Hammam (public bath), the air thick with steam',
    'in a home kitchen, sunlight streaming through the window, preparing a traditional Egyptian meal',
    'in a cozy, slightly messy living room, curled up on a sofa under a blanket',
    'at a simple wooden desk at home, surrounded by books and papers, with light from a desk lamp',
    'in the kitchen late at night, getting a glass of water, lit only by the refrigerator light',
    'sitting on the floor, leaning against a bed, reading a book',
    'in a plant nursery, surrounded by greenery and smelling the flowers',
    'in a home office, participating in a video call, with a slightly messy background',
    'in a cluttered but cozy bedroom, with clothes draped over a chair and posters on the wall',
    'on a sunlit enclosed balcony (veranda), with potted plants and a comfortable chair',
    'in a hallway, pausing for a moment before heading out',
    'in a personal home gym or workout corner, surrounded by simple equipment',
    'in a child\'s playroom, surrounded by toys and colorful drawings',

    // --- Commercial & Public Spaces ---
    'at a busy checkout counter in a supermarket, unloading a cart full of groceries',
    'in a brightly lit, chaotic supermarket aisle, pushing a shopping cart',
    'in a university library, surrounded by shelves of books, with the quiet hum of study',
    'in a small, local electronics shop, looking at gadgets',
    'at a laundromat, waiting for the cycle to finish, looking bored',
    'in a queue at a government building, looking tired and impatient',
    'inside a massive, modern shopping mall like Mall of Arabia, with the buzz of shoppers around',
    'at a food court in a mall, trying to decide what to eat',
    'in a modern co-working space, focused on a laptop',
    'in a hospital waiting room, looking anxious or bored',
    'at a local gym, in the middle of a workout',
    'in a university lecture hall, listening to a professor',
    'at a traditional tailor\'s shop, getting measured for clothes',
    'inside a pet shop, looking at the animals',
    'in a crowded pharmacy, waiting to pick up a prescription',

    // --- Transportation ---
    'in the passenger seat of a car, watching the world go by through the window',
    'waiting on a platform in a bustling, old train station',
    'at a crowded, noisy bus stop, waiting for the next bus to arrive',
    'riding an escalator in a metro station or shopping mall',
    'inside a ferry crossing the Nile or the Suez Canal',
    'in the back of a taxi, looking out at the city lights at night',
    'on a motorcycle, navigating through traffic (as a passenger)',

    // --- Nature & Recreation ---
    'exploring the otherworldly landscape of the White Desert, with its unique chalk rock formations',
    'in a date palm grove in the Siwa Oasis, the silence broken only by the wind',
    'at a sports club ("nady"), watching a tennis match or sitting by the pool',
    'hiking in the mountains of Sinai near St. Catherine\'s Monastery',
    'at a public garden, sitting on a bench and people-watching',
    'on a fire escape with a view of the city\'s back alleys',
];

// --- ACTIVITIES ---
const shared_activities: string[] = [
    'casually sipping a glass of mint tea, looking away from the camera as if lost in thought',
    'letting out a genuine, unforced laugh while looking at something on their phone',
    'thoughtfully staring into the distance, with a complex expression',
    'checking the time on their watch with a slight frown of concentration',
    'listening to music with earbuds in, completely absorbed and unaware of the surroundings',
    'bending down to tie their shoelaces, caught in a mundane, unposed moment',
    'in a deep, animated conversation, gesturing with their hands to make a point',
    'taking a photo with their phone, focused on framing a shot of something unseen',
    'leaning against a wall, scrolling through their phone with a neutral expression',
    'juggling a set of keys and a cup of coffee, a moment of minor, everyday chaos',
    'looking up at a building, with a sense of wonder or curiosity',
    'closing their eyes for a brief moment, as if savoring a quiet second in a loud place',
    'yawning widely, caught in a moment of sleepiness',
    'stretching their arms after sitting for a long time',
    'looking slightly confused while trying to read a map or directions on their phone',
    'fumbling for keys in a pocket or bag',
    'half-smiling at a private joke while looking at their phone',
    'shielding their eyes from the sun with their hand',
    'caught mid-sentence, mouth slightly open, explaining something with passion',
    'adjusting their hair or a piece of clothing absentmindedly',
    'looking down and smiling softly, perhaps reading a text message',
    'reacting with surprise to something just off-camera',
    'trying to untangle their earphone wires',
    'holding a cup of coffee or tea with both hands, warming them up',
    'lost in thought, doodling on a napkin with a pen',
    'glancing over their shoulder as if they heard a noise',
    'reading the back of a food package in a grocery store aisle',
    'struggling to open a stubborn jar or bottle',
    'waiting impatiently, tapping their foot or checking their phone repeatedly',
    'pointing at something in the distance to show it to an unseen companion',
    'letting their head fall back and closing their eyes for a moment of rest',
    'rubbing their temples as if tired or with a slight headache',
    'looking out a window on a rainy day, with a pensive expression',
    'being momentarily distracted by a passing dog or a child playing',
    'trying to remember something, looking up and to the side',
    'silently mouthing the lyrics to a song they\'re listening to',
    'biting their lower lip in concentration',
    'holding a phone to their ear, listening intently to a conversation',
    'packing or unpacking a bag, focused on the task',
    'peeling a fruit like an orange or banana',
    'giving a non-committal shrug to an unseen question',
    'leaning forward with elbows on knees, deep in thought',
    'wiping condensation off a cold glass of water',
    'carefully examining a product on a store shelf',
    'looking at their reflection in a shop window as they walk by',
    'trying to cool down by fanning themselves with a piece of paper on a hot day',
    'reacting to a funny video on their phone, trying to stifle a laugh in a quiet place',
    'putting on a jacket or taking it off as they enter or leave a building',
    'absentmindedly tracing patterns on a dusty surface',
];

const male_activities: string[] = [
    'adjusting his glasses while reading a worn-out paperback book',
    'hailing a classic black and white Cairo cab on a busy, chaotic street corner',
    'eating koshary from a street vendor, with a look of pure, unadulterated satisfaction',
    'passionately watching a football match (Ahly vs Zamalek) on a cafe TV, surrounded by cheering fans',
    'skillfully negotiating the price of a lantern with a shopkeeper in Khan el-Khalili',
    'getting caught in the middle of a joyful, loud \'zaffa\' (wedding procession) on the street',
    'ironing a shirt with intense concentration',
    'fixing a leaky faucet under the kitchen sink, looking frustrated',
    'chatting casually with the local "bawab" (doorman) at the entrance of a building',
    'getting a haircut at a traditional, old-school barbershop',
];

const female_activities: string[] = [
    'arranging a bouquet of fresh flowers on a table',
    'laughing with a friend, covering her mouth in a moment of shared joy',
    'trying on a piece of silver jewelry at a market stall',
    'carefully selecting fresh vegetables from a local market vendor',
    'writing in a journal at a quiet cafe corner',
    'applying lip balm in a subtle, quick gesture, looking in a small compact mirror',
    'feeding stray cats on a quiet side street',
    'watering plants on a small, sunny balcony',
    'kneading dough in a kitchen, with flour dusted on her hands',
    'sorting through old photographs with a nostalgic smile',
];

const child_activities: string[] = [
    'looking at something with wide-eyed wonder, their mouth slightly open',
    'chasing a flock of pigeons in a public square',
    'eating ice cream, with a little bit of it smudged on their cheek',
    'concentrating intensely while drawing with crayons on a piece of paper',
    'blowing bubbles in a park, reaching out to pop them',
    'peeking shyly from behind a parent\'s leg',
    'laughing uncontrollably while being tickled or playing a game',
    'building a tower with colorful wooden blocks on the floor',
    'pointing excitedly at an animal at the zoo',
    'proudly showing off a messy drawing they just finished',
    'playing hide-and-seek, poorly hidden behind a curtain',
    'trying to put on adult-sized shoes and stumbling around',
];


// --- CLOTHING ---
const male_clothing: string[] = [
    'a simple, well-worn black t-shirt and dark, slightly faded jeans',
    'a smart casual button-down shirt (maybe linen or chambray) with the sleeves rolled up',
    'a comfortable, grey oversized hoodie with the hood down, looking relaxed',
    'a light, breathable linen shirt, perfect for a hot Egyptian summer day, slightly wrinkled',
    'a stylish, faded denim jacket over a plain white tee, a classic look',
    'a simple off-white galabeya for a relaxed, authentic feel',
    'a classic polo shirt and comfortable chinos, looking effortlessly put-together',
    'a vintage-style band t-shirt, slightly distressed',
    'a lightweight jacket against a cool evening breeze',
    'a thick, knitted sweater for a cold winter day',
    'a formal suit that looks slightly out of place in a casual setting',
    'a local football team\'s jersey (Al Ahly or Zamalek)',
];

const female_clothing_non_hijabi: string[] = [
    'a flowy, floral summer dress and sandals',
    'a simple blouse tucked into high-waisted jeans',
    'a comfortable activewear set, as if coming from the gym',
    'a chic blazer over a t-shirt and trousers',
    'a bohemian-style maxi skirt and a simple top',
    'a casual jumpsuit in a solid color',
    'a cozy, oversized knit cardigan over a simple top',
    'a leather jacket for a cooler, edgier look',
];

const female_clothing_hijabi: string[] = [
    'a stylish, loosely wrapped turban in a vibrant color with a long-sleeved, modest top',
    'a long, elegant abaya with subtle embroidery',
    'wide-leg trousers paired with a long, flowy tunic',
    'a long denim skirt with a comfortable, tucked-in sweater',
    'a graceful, draped hijab in a neutral tone paired with a chic trench coat',
    'a sporty, hooded sweatshirt with the hood up over her hijab on a cold day',
    'a colorful, patterned headscarf that adds a pop of color to a simple outfit',
];

const child_clothing: string[] = [
    'a colorful t-shirt with a cartoon character on it and denim shorts',
    'a simple, comfortable little dress with a playful pattern',
    'a pair of cute overalls over a striped shirt',
    'cozy, one-piece pajamas with a fun design',
    'a small, formal school uniform that looks slightly too big',
    'a tiny football kit of a favorite player',
    'a puffy winter jacket and a warm beanie',
];


// --- PHOTO EFFECTS & LIGHTING ---
const lighting: string[] = [
    'the warm, golden hour sun casting long, dramatic shadows and a nostalgic glow',
    'the harsh, unfiltered midday sun, creating sharp, high-contrast shadows and blown-out highlights',
    'the vibrant, colorful glow of neon signs and car taillights reflecting on wet pavement at night',
    'the soft, diffused, melancholic light of a grey, overcast day',
    'a solitary, warm street lamp in an otherwise dark alley, creating a film noir effect',
    'dramatic, high-contrast window light slicing across their face in a dim room',
    'the cool, blueish light of pre-dawn, just as the city is waking up and the sky is pale',
    'dappled sunlight filtering through tree leaves, creating a pattern of light and shadow on them',
    'the flickering, unreliable light of a fluorescent tube in an old building',
    'the soft, intimate glow from a laptop screen illuminating their face in a dark room',
    'the mixed, chaotic lighting of a market, with tungsten bulbs, neon, and daylight all competing',
    'the sterile, even white light of a modern supermarket or office',
    'the warm, inviting glow of Ramadan lanterns (fanous) hanging in a street',
    'the dim, moody lighting of an old cinema before the movie starts',
];

const photo_effects: string[] = [
    'The focus is slightly soft, as if taken in a hurry.',
    'There is a subtle motion blur, capturing a moment of movement.',
    'A natural lens flare from a bright light source (the sun, a streetlamp) gracefully washes out part of the frame.',
    'The framing is slightly off-center and tilted (a slight Dutch angle), as if captured spontaneously.',
    'The image has a noticeable but realistic film grain or digital noise, especially in the shadows.',
    'The white balance is slightly off, giving the scene a warm, nostalgic tint or a cool, moody feel.',
    'Part of the foreground (like a table edge or another person\'s shoulder) is out of focus, adding a sense of depth and voyeurism.',
    'A subtle reflection from a window or a puddle is visible in the shot, layering the scene.',
    'The camera is positioned at a low angle, looking up, giving a sense of grandeur or a casual, hip-shot feel.',
    'A shallow depth of field makes the background melt into a beautiful, creamy bokeh.',
    'The image is slightly overexposed, with blown-out highlights that feel authentic to a smartphone camera struggling with bright light.',
    'Dust particles are visible, caught in a dramatic shaft of light, adding texture and atmosphere.',
    'A light leak effect with a warm orange or red hue streaks across one edge of the frame, mimicking an old film camera.',
    'The shot is taken through a glass pane (a window, a car windshield), with smudges and reflections adding a layer of realism.',
    'The entire image has a slight vertical camera shake, as if the photographer was walking while snapping the picture.',
    'The auto-focus has mistakenly locked onto the background, leaving the subject slightly soft—a common smartphone error.',
    'The composition is endearingly awkward, with the subject placed too close to the edge of the frame.',
    'The image is captured mid-motion, causing naturalistic blur on the person\'s hands or feet.',
    'The phone\'s auto-exposure struggled, causing a bright light source in the scene to be completely blown out, flooding a part of the image with light.',
    'A photographer\'s finger is just barely visible in the top corner of the frame, a classic sign of a rushed, candid photo.',
    'The image is taken from a slightly too-low or too-high angle, as if the phone was just held up without careful aiming.',
];

// --- SHOT TYPES ---
const shotTypes: Record<string, string> = {
    'close-up': 'A candid close-up shot focusing on their facial expression.',
    'medium': 'A candid medium shot, capturing from the waist up.',
    'full-body': 'A candid full-body shot, showing their entire figure in the environment.',
    'environmental': 'A wide, environmental portrait where the person is a small but significant part of a larger scene.',
};

// --- GENERATOR LOGIC ---
const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateRandomScene = (personaType: string = 'random', shotType: string = 'random'): string => {
    let persona;
    const selectedPersona = personas.find(p => p.type === personaType);

    if (personaType === 'random' || !selectedPersona) {
        persona = getRandomElement(personas);
    } else {
        persona = selectedPersona;
    }

    const location = getRandomElement(locations);
    const light = getRandomElement(lighting);
    const effect = getRandomElement(photo_effects);

    let shotDescription: string;
    if (shotType === 'random' || !shotTypes[shotType]) {
        const randomKey = getRandomElement(Object.keys(shotTypes));
        shotDescription = shotTypes[randomKey];
    } else {
        shotDescription = shotTypes[shotType];
    }

    let activity: string;
    let clothes: string;

    switch (persona.type) {
        case 'man':
            activity = getRandomElement([...male_activities, ...shared_activities]);
            clothes = getRandomElement(male_clothing);
            break;
        case 'woman':
            activity = getRandomElement([...female_activities, ...shared_activities]);
            clothes = getRandomElement(female_clothing_non_hijabi);
            break;
        case 'woman_hijabi':
            activity = getRandomElement([...female_activities, ...shared_activities]);
            clothes = getRandomElement(female_clothing_hijabi);
            break;
        case 'child_boy':
        case 'child_girl':
            activity = getRandomElement(child_activities);
            clothes = getRandomElement(child_clothing);
            break;
        default:
            activity = getRandomElement(shared_activities);
            clothes = getRandomElement(male_clothing);
    }
    
    // The user's prompt (the generated text) will describe a scene, 
    // and the core identity prompt will ensure the reference person is placed within it.
    const finalPrompt = `${persona.description} ${activity}, ${location}. ${shotDescription} The scene is lit by ${light}. ${persona.pronoun} is wearing ${clothes}. ${effect}`;

    // The core prompt in geminiService will handle placing the reference person
    // into this generated scene description.
    return finalPrompt;
};