const router = require("express").Router()

const {
  getSynonyms,
  createDrawing,
  functionCalling
} = require('../controllers/openAI.controller')

router.post("/synonyms", getSynonyms)
router.post("/drawing", createDrawing)
router.get("/chatbot", functionCalling)


module.exports = router;
