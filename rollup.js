const babel = require('rollup-plugin-babel');
const rollup = require('rollup');

// see below for details on the options
const inputOptions = {
  input: "./example/main.render.js",
  plugins: [
    babel({
      exclude: "node_modules/**"
    }),
  ]
};
const outputOptions = {
  format: "cjs",
  file: "./example/main.render.dist.js"
};

async function build(option = {}) {
  const {input = "", output = ""} = option;
  if(input){
    inputOptions.input = input;
  }
  if(output){
    outputOptions.file = output;
  }
  // create a bundle
  const bundle = await rollup.rollup(inputOptions);

  console.log(bundle.imports); // an array of external dependencies
  console.log(bundle.exports); // an array of names exported by the entry point
  console.log(bundle.modules); // an array of module objects

  // generate code and a sourcemap
  const { code, map } = await bundle.generate(outputOptions);

  // or write the bundle to disk
  await bundle.write(outputOptions);
}

module.exports = build