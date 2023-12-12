const router = require("express").Router()

const {
  getSynonyms,
  createDrawing
} = require('../controllers/openAI.controller')

router.post("/synonyms", getSynonyms)
router.post("/drawing", createDrawing)

module.exports = router;
