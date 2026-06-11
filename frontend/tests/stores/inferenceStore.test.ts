import { useInferenceStore } from '../../src/stores/inferenceStore'

beforeEach(() => {
  useInferenceStore.setState({ lastJobId: null })
})

describe('inferenceStore', () => {
  it('has null lastJobId initially', () => {
    expect(useInferenceStore.getState().lastJobId).toBeNull()
  })

  it('setLastJobId updates lastJobId', () => {
    useInferenceStore.getState().setLastJobId('job-123')
    expect(useInferenceStore.getState().lastJobId).toBe('job-123')
  })

  it('setLastJobId with a different value overwrites the previous id', () => {
    useInferenceStore.getState().setLastJobId('job-1')
    useInferenceStore.getState().setLastJobId('job-2')
    expect(useInferenceStore.getState().lastJobId).toBe('job-2')
  })

  it('setLastJobId(null) resets lastJobId to null', () => {
    useInferenceStore.getState().setLastJobId('job-456')
    useInferenceStore.getState().setLastJobId(null)
    expect(useInferenceStore.getState().lastJobId).toBeNull()
  })
})
