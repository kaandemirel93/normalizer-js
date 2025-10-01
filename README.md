# Normalizer JS

A small, dependency-free JavaScript/TypeScript library to normalize messy data structures: dates, numbers, booleans, nulls, and object key naming conventions.

[![npm version](https://img.shields.io/npm/v/normalizer-js.svg?style=flat)](https://www.npmjs.com/package/@kaandemirel/normalizer-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Build Status](https://github.com/kaandemirel93/normalizer-js/actions/workflows/ci.yml/badge.svg)](https://github.com/kaandemirel93/normalizer-js/actions)
[![codecov](https://codecov.io/gh/kaandemirel93/normalizer-js/branch/main/graph/badge.svg)](https://codecov.io/gh/kaandemirel93/normalizer-js)

## Features

- **Date Normalization**: Convert various date formats to a consistent format with timezone support
- **Number Normalization**: Parse numbers from strings with locale awareness
- **Boolean Normalization**: Convert various truthy/falsy values to proper booleans
- **Null Normalization**: Standardize null/undefined/empty values with custom null values
- **Key Normalization**: Convert object keys to consistent naming conventions (camelCase, snake_case, etc.)
- **Fully Configurable**: Customize behavior for each normalizer
- **TypeScript Support**: Built with TypeScript for better developer experience
- **Zero Dependencies**: 100% dependency-free for maximum compatibility and small bundle size
- **Tree-shakeable**: Only include the normalizers you need

## Installation

```bash
# Using npm
npm install normalizer-js

# Or using yarn
yarn add normalizer-js

# Or using pnpm
pnpm add normalizer-js
```

## Quick Start

You can use either the default exported instance (`normalizer`) or the `Normalizer` class.

```ts
// Option A: default instance
import normalizer from 'normalizer-js';

// Option B: class (includes Normalizer.normalize static helper)
import Normalizer from 'normalizer-js';

const data = {
  created_at: '2025-09-24',
  price: '1,200',
  is_active: 'yes',
  middle_name: 'N/A',
  user: {
    first_name: 'John',
    last_name: 'Doe',
    login_count: '42',
    preferences: { dark_mode: 'true', notifications: 'on' }
  },
  tags: ['tag_one', 'tag_two']
};

// Using default instance
const a = normalizer.normalize(data, { date: true, number: true, boolean: true, null: true, key: { style: 'camel' } });

// Or using the class helper
const b = Normalizer.normalize(data, { date: true, number: true, boolean: true, null: true, key: { style: 'camel' } });

// a and b will be equivalent
```

## Documentation

### Configuration

You can customize the normalization behavior by passing a configuration object:

```ts
import Normalizer, { normalizer } from 'normalizer-js';
import type { NormalizerConfig } from 'normalizer-js';

// Global configuration
const config: NormalizerConfig = {
  // Global options
  mode: 'loose',                 // 'strict' | 'loose'
  targetKeys: undefined,         // Only normalize these keys if provided
  deepClone: true,               // Deep clone objects/arrays before normalizing
  logging: false,                // Set to true to console.log normalizations

  // Per-normalizer toggles or configs (true enables with defaults)
  date: {                        // Or: true
    outputFormat: 'iso',         // 'iso' | 'timestamp' | custom pattern like 'YYYY-MM-DD'
    // timezone note: supports 'utc' | 'local' | numeric offsets like '+03:00' or '-0200'
    timezone: 'utc',
    strictMode: false
  },
  number: { allowFloat: true },  // Or: true
  boolean: true,
  null: true,
  key: { style: 'camel', recursive: true, preserve: [] }
};

const instance = new Normalizer(config);
const output = instance.normalize(data);
```

### API Reference

#### `normalize(data: any, config?: NormalizerConfig): any`

Normalizes the input data according to the provided configuration.

- `data`: The data to normalize (object, array, or primitive)
- `config`: Optional configuration object
- Returns: The normalized data

#### `new Normalizer(config?: NormalizerConfig)`

Creates a new normalizer instance with the given configuration.

### Examples

#### Date Normalization

```javascript
import { normalize } from 'normalizer-js';

const data = {
  date1: '2023-01-01',
  date2: '01/31/2023',
  date3: '2023-12-31T23:59:59.999Z',
  timestamp: 1672531200000
};

const normalized = Normalizer.normalize(data, {
  date: {
    outputFormat: 'MM/dd/yyyy',
    // Timezone support: 'utc' | 'local' | offsets like '+03:00' | '-0200'
    timezone: '+03:00'
  }
});

console.log(normalized);
/*
{
  date1: '12/31/2022',
  date2: '01/31/2023',
  date3: '12/31/2023',
  timestamp: '12/31/2022'
}
*/
```

#### Number Normalization

```javascript
import { normalize } from 'normalizer-js';

const data = {
  int: '42',
  float: '3.14',
  formatted: '1,234.56',
  negative: '-500.25'
};

const normalized = Normalizer.normalize(data, {
  number: {
    allowFloat: false // Round to integers
  }
});

console.log(normalized);
/*
{
  int: 42,
  float: 3,
  formatted: 1234,
  negative: -500
}
*/
```

#### Boolean Normalization

```javascript
import { normalize } from 'normalizer-js';

const data = {
  active: 'yes',
  verified: 'true',
  notifications: 'on',
  subscribed: 'no',
  admin: 'false'
};

const normalized = normalize(data);

console.log(normalized);
/*
{
  active: true,
  verified: true,
  notifications: true,
  subscribed: false,
  admin: false
}
*/
```

#### Null Normalization

```javascript
import { normalize } from 'normalizer-js';

const data = {
  name: 'John Doe',
  middleName: 'N/A',
  age: '',
  address: {
    street: '123 Main St',
    apartment: '--',
    zip: null
  },
  tags: ['', 'tag1', 'N/A']
};

const normalized = normalize(data);

console.log(normalized);
/*
{
  name: 'John Doe',
  middleName: null,
  age: null,
  address: {
    street: '123 Main St',
    apartment: null,
    zip: null
  },
  tags: [null, 'tag1', null]
}
*/
```

#### Key Normalization

```javascript
import { normalize } from 'normalizer-js';

const data = {
  user_name: 'johndoe',
  'first-name': 'John',
  LastName: 'Doe',
  contact_info: {
    email_address: 'john@example.com',
    phone_number: '123-456-7890'
  },
  USER_ROLE: 'admin'
};

// Convert to camelCase (default)
const camelCased = Normalizer.normalize(data, {
  key: {
    style: 'camel',
    preserve: ['USER_ROLE']
  }
});

console.log(camelCased);
/*
{
  userName: 'johndoe',
  firstName: 'John',
  lastName: 'Doe',
  contactInfo: {
    emailAddress: 'john@example.com',
    phoneNumber: '123-456-7890'
  },
  USER_ROLE: 'admin'
}
*/

// Convert to snake_case
const snakeCased = Normalizer.normalize(data, {
  key: {
    style: 'snake',
    recursive: true
  }
});

console.log(snakeCased);
/*
{
  user_name: 'johndoe',
  first_name: 'John',
  last_name: 'Doe',
  contact_info: {
    email_address: 'john@example.com',
    phone_number: '123-456-7890'
  },
  user_role: 'admin'
}
*/
```

## Real-world usage examples

- __CSV ingestion__: Convert imported CSV strings to typed values
  - Dates like `"01/31/2023"` to ISO, amounts like `"1,234.56"` to numbers, and empty fields to `null`.
- __API response cleanup__: Convert snake_case API payloads to camelCase and coerce types
  - Enable `key: { style: 'camel', recursive: true }`, plus `date: true`, `number: true`, `boolean: true`, `null: true`.
- __Strict data validation__: Fail fast when encountering invalid values
  - Set `mode: 'strict'` and enable needed normalizers; invalid values will throw with helpful errors.

## TypeScript usage

All public APIs are fully typed. You can import types like `NormalizerConfig` to author configs safely.

```ts
import Normalizer, { type NormalizerConfig } from 'normalizer-js';

const config: NormalizerConfig = { date: true, number: true, key: { style: 'camel' } };
const output = Normalizer.normalize({ created_at: '2023-01-01', amount: '1,000' }, config);
```

## Contributing

Contributions are welcome! If you’d like to help:

- Open issues for bugs, feature requests, or questions
- Submit PRs with tests (the repo enforces >= 80% global coverage)
- Follow the existing code style and lint rules

Before publishing to npm:

- Update `package.json` `name`, `author`, `repository`, and `bugs` fields
- Run `npm run build` to generate `dist/`
- Verify `npm run test` passes and coverage thresholds are met
- Tag a version and publish with `npm publish`

## License

MIT © Kaan Demirel
