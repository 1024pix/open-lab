const _ = require('lodash');
const Skill = require('./Skill');

const ChallengeType = Object.freeze({
  QCU: 'QCU',
  QCM: 'QCM',
  QROC: 'QROC',
  QROCM_IND: 'QROCM-ind',
  QROCM_DEP: 'QROCM-dep',
});

/**
 * Traduction: Épreuve
 */
class Challenge {

  /**
   * Constructeur d'épreuve
   *
   * @param id
   * @param attachments
   * @param embedHeight
   * @param embedTitle
   * @param embedUrl
   * @param illustrationUrl
   * @param instruction
   * @param proposals
   * @param status
   * @param timer
   * @param type
   * @param answer ==> Il semblerait que answer ne serve plus.
   * @param skills
   * @param validator
   * @param competenceId
   */
  constructor(
    {
      id,
      // attributes
      attachments,
      embedHeight,
      embedTitle,
      embedUrl,
      illustrationUrl,
      instruction,
      proposals,
      status,
      timer,
      type,
      // includes
      answer,
      skills = [],
      validator,
      // references
      competenceId,
    } = {}) {
    this.id = id;
    // attributes
    this.answer = answer;
    this.attachments = attachments;
    this.embedHeight = embedHeight;
    this.embedTitle = embedTitle;
    this.embedUrl = embedUrl;
    this.illustrationUrl = illustrationUrl;
    this.instruction = instruction;
    this.proposals = proposals;
    this.timer = timer;
    this.status = status;
    this.type = type;
    // includes
    this.skills = skills;
    this.validator = validator;
    // references
    this.competenceId = competenceId;
  }

  /**
   * @deprecated
   */
  static fromAttributes(attributes) {
    const challenge = new Challenge();
    Object.assign(challenge, attributes);
    if (!challenge.skills) {
      challenge.skills = [];
    }
    return challenge;
  }

  addSkill(skill) {
    this.skills.push(skill);
  }

  isTimed() {
    return Number.isFinite(parseFloat(this.timer));
  }

  hasSkill(searchedSkill) {
    return this.skills.filter((skill) => skill.name === searchedSkill.name).length > 0;
  }

  // Same than isActive for algo
  isPublished() {
    return ['validé', 'validé sans test', 'pré-validé'].includes(this.status);
  }

  get hardestSkill() {
    return this.skills.reduce((s1, s2) => (s1.difficulty > s2.difficulty) ? s1 : s2);
  }

  testsAtLeastOneNewSkill(alreadyAssessedSkills) {
    return _(this.skills).differenceWith(alreadyAssessedSkills, Skill.areEqual).size() > 0;
  }

  hasAtLeastOneSkillTested(requiredSkills) {
    return _.intersection(_.map(this.skills, 'name'), _.map(requiredSkills, 'name')).length !== 0;
  }

  haveAllSkillsAlreadyBeenTested(knowledgeElements, targetProfileSkills) {
    const skillIdsAlreadyTested = _.map(knowledgeElements, 'skillId');
    const targetProfileSkillsIds = _.map(targetProfileSkills, 'id');
    const challengeSkillsIds = _.map(this.skills, 'id');
    const challengeSkillsIdsInTargetProfile = _.intersection(challengeSkillsIds, targetProfileSkillsIds);

    return _.every(challengeSkillsIdsInTargetProfile, _.includes.bind(null, skillIdsAlreadyTested));
  }
}

Challenge.Type = ChallengeType;

module.exports = Challenge;
