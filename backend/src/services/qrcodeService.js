const qrcode = require('qrcode');
const logger = require('../config/logger');

/**
 * Service for generating QR codes
 */
const qrcodeService = {
  /**
   * Generate QR code as data URL
   * @param {string} data - Data to encode in QR code
   * @param {Object} options - QR code generation options
   * @returns {Promise<string>} Data URL containing QR code
   */
  generateQRCode: async (data, options = {}) => {
    try {
      const defaultOptions = {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      };

      const qrOptions = { ...defaultOptions, ...options };
      const dataUrl = await qrcode.toDataURL(data, qrOptions);

      return dataUrl;
    } catch (error) {
      logger.error(`Error generating QR code: ${error.message}`);
      throw error;
    }
  },

  /**
   * Generate QR code as buffer
   * @param {string} data - Data to encode in QR code
   * @param {Object} options - QR code generation options
   * @returns {Promise<Buffer>} Buffer containing QR code image
   */
  generateQRCodeBuffer: async (data, options = {}) => {
    try {
      const defaultOptions = {
        errorCorrectionLevel: 'H',
        type: 'png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      };

      const qrOptions = { ...defaultOptions, ...options };
      const buffer = await qrcode.toBuffer(data, qrOptions);

      return buffer;
    } catch (error) {
      logger.error(`Error generating QR code buffer: ${error.message}`);
      throw error;
    }
  },

  /**
   * Generate QR code and save to file
   * @param {string} data - Data to encode in QR code
   * @param {string} filePath - Path to save QR code image
   * @param {Object} options - QR code generation options
   * @returns {Promise<void>}
   */
  generateQRCodeToFile: async (data, filePath, options = {}) => {
    try {
      const defaultOptions = {
        errorCorrectionLevel: 'H',
        type: 'png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      };

      const qrOptions = { ...defaultOptions, ...options };
      await qrcode.toFile(filePath, data, qrOptions);

      logger.info(`QR code saved to file: ${filePath}`);
    } catch (error) {
      logger.error(`Error saving QR code to file: ${error.message}`);
      throw error;
    }
  }
};

module.exports = qrcodeService;