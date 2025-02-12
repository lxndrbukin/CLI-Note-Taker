const { writeFileSync, readFileSync, existsSync } = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query: string) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

function loadNotes() {
  if (existsSync('./notes.json')) {
    const data = readFileSync('./notes.json', 'utf-8');
    return JSON.parse(data);
  }
  return [];
}

function saveNotes(notes: any) {
  writeFileSync('notes.json', JSON.stringify(notes, null, 2));
}

async function addNote() {
  const notes = loadNotes();

  const noteContent = (await askQuestion('Enter note: ')) as string;
  const noteTags = (await askQuestion(
    'Enter tags (comma separated): '
  )) as string;

  const note = {
    id: notes.length + 1,
    content: noteContent.trim(),
    tags: noteTags.split(',').map((tag: string) => tag.trim()),
  };

  notes.push(note);
  saveNotes(notes);
  console.log('Note added successfully!');
  rl.close();
}

loadNotes();
addNote();
