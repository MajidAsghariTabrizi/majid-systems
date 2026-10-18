import test from 'node:test';
import assert from 'node:assert/strict';

import { ipHash, validateLead, LEAD_INTENTS } from '../src/lib/lead/validate';

const VALID = {
  intent: 'diagnostic',
  name: 'Test Person',
  email: 'test@example.com',
  message: 'Our support function is drowning in routine work and we need a point of view.',
  preferred: 'email',
  consent: true,
};

test('valid lead passes', () => {
  const r = validateLead(VALID);
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.value.intent, 'diagnostic');
    assert.equal(r.value.org, '');
  }
});

test('missing required fields → field errors', () => {
  const r = validateLead({ ...VALID, name: '', email: '', message: '', consent: false });
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.ok(r.errors.name && r.errors.email && r.errors.message && r.errors.consent);
  }
});

test('invalid email rejected', () => {
  assert.equal(validateLead({ ...VALID, email: 'not-an-email' }).ok, false);
  assert.equal(validateLead({ ...VALID, email: 'a@b' }).ok, false);
});

test('short message rejected', () => {
  assert.equal(validateLead({ ...VALID, message: 'hi' }).ok, false);
});

test('invalid optional website rejected; valid one passes', () => {
  assert.equal(validateLead({ ...VALID, website: 'not a url' }).ok, false);
  const ok = validateLead({ ...VALID, website: 'https://example.com' });
  assert.equal(ok.ok, true);
});

test('invalid intent rejected; all canonical intents pass', () => {
  assert.equal(validateLead({ ...VALID, intent: 'free-lunch' }).ok, false);
  for (const i of LEAD_INTENTS) {
    assert.equal(validateLead({ ...VALID, intent: i }).ok, true, i);
  }
});

test('oversized fields rejected', () => {
  assert.equal(validateLead({ ...VALID, name: 'x'.repeat(101) }).ok, false);
  assert.equal(validateLead({ ...VALID, message: 'x'.repeat(5001) }).ok, false);
});

test('preferred defaults to email when blank; bad value rejected', () => {
  const r = validateLead({ ...VALID, preferred: '' });
  assert.equal(r.ok, true);
  assert.equal(validateLead({ ...VALID, preferred: 'phone' }).ok, false);
});

test('preferredLink validated as URL', () => {
  assert.equal(validateLead({ ...VALID, preferredLink: 'linkedin.com/in/x' }).ok, false);
  assert.equal(validateLead({ ...VALID, preferredLink: 'https://linkedin.com/in/x' }).ok, true);
});

test('ipHash: deterministic, different inputs differ', () => {
  assert.equal(ipHash('1.2.3.4'), ipHash('1.2.3.4'));
  assert.notEqual(ipHash('1.2.3.4'), ipHash('5.6.7.8'));
});

test('non-object and null inputs rejected safely', () => {
  assert.equal(validateLead(null).ok, false);
  assert.equal(validateLead('string').ok, false);
  assert.equal(validateLead(42).ok, false);
});
