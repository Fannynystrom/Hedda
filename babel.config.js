module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@': './',
          },
        },
      ],
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-class-properties', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }],
    ],
  };
};




// module.exports = function(api) {
//   api.cache(true);
//   return {
//     presets: ['babel-preset-expo', 'module:metro-react-native-babel-preset'],
//     plugins: [
//       [
//         'module-resolver',
//         {
//           alias: {
//             '@': './',
//           },
//         },
//       ],
//       'module:react-native-dotenv', // Denna plugin behöver inte vara en array
//       '@babel/plugin-transform-private-methods', // Denna plugin behöver inte vara en array
//     ],
//   };
// };



// module.exports = function(api) {
//   api.cache(true);
//   return {
//     presets: ['babel-preset-expo'],
//     plugins: [
//       [
//         'module-resolver',
//         '@babel/plugin-transform-private-methods', 

//         {
//           alias: {
//             '@': './',
//           },
//         },
//       ],
     
//     ],
//   };
// };


// module.exports = { 
//   presets: ['module:metro-react-native-babel-preset', 'babel-preset-expo'],
//   plugins: [
//     ['module:react-native-dotenv', {
//       moduleName: '@env',
//       path: '.env',
//       blacklist: null,
//       whitelist: null,
//       safe: false,
//       allowUndefined: true,
//     }]
//   ],
// };

