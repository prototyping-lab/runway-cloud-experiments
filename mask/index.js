const path = require("path");
const fs = require("fs");
const fileType = require("file-type");
const mimeType = require("mime-types");
const parseDataURL = require("data-urls");
const { HostedModel } = require("@runwayml/hosted-models");
require('dotenv').config({path: path.join(__dirname, '.env')});

// ------------------------------------------------------------------------
const url = 'https://mask.hosted-models.runwayml.cloud/v1/';
const token = process.env.RUNWAY_MASK_TOKEN;

const inputProperty = 'image';
const outputProperty = 'output';
const params = {
      category: 'person'
};
// ------------------------------------------------------------------------

const liveResult = true;
const cacheResult = true;

(async () => {
  // input and output and result files on the desktop
  const folder =  path.join(__dirname, 'data'); // path.join(require("os").homedir(), "Desktop");
  const input = path.join(folder, "input.jpg");
  const result = path.join(folder, "result.json");

  // read input image
  const inputBuffer = fs.readFileSync(input);
  const inputType = (await fileType.fromBuffer(inputBuffer)).mime;
  console.log(`Loading '${input}' of type '${inputType}'.`);

  // create input json
  const inputJson = {
    [inputProperty]: `data:${inputType};base64,${inputBuffer.toString("base64")}`,
    ... params
  };

  // define hosted model
  const model = new HostedModel({ url, token });

  // get output from cloud or cache
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

  // extract data from the output
  const outputImage = outputJson[outputProperty];

  // parse base64 data url
  const outputData = parseDataURL(outputImage);
  const outputType = outputData.mimeType.toString();
  const outputBuffer = outputData.body;

  // save result + be smart about the filename
  const outputExtension = mimeType.extension(outputType);
  const outputFile = `output.${outputExtension}`;
  const output = path.join(folder, outputFile);
  console.log(`Saving file of type '${outputType} to ${output}'.`);

  fs.writeFileSync(output, outputBuffer);

})();
