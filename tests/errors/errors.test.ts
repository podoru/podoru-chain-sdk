import { describe, it, expect } from 'vitest';
import {
  PodoruError,
  ApiError,
  TransactionError,
  SigningError,
  ValidationError,
  WebSocketError,
} from '../../src/errors/index.js';

describe('Error classes', () => {
  describe('PodoruError', () => {
    it('should create error with message', () => {
      const error = new PodoruError('test message');
      expect(error.message).toBe('test message');
      expect(error.name).toBe('PodoruError');
    });

    it('should be instance of Error', () => {
      const error = new PodoruError('test');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(PodoruError);
    });
  });

  describe('ApiError', () => {
    it('should create error with status code', () => {
      const error = new ApiError('API failed', 404);
      expect(error.message).toBe('API failed');
      expect(error.name).toBe('ApiError');
      expect(error.statusCode).toBe(404);
    });

    it('should store response', () => {
      const response = { error: 'not found' };
      const error = new ApiError('API failed', 404, response);
      expect(error.response).toEqual(response);
    });

    it('should be instance of PodoruError', () => {
      const error = new ApiError('test', 500);
      expect(error).toBeInstanceOf(PodoruError);
      expect(error).toBeInstanceOf(ApiError);
    });
  });

  describe('TransactionError', () => {
    it('should create error with message', () => {
      const error = new TransactionError('tx failed');
      expect(error.message).toBe('tx failed');
      expect(error.name).toBe('TransactionError');
    });

    it('should store transaction hash', () => {
      const error = new TransactionError('tx failed', '0xabc123');
      expect(error.transactionHash).toBe('0xabc123');
    });

    it('should be instance of PodoruError', () => {
      const error = new TransactionError('test');
      expect(error).toBeInstanceOf(PodoruError);
      expect(error).toBeInstanceOf(TransactionError);
    });
  });

  describe('SigningError', () => {
    it('should create error with message', () => {
      const error = new SigningError('signing failed');
      expect(error.message).toBe('signing failed');
      expect(error.name).toBe('SigningError');
    });

    it('should be instance of PodoruError', () => {
      const error = new SigningError('test');
      expect(error).toBeInstanceOf(PodoruError);
      expect(error).toBeInstanceOf(SigningError);
    });
  });

  describe('ValidationError', () => {
    it('should create error with message', () => {
      const error = new ValidationError('invalid input');
      expect(error.message).toBe('invalid input');
      expect(error.name).toBe('ValidationError');
    });

    it('should be instance of PodoruError', () => {
      const error = new ValidationError('test');
      expect(error).toBeInstanceOf(PodoruError);
      expect(error).toBeInstanceOf(ValidationError);
    });
  });

  describe('WebSocketError', () => {
    it('should create error with message', () => {
      const error = new WebSocketError('connection failed');
      expect(error.message).toBe('connection failed');
      expect(error.name).toBe('WebSocketError');
    });

    it('should store error code', () => {
      const error = new WebSocketError('connection closed', 1006);
      expect(error.code).toBe(1006);
    });

    it('should be instance of PodoruError', () => {
      const error = new WebSocketError('test');
      expect(error).toBeInstanceOf(PodoruError);
      expect(error).toBeInstanceOf(WebSocketError);
    });
  });

  describe('error inheritance chain', () => {
    it('all errors should be catchable as PodoruError', () => {
      const errors = [
        new ApiError('api', 500),
        new TransactionError('tx'),
        new SigningError('sign'),
        new ValidationError('valid'),
        new WebSocketError('ws'),
      ];

      for (const error of errors) {
        expect(error).toBeInstanceOf(PodoruError);
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});
