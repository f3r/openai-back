const OpenAI = require('openai')

const openai = new OpenAI({apiKey: process.env.API_KEY});

async function getSynonyms(req, res) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Please, can you create a json with the english synonyms for the word ${req.body.text}? The json must have a field called 'synonyms', whose value is an array with each synonym. Thanks!`
        },
      ],
      model: "gpt-3.5-turbo-1106",
      response_format: { type: "json_object" },
    });
  
    return res.json(completion.choices[0]);
  } catch (error) {
    return res.send(error)
  }
}

async function createDrawing (req, res) {
  try {
    //DALL-E-2 TE PERMITE CREAR VARIAS IMÁGENES EN UNA MISMA PETICIÓN, PERO SON UNA MIERDA
    // const response = await openai.images.generate({
    //   model: "dall-e-2",
    //   prompt: `I'm going to pass you 3 lines of a child's story in an object. I would like you to please draw a child's picture for each line: 
    //    Line 1: ${req.body.line1}
    //    Line 2: ${req.body.line2}
    //    Line 3: ${req.body.line3}
       
    //   Thanks!`,
    //   size: "1024x1024", //default
    //   n: 3
    // });

    // AUNQUE DALL-E-3 SOLO TE PERMITE UNA IMAGEN POR PETICIÓN, QUEDAN MUCHO MEJOR A PARTIR DE LO QUE UN NIÑO PUEDE ESCRIBIR
    const response = await Promise.all(req.body.lines.map(async line => {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Please, draw a picture for a child's story of the following description: ${line}`,
      })
      return response.data
    }))
    return res.json(response)
  } catch (error) {
    return res.send(error);
  }
}

module.exports = {
  getSynonyms,
  createDrawing
}
