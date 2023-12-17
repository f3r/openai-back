const router = require("express").Router()

const {
  getSynonyms,
  getStory,
  createDrawing,
  functionCalling
} = require('../controllers/openAI.controller')

router.post("/synonyms", getSynonyms)
router.post("/story", getStory)
router.post("/drawing", createDrawing)
router.post("/chatbot", functionCalling)


module.exports = router;
