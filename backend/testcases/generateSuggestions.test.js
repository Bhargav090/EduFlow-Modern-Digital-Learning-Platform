const test = require('node:test')
const assert = require('node:assert/strict')
const { generateSuggestions } = require('../controllers/aiController')

test('suggestions when text mentions course', () => {
  const out = generateSuggestions('Recommend a course for me')
  assert.equal(out.length, 2)
  assert.ok(out.includes('Show me more details'))
})

test('suggestions when text mentions learn', () => {
  const out = generateSuggestions('I want to learn web dev')
  assert.equal(out.length, 2)
  assert.ok(out.includes('Create a weekly plan'))
})

test('suggestions when text mentions college', () => {
  const out = generateSuggestions('My college updates?')
  assert.equal(out.length, 2)
  assert.ok(out.includes('Campus news'))
})

test('default suggestions when no keywords matched', () => {
  const out = generateSuggestions('Hello there')
  assert.equal(out.length, 2)
  assert.ok(out.includes('Suggest a course'))
})
