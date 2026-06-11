import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Expose jest as an alias for vi so test files written for Jest also run in Vitest.
;(globalThis as any).jest = vi
