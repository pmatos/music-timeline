/* Conventional Commits ruleset for commitlint.
 * .cjs so it loads correctly whether or not the repo's package.json sets "type":"module". */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // lint-pr-title.yml only checks type + optional scope (no subjectPattern
    // configured), so keep this check structural-only too — otherwise a title
    // that passes PR review can still fail here once GitHub's squash-merge
    // appends " (#NN)" to the subject or capitalizes it naturally.
    'subject-case': [0],
    'subject-full-stop': [0],
    'header-max-length': [0],
  },
};
