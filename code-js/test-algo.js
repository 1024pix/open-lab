/* Pour tester des users aleatoire sur l'algo
* - node test-algo.js MODE=USER COMPETENCE=competenceId (cf le competence ID dans les fichiers challenges créés)
*/
const fs = require('fs');
const _ = require('lodash');
const moment = require('moment');
const skills = require('./skills.json');
const challengesFromReferential = require('./challenges.json');
let users = {};

const folder = './';
const smartRandom = require(folder+'pixAlgorithm/services/smart-random');
const AnswerModel = require(folder+'models/Answer');
const ChallengeModel = require(folder+'models/Challenge');
const SkillModel = require(folder+'models/Skill');
const KeModel = require(folder+'models/KnowledgeElement');

const possibleResults = ['ok', 'ko'];

function _selectMode(argv) {
  let mode='random', competenceId='', outputFile=null;
  _.each(argv, (argument) => {
    if(argument.split('=')[0] === 'MODE'){
      mode = argument.split('=')[1];
    }
    if(argument.split('=')[0] === 'COMPETENCE'){
      competenceId = argument.split('=')[1];
    }
    if(argument.split('=')[0] === 'OUTPUT'){
      outputFile = argument.split('=')[1];
    }
  });
  return { mode, competenceId, outputFile };
}

function _selectUserResponse(mode, nextChallenge, numberOfChallengeAsked, usersInformations) {
  let response;
  switch (mode) {
    case 'FULLOK':
      response = possibleResults[0];
      break;
    case 'KOFULLOK':
      response = numberOfChallengeAsked===1 ? possibleResults[1] : possibleResults[0];
      break;
    case 'FULLKO':
      response = possibleResults[1];
      break;
    case 'OKFULLKO':
      response = numberOfChallengeAsked===1 ? possibleResults[0] : possibleResults[1];
      break;
    case 'RANDOM':
      response = possibleResults[Math.round(Math.random())];
      break;
    case 'USER':
      const userKEForSkill = usersInformations.filter(userKE => userKE.skillId === nextChallenge.skills[0].id);
      if(userKEForSkill.length > 0) {
        response = userKEForSkill[0].status === 'validated' ? possibleResults[0] : possibleResults[1];
      } else {
        console.log('Use random instead of user information');
        response = possibleResults[Math.round(Math.random())];
      }
      break;
  }
  return response;
}

function _getReferential(competenceId) {
  let targetSkills = _.filter(skills, (skill) => skill.competenceId === competenceId);
  let challenges = _.filter(challengesFromReferential, (challenge) => challenge.competenceId === competenceId);
  targetSkills = _.map(targetSkills, (skill) => new SkillModel(skill));
  challenges = _.map(challenges, (challenge) => {
    challenge.skills = _.map(challenge.skills, (skill) => new SkillModel(skill));
    return new ChallengeModel(challenge)
  });
  return { targetSkills, challenges };

}
async function _launchSimulation(mode, competenceId) {

  let numberOfChallengeAsked = 0;
  let result = [];
  let userKnowledgeElements = [];
  let responseOfAlgo;
  let lastAnswer = null;
  let usersInformations;
  if(mode === 'USER') {
    users = require('../data-files/usersData.json');
    const userFind = users[Math.floor(Math.random() * users.length)];
    usersInformations = userFind.knowledgeElements;
  }

  const { targetSkills, challenges } = _getReferential(competenceId);

  do {

    responseOfAlgo = smartRandom.getNextChallenge({ answers: [lastAnswer], targetSkills, challenges, knowledgeElements: userKnowledgeElements });

    if (!responseOfAlgo.nextChallenge) {
      console.log('FINISHED WITH', numberOfChallengeAsked);
      break;
    } else {
      numberOfChallengeAsked++;
    }

    const response = _selectUserResponse(mode, responseOfAlgo.nextChallenge, numberOfChallengeAsked, usersInformations);
    lastAnswer = new AnswerModel({ result: response, challengeId: responseOfAlgo.nextChallenge.id });

    result.push({
      numberOfChallenge: numberOfChallengeAsked,
      tube: responseOfAlgo.nextChallenge.skills[0].tubeName,
      levelOfChallenge: responseOfAlgo.nextChallenge.skills[0].difficulty,
      estimatedLevel: responseOfAlgo.levelEstimated,
      responseOfUser: response === possibleResults[0] ? 1 : 0
    });

    const temp = KeModel.createKnowledgeElementsForAnswer({
      answer: lastAnswer,
      challenge: responseOfAlgo.nextChallenge,
      previouslyFailedSkills: [],
      previouslyValidatedSkills: [],
      targetSkills,
      userId: 1
    });

    userKnowledgeElements = _.union(userKnowledgeElements, temp);

  } while (!responseOfAlgo.hasAssessmentEnded);

  return result;

}

function _createJsonResult({ result, competenceId, mode, outputFile }) {
  const fileName = outputFile || `test_${competenceId}_${mode}_${moment().format('YYYYMMDDhhmm')}.json`;
  const data = JSON.stringify(result);
  return fs.writeFileSync(fileName, data);
}

async function main() {
  const { mode, competenceId, outputFile } = _selectMode(process.argv);

  console.log('Test sur la compétence ', competenceId);
  console.log('En mode ', mode);
  const result = await _launchSimulation(mode, competenceId);
  return _createJsonResult({ result, mode, competenceId, outputFile });
}


main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    }
);
