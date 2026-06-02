import {
  singleFileValidator,
  LIMIT_COMMON_FILE_SIZE
} from '~/utils/validators'

// TC-RTL-VALID-01 - Black-box equivalence partitioning + BVA cho singleFileValidator
describe('singleFileValidator', () => {
  const buildFile = (overrides = {}) => ({
    name: 'photo.jpg',
    size: 1024,
    type: 'image/jpeg',
    ...overrides
  })

  it('returns blank-error when file is null/undefined', () => {
    expect(singleFileValidator(null)).toBe('File cannot be blank.')
    expect(singleFileValidator(undefined)).toBe('File cannot be blank.')
  })

  it.each([
    ['name', { name: '' }],
    ['size', { size: 0 }],
    ['type', { type: '' }]
  ])('returns blank-error when %s missing', (_, overrides) => {
    expect(singleFileValidator(buildFile(overrides))).toBe(
      'File cannot be blank.'
    )
  })

  it('returns size-error when file exceeds 10MB (boundary +1)', () => {
    const file = buildFile({ size: LIMIT_COMMON_FILE_SIZE + 1 })
    expect(singleFileValidator(file)).toBe(
      'Maximum file size exceeded. (10MB)'
    )
  })

  it('accepts files exactly at the 10MB boundary', () => {
    const file = buildFile({ size: LIMIT_COMMON_FILE_SIZE })
    expect(singleFileValidator(file)).toBeNull()
  })

  it('returns type-error when MIME type is not allowed', () => {
    const file = buildFile({ type: 'application/pdf' })
    expect(singleFileValidator(file)).toBe(
      'File type is invalid. Only accept jpg, jpeg and png'
    )
  })

  it.each(['image/jpg', 'image/jpeg', 'image/png'])(
    'accepts allowed MIME type %s',
    type => {
      expect(singleFileValidator(buildFile({ type }))).toBeNull()
    }
  )
})
