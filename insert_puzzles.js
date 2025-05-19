// Script to insert sample puzzles into the database
const { Sequelize } = require('sequelize');

// Connect to the database directly
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
  logging: false
});

// Define the Puzzle model
const Puzzle = sequelize.define('Puzzle', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  level: {
    type: Sequelize.STRING,
    allowNull: false
  },
  puzzleData: {
    type: Sequelize.TEXT,
    allowNull: false
  }
}, {
  timestamps: true
});

// Sample puzzle data for testing
const samplePuzzles = [
  // 5 EASY PUZZLES
  {
    level: 'easy',
    puzzleData: JSON.stringify({
      grid: [
        'C', 'A', 'T', '#',
        'O', '#', 'O', '#',
        'W', 'O', 'R', 'D',
        '#', '#', 'Y', '#'
      ],
      cellNumbers: [1, 2, 3, null, 4, null, 5, null, 6, null, null, null, null, null, 7, null],
      clues: {
        across: [
          { number: 1, clue: "Feline pet" },
          { number: 4, clue: "Vowel sound" },
          { number: 6, clue: "A unit of language" },
          { number: 7, clue: "Question word" }
        ],
        down: [
          { number: 1, clue: "Female bovine" },
          { number: 2, clue: "Article" },
          { number: 3, clue: "Past tense of eat" },
          { number: 5, clue: "Organ of hearing" }
        ]
      }
    })
  },
  {
    level: 'easy',
    puzzleData: JSON.stringify({
      grid: [
        'D', 'O', 'G', '#',
        'A', '#', 'O', '#',
        'Y', 'E', 'S', '#',
        '#', '#', '#', '#'
      ],
      cellNumbers: [1, 2, 3, null, 4, null, 5, null, 6, 7, 8, null, null, null, null, null],
      clues: {
        across: [
          { number: 1, clue: "Man's best friend" },
          { number: 4, clue: "First letter of alphabet" },
          { number: 6, clue: "Affirmative response" }
        ],
        down: [
          { number: 1, clue: "Time period" },
          { number: 2, clue: "Circular shape" },
          { number: 3, clue: "Direction opposite of 'come'" },
          { number: 5, clue: "Preposition indicating location" }
        ]
      }
    })
  },
  {
    level: 'easy',
    puzzleData: JSON.stringify({
      grid: [
        'B', 'A', 'L', 'L',
        'O', '#', 'I', '#',
        'A', 'P', 'E', '#',
        'T', 'O', 'P', '#'
      ],
      cellNumbers: [1, 2, 3, 4, 5, null, 6, null, 7, 8, 9, null, 10, 11, 12, null],
      clues: {
        across: [
          { number: 1, clue: "Round toy to throw or kick" },
          { number: 5, clue: "Exclamation of surprise" },
          { number: 7, clue: "Primate similar to human" },
          { number: 10, clue: "Spinning toy or position above" }
        ],
        down: [
          { number: 1, clue: "Small vessel for sailing" },
          { number: 2, clue: "Grown person" },
          { number: 3, clue: "Small body of water" },
          { number: 4, clue: "Expression of laughter" },
          { number: 8, clue: "Grandfather or equal (abbr.)" },
          { number: 9, clue: "_____ and behold" }
        ]
      }
    })
  },
  {
    level: 'easy',
    puzzleData: JSON.stringify({
      grid: [
        'S', 'U', 'N', '#',
        'E', '#', 'O', '#',
        'A', 'I', 'R', '#',
        '#', '#', 'E', '#'
      ],
      cellNumbers: [1, 2, 3, null, 4, null, 5, null, 6, 7, 8, null, null, null, 9, null],
      clues: {
        across: [
          { number: 1, clue: "Star that Earth orbits" },
          { number: 4, clue: "Letter that looks like an eye" },
          { number: 6, clue: "What we breathe" },
          { number: 9, clue: "Ages and ages" }
        ],
        down: [
          { number: 1, clue: "Ocean waves on a beach" },
          { number: 2, clue: "Under, poetically" },
          { number: 3, clue: "Total" },
          { number: 5, clue: "Seven days" },
          { number: 7, clue: "Myself" },
          { number: 8, clue: "Color of grass" }
        ]
      }
    })
  },
  {
    level: 'easy',
    puzzleData: JSON.stringify({
      grid: [
        'H', 'A', 'T', '#',
        'A', '#', 'A', '#',
        'M', 'A', 'P', '#',
        '#', '#', 'E', '#'
      ],
      cellNumbers: [1, 2, 3, null, 4, null, 5, null, 6, 7, 8, null, null, null, 9, null],
      clues: {
        across: [
          { number: 1, clue: "Head covering" },
          { number: 4, clue: "First letter in alphabet" },
          { number: 6, clue: "Diagram of an area" },
          { number: 9, clue: "Used to make tea" }
        ],
        down: [
          { number: 1, clue: "Home" },
          { number: 2, clue: "Indefinite article" },
          { number: 3, clue: "Drink with dinner" },
          { number: 5, clue: "Father's partner" },
          { number: 7, clue: "A sour fruit" },
          { number: 8, clue: "Not down" }
        ]
      }
    })
  },
  
  // 3 INTERMEDIATE PUZZLES
  {
    level: 'intermediate',
    puzzleData: JSON.stringify({
      grid: [
        'P', 'U', 'Z', 'Z', 'L', 'E',
        'A', '#', 'E', '#', 'I', '#',
        'R', 'E', 'B', 'U', 'S', '#',
        'K', '#', 'R', '#', 'T', '#',
        '#', 'G', 'A', 'M', 'E', '#',
        '#', '#', '#', '#', 'N', '#'
      ],
      cellNumbers: [1, 2, 3, 4, 5, 6, 7, null, 8, null, 9, null, 10, 11, 12, 13, 14, null, 15, null, 16, null, 17, null, null, 18, 19, 20, 21, null, null, null, null, null, 22, null],
      clues: {
        across: [
          { number: 1, clue: "A problem to solve" },
          { number: 7, clue: "Atmosphere" },
          { number: 8, clue: "Letter after D" },
          { number: 9, clue: "Personal pronoun" },
          { number: 10, clue: "Picture puzzle" },
          { number: 15, clue: "Parking area" },
          { number: 16, clue: "Color" },
          { number: 17, clue: "Beverage" },
          { number: 18, clue: "Activity for fun" },
          { number: 22, clue: "Negative response" }
        ],
        down: [
          { number: 1, clue: "Writing tool" },
          { number: 2, clue: "Indefinite article" },
          { number: 3, clue: "Sleep state" },
          { number: 4, clue: "To consume food" },
          { number: 5, clue: "Look at" },
          { number: 6, clue: "Past tense of eat" },
          { number: 11, clue: "Start of a counting rhyme" },
          { number: 12, clue: "Upon" },
          { number: 13, clue: "Number of sides in a square" },
          { number: 14, clue: "Make a mistake" },
          { number: 19, clue: "Indefinite article" },
          { number: 20, clue: "Mouse sound" },
          { number: 21, clue: "Afternoon drink" }
        ]
      }
    })
  },
  {
    level: 'intermediate',
    puzzleData: JSON.stringify({
      grid: [
        'C', 'H', 'E', 'S', 'S', '#',
        'L', '#', 'X', '#', 'T', '#',
        'U', 'M', 'B', 'R', 'A', '#',
        'E', '#', 'A', '#', 'R', '#',
        '#', 'Q', 'U', 'E', 'S', 'T',
        '#', '#', 'D', '#', '#', '#'
      ],
      cellNumbers: [1, 2, 3, 4, 5, null, 6, null, 7, null, 8, null, 9, 10, 11, 12, 13, null, 14, null, 15, null, 16, null, null, 17, 18, 19, 20, 21, null, null, 22, null, null, null],
      clues: {
        across: [
          { number: 1, clue: "Board game with kings and queens" },
          { number: 6, clue: "Small amount of liquid" },
          { number: 7, clue: "Letter that marks the spot" },
          { number: 8, clue: "What a shirt is" },
          { number: 9, clue: "Shadow cast during an eclipse" },
          { number: 14, clue: "Pronoun for myself" },
          { number: 15, clue: "Insect that makes honey" },
          { number: 16, clue: "To tear" },
          { number: 17, clue: "Search for adventure" },
          { number: 22, clue: "Direction opposite of up" }
        ],
        down: [
          { number: 1, clue: "Piece of furniture" },
          { number: 2, clue: "Implement for eating soup" },
          { number: 3, clue: "Common lizard in backyards" },
          { number: 4, clue: "Illuminated" },
          { number: 5, clue: "Opposite of north" },
          { number: 10, clue: "Vegetable similar to a turnip" },
          { number: 11, clue: "Wild feline" },
          { number: 12, clue: "To look at carefully" },
          { number: 13, clue: "Organ for hearing" },
          { number: 18, clue: "Opposite of yes" },
          { number: 19, clue: "Used to eat food" },
          { number: 20, clue: "Body of water" },
          { number: 21, clue: "Yourself" }
        ]
      }
    })
  },
  {
    level: 'intermediate',
    puzzleData: JSON.stringify({
      grid: [
        'J', 'A', 'Z', 'Z', '#', 'P',
        'A', '#', 'E', '#', '#', 'I',
        'V', 'O', 'R', 'T', 'E', 'X',
        'A', '#', 'O', '#', '#', 'E',
        '#', 'Q', 'U', 'I', 'L', 'T',
        '#', '#', 'S', '#', '#', '#'
      ],
      cellNumbers: [1, 2, 3, 4, null, 5, 6, null, 7, null, null, 8, 9, 10, 11, 12, 13, 14, 15, null, 16, null, null, 17, null, 18, 19, 20, 21, 22, null, null, 23, null, null, null],
      clues: {
        across: [
          { number: 1, clue: "Music with improvisation" },
          { number: 5, clue: "Letter mail is sent with" },
          { number: 6, clue: "Large, flightless bird" },
          { number: 8, clue: "Measure of liquid volume" },
          { number: 9, clue: "Spinning whirlpool" },
          { number: 15, clue: "Type of volcanic rock" },
          { number: 16, clue: "Circular object" },
          { number: 17, clue: "Employ" },
          { number: 18, clue: "Bedcovering made of fabric pieces" },
          { number: 23, clue: "Scandinavian furniture store (abbr.)" }
        ],
        down: [
          { number: 1, clue: "Glass container" },
          { number: 2, clue: "Long stick hit by a bow" },
          { number: 3, clue: "Deep sleep state" },
          { number: 4, clue: "Enthusiasm or energy" },
          { number: 5, clue: "Part of the face" },
          { number: 7, clue: "Ready to eat" },
          { number: 10, clue: "Type of tree with needles" },
          { number: 11, clue: "Mathematical shape" },
          { number: 12, clue: "Small, round vegetable" },
          { number: 13, clue: "Not out" },
          { number: 14, clue: "Metal food container" },
          { number: 19, clue: "Type of tree" },
          { number: 20, clue: "Pronoun for a woman" },
          { number: 21, clue: "Lion's home" },
          { number: 22, clue: "Opposite of 'from'" }
        ]
      }
    })
  },
  
  // 2 ADVANCED PUZZLES
  {
    level: 'advanced',
    puzzleData: JSON.stringify({
      grid: [
        'Z', 'E', 'P', 'H', 'Y', 'R', '#', 'Q', 'U', 'A', 'Y',
        'E', '#', 'H', '#', '#', 'H', '#', 'U', '#', '#', 'A',
        'S', 'Y', 'Z', 'Y', 'G', 'Y', '#', 'I', 'X', 'O', 'R',
        'T', '#', '#', '#', 'A', 'U', 'R', 'Z', '#', '#', 'N',
        '#', 'V', 'O', 'R', 'T', 'M', 'E', 'Z', 'Z', 'O', '#',
        'E', 'O', '#', '#', 'E', 'B', '#', '#', '#', 'R', 'C',
        'T', 'X', 'I', 'A', 'A', 'A', '#', 'A', 'U', 'T', 'H',
        'Y', '#', '#', '#', '#', '#', 'J', 'A', '#', 'I', 'O',
        'M', 'A', 'E', 'S', 'T', 'R', 'O', 'C', '#', 'C', 'R',
        'O', '#', '#', 'C', '#', '#', 'U', 'U', '#', 'E', 'D',
        'L', 'Y', 'R', 'E', '#', 'O', 'S', 'E', 'A', 'R', '#'
      ],
      cellNumbers: [
        1, 2, 3, 4, 5, 6, null, 7, 8, 9, 10,
        11, null, 12, null, null, 13, null, 14, null, null, 15,
        16, 17, 18, 19, 20, 21, null, 22, 23, 24, 25,
        26, null, null, null, 27, 28, 29, 30, null, null, 31,
        null, 32, 33, 34, 35, 36, 37, 38, 39, 40, null,
        41, 42, null, null, 43, 44, null, null, null, 45, 46,
        47, 48, 49, 50, 51, 52, null, 53, 54, 55, 56,
        57, null, null, null, null, null, 58, 59, null, 60, 61,
        62, 63, 64, 65, 66, 67, 68, 69, null, 70, 71,
        72, null, null, 73, null, null, 74, 75, null, 76, 77,
        78, 79, 80, 81, null, 82, 83, 84, 85, 86, null
      ],
      clues: {
        across: [
          { number: 1, clue: "Gentle breeze" },
          { number: 7, clue: "Dock for loading ships" },
          { number: 11, clue: "Preposition indicating origin" },
          { number: 12, clue: "Radioactive element symbol" },
          { number: 13, clue: "Sixth letter of Greek alphabet" },
          { number: 14, clue: "Ancient Sumerian city" },
          { number: 15, clue: "First letter of Japanese syllabary" },
          { number: 16, clue: "Conjunction of celestial bodies" },
          { number: 22, clue: "Digital logic operator" },
          { number: 26, clue: "Building material made from clay" },
          { number: 27, clue: "Precious metal" },
          { number: 28, clue: "Northern lights" },
          { number: 32, clue: "Spinning motion" },
          { number: 35, clue: "Middle range in music" },
          { number: 41, clue: "Person from Greek island" },
          { number: 42, clue: "Poisonous alkaloid in nightshade" },
          { number: 43, clue: "Tidal bore" },
          { number: 44, clue: "Not on time" },
          { number: 45, clue: "Roman numeral for 900" },
          { number: 46, clue: "Unit of electrical charge" },
          { number: 47, clue: "Element symbol for thallium" },
          { number: 48, clue: "Chinese dynasty" },
          { number: 49, clue: "Chemical symbol for americium" },
          { number: 51, clue: "First letter, repeated" },
          { number: 53, clue: "Genuineness of a document" },
          { number: 57, clue: "Monetary unit of Myanmar" },
          { number: 58, clue: "Indonesian island" },
          { number: 59, clue: "Chemical symbol for actinium" },
          { number: 60, clue: "Short form of a Latin citation" },
          { number: 62, clue: "Expert musical conductor" },
          { number: 70, clue: "Chemical symbol for cerium" },
          { number: 71, clue: "Ancient religious hymn" },
          { number: 72, clue: "Measuring instrument" },
          { number: 73, clue: "Musical term for linked notes" },
          { number: 74, clue: "Japanese game" },
          { number: 75, clue: "Hawaiian ornament" },
          { number: 76, clue: "Italian for 'and'" },
          { number: 77, clue: "Past participle of 'to do'" },
          { number: 78, clue: "Ancient stringed instrument" },
          { number: 82, clue: "Japanese honorific" },
          { number: 83, clue: "Sea, in French" },
          { number: 85, clue: "To dry grain" },
          { number: 86, clue: "Chemical symbol for radium" }
        ],
        down: [
          { number: 1, clue: "Atomic number 30 element" },
          { number: 2, clue: "Form of oxygen" },
          { number: 3, clue: "Type of subatomic particle" },
          { number: 4, clue: "Chemical symbol for holmium" },
          { number: 5, clue: "Greek letter" },
          { number: 6, clue: "Royal messenger" },
          { number: 7, clue: "Ancient Egyptian soul" },
          { number: 8, clue: "Smallest unit of matter" },
          { number: 9, clue: "Type of radiation" },
          { number: 10, clue: "River deposit" },
          { number: 17, clue: "Chinese weight unit" },
          { number: 18, clue: "Egyptian sun god" },
          { number: 19, clue: "Musical interval" },
          { number: 20, clue: "Combining form meaning 'earth'" },
          { number: 21, clue: "Grammatical case in Finnish" },
          { number: 23, clue: "X in Roman numerals" },
          { number: 24, clue: "Mountain nymph" },
          { number: 25, clue: "Chemical symbol for argon" },
          { number: 29, clue: "Unit of inductance" },
          { number: 30, clue: "Zodiac sign" },
          { number: 31, clue: "First woman in Norse mythology" },
          { number: 33, clue: "Angular velocity symbol" },
          { number: 34, clue: "Chemical symbol for ruthenium" },
          { number: 36, clue: "Chemical symbol for einsteinium" },
          { number: 37, clue: "Zeno's philosophical school" },
          { number: 38, clue: "Measure of acidity" },
          { number: 39, clue: "Chemical symbol for zinc" },
          { number: 40, clue: "Open, in music" },
          { number: 50, clue: "Chemical symbol for astatine" },
          { number: 52, clue: "African antelope" },
          { number: 54, clue: "Chemical symbol for uranium" },
          { number: 55, clue: "Transuranium element" },
          { number: 56, clue: "Ancient Greek portico" },
          { number: 61, clue: "Obsolete term for spider" },
          { number: 63, clue: "Japanese drama" },
          { number: 64, clue: "Old Irish alphabet" },
          { number: 65, clue: "Genetic material" },
          { number: 66, clue: "Tibetan priest" },
          { number: 67, clue: "Chemical symbol for radon" },
          { number: 68, clue: "Volcanic crater" },
          { number: 69, clue: "Element symbol for calcium" },
          { number: 79, clue: "Chemical symbol for yttrium" },
          { number: 80, clue: "Chemical symbol for rhenium" },
          { number: 81, clue: "Chemical symbol for erbium" },
          { number: 84, clue: "Chemical symbol for astatine" }
        ]
      }
    })
  },
  {
    level: 'advanced',
    puzzleData: JSON.stringify({
      grid: [
        'P', 'A', 'L', 'I', 'M', 'P', 'S', 'E', 'S', 'T', '#',
        'A', '#', 'E', '#', 'N', '#', 'Y', '#', 'C', '#', 'X',
        'R', 'H', 'X', 'I', 'E', 'N', 'C', 'O', 'I', 'O', 'N',
        'A', '#', 'I', '#', 'M', '#', 'A', '#', 'N', '#', 'A',
        'D', 'E', 'C', 'A', 'O', 'N', 'M', 'O', 'T', 'I', 'F',
        'I', '#', 'O', '#', 'S', '#', 'O', '#', 'I', '#', 'O',
        'G', 'N', 'N', '#', 'Y', 'T', 'R', 'B', 'L', 'L', 'N',
        'M', '#', '#', 'Q', 'N', 'E', 'P', 'H', 'L', '#', 'I',
        '#', 'Z', 'E', 'U', 'G', 'M', 'A', 'I', 'A', 'E', 'A',
        'D', '#', '#', 'A', '#', 'A', '#', 'S', '#', 'P', '#',
        'U', 'B', 'I', 'S', 'I', 'T', 'O', 'M', '#', 'E', 'E'
      ],
      cellNumbers: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, null,
        11, null, 12, null, 13, null, 14, null, 15, null, 16,
        17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
        28, null, 29, null, 30, null, 31, null, 32, null, 33,
        34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44,
        45, null, 46, null, 47, null, 48, null, 49, null, 50,
        51, 52, 53, null, 54, 55, 56, 57, 58, 59, 60,
        61, null, null, 62, 63, 64, 65, 66, 67, null, 68,
        null, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78,
        79, null, null, 80, null, 81, null, 82, null, 83, null,
        84, 85, 86, 87, 88, 89, 90, 91, null, 92, 93
      ],
      clues: {
        across: [
          { number: 1, clue: "Manuscript with earlier text visible beneath newer text" },
          { number: 11, clue: "Abbr. for parallelogram" },
          { number: 12, clue: "Sloth genus" },
          { number: 13, clue: "Chemical symbol for neon" },
          { number: 14, clue: "Chinese syllable meaning 'one'" },
          { number: 15, clue: "Chemical symbol for scandium" },
          { number: 16, clue: "Variable in mathematics" },
          { number: 17, clue: "Uncommon atmospheric effect" },
          { number: 28, clue: "Type of metrical foot in poetry" },
          { number: 29, clue: "Chemical symbol for xenon" },
          { number: 30, clue: "Abbr. for membrane" },
          { number: 31, clue: "Chemical symbol for americium" },
          { number: 32, clue: "Combining form denoting nerve" },
          { number: 33, clue: "Chemical symbol for sodium" },
          { number: 34, clue: "Ten-sided polygon" },
          { number: 45, clue: "Self, in psychology" },
          { number: 46, clue: "Chemical symbol for cobalt" },
          { number: 47, clue: "A Slavic language code" },
          { number: 48, clue: "Chemical symbol for oxygen" },
          { number: 49, clue: "Letter in phonetic alphabet" },
          { number: 50, clue: "Symbol for the element flerovium" },
          { number: 51, clue: "Prefix meaning 'knowledge'" },
          { number: 54, clue: "Chemical symbol for yttrium" },
          { number: 55, clue: "Chemical symbol for terbium" },
          { number: 61, clue: "Measure of energy in physics" },
          { number: 62, clue: "Ancient Mesopotamian deity" },
          { number: 63, clue: "Chemical symbol for neptunium" },
          { number: 68, clue: "Ancient astronomical instrument" },
          { number: 69, clue: "Rhetorical device linking unlike things" },
          { number: 79, clue: "Prefix meaning 'two'" },
          { number: 80, clue: "Latin abbr. for 'quantity'" },
          { number: 81, clue: "Chemical symbol for astatine" },
          { number: 82, clue: "Ancient Syrian god" },
          { number: 83, clue: "Chemical symbol for phosphorus" },
          { number: 84, clue: "Prefix meaning 'all'" },
          { number: 92, clue: "Chemical symbol for einsteinium" },
          { number: 93, clue: "Type of fundamental particle" }
        ],
        down: [
          { number: 1, clue: "Pertaining to swamps" },
          { number: 2, clue: "Chemical symbol for actinium" },
          { number: 3, clue: "Symbol for the element lawrencium" },
          { number: 4, clue: "Chemical symbol for iodine" },
          { number: 5, clue: "Chemical symbol for manganese" },
          { number: 6, clue: "Chemical symbol for phosphorus" },
          { number: 7, clue: "Suffix in chemistry" },
          { number: 8, clue: "Chemical symbol for einsteinium" },
          { number: 9, clue: "Ancient Egyptian amulet" },
          { number: 10, clue: "Chemical symbol for tellurium" },
          { number: 18, clue: "Chemical symbol for helium" },
          { number: 19, clue: "Ancient Chinese state" },
          { number: 20, clue: "Chemical symbol for iridium" },
          { number: 21, clue: "Chemical symbol for neon" },
          { number: 22, clue: "Chemical symbol for nitrogen" },
          { number: 23, clue: "Abbr. for circa" },
          { number: 24, clue: "Chemical symbol for oxygen" },
          { number: 25, clue: "Chemical symbol for iodine" },
          { number: 26, clue: "Chemical symbol for oxygen" },
          { number: 27, clue: "Element symbol for nitrogen" },
          { number: 35, clue: "Chemical symbol for europium" },
          { number: 36, clue: "Chemical symbol for carbon" },
          { number: 37, clue: "Chemical symbol for argon" },
          { number: 38, clue: "Chemical symbol for osmium" },
          { number: 39, clue: "Chemical symbol for nitrogen" },
          { number: 40, clue: "Chemical symbol for molybdenum" },
          { number: 41, clue: "Chemical symbol for oxygen" },
          { number: 42, clue: "Chemical symbol for thallium" },
          { number: 43, clue: "Chemical symbol for iodine" },
          { number: 44, clue: "Chemical symbol for fluorine" },
          { number: 52, clue: "Chemical symbol for nobelium" },
          { number: 53, clue: "Chemical symbol for nitrogen" },
          { number: 56, clue: "Chemical symbol for radon" },
          { number: 57, clue: "Term in formal logic" },
          { number: 58, clue: "Chemical symbol for lanthanum" },
          { number: 59, clue: "Chemical symbol for lithium" },
          { number: 60, clue: "Chemical symbol for nitrogen" },
          { number: 64, clue: "Element prefix" },
          { number: 65, clue: "Chemical symbol for protactinium" },
          { number: 66, clue: "Chemical symbol for holmium" },
          { number: 67, clue: "Chemical symbol for lutetium" },
          { number: 70, clue: "Chemical symbol for europium" },
          { number: 71, clue: "Chemical symbol for uranium" },
          { number: 72, clue: "Chemical symbol for gallium" },
          { number: 73, clue: "Chemical symbol for mendelevium" },
          { number: 74, clue: "Chemical symbol for americium" },
          { number: 75, clue: "Chemical symbol for iodine" },
          { number: 76, clue: "Chemical symbol for astatine" },
          { number: 77, clue: "Chemical symbol for einsteinium" },
          { number: 78, clue: "Chemical symbol for actinium" },
          { number: 85, clue: "Chemical symbol for bismuth" },
          { number: 86, clue: "Chemical symbol for iodine" },
          { number: 87, clue: "Chemical symbol for silicon" },
          { number: 88, clue: "Chemical symbol for iodine" },
          { number: 89, clue: "Chemical symbol for tantalum" },
          { number: 90, clue: "Chemical symbol for oxygen" },
          { number: 91, clue: "Chemical symbol for manganese" }
        ]
      }
    })
  }
];

// Insert the sample puzzles
async function insertSamplePuzzles() {
  try {
    console.log('Inserting sample puzzles into database...');
    
    // Sync the model with the database
    await Puzzle.sync();
    
    // Insert the puzzles
    for (const puzzleData of samplePuzzles) {
      const puzzle = await Puzzle.create(puzzleData);
      console.log(`Created puzzle with ID: ${puzzle.id}, level: ${puzzle.level}`);
    }
    
    console.log('Sample puzzles inserted successfully');
    process.exit(0);
  } catch (error) {
    console.error('Failed to insert sample puzzles:', error.message);
    process.exit(1);
  }
}

// Run the function
insertSamplePuzzles();
