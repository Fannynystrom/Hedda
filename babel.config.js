// module.exports = {
//   presets: ['module:metro-react-native-babel-preset'],
//   plugins: [
//     ['module:react-native-dotenv', {
//       moduleName: '@env',
//       path: '.env',
//       blacklist: null,
//       whitelist: null,
//       safe: false,
//       allowUndefined: true,
//     }]
//   ]
// };




module.exports = { 
  presets: ['module:metro-react-native-babel-preset', 'babel-preset-expo'],
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
      blacklist: null,
      whitelist: null,
      safe: false,
      allowUndefined: true,
    }]
  ],
};

