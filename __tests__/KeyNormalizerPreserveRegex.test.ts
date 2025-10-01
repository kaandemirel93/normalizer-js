import KeyNormalizer from '../src/normalizers/KeyNormalizer';
import { NormalizerConfig } from '../src/types';

describe('KeyNormalizer preserve regex', () => {
  it('should preserve keys matching regex patterns', () => {
    const config: NormalizerConfig = {
      key: { style: 'camel', recursive: true, preserve: [/^user_id$/i, /_id$/] }
    };
    const normalizer = new KeyNormalizer(config);

    const input = {
      user_id: '1',
      account_id: '2',
      profile_name: 'Joe',
    };

    const result = normalizer.normalize(input, undefined, config);

    expect(result).toEqual({
      user_id: '1', // preserved
      account_id: '2', // preserved by regex _id$
      profileName: 'Joe',
    });
  });
});
