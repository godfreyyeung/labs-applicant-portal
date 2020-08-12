import { helper } from '@ember/component/helper';
// Register Option Sets by importing them and then adding
// an entry to the OPTIONSET_LOOKUP object.
import {
  YES_NO,
  YES_NO_UNSURE,
  YES_NO_DONT_KNOW,
} from '../optionsets/common';
import {
  DCPSTATE,
  DCPTYPE,
} from '../optionsets/applicant';
import {
  BOROUGHS,
} from '../optionsets/bbl';
import {
  AFFECTED_ZONING_RESOLUTION_ACTION,
} from '../optionsets/affected-zoning-resolution';
import {
  STATUSCODE,
  STATECODE,
  DCPPACKAGETYPE,
  DCPVISIBILITY,
} from '../optionsets/package';
import {
  DCPCONSTRUCTIONPHASING,
} from '../optionsets/rwcds-form';
import {
  DCPLEGALSTREETFRONTAGE,
  DCPHOUSINGUNITTYPE,
} from '../optionsets/pas-form';
import {
  DCPPUBLICSTATUS,
  PROJECT_VISIBILITY,
  PROJECT_STATUS,
} from '../optionsets/project';

const OPTIONSET_LOOKUP = {
  applicant: {
    dcpState: DCPSTATE,
    dcpType: DCPTYPE,
  },
  bbl: {
    boroughs: BOROUGHS,
  },
  package: {
    statecode: STATECODE,
    statuscode: STATUSCODE,
    dcpVisibility: DCPVISIBILITY,
    dcpPackagetype: DCPPACKAGETYPE,
  },
  project: {
    dcpPublicstatus: DCPPUBLICSTATUS,
    dcpVisibility: PROJECT_VISIBILITY,
    status: PROJECT_STATUS,
  },
  rwcdsForm: {
    dcpHasprojectchangedsincesubmissionofthepas: YES_NO,
    dcpConstructionphasing: DCPCONSTRUCTIONPHASING,
    dcpExistingconditions: YES_NO,
    dcpIsrwcdsscenario: YES_NO,
    dcpIncludezoningtextamendment: YES_NO_DONT_KNOW,
    dcpIsplannigondevelopingaffordablehousing: YES_NO,
    dcpIsapplicantseekingaction: YES_NO_DONT_KNOW,
  },
  pasForm: {
    dcpProposedprojectorportionconstruction: YES_NO_UNSURE,
    dcpUrbanrenewalarea: YES_NO_UNSURE,
    dcpLegalstreetfrontage: DCPLEGALSTREETFRONTAGE,
    dcpLanduseactiontype2: YES_NO_UNSURE,
    dcpProjectareaindustrialbusinesszone: YES_NO,
    dcpIsprojectarealandmark: YES_NO,
    dcpProjectareacoastalzonelocatedin: YES_NO,
    dcpProjectareaischancefloodplain: YES_NO_UNSURE,
    dcpRestrictivedeclaration: YES_NO,
    dcpRestrictivedeclarationrequired: YES_NO_UNSURE,
    dcpIsinclusionaryhousingdesignatedarea: YES_NO,
    dcpDiscressionaryfundingforffordablehousing: YES_NO_UNSURE,
    dcpHousingunittype: DCPHOUSINGUNITTYPE,
  },
  affectedZoningResolution: {
    actions: AFFECTED_ZONING_RESOLUTION_ACTION,
  },
};

/**
 * Use this helper in templates to retrieve optionsets and their values.
 * See ./helpers.md for full API examples.
 *
 * @param      {string}  model     name of a model with Optionset properties
 * @param      {string}  optionsetId   the optionset identifier. Usually very
 * similar to the property with an optionset. For example, for package statecode,
 * the optionsetId is 'state'.
 * @param      {string}  returnType   'list', 'label' or 'code'. Indicate
 * whether you want the helper to return a list, label or code.
 * @param      {string}  lookupToken   To look up a code, pass a label. To look
 * up a label, pass a code. You can also pass an "identifier" for either a code
 * or label lookup. The identifier is the key to each option in an optionset.
 * @return     {string, number, array or Object}
 */
export function optionset([model, optionsetId, returnType, lookupToken]) {
  const optionset = OPTIONSET_LOOKUP[model][optionsetId];
  const optionById = optionset[lookupToken];
  let option;

  switch (returnType) {
    case 'list':
      return Object.values(optionset);
    case 'code':
      if (optionById) {
        return optionById.code;
      }

      option = Object.values(optionset).findBy('label', lookupToken);

      if (option) {
        return option.code;
      }
      console.assert(false, 'Invalid call to optionset helper: must provide a valid identifier or label to look up a code.'); // eslint-disable-line
      break;
    case 'label':
      if (optionById) {
        return optionById.label;
      }

      option = Object.values(optionset).findBy('code', lookupToken);

      if (option) {
        return option.label;
      }
      console.assert(false, `Invalid call to optionset helper with identifier ${lookupToken}: must provide a valid identifier or code to look up a label.`); // eslint-disable-line
      break;
    default:
      return optionset;
  }
  return undefined;
}

export default helper(optionset);
