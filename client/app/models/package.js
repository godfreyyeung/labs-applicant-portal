import Model, { attr, belongsTo } from '@ember-data/model';

export default class PackageModel extends Model {
  @belongsTo('project')
  project;

  @belongsTo('pas-form', { async: false })
  pasForm;

  @attr('string')
  statuscode;

  @attr('string')
  dcpPackagetype;

  @attr('number')
  dcpVisibility;

  @attr()
  documents;
}
