const OpenAI = require('openai')

const openai = new OpenAI()

async function getSynonyms(req, res) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Create a json with the english synonyms for the word ${req.body.text}?

          The json must have a field called 'synonyms', whose value is an array with each synonym.`
        },
      ],
      model: "gpt-3.5-turbo-1106",
      response_format: { type: "json_object" },
    });
    console.log(completion)

    return res.json(completion.choices[0]);
  } catch (error) {
    return res.send(error)
  }
}

async function getStory(req, res) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
          I want to create a story for children. I will give you an idea and you will give me a short story of 5 sentences.

          The idea for the story is: ${req.body.idea}

          The json must have a field called 'story', whose value is an array with each line of a story.`
        },
      ],
      model: "gpt-3.5-turbo-1106",
      response_format: { type: "json_object" },
    });
    console.log(completion)

    return res.json(completion.choices[0]);
  } catch (error) {
    return res.send(error)
  }
}

async function createDrawing (req, res) {
  try {
    //DALL-E-2 TE PERMITE CREAR VARIAS IMÁGENES EN UNA MISMA PETICIÓN
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

const { orders, checkStatus, findUserOrders } = require('./orders')

async function functionCalling (req, res) {
  try {
    const messages = [
      {
        role: 'user',
        content: req.body.query
      }
    ]
    console.log('messages', messages)

    const functionsDefinition = [
      {
        type: "function",
        function: {
          name: "check_status",
          description: "Check the status of a specific order",
          parameters: {
            type: "object",
            properties: {
              orderId: {
                type: "string",
                description: "Order identification to search for",
              },
            },
            required: ["orderId"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "check_user_orders",
          description: "Check if the user has any orders",
          parameters: {
            type: "object",
            properties: {
              user: {
                type: "string",
                description: "User identification to search for",
              },
            },
            required: ["user"],
          },
        },
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: messages,
      tools: functionsDefinition,
      tool_choice: "auto" //Default value
    });

    const responseMessage = response.choices[0].message;
    console.log('responseMessage', responseMessage)

    const toolCalls = responseMessage.tool_calls;
    if (responseMessage.tool_calls) {
      // Step 3: call the function
      const availableFunctions = {
        check_status: checkStatus,
        check_user_orders: findUserOrders
      }

      // Añadir respuesta a la conversación
      messages.push(responseMessage)

      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name
        const functionToCall = availableFunctions[functionName]
        const functionArgs = JSON.parse(toolCall.function.arguments)
        const functionResponse = functionToCall(
          functionArgs //Objeto con los argumentos de para la función
        )

        messages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: functionResponse,
        }); // Añadir respuesta de la función a la conversación

        console.log('messages', messages)
      }

      const secondResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: messages,
      }); // Generar nueva respuesta con la cadena de mensajes creada

      console.log('secondResponse', secondResponse.choices)

      return res.json(secondResponse.choices);
    } else {
      return res.json(response.choices);
    }
  } catch (error) {
    return res.send(error)
  }
}

module.exports = {
  getSynonyms,
  getStory,
  createDrawing,
  functionCalling
}
