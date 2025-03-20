function mergeModules(modulesOptions, enabledModules) {
  let modules = [];
  modules = modulesOptions.reduce((acc, moduleOption) => {
    acc[moduleOption.name] = moduleOption.options;
    return acc;
  }, {});
  return {
    ...modules,
    ...enabledModules
  };
}
export default mergeModules;
//# sourceMappingURL=modules.js.map