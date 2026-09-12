/**
 * DA Roast Bot - Roast Controller
 * Delivers on-demand randomized roasts, code critiques, and roast battle arbitration.
 */

const roastService = require('../services/roastService');
const db = require('../config/db');

/**
 * GET /api/roast/random
 * Query params: ?mode=friendly|normal|savage|professor|procrastinator
 */
function getRandomRoast(req, res) {
  try {
    const { mode } = req.query;
    const selectedMode = mode ? String(mode).toLowerCase() : 'normal';
    const roast = roastService.getRandomRoast(selectedMode);

    db.recordRoastSummoned(selectedMode);

    return res.status(200).json({
      success: true,
      roast,
      mode: selectedMode,
      timestamp: new Date().toISOString(),
      requestId: req.id || null,
    });
  } catch (error) {
    console.error('[RoastController] Error generating random roast:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to summon a roast. The roasting furnace is temporarily cooling down.',
      code: 'ROAST_ERROR',
      requestId: req.id || null,
    });
  }
}

/**
 * GET /api/roast/stats
 * Diagnostic info for roast collection
 */
function getRoastStats(req, res) {
  try {
    const stats = roastService.getRoastPoolStats();
    return res.status(200).json({
      success: true,
      stats,
      requestId: req.id || null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      code: 'STATS_ERROR',
      requestId: req.id || null,
    });
  }
}

/**
 * POST /api/roast/code
 * Analyzes code, roasts bad practices, and provides diagnosis & refactor
 */
function handleRoastCode(req, res) {
  try {
    const { code, language = 'javascript' } = req.body;

    if (!code || typeof code !== 'string' || code.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Paste some actual code. Even a missing semicolon is better than an empty string.',
        code: 'EMPTY_CODE',
      });
    }

    if (code.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Code snippet too large. Keep it under 5000 characters for optimal roasting.',
        code: 'CODE_TOO_LARGE',
      });
    }

    db.recordCodeReview();
    const result = roastService.roastCodeSnippet(code, language);

    return res.status(200).json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
      requestId: req.id || null,
    });
  } catch (err) {
    console.error('[RoastController] Code roast error:', err);
    return res.status(500).json({
      success: false,
      error: 'Code roaster encountered a compilation error. Your code is truly that radioactive.',
      code: 'CODE_ROAST_ERROR',
      requestId: req.id || null,
    });
  }
}

/**
 * POST /api/roast/battle
 * Evaluates a user's roast attempt against the AI and provides scores & counter-roast
 */
function handleRoastBattle(req, res) {
  try {
    const { roast } = req.body;

    if (!roast || typeof roast !== 'string' || roast.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'You came to a roast battle with no insult? Step up your game and type something spicy.',
        code: 'EMPTY_BATTLE_ROAST',
      });
    }

    db.recordRoastBattle();
    const evaluation = roastService.evaluateRoastBattle(roast);

    return res.status(200).json({
      success: true,
      ...evaluation,
      timestamp: new Date().toISOString(),
      requestId: req.id || null,
    });
  } catch (err) {
    console.error('[RoastController] Battle error:', err);
    return res.status(500).json({
      success: false,
      error: 'The roast arena had a malfunction. Stand down, combatant.',
      code: 'BATTLE_ERROR',
      requestId: req.id || null,
    });
  }
}

module.exports = {
  getRandomRoast,
  getRoastStats,
  handleRoastCode,
  handleRoastBattle,
};
