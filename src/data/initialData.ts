
import { DictionaryData, DictionaryEntry } from '../types/dictionary';

const sampleEntries: DictionaryEntry[] = [
  {
    id: '1',
    word: 'baba',
    ipa: '/ˈbaba/',
    definitions: [
      {
        id: '1-1',
        grammaticalClass: 'noun',
        meaning: 'Any round object, especially balls or bubbles',
        example: 'Look at the baba in the sky!'
      }
    ],
    origin: 'From seeing soap bubbles in the bath',
    colorCombo: 1
  },
  {
    id: '2',
    word: 'nana-nana',
    ipa: '/ˈnana ˈnana/',
    definitions: [
      {
        id: '2-1',
        grammaticalClass: 'noun',
        meaning: 'Banana, but also any yellow fruit',
      },
      {
        id: '2-2',
        grammaticalClass: 'exclamation',
        meaning: 'Expression of joy when eating something sweet',
        example: 'Nana-nana! (while eating apple slices)'
      }
    ],
    origin: 'Started with bananas, expanded to all favorite fruits',
    colorCombo: 2
  },
  {
    id: '3',
    word: 'wawa',
    ipa: '/ˈwawa/',
    definitions: [
      {
        id: '3-1',
        grammaticalClass: 'noun',
        meaning: 'Water in any form - drinking water, bath water, rain',
      }
    ],
    origin: 'One of his first words, from trying to say "water"',
    colorCombo: 3
  },
  {
    id: '4',
    word: 'tata',
    ipa: '/ˈtata/',
    definitions: [
      {
        id: '4-1',
        grammaticalClass: 'interjection',
        meaning: 'Goodbye, but also used when throwing things away',
      },
      {
        id: '4-2',
        grammaticalClass: 'verb',
        meaning: 'To leave or to make something disappear',
        example: 'Tata toys! (when putting toys in the box)'
      }
    ],
    origin: 'From Italian "ciao" mixed with English "ta-ta"',
    colorCombo: 4
  },
  {
    id: '5',
    word: 'mimi',
    ipa: '/ˈmimi/',
    definitions: [
      {
        id: '5-1',
        grammaticalClass: 'noun',
        meaning: 'Sleep or anything related to bedtime',
      },
      {
        id: '5-2',
        grammaticalClass: 'adjective',
        meaning: 'Tired, sleepy',
        example: 'Luca mimi now'
      }
    ],
    origin: 'From Spanish "dormir" and French "dodo"',
    colorCombo: 1
  },
  {
    id: '6',
    word: 'papapa',
    ipa: '/paˈpapa/',
    definitions: [
      {
        id: '6-1',
        grammaticalClass: 'noun',
        meaning: 'Food in general, especially anything he wants to eat',
      }
    ],
    origin: 'From trying to say "papa" but meaning food',
    colorCombo: 2
  },
  {
    id: '7',
    word: 'dada-boom',
    ipa: '/ˈdada buːm/',
    definitions: [
      {
        id: '7-1',
        grammaticalClass: 'exclamation',
        meaning: 'Expression used when something falls or makes a loud noise',
      },
      {
        id: '7-2',
        grammaticalClass: 'verb',
        meaning: 'To drop or throw something intentionally',
        example: 'Dada-boom the blocks!'
      }
    ],
    origin: 'Combination of "dada" and sound effect "boom"',
    colorCombo: 3
  },
  {
    id: '8',
    word: 'gaga',
    ipa: '/ˈgaga/',
    definitions: [
      {
        id: '8-1',
        grammaticalClass: 'noun',
        meaning: 'Dog, or any four-legged animal',
      }
    ],
    origin: 'From trying to say "dog" in different languages',
    colorCombo: 4
  },
  {
    id: '9',
    word: 'zaza',
    ipa: '/ˈzaza/',
    definitions: [
      {
        id: '9-1',
        grammaticalClass: 'noun',
        meaning: 'Car, truck, or any vehicle that moves',
      },
      {
        id: '9-2',
        grammaticalClass: 'verb',
        meaning: 'To go fast, to drive',
        example: 'Zaza to park!'
      }
    ],
    origin: 'From the sound of cars zooming by',
    colorCombo: 1
  },
  {
    id: '10',
    word: 'lala',
    ipa: '/ˈlala/',
    definitions: [
      {
        id: '10-1',
        grammaticalClass: 'noun',
        meaning: 'Music or singing',
      },
      {
        id: '10-2',
        grammaticalClass: 'verb',
        meaning: 'To sing or make musical sounds',
        example: 'Lala with mama!'
      }
    ],
    origin: 'From musical sounds and lullabies',
    colorCombo: 2
  },
  {
    id: '11',
    word: 'kaka',
    ipa: '/ˈkaka/',
    definitions: [
      {
        id: '11-1',
        grammaticalClass: 'noun',
        meaning: 'Anything dirty or that needs cleaning',
      },
      {
        id: '11-2',
        grammaticalClass: 'adjective',
        meaning: 'Dirty, yucky',
        example: 'Hands kaka!'
      }
    ],
    origin: 'Universal child word for dirty things',
    colorCombo: 3
  },
  {
    id: '12',
    word: 'haha',
    ipa: '/ˈhaha/',
    definitions: [
      {
        id: '12-1',
        grammaticalClass: 'exclamation',
        meaning: 'Expression of joy and laughter',
      },
      {
        id: '12-2',
        grammaticalClass: 'adjective',
        meaning: 'Funny, amusing',
        example: 'Daddy haha!'
      }
    ],
    origin: 'Natural laughter sound that became a word',
    colorCombo: 4
  }
];

export const initialData: DictionaryData = {
  title: "Luca's Dictionary",
  description: "A collection of unique words from our little linguist as he learns to speak three languages at once.",
  entries: sampleEntries
};
