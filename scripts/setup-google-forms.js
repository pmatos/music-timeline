// Google Apps Script: Run once to create all 4 feedback forms for musiker.page.
//
// SETUP:
//   1. Go to https://script.google.com and create a new project.
//   2. Paste this entire file into Code.gs (replace default contents).
//   3. Go to Project Settings (gear icon) > Script Properties >
//      Add "GITHUB_TOKEN" with a fine-grained PAT that has Issues read/write
//      permission on pmatos/music-timeline.
//   4. Run the "setupAllForms" function (select it from the dropdown, click Run).
//   5. Grant permissions when prompted (Forms + Spreadsheets + UrlFetch).
//   6. Check the Execution Log for the 4 form URLs.
//
// The script creates 4 Google Forms, links each to a response spreadsheet,
// installs an onFormSubmit trigger on each spreadsheet, and logs the edit
// and public URLs for every form.

// ─── Configuration ───────────────────────────────────────────────

const REPO = 'pmatos/music-timeline';

// ─── GitHub issue creation ───────────────────────────────────────

function createGitHubIssue(title, body, labels) {
  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  if (!token) throw new Error('GITHUB_TOKEN not set in script properties');

  const response = UrlFetchApp.fetch(`https://api.github.com/repos/${REPO}/issues`, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: `token ${token}` },
    payload: JSON.stringify({ title, body, labels }),
  });

  if (response.getResponseCode() !== 201) {
    throw new Error(`GitHub API error ${response.getResponseCode()}: ${response.getContentText()}`);
  }

  return JSON.parse(response.getContentText()).html_url;
}

// ─── Form submit handlers ────────────────────────────────────────

function getField(e, name) {
  const resp = e.namedValues[name];
  return resp ? resp[0].trim() : '';
}

function onFormSubmitNewPerson(e) {
  const name = getField(e, 'Name');
  const born = getField(e, 'Birth year');
  const died = getField(e, 'Death year');
  const role = getField(e, 'Role');
  const instruments = getField(e, 'Instrument(s)');
  const bio = getField(e, 'Short bio');
  const wiki = getField(e, 'Wikipedia URL');
  const connections = getField(e, 'Connections');

  const title = `New person: ${name}`;
  const body = [
    `### Name\n${name}`,
    `### Birth year\n${born}`,
    died ? `### Death year\n${died}` : '### Death year\n_Living_',
    `### Role\n${role}`,
    `### Instrument(s)\n${instruments}`,
    bio ? `### Short bio\n${bio}` : null,
    wiki ? `### Wikipedia URL\n${wiki}` : null,
    connections ? `### Connections\n${connections}` : null,
    '_Submitted via Google Form_',
  ].filter(Boolean).join('\n\n');

  createGitHubIssue(title, body, ['new person']);
}

function onFormSubmitNewInstrument(e) {
  const instrument = getField(e, 'Instrument name');
  const eras = getField(e, 'Suggested eras');
  const people = getField(e, 'Key people to include');
  const context = getField(e, 'Additional context');

  const title = `New instrument: ${instrument}`;
  const body = [
    `### Instrument name\n${instrument}`,
    eras ? `### Suggested eras\n${eras}` : null,
    `### Key people to include\n${people}`,
    context ? `### Additional context\n${context}` : null,
    '_Submitted via Google Form_',
  ].filter(Boolean).join('\n\n');

  createGitHubIssue(title, body, ['new instrument']);
}

function onFormSubmitCorrection(e) {
  const dataType = getField(e, 'What needs correcting?');
  const affected = getField(e, 'Person or item affected');
  const current = getField(e, 'Current (incorrect) value');
  const correct = getField(e, 'Correct value');
  const source = getField(e, 'Source / reference');

  const title = `Correction: ${affected} — ${dataType.toLowerCase()}`;
  const body = [
    `### What needs correcting?\n${dataType}`,
    `### Person or item affected\n${affected}`,
    `### Current (incorrect) value\n${current}`,
    `### Correct value\n${correct}`,
    `### Source / reference\n${source}`,
    '_Submitted via Google Form_',
  ].filter(Boolean).join('\n\n');

  createGitHubIssue(title, body, ['correction']);
}

function onFormSubmitGeneral(e) {
  const category = getField(e, 'Category');
  const description = getField(e, 'Description');
  const steps = getField(e, 'Steps to reproduce');
  const context = getField(e, 'Additional context');

  const title = `[${category}] ${description.substring(0, 60)}${description.length > 60 ? '...' : ''}`;
  const body = [
    `### Category\n${category}`,
    `### Description\n${description}`,
    steps ? `### Steps to reproduce\n${steps}` : null,
    context ? `### Additional context\n${context}` : null,
    '_Submitted via Google Form_',
  ].filter(Boolean).join('\n\n');

  createGitHubIssue(title, body, []);
}

// ─── Form creation helpers ───────────────────────────────────────

function linkSpreadsheetAndTrigger(form, handlerName) {
  const ss = SpreadsheetApp.create(form.getTitle() + ' (Responses)');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  ScriptApp.newTrigger(handlerName)
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();

  return ss.getUrl();
}

// ─── Form builders ───────────────────────────────────────────────

