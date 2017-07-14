

const should = require('should');
const at = require('../../common/at');

describe('common/at.js', () => {
  let content = "@dylan lalalalala!"
  it('#fetchUsers', () => {
    at.fetchUsers(content).should.containDeep(['dylan']);
  }); 
  it('#sendMessageToUser', async () => {
    await at.sendMessageToUser(content);
  })
})