const path = require("path");
const fs = require("fs");
const { HostedModel } = require("@runwayml/hosted-models");
require('dotenv').config({path: path.join(__dirname, '.env')});

// ------------------------------------------------------------------------
const url = 'https://gpt2.hosted-models.runwayml.cloud/v1/';
const token = process.env.RUNWAY_GPT2_TOKEN;
console.log(token);

const inputProperty = 'prompt';
const outputProperty = 'generated_text';
const params = {
  max_characters: 1024,
  top_p: 0.3,
  seed: 123,
};
// ------------------------------------------------------------------------


const liveResult = true;
const cacheResult = true;

(async () => {
  
  // input and output and result files on the desktop
  const folder =  path.join(__dirname, 'data'); // path.join(require("os").homedir(), "Desktop");
  const input = path.join(folder, "input.txt");
  const result = path.join(folder, "result.txt");

  // read input text
  const inputText = fs.readFileSync(input, "utf-8");
  console.log(`Loading '${input}'.`);

  // define hosted model
  const model = new HostedModel({ url, token });
  
  // construct query
  const inputJson = {
    [inputProperty]: inputText,
    ... params
  };

  let outputJson;
  if (liveResult) {
    // query model and save the result
    outputJson = await model.query(inputJson);
    if (cacheResult) {
      fs.writeFileSync(result, JSON.stringify(outputJson));
    }
  } else {
    // use cached result for debugging
    outputJson = JSON.parse(fs.readFileSync(result));
  }

  // save result to a text file
  const outputText = outputJson[outputProperty];
  const outputFile = "output.txt";
  const output = path.join(folder, outputFile);
  console.log(`Saving file to ${output}'.`);
  fs.writeFileSync(output, outputText);

})();
