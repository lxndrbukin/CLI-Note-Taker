const { writeFileSync, readFileSync, existsSync } = require('fs');
const readline = require('readline');

type Note = {
  id: number;
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

function loadNotes(): Note[] {
  if (existsSync('./notes.json')) {
    const data = readFileSync('./notes.json', 'utf-8');
    return JSON.parse(data);
  }
  return [];
}

function showNotes(): void {
  const notes = loadNotes();
  console.log('Notes:');
  notes.forEach((note: Note) => {
    console.log('\x1b[33m━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m'); // Yellow separator
    console.log(`\x1b[1mNote #${note.id}\x1b[0m`); // Bold note title
    console.log(`\x1b[37m${note.content}\x1b[0m`); // White note content
    console.log(`\x1b[35mTags: \x1b[32m${note.tags.join(', ')}\x1b[0m`); // Magenta label + Green tags
    console.log('\x1b[33m━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n'); // Yellow separator
  });
}

function saveNotes(notes: Note[]): void {
  writeFileSync('notes.json', JSON.stringify(notes, null, 2));
}

async function addNote(): Promise<void> {
  const notes = loadNotes();

  const noteContent = (await askQuestion('Enter note: ')) as string;
  const noteTags = (await askQuestion(
    'Enter tags (comma separated): '
  )) as string;

  const note = {
    id: notes.length + 1,
    content: noteContent.trim(),
    tags: noteTags.split(',').map((tag: string) => tag.trim()),
    createdAt: new Date().toISOString(),
  };

  notes.push(note);
  saveNotes(notes);
  console.log('Note added successfully!');
  rl.close();
}

async function showMenu(): Promise<void> {
  const command = (await askQuestion(
    'Enter a command (add, list, quit): '
  )) as string;

  switch (command) {
    case 'add':
      addNote();
      break;
    case 'list':
      showNotes();
      break;
    case 'quit':
      rl.close();
      break;
    default:
      console.log('Invalid command');
  }
}

showMenu();
