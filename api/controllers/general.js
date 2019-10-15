const { badRequest } = require('boom');
const { players } = require('../models');
async function create(targetType, targetId, data) {
  console.log('create', targetType, targetId, data);
  return true;
}

async function update(targetType, targetId, data) {
  console.log('create', targetType, targetId, data);
  return true;
}

async function read(targetType, targetId, data) {
  console.log('create', targetType, targetId, data);
  const res = await players.findAll();
  return res.map(item => item.toJSON());
}

async function del(targetType, targetId, data) {
  console.log('create', targetType, targetId, data);
  return true;
}
async function asyncGeneralOperation(req, res) {
  const {
    requestType, targetType, targetId, data,
  } = req.getAllParams();
  let result;
  let results;
  switch (requestType) {
    case 'CREATE':
      await create(targetType, targetId, data);
      break;
    case 'UPDATE':
      await update(targetType, targetId, data);
      break;
    case 'READ':
      results = await read(targetType, targetId, data);
      break;
    case 'DELETE':
      await del(targetType, targetId, data);
      break;
    default:
      throw badRequest('ilegal requestType', { requestType });
  }
  res.send({
    requestType,
    targetType,
    targetId,
    result,
    results,
  });
}

function generalOperation(req, res) {
  asyncGeneralOperation(req, res);
}


module.exports = {
  generalOperation,
};
