const sinon = require('sinon');
const { isBoom } = require('boom');
const should = require('should');
const { games, groups, players } = require('../../../api/models');
const imagesService = require('../../../api/services/images');

describe('services: images', function () {
  beforeEach(async function () {
    this.sandbox = sinon.createSandbox();
  });
  afterEach(function () {
    this.sandbox.restore();
  });
  describe('addImage()', function () {
    describe('when missing userContext/userId', function () {
      it('no userContext - should throw bad_request error', async function () {
        try {
          await imagesService.addImage();
          should('not get here').be.eql('got here..');
        } catch (error) {
          should(isBoom(error)).be.eql(true);
          should(error.output.payload).be.eql({
            statusCode: 400,
            error: 'Bad Request',
            message: 'missing user id',
          });
        }
      });
      it('no user id - should throw bad_request error', async function () {
        try {
          await imagesService.addImage({});
          should('not get here').be.eql('got here..');
        } catch (error) {
          should(isBoom(error)).be.eql(true);
          should(error.output.payload).be.eql({
            statusCode: 400,
            error: 'Bad Request',
            message: 'missing user id',
          });
        }
      });
    });
    describe('when missing image data', function () {
      it('should throw bad_request error', async function () {
        try {
          await imagesService.addImage({ id: '123' });
          should('not get here').be.eql('got here..');
        } catch (error) {
          should(isBoom(error)).be.eql(true);
          should(error.output.payload).be.eql({
            statusCode: 400,
            error: 'Bad Request',
            message: 'missing image data',
          });
        }
      });
    });
    describe('when missing tagging ids', function () {
      it('when no id attributes at all: should throw bad_request error', async function () {
        try {
          await imagesService.addImage({ id: '123' }, 'base64imageData');
          should('not get here').be.eql('got here..');
        } catch (error) {
          should(isBoom(error)).be.eql(true);
          should(error.output.payload).be.eql({
            statusCode: 400,
            error: 'Bad Request',
            message: 'must supply at least one (non empty array) of:  "playerIds" / "gameIds" / "groupIds"',
          });
        }
      });
      it('when id attributes are empty: should throw bad_request error', async function () {
        try {
          await imagesService.addImage({ id: '123' }, 'base64imageData', [], [], []);
          should('not get here').be.eql('got here..');
        } catch (error) {
          should(isBoom(error)).be.eql(true);
          should(error.output.payload).be.eql({
            statusCode: 400,
            error: 'Bad Request',
            message: 'must supply at least one (non empty array) of:  "playerIds" / "gameIds" / "groupIds"',
          });
        }
      });
      it('when id attributes are empty or undefined: should throw bad_request error', async function () {
        try {
          await imagesService.addImage({ id: '123' }, 'base64imageData', [], undefined, []);
          should('not get here').be.eql('got here..');
        } catch (error) {
          should(isBoom(error)).be.eql(true);
          should(error.output.payload).be.eql({
            statusCode: 400,
            error: 'Bad Request',
            message: 'must supply at least one (non empty array) of:  "playerIds" / "gameIds" / "groupIds"',
          });
        }
      });
      describe('when ids does not exist in db', function () {
        beforeEach(async function () {
          this.sandbox.stub(games, 'findOne').resolves(null);
          this.sandbox.stub(players, 'findOne').resolves(null);
          this.sandbox.stub(groups, 'findOne').resolves(null);
        });
        it('should throw bad_request error', async function () {
          try {
            await imagesService.addImage({ id: '123' }, 'base64imageData', ['1'], ['2', '3'], []);
            should('not get here').be.eql('got here..');
          } catch (error) {
            should(isBoom(error)).be.eql(true);
            should(error.output.payload).be.eql({
              statusCode: 400,
              error: 'Bad Request',
              message: 'game not found',
            });
          }
        });
      });
    });
  });
});
