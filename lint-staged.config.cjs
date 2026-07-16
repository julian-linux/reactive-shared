module.exports = {
  '*.{ts,tsx}': [
    'eslint --no-warn-ignored',
    () => 'tsc --noEmit --skipLibCheck',
  ],
}