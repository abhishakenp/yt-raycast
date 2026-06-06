import { describe, expect, it, vi } from 'vitest'
import { createServer } from 'node:http'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { initSSEResponse, sendSSEEvent, sendSSEKeepalive, sseClients } from './sse.js'

describe('SSE utilities', () => {
  it('sendSSEEvent writes correct SSE format', () => {
    const mockRes = {
      writableEnded: false,
      write: vi.fn(),
    }
    
    sendSSEEvent(mockRes, 'test_event', { foo: 'bar' })
    
    expect(mockRes.write).toHaveBeenCalledWith('event: test_event\n')
    expect(mockRes.write).toHaveBeenCalledWith('data: {"foo":"bar"}\n\n')
  })

  it('sendSSEEvent returns false when response is ended', () => {
    const mockRes = {
      writableEnded: true,
      write: vi.fn(),
    }
    
    const result = sendSSEEvent(mockRes, 'test_event', { foo: 'bar' })
    
    expect(result).toBe(false)
    expect(mockRes.write).not.toHaveBeenCalled()
  })

  it('sendSSEKeepalive writes keepalive comment', () => {
    const mockRes = {
      writableEnded: false,
      write: vi.fn(),
    }
    
    sendSSEKeepalive(mockRes)
    
    expect(mockRes.write).toHaveBeenCalledWith(': keepalive\n\n')
  })

  it('sseClients tracks clients per session', () => {
    const mockRes1 = { writableEnded: false, on: vi.fn() }
    const mockRes2 = { writableEnded: false, on: vi.fn() }
    
    sseClients.add('session-1', mockRes1)
    sseClients.add('session-1', mockRes2)
    sseClients.add('session-2', mockRes1)
    
    const clients1 = sseClients.getClients('session-1')
    const clients2 = sseClients.getClients('session-2')
    
    expect(clients1.size).toBe(2)
    expect(clients2.size).toBe(1)
    
    sseClients.remove('session-1', mockRes1)
    
    const clients1After = sseClients.getClients('session-1')
    expect(clients1After.size).toBe(1)
    
    sseClients.closeSession('session-1')
    sseClients.closeSession('session-2')
  })

  it('sseClients.broadcast sends to all clients in session', () => {
    const mockRes1 = { writableEnded: false, write: vi.fn(), on: vi.fn() }
    const mockRes2 = { writableEnded: false, write: vi.fn(), on: vi.fn() }
    const mockRes3 = { writableEnded: false, write: vi.fn(), on: vi.fn() }
    
    sseClients.add('session-1', mockRes1)
    sseClients.add('session-1', mockRes2)
    sseClients.add('session-2', mockRes3)
    
    const count = sseClients.broadcast('session-1', 'test', { data: 'value' })
    
    expect(count).toBe(2)
    expect(mockRes1.write).toHaveBeenCalled()
    expect(mockRes2.write).toHaveBeenCalled()
    expect(mockRes3.write).not.toHaveBeenCalled()
    
    sseClients.closeSession('session-1')
    sseClients.closeSession('session-2')
  })
})
