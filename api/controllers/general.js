const { badRequest } = require('boom');

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
  return true;
}

async function del(targetType, targetId, data) {
  console.log('create', targetType, targetId, data);
  return true;
}
async function asyncGeneralOperation(req, res) {
  const {
    requestType, targetType, targetId, data,
  } = req.getAllParams();
  switch (requestType) {
    case 'CREATE':
      await create(targetType, targetId, data);
      break;
    case 'UPDATE':
      await update(targetType, targetId, data);
      break;
    case 'READ':
      await read(targetType, targetId, data);
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
    data,
  });
}

function generalOperation(req, res) {
  asyncGeneralOperation(req, res);
}


module.exports = {
  generalOperation,
};
