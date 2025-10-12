self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

/**
 * Send message to client
 * @param {Object} client The current client to be sent
 * @param {Object} data The data to be sent to current web application
 * @return {Promise} The promise with thenable
 */
function messageToClient(client, data) {
  return new Promise(function (resolve, reject) {
    const channel = new MessageChannel();

    channel.port1.onmessage = function (event) {
      if (event.data.error) {
        reject(event.data.error);
      } else {
        resolve(event.data);
      }
    };

    client.postMessage(JSON.stringify(data), [channel.port2]);
  });
}

self.addEventListener("push", function (event) {
  console.log("self.addEventListener", event);
  if (event && event.data) {
    self.pushData = event.data.json();
    if (self.pushData) {
      console.log("self.clients", self.clients, self);
      event.waitUntil(
        clients
          .matchAll({
            type: "window",
          })
          .then(function (clientList) {
            console.log(clientList); // []
            if (clientList.length > 0) {
              messageToClient(clientList[0], self.pushData);
            }
          }),
      );
    }
  }
});
