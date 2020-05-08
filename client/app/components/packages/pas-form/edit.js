import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class PasFormComponent extends Component {
  @service router;

  @tracked modalIsOpen = false;

  @tracked package;

  get isDirty() {
    const isPasFormDirty = this.args.package.pasForm.hasDirtyAttributes;

    const { isBblsDirty, isApplicantsDirty } = this.args.package.pasForm;

    return isPasFormDirty || isBblsDirty || isApplicantsDirty;
  }

  // TODO: consider decoupling the PAS Form from the Package
  // for better modularity and avoiding "inappropriate intimacy"
  @action
  save(projectPackage) {
    projectPackage.saveDescendants();
  }

  @action
  async submit(projectPackage) {
    projectPackage.statuscode = 'Submitted';
    await projectPackage.save();

    this.router.transitionTo('packages.show', projectPackage.id);
  }

  @action
  updateAttr(obj, attr, newVal) {
    obj[attr] = newVal;
  }

  @action
  toggleModal() {
    this.modalIsOpen = !this.modalIsOpen;
  }
}
