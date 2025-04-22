module.exports = {
    presets: [
        ['@babel/preset-env', {
            loose: true,
            modules: false,
            debug: false
        }],
        ['@babel/preset-typescript', {
            allowDeclareFields: true,
            rewriteImportExtensions:true,
            modules: false
        }],
    ],
    assumptions: {
        superIsCallableConstructor: false,
    },
    targets: "> 0.20%, not dead",
    include: "src/*",
    plugins: [
        ["module-resolver", {
            root: ['./src'],
            alias: {
                '@src': './src',
                '@ui': './src/ui',
            }
        }]
    ]
};
