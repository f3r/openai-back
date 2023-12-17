const orders = [
  {
    user: "fer",
    orderId: "zapato3213",
    status: "Delivered",
    product: "Shoes with wheels"
  },
  {
    user: "fer",
    orderId: "camiseta8282",
    status: "Shipped",
    product: "Shirt black and white"
  },
  {
    user: "yunior",
    orderId: "mbpro810",
    status: "Delivered",
    product: "McBook Pro 2021"
  },
  {
    user: "yunior",
    orderId: "gpt34dumm",
    status: "In Progress",
    product: "Libro de GPT-3 for dummies"
  },
  {
    user: "fer",
    orderId: "kindle91910",
    status: "Delivered",
    product: "Kindle Paperwhite 2021"
  },
];

function checkStatus({orderId}) {
  const order = orders.find(order => order.orderId === orderId)
  if (!order) return `No order found for id ${orderId}`

  return `Order status: ${order.status}`;
}

function findUserOrders({user}) {
  const userOrders = orders.filter(order => order.user === user)

  if(!userOrders.length) return `You have no orders`

  return userOrders
    .map(order => JSON.stringify({
      order: order.orderId,
      status: order.status,
      product: order.product
    }))
    .join('\n') // Convertir a String para poder añadirlo a la conversación
}

module.exports = {
  orders,
  checkStatus,
  findUserOrders
}
