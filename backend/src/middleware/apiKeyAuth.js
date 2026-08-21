const { ApiClient } = require('../models');
const crypto = require('crypto');

/**
 * API Key Authentication Middleware
 *
 * Verifikasi request dari aplikasi eksternal menggunakan header:
 *   X-API-Key: <api_key>
 *   X-API-Signature: <hmac_signature> (opsional, lebih aman)
 *
 * Signature dihitung sebagai: HMAC-SHA256(JSON.stringify(body), api_secret)
 * Untuk GET request, signature dihitung dari timestamp saja.
 */

const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({
        status: 'error',
        message: 'API key tidak ditemukan. Sertakan header X-API-Key.',
      });
    }

    // Cari client berdasarkan API key
    const client = await ApiClient.findOne({ where: { api_key: apiKey } });
    if (!client) {
      return res.status(401).json({
        status: 'error',
        message: 'API key tidak valid.',
      });
    }

    // Cek status
    if (client.status === 'inactive') {
      return res.status(403).json({
        status: 'error',
        message: 'Aplikasi ini dinonaktifkan. Hubungi admin SDMS.',
      });
    }

    // Verify signature jika ada
    const signature = req.headers['x-api-signature'];
    if (signature) {
      const timestamp = req.headers['x-timestamp'];
      const body = req.method === 'GET' ? timestamp : JSON.stringify(req.body);
      const expectedSig = crypto
        .createHmac('sha256', client.api_secret)
        .update(body)
        .digest('hex');

      if (signature !== expectedSig) {
        return res.status(401).json({
          status: 'error',
          message: 'Signature tidak valid.',
        });
      }
    }

    // Attach client info ke request
    req.apiClient = {
      id: client.id,
      name: client.name,
      slug: client.slug,
      events: client.events,
    };

    next();
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Gagal memverifikasi API key.',
    });
  }
};

module.exports = { authenticateApiKey };
