export function crud(modelName: string) {
  return function (constructor: Function) {
    constructor.prototype.modelName = modelName;
  };
}
