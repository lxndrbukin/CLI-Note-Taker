const { writeFileSync, readFileSync, existsSync } = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const data = {
  name: 'lxndrbukin',
  age: 29,
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

function addNote() {
  const notes = loadNotes();
  let note = {};
  rl.question('Enter your note: ', (noteContent: any) => {
    note = {
      id: notes.length + 1,
      content: noteContent,
      ...note,
    };
    rl.question('Enter tags (use comma to separate): ', (tags: any) => {
      note = {
        tags: tags.split(','),
        ...note,
      };
      notes.push(note);
      console.log('Note added successfully!');
      saveNotes(notes);
      rl.close();
    });
  });
}

// function showMenu() {
//   rl.question('What is hotter? ', (answer: any) => {
//     addNote();
//   });
// }

// writeFileSync('index.json', JSON.stringify(data));
addNote();
