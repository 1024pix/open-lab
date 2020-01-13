const catAlgorithm = require('./cat-algorithm');
const { getFilteredChallengesForAnyChallenge, getFilteredChallengesForFirstChallenge } = require('./challenges-filter');
const Tube = require('../../models/Tube');
const _ = require('lodash');

const UNEXISTING_ITEM = null;

module.exports = { getNextChallenge };

function getNextChallenge({ knowledgeElements, challenges, targetSkills, answers } = {}) {

  const lastChallenge = _findLastChallengeIfAny(answers, challenges);
  const isUserStartingTheTest = !lastChallenge;
  const courseTubes = _findCourseTubes(targetSkills, challenges);
  const knowledgeElementsOfTargetSkills = knowledgeElements.filter((ke) => {
    return targetSkills.find((skill) => skill.id === ke.skillId);
  });

  // First challenge has specific rules
  const { challenge, levelEstimated } = isUserStartingTheTest
    ? _findFirstChallenge({ challenges, knowledgeElements: knowledgeElementsOfTargetSkills, targetSkills, courseTubes })
    : _findAnyChallenge({ challenges, knowledgeElements: knowledgeElementsOfTargetSkills, targetSkills, courseTubes, lastChallenge });

  // Test is considered finished when no challenges are returned but we don't expose this detail
  return challenge
    ? { hasAssessmentEnded: false, nextChallenge: challenge, levelEstimated }
    : { hasAssessmentEnded: true, nextChallenge: null, levelEstimated };
}

function _findLastChallengeIfAny(answers, challenges) {
  const lastAnswer = _.last(answers);
  if (lastAnswer) {
    return challenges.find((challenge) => challenge.id === lastAnswer.challengeId) || UNEXISTING_ITEM;
  }
}

function _findCourseTubes(skills, challenges) {
  const listSkillsWithChallenges = _filterSkillsByChallenges(skills, challenges);
  const tubes = [];

  listSkillsWithChallenges.forEach((skill) => {
    const tubeNameOfSkill = skill.tubeName;

    if (!tubes.find((tube) => tube.name === tubeNameOfSkill)) {
      tubes.push(new Tube({ skills: [skill] }));
    } else {
      const tube = _findTube(tubes, tubeNameOfSkill);
      tube.addSkill(skill);
    }
  });

  tubes.forEach((tube) =>  {
    tube.skills = _.sortBy(tube.skills, ['difficulty']);
  });
  return tubes;

}

function _findTube(tubes, tubeName) {
  return tubes.find((tube) => tube.name === tubeName);
}


function _filterSkillsByChallenges(skills, challenges) {
  const skillsWithChallenges = skills.filter((skill) => {
    return challenges.find((challenge) => {
      return challenge.skills.find((challengeSkill) => skill.name === challengeSkill.name);
    });
  });
  return skillsWithChallenges;
}

function _findAnyChallenge({ challenges, knowledgeElements, targetSkills, courseTubes, lastChallenge }) {
  const predictedLevel = catAlgorithm.getPredictedLevel(knowledgeElements, targetSkills);
  const availableChallenges = getFilteredChallengesForAnyChallenge({ challenges, knowledgeElements, courseTubes, predictedLevel, lastChallenge, targetSkills });
  const maxRewardingChallenges = catAlgorithm.findMaxRewardingChallenges({ availableChallenges, predictedLevel, courseTubes, knowledgeElements });
  return { challenge: _pickRandomChallenge(maxRewardingChallenges), levelEstimated: predictedLevel };

}

function _findFirstChallenge({ challenges, knowledgeElements, targetSkills, courseTubes }) {
  const filteredChallengesForFirstChallenge = getFilteredChallengesForFirstChallenge({ challenges, knowledgeElements, courseTubes, targetSkills });
  return { challenge: _pickRandomChallenge(filteredChallengesForFirstChallenge), levelEstimated: 2 };
}

function _pickRandomChallenge(challenges) {
  const challengesGroupBySkills = _.groupBy(challenges, _firstSkillTestedByChallenge);
  const challengesForChosenSkill = _.sample(challengesGroupBySkills);
  return _.sample(challengesForChosenSkill);
}

function _firstSkillTestedByChallenge(challenge) {
  return challenge.skills[0].id;
}
