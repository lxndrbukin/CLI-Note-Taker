const { writeFileSync, readFileSync, existsSync } = require('fs');
const readline = require('readline');

type Note = {
  id: number;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

function noteTemplate(note: Note): void {
  const date = new Date(note.createdAt);
  console.log('\x1b[33m━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m'); // Yellow separator
  console.log(
    `\x1b[1m${note.id}. ${note.title} (${date.toLocaleString()})\x1b[0m\n`
  ); // Bold note title
  console.log(`\x1b[37m${note.content}\x1b[0m\n`); // White note content
  console.log(`\x1b[35mTags: \x1b[32m${note.tags.join(', ')}\x1b[0m`); // Magenta label + Green tags
  console.log('\x1b[33m━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m'); // Yellow separator
}

function loadNotes(): Note[] {
  if (existsSync('./notes.json')) {
    const data = readFileSync('./notes.json', 'utf-8');
    return JSON.parse(data);
  }
  return [];
}

function showNotes(): void {
  const notes = loadNotes();
  console.log(`\n\x1b[1m\x1b[31mTotal notes: \x1b[0m${notes.length}`);
  notes.forEach((note: Note) => {
    noteTemplate(note);
  });
}

function saveNotes(notes: Note[]): void {
  writeFileSync('notes.json', JSON.stringify(notes, null, 2));
}

async function addNote(): Promise<void> {
  const notes = loadNotes();
  const noteTitle = (await askQuestion('Enter note title: ')) as string;
  const noteContent = (await askQuestion('Enter note: ')) as string;
  const noteTags = (await askQuestion(
    'Enter tags (comma separated): '
  )) as string;

  const note = {
    id: notes.length + 1,
    title: noteTitle.trim(),
    content: noteContent.trim(),
    tags: noteTags.split(',').map((tag: string) => tag.trim()),
    createdAt: new Date().toISOString(),
  };

  notes.push(note);
  saveNotes(notes);
  console.log('Note added successfully!');
  rl.close();
}

async function findNotes(): Promise<void> {
  const notes = loadNotes();
  const searchQuery = (await askQuestion('Enter search query: ')) as string;
  const matchingNotes = notes.filter((note: Note) => {
    if (searchQuery === '') return true;
    const matchByTitle = note.title.toLowerCase() === searchQuery.toLowerCase();
    const matchByContent = note.content.includes(searchQuery.toLowerCase());
    const matchByTag = note.tags.some((tag: string) =>
      tag.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchByTitle || matchByContent || matchByTag;
  });
  matchingNotes.forEach((note: Note) => {
    noteTemplate(note);
  });
  rl.close();
}

async function showMenu(): Promise<void> {
  const command = (await askQuestion(
    'Enter a command (add, list, find, quit): '
  )) as string;

  switch (command) {
    case 'add':
      addNote();
      break;
    case 'list':
      showNotes();
      break;
    case 'find':
      findNotes();
      break;
    case 'quit':
      rl.close();
      break;
    default:
      console.log('Invalid command');
  }
}

showMenu();
