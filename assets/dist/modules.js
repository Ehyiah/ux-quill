function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function mergeModules(modulesOptions, enabledModules) {
  let modules = [];
  modules = modulesOptions.reduce((acc, moduleOption) => {
    acc[moduleOption.name] = moduleOption.options;
    return acc;
  }, {});
  return _extends({}, modules, enabledModules);
}
export default mergeModules;