import { notFound, badRequest } from 'boom';
import Models from '../models';
import {UserContext} from "../../types/declerations";

const attributes = ['id', 'name', 'createdAt', 'description', 'imageUrl'];

async function getGroup(userContext:UserContext, groupId:string) {
  // @ts-ignore
  const group = await Models.groups.findOne({
    where: {
      id: groupId,
    },
    attributes,
  });
  if (!group) {
    throw notFound('group not found', { groupId });
  }
  const result = group.toJSON();
  result.isAdmin = userContext.isAdmin;
  return result;
}

async function getGroups(userContext:UserContext, limit = 1000, offset = 0) {
  // @ts-ignore
  const invitations = await Models.invitationsRequests.findAll({
    where: {
      userId: userContext.id,
    },
  });
  // @ts-ignore
  const allCount = await Models.groups.count();
  // @ts-ignore
  const allGroups = await Models.groups.findAll({
    limit,
    offset,
    order: [['createdAt', 'ASC']],
    attributes,
  });

  const results = allGroups.map((g:any) => {
    const group = g.toJSON();
    const userGroupData = userContext.groups[group.id];
    const result = { ...group, userInGroup: !!userGroupData };
    if (result.userInGroup) {
      result.isAdmin = userGroupData.isAdmin;
    } else {
      result.invitationRequested = false;
      const invitation = invitations.find((i:any) => i.groupId === group.id);
      if (invitation) {
        result.invitationRequested = true;
        result.invitationStatus = invitation.status;
      }
    }
    return result;
  });

  await Promise.all(results.map(async (group:any) => {
    // @ts-ignore
    group.gamesCount = await Models.games.count({ where: { groupId: group.id } });
    // @ts-ignore
    group.playersCount = await Models.players.count({ where: { groupId: group.id } });
  }));

  return {
    metadata: {
      totalResults: allCount,
      count: allGroups.length,
      limit,
      offset,
    },
    results,
  };
}

async function createGroup(userContext:UserContext, data:any) {
  // @ts-ignore
  const existingGroup = await Models.groups.findOne({
    where: {
      name: data.name,
    },
  });
  if (existingGroup) {
    throw badRequest(`Name ${data.name} already in use.`, { name: data.name });
  }
// @ts-ignore
  const newGroup = await Models.groups.create(data);
  const playerData = {
    name: `${userContext.firstName} ${userContext.familyName}`,
    email: userContext.email,
    groupId: newGroup.id,
  };
  // @ts-ignore
  const newPlayer = await Models.players.create(playerData);
  const userPlayerData = {
    userId: userContext.id,
    playerId: newPlayer.id,
    groupId: playerData.groupId,
    isAdmin: true,
  };
  // @ts-ignore
  await Models.usersPlayers.create(userPlayerData);
  userContext.isAdmin = true;
  userContext.groups[playerData.groupId] = { isAdmin: true };
  return getGroup(userContext, newGroup.id);
}

async function updateGroup(userContext:UserContext, groupId:string, data:any) {
  // @ts-ignore
  await Models.groups.update(data, {
    where: {
      id: groupId,
    },
  });
  return getGroup(userContext, groupId);
}

async function deleteGroup(groupId:string) {
  // @ts-ignore
  await Models.players.destroy({
    where: {
      groupId,
    },
  });

  // @ts-ignore
  await Models.gamesData.destroy({
    where: {
      groupId,
    },
  });
  // @ts-ignore
  await Models.games.destroy({
    where: {
      groupId,
    },
  });
  // @ts-ignore
  await Models.usersPlayers.destroy({
    where: {
      groupId,
    },
  });
  // @ts-ignore
  return Models.groups.destroy({
    where: {
      id: groupId,
    },
  });
}

export default  {
  createGroup,
  getGroup,
  getGroups,
  updateGroup,
  deleteGroup,
};