function createNewPersonForm() {
  const form = FormApp.create('Musiker — Suggest a Person');
  form.setDescription(
    'Suggest a composer or performer to add to the musiker.page timeline. ' +
    'All fields marked * are required.'
  );
  form.setConfirmationMessage('Thank you! Your suggestion has been submitted.');

  form.addTextItem().setTitle('Name').setHelpText('e.g. "Clara Schumann"').setRequired(true);
  form.addTextItem().setTitle('Birth year').setHelpText('e.g. "1819"').setRequired(true);
  form.addTextItem().setTitle('Death year').setHelpText('Leave blank if living');
  form.addMultipleChoiceItem().setTitle('Role')
    .setChoiceValues(['composer', 'player', 'both']).setRequired(true);
  form.addTextItem().setTitle('Instrument(s)')
    .setHelpText('Which instrument timeline(s) should this person appear on? e.g. "piano, violin"')
    .setRequired(true);
  form.addParagraphTextItem().setTitle('Short bio')
    .setHelpText('A few sentences about their significance.');
  form.addTextItem().setTitle('Wikipedia URL')
    .setHelpText('https://en.wikipedia.org/wiki/...');
  form.addParagraphTextItem().setTitle('Connections')
    .setHelpText('Any teacher/student or other relationships with people already on the timeline.');

  const sheetUrl = linkSpreadsheetAndTrigger(form, 'onFormSubmitNewPerson');
  return { editUrl: form.getEditUrl(), publishedUrl: form.getPublishedUrl(), sheetUrl };
}

function createNewInstrumentForm() {
  const form = FormApp.create('Musiker — Suggest an Instrument');
  form.setDescription(
    'Suggest a new instrument timeline to add to musiker.page. ' +
    'All fields marked * are required.'
  );
  form.setConfirmationMessage('Thank you! Your suggestion has been submitted.');

  form.addTextItem().setTitle('Instrument name').setHelpText('e.g. "cello"').setRequired(true);
  form.addParagraphTextItem().setTitle('Suggested eras')
    .setHelpText('Key historical eras for this instrument and approximate date ranges.\ne.g. Baroque (1600-1750), Classical (1730-1820), ...');
  form.addParagraphTextItem().setTitle('Key people to include')
    .setHelpText('Notable composers and/or performers for this instrument.')
    .setRequired(true);
  form.addParagraphTextItem().setTitle('Additional context')
    .setHelpText('Why this instrument should be added, any references, etc.');

  const sheetUrl = linkSpreadsheetAndTrigger(form, 'onFormSubmitNewInstrument');
  return { editUrl: form.getEditUrl(), publishedUrl: form.getPublishedUrl(), sheetUrl };
}

function createCorrectionForm() {
  const form = FormApp.create('Musiker — Report a Correction');
  form.setDescription(
    'Report incorrect data on musiker.page (dates, names, bios, connections, etc.). ' +
    'All fields marked * are required.'
  );
  form.setConfirmationMessage('Thank you! Your correction has been submitted.');

  form.addMultipleChoiceItem().setTitle('What needs correcting?')
    .setChoiceValues([
      'Birth/death year', 'Person name', 'Bio text', 'Role (composer/player/both)',
      'Era dates or name', 'Connection between people', 'Photo/portrait',
      'Wikipedia or website URL', 'Other',
    ]).setRequired(true);
  form.addTextItem().setTitle('Person or item affected')
    .setHelpText('e.g. "J.S. Bach" or "Baroque era in piano timeline"')
    .setRequired(true);
  form.addParagraphTextItem().setTitle('Current (incorrect) value').setRequired(true);
  form.addParagraphTextItem().setTitle('Correct value').setRequired(true);
  form.addParagraphTextItem().setTitle('Source / reference')
    .setHelpText('Link or citation supporting the correction.')
    .setRequired(true);

  const sheetUrl = linkSpreadsheetAndTrigger(form, 'onFormSubmitCorrection');
  return { editUrl: form.getEditUrl(), publishedUrl: form.getPublishedUrl(), sheetUrl };
}

function createGeneralForm() {
  const form = FormApp.create('Musiker — Feedback');
  form.setDescription(
    'Bug reports, feature requests, or general feedback for musiker.page.'
  );
  form.setConfirmationMessage('Thank you! Your feedback has been submitted.');

  form.addMultipleChoiceItem().setTitle('Category')
    .setChoiceValues(['Bug', 'Feature request', 'Question', 'Other']).setRequired(true);
  form.addParagraphTextItem().setTitle('Description').setRequired(true);
  form.addParagraphTextItem().setTitle('Steps to reproduce')
    .setHelpText('If reporting a bug, describe how to reproduce it.');
  form.addParagraphTextItem().setTitle('Additional context')
    .setHelpText('Screenshots, browser info, or anything else relevant.');

  const sheetUrl = linkSpreadsheetAndTrigger(form, 'onFormSubmitGeneral');
  return { editUrl: form.getEditUrl(), publishedUrl: form.getPublishedUrl(), sheetUrl };
}

// ─── Main entry point ────────────────────────────────────────────

function setupAllForms() {
  const forms = [
    { name: 'New Person', create: createNewPersonForm },
    { name: 'New Instrument', create: createNewInstrumentForm },
    { name: 'Correction', create: createCorrectionForm },
    { name: 'General Feedback', create: createGeneralForm },
  ];

  Logger.log('=== Musiker Forms Setup ===\n');

  for (const f of forms) {
    const urls = f.create();
    Logger.log(`--- ${f.name} ---`);
    Logger.log(`  Public URL:  ${urls.publishedUrl}`);
    Logger.log(`  Edit URL:    ${urls.editUrl}`);
    Logger.log(`  Sheet URL:   ${urls.sheetUrl}`);
    Logger.log('');
  }

  Logger.log('=== Done! ===');
  Logger.log('All triggers installed. Remember to set GITHUB_TOKEN in Script Properties.');
}
