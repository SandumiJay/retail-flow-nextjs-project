import fs from 'fs';
import path from 'path';

const sessionFilePath = path.join(process.cwd(), 'session.json');

// Save session data
export function saveSessionData(key, value) {
  let sessionData = {};

  if (fs.existsSync(sessionFilePath)) {
    sessionData = JSON.parse(fs.readFileSync(sessionFilePath, 'utf8'));
  }

  sessionData[key] = value;
  fs.writeFileSync(sessionFilePath, JSON.stringify(sessionData, null, 2), 'utf8');
  console.log('Session data saved!');
}

// Retrieve session data
export function getSessionData(key) {
  if (!fs.existsSync(sessionFilePath)) {
    return null;
  }

  const sessionData = JSON.parse(fs.readFileSync(sessionFilePath, 'utf8'));
  return sessionData[key];
}

