module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    client.user.setStatus('online');
    console.log(`Ready! Logged in as ${client.user.tag}`)
  },
};