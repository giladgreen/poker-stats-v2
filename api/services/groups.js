const { notFound } = require('boom');
const { groups } = require('../models');
const attributes = ['id', 'name', 'createdAt'];

async function getGroup(groupId) {
    const group = await groups.findOne({
        where: {
            id: groupId
        },
        attributes
    });
    if (!group) {
        throw notFound("group not found", { groupId });
    }
    return group.toJSON();
}

async function getGroups() {
    const allGroups = await groups.findAll({ attributes });
    return allGroups.map(group => group.toJSON());
}

async function createGroup(data) {
    const newGroup = await groups.create(data);
    return getGroup(newGroup.id);
}

module.exports = {
    getGroup,
    getGroups,
    createGroup
};
