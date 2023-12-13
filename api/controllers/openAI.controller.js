const OpenAI = require('openai')

const openai = new OpenAI({apiKey: process.env.API_KEY})

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

const orders = [
  {
    userId: "1",
    orderId: "abc",
    status: "Delivered",
  },
  {
    userId: "1",
    orderId: "cde",
    status: "Shipped",
  },
  {
    userId: "2",
    orderId: "xyz",
    status: "Delivered",
  },
  {
    userId: "3",
    orderId: "mno",
    status: "In Progress",
  },
  {
    userId: "2",
    orderId: "qwe",
    status: "Delivered",
  },
];

function checkStatus({orderId}) {
  const order = orders.find(order => order.orderId === orderId)
  if (!order) return `No order found for id ${orderId}`

  return `Order status: ${order.status}`;
}

function findUserOrders({userId}) {
  const userOrders = orders.filter(order => order.userId === userId)
  
  if(!userOrders.length) return `You have no orders`

  return userOrders
    .map(order => `Order: ${order.orderId} - Status: ${order.status}`)
    .join('\n')
}

async function functionCalling (req, res) {
  try {
    const messages = [
      {
        role: 'user',
        content: req.body.query
      }
    ]

    const tools = [
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
              userId: {
                type: "string",
                description: "User identification to search for",
              },
            },
            required: ["userId"],
          },
        },
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: messages,
      tools: tools,
      tool_choice: "auto" //Default value
    });
    
    const responseMessage = response.choices[0].message;

    const toolCalls = responseMessage.tool_calls;
    if (responseMessage.tool_calls) {
      // Step 3: call the function
      const availableFunctions = {
        check_status: checkStatus,
        check_user_orders: findUserOrders

      };

      // Añadir respuesta a la conversación
      messages.push(responseMessage)
      
      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name
        const functionToCall = availableFunctions[functionName]
        const functionArgs = JSON.parse(toolCall.function.arguments)
        const functionResponse = functionToCall(
          functionArgs
        )

        messages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: functionResponse,
        }); // extend conversation with function response
      }
  
      const secondResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: messages,
      }); // get a new response from the model where it can see the function response
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
  createDrawing,
  functionCalling
}
