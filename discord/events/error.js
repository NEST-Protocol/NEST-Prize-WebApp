module.exports = {
  name: 'error',
  once: true,
  execute(client) {
    client.user.setStatus('invisible');
    console.log(`Error! Logged out as ${client.user.tag}`)
  },
};
