const { writeFileSync, readFileSync, existsSync } = require('fs');
const readline = require('readline');

function wrapText(text: string, width: number = 50) {
  const words = text.split(' ');
  let line = '';
  let result = '';
  words.forEach((word: string): void => {
    if ((line + word).length > width) {
      result += line.trim() + '\n';
      line = '';
    }
    line += word + ' ';
  });
  result += line.trim();
  return result;
}

function wrapTextDynamic(text: string): string {
  const width = process.stdout.columns || 80;
  return wrapText(text, width - 5);
}

function lineSeparator(): void {
  const width = process.stdout.columns || 80;
  console.log('\x1b[33m━━\x1b[0m'.repeat((width - 5) / 2));
}

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

function createDB(): void {
  if (!existsSync('./notes.json')) {
    writeFileSync('notes.json', '[]');
  }
}

const askQuestion = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

function noteTemplate(note: Note): void {
  const date = new Date(note.createdAt);
  if (note.id === 1) lineSeparator();
  console.log(
    `\x1b[1m${note.id}. ${note.title} (${date.toLocaleString()})\x1b[0m\n`
  );
  console.log(`\x1b[37m${wrapTextDynamic(note.content)}\x1b[0m\n`);
  console.log(`\x1b[35mTags: \x1b[32m${note.tags.join(', ')}\x1b[0m`);
  lineSeparator();
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

async function deleteNote(): Promise<void> {
  const notes = loadNotes();
  const noteId = (await askQuestion('Enter note id: ')) as string;
  const noteIndex = notes.findIndex(
    (note: Note) => note.id === parseInt(noteId)
  );
  if (noteIndex === -1) {
    console.log('Note not found');
    rl.close();
    return;
  }
  notes.splice(noteIndex, 1);
  saveNotes(notes);
  console.log('Note deleted successfully!');
  rl.close();
}

async function findNotes(): Promise<void> {
  const notes = loadNotes();
  const searchQuery = (await askQuestion('Enter search query: ')) as string;
  const matchingNotes = notes.filter((note: Note): boolean => {
    if (searchQuery === '') return true;
    const matchByTitle = note.title.toLowerCase() === searchQuery.toLowerCase();
    const matchByContent = note.content.includes(searchQuery.toLowerCase());
    const matchByTag = note.tags.some((tag: string): boolean =>
      tag.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchByTitle || matchByContent || matchByTag;
  });
  matchingNotes.forEach((note: Note) => {
    noteTemplate(note);
  });
  rl.close();
}

async function start(): Promise<void> {
  createDB();
  const command = (await askQuestion(
    'Enter a command (add, list, find, quit): '
  )) as string;

  switch (command as string) {
    case 'add':
      addNote();
      break;
    case 'list':
      showNotes();
      break;
    case 'find':
      findNotes();
      break;
    case 'delete':
      deleteNote();
      break;
    case 'quit':
      rl.close();
      break;
    default:
      console.log('Invalid command');
  }
}

start();
